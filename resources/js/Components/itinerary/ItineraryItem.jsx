export default function ItineraryItem({ item }) {
    return (
        <div className="itin-row">
            <div className="itin-day">Day {item.day_number}</div>
            <div>
                <div className="itin-name">{item.custom_title || item.destination?.name}</div>
                <div className="itin-meta">{item.travel_time_minutes} mins · PHP {item.estimated_cost ?? 0}</div>
            </div>
        </div>
    );
}
