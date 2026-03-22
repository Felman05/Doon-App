import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import Skeleton from '../../components/ui/Skeleton';

export default function DestinationDetail() {
    const { id } = useParams();
    const { addToast } = useContext(ToastContext) || {};
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [reviewComment, setReviewComment] = useState('');

    const { data: destination, isLoading } = useQuery({
        queryKey: ['destination', id],
        queryFn: async () => {
            const { data } = await api.get(`/destinations/${id}`);
            return data.data;
        },
    });

    const saveFavoriteMutation = useMutation({
        mutationFn: () => api.post(`/favorites/${id}`),
        onSuccess: () => addToast?.('Added to saved places!', 'success'),
        onError: () => addToast?.('Failed to save', 'error'),
    });

    const submitReviewMutation = useMutation({
        mutationFn: () => api.post('/reviews', {
            destination_id: id,
            rating,
            title: reviewTitle,
            body: reviewComment,
            visit_date: visitDate,
        }),
        onSuccess: () => {
            addToast?.('Review submitted!', 'success');
            setShowReviewForm(false);
            setRating(5);
            setReviewTitle('');
            setReviewComment('');
            setVisitDate('');
        },
        onError: () => addToast?.('Failed to submit review', 'error'),
    });

    if (isLoading) return <Skeleton height="400px" />;
    if (!destination) return <div className="dc sr"><div style={{ textAlign: 'center', padding: '40px ' }}>Destination not found</div></div>;

    return (
        <>
            {/* Header */}
            <div className="dc mb16 sr">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ fontSize: '48px' }}>{destination.emoji}</div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--i)', marginBottom: '8px' }}>{destination.name}</h1>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="pill p-n">{destination.province}</span>
                            <span className="pill p-n">{destination.category}</span>
                        </div>
                        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--i3)' }}>
                            ⭐ {destination.avg_rating?.toFixed(1) || 'N/A'} ({destination.review_count || 0} reviews)
                        </div>
                    </div>
                    <div>
                        <button onClick={() => saveFavoriteMutation.mutate()} className="s-btn green" style={{ marginBottom: '8px' }}>
                            ❤️ Save
                        </button>
                        <button className="s-btn" style={{ width: '100%' }}>
                            📍 Directions
                        </button>
                    </div>
                </div>
                <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--i)', lineHeight: '1.6' }}>
                    {destination.description}
                </div>
            </div>

            {/* Details */}
            <div className="g2 mb16">
                <div className="dc sr d1">
                    <div className="dc-title" style={{ marginBottom: '12px' }}>Details</div>
                    <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                        {destination.price_min && (
                            <div>💰 {destination.price_label}</div>
                        )}
                        {destination.avg_duration_hours && (
                            <div>⏱️ ~{destination.avg_duration_hours} hours</div>
                        )}
                        {destination.contact && (
                            <div>📞 {destination.contact}</div>
                        )}
                        {destination.email && (
                            <div>📧 {destination.email}</div>
                        )}
                        {destination.website && (
                            <div>🌐 {destination.website}</div>
                        )}
                    </div>
                </div>
                <div className="dc sr d2">
                    <div className="dc-title" style={{ marginBottom: '12px' }}>Weather</div>
                    <div style={{ fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                        ☀️ 28°C Clear
                    </div>
                </div>
            </div>

            {/* Reviews */}
            <div className="dc mb16 sr d2">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Reviews ({destination.review_count})</div>
                
                <div style={{ marginBottom: '16px' }}>
                    <button onClick={() => setShowReviewForm(!showReviewForm)} className="s-btn dark">
                        ✍️ Write Review
                    </button>
                </div>

                {showReviewForm && (
                    <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 'var(--r)', marginBottom: '16px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--i4)', display: 'block', marginBottom: '6px' }}>Rating</label>
                            <div style={{ display: 'flex', gap: '4px', fontSize: '24px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: star <= rating ? 1 : 0.3 }}>
                                        ⭐
                                    </button>
                                ))}
                            </div>
                        </div>
                        <input placeholder="Review title" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} className="form-input" style={{ marginBottom: '12px' }} />
                        <textarea placeholder="Your review..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="form-input" style={{ marginBottom: '12px', minHeight: '80px' }} />
                        <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="form-input" style={{ marginBottom: '12px' }} />
                        <button onClick={() => submitReviewMutation.mutate()} className="s-btn dark">
                            Submit
                        </button>
                    </div>
                )}

                <div style={{ fontSize: '13px', color: 'var(--i3)' }}>
                    No reviews yet
                </div>
            </div>
        </>
    );
}
