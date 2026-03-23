import WeatherStrip from '../../components/weather/WeatherStrip';
import ItineraryPanel from '../../components/itinerary/ItineraryPanel';
import FeatureShortcuts from '../../components/tourist/FeatureShortcuts';
import { buildWeatherAdvisory } from '../../lib/weatherUi';

export default function TouristHome({ weatherState }) {
    const { weather = [], isLoading = false, isError = false } = weatherState || {};
    const advisory = buildWeatherAdvisory(weather);

    return (
        <>
            <div className="dc mb16 sr d1">
                <div className="dc-title">Live Weather</div>
                <WeatherStrip weather={weather} isLoading={isLoading} isError={isError} />
                <div
                    style={{
                        padding: '10px 16px',
                        borderRadius: 'var(--r2)',
                        fontSize: '13px',
                        fontWeight: 500,
                        borderLeft: `3px solid ${advisory.borderColor}`,
                        marginTop: '10px',
                        background: advisory.background,
                    }}
                >
                    {advisory.text}
                </div>
            </div>

            <div className="dc mb16 sr d2">
                <div className="dc-title" style={{ marginBottom: '12px' }}>Quick Access</div>
                <FeatureShortcuts />
            </div>

            <div className="dc sr d3">
                <div className="dc-title" style={{ marginBottom: '10px' }}>Your active itinerary</div>
                <ItineraryPanel />
            </div>
        </>
    );
}
