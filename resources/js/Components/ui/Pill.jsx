export default function Pill({ children, variant = 'p-n' }) {
    return <span className={`pill ${variant}`}>{children}</span>;
}
