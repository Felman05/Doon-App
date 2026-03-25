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
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        setAnimateBars(false);
        const timeout = window.setTimeout(() => setAnimateBars(true), 40);
        return () => window.clearTimeout(timeout);
    }, [analytics]);

    const originRows = useMemo(() => {
        const origins = analytics?.visitor_origins || {};
        const total = Math.max(
            Object.values(origins).reduce((sum, v) => sum + (v || 0), 0),
            1
        );

        return [
            { label: 'Metro Manila', value: origins['Metro Manila'] || 0 },
            { label: 'Cavite', value: origins.Cavite || 0 },
            { label: 'Laguna', value: origins.Laguna || 0 },
            { label: 'Others', value: origins.Others || 0 },
        ].map((item) => ({
            ...item,
            width: `${Math.min((item.value / total) * 100, 100)}%`,
        }));
    }, [analytics]);

    const monthlyViews = analytics?.monthly_views || [];
    const topListing = analytics?.top_listing;
    const recentReviews = analytics?.recent_reviews || [];

    const maxViews = Math.max(...monthlyViews.map(v => v.views || 0), 1);

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
                                    <div 
                                        className="bar-f" 
                                        style={{ 
                                            width: animateBars ? item.width : '0%',
                                            transition: 'width 0.8s ease',
                                        }}
                                    ></div>
                                </div>
                                <div className="bar-val">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dc sr d2">
                    <div className="dc-title" style={{ marginBottom: '16px' }}>Top Performing Listing</div>
                    {topListing ? (
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--i)', marginBottom: '8px' }}>
                                {topListing.name}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--i3)', marginBottom: '4px' }}>
                                {'⭐'.repeat(Math.round(Number(topListing.rating || 0)))} {Number(topListing.rating || 0).toFixed(1)}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--i4)', marginBottom: '8px' }}>
                                {topListing.views} views this month
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--i3)' }}>
                                Appeared in {analytics?.total_events || 0} recommendations this month
                            </div>
                        </div>
                    ) : (
                        <p style={{ fontSize: '13px', color: 'var(--i4)' }}>No data yet</p>
                    )}
                </div>
            </div>

            <div className="dc sr d2 mb16">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Monthly Views by Destination</div>
                {monthlyViews.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {monthlyViews.map((item) => (
                            <div key={item.name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                    <span style={{ color: 'var(--i)', fontWeight: '500' }}>{item.name}</span>
                                    <span style={{ color: 'var(--i4)' }}>{item.views} views</span>
                                </div>
                                <div className="bar-bg" style={{ height: '6px' }}>
                                    <div 
                                        className="bar-f" 
                                        style={{ 
                                            width: `${(item.views / maxViews) * 100}%`,
                                            height: '100%',
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ fontSize: '13px', color: 'var(--i4)' }}>No view data yet</p>
                )}
            </div>

            <div className="dc sr d3">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Recent Reviews</div>
                {recentReviews.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {recentReviews.slice(0, 3).map((review) => (
                            <div key={review.id} style={{ padding: '10px', background: 'var(--bg)', borderRadius: 'var(--r)', borderLeft: '3px solid var(--pr)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '12px', color: 'var(--i)' }}>
                                            {review.user?.name || 'Anonymous'}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--i4)' }}>
                                            {review.destination?.name}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--i3)' }}>
                                        {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--i3)', lineHeight: '1.4' }}>
                                    {review.title}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ fontSize: '13px', color: 'var(--i4)' }}>No reviews yet</p>
                )}
            </div>
        </>
    );
}
