import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';

const categoryEmoji = {
    'beach-water': '🏖️',
    'nature-outdoor': '🌿',
    'cultural-heritage': '🏛️',
    'food-dining': '🍜',
    'adventure-sports': '⚡',
    accommodation: '🏨',
    'events-festivals': '🎉',
    'wellness-spa': '🧘',
    'shopping-markets': '🛍️',
};

const categoryColor = {
    'beach-water': '#e0f2ef',
    'nature-outdoor': '#e5f3e7',
    'cultural-heritage': '#ece8f7',
    'food-dining': '#fff0dc',
    'adventure-sports': '#ffe8e6',
    accommodation: '#edf4ff',
    'events-festivals': '#fff0f7',
    'wellness-spa': '#eaf7f4',
    'shopping-markets': '#f3ecff',
};

export default function SavedPlacesPage() {
    const navigate = useNavigate();
    const { addToast } = useContext(ToastContext) || {};
    const [toDelete, setToDelete] = useState(null);

    const formatRating = (value) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric.toFixed(1) : 'N/A';
    };

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
                        <div key={fav.id} className="dc sr" style={{ overflow: 'hidden', padding: 0 }}>
                            <div
                                style={{
                                    height: '120px',
                                    background: fav.destination?.category_color || categoryColor[fav.destination?.category_slug] || 'var(--acb)',
                                    borderRadius: 'var(--r2) var(--r2) 0 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '40px',
                                }}
                            >
                                {categoryEmoji[fav.destination?.category_slug] || '📍'}
                            </div>
                            <div style={{ padding: '12px 14px 14px' }}>
                                <div className="dc-title">{fav.destination?.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--i4)', marginTop: '4px' }}>
                                    {fav.destination?.province}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--i3)', marginTop: '2px' }}>
                                    ⭐ {formatRating(fav.destination?.avg_rating)}
                                </div>
                                <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                                    <button
                                        className="s-btn dark"
                                        style={{ flex: 1 }}
                                        onClick={() => navigate(`/dashboard/destinations/${fav.destination?.id}`)}
                                    >
                                        View
                                    </button>
                                    <button onClick={() => setToDelete(fav.destination?.id)} className="s-btn sp-remove-btn" style={{ flex: 1 }}>
                                        Remove
                                    </button>
                                </div>
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
