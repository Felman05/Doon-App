import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Sidebar from '../../components/layout/Sidebar';
import AdminHome from './AdminHome';
import DashboardPage from './DashboardPage';
import DestinationsPage from './DestinationsPage';
import BookingsPage from './BookingsPage';
import UsersPage from './UsersPage';
import ReviewsPage from './ReviewsPage';
import SettingsPage from './SettingsPage';
import ReportsPage from './ReportsPage';
import ActivityLogsPage from './ActivityLogsPage';
import CategoriesPage from './CategoriesPage';
import PromoCodesPage from './PromoCodesPage';
import MediaManagementPage from './MediaManagementPage';
import NotificationsPage from './NotificationsPage';
import SystemHealthPage from './SystemHealthPage';

const adminRoutes = [
    { path: '', label: 'Dashboard', icon: '📊' },
    { path: 'destinations', label: 'Destinations', icon: '🗺️' },
    { path: 'bookings', label: 'Bookings', icon: '📋' },
    { path: 'users', label: 'Users', icon: '👥' },
    { path: 'categories', label: 'Categories', icon: '📂' },
    { path: 'reviews', label: 'Reviews', icon: '⭐' },
    { path: 'promo-codes', label: 'Promo Codes', icon: '🎟️' },
    { path: 'media', label: 'Media', icon: '🖼️' },
    { path: 'notifications', label: 'Notifications', icon: '🔔' },
    { path: 'reports', label: 'Reports', icon: '📈' },
    { path: 'activity-logs', label: 'Activity Logs', icon: '📝' },
    { path: 'system-health', label: 'System Health', icon: '⚕️' },
    { path: 'settings', label: 'Settings', icon: '⚙️' },
];
export default function AdminDashboard() {
    const location = useLocation();
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentPath = pathParts.slice(1).join('/');

    const activeLabel = adminRoutes.find(r => r.path === currentPath)?.label || 'Dashboard';

    return (
        <div className="d-wrap">
            <Sidebar
                role="admin"
                routes={adminRoutes}
                currentPath={currentPath}
            />
            <main className="d-main">
                <div className="d-topbar">
                    <div>
                        <div className="d-page-title">Admin Dashboard</div>
                        <div className="d-page-sub">{activeLabel !== 'Admin Dashboard' ? activeLabel : 'Platform management and oversight'}</div>
                    </div>
                    <div className="d-actions">
                        <button type="button" className="d-ico-btn">🔔<span className="notif-dot"></span></button>
                        <button type="button" className="d-ava-btn">AD</button>
                    </div>
                </div>

                <Routes>
                    <Route index element={<AdminHome />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="destinations" element={<DestinationsPage />} />
                    <Route path="bookings" element={<BookingsPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="reviews" element={<ReviewsPage />} />
                    <Route path="promo-codes" element={<PromoCodesPage />} />
                    <Route path="media" element={<MediaManagementPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="activity-logs" element={<ActivityLogsPage />} />
                    <Route path="system-health" element={<SystemHealthPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="." replace />} />
                </Routes>
            </main>
        </div>
    );

}
