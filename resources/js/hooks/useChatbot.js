import { useMutation } from '@tanstack/react-query';
import api from '../lib/axios';

export default function useChatbot() {
    return useMutation({
        mutationFn: async ({ message, sessionToken }) => {
            const { data } = await api.post('/chatbot', {
                message,
                session_token: sessionToken,
            });
            return data;
        },
    });
}
