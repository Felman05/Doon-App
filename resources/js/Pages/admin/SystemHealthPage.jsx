import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

export default function SystemHealthPage() {
    const { data: health } = useQuery({
        queryKey: ['admin-system-health'],
        queryFn: async () => {
            const { data } = await api.get('/admin/system/health');
            return data.data;
        },
        refetchInterval: 5000,
    });

    const getStatusColor = (status) => {
        return status === 'healthy' ? 'p-g' : status === 'warning' ? 'p-y' : 'p-r';
    };

    if (!health) return <div>Loading health status...</div>;

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'var(--wh)', padding: '16px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0 }}>Database</h4>
                        <span className={`pill ${getStatusColor(health.database?.status)}`}>{health.database?.status}</span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Response: {health.database?.response_time}ms</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Connections: {health.database?.connections}/{health.database?.max_connections}</p>
                </div>

                <div style={{ background: 'var(--wh)', padding: '16px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0 }}>Server</h4>
                        <span className={`pill ${getStatusColor(health.server?.status)}`}>{health.server?.status}</span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>CPU: {health.server?.cpu_usage}%</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Memory: {health.server?.memory_usage}%</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Disk: {health.server?.disk_usage}%</p>
                </div>

                <div style={{ background: 'var(--wh)', padding: '16px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0 }}>Cache</h4>
                        <span className={`pill ${getStatusColor(health.cache?.status)}`}>{health.cache?.status}</span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Driver: {health.cache?.driver}</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Hit Rate: {health.cache?.hit_rate}%</p>
                </div>

                <div style={{ background: 'var(--wh)', padding: '16px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0 }}>Queue</h4>
                        <span className={`pill ${getStatusColor(health.queue?.status)}`}>{health.queue?.status}</span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Pending Jobs: {health.queue?.pending_jobs}</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Failed Jobs: {health.queue?.failed_jobs}</p>
                </div>

                <div style={{ background: 'var(--wh)', padding: '16px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0 }}>Email</h4>
                        <span className={`pill ${getStatusColor(health.email?.status)}`}>{health.email?.status}</span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Service: {health.email?.service}</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Last Check: {new Date(health.email?.last_check).toLocaleTimeString()}</p>
                </div>

                <div style={{ background: 'var(--wh)', padding: '16px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0 }}>Storage</h4>
                        <span className={`pill ${getStatusColor(health.storage?.status)}`}>{health.storage?.status}</span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Used: {health.storage?.used_space}MB / {health.storage?.total_space}MB</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>Files: {health.storage?.file_count}</p>
                </div>
            </div>

            <div style={{ marginTop: '20px', background: 'var(--wh)', padding: '16px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)' }}>
                <h3>Last Update</h3>
                <p style={{ fontSize: '13px', color: 'var(--tx2)', margin: '0' }}>{new Date(health.last_update).toLocaleString()}</p>
            </div>
        </div>
    );
}
