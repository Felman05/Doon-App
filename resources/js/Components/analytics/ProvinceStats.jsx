import useAnalytics from '../../hooks/useAnalytics';
import BarChart from './BarChart';

export default function ProvinceStats({ queryKey, endpoint }) {
    const { provinceStats } = useAnalytics({ queryKey, endpoint });
    const rows = (provinceStats.data ?? []).map((item) => ({
        label: `Province ${item.province_id}`,
        value: item.total,
        percent: Math.min(100, Number(item.total || 0)),
    }));

    return <BarChart rows={rows} />;
}
