import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export default function ListingsPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [toDelete, setToDelete] = useState(null);

    const { data: listings = [], isLoading, refetch } = useQuery({
        queryKey: ['provider-listings'],
        queryFn: async () => {
            const { data } = await api.get('/provider/listings');
            return data.data ?? [];
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/provider/listings/${id}`),
        onSuccess: () => {
            addToast?.('Listing deleted', 'success');
            refetch();
            setToDelete(null);
        },
    });

    const toggleMutation = useMutation({
        mutationFn: (id) => api.put(`/provider/listings/${id}`, {}),
        onSuccess: () => {
            addToast?.('Listing updated', 'success');
            refetch();
        },
    });

    if (isLoading) {
        return <Skeleton height="300px" />;
    }

    return (
        <>
            <a href="/provider/listings/new" className="s-btn dark" style={{ marginBottom: '16px' }}>
                ➕ Add New Listing
            </a>

            {listings.length ? (
                <div className="d-table" style={{ borderRadius: 'var(--r2)', border: '1px solid var(--bd)', overflow: 'hidden', background: 'var(--wh)' }}>
                    <table className="d-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings.map(listing => (
                                <tr key={listing.id}>
                                    <td style={{ fontWeight: '600' }}>{listing.title}</td>
                                    <td>{listing.type}</td>
                                    <td>₱{listing.price}</td>
                                    <td>{listing.capacity}</td>
                                    <td>
                                        <span className={`pill p-${listing.status === 'active' ? 'g' : listing.status === 'pending' ? 'y' : 'n'}`}>
                                            {listing.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="s-btn" style={{ fontSize: '11px' }}>Edit</button>
                                            <button onClick={() => setToDelete(listing.id)} className="s-btn" style={{ fontSize: '11px' }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState
                    icon="🏢"
                    title="No listings yet"
                    message="Create your first listing to start accepting bookings."
                    action={() => window.location.href = '/provider/listings/new'}
                    actionLabel="Create Listing"
                />
            )}

            <ConfirmationDialog
                isOpen={!!toDelete}
                title="Delete listing?"
                message="This action cannot be undone."
                confirmLabel="Delete"
                isDangerous
                onConfirm={() => deleteMutation.mutate(toDelete)}
                onCancel={() => setToDelete(null)}
            />
        </>
    );
}
