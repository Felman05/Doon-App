import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Chart from '../../components/ui/Chart';
import StatCard from '../../components/ui/StatCard';

export default function DashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: async () => {
            const { data } = await api.get('/admin/dashboard/stats');
            return data.data;
        },
    });

    const { data: chartData } = useQuery({
        queryKey: ['admin-dashboard-chart'],
        queryFn: async () => {
            const { data } = await api.get('/admin/dashboard/chart');
            return data.data;
        },
    });

    if (isLoading) return <div className="loading">Loading...</div>;

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <StatCard icon="👥" label="Total Users" value={stats?.total_users || 0} />
                <StatCard icon="📋" label="Total Bookings" value={stats?.total_bookings || 0} />
                <StatCard icon="💰" label="Revenue" value={`$${stats?.total_revenue || 0}`} />
                <StatCard icon="⭐" label="Avg Rating" value={(stats?.avg_rating || 0).toFixed(1)} />
            </div>

            {chartData && (
                <div style={{ background: 'var(--wh)', padding: '20px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)' }}>
                    <h3 style={{ marginBottom: '16px' }}>Bookings Trend</h3>
                    <Chart data={chartData} type="line" />
                </div>
            )}
        </div>
    );
}
