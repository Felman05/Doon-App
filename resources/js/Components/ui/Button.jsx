export default function Button({ children, className = '', ...props }) {
    return (
        <button type="button" className={className} {...props}>
            {children}
        </button>
    );
}
