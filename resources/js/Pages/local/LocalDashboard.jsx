import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import ProviderHome from './ProviderHome';
import ListingsPage from './ListingsPage';
import AnalyticsPage from './AnalyticsPage';
import NewListingPage from './NewListingPage';
import ReviewsPage from './ReviewsPage';
import ProfilePage from './ProfilePage';

const providerRoutes = [
    { path: '', label: 'Dashboard', icon: '📊' },
    { path: 'listings', label: 'Listings', icon: '🏢' },
    { path: 'analytics', label: 'Analytics', icon: '📈' },
    { path: 'listings/new', label: 'New Listing', icon: '➕' },
    { path: 'reviews', label: 'Reviews', icon: '⭐' },
    { path: 'profile', label: 'Profile', icon: '👤' },
];

export default function LocalDashboard() {
    const location = useLocation();
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentPath = pathParts.slice(1).join('/');

    const activeLabel = providerRoutes.find(r => r.path === currentPath)?.label || 'Dashboard';

    return (
        <div className="d-wrap">
            <Sidebar
                role="local"
                routes={providerRoutes}
                currentPath={currentPath}
            />
            <main className="d-main">
                <div className="d-topbar">
                    <div>
                        <div className="d-page-title">Provider Dashboard</div>
                        <div className="d-page-sub">{activeLabel !== 'Provider Dashboard' ? activeLabel : 'Manage listings and analytics'}</div>
                    </div>
                    <div className="d-actions">
                        <button type="button" className="d-ico-btn">📈</button>
                        <button type="button" className="d-ava-btn">LP</button>
                    </div>
                </div>

                <Routes>
                    <Route index element={<ProviderHome />} />
                    <Route path="listings" element={<ListingsPage />} />
                    <Route path="listings/new" element={<NewListingPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="reviews" element={<ReviewsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="*" element={<Navigate to="." replace />} />
                </Routes>
            </main>
        </div>
    );
}
