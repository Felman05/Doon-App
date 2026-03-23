import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';

const center = { lat: 14.1407, lng: 121.4771 };

export default function MapExplorer({ selectedDestination, onSelectDestination, onAddToItinerary }) {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [provinceFilter, setProvinceFilter] = useState('all');

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
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

    const provinces = ['all', 'Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'];

    const filtered = useMemo(() => {
        const withCoords = destinations.filter((d) => d.latitude !== null && d.longitude !== null);
        if (provinceFilter === 'all') {
            return withCoords;
        }
        return withCoords.filter((d) => d.province?.name === provinceFilter);
    }, [destinations, provinceFilter]);

    useEffect(() => {
        if (selectedDestination?.id) {
            setSelected(selectedDestination);
        }
    }, [selectedDestination]);

    if (isLoading || !isLoaded) {
        return (
            <div className="map-box">
                <div className="map-pins"><span className="m-pin" /><span className="m-pin" /><span className="m-pin" /></div>
                <div>Google Maps Integration</div>
            </div>
        );
    }

    if (loadError) {
        return <div className="map-box">Map unavailable. Please check your connection.</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {provinces.map((province) => (
                    <button
                        key={province}
                        type="button"
                        className={`sb-item ${provinceFilter === province ? 'active' : ''}`}
                        style={{ width: 'auto' }}
                        onClick={() => setProvinceFilter(province)}
                    >
                        {province === 'all' ? 'All' : province}
                    </button>
                ))}
            </div>

            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '320px', borderRadius: '10px' }}
                center={center}
                zoom={9}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
                }}
            >
                {filtered.map((destination) => (
                        <Marker
                            key={destination.id}
                            position={{ lat: Number(destination.latitude), lng: Number(destination.longitude) }}
                            title={destination.name}
                            onClick={() => {
                                setSelected(destination);
                                onSelectDestination?.(destination);
                            }}
                        />
                    ))}
                {selected && (
                    <InfoWindow
                        position={{ lat: Number(selected.latitude), lng: Number(selected.longitude) }}
                        onCloseClick={() => setSelected(null)}
                    >
                        <div style={{ maxWidth: '240px' }}>
                            <strong>{selected.name}</strong>
                            <div>{selected.province?.name} · {selected.category?.name}</div>
                            <div style={{ marginTop: '4px' }}>
                                <span className="pill p-y">{selected.price_label || 'N/A'}</span>
                            </div>
                            <div style={{ marginTop: '4px' }}>★ {Number(selected.avg_rating || 0).toFixed(1)}</div>
                            <div style={{ fontSize: '12px', marginTop: '6px' }}>
                                {(selected.short_description || '').slice(0, 100)}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                <button type="button" className="s-btn" onClick={() => navigate(`/dashboard/destinations/${selected.id}`)}>View Details</button>
                                <button type="button" className="s-btn dark" onClick={() => onAddToItinerary?.(selected)}>Add to Itinerary</button>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
