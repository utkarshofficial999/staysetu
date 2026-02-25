import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
    Send, User as UserIcon, MessageSquare, Search,
    ChevronLeft, Home, CheckCheck, Loader2
} from 'lucide-react';

const Messages = () => {
    const [searchParams] = useSearchParams();
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const messagesEndRef = useRef(null);
    const channelRef = useRef(null);
    const inputRef = useRef(null);

    const targetUserId = searchParams.get('id');
    const listingId = searchParams.get('listing');

    // ─── Scroll to bottom ───────────────────────────────────────────────────
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ─── Load conversations list ─────────────────────────────────────────────
    const loadConversations = useCallback(async () => {
        if (!user) return;
        try {
            // Get all messages I sent or received
            const { data: msgs, error } = await supabase
                .from('messages')
                .select('sender_id, receiver_id, content, created_at')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Build unique conversation partners
            const partnerIds = new Set();
            msgs?.forEach(m => {
                const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
                if (otherId) partnerIds.add(otherId);
            });

            // If coming from property page, add the owner too
            if (targetUserId) partnerIds.add(targetUserId);

            if (partnerIds.size === 0) {
                setLoadingConvs(false);
                return;
            }

            // Fetch all partner profiles
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .in('id', Array.from(partnerIds));

            const convList = (profiles || []).map(p => ({
                id: p.id,
                name: p.full_name || p.email || 'User',
                role: p.role || 'user',
                lastMsg: msgs?.find(m => m.sender_id === p.id || m.receiver_id === p.id)?.content || ''
            }));

            setConversations(convList);

            // Auto-open chat if coming from property page
            if (targetUserId) {
                const partner = convList.find(c => c.id === targetUserId);
                if (partner) setActiveChat(partner);
            }
        } catch (err) {
            console.error('Load conversations error:', err);
        } finally {
            setLoadingConvs(false);
        }
    }, [user, targetUserId]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // ─── Load messages for active chat ──────────────────────────────────────
    const loadMessages = useCallback(async () => {
        if (!activeChat || !user) return;
        setLoadingMsgs(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(
                    `and(sender_id.eq.${user.id},receiver_id.eq.${activeChat.id}),` +
                    `and(sender_id.eq.${activeChat.id},receiver_id.eq.${user.id})`
                )
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);

            // Mark received messages as read
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('receiver_id', user.id)
                .eq('sender_id', activeChat.id)
                .eq('is_read', false);
        } catch (err) {
            console.error('Load messages error:', err);
        } finally {
            setLoadingMsgs(false);
        }
    }, [activeChat, user]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    // ─── Realtime subscription ───────────────────────────────────────────────
    useEffect(() => {
        if (!activeChat || !user) return;

        // Remove old channel if any
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        const channelName = `chat:${[user.id, activeChat.id].sort().join('_')}`;

        channelRef.current = supabase
            .channel(channelName)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            }, (payload) => {
                const msg = payload.new;
                // Only add if it belongs to this conversation
                const belongsHere =
                    (msg.sender_id === user.id && msg.receiver_id === activeChat.id) ||
                    (msg.sender_id === activeChat.id && msg.receiver_id === user.id);

                if (belongsHere) {
                    setMessages(prev => {
                        // Avoid duplicates (optimistic update already added it)
                        if (prev.find(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });

                    // Update conversations last message
                    setConversations(prev =>
                        prev.map(c =>
                            c.id === activeChat.id ? { ...c, lastMsg: msg.content } : c
                        )
                    );
                }
            })
            .subscribe();

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [activeChat, user]);

    // ─── Send message ────────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat || !user || sending) return;

        const content = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Optimistic update
        const tempMsg = {
            id: `temp-${Date.now()}`,
            sender_id: user.id,
            receiver_id: activeChat.id,
            content,
            created_at: new Date().toISOString(),
            is_read: false,
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([{
                    sender_id: user.id,
                    receiver_id: activeChat.id,
                    content,
                    listing_id: listingId || null,
                    is_read: false,
                }])
                .select()
                .single();

            if (error) throw error;

            // Replace temp message with real one
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
            setConversations(prev =>
                prev.map(c => c.id === activeChat.id ? { ...c, lastMsg: content } : c)
            );
        } catch (err) {
            console.error('Send error:', err);
            // Remove temp message on error
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            setNewMessage(content); // Restore
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    // ─── Start new conversation (when coming from property page) ────────────
    useEffect(() => {
        if (!targetUserId || !user || loadingConvs) return;
        // Check if already in list
        const exists = conversations.find(c => c.id === targetUserId);
        if (!exists) {
            // Fetch the owner profile and add to list
            supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('id', targetUserId)
                .single()
                .then(({ data }) => {
                    if (data) {
                        const partner = {
                            id: data.id,
                            name: data.full_name || 'Owner',
                            role: data.role || 'owner',
                            lastMsg: ''
                        };
                        setConversations(prev => [partner, ...prev]);
                        setActiveChat(partner);
                    }
                });
        }
    }, [targetUserId, user, loadingConvs, conversations]);

    const filteredConvs = conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        return isToday
            ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 pt-20 flex flex-col" style={{ height: '100vh' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-hidden py-4" style={{ height: 'calc(100vh - 80px)' }}>
                <div className="bg-white rounded-3xl shadow-lg flex-1 flex overflow-hidden border border-slate-100">

                    {/* ── Sidebar ─────────────────────────────────────────── */}
                    <div className={`w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>

                        {/* Sidebar Header */}
                        <div className="p-5 border-b border-slate-100 bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-black text-slate-900">Messages</h2>
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                    {conversations.length}
                                </span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                />
                            </div>
                        </div>

                        {/* Conversations List */}
                        <div className="flex-1 overflow-y-auto">
                            {loadingConvs ? (
                                <div className="flex items-center justify-center py-16 text-slate-400">
                                    <Loader2 size={24} className="animate-spin mr-2" />
                                    Loading...
                                </div>
                            ) : filteredConvs.length > 0 ? (
                                filteredConvs.map(conv => (
                                    <button
                                        key={conv.id}
                                        onClick={() => setActiveChat(conv)}
                                        className={`w-full flex items-center p-4 transition-all duration-200 border-b border-slate-50 ${activeChat?.id === conv.id
                                                ? 'bg-primary-50 border-l-4 border-l-primary-500'
                                                : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 mr-3 ${conv.role === 'owner'
                                                ? 'bg-amber-100 text-amber-600'
                                                : 'bg-primary-100 text-primary-600'
                                            }`}>
                                            {conv.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-slate-800 truncate text-sm">{conv.name}</h4>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2 shrink-0 ${conv.role === 'owner'
                                                        ? 'bg-amber-100 text-amber-600'
                                                        : 'bg-primary-100 text-primary-600'
                                                    }`}>
                                                    {conv.role === 'owner' ? 'Owner' : 'Student'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
                                                {conv.lastMsg || 'Start a conversation...'}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 px-6 text-center opacity-50">
                                    <MessageSquare size={40} className="text-slate-300 mb-3" />
                                    <p className="font-bold text-slate-500 text-sm">No conversations yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Browse properties and message an owner to get started</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Chat Window ─────────────────────────────────────── */}
                    <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                        {activeChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => setActiveChat(null)}
                                            className="md:hidden mr-3 p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg mr-3 ${activeChat.role === 'owner'
                                                ? 'bg-amber-100 text-amber-600'
                                                : 'bg-primary-100 text-primary-600'
                                            }`}>
                                            {activeChat.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">{activeChat.name}</h3>
                                            <div className="flex items-center mt-0.5">
                                                <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {activeChat.role === 'owner' ? 'Property Owner' : 'Student'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {listingId && (
                                        <button
                                            onClick={() => navigate(`/property/${listingId}`)}
                                            className="flex items-center text-xs font-bold text-primary-500 bg-primary-50 px-3 py-2 rounded-xl hover:bg-primary-100 transition-colors"
                                        >
                                            <Home size={14} className="mr-1.5" />
                                            View Property
                                        </button>
                                    )}
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/60">
                                    {loadingMsgs ? (
                                        <div className="flex items-center justify-center py-16 text-slate-400">
                                            <Loader2 size={24} className="animate-spin mr-2" />
                                            Loading messages...
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-16 h-16 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-400 mb-4">
                                                <MessageSquare size={32} />
                                            </div>
                                            <p className="font-bold text-slate-600">Start the conversation!</p>
                                            <p className="text-sm text-slate-400 mt-1">Send a message to {activeChat.name}</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isMine = msg.sender_id === user.id;
                                            const showTimestamp = idx === messages.length - 1 ||
                                                messages[idx + 1]?.sender_id !== msg.sender_id;

                                            return (
                                                <div
                                                    key={msg.id || idx}
                                                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                                >
                                                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${isMine
                                                            ? 'bg-primary-500 text-white rounded-br-sm'
                                                            : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                    {showTimestamp && (
                                                        <div className={`flex items-center mt-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                                                            <span className="text-[10px] font-semibold text-slate-400 mx-1">
                                                                {formatTime(msg.created_at)}
                                                            </span>
                                                            {isMine && (
                                                                <CheckCheck size={12} className={msg.is_read ? 'text-primary-400' : 'text-slate-300'} />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                                    <form onSubmit={handleSend} className="flex items-center space-x-3">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            placeholder={`Message ${activeChat.name}...`}
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
                                            className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="w-12 h-12 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-md shadow-primary-100 shrink-0"
                                        >
                                            {sending
                                                ? <Loader2 size={18} className="animate-spin" />
                                                : <Send size={18} />
                                            }
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center py-20 px-12 text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-[2rem] flex items-center justify-center text-primary-500 mb-6 shadow-lg shadow-primary-50">
                                    <MessageSquare size={44} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Your Inbox</h3>
                                <p className="text-slate-500 font-medium max-w-xs">
                                    Select a conversation or go to a property listing and click "Message Owner" to start chatting.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;
