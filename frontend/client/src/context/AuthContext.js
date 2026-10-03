import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    saveAuthData,
    getAccessToken,
    getUserId,
    clearAuthData,
} from "../api/auth/tokenStorage";

import { getUser } from "../api/user/userApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        restoreSession();
    }, []);

    const restoreSession = async () => {
        try {
            const token = await getAccessToken();
            const userId = await getUserId();

            if (!token || !userId) {
                setUser(null);
                return;
            }

            const currentUser = await getUser(userId);

            setUser(currentUser);
        } catch (error) {
            console.log("RESTORE SESSION ERROR:", error);

            await clearAuthData();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const signIn = (userData) => {
        setUser(userData);
    };

    const signOut = async () => {
        await clearAuthData();
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                signIn,
                signOut,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}