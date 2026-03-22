import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export default function ReviewsPage() {
    const { addToast } = useContext(ToastContext) || {};

    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ['provider-reviews'],
        queryFn: async () => {
            const { data } = await api.get('/reviews?provider=me');
            return data.data ?? [];
        },
    });

    const flagMutation = useMutation({
        mutationFn: (id) => api.post(`/reviews/${id}/flag`),
        onSuccess: () => addToast?.('Review flagged for moderation', 'success'),
    });

    const totalReviews = reviews.length;
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : 0;
    const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
        stars: r,
        count: reviews.filter(rev => rev.rating === r).length,
    }));

    if (isLoading) {
        return <Skeleton height="300px" />;
    }

    return (
        <>
            <div className="dc mb16 sr">
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '40px', fontWeight: '700', color: 'var(--i)', lineHeight: 1 }}>
                        {avgRating}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--i4)', marginTop: '4px' }}>
                        ⭐ Average rating ({totalReviews} reviews)
                    </div>
                </div>

                <div className="bar-list">
                    {ratingCounts.map(item => (
                        <div key={item.stars} className="bar-row">
                            <div className="bar-lbl">{item.stars}★</div>
                            <div className="bar-bg">
                                <div className="bar-f" style={{ width: `${(item.count / Math.max(totalReviews, 1)) * 100}%` }}></div>
                            </div>
                            <div className="bar-val">{item.count}</div>
                        </div>
                    ))}
                </div>
            </div>

            {reviews.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reviews.map(review => (
                        <div key={review.id} className="rev-item sr d1">
                            <div className="rev-head">
                                <div className="rev-ava">{review.user?.name?.charAt(0) || 'U'}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="rev-name">{review.user?.name}</div>
                                    <div className="rev-date">{review.created_at}</div>
                                </div>
                                <div className="rev-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                            </div>
                            <div className="rev-txt">
                                <strong>{review.title}</strong><br />
                                {review.body}
                            </div>
                            <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                                <button onClick={() => flagMutation.mutate(review.id)} className="s-btn" style={{ fontSize: '11px' }}>
                                    🚩 Flag
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState icon="⭐" title="No reviews yet" message="Start building great experiences and reviews will come!" />
            )}
        </>
    );
}
