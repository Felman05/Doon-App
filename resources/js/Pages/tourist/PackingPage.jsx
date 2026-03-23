import { useState } from 'react';
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

const categoryIdMap = {
    beach: 2,
    mountain: 1,
    city: 3,
    adventure: 5,
};

const weatherMap = {
    clear: 'sunny',
    rainy: 'rainy',
    hot: 'sunny',
    cold: 'cold',
};

const categoryProvinceMap = {
    beach: 'Batangas',
    mountain: 'Rizal',
    city: 'Cavite',
    adventure: 'Laguna',
};

export default function PackingPage({ weatherState }) {
    const weather = weatherState?.weather ?? [];
    const [selectedDestId, setSelectedDestId] = useState('');
    const [selectedWeather, setSelectedWeather] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('Batangas');
    const [isWeatherManuallyOverridden, setIsWeatherManuallyOverridden] = useState(false);

    const mappedCategoryId = categoryIdMap[selectedDestId] ?? null;
    const mappedWeatherCondition = weatherMap[selectedWeather] ?? null;
    const provinceWeather = useMemo(
        () => weather.find((entry) => entry.province === selectedProvince),
        [weather, selectedProvince]
    );

    useEffect(() => {
        if (!selectedDestId) {
            return;
        }

        setSelectedProvince(categoryProvinceMap[selectedDestId] || 'Batangas');
        setIsWeatherManuallyOverridden(false);
    }, [selectedDestId]);

    useEffect(() => {
        if (!selectedDestId || isWeatherManuallyOverridden || !provinceWeather) {
            return;
        }

        const condition = String(provinceWeather.condition || '').toLowerCase();
        const temperature = Number(provinceWeather.temperature);

        if (condition.includes('rain')) {
            setSelectedWeather('rainy');
            return;
        }

        if (Number.isFinite(temperature) && temperature <= 22) {
            setSelectedWeather('cold');
            return;
        }

        if (Number.isFinite(temperature) && temperature >= 30) {
            setSelectedWeather('clear');
            return;
        }

        if (condition.includes('clear')) {
            setSelectedWeather('clear');
            return;
        }

        setSelectedWeather('clear');
    }, [selectedDestId, isWeatherManuallyOverridden, provinceWeather]);

    const { data: packing, isLoading } = useQuery({
        queryKey: ['packing', selectedDestId, selectedWeather],
        queryFn: async () => {
            const { data } = await api.get('/packing', {
                params: {
                    category_id: mappedCategoryId,
                    weather_condition: mappedWeatherCondition,
                },
            });
            return data.data;
        },
        enabled: Boolean(mappedCategoryId && mappedWeatherCondition),
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

    const renderPackingLabel = (entry) => {
        if (typeof entry === 'string' || typeof entry === 'number') return String(entry);
        if (entry && typeof entry === 'object') {
            if (typeof entry.item === 'string' || typeof entry.item === 'number') return String(entry.item);
            if (typeof entry.label === 'string' || typeof entry.label === 'number') return String(entry.label);
        }
        return 'Item';
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
                <div style={{ marginBottom: '10px' }}>
                    <select
                        className="form-input"
                        value={selectedProvince}
                        onChange={(event) => {
                            setSelectedProvince(event.target.value);
                            setIsWeatherManuallyOverridden(false);
                        }}
                    >
                        {['Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'].map((province) => (
                            <option key={province} value={province}>{province}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {weatherOpts.map(w => (
                        <button
                            key={w.id}
                            onClick={() => {
                                setSelectedWeather(w.id);
                                setIsWeatherManuallyOverridden(true);
                            }}
                            className={`s-btn ${selectedWeather === w.id ? 'dark' : ''}`}
                        >
                            {w.label}
                        </button>
                    ))}
                </div>
                {selectedDestId && provinceWeather ? (
                    <div style={{ fontSize: '12px', color: 'var(--i4)', marginTop: '-8px', marginBottom: '12px' }}>
                        Auto-detected from current {selectedProvince} weather
                    </div>
                ) : null}
            </div>

            {!mappedCategoryId || !mappedWeatherCondition ? (
                <div className="dc mb16 sr d1" style={{ fontSize: '13px', color: 'var(--i4)' }}>
                    Select a destination type and weather condition to get your packing list
                </div>
            ) : null}

            {isLoading ? (
                <div className="dc mb16 sr d1" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--i3)' }}>
                    <span className="loading-spinner" />
                    Loading packing list...
                </div>
            ) : null}

            {mappedCategoryId && mappedWeatherCondition && packing && !isLoading && (
                <div className="dc mb16 sr d1">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div className="dc-title">Packing List</div>
                        <button onClick={handlePrint} className="s-btn">🖨️ Print</button>
                    </div>

                    {packing.essentials && (
                        <>
                            <div className="sub-lbl">Essential items</div>
                            <div className="pack-row" style={{ marginBottom: '16px' }}>
                                {packing.essentials.map((item, i) => (
                                    <span key={i} className="pack-chip ess">{renderPackingLabel(item)}</span>
                                ))}
                            </div>
                        </>
                    )}

                    {packing.recommended && (
                        <>
                            <div className="sub-lbl">Recommended</div>
                            <div className="pack-row" style={{ marginBottom: '16px' }}>
                                {packing.recommended.map((item, i) => (
                                    <span key={i} className="pack-chip">{renderPackingLabel(item)}</span>
                                ))}
                            </div>
                        </>
                    )}

                    {(packing.tip || packing.wardrobe_tip) && (
                        <>
                            <div className="sub-lbl">Wardrobe tip</div>
                            <p style={{ fontSize: '13px', color: 'var(--i3)', lineHeight: '1.6' }}>{packing.tip || packing.wardrobe_tip}</p>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
