import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import useAuth from '../../hooks/useAuth';
import TouristHome from './TouristHome';
import RecommendationsPage from './RecommendationsPage';
import DestinationDetail from './DestinationDetail';
import ItinerariesPage from './ItinerariesPage';
import ChatbotPage from './ChatbotPage';
import SavedPlacesPage from './SavedPlacesPage';
import PackingPage from './PackingPage';
import ReviewsPage from './ReviewsPage';
import MapPage from './MapPage';
import PreferencesPage from './PreferencesPage';
import useWeather from '../../hooks/useWeather';

const touristRoutes = [
    { path: '', label: 'Dashboard' },
    { path: 'recommendations', label: 'Recommendations' },
    { path: 'map', label: 'Map Explorer' },
    { path: 'chatbot', label: 'AI Chatbot' },
    { path: 'itineraries', label: 'Itineraries' },
    { path: 'saved', label: 'Saved Places' },
    { path: 'packing', label: 'Packing Lists' },
    { path: 'reviews', label: 'Reviews' },
    { path: 'preferences', label: 'Preferences' },
];

export default function TouristDashboard() {
    const { user } = useAuth();
    const weatherState = useWeather();
    const location = useLocation();
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentPath = pathParts.slice(1).join('/'); // Remove 'dashboard' part
    
    const activeLabel = touristRoutes.find(r => r.path === currentPath)?.label || 'Dashboard';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const initials = (user?.name || 'TS').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="d-wrap">
            <Sidebar
                role="tourist"
                routes={touristRoutes}
                currentPath={currentPath}
            />
            <main className="d-main">
                <div className="d-topbar">
                    <div>
                        <div className="d-page-title">{activeLabel === 'Dashboard' ? `${greeting}, ${user?.name || 'Traveler'}` : activeLabel}</div>
                        <div className="d-page-sub">Ready to plan your next CALABARZON adventure? • {today}</div>
                    </div>
                    <div className="d-actions">
                        <button type="button" className="d-ico-btn">🔔<span className="notif-dot"></span></button>
                        <button type="button" className="d-ico-btn">🔍</button>
                        <button type="button" className="d-ava-btn">{initials}</button>
                    </div>
                </div>

                <Routes>
                    <Route index element={<TouristHome weatherState={weatherState} />} />
                    <Route path="recommendations" element={<RecommendationsPage weatherState={weatherState} />} />
                    <Route path="destinations/:id" element={<DestinationDetail weatherState={weatherState} />} />
                    <Route path="itineraries" element={<ItinerariesPage weatherState={weatherState} />} />
                    <Route path="chatbot" element={<ChatbotPage />} />
                    <Route path="saved" element={<SavedPlacesPage />} />
                    <Route path="packing" element={<PackingPage weatherState={weatherState} />} />
                    <Route path="reviews" element={<ReviewsPage />} />
                    <Route path="map" element={<MapPage />} />
                    <Route path="preferences" element={<PreferencesPage />} />
                    <Route path="*" element={<Navigate to="." replace />} />
                </Routes>
            </main>
        </div>
    );
}
