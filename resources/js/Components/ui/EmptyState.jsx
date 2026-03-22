export default function EmptyState({ icon = '📭', title = 'No items', message = '', action = null, actionLabel = 'Learn more' }) {
    return (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--i3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--i)', marginBottom: '8px' }}>{title}</div>
            {message && <p style={{ fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>{message}</p>}
            {action && (
                <button onClick={action} className="s-btn dark">
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
