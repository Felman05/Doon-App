import useItinerary from '../../hooks/useItinerary';
import { useNavigate } from 'react-router-dom';

export default function ItineraryPanel() {
    const navigate = useNavigate();
    const { activeItinerary, isLoading } = useItinerary();

    if (isLoading) {
        return <div className="shimmer" style={{ minHeight: '120px', borderRadius: 'var(--r2)' }} />;
    }

    if (!activeItinerary) {
        return (
            <div style={{ textAlign: 'center', padding: '14px' }}>
                <div className="itin-name" style={{ marginBottom: '4px' }}>No active itinerary</div>
                <div className="itin-total-lbl" style={{ marginBottom: '10px' }}>Start planning your CALABARZON trip</div>
                <button
                    type="button"
                    className="s-btn dark"
                    onClick={() => navigate('/dashboard/itineraries')}
                >
                    Create itinerary →
                </button>
            </div>
        );
    }

    const totalCost = Number(activeItinerary.total_estimated_cost || 0);

    return (
        <div className="itin">
            <div style={{ marginBottom: '8px' }}>
                <div className="itin-name">{activeItinerary.title}</div>
                <div className="itin-meta">
                    {activeItinerary.start_date || 'No start date'} - {activeItinerary.end_date || 'No end date'}
                </div>
            </div>

            {(activeItinerary.items || []).map((item) => (
                <div key={item.id} className="itin-row">
                    <span className="itin-day">Day {item.day_number}</span>
                    <div style={{ flex: 1 }}>
                        <div className="itin-name">{item.destination_name || item.destination?.name || 'Stop'}</div>
                        <div className="itin-meta">{item.arrival_time || 'TBD'} • ₱{item.estimated_cost || 0}</div>
                    </div>
                </div>
            ))}

            <div className="itin-total">
                <span className="itin-total-lbl">Estimated total</span>
                <span className="itin-total-val">₱{totalCost.toLocaleString()}</span>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" className="s-btn" onClick={() => navigate('/dashboard/itineraries')}>Edit</button>
            </div>
        </div>
    );
}
