import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { weatherEmoji } from '../../lib/weatherUi';

export default function WeatherStrip({ weather = [], isLoading = false, isError = false }) {
    const navigate = useNavigate();
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [selectedForecastDay, setSelectedForecastDay] = useState(null);

    const capitalize = (value) => {
        if (!value) return '';
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const selectedDetails = useMemo(() => {
        if (!selectedProvince) {
            return null;
        }

        return weather.find((row) => row?.province === selectedProvince) || null;
    }, [selectedProvince, weather]);

    useEffect(() => {
        if (!selectedProvince) {
            setForecast([]);
            setSelectedForecastDay(null);
            return;
        }

        let active = true;

        api.get('/weather/forecast', {
            params: { province: selectedProvince },
        })
            .then((response) => {
                if (!active) {
                    return;
                }
                const rows = Array.isArray(response?.data?.data) ? response.data.data : [];
                setForecast(rows);
                setSelectedForecastDay(null);
            })
            .catch(() => {
                if (active) {
                    setForecast([]);
                    setSelectedForecastDay(null);
                }
            });

        return () => {
            active = false;
        };
    }, [selectedProvince]);

    const getTravelTip = (province) => {
        const condition = String(province?.condition || '').toLowerCase();
        const temperature = Number(province?.temperature);

        if (condition.includes('rain')) return '🌂 Bring a raincoat';
        if (Number.isFinite(temperature) && temperature >= 32) return '🧴 Apply sunscreen';
        if (Number.isFinite(temperature) && temperature <= 22) return '🧥 Light jacket needed';
        if (condition.includes('clear') || condition.includes('sunny')) return '✅ Good travel conditions';
        if (condition.includes('cloud')) return '⛅ Comfortable for travel';

        return '✅ Good travel conditions';
    };

    const advisoryFor = (province) => {
        const provinceName = province?.province || 'this province';
        const condition = String(province?.condition || '').toLowerCase();
        const temperature = Number(province?.temperature);

        if (condition.includes('rain')) {
            return {
                text: `🌧️ Rain expected in ${provinceName} today. Pack a waterproof bag and light rain jacket.`,
                background: '#fef9e7',
                borderLeft: '3px solid #c0a030',
            };
        }

        if (Number.isFinite(temperature) && temperature >= 32) {
            return {
                text: `☀️ Hot weather in ${provinceName} today. Stay hydrated, apply sunscreen SPF 50+, and avoid peak sun hours between 10AM and 3PM.`,
                background: '#fdeee9',
                borderLeft: '3px solid var(--ac)',
            };
        }

        if ((condition.includes('clear') || condition.includes('sunny')) && Number.isFinite(temperature) && temperature >= 24 && temperature <= 31) {
            return {
                text: `✅ Excellent travel conditions in ${provinceName} today. Great day to visit outdoor destinations.`,
                background: 'var(--acb)',
                borderLeft: '3px solid var(--ac)',
            };
        }

        return {
            text: `⛅ Weather in ${provinceName} is generally comfortable today. Bring light layers and stay hydrated while exploring.`,
            background: 'var(--bg2)',
            borderLeft: '3px solid var(--bd2)',
        };
    };

    const detailsAdvisory = selectedDetails ? advisoryFor(selectedDetails) : null;

    const valueText = (value, suffix = '') => {
        if (value === null || value === undefined || value === '') return '—';
        return `${value}${suffix}`;
    };

    return (
        <div>
            <div className="wx-grid">
                {(isLoading ? Array.from({ length: 5 }).map((_, idx) => ({ province: `loading-${idx}`, loading: true })) : weather).map((row, idx) => {
                    if (row.loading) {
                        return (
                            <div key={row.province ?? idx} className="wx-cell shimmer" style={{ minHeight: '108px' }}>
                                <span className="wx-ico">&nbsp;</span>
                                <div className="wx-temp">&nbsp;</div>
                                <div className="wx-loc">&nbsp;</div>
                                <div className="wx-cond">&nbsp;</div>
                            </div>
                        );
                    }

                    if (isError) {
                        return (
                            <div key={row.province ?? idx} className="wx-cell">
                                <span className="wx-ico" aria-hidden="true">⛅</span>
                                <div className="wx-temp">—</div>
                                <div className="wx-loc">{row.province || 'Province'}</div>
                                <div className="wx-cond">Unavailable</div>
                            </div>
                        );
                    }

                    const condition = capitalize(row.condition || 'Unavailable');
                    const temp = row.temperature === null || row.temperature === undefined ? '—' : `${row.temperature}°`;
                    const isSelected = selectedProvince === row.province;

                    return (
                        <button
                            key={row.province ?? idx}
                            type="button"
                            className="wx-cell"
                            onClick={() => setSelectedProvince((prev) => (prev === row.province ? null : row.province))}
                            style={{
                                appearance: 'none',
                                width: '100%',
                                cursor: 'pointer',
                                border: isSelected ? '1.5px solid var(--ac)' : 'none',
                                background: isSelected ? 'var(--acb)' : undefined,
                            }}
                        >
                            <span className="wx-ico" style={{ fontSize: 28, lineHeight: 1 }} aria-hidden="true">
                                {weatherEmoji(row.condition, row.icon)}
                            </span>
                            <div className="wx-temp">{temp}</div>
                            <div className="wx-loc">{row.province}</div>
                            <div className="wx-cond">{condition}</div>
                        </button>
                    );
                })}
            </div>

            {selectedDetails ? (
                <div
                    style={{
                        borderTop: '1px solid var(--bd)',
                        marginTop: 14,
                        paddingTop: 16,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            gridColumn: '1/-1',
                            fontFamily: 'Fraunces, serif',
                            fontSize: 16,
                            fontWeight: 700,
                            marginBottom: 4,
                        }}
                    >
                        {selectedDetails.province} - Full Weather Report
                    </div>

                    {[
                        { label: 'Feels Like', value: valueText(selectedDetails.feels_like, '°C') },
                        { label: 'Humidity', value: valueText(selectedDetails.humidity, '%') },
                        { label: 'Wind Speed', value: valueText(selectedDetails.wind_speed, ' m/s') },
                        { label: 'Travel Tip', value: getTravelTip(selectedDetails) },
                    ].map((box) => (
                        <div
                            key={box.label}
                            style={{
                                background: 'var(--bg2)',
                                border: '1px solid var(--bd)',
                                borderRadius: 'var(--r2)',
                                padding: '12px 14px',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 10,
                                    textTransform: 'uppercase',
                                    letterSpacing: '.5px',
                                    color: 'var(--i4)',
                                    marginBottom: 4,
                                }}
                            >
                                {box.label}
                            </div>
                            <div
                                style={{
                                    fontFamily: 'Fraunces, serif',
                                    fontSize: 18,
                                    fontWeight: 700,
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                {box.value}
                            </div>
                        </div>
                    ))}

                    <div
                        style={{
                            gridColumn: '1/-1',
                            marginTop: 14,
                            borderTop: '1px solid var(--bd)',
                            paddingTop: 14,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '.5px',
                                textTransform: 'uppercase',
                                color: 'var(--i4)',
                                marginBottom: 10,
                            }}
                        >
                            4-Day Forecast
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: 8,
                            }}
                        >
                            {forecast.slice(1, 5).map((day) => (
                                <button
                                    key={day.date}
                                    type="button"
                                    onClick={() => setSelectedForecastDay((prev) => (prev?.date === day.date ? null : day))}
                                    style={{
                                        appearance: 'none',
                                        width: '100%',
                                        cursor: 'pointer',
                                        background: 'var(--bg)',
                                        border: selectedForecastDay?.date === day.date ? '1.5px solid var(--ac)' : '1px solid var(--bd)',
                                        borderRadius: 'var(--r)',
                                        padding: '10px 12px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: 'var(--i4)',
                                            textTransform: 'uppercase',
                                            marginBottom: 6,
                                        }}
                                    >
                                        {new Date(day.date).toLocaleDateString('en-PH', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </div>
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>
                                        {weatherEmoji(day.condition)}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: 'Fraunces, serif',
                                            fontSize: 14,
                                            fontWeight: 700,
                                            letterSpacing: '-.3px',
                                        }}
                                    >
                                        {day.temp_min}°-{day.temp_max}°
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: 'var(--i4)',
                                            marginTop: 2,
                                        }}
                                    >
                                        {day.condition}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {selectedForecastDay ? (
                            <div
                                style={{
                                    gridColumn: '1/-1',
                                    marginTop: 12,
                                    overflowX: 'auto',
                                    display: 'flex',
                                    gap: 8,
                                    paddingBottom: 4,
                                }}
                            >
                                {(selectedForecastDay.hourly || []).map((hour) => (
                                    <div
                                        key={`${selectedForecastDay.date}-${hour.time}`}
                                        style={{
                                            flexShrink: 0,
                                            width: 72,
                                            background: 'var(--wh)',
                                            border: '1px solid var(--bd)',
                                            borderRadius: 'var(--r)',
                                            padding: '10px 8px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: 'var(--i4)',
                                                marginBottom: 4,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {hour.time}
                                        </div>
                                        <div style={{ fontSize: 18, marginBottom: 4 }}>
                                            {weatherEmoji(hour.condition, hour.icon)}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: 'Fraunces, serif',
                                                fontSize: 15,
                                                fontWeight: 700,
                                                letterSpacing: '-.3px',
                                            }}
                                        >
                                            {hour.temp}°
                                        </div>
                                        {(hour.pop || 0) > 0 ? (
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: '#185FA5',
                                                    marginTop: 3,
                                                }}
                                            >
                                                💧{hour.pop}%
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {detailsAdvisory ? (
                        <div
                            style={{
                                padding: '10px 14px',
                                borderRadius: 'var(--r)',
                                fontSize: 12,
                                fontWeight: 500,
                                marginTop: 12,
                                gridColumn: '1/-1',
                                background: detailsAdvisory.background,
                                borderLeft: detailsAdvisory.borderLeft,
                            }}
                        >
                            {detailsAdvisory.text}
                        </div>
                    ) : null}

                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="s-btn dark"
                            onClick={() => navigate(`/dashboard/recommendations?province=${encodeURIComponent(selectedDetails.province_id ?? '')}`)}
                        >
                            See destinations in {selectedDetails.province} →
                        </button>
                        <button
                            type="button"
                            className="s-btn"
                            onClick={() => navigate(`/dashboard/map?province=${encodeURIComponent(selectedDetails.province || '')}`)}
                        >
                            View on map →
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
