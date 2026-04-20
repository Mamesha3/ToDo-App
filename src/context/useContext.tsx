"use client"
import { createContext, useContext, useState } from 'react'
import { loginUser, registerUser, logoutUser, refreshToken } from '../lib/api'

type User = {
    id: string;
    name: string;
    email: string;
    password: string
}

type AuthContextType = {
    user: User | null;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    console.log(user);
    

    const login = async (data: any) => {
        const response = await loginUser(data);
        setUser(response.user);
    };

    const register = async (data: any) => {
        const response = await registerUser(data);
        setUser(response.user || response.data);
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    const refresh = async () => {
        try {
            const response = await refreshToken();
            setUser(response.user);
        } catch (error) {
            await logout();
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}