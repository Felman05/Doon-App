import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/axios';
import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';

const categoryColors = {
    'beach-water': 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    'nature-outdoor': 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    'cultural-heritage': 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    'food-dining': 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
    'adventure-sports': 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
};

export default function MapExplorerPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { addToast } = useContext(ToastContext) || {};
    const [selected, setSelected] = useState(null);
    const [activeProvince, setActiveProvince] = useState('All');

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey,
    });

    const { data: destinations = [], isLoading } = useQuery({
        queryKey: ['destinations-map'],
        queryFn: async () => {
            const { data } = await api.get('/destinations', { params: { per_page: 500 } });
            if (Array.isArray(data.data)) return data.data;
            if (Array.isArray(data.data?.data)) return data.data.data;
            return [];
        },
    });

    const saveMutation = useMutation({
        mutationFn: (destinationId) => api.post(`/favorites/${destinationId}`),
        onSuccess: () => addToast?.('Saved to places', 'success'),
        onError: () => addToast?.('Could not save place', 'error'),
    });

    useEffect(() => {
        if (!apiKey) {
            console.error('[MapExplorer] Missing VITE_GOOGLE_MAPS_API_KEY in environment variables.');
        }
    }, [apiKey]);

    useEffect(() => {
        if (loadError) {
            console.error('[MapExplorer] Google Maps API failed to load:', loadError);
        }
    }, [loadError]);

    const provinces = ['All', 'Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'];

    useEffect(() => {
        const requestedProvince = String(searchParams.get('province') || '').trim();
        if (!requestedProvince) {
            return;
        }

        const matchedProvince = provinces.find(
            (provinceName) => provinceName.toLowerCase() === requestedProvince.toLowerCase()
        );

        if (matchedProvince) {
            setActiveProvince(matchedProvince);
            setSelected(null);
        }
    }, [provinces, searchParams]);

    const mappable = useMemo(
        () => destinations.filter((d) => d.latitude !== null && d.longitude !== null),
        [destinations]
    );

    const visibleDestinations = useMemo(() => {
        if (activeProvince === 'All') return mappable;
        return mappable.filter((d) => d.province?.name === activeProvince || d.province === activeProvince);
    }, [mappable, activeProvince]);

    if (!isLoaded) {
        return <div>Loading map...</div>;
    }

    if (loadError) {
        return (
            <div style={{ color: '#8a2a1a' }}>
                Map failed to load: {loadError.message || 'Unknown Google Maps API error'}. Check API key and referrer restrictions.
            </div>
        );
    }

    return (
        <>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                {provinces.map((provinceName) => (
                    <button
                        key={provinceName}
                        className={`s-btn ${activeProvince === provinceName ? 'dark' : ''}`}
                        onClick={() => {
                            setActiveProvince(provinceName);
                            setSelected(null);
                        }}
                    >
                        {provinceName === 'All' ? '🌍 All' : provinceName}
                    </button>
                ))}
                <span style={{ fontSize: 12, color: '#6b6b64', marginLeft: 12 }}>
                    {visibleDestinations.length} destinations
                </span>
            </div>

            {isLoading && <div style={{ marginBottom: '12px', color: 'var(--i4)' }}>Loading destinations...</div>}

            <div style={{ position: 'relative' }}>
                <GoogleMap
                    mapContainerStyle={{
                        height: 'calc(100vh - 160px)',
                        minHeight: '420px',
                        width: '100%',
                        borderRadius: 'var(--r2)',
                        border: '1px solid var(--bd)',
                    }}
                    zoom={9}
                    center={{ lat: 14.1, lng: 121.3 }}
                    options={{
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: true,
                    }}
                >
                    {visibleDestinations.map((destination) => (
                        <Marker
                            key={destination.id}
                            position={{ lat: parseFloat(destination.latitude), lng: parseFloat(destination.longitude) }}
                            title={destination.name}
                            onClick={() => setSelected(destination)}
                            icon={categoryColors[destination.category?.slug] || undefined}
                        />
                    ))}

                    {selected && (
                        <InfoWindow
                            position={{ lat: parseFloat(selected.latitude), lng: parseFloat(selected.longitude) }}
                            onCloseClick={() => setSelected(null)}
                        >
                            <div style={{ maxWidth: 220, fontFamily: 'DM Sans' }}>
                                <strong style={{ fontSize: 14 }}>{selected.name}</strong>
                                <p style={{ marginTop: 4, marginBottom: 6, fontSize: 12, color: '#6b6b64' }}>
                                    {(selected.province?.name || selected.province || 'N/A')} · {(selected.category?.name || selected.category || 'N/A')}
                                </p>
                                <p style={{ marginTop: 0, marginBottom: 6 }}>
                                    <span className="pill p-y">{selected.price_label || 'N/A'}</span>
                                </p>
                                <p style={{ marginTop: 0, marginBottom: 6 }}>
                                    ⭐ {Number.isFinite(Number(selected.avg_rating)) ? Number(selected.avg_rating).toFixed(1) : 'N/A'}
                                </p>
                                <p style={{ fontSize: 11, color: '#6b6b64', marginTop: 0, marginBottom: 8 }}>
                                    {((selected.short_description || '').slice(0, 80) || 'No description')}
                                    {(selected.short_description || '').length > 80 ? '...' : ''}
                                </p>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button type="button" className="s-btn dark" onClick={() => navigate(`/dashboard/destinations/${selected.id}`)}>
                                        View Details
                                    </button>
                                    <button
                                        type="button"
                                        className="s-btn"
                                        onClick={() => saveMutation.mutate(selected.id)}
                                        disabled={saveMutation.isPending}
                                    >
                                        Save ♡
                                    </button>
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>

                <div
                    style={{
                        position: 'absolute',
                        left: 12,
                        bottom: 12,
                        background: 'var(--wh)',
                        border: '1px solid var(--bd)',
                        borderRadius: 'var(--r)',
                        boxShadow: 'var(--s1)',
                        padding: '8px 10px',
                        fontSize: 12,
                        color: 'var(--i3)',
                        lineHeight: 1.6,
                    }}
                >
                    <div>🔵 Beach & Water</div>
                    <div>🟢 Nature & Outdoor</div>
                    <div>🟡 Cultural & Heritage</div>
                    <div>🟠 Food & Dining</div>
                    <div>🔴 Adventure & Sports</div>
                </div>
            </div>
        </>
    );
}
