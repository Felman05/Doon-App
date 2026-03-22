import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';

export default function UsersPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [page, setPage] = useState(1);
    const [toDelete, setToDelete] = useState(null);
    const [search, setSearch] = useState('');

    const { data: { data: users = [], total = 0, last_page = 1 } = {} } = useQuery({
        queryKey: ['admin-users', page, search],
        queryFn: async () => {
            const { data } = await api.get('/admin/users', { params: { page, search } });
            return data.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/users/${id}`),
        onSuccess: () => { addToast?.('User deleted', 'success'); setToDelete(null); },
    });

    const toggleRoleMutation = useMutation({
        mutationFn: ({ id, role }) => api.patch(`/admin/users/${id}`, { role }),
        onSuccess: () => { addToast?.('User role updated', 'success'); },
    });

    return (
        <>
            <input 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search users..."
                className="form-input"
                style={{ marginBottom: '16px', width: '100%' }}
            />

            {users.length ? (
                <div style={{ borderRadius: 'var(--r2)', border: '1px solid var(--bd)', overflow: 'hidden', background: 'var(--wh)' }}>
                    <table className="d-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Bookings</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <select 
                                            value={user.role} 
                                            onChange={(e) => toggleRoleMutation.mutate({ id: user.id, role: e.target.value })}
                                            className="form-input"
                                            style={{ fontSize: '11px', padding: '4px 8px', width: '80px' }}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>{user.bookings_count || 0}</td>
                                    <td>
                                        <button onClick={() => setToDelete(user.id)} className="s-btn" style={{ fontSize: '11px' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState icon="👥" title="No users found" />
            )}

            {last_page > 1 && <Pagination currentPage={page} totalPages={last_page} onPageChange={setPage} totalResults={total} />}

            <ConfirmationDialog isOpen={!!toDelete} title="Delete user?" isDangerous confirmLabel="Delete" onConfirm={() => deleteMutation.mutate(toDelete)} onCancel={() => setToDelete(null)} />
        </>
    );
}
