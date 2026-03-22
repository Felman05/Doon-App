export default function StatCard({ icon, label, value }) {
    return (
        <div style={{
            background: 'var(--wh)',
            padding: '20px',
            borderRadius: 'var(--r2)',
            border: '1px solid var(--bd)',
        }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--tx2)' }}>{label}</p>
            <h3 style={{ margin: '0', fontSize: '24px', fontWeight: '600' }}>{value}</h3>
        </div>
    );
}
