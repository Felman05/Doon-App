import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';

export default function BookingsPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('all');

    const { data: { data: bookings = [], total = 0, last_page = 1 } = {}, isLoading } = useQuery({
        queryKey: ['admin-bookings', page, filter],
        queryFn: async () => {
            const { data } = await api.get('/admin/bookings', { params: { page, status: filter } });
            return data.data;
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => api.patch(`/admin/bookings/${id}`, { status }),
        onSuccess: () => { addToast?.('Booking updated', 'success'); },
    });

    return (
        <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="form-input" style={{ width: '120px' }}>
                    <option value="all">All Bookings</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {bookings.length ? (
                <div style={{ borderRadius: 'var(--r2)', border: '1px solid var(--bd)', overflow: 'hidden', background: 'var(--wh)' }}>
                    <table className="d-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>User</th>
                                <th>Destination</th>
                                <th>Dates</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking.id}>
                                    <td>#{booking.id}</td>
                                    <td>{booking.user?.name}</td>
                                    <td>{booking.destination?.name}</td>
                                    <td>{booking.check_in_date} → {booking.check_out_date}</td>
                                    <td><span className={`pill p-${booking.status === 'confirmed' ? 'g' : 'y'}`}>{booking.status}</span></td>
                                    <td>${booking.total_price}</td>
                                    <td>
                                        <select onChange={(e) => updateStatusMutation.mutate({ id: booking.id, status: e.target.value })} className="form-input" style={{ fontSize: '11px', padding: '4px 8px', width: '100px' }}>
                                            <option>{booking.status}</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="cancelled">Cancel</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState icon="📋" title="No bookings found" />
            )}

            {last_page > 1 && <Pagination currentPage={page} totalPages={last_page} onPageChange={setPage} totalResults={total} />}
        </>
    );
}
