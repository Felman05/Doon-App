import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import Pagination from '../../components/ui/Pagination';

export default function PromoCodesPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [page, setPage] = useState(1);
    const [toDelete, setToDelete] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        max_uses: null,
        expiry_date: '',
    });

    const { data: { data: promoCodes = [], total = 0, last_page = 1 } = {}, refetch } = useQuery({
        queryKey: ['admin-promo-codes', page],
        queryFn: async () => {
            const { data } = await api.get('/admin/promo-codes', { params: { page } });
            return data.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/admin/promo-codes', data),
        onSuccess: () => { addToast?.('Promo code created', 'success'); setFormData({ code: '', discount_type: 'percentage', discount_value: 0, max_uses: null, expiry_date: '' }); refetch(); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/promo-codes/${id}`),
        onSuccess: () => { addToast?.('Promo code deleted', 'success'); refetch(); setToDelete(null); },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    return (
        <>
            <form onSubmit={handleSubmit} style={{ background: 'var(--wh)', padding: '20px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)', marginBottom: '20px' }}>
                <h3>Create Promo Code</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <input 
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="Code"
                        className="form-input"
                        required
                    />
                    <select value={formData.discount_type} onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })} className="form-input">
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                    </select>
                    <input 
                        type="number"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                        placeholder="Value"
                        className="form-input"
                        required
                    />
                    <input 
                        type="number"
                        value={formData.max_uses || ''}
                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Max Uses (optional)"
                        className="form-input"
                    />
                    <input 
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                        className="form-input"
                    />
                </div>
                <button type="submit" className="s-btn dark">Create Code</button>
            </form>

            {promoCodes.length ? (
                <div style={{ borderRadius: 'var(--r2)', border: '1px solid var(--bd)', overflow: 'hidden', background: 'var(--wh)' }}>
                    <table className="d-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Uses</th>
                                <th>Expiry</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promoCodes.map(promo => (
                                <tr key={promo.id}>
                                    <td><strong>{promo.code}</strong></td>
                                    <td>{promo.discount_value}{promo.discount_type === 'percentage' ? '%' : ' $'}</td>
                                    <td>{promo.uses_count}/{promo.max_uses || '∞'}</td>
                                    <td>{promo.expiry_date ? new Date(promo.expiry_date).toLocaleDateString() : 'Never'}</td>
                                    <td>
                                        <button onClick={() => setToDelete(promo.id)} className="s-btn" style={{ fontSize: '11px' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState icon="🎟️" title="No promo codes" />
            )}

            {last_page > 1 && <Pagination currentPage={page} totalPages={last_page} onPageChange={setPage} totalResults={total} />}

            <ConfirmationDialog isOpen={!!toDelete} title="Delete promo code?" isDangerous confirmLabel="Delete" onConfirm={() => deleteMutation.mutate(toDelete)} onCancel={() => setToDelete(null)} />
        </>
    );
}
