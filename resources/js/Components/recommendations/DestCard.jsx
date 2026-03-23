import { useNavigate } from 'react-router-dom';
import { weatherEmoji } from '../../lib/weatherUi';

export default function DestCard({ destination, onAddToItinerary, isSaved = false, onToggleSave, weather = [] }) {
    const navigate = useNavigate();

    const iconMap = {
        'beach-water': '🏖️',
        'nature-outdoor': '🌿',
        'cultural-heritage': '🏛️',
        'food-dining': '🍜',
        'adventure-sports': '⚡',
        accommodation: '🏨',
        'events-festivals': '🎉',
        'wellness-spa': '🧘',
        'shopping-markets': '🛍️',
    };

    const bannerColorMap = {
        'beach-water': '#e8f4fd',
        'nature-outdoor': '#edf5f0',
        'cultural-heritage': '#fdf3e8',
        'food-dining': '#fdeee9',
        'adventure-sports': '#fef9e7',
    };

    const numericRating = Number(destination.avg_rating);
    const ratingText = Number.isFinite(numericRating) ? numericRating.toFixed(1) : 'N/A';
    const categorySlug = destination.category?.slug;
    const provinceWeather = weather?.find((entry) => entry.province === destination.province?.name);

    return (
        <div className="rec-card">
            {provinceWeather ? (
                <span
                    style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontSize: 11,
                        background: 'rgba(255,255,255,0.9)',
                        padding: '2px 7px',
                        borderRadius: 100,
                        border: '1px solid var(--bd)',
                        zIndex: 1,
                    }}
                >
                    {weatherEmoji(provinceWeather.condition, provinceWeather.icon)} {provinceWeather.temperature}°
                </span>
            ) : null}
            <div
                className="rec-card-main"
                onClick={() => navigate(`/dashboard/destinations/${destination.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate(`/dashboard/destinations/${destination.id}`);
                    }
                }}
            >
                <div
                    className="rec-card-banner"
                    style={{ background: bannerColorMap[categorySlug] || 'var(--bg2)' }}
                    aria-hidden="true"
                >
                    <span className="rec-card-banner-emoji">{iconMap[categorySlug] || '📍'}</span>
                </div>
                <div className="rec-card-content">
                    <div className="dest-name">{destination.name}</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span className="pill p-n">{destination.province?.name}</span>
                        <span className="pill p-g">{destination.category?.name}</span>
                        <span className="pill p-y">{destination.price_label || 'N/A'}</span>
                    </div>
                    <div className="dest-meta">★ {ratingText} ({destination.total_reviews || 0})</div>
                </div>
            </div>
            <div className="rec-card-actions">
                <button
                    type="button"
                    className={`s-btn ${isSaved ? 'rec-save-btn-saved' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave?.(destination.id);
                    }}
                >
                    {isSaved ? 'Saved ♥' : 'Save ♡'}
                </button>
                <button
                    type="button"
                    className="s-btn dark"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToItinerary?.(destination);
                    }}
                >
                    + Itinerary
                </button>
            </div>
        </div>
    );
}
