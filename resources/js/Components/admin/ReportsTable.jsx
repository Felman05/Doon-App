import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

export default function ReportsTable() {
    const { data = [] } = useQuery({
        queryKey: ['admin', 'reports'],
        queryFn: async () => {
            const response = await api.get('/admin/reports');
            return response.data.data?.data ?? [];
        },
    });

    return (
        <>
            <table className="d-table">
                <thead>
                    <tr><th>Province</th><th>Month</th><th>Total Visitors</th><th>Unique Visitors</th></tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.province?.name ?? 'N/A'}</td>
                            <td>{item.report_month}</td>
                            <td>{item.total_visitors ?? 0}</td>
                            <td>{item.unique_visitors ?? 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length === 0 ? <div className="alert info" style={{ marginTop: '10px' }}>No LGU reports generated yet.</div> : null}
        </>
    );
}
