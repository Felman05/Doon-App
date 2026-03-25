import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import Skeleton from '../../components/ui/Skeleton';

export default function ProviderHome() {
    const { data: stats, isLoading, isError } = useQuery({
        queryKey: ['provider-stats'],
        queryFn: async () => {
            const { data } = await api.get('/provider/stats');
            return data;
        },
        retry: 1,
        staleTime: 3 * 60 * 1000,
    });

    if (isError) {
        return (
            <div style={{ padding: '20px', color: 'var(--r)', fontSize: '14px' }}>
                Failed to load dashboard. Please refresh the page.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="kpi-row c4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" />)}
            </div>
        );
    }

    return (
        <>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--i)', marginBottom: '2px' }}>
                    Welcome back! 👋
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--i4)' }}>Here's your business performance at a glance.</p>
            </div>

            <div className="kpi-row c4 mb20">
                <div className="kpi sr">
                    <div className="kpi-lbl">Profile Views</div>
                    <div className="kpi-val">{stats?.profile_views || 0}</div>
                    <div className="kpi-sub">This month</div>
                </div>
                <div className="kpi sr d1">
                    <div className="kpi-lbl">Avg Rating</div>
                    <div className="kpi-val">{stats?.avg_rating?.toFixed(1) || 'N/A'}</div>
                    <div className="kpi-sub">⭐ Rating  </div>
                </div>
                <div className="kpi sr d2">
                    <div className="kpi-lbl">Active Listings</div>
                    <div className="kpi-val">{stats?.active_listings || 0}</div>
                    <div className="kpi-sub">{stats?.pending_listings || 0} pending</div>
                </div>
                <div className="kpi sr d3">
                    <div className="kpi-lbl">Recommendation Appearances</div>
                    <div className="kpi-val">{stats?.rec_appearances || 0}</div>
                    <div className="kpi-sub">Times featured</div>
                </div>
            </div>

            <div className="g2 mb16">
                <div className="dc sr d1">
                    <div className="dc-title">Quick Actions</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <a href="/provider/listings/new" className="s-btn dark" style={{ textAlign: 'center' }}>
                            ➕ New Listing
                        </a>
                        <a href="/provider/analytics" className="s-btn" style={{ textAlign: 'center' }}>
                            📈 View Analytics
                        </a>
                        <a href="/provider/reviews" className="s-btn" style={{ textAlign: 'center' }}>
                            ⭐ View Reviews
                        </a>
                    </div>
                </div>
                <div className="dc sr d2">
                    <div className="dc-title">Status</div>
                    <div style={{ padding: '20px 0', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', marginBottom: '12px' }}>✅</div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--i)', marginBottom: '4px' }}>Verified</div>
                        <p style={{ fontSize: '12px', color: 'var(--i4)', lineHeight: '1.5' }}>Your business is verified and can receive bookings.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
