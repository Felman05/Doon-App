import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export default function ReviewsPage() {
    const { addToast } = useContext(ToastContext) || {};

    const { data: reviewData = { data: [], avg: 0, total: 0, breakdown: {} }, isLoading } = useQuery({
        queryKey: ['provider-reviews'],
        queryFn: async () => {
            const { data } = await api.get('/provider/reviews');
            return data;
        },
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    const reviews = reviewData.data || [];
    const avgRating = reviewData.avg || 0;
    const totalReviews = reviewData.total || 0;
    const breakdown = reviewData.breakdown || {};

    const ratingBars = [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: breakdown[stars]?.count || 0,
        percent: breakdown[stars]?.percent || 0,
    }));

    if (isLoading) {
        return <Skeleton height="300px" />;
    }

    return (
        <>
            {totalReviews > 0 && (
                <>
                    <div className="dc mb16 sr">
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '40px', fontWeight: '700', color: 'var(--i)', lineHeight: 1 }}>
                                {avgRating}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--i4)', marginTop: '4px' }}>
                                {'⭐'.repeat(Math.round(avgRating))} Average rating ({totalReviews} reviews)
                            </div>
                        </div>

                        <div className="bar-list">
                            {ratingBars.map(item => (
                                <div key={item.stars} className="bar-row">
                                    <div className="bar-lbl">{item.stars}★</div>
                                    <div className="bar-bg">
                                        <div className="bar-f" style={{ width: `${item.percent}%` }}></div>
                                    </div>
                                    <div className="bar-val">{item.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {reviews.map(review => (
                            <div key={review.id} className="rev-item sr d1">
                                <div className="rev-head">
                                    <div className="rev-ava" style={{ background: `hsl(${Math.random() * 360}, 70%, 60%)` }}>
                                        {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="rev-name">{review.user?.name || 'Anonymous'}</div>
                                        <div className="rev-date">
                                            {review.destination?.name} • {new Date(review.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="rev-stars">
                                        {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                </div>
                                <div className="rev-txt">
                                    <strong>{review.title}</strong><br />
                                    {review.body}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {totalReviews === 0 && (
                <EmptyState 
                    icon="⭐" 
                    title="No reviews yet" 
                    message="Reviews will appear here once tourists visit and rate your listings"
                />
            )}
        </>
    );
}
