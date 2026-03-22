import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import UsersPage from './UsersPage';
import BookingsPage from './BookingsPage';
import DestinationsPage from './DestinationsPage';
import ReviewsPage from './ReviewsPage';
import SettingsPage from './SettingsPage';
import ReportsPage from './ReportsPage';
import ActivityLogsPage from './ActivityLogsPage';
import CategoriesPage from './CategoriesPage';
import PromoCodesPage from './PromoCodesPage';
import MediaManagementPage from './MediaManagementPage';
import NotificationsPage from './NotificationsPage';
import SystemHealthPage from './SystemHealthPage';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    if (!user || user.role !== 'admin') {
        return navigate('/');
    }

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', component: DashboardPage },
        { id: 'users', label: 'Users', icon: '👥', component: UsersPage },
        { id: 'bookings', label: 'Bookings', icon: '📋', component: BookingsPage },
        { id: 'destinations', label: 'Destinations', icon: '🗺️', component: DestinationsPage },
        { id: 'categories', label: 'Categories', icon: '📂', component: CategoriesPage },
        { id: 'reviews', label: 'Reviews', icon: '⭐', component: ReviewsPage },
        { id: 'promo-codes', label: 'Promo Codes', icon: '🎟️', component: PromoCodesPage },
        { id: 'media', label: 'Media', icon: '🖼️', component: MediaManagementPage },
        { id: 'notifications', label: 'Notifications', icon: '🔔', component: NotificationsPage },
        { id: 'reports', label: 'Reports', icon: '📈', component: ReportsPage },
        { id: 'activity-logs', label: 'Activity Logs', icon: '📝', component: ActivityLogsPage },
        { id: 'system-health', label: 'System Health', icon: '⚕️', component: SystemHealthPage },
        { id: 'settings', label: 'Settings', icon: '⚙️', component: SettingsPage },
    ];

    const currentItem = menuItems.find(item => item.id === currentPage);
    const CurrentComponent = currentItem?.component || DashboardPage;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Sidebar */}
            <div 
                style={{
                    width: sidebarOpen ? '280px' : '0',
                    background: 'var(--wh)',
                    borderRight: '1px solid var(--bd)',
                    transition: 'width 0.3s ease',
                    overflow: 'hidden',
                    position: 'fixed',
                    height: '100vh',
                    zIndex: 100,
                    top: 0,
                    left: 0,
                }}
            >
                <div style={{ padding: '20px', borderBottom: '1px solid var(--bd)' }}>
                    <h2 style={{ margin: '0 0 8px 0', color: 'var(--tx)' }}>Admin Panel</h2>
                    <p style={{ margin: '0', fontSize: '12px', color: 'var(--tx2)' }}>Welcome, {user?.name}</p>
                </div>

                <nav style={{ padding: '16px', overflow: 'auto', height: 'calc(100vh - 120px)' }}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentPage(item.id)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: currentPage === item.id ? 'var(--bg)' : 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                borderRadius: 'var(--r1)',
                                marginBottom: '4px',
                                color: currentPage === item.id ? 'var(--pr)' : 'var(--tx2)',
                                transition: 'all 0.2s ease',
                                fontWeight: currentPage === item.id ? '600' : '400',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = currentPage === item.id ? 'var(--bg)' : 'transparent'}
                        >
                            <span style={{ fontSize: '18px' }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div style={{ padding: '16px', borderTop: '1px solid var(--bd)', position: 'absolute', bottom: '0', width: '100%', boxSizing: 'border-box' }}>
                    <button 
                        onClick={logout}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 0, 0, 0.3)',
                            borderRadius: 'var(--r1)',
                            color: 'var(--tx)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, marginLeft: sidebarOpen ? '280px' : '0', transition: 'margin-left 0.3s ease' }}>
                {/* Top Bar */}
                <div style={{ background: 'var(--wh)', borderBottom: '1px solid var(--bd)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{
                                background: 'none',
                                border: '1px solid var(--bd)',
                                padding: '8px 12px',
                                borderRadius: 'var(--r1)',
                                cursor: 'pointer',
                                fontSize: '16px',
                            }}
                        >
                            {sidebarOpen ? '←' : '→'}
                        </button>
                        <h1 style={{ margin: '0', fontSize: '20px' }}>{currentItem?.label}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ padding: '6px 12px', background: 'var(--bg)', borderRadius: 'var(--r1)', fontSize: '12px' }}>
                            🟢 Online
                        </span>
                    </div>
                </div>

                {/* Page Content */}
                <div style={{ padding: '24px' }}>
                    <CurrentComponent />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
