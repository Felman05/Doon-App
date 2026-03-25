import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, memo } from 'react';
import api from '../../lib/axios';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';

const ActivityLogRow = memo(({ log }) => (
    <tr>
        <td>{log.user?.name}</td>
        <td><span className={`pill p-${log.action === 'delete' ? 'r' : 'b'}`}>{log.action}</span></td>
        <td>{log.resource_type} #{log.resource_id}</td>
        <td>{new Date(log.created_at).toLocaleString()}</td>
        <td style={{ fontSize: '12px' }}>{log.ip_address}</td>
    </tr>
));

function ActivityLogsPage() {
    const [page, setPage] = useState(1);
    const [filterBy, setFilterBy] = useState('all');

    const handlePageChange = useCallback((newPage) => setPage(newPage), []);
    const handleFilterChange = useCallback((e) => { setFilterBy(e.target.value); setPage(1); }, []);

    const { data: { data: logs = [], total = 0, last_page = 1 } = {} } = useQuery({
        queryKey: ['admin-activity-logs', page, filterBy],
        queryFn: async () => {
            const { data } = await api.get('/admin/activity-logs', { params: { page, filter: filterBy } });
            return data.data;
        },
    });

    return (
        <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <select value={filterBy} onChange={handleFilterChange} className="form-input" style={{ width: '150px' }}>
                    <option value="all">All Activities</option>
                    <option value="login">Logins</option>
                    <option value="create">Created</option>
                    <option value="update">Updated</option>
                    <option value="delete">Deleted</option>
                </select>
            </div>

            {logs.length ? (
                <div style={{ borderRadius: 'var(--r2)', border: '1px solid var(--bd)', overflow: 'hidden', background: 'var(--wh)' }}>
                    <table className="d-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Action</th>
                                <th>Resource</th>
                                <th>Timestamp</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <ActivityLogRow key={log.id} log={log} />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState icon="📝" title="No activity logs" />
            )}

            {last_page > 1 && <Pagination currentPage={page} totalPages={last_page} onPageChange={handlePageChange} totalResults={total} />}
        </>
    );
}

export default memo(ActivityLogsPage);
