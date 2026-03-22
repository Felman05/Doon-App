import { useMutation } from '@tanstack/react-query';
import api from '../lib/axios';

export default function useRecommendations() {
    return useMutation({
        mutationFn: async (params) => {
            const { data } = await api.get('/recommendations', { params });
            return data.data?.data ?? [];
        },
    });
}
