"use client"
import { createContext, useContext, useState, useEffect } from 'react'
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

    useEffect(() => {
        // Restore user from localStorage on mount
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
                // Validate token by refreshing
                refreshToken().then(response => {
                    setUser(response.user);
                }).catch(() => {
                    // Token invalid, clear storage
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setUser(null);
                }).finally(() => {
                    setIsLoaded(true);
                });
            } catch (error) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setIsLoaded(true);
            }
        } else {
            setIsLoaded(true);
        }
    }, []);

    const login = async (data: any) => {
        const response = await loginUser(data);
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        if (response.token) {
            localStorage.setItem('token', response.token);
        }
    };

    const register = async (data: any) => {
        const response = await registerUser(data);
        setUser(response.user || response.data);
        localStorage.setItem('user', JSON.stringify(response.user || response.data));
        if (response.token) {
            localStorage.setItem('token', response.token);
        }
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const refresh = async () => {
        try {
            const response = await refreshToken();
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
        } catch (error) {
            await logout();
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
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