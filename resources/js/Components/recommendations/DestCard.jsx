export default function DestCard({ destination }) {
    return (
        <div className="dest-row">
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="dest-name">{destination.name}</div>
                <div className="dest-meta">{destination.province?.name} · {destination.category?.name}</div>
            </div>
            <div className="dest-rating">{destination.avg_rating ?? 0} ★</div>
        </div>
    );
}
