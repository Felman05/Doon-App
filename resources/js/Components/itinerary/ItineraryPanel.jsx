import useItinerary from '../../hooks/useItinerary';
import ItineraryItem from './ItineraryItem';

export default function ItineraryPanel() {
    const { itinerariesQuery } = useItinerary();
    const itinerary = itinerariesQuery.data?.[0];

    if (!itinerary) {
        return <div className="itin-total-lbl">No itinerary yet.</div>;
    }

    return (
        <div className="itin">
            {itinerary.items?.map((item) => <ItineraryItem key={item.id} item={item} />)}
            <div className="itin-total">
                <span className="itin-total-lbl">Estimated total</span>
                <span className="itin-total-val">PHP {itinerary.budget_amount ?? 0}</span>
            </div>
        </div>
    );
}
