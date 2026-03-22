import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const roleMenus = {
    tourist: ['Dashboard', 'Recommendations', 'Map Explorer', 'AI Chatbot', 'Itineraries', 'Packing Lists'],
    local: ['Dashboard', 'My Listings', 'Submit New Listing', 'Visitor Analytics', 'Reviews'],
    admin: ['Dashboard', 'Analytics', 'Destinations', 'Providers', 'All Users', 'LGU Reports'],
};

const roleIcons = {
    tourist: ['🏠', '✨', '🗺️', '🤖', '🧭', '🎒'],
    local: ['🏠', '📍', '➕', '📈', '⭐'],
    admin: ['🏠', '�', '🏞️', '🏢', '�', '�'],
};

export default function Sidebar({ role = 'tourist', activeItem = 'Dashboard', onSelect }) {
    const { user, logout } = useAuth();

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
                {roleMenus[role]?.map((item, index) => (
                    <button
                        key={item}
                        type="button"
                        className={`sb-item ${activeItem === item ? 'active' : ''}`}
                        onClick={() => onSelect?.(item)}
                    >
                        <span className="sb-ico">{roleIcons[role]?.[index] ?? '•'}</span>
                        <span>{item}</span>
                        {index === 1 ? <span className="sb-badge">3</span> : null}
                    </button>
                ))}
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
                <Link className="sb-item" to="/"><span className="sb-ico">←</span><span>Back to Home</span></Link>
            </div>
            <div className="sb-foot">CALABARZON Travel Intelligence</div>
        </nav>
    );
}
