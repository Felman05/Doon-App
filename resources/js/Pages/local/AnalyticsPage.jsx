import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/axios';
import Skeleton from '../../components/ui/Skeleton';

export default function AnalyticsPage() {
    const [animateBars, setAnimateBars] = useState(false);

    const { data: analytics, isLoading } = useQuery({
        queryKey: ['provider-analytics'],
        queryFn: async () => {
            const { data } = await api.get('/provider/analytics');
            return data;
        },
    });

    useEffect(() => {
        setAnimateBars(false);
        const timeout = window.setTimeout(() => setAnimateBars(true), 40);
        return () => window.clearTimeout(timeout);
    }, [analytics]);

    const originRows = useMemo(() => {
        const origins = analytics?.visitor_origins || {};
        const total = Math.max(analytics?.total_events || 0, 1);

        return [
            { label: 'Metro Manila', value: origins.metro_manila || 0 },
            { label: 'Cavite', value: origins.cavite || 0 },
            { label: 'Laguna', value: origins.laguna || 0 },
            { label: 'Others', value: origins.others || 0 },
        ].map((item) => ({
            ...item,
            width: `${Math.min((item.value / total) * 100, 100)}%`,
        }));
    }, [analytics]);

    const recentReviews = analytics?.recent_reviews || [];
    const topReview = recentReviews[0] || null;

    if (isLoading) {
        return (
            <>
                <Skeleton height="200px" style={{ marginBottom: '16px' }} />
                <Skeleton height="200px" />
            </>
        );
    }

    return (
        <>
            <div className="g2 mb16">
                <div className="dc sr d1">
                    <div className="dc-title" style={{ marginBottom: '16px' }}>Visitor Demographics</div>
                    <div className="bar-list">
                        {originRows.map((item) => (
                            <div key={item.label} className="bar-row">
                                <div className="bar-lbl">{item.label}</div>
                                <div className="bar-bg">
                                    <div className="bar-f" style={{ width: animateBars ? item.width : '0%' }}></div>
                                </div>
                                <div className="bar-val">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dc sr d2">
                    <div className="dc-title" style={{ marginBottom: '16px' }}>Top Performing Listing</div>
                    {topReview ? (
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--i)', marginBottom: '8px' }}>
                                {topReview.destination?.name || 'Listing'}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--i3)', marginBottom: '4px' }}>
                                Recent rating: {topReview.rating}⭐
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--i3)' }}>
                                {topReview.title || 'No title'}
                            </div>
                        </div>
                    ) : (
                        <p style={{ fontSize: '13px', color: 'var(--i4)' }}>No data yet</p>
                    )}
                </div>
            </div>

            <div className="dc sr d2">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Monthly Views</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
                    {originRows.map((item) => (
                        <div key={item.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg)', borderRadius: 'var(--r)' }}>
                            <div style={{ fontSize: '11px', color: 'var(--i4)', marginBottom: '6px' }}>{item.label}</div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--i)' }}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
