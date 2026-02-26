import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user);
            else setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user);
            else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (authUser) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }

            if (data) {
                // Normalize: always expose name regardless of which column is used
                data.name = data.full_name || data.name || '';
                // If profile exists but role is missing, use metadata role
                if (!data.role && authUser.user_metadata?.role) {
                    data.role = authUser.user_metadata.role;
                    // Also update the profile in DB
                    await supabase
                        .from('profiles')
                        .update({ role: authUser.user_metadata.role })
                        .eq('id', authUser.id);
                }
                setProfile(data);
            } else {
                // No profile found — create one from user metadata
                const metaRole = authUser.user_metadata?.role || 'student';
                const metaName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User';

                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .upsert([{
                        id: authUser.id,
                        full_name: metaName,   // ← correct column name
                        email: authUser.email,
                        role: metaRole
                    }], { onConflict: 'id' })
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error creating profile:', insertError);
                    // Fallback: create a local profile object from metadata
                    setProfile({
                        id: authUser.id,
                        name: metaName,
                        full_name: metaName,
                        role: metaRole
                    });
                } else {
                    newProfile.name = newProfile.full_name || metaName;
                    setProfile(newProfile);
                }
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            // Fallback: use metadata
            setProfile({
                id: authUser.id,
                name: authUser.user_metadata?.full_name || 'User',
                role: authUser.user_metadata?.role || 'student'
            });
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    };

    const signOut = () => supabase.auth.signOut();

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, signInWithGoogle, refreshProfile: () => user && fetchProfile(user) }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
