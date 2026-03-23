import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

export default function PackingList({ destination, weather = [] }) {
    const [saved, setSaved] = useState(false);

    const weatherCondition = useMemo(() => {
        if (!destination) {
            return 'any';
        }

        const provinceName = destination.province?.name || destination.province;
        const provinceWeather = weather.find((w) => w.province === provinceName);
        const temp = Number(provinceWeather?.temperature);
        const cond = String(provinceWeather?.condition || '').toLowerCase();

        if (!Number.isNaN(temp) && temp >= 30) return 'sunny';
        if (cond.includes('rain')) return 'rainy';
        if (!Number.isNaN(temp) && temp <= 20) return 'cold';
        return 'any';
    }, [destination, weather]);

    const { data, isLoading } = useQuery({
        queryKey: ['packing', destination?.id, destination?.category?.id, weatherCondition],
        queryFn: async () => {
            const { data } = await api.get('/packing', {
                params: {
                    category_id: destination?.category?.id,
                    weather_condition: weatherCondition,
                },
            });
            return data.data;
        },
        enabled: Boolean(destination),
    });

    useEffect(() => {
        if (!saved) {
            return;
        }
        const timer = setTimeout(() => setSaved(false), 2000);
        return () => clearTimeout(timer);
    }, [saved]);

    if (!destination) {
        return (
            <div style={{ textAlign: 'center', padding: '18px', color: 'var(--i4)' }}>
                Select a destination to get your personalized packing list
            </div>
        );
    }

    const saveList = () => {
        if (!data) {
            return;
        }
        localStorage.setItem(`doon_packing_${destination.id}`, JSON.stringify(data));
        setSaved(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <button type="button" className="s-btn" onClick={saveList}>{saved ? 'Saved ✓' : 'Save list'}</button>
            </div>

            {isLoading ? (
                <div className="shimmer" style={{ minHeight: '120px', borderRadius: 'var(--r2)' }} />
            ) : (
                <>
                    <div className="sub-lbl">Essential</div>
                    <div className="pack-row" style={{ marginBottom: '10px' }}>
                        {(data?.essential ?? []).map((item, idx) => (
                            <span key={`e-${idx}`} className="pack-chip ess">{item.item}</span>
                        ))}
                    </div>

                    <div className="sub-lbl">Recommended</div>
                    <div className="pack-row" style={{ marginBottom: '10px' }}>
                        {(data?.recommended ?? []).map((item, idx) => (
                            <span key={`r-${idx}`} className="pack-chip">{item.item}</span>
                        ))}
                    </div>

                    <div className="sub-lbl">Wardrobe tip</div>
                    <p style={{ fontSize: '12px', color: 'var(--i3)', lineHeight: '1.5' }}>{data?.wardrobe_tip || 'Dress comfortably for the destination weather.'}</p>
                </>
            )}
        </div>
    );
}
