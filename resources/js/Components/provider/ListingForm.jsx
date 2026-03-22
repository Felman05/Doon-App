export default function ListingForm() {
    return (
        <div style={{ display: 'grid', gap: '10px' }}>
            <input className="rf-ctrl" placeholder="Listing title" />
            <select className="rf-ctrl"><option>Tour Package</option></select>
            <button type="button" className="s-btn dark">Submit for review</button>
        </div>
    );
}
