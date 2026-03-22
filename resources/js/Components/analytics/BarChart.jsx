import { useEffect, useState } from 'react';

export default function BarChart({ rows = [] }) {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(false);
        const timer = window.setTimeout(() => setAnimate(true), 350);
        return () => window.clearTimeout(timer);
    }, [rows]);

    return (
        <div className="bar-list">
            {rows.map((row) => (
                <div key={row.label} className="bar-row">
                    <span className="bar-lbl">{row.label}</span>
                    <div className="bar-bg"><div className="bar-f ac" data-w={`${row.percent}%`} style={{ width: animate ? `${row.percent}%` : '0%' }} /></div>
                    <span className="bar-val">{row.value}</span>
                </div>
            ))}
        </div>
    );
}
