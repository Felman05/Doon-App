import { useNavigate } from 'react-router-dom';

const shortcuts = [
    {
        icon: '✦',
        title: 'Recommendations',
        description: 'Find destinations matched to your budget, theme, and travel style',
        route: '/dashboard/recommendations',
    },
    {
        icon: '◎',
        title: 'Map Explorer',
        description: 'Explore all 5 CALABARZON provinces on an interactive map',
        route: '/dashboard/map',
    },
    {
        icon: '◈',
        title: 'AI Chatbot',
        description: 'Ask Doon anything about CALABARZON travel, food, and destinations',
        route: '/dashboard/chatbot',
    },
    {
        icon: '▦',
        title: 'Itineraries',
        description: 'Plan and manage your day-by-day CALABARZON trip itineraries',
        route: '/dashboard/itineraries',
    },
    {
        icon: '♡',
        title: 'Saved Places',
        description: 'View destinations you have saved and want to visit',
        route: '/dashboard/saved',
    },
    {
        icon: '◻',
        title: 'Packing Lists',
        description: 'Get smart packing suggestions based on your destination and weather',
        route: '/dashboard/packing',
    },
];

export default function FeatureShortcuts() {
    const navigate = useNavigate();

    return (
        <div className="shortcut-grid">
            {shortcuts.map((shortcut) => (
                <div
                    key={shortcut.title}
                    className="shortcut-card"
                    onClick={() => navigate(shortcut.route)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            navigate(shortcut.route);
                        }
                    }}
                >
                    <div className="shortcut-card-icon">{shortcut.icon}</div>
                    <div className="shortcut-card-title">{shortcut.title}</div>
                    <p className="shortcut-card-desc">{shortcut.description}</p>
                    <span className="shortcut-card-arrow">Open →</span>
                </div>
            ))}
        </div>
    );
}
