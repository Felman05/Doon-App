import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import Skeleton from '../../components/ui/Skeleton';

export default function MapExplorerPage() {
    const mapRef = useRef(null);

    const { data: destinations = [], isLoading } = useQuery({
        queryKey: ['destinations-map'],
        queryFn: async () => {
            const { data } = await api.get('/destinations', { params: { per_page: 500 } });
            return data.data?.data ?? [];
        },
    });

    useEffect(() => {
        if (window.google && mapRef.current && destinations.length > 0) {
            const map = new window.google.maps.Map(mapRef.current, {
                zoom: 10,
                center: { lat: 13.7563, lng: 121.1944 }, // CALABARZON center
            });

            destinations.forEach(dest => {
                if (!dest.latitude || !dest.longitude) return;

                const marker = new window.google.maps.Marker({
                    position: { lat: parseFloat(dest.latitude), lng: parseFloat(dest.longitude) },
                    map: map,
                    title: dest.name,
                });

                marker.addListener('click', () => {
                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
                            <div style="font-size: 12px; color: #333;">
                                <strong>${dest.name}</strong><br/>
                                ${dest.category}<br/>
                                ⭐ ${dest.avg_rating?.toFixed(1) || 'N/A'}<br/>
                                <a href="/dashboard/destinations/${dest.id}" style="color: #1a6b47;">View Details</a>
                            </div>
                        `,
                    });
                    infoWindow.open(map, marker);
                });
            });
        }
    }, [destinations]);

    return (
        <>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button className="s-btn dark">🌍 All</button>
                {['Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'].map(prov => (
                    <button key={prov} className="s-btn">{prov}</button>
                ))}
            </div>

            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '600px',
                    borderRadius: 'var(--r2)',
                    border: '1px solid var(--bd)',
                    background: isLoading ? 'var(--bg2)' : 'transparent',
                }}
            >
                {isLoading && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--i4)' }}>
                        Loading destinations...
                    </div>
                )}
            </div>
        </>
    );
}
