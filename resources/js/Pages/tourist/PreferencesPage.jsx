import { useContext, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Skeleton from '../../components/ui/Skeleton';

export default function PreferencesPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [prefs, setPrefs] = useState({
        generational_profile: null,
        preferred_budget: null,
        preferred_travel_style: null,
        preferred_provinces: [],
        preferred_themes: [],
        location_tracking: false,
    });

    const { data: profile, isLoading } = useQuery({
        queryKey: ['preferences'],
        queryFn: async () => {
            const { data } = await api.get('/auth/me');
            return data.data?.preferences;
        },
        onSuccess: (data) => {
            if (data) setPrefs(data);
        },
    });

    const saveMutation = useMutation({
        mutationFn: () => api.put('/auth/preferences', prefs),
        onSuccess: () => addToast?.('Preferences saved!', 'success'),
        onError: () => addToast?.('Failed to save preferences', 'error'),
    });

    if (isLoading) return <Skeleton height="300px" />;

    const profileOptions = ['Gen Z', 'Millennial', 'Gen X', 'Boomer'];
    const budgetOptions = ['Free', 'Budget', 'Mid-range', 'Luxury'];
    const styleOptions = ['Solo', 'Couple', 'Family', 'Group'];
    const provinces = ['Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'];
    const themes = ['Beach', 'Mountain', 'Culture', 'Food', 'Adventure', 'Nature', 'City', 'Heritage', 'Water Sports', 'Wellness'];

    return (
        <>
            <div className="dc mb16 sr">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Generational Profile</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {profileOptions.map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', padding: '10px', borderRadius: 'var(--r)', background: prefs.generational_profile === opt ? 'var(--acb)' : 'var(--bg)', border: '1px solid var(--bd)' }}>
                            <input type="radio" name="profile" checked={prefs.generational_profile === opt} onChange={() => setPrefs({...prefs, generational_profile: opt})} />
                            {opt}
                        </label>
                    ))}
                </div>
            </div>

            <div className="dc mb16 sr d1">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Preferred Budget</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {budgetOptions.map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', padding: '10px', borderRadius: 'var(--r)', background: prefs.preferred_budget === opt ? 'var(--acb)' : 'var(--bg)', border: '1px solid var(--bd)' }}>
                            <input type="radio" name="budget" checked={prefs.preferred_budget === opt} onChange={() => setPrefs({...prefs, preferred_budget: opt})} />
                            {opt}
                        </label>
                    ))}
                </div>
            </div>

            <div className="dc mb16 sr d1">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Travel Style</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {styleOptions.map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', padding: '10px', borderRadius: 'var(--r)', background: prefs.preferred_travel_style === opt ? 'var(--acb)' : 'var(--bg)', border: '1px solid var(--bd)' }}>
                            <input type="radio" name="style" checked={prefs.preferred_travel_style === opt} onChange={() => setPrefs({...prefs, preferred_travel_style: opt})} />
                            {opt}
                        </label>
                    ))}
                </div>
            </div>

            <div className="dc mb16 sr d2">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Preferred Provinces</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {provinces.map(prov => (
                        <label key={prov} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', padding: '8px 12px', borderRadius: '100px', background: prefs.preferred_provinces?.includes(prov) ? 'var(--acb)' : 'var(--bg)', border: '1px solid var(--bd)' }}>
                            <input type="checkbox" checked={prefs.preferred_provinces?.includes(prov) || false} onChange={() => {
                                const updated = prefs.preferred_provinces?.includes(prov) ? prefs.preferred_provinces.filter(p => p !== prov) : [...(prefs.preferred_provinces || []), prov];
                                setPrefs({...prefs, preferred_provinces: updated});
                            }} />
                            {prov}
                        </label>
                    ))}
                </div>
            </div>

            <div className="dc mb16 sr d3">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Preferred Themes</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {themes.map(theme => (
                        <label key={theme} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', padding: '8px 12px', borderRadius: '100px', background: prefs.preferred_themes?.includes(theme) ? 'var(--acb)' : 'var(--bg)', border: '1px solid var(--bd)' }}>
                            <input type="checkbox" checked={prefs.preferred_themes?.includes(theme) || false} onChange={() => {
                                const updated = prefs.preferred_themes?.includes(theme) ? prefs.preferred_themes.filter(t => t !== theme) : [...(prefs.preferred_themes || []), theme];
                                setPrefs({...prefs, preferred_themes: updated});
                            }} />
                            {theme}
                        </label>
                    ))}
                </div>
            </div>

            <div className="dc mb16 sr d4">
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={prefs.location_tracking || false} onChange={() => setPrefs({...prefs, location_tracking: !prefs.location_tracking})} style={{ marginTop: '4px', accentColor: 'var(--ac)' }} />
                    <div>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>Location Tracking Consent</div>
                        <p style={{ fontSize: '12px', color: 'var(--i4)', lineHeight: '1.5' }}>
                            Allow us to use your location to provide better recommendations (optional).
                        </p>
                    </div>
                </label>
            </div>

            <button onClick={() => saveMutation.mutate()} className="s-btn dark">
                💾 Save Preferences
            </button>
        </>
    );
}
