import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';

export default function MediaManagementPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [page, setPage] = useState(1);
    const [toDelete, setToDelete] = useState(null);
    const fileInputRef = useState(null)[1];

    const { data: { data: files = [], total = 0, last_page = 1 } = {}, refetch } = useQuery({
        queryKey: ['admin-media', page],
        queryFn: async () => {
            const { data } = await api.get('/admin/media', { params: { page } });
            return data.data;
        },
    });

    const uploadMutation = useMutation({
        mutationFn: (formData) => api.post('/admin/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
        onSuccess: () => { addToast?.('File uploaded', 'success'); refetch(); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/media/${id}`),
        onSuccess: () => { addToast?.('File deleted', 'success'); refetch(); setToDelete(null); },
    });

    const handleFileUpload = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            const formData = new FormData();
            Array.from(files).forEach(file => formData.append('files[]', file));
            uploadMutation.mutate(formData);
        }
    };

    return (
        <>
            <div style={{ marginBottom: '16px' }}>
                <input onChange={handleFileUpload} ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} />
                <button onClick={() => fileInputRef?.click?.()} className="s-btn dark">📤 Upload Files</button>
            </div>

            {files.length ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                    {files.map(file => (
                        <div key={file.id} style={{ background: 'var(--wh)', borderRadius: 'var(--r2)', border: '1px solid var(--bd)', overflow: 'hidden' }}>
                            <img src={file.url} alt={file.filename} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                            <div style={{ padding: '8px' }}>
                                <p style={{ fontSize: '12px', margin: '0 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.filename}</p>
                                <button onClick={() => setToDelete(file.id)} className="s-btn" style={{ fontSize: '11px', width: '100%' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState icon="🖼️" title="No media files" />
            )}

            {last_page > 1 && <Pagination currentPage={page} totalPages={last_page} onPageChange={setPage} totalResults={total} />}

            <ConfirmationDialog isOpen={!!toDelete} title="Delete file?" isDangerous confirmLabel="Delete" onConfirm={() => deleteMutation.mutate(toDelete)} onCancel={() => setToDelete(null)} />
        </>
    );
}
