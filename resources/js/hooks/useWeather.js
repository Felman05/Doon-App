import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export default function useWeather() {
    return useQuery({
        queryKey: ['weather'],
        queryFn: async () => {
            const { data } = await api.get('/weather');
            return data.data ?? [];
        },
        staleTime: 30 * 60 * 1000,
    });
}
