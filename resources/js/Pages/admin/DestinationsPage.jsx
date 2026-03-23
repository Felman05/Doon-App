import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';

export default function DestinationsPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [page, setPage] = useState(1);
    const [toDelete, setToDelete] = useState(null);

    const { data: { data: destinations = [], total = 0, last_page = 1 } = {}, isLoading, refetch } = useQuery({
        queryKey: ['admin-destinations', page],
        queryFn: async () => {
            const { data } = await api.get('/admin/destinations', { params: { page } });
            return data.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/destinations/${id}`),
        onSuccess: () => { addToast?.('Destination deleted', 'success'); refetch(); setToDelete(null); },
    });

    return (
        <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input placeholder="Search..." className="form-input" style={{ flex: 1 }} />
                <a href="#" className="s-btn dark">➕ Add Destination</a>
            </div>

            {destinations.length ? (
                <>
                    <div className="d-table" style={{ borderRadius: 'var(--r2)', border: '1px solid var(--bd)', overflow: 'hidden', background: 'var(--wh)' }}>
                        <table className="d-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Province</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {destinations.map(dest => (
                                    <tr key={dest.id}>
                                        <td>{dest.name}</td>
                                        <td>{dest.province}</td>
                                        <td>{dest.category}</td>
                                        <td><span className={`pill p-${dest.status === 'active' ? 'g' : 'n'}`}>{dest.status}</span></td>
                                        <td>
                                            <button className="s-btn" style={{ fontSize: '11px' }}>Edit</button>
                                            <button onClick={() => setToDelete(dest.id)} className="s-btn" style={{ fontSize: '11px' }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {last_page > 1 && <Pagination currentPage={page} totalPages={last_page} onPageChange={setPage} totalResults={total} />}
                </>
            ) : (
                <EmptyState icon="🗺️" title="No destinations" />
            )}

            <ConfirmationDialog isOpen={!!toDelete} title="Delete destination?" isDangerous confirmLabel="Delete" onConfirm={() => deleteMutation.mutate(toDelete)} onCancel={() => setToDelete(null)} />
        </>
    );
}
