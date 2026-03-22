export default function Skeleton({ width = '100%', height = '20px', className = '' }) {
    return (
        <div
            className={`shimmer ${className}`}
            style={{
                width,
                height,
                borderRadius: 'var(--r)',
                display: 'inline-block'
            }}
        />
    );
}
