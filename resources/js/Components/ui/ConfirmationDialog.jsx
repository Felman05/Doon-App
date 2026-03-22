import { useState } from 'react';

export default function ConfirmationDialog({ isOpen, title = 'Are you sure?', message = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', isDangerous = false, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-box" style={{ maxWidth: '380px' }}>
                <div style={{ marginBottom: '12px' }}>
                    <div className="dc-title">{title}</div>
                    {message && <p style={{ fontSize: '13px', color: 'var(--i3)', marginTop: '6px', lineHeight: '1.5' }}>{message}</p>}
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button onClick={onCancel} className="s-btn" style={{ border: '1px solid var(--bd)' }}>
                        {cancelLabel}
                    </button>
                    <button onClick={onConfirm} className={`s-btn ${isDangerous ? 'dark' : 'green'}`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
