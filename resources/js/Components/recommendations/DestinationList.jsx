import DestCard from './DestCard';

export default function DestinationList({ destinations }) {
    return (
        <div className="dest-list">
            {destinations.map((destination) => (
                <DestCard key={destination.id} destination={destination} />
            ))}
        </div>
    );
}
