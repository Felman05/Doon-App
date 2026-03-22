import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';

export default function ReportsPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [reportType, setReportType] = useState('bookings');
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const { data: report, isLoading, refetch } = useQuery({
        queryKey: ['admin-report', reportType, startDate, endDate],
        queryFn: async () => {
            const { data } = await api.get('/admin/reports', { 
                params: { type: reportType, start_date: startDate, end_date: endDate }
            });
            return data.data;
        },
    });

    const exportMutation = useMutation({
        mutationFn: () => api.get(`/admin/reports/export`, {
            params: { type: reportType, start_date: startDate, end_date: endDate },
            responseType: 'blob'
        }),
        onSuccess: (data) => {
            const url = window.URL.createObjectURL(data.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportType}-report.csv`;
            a.click();
            addToast?.('Report exported', 'success');
        },
    });

    return (
        <div>
            <div style={{ background: 'var(--wh)', padding: '20px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Report Type</label>
                        <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="form-input">
                            <option value="bookings">Bookings</option>
                            <option value="revenue">Revenue</option>
                            <option value="users">Users</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Start Date</label>
                        <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">End Date</label>
                        <input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" className="form-input" />
                    </div>
                </div>
                <button onClick={() => refetch()} className="s-btn dark" style={{ marginRight: '8px' }}>Generate Report</button>
                <button onClick={() => exportMutation.mutate()} className="s-btn dark">Export CSV</button>
            </div>

            {report && (
                <div style={{ background: 'var(--wh)', padding: '20px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)' }}>
                    <h3 style={{ marginBottom: '16px' }}>Report: {reportType.toUpperCase()}</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {Object.entries(report).map(([key, value]) => (
                                    <tr key={key} style={{ borderBottom: '1px solid var(--bd)' }}>
                                        <td style={{ padding: '8px', fontWeight: 'bold' }}>{key.replace(/_/g, ' ').toUpperCase()}</td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>{typeof value === 'number' ? value.toLocaleString() : value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
