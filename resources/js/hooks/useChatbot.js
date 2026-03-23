import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../lib/axios';

const STORAGE_KEY = 'doon_chatbot_token';

export default function useChatbot() {
    const [messages, setMessages] = useState([]);
    const [sessionToken, setSessionToken] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);

    useEffect(() => {
        if (!sessionToken) {
            return;
        }

        let active = true;

        api.get('/chatbot/history', { params: { session: sessionToken } })
            .then(({ data }) => {
                if (!active) {
                    return;
                }
                const mapped = (data.messages ?? []).map((m) => ({
                    role: m.role,
                    content: m.content,
                    created_at: m.created_at,
                }));
                setMessages(mapped);
            })
            .catch(() => {
                if (active) {
                    setError('Could not load chat history.');
                }
            });

        return () => {
            active = false;
        };
    }, [sessionToken]);

    const sendMessage = useCallback(async (message) => {
        const text = String(message || '').trim();
        if (!text) {
            return;
        }

        setError(null);
        setLastMessage(text);
        setIsLoading(true);
        setMessages((prev) => [...prev, { role: 'user', content: text }]);

        try {
            const { data } = await api.post('/chatbot', {
                message: text,
                session_token: sessionToken,
            });

            const nextToken = data.session_token || sessionToken;
            if (nextToken && nextToken !== sessionToken) {
                setSessionToken(nextToken);
                localStorage.setItem(STORAGE_KEY, nextToken);
            }

            setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || '' }]);
        } catch (e) {
            setError('Could not reach Doon AI. Please try again.');
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Could not reach Doon AI. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    }, [sessionToken]);

    const retry = useCallback(async () => {
        if (!lastMessage) {
            return;
        }
        await sendMessage(lastMessage);
    }, [lastMessage, sendMessage]);

    const clearSession = useCallback(() => {
        setMessages([]);
        setError(null);
        setSessionToken(null);
        setLastMessage(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return useMemo(() => ({
        messages,
        sendMessage,
        isLoading,
        error,
        retry,
        clearSession,
    }), [messages, sendMessage, isLoading, error, retry, clearSession]);
}
