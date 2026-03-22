import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export default function useAnalytics({ queryKey = ['analytics', 'province-stats'], endpoint = '/analytics/province-stats' } = {}) {
    const provinceStats = useQuery({
        queryKey,
        queryFn: async () => {
            const { data } = await api.get(endpoint);
            return data.data ?? [];
        },
    });

    return { provinceStats };
}
