import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

const center = { lat: 14.1, lng: 121.5 };

export default function MapExplorer() {
    const [selected, setSelected] = useState(null);
    const [provinceId, setProvinceId] = useState('all');

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });

    const { data: destinations = [], isLoading } = useQuery({
        queryKey: ['destinations', provinceId],
        queryFn: async () => {
            const { data } = await api.get('/destinations', {
                params: provinceId === 'all' ? {} : { province_id: provinceId, is_active: true },
            });
            return data.data ?? [];
        },
    });

    const provinces = useMemo(() => {
        const map = new Map();
        destinations.forEach((d) => {
            if (d.province?.id) map.set(d.province.id, d.province.name);
        });
        return Array.from(map.entries());
    }, [destinations]);

    if (!isLoaded || isLoading) {
        return <div className="map-skeleton">Loading map...</div>;
    }

    return (
        <div>
            <div className="map-toolbar">
                <button type="button" className="s-btn" onClick={() => setProvinceId('all')}>All</button>
                {provinces.map(([id, name]) => (
                    <button key={id} type="button" className="s-btn" onClick={() => setProvinceId(String(id))}>{name}</button>
                ))}
            </div>
            <GoogleMap mapContainerStyle={{ width: '100%', height: '320px', borderRadius: '10px' }} center={center} zoom={9}>
                {destinations
                    .filter((d) => d.latitude && d.longitude)
                    .map((destination) => (
                        <Marker
                            key={destination.id}
                            position={{ lat: Number(destination.latitude), lng: Number(destination.longitude) }}
                            onClick={() => setSelected(destination)}
                        />
                    ))}
                {selected && (
                    <InfoWindow
                        position={{ lat: Number(selected.latitude), lng: Number(selected.longitude) }}
                        onCloseClick={() => setSelected(null)}
                    >
                        <div>
                            <strong>{selected.name}</strong>
                            <div>{selected.category?.name ?? 'Category'}</div>
                            <div>{selected.price_label ?? 'N/A'} · {selected.avg_rating ?? 0} ★</div>
                            <button type="button" className="s-btn dark">View details</button>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
