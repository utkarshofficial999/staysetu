import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, databases, DATABASE_ID, COLLECTION, ID, Query } from '../lib/appwrite';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const authUser = await account.get();
            setUser(authUser);
            await fetchProfile(authUser);
        } catch (e) {
            // Not logged in
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async (authUser) => {
        if (!authUser) return;
        try {
            console.log('Fetching profile for:', authUser.email);
            const res = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION.profiles,
                [Query.equal('userId', authUser.$id)]
            );

            if (res.documents.length > 0) {
                const data = res.documents[0];
                // Normalize names
                data.name = data.fullName || data.full_name || 'User';
                data.id = data.$id;
                console.log('Profile found:', data.role);
                setProfile(data);
            } else {
                console.log('No profile found, creating default...');
                const metaName = authUser.name || 'User';
                const preferredRole = localStorage.getItem('google_preferred_role') || 'student';
                localStorage.removeItem('google_preferred_role'); // Clean up

                const newProfile = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION.profiles,
                    ID.unique(),
                    {
                        userId: authUser.$id,
                        fullName: metaName,
                        email: authUser.email,
                        role: preferredRole,
                        createdAt: new Date().toISOString(),
                    }
                );
                newProfile.id = newProfile.$id;
                newProfile.name = metaName;
                setProfile(newProfile);
            }
        } catch (err) {
            console.error('Profile error:', err);
            setProfile({
                fullName: authUser.name || 'User',
                role: 'student'
            });
        }
    };

    const signInWithGoogle = async (role = 'student') => {
        // Store selected role so we can create the right profile on return
        localStorage.setItem('google_preferred_role', role);

        account.createOAuth2Session(
            'google',
            window.location.origin,         // success redirect
            window.location.origin + '/login' // failure redirect
        );

    };

    const signOut = async () => {
        try {
            await account.deleteSession('current');
        } catch (err) {
            console.error('Sign out error:', err);
        }
        setUser(null);
        setProfile(null);
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user);
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            signOut,
            signInWithGoogle,
            refreshProfile,
            checkUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
