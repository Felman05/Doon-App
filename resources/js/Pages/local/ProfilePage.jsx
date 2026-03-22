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
        contact: '',
        website: '',
        facebook: '',
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
            if (data) setProfile(data);
        },
    });

    const saveMutation = useMutation({
        mutationFn: () => api.put('/provider/profile', profile),
        onSuccess: () => addToast?.('Profile updated!', 'success'),
        onError: () => addToast?.('Failed to update profile', 'error'),
    });

    if (isLoading) return <Skeleton height="400px" />;

    return (
        <>
            <div className="dc mb16 sr">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Business Information</div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Business Name *</label>
                        <input type="text" value={profile.business_name} onChange={(e) => setProfile({...profile, business_name: e.target.value})} className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Business Type *</label>
                        <input type="text" value={profile.business_type} onChange={(e) => setProfile({...profile, business_type: e.target.value})} className="form-input" />
                    </div>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Province *</label>
                        <select value={profile.province} onChange={(e) => setProfile({...profile, province: e.target.value})} className="form-input">
                            {['Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'].map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Municipality *</label>
                        <input type="text" value={profile.municipality} onChange={(e) => setProfile({...profile, municipality: e.target.value})} className="form-input" />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">Full Address *</label>
                    <textarea value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} className="form-input" style={{ minHeight: '60px' }} />
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Contact Number *</label>
                        <input type="tel" value={profile.contact} onChange={(e) => setProfile({...profile, contact: e.target.value})} className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Website</label>
                        <input type="url" value={profile.website} onChange={(e) => setProfile({...profile, website: e.target.value})} className="form-input" />
                    </div>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Facebook Page</label>
                        <input type="url" value={profile.facebook} onChange={(e) => setProfile({...profile, facebook: e.target.value})} className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">LGU Affiliation</label>
                        <input type="text" value={profile.lgu_affiliation} onChange={(e) => setProfile({...profile, lgu_affiliation: e.target.value})} className="form-input" />
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Business Description</label>
                    <textarea value={profile.description} onChange={(e) => setProfile({...profile, description: e.target.value})} className="form-input" style={{ minHeight: '100px' }} />
                </div>

                <button onClick={() => saveMutation.mutate()} className="s-btn dark">
                    💾 Save Profile
                </button>
            </div>

            <div className="dc sr d1">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Verification Status</div>
                {profileData?.is_verified ? (
                    <div style={{ padding: '20px 0', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ac)', marginBottom: '4px' }}>Verified</div>
                        <p style={{ fontSize: '12px', color: 'var(--i4)' }}>Your business is verified and can receive bookings.</p>
                    </div>
                ) : (
                    <div style={{ padding: '20px 0', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#c0a030', marginBottom: '4px' }}>Pending Verification</div>
                        <p style={{ fontSize: '12px', color: 'var(--i4)' }}>Admin is reviewing your business. This usually takes 1–2 days.</p>
                    </div>
                )}
            </div>
        </>
    );
}
