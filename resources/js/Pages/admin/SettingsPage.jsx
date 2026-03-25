import { useMutation, useQuery } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';

export default function SettingsPage() {
    const { addToast } = useContext(ToastContext) || {};
    const defaultFormData = {
        app_name: '',
        app_email: '',
        app_phone: '',
        app_address: '',
        maintenance_mode: false,
    };
    const [formData, setFormData] = useState(defaultFormData);

    const { isLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: async () => {
            const { data } = await api.get('/admin/settings');

            const payload = data?.data?.data ?? data?.data ?? {};
            const normalized = {
                ...defaultFormData,
                ...(typeof payload === 'object' && payload !== null ? payload : {}),
            };

            setFormData(normalized);
            return normalized;
        },
        onError: () => {
            setFormData(defaultFormData);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data) => api.post('/admin/settings', data),
        onSuccess: () => { addToast?.('Settings saved', 'success'); },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
            <div style={{ marginBottom: '16px' }}>
                <label className="form-label">App Name</label>
                <input 
                    value={formData.app_name}
                    onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                    className="form-input"
                    type="text"
                    required
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label className="form-label">App Email</label>
                <input 
                    value={formData.app_email}
                    onChange={(e) => setFormData({ ...formData, app_email: e.target.value })}
                    className="form-input"
                    type="email"
                    required
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Phone</label>
                <input 
                    value={formData.app_phone}
                    onChange={(e) => setFormData({ ...formData, app_phone: e.target.value })}
                    className="form-input"
                    type="tel"
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Address</label>
                <textarea 
                    value={formData.app_address}
                    onChange={(e) => setFormData({ ...formData, app_address: e.target.value })}
                    className="form-input"
                    rows="3"
                />
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                    id="maintenance"
                    checked={formData.maintenance_mode}
                    onChange={(e) => setFormData({ ...formData, maintenance_mode: e.target.checked })}
                    type="checkbox"
                />
                <label htmlFor="maintenance" className="form-label" style={{ margin: 0 }}>Enable Maintenance Mode</label>
            </div>

            <button type="submit" className="s-btn dark">Save Settings</button>
        </form>
    );
}
