import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';

export default function SavedPlacesPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [toDelete, setToDelete] = useState(null);

    const { data: favorites = [], isLoading, refetch } = useQuery({
        queryKey: ['favorites'],
        queryFn: async () => {
            const { data } = await api.get('/favorites');
            return data.data ?? [];
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (destId) => api.delete(`/favorites/${destId}`),
        onSuccess: () => {
            addToast?.('Removed from saved places', 'success');
            refetch();
            setToDelete(null);
        },
        onError: () => addToast?.('Failed to remove', 'error'),
    });

    if (isLoading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {[1, 2, 3, 4].map(i => <Skeleton key={i} height="240px" />)}
            </div>
        );
    }

    return (
        <>
            {favorites.length ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {favorites.map(fav => (
                        <div key={fav.id} className="dc sr" style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '40px', textAlign: 'center', marginBottom: '12px' }}>
                                {fav.destination?.emoji || '📍'}
                            </div>
                            <div className="dc-title">{fav.destination?.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--i4)', marginTop: '4px' }}>
                                {fav.destination?.province}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--i3)', marginTop: '2px' }}>
                                ⭐ {fav.destination?.avg_rating?.toFixed(1) || 'N/A'}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                                <button className="s-btn" style={{ flex: 1 }}>View</button>
                                <button onClick={() => setToDelete(fav.id)} className="s-btn" style={{ flex: 1 }}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="❤️"
                    title="No saved places"
                    message="You have not saved any places yet. Start exploring to save destinations."
                />
            )}

            <ConfirmationDialog
                isOpen={!!toDelete}
                title="Remove from saved places?"
                message="This destination will be removed from your saved list."
                confirmLabel="Remove"
                isDangerous
                onConfirm={() => deleteMutation.mutate(toDelete)}
                onCancel={() => setToDelete(null)}
            />
        </>
    );
}
