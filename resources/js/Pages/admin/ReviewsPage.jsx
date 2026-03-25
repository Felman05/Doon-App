import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState, useCallback, memo } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';

const ReviewRow = memo(({ review, onDelete, onApprove }) => (
    <tr>
        <td>{review.destination?.name}</td>
        <td>{review.user?.name}</td>
        <td>{'⭐'.repeat(review.rating)}</td>
        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.comment}</td>
        <td><span className={`pill p-${review.status === 'approved' ? 'g' : 'y'}`}>{review.status}</span></td>
        <td style={{ fontSize: '11px', display: 'flex', gap: '4px' }}>
            {review.status === 'pending' && <button onClick={() => onApprove(review.id)} className="s-btn">Approve</button>}
            <button onClick={() => onDelete(review.id)} className="s-btn">Delete</button>
        </td>
    </tr>
));

function ReviewsPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [page, setPage] = useState(1);
    const [toDelete, setToDelete] = useState(null);
    const [filter, setFilter] = useState('all');

    const handlePageChange = useCallback((newPage) => setPage(newPage), []);
    const handleFilterChange = useCallback((e) => { setFilter(e.target.value); setPage(1); }, []);
    const handleDeleteClick = useCallback((id) => setToDelete(id), []);
    const handleDeleteCancel = useCallback(() => setToDelete(null), []);

    const { data: { data: reviews = [], total = 0, last_page = 1 } = {}, refetch } = useQuery({
        queryKey: ['admin-reviews', page, filter],
        queryFn: async () => {
            const { data } = await api.get('/admin/reviews', { params: { page, status: filter } });
            return data.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/reviews/${id}`),
        onSuccess: () => { addToast?.('Review deleted', 'success'); refetch(); handleDeleteCancel(); },
    });

    const approveMutation = useMutation({
        mutationFn: (id) => api.patch(`/admin/reviews/${id}`, { status: 'approved' }),
        onSuccess: () => { addToast?.('Review approved', 'success'); refetch(); },
    });

    return (
        <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <select value={filter} onChange={handleFilterChange} className="form-input">
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
                                <ReviewRow 
                                    key={review.id}
                                    review={review}
                                    onDelete={handleDeleteClick}
                                    onApprove={(id) => approveMutation.mutate(id)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState icon="⭐" title="No reviews found" />
            )}

            {last_page > 1 && <Pagination currentPage={page} totalPages={last_page} onPageChange={handlePageChange} totalResults={total} />}

            <ConfirmationDialog isOpen={!!toDelete} title="Delete review?" isDangerous confirmLabel="Delete" onConfirm={() => deleteMutation.mutate(toDelete)} onCancel={handleDeleteCancel} />
        </>
    );
}

export default memo(ReviewsPage);
