import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState, useCallback, memo } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';

const CategoryCard = memo(({ cat, onEdit, onDelete }) => (
    <div style={{ background: 'var(--wh)', padding: '16px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
                <h4>{cat.name}</h4>
                <p style={{ fontSize: '14px', color: 'var(--tx2)', margin: '4px 0 0 0' }}>{cat.description}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => onEdit(cat)} className="s-btn" style={{ fontSize: '11px' }}>Edit</button>
                <button onClick={() => onDelete(cat.id)} className="s-btn" style={{ fontSize: '11px' }}>Delete</button>
            </div>
        </div>
    </div>
));

function CategoriesPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [toDelete, setToDelete] = useState(null);

    const handleNameChange = useCallback((e) => setFormData(prev => ({ ...prev, name: e.target.value })), []);
    const handleDescriptionChange = useCallback((e) => setFormData(prev => ({ ...prev, description: e.target.value })), []);
    const handleCancel = useCallback(() => { setEditingId(null); setFormData({ name: '', description: '' }); }, []);
    const handleEditClick = useCallback((cat) => { setEditingId(cat.id); setFormData({ name: cat.name, description: cat.description }); }, []);
    const handleDeleteClick = useCallback((id) => setToDelete(id), []);
    const handleDeleteCancel = useCallback(() => setToDelete(null), []);

    const { data: categories = [], refetch } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: async () => {
            const { data } = await api.get('/admin/categories');
            return data.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/admin/categories', data),
        onSuccess: () => { addToast?.('Category created', 'success'); setFormData({ name: '', description: '' }); refetch(); },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }) => api.patch(`/admin/categories/${id}`, data),
        onSuccess: () => { addToast?.('Category updated', 'success'); handleCancel(); refetch(); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/categories/${id}`),
        onSuccess: () => { addToast?.('Category deleted', 'success'); refetch(); handleDeleteCancel(); },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            updateMutation.mutate({ id: editingId, ...formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} style={{ background: 'var(--wh)', padding: '20px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)', marginBottom: '20px' }}>
                <h3>{editingId ? 'Edit' : 'Add'} Category</h3>
                <input 
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Category name"
                    className="form-input"
                    required
                    style={{ marginBottom: '12px' }}
                />
                <textarea 
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Description"
                    className="form-input"
                    rows="2"
                    style={{ marginBottom: '12px' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="s-btn dark">{editingId ? 'Update' : 'Create'}</button>
                    {editingId && <button type="button" onClick={handleCancel} className="s-btn">Cancel</button>}
                </div>
            </form>

            {categories.length ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {categories.map(cat => (
                        <CategoryCard 
                            key={cat.id} 
                            cat={cat}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState icon="📂" title="No categories" />
            )}

            <ConfirmationDialog isOpen={!!toDelete} title="Delete category?" isDangerous confirmLabel="Delete" onConfirm={() => deleteMutation.mutate(toDelete)} onCancel={handleDeleteCancel} />
        </>
    );
}

export default memo(CategoriesPage);
