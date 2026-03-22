import CountUp from '../ui/CountUp';

export default function KpiRow({ stats = [] }) {
    return (
        <div className="kpi-row c4">
            {stats.map((item) => (
                <div key={item.label} className="kpi">
                    <div className="kpi-lbl">{item.label}</div>
                    <div className="kpi-val"><CountUp value={item.value} /></div>
                </div>
            ))}
        </div>
    );
}
