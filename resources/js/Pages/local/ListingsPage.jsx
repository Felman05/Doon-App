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
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: listings = [], isLoading, refetch } = useQuery({
        queryKey: ['provider-listings'],
        queryFn: async () => {
            const { data } = await api.get('/provider/listings');
            return data.data ?? [];
        },
        retry: 1,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/provider-listings/${id}`),
        onSuccess: () => {
            addToast?.('Listing deleted', 'success');
            refetch();
            setToDelete(null);
        },
        onError: () => {
            addToast?.('Failed to delete listing', 'error');
        },
    });

    // Filter listings by status
    const filteredListings = statusFilter === 'all'
        ? listings
        : listings.filter(l => l.status === statusFilter);

    const statusCounts = {
        all: listings.length,
        active: listings.filter(l => l.status === 'active').length,
        pending: listings.filter(l => l.status === 'pending').length,
        rejected: listings.filter(l => l.status === 'rejected').length,
    };

    if (isLoading) {
        return <Skeleton height="300px" />;
    }

    return (
        <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <a href="/provider/listings/new" className="s-btn dark">
                    ➕ Add New Listing
                </a>
            </div>

            {/* Status Filter Tabs */}
            {listings.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--bd)' }}>
                    {['all', 'active', 'pending', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            style={{
                                padding: '10px 16px',
                                background: 'none',
                                border: 'none',
                                borderBottom: statusFilter === status ? '2px solid var(--pr)' : '2px solid transparent',
                                color: statusFilter === status ? 'var(--pr)' : 'var(--i4)',
                                cursor: 'pointer',
                                fontWeight: statusFilter === status ? '600' : '400',
                                textTransform: 'capitalize',
                                fontSize: '13px',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {status === 'all' ? 'All' : status}
                            <span style={{ marginLeft: '6px', opacity: 0.7 }}>
                                ({statusCounts[status]})
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {filteredListings.length ? (
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
                            {filteredListings.map(listing => (
                                <tr key={listing.id}>
                                    <td style={{ fontWeight: '600' }}>{listing.listing_title || listing.destination?.name || '-'}</td>
                                    <td>{listing.listing_type || '-'}</td>
                                    <td>₱{listing.price}</td>
                                    <td>{listing.capacity}</td>
                                    <td>
                                        <span className={`pill ${listing.status === 'active' ? 'p-g' : listing.status === 'pending' ? 'p-y' : listing.status === 'rejected' ? 'p-r' : 'p-n'}`}>
                                            {listing.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <a href={`#/provider/listings/${listing.id}/edit`} className="s-btn" style={{ fontSize: '11px', textDecoration: 'none' }}>
                                                Edit
                                            </a>
                                            <button onClick={() => setToDelete(listing.id)} className="s-btn" style={{ fontSize: '11px' }}>
                                                Delete
                                            </button>
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
