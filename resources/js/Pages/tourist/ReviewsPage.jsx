import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import Skeleton from '../../components/ui/Skeleton';

export default function ReviewsPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [toDelete, setToDelete] = useState(null);

    const { data: reviews = [], isLoading, refetch } = useQuery({
        queryKey: ['my-reviews'],
        queryFn: async () => {
            const { data } = await api.get('/reviews?mine=true');
            return data.data ?? [];
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (reviewId) => api.delete(`/reviews/${reviewId}`),
        onSuccess: () => {
            addToast?.('Review deleted', 'success');
            refetch();
            setToDelete(null);
        },
        onError: () => addToast?.('Failed to delete review', 'error'),
    });

    if (isLoading) {
        return (
            <div>
                {[1, 2, 3].map(i => <Skeleton key={i} height="100px" style={{ marginBottom: '12px' }} />)}
            </div>
        );
    }

    return (
        <>
            {reviews.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reviews.map(review => (
                        <div key={review.id} className="dc sr">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <h3 style={{ fontWeight: '600', fontSize: '14px', color: 'var(--i)', marginBottom: '4px' }}>
                                        {review.destination?.name}
                                    </h3>
                                    <div style={{ fontSize: '12px', color: 'var(--i4)', marginBottom: '6px' }}>
                                        {review.title}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--i4)' }}>
                                        Visited: {review.visit_date}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <div style={{ fontSize: '14px', letterSpacing: '1px' }}>
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="s-btn" style={{ fontSize: '11px' }}>Edit</button>
                                        <button onClick={() => setToDelete(review.id)} className="s-btn" style={{ fontSize: '11px' }}>Delete</button>
                                    </div>
                                </div>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--i3)', lineHeight: '1.55' }}>
                                {review.body}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="⭐"
                    title="No reviews yet"
                    message="Start exploring and share your experiences with others."
                />
            )}

            <ConfirmationDialog
                isOpen={!!toDelete}
                title="Delete review?"
                message="This action cannot be undone."
                confirmLabel="Delete"
                isDangerous
                onConfirm={() => deleteMutation.mutate(toDelete)}
                onCancel={() => setToDelete(null)}
            />
        </>
    );
}
