export default function ListingCard({ listing }) {
    return (
        <div className="list-item">
            <div style={{ flex: 1 }}>
                <div className="list-name">{listing.listing_title}</div>
                <div className="list-meta">{listing.listing_type}</div>
            </div>
            <span className="pill p-g">{listing.status}</span>
        </div>
    );
}
