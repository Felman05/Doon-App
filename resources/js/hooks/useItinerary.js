import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export default function useItinerary() {
    const queryClient = useQueryClient();

    const itinerariesQuery = useQuery({
        queryKey: ['itineraries'],
        queryFn: async () => {
            const { data } = await api.get('/itineraries');
            return data.data ?? [];
        },
    });

    const createItinerary = useMutation({
        mutationFn: async (payload) => {
            const { data } = await api.post('/itineraries', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['itineraries'] });
        },
    });

    return { itinerariesQuery, createItinerary };
}
