import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';

export default function ReviewsPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [page, setPage] = useState(1);
    const [toDelete, setToDelete] = useState(null);
    const [filter, setFilter] = useState('all');

    const { data: { data: reviews = [], total = 0, last_page = 1 } = {}, refetch } = useQuery({
        queryKey: ['admin-reviews', page, filter],
        queryFn: async () => {
            const { data } = await api.get('/admin/reviews', { params: { page, status: filter } });
            return data.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/reviews/${id}`),
        onSuccess: () => { addToast?.('Review deleted', 'success'); refetch(); setToDelete(null); },
    });

    const approveMutation = useMutation({
        mutationFn: (id) => api.patch(`/admin/reviews/${id}`, { status: 'approved' }),
        onSuccess: () => { addToast?.('Review approved', 'success'); refetch(); },
    });

    return (
        <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="form-input">
                    <option value="all">All Reviews</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                </select>
            </div>

            {reviews.length ? (
                <div style={{ borderRadius: 'var(--r2)', border: '1px solid var(--bd)', overflow: 'hidden', background: 'var(--wh)' }}>
                    <table className="d-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Destination</th>
                                <th>User</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map(review => (
                                <tr key={review.id}>
                                    <td>{review.destination?.name}</td>
                                    <td>{review.user?.name}</td>
                                    <td>{'⭐'.repeat(review.rating)}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.comment}</td>
                                    <td><span className={`pill p-${review.status === 'approved' ? 'g' : 'y'}`}>{review.status}</span></td>
                                    <td style={{ fontSize: '11px', display: 'flex', gap: '4px' }}>
                                        {review.status === 'pending' && <button onClick={() => approveMutation.mutate(review.id)} className="s-btn">Approve</button>}
                                        <button onClick={() => setToDelete(review.id)} className="s-btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState icon="⭐" title="No reviews found" />
            )}

            {last_page > 1 && <Pagination currentPage={page} totalPages={last_page} onPageChange={setPage} totalResults={total} />}

            <ConfirmationDialog isOpen={!!toDelete} title="Delete review?" isDangerous confirmLabel="Delete" onConfirm={() => deleteMutation.mutate(toDelete)} onCancel={() => setToDelete(null)} />
        </>
    );
}
