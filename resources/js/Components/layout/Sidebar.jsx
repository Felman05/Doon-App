import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const roleMenus = {
    tourist: ['Dashboard', 'Recommendations', 'Map Explorer', 'AI Chatbot', 'Itineraries', 'Packing Lists'],
    local: ['Dashboard', 'My Listings', 'Submit New Listing', 'Visitor Analytics', 'Reviews'],
    admin: ['Dashboard', 'Analytics', 'Destinations', 'Providers', 'All Users', 'LGU Reports'],
};

const roleIcons = {
    tourist: ['⌂', '◆', '◎', '◈', '◉', '◍'],
    local: ['⌂', '◈', '+', '△', '★'],
    admin: ['⌂', '△', '◎', '▣', '◍', '◉'],
};

export default function Sidebar({ role = 'tourist', activeItem = 'Dashboard', onSelect, routes = null, currentPath = '' }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const menuItems = Array.isArray(routes) && routes.length
        ? routes
        : (roleMenus[role] || []).map((label) => ({ path: '', label }));

    const normalizePath = (path) => {
        if (!path || path === '/dashboard') {
            return '/dashboard';
        }

        return path.replace(/\/+$/, '');
    };

    const pathname = normalizePath(location.pathname);

    const isTouristRouteActive = (itemPath) => {
        const target = itemPath ? `/dashboard/${itemPath}` : '/dashboard';
        const normalizedTarget = normalizePath(target);

        if (normalizedTarget === '/dashboard') {
            return pathname === '/dashboard';
        }

        return pathname === normalizedTarget || pathname.startsWith(`${normalizedTarget}/`);
    };

    return (
        <nav className="d-sidebar">
            <div className="sb-logo">doon<b>.</b><sub>{role}</sub></div>
            <div className="sb-user">
                <div className="sb-ava">{user?.name?.slice(0, 2)?.toUpperCase() ?? 'DN'}</div>
                <div>
                    <div className="sb-name">{user?.name ?? 'Doon User'}</div>
                    <div className="sb-role">{role}</div>
                </div>
            </div>
            <div className="sb-nav">
                <div className="sb-section">Navigation</div>
                {menuItems.map((item, index) => {
                    const label = item.label;
                    const path = item.path ?? '';
                    const isRouteMode = Array.isArray(routes) && routes.length > 0;
                    const isActive = isRouteMode
                        ? isTouristRouteActive(path)
                        : activeItem === label;

                    if (isRouteMode) {
                        const to = path ? `/dashboard/${path}` : '/dashboard';
                        return (
                            <Link key={label} to={to} className={`sb-item ${isActive ? 'active' : ''}`}>
                                <span className="sb-ico">{roleIcons[role]?.[index] ?? '•'}</span>
                                <span>{label}</span>
                                {index === 1 ? <span className="sb-badge">3</span> : null}
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={label}
                            type="button"
                            className={`sb-item ${isActive ? 'active' : ''}`}
                            onClick={() => onSelect?.(label)}
                        >
                            <span className="sb-ico">{roleIcons[role]?.[index] ?? '•'}</span>
                            <span>{label}</span>
                            {index === 1 ? <span className="sb-badge">3</span> : null}
                        </button>
                    );
                })}
                <button
                    type="button"
                    className="sb-item"
                    onClick={async () => {
                        await logout();
                    }}
                >
                    <span className="sb-ico">↩</span>
                    <span>Sign out</span>
                </button>
            </div>
            <div className="sb-foot">CALABARZON Travel Intelligence</div>
        </nav>
    );
}
