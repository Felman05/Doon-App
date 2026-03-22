import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import Skeleton from '../../components/ui/Skeleton';

export default function AnalyticsPage() {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['provider-analytics'],
        queryFn: async () => {
            const { data } = await api.get('/analytics/my-provider');
            return data.data;
        },
    });

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
                        {[
                            { label: 'Gen Z', value: analytics?.gen_z_views || 0, max: 100 },
                            { label: 'Millennial', value: analytics?.millennial_views || 0, max: 100 },
                            { label: 'Gen X', value: analytics?.gen_x_views || 0, max: 100 },
                            { label: 'Boomer', value: analytics?.boomer_views || 0, max: 100 },
                        ].map((item, i) => (
                            <div key={i} className="bar-row">
                                <div className="bar-lbl">{item.label}</div>
                                <div className="bar-bg">
                                    <div className="bar-f" style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}></div>
                                </div>
                                <div className="bar-val">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dc sr d2">
                    <div className="dc-title" style={{ marginBottom: '16px' }}>Top Performing Listing</div>
                    {analytics?.top_listing ? (
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--i)', marginBottom: '8px' }}>
                                {analytics.top_listing.title}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--i3)', marginBottom: '4px' }}>
                                Views: {analytics.top_listing.views}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--i3)' }}>
                                Rating: {analytics.top_listing.rating}⭐
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
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg)', borderRadius: 'var(--r)' }}>
                            <div style={{ fontSize: '11px', color: 'var(--i4)', marginBottom: '6px' }}>{month}</div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--i)' }}>
                                {Math.floor(Math.random() * 100) + 20}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
