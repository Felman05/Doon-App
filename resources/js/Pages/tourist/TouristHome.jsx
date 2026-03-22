import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import WeatherStrip from '../../components/weather/WeatherStrip';
import RecommendationForm from '../../components/recommendations/RecommendationForm';
import DestinationList from '../../components/recommendations/DestinationList';
import MapExplorer from '../../components/map/MapExplorer';
import ItineraryPanel from '../../components/itinerary/ItineraryPanel';
import ChatbotPanel from '../../components/chatbot/ChatbotPanel';
import PackingList from '../../components/packing/PackingList';
import useRecommendations from '../../hooks/useRecommendations';
import Skeleton from '../../components/ui/Skeleton';

export default function TouristHome() {
    const { data: authData } = useQuery({
        queryKey: ['auth-me'],
        queryFn: async () => {
            const { data } = await api.get('/auth/me');
            return data.data;
        },
    });

    const recommendationMutation = useRecommendations();

    return (
        <>
            {/* Greeting & Stats */}
            <div className="dc mb16 sr">
                <div style={{ marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--i)', marginBottom: '4px' }}>
                        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {authData?.name || 'Traveler'}
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--i4)' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <div className="kpi-row c3">
                    <div className="kpi">
                        <div className="kpi-lbl">Saved Places</div>
                        <div className="kpi-val">{authData?.counts?.saved_places ?? 0}</div>
                    </div>
                    <div className="kpi">
                        <div className="kpi-lbl">Itineraries</div>
                        <div className="kpi-val">{authData?.counts?.itineraries ?? 0}</div>
                    </div>
                    <div className="kpi">
                        <div className="kpi-lbl">Reviews</div>
                        <div className="kpi-val">{authData?.counts?.reviews ?? 0}</div>
                    </div>
                </div>
            </div>

            {/* Weather */}
            <div className="dc mb16 sr d1">
                <div className="dc-title">Live Weather</div>
                <WeatherStrip />
            </div>

            {/* Recommendation form */}
            <div className="dc mb16 sr d2">
                <div className="dc-title">AI Activity Finder</div>
                <RecommendationForm onSubmit={(payload) => recommendationMutation.mutate(payload)} />
            </div>

            {/* Recommendations + Map + Itinerary */}
            <div className="g31 mb16">
                <div className="dc sr d2">
                    <div className="dc-title">Recommendations</div>
                    <DestinationList destinations={recommendationMutation.data ?? []} />
                </div>
                <div className="col-stack">
                    <div className="dc sr d3">
                        <div className="dc-title">Map</div>
                        <MapExplorer />
                    </div>
                    <div className="dc sr d4">
                        <div className="dc-title">Active Itinerary</div>
                        <ItineraryPanel />
                    </div>
                </div>
            </div>

            {/* Chatbot + Packing */}
            <div className="g2">
                <div className="dc sr d3">
                    <div className="dc-title">AI Chatbot</div>
                    <ChatbotPanel />
                </div>
                <div className="dc sr d4">
                    <div className="dc-title">Packing List</div>
                    <PackingList />
                </div>
            </div>
        </>
    );
}
