import { useContext, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Skeleton from '../../components/ui/Skeleton';

export default function ProfilePage() {
    const { addToast } = useContext(ToastContext) || {};
    const [profile, setProfile] = useState({
        business_name: '',
        business_type: '',
        province: 'Batangas',
        municipality: '',
        address: '',
        contact_number: '',
        website_url: '',
        facebook_url: '',
        description: '',
        lgu_affiliation: '',
    });

    const { data: profileData, isLoading } = useQuery({
        queryKey: ['provider-profile'],
        queryFn: async () => {
            const { data } = await api.get('/provider/profile');
            return data.data;
        },
        onSuccess: (data) => {
            if (data) {
                setProfile({
                    business_name: data.business_name || '',
                    business_type: data.business_type || '',
                    province: data.province || 'Batangas',
                    municipality: data.municipality || '',
                    address: data.address || '',
                    contact_number: data.contact_number || '',
                    website_url: data.website_url || '',
                    facebook_url: data.facebook_url || '',
                    description: data.description || '',
                    lgu_affiliation: data.lgu_affiliation || '',
                });
            }
        },
        retry: 1,
    });

    const saveMutation = useMutation({
        mutationFn: () => api.put('/provider/profile', profile),
        onSuccess: () => {
            addToast?.('Profile updated successfully', 'success');
        },
        onError: () => {
            addToast?.('Failed to save profile', 'error');
        },
    });

    if (isLoading) return <Skeleton height="400px" />;

    return (
        <>
            {profileData?.is_verified !== undefined && (
                <div 
                    style={{
                        padding: '12px 16px',
                        background: profileData.is_verified ? 'rgba(76, 175, 80, 0.1)' : 'rgba(192, 160, 48, 0.1)',
                        border: `1px solid ${profileData.is_verified ? 'rgba(76, 175, 80, 0.3)' : 'rgba(192, 160, 48, 0.3)'}`,
                        borderRadius: 'var(--r)',
                        marginBottom: '16px',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ fontSize: '18px' }}>
                        {profileData.is_verified ? '✓' : '⏳'}
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--i)' }}>
                            {profileData.is_verified ? 'Verified Business' : 'Pending Verification'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--i4)', marginTop: '2px' }}>
                            {profileData.is_verified
                                ? `Verified on ${new Date(profileData.verified_at).toLocaleDateString()}`
                                : 'Your profile is under review by the Doon team'}
                        </div>
                    </div>
                </div>
            )}

            <div className="dc mb16 sr">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Business Information</div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Business Name *</label>
                        <input 
                            type="text" 
                            value={profile.business_name} 
                            onChange={(e) => setProfile({...profile, business_name: e.target.value})} 
                            className="form-input" 
                        />
                    </div>
                    <div>
                        <label className="form-label">Business Type *</label>
                        <input 
                            type="text" 
                            value={profile.business_type} 
                            onChange={(e) => setProfile({...profile, business_type: e.target.value})} 
                            className="form-input" 
                        />
                    </div>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Province *</label>
                        <select 
                            value={profile.province} 
                            onChange={(e) => setProfile({...profile, province: e.target.value})} 
                            className="form-input"
                        >
                            {['Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'].map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Municipality *</label>
                        <input 
                            type="text" 
                            value={profile.municipality} 
                            onChange={(e) => setProfile({...profile, municipality: e.target.value})} 
                            className="form-input" 
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">Full Address *</label>
                    <textarea 
                        value={profile.address} 
                        onChange={(e) => setProfile({...profile, address: e.target.value})} 
                        className="form-input" 
                        style={{ minHeight: '60px' }} 
                    />
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Contact Number *</label>
                        <input 
                            type="tel" 
                            value={profile.contact_number} 
                            onChange={(e) => setProfile({...profile, contact_number: e.target.value})} 
                            className="form-input" 
                        />
                    </div>
                    <div>
                        <label className="form-label">Website</label>
                        <input 
                            type="url" 
                            value={profile.website_url} 
                            onChange={(e) => setProfile({...profile, website_url: e.target.value})} 
                            className="form-input" 
                        />
                    </div>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Facebook Page</label>
                        <input 
                            type="url" 
                            value={profile.facebook_url} 
                            onChange={(e) => setProfile({...profile, facebook_url: e.target.value})} 
                            className="form-input" 
                        />
                    </div>
                    <div>
                        <label className="form-label">LGU Affiliation</label>
                        <input 
                            type="text" 
                            value={profile.lgu_affiliation} 
                            onChange={(e) => setProfile({...profile, lgu_affiliation: e.target.value})} 
                            className="form-input" 
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Business Description</label>
                    <textarea 
                        value={profile.description} 
                        onChange={(e) => setProfile({...profile, description: e.target.value})} 
                        className="form-input" 
                        style={{ minHeight: '100px' }} 
                    />
                </div>

                <button 
                    onClick={() => saveMutation.mutate()} 
                    className="s-btn dark"
                    disabled={saveMutation.isPending}
                >
                    {saveMutation.isPending ? 'Saving...' : '💾 Save Profile'}
                </button>
            </div>
        </>
    );
}
