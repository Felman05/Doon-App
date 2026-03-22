import { useState, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Skeleton from '../../components/ui/Skeleton';

export default function PackingPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [selectedDestId, setSelectedDestId] = useState('');
    const [selectedWeather, setSelectedWeather] = useState('clear');

    const { data: packing } = useQuery({
        queryKey: ['packing', selectedDestId, selectedWeather],
        queryFn: async () => {
            if (!selectedDestId) return null;
            const { data } = await api.get('/packing', {
                params: {
                    category_id: selectedDestId,
                    weather_condition: selectedWeather,
                },
            });
            return data.data;
        },
        enabled: !!selectedDestId,
    });

    const categories = [
        { id: 'beach', label: 'Beach', icon: '🏖️' },
        { id: 'mountain', label: 'Mountain', icon: '⛰️' },
        { id: 'city', label: 'City', icon: '🏙️' },
        { id: 'adventure', label: 'Adventure', icon: '🧗' },
    ];

    const weatherOpts = [
        { id: 'clear', label: 'Clear/Sunny' },
        { id: 'rainy', label: 'Rainy' },
        { id: 'hot', label: 'Hot' },
        { id: 'cold', label: 'Cold' },
    ];

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <div className="dc mb16 sr">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Select Destination Type</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedDestId(cat.id)}
                            style={{
                                padding: '16px 12px',
                                borderRadius: 'var(--r2)',
                                border: `1.5px solid ${selectedDestId === cat.id ? 'var(--ac)' : 'var(--bd)'}`,
                                background: selectedDestId === cat.id ? 'var(--acb)' : 'var(--bg)',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all .2s',
                            }}
                        >
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{cat.icon}</div>
                            <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--i)' }}>{cat.label}</div>
                        </button>
                    ))}
                </div>

                <div className="dc-title" style={{ marginBottom: '16px' }}>Weather Condition</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {weatherOpts.map(w => (
                        <button
                            key={w.id}
                            onClick={() => setSelectedWeather(w.id)}
                            className={`s-btn ${selectedWeather === w.id ? 'dark' : ''}`}
                        >
                            {w.label}
                        </button>
                    ))}
                </div>
            </div>

            {selectedDestId && packing && (
                <div className="dc mb16 sr d1">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div className="dc-title">Packing List</div>
                        <button onClick={handlePrint} className="s-btn">🖨️ Print</button>
                    </div>

                    {packing.essentials && (
                        <>
                            <div className="sub-lbl">Essentials</div>
                            <div className="pack-row" style={{ marginBottom: '16px' }}>
                                {packing.essentials.map((item, i) => (
                                    <span key={i} className="pack-chip ess">{item}</span>
                                ))}
                            </div>
                        </>
                    )}

                    {packing.recommended && (
                        <>
                            <div className="sub-lbl">Recommended</div>
                            <div className="pack-row" style={{ marginBottom: '16px' }}>
                                {packing.recommended.map((item, i) => (
                                    <span key={i} className="pack-chip">{item}</span>
                                ))}
                            </div>
                        </>
                    )}

                    {packing.tip && (
                        <div style={{ padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--r2)', fontSize: '13px', color: 'var(--i3)', lineHeight: '1.6' }}>
                            <strong>💡 Tip:</strong> {packing.tip}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
