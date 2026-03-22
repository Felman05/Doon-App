import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import api from '../lib/axios';
import { getApiOrigin } from '../lib/apiBase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async () => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.user ?? null);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const publicPaths = ['/', '/signin', '/register'];
        if (publicPaths.includes(location.pathname)) {
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchMe();
    }, [fetchMe, location.pathname]);

    const csrf = useCallback(async () => {
        const base = getApiOrigin();

        await axios.get('/sanctum/csrf-cookie', {
            baseURL: base,
            withCredentials: true,
            withXSRFToken: true,
            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
            },
        });
    }, []);

    const login = useCallback(async (payload) => {
        await csrf();
        const { data } = await api.post('/auth/login', payload);
        setUser(data.user);
        return data.user;
    }, [csrf]);

    const register = useCallback(async (payload) => {
        await csrf();
        const { data } = await api.post('/auth/register', payload);
        setUser(data.user);
        return data.user;
    }, [csrf]);

    const logout = useCallback(async () => {
        await api.post('/auth/logout').catch(() => {});
        setUser(null);
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated: Boolean(user),
        role: user?.role ?? null,
    }), [user, loading, login, logout, register]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('AuthContext is not available');
    }
    return ctx;
}
