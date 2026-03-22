import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';

export default function Toast() {
    const { toasts } = useContext(ToastContext) || { toasts: [] };
    
    return (
        <div className="toast-stack">
            {toasts?.map(toast => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
