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

    const addStop = useMutation({
        mutationFn: async ({ itineraryId, ...payload }) => {
            const { data } = await api.post(`/itineraries/${itineraryId}/add-stop`, payload);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['itineraries'] }),
    });

    const removeStop = useMutation({
        mutationFn: async ({ itineraryId, stopId }) => {
            await api.delete(`/itineraries/${itineraryId}/stops/${stopId}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['itineraries'] }),
    });

    const updateItinerary = useMutation({
        mutationFn: async ({ itineraryId, ...payload }) => {
            const { data } = await api.put(`/itineraries/${itineraryId}`, payload);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['itineraries'] }),
    });

    const deleteItinerary = useMutation({
        mutationFn: async (itineraryId) => {
            await api.delete(`/itineraries/${itineraryId}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['itineraries'] }),
    });

    const activeItinerary = (itinerariesQuery.data ?? []).find((i) => i.status === 'planned' || i.status === 'ongoing') || (itinerariesQuery.data ?? [])[0] || null;

    return {
        itineraries: itinerariesQuery.data ?? [],
        activeItinerary,
        isLoading: itinerariesQuery.isLoading,
        createItinerary,
        addStop,
        removeStop,
        updateItinerary,
        deleteItinerary,
    };
}
