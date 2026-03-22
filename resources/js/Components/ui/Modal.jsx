export default function Modal({ open, title, children, onClose }) {
    if (!open) return null;
    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="dc">
                <div className="dc-head">
                    <div className="dc-title">{title}</div>
                    <button type="button" className="s-btn" onClick={onClose}>Close</button>
                </div>
                {children}
            </div>
        </div>
    );
}
