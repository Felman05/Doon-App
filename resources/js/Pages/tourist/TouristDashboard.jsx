import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TouristHome from './TouristHome';
import RecommendationsPage from './RecommendationsPage';
import DestinationDetail from './DestinationDetail';
import ItinerariesPage from './ItinerariesPage';
import ChatbotPage from './ChatbotPage';
import SavedPlacesPage from './SavedPlacesPage';
import PackingPage from './PackingPage';
import ReviewsPage from './ReviewsPage';
import MapExplorerPage from './MapExplorerPage';
import PreferencesPage from './PreferencesPage';

const touristRoutes = [
    { path: '', label: 'Dashboard', icon: '🏠' },
    { path: 'recommendations', label: 'Recommendations', icon: '⭐' },
    { path: 'map', label: 'Map Explorer', icon: '🗺️' },
    { path: 'chatbot', label: 'AI Chatbot', icon: '🤖' },
    { path: 'itineraries', label: 'Itineraries', icon: '📋' },
    { path: 'saved', label: 'Saved Places', icon: '❤️' },
    { path: 'packing', label: 'Packing', icon: '🎒' },
    { path: 'reviews', label: 'Reviews', icon: '⭐' },
    { path: 'preferences', label: 'Preferences', icon: '⚙️' },
];

export default function TouristDashboard() {
    const location = useLocation();
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentPath = pathParts.slice(1).join('/'); // Remove 'dashboard' part
    
    const activeLabel = touristRoutes.find(r => r.path === currentPath)?.label || 'Dashboard';

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
                        <div className="d-page-title">Tourist Dashboard</div>
                        <div className="d-page-sub">{activeLabel !== 'Tourist Dashboard' ? activeLabel : 'Plan your CALABARZON trip'}</div>
                    </div>
                    <div className="d-actions">
                        <button type="button" className="d-ico-btn">🔔<span className="notif-dot"></span></button>
                        <button type="button" className="d-ava-btn">TS</button>
                    </div>
                </div>

                <Routes>
                    <Route path="/" element={<TouristHome />} />
                    <Route path="/recommendations" element={<RecommendationsPage />} />
                    <Route path="/destinations/:id" element={<DestinationDetail />} />
                    <Route path="/itineraries" element={<ItinerariesPage />} />
                    <Route path="/chatbot" element={<ChatbotPage />} />
                    <Route path="/saved" element={<SavedPlacesPage />} />
                    <Route path="/packing" element={<PackingPage />} />
                    <Route path="/reviews" element={<ReviewsPage />} />
                    <Route path="/map" element={<MapExplorerPage />} />
                    <Route path="/preferences" element={<PreferencesPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}
