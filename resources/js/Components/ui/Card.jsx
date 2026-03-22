export default function Card({ children, className = '' }) {
    return <div className={`dc ${className}`.trim()}>{children}</div>;
}
