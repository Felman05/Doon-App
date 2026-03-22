import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Pagination from '../../components/ui/Pagination';

export default function NotificationsPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [page, setPage] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        recipient_type: 'all',
        send_email: true,
    });

    const { data: { data: notifications = [], total = 0, last_page = 1 } = {} } = useQuery({
        queryKey: ['admin-notifications', page],
        queryFn: async () => {
            const { data } = await api.get('/admin/notifications', { params: { page } });
            return data.data;
        },
    });

    const sendMutation = useMutation({
        mutationFn: (data) => api.post('/admin/notifications/send', data),
        onSuccess: () => { 
            addToast?.('Notification sent', 'success'); 
            setFormData({ title: '', message: '', recipient_type: 'all', send_email: true });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMutation.mutate(formData);
    };

    return (
        <>
            <form onSubmit={handleSubmit} style={{ background: 'var(--wh)', padding: '20px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)', marginBottom: '20px' }}>
                <h3>Send Notification</h3>
                <div style={{ marginBottom: '12px' }}>
                    <label className="form-label">Title</label>
                    <input 
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="form-input"
                        required
                    />
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <label className="form-label">Message</label>
                    <textarea 
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="form-input"
                        rows="3"
                        required
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                        <label className="form-label">Send To</label>
                        <select value={formData.recipient_type} onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value })} className="form-input">
                            <option value="all">All Users</option>
                            <option value="admins">Admins Only</option>
                            <option value="users">Regular Users</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <input 
                                type="checkbox"
                                checked={formData.send_email}
                                onChange={(e) => setFormData({ ...formData, send_email: e.target.checked })}
                            />
                            <span style={{ fontSize: '14px' }}>Send email</span>
                        </label>
                    </div>
                </div>
                <button type="submit" className="s-btn dark">Send Notification</button>
            </form>

            <div style={{ background: 'var(--wh)', padding: '20px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)' }}>
                <h3 style={{ marginBottom: '16px' }}>Recent Notifications</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {notifications.map(notif => (
                        <div key={notif.id} style={{ padding: '12px', borderBottom: '1px solid var(--bd)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h5 style={{ margin: '0 0 4px 0' }}>{notif.title}</h5>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--tx2)' }}>{notif.message}</p>
                                    <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>{new Date(notif.sent_at).toLocaleString()}</span>
                                </div>
                                <span className={`pill p-${notif.sent_count > 0 ? 'g' : 'y'}`}>{notif.sent_count} sent</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {last_page > 1 && <Pagination currentPage={page} totalPages={last_page} onPageChange={setPage} totalResults={total} />}
        </>
    );
}
