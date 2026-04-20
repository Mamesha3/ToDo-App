"use client"
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Validate session on mount using cookies
        refreshToken().then(response => {
            setUser(response.user);
        }).catch(() => {
            setUser(null);
        }).finally(() => {
            setIsLoaded(true);
        });
    }, []);

    const login = async (data: any) => {
        const response = await loginUser(data);
        setUser(response.user);
    };

    const register = async (data: any) => {
        const response = await registerUser(data);
        setUser(response.user || response.data);
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout API call failed, but clearing local state:', error);
        }
        setUser(null);
        router.push('/login');
    };

    const refresh = async () => {
        try {
            const response = await refreshToken();
            setUser(response.user);
        } catch (error) {
            await logout();
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    if (!isLoaded) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, refresh, updateUser }}>
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