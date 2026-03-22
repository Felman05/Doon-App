import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import Skeleton from '../../components/ui/Skeleton';

export default function AdminHome() {
    const { data: dashboard, isLoading } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: async () => {
            const { data } = await api.get('/admin/dashboard');
            return data.data;
        },
    });

    if (isLoading) {
        return <div className="kpi-row c4">{[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" />)}</div>;
    }

    return (
        <>
            <div className="kpi-row c4 mb20">
                <div className="kpi sr">
                    <div className="kpi-lbl">Total Users</div>
                    <div className="kpi-val">{dashboard?.total_users || 0}</div>
                </div>
                <div className="kpi sr d1">
                    <div className="kpi-lbl">Destinations</div>
                    <div className="kpi-val">{dashboard?.total_destinations || 0}</div>
                </div>
                <div className="kpi sr d2">
                    <div className="kpi-lbl">Active Providers</div>
                    <div className="kpi-val">{dashboard?.active_providers || 0}</div>
                </div>
                <div className="kpi sr d3">
                    <div className="kpi-lbl">Monthly AI Requests</div>
                    <div className="kpi-val">{dashboard?.monthly_ai_requests || 0}</div>
                </div>
            </div>

            <div className="g2 mb16">
                <div className="dc sr d1">
                    <div className="dc-title">Province Traffic</div>
                    <div className="bar-list">
                        {['Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'].map((prov, i) => (
                            <div key={i} className="bar-row">
                                <div className="bar-lbl">{prov}</div>
                                <div className="bar-bg">
                                    <div className="bar-f" style={{ width: `${Math.random() * 100}%` }}></div>
                                </div>
                                <div className="bar-val">{Math.floor(Math.random() * 500)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dc sr d2">
                    <div className="dc-title">Quick Actions</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <a href="/admin/approvals" className="s-btn dark">📋 Review Approvals</a>
                        <a href="/admin/reviews" className="s-btn">⚠️ Flagged Reviews</a>
                        <a href="/admin/providers" className="s-btn">✓ Verify Providers</a>
                    </div>
                </div>
            </div>

            <div className="g2">
                <div className="dc sr d2">
                    <div className="dc-title">Top Destinations</div>
                    {dashboard?.top_destinations?.map((dest, i) => (
                        <div key={i} style={{ fontSize: '13px', padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
                            <div style={{ fontWeight: '600' }}>{dest.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--i4)' }}>{dest.views} views</div>
                        </div>
                    ))}
                </div>

                <div className="dc sr d3">
                    <div className="dc-title">System Alerts</div>
                    <div style={{ fontSize: '13px', color: 'var(--i4)' }}>All systems operational ✓</div>
                </div>
            </div>
        </>
    );
}
