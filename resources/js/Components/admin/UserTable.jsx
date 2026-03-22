import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

export default function UserTable({ role, title }) {
    const { data = [] } = useQuery({
        queryKey: ['admin', 'users', role ?? 'all'],
        queryFn: async () => {
            const { data } = await api.get('/admin/users', { params: role ? { role } : {} });
            return data.data?.data ?? [];
        },
    });

    return <>
        {title ? <div className="dc-title" style={{ marginBottom: '10px' }}>{title}</div> : null}
        <table className="d-table">
            <thead>
                <tr><th>User</th><th>Role</th><th>Email</th><th>Status</th></tr>
            </thead>
            <tbody>
                {data.map((user) => (
                    <tr key={user.id}><td>{user.name}</td><td>{user.role}</td><td>{user.email}</td><td><span className={`pill ${user.is_active ? 'p-g' : 'p-r'}`}>{user.is_active ? 'active' : 'inactive'}</span></td></tr>
                ))}
            </tbody>
        </table>
        {data.length === 0 ? <div className="alert info" style={{ marginTop: '10px' }}>No users found for this filter.</div> : null}
    </>;
}
