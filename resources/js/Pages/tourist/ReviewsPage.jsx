import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import Skeleton from '../../components/ui/Skeleton';

export default function ReviewsPage() {
    const navigate = useNavigate();
    const { addToast } = useContext(ToastContext) || {};
    const [toDelete, setToDelete] = useState(null);

    const formatVisitDate = (value) => {
        if (!value) return 'Visited date unavailable';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Visited date unavailable';
        return `Visited ${date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

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
                                        {review.destination?.name || 'Unknown destination'}
                                    </h3>
                                    <div style={{ fontSize: '12px', color: 'var(--i4)', marginBottom: '6px' }}>
                                        {review.destination?.province || 'N/A'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--i4)' }}>
                                        {formatVisitDate(review.visit_date)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <div style={{ fontSize: '14px', letterSpacing: '1px' }}>
                                        {'★'.repeat(Number(review.rating || 0))}{'☆'.repeat(5 - Number(review.rating || 0))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="s-btn" style={{ fontSize: '11px' }} onClick={() => navigate(`/dashboard/destinations/${review.destination_id}`)}>Edit</button>
                                        <button onClick={() => setToDelete(review.id)} className="s-btn" style={{ fontSize: '11px' }}>Delete</button>
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--i)', marginBottom: '6px' }}>
                                {review.title || 'Untitled review'}
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--i3)', lineHeight: '1.55', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {review.body}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="dc sr" style={{ textAlign: 'center' }}>
                    <EmptyState
                        icon="⭐"
                        title="No reviews yet"
                        message="You have not written any reviews yet. Visit a destination and share your experience."
                    />
                    <button type="button" className="s-btn dark" onClick={() => navigate('/dashboard/recommendations')}>
                        Browse Destinations →
                    </button>
                </div>
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
