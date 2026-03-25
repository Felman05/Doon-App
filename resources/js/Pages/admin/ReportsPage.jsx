import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';

export default function ReportsPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [reportType, setReportType] = useState('bookings');
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [page, setPage] = useState(1);

    const { data: report, isLoading, refetch } = useQuery({
        queryKey: ['admin-report', reportType, startDate, endDate, page],
        queryFn: async () => {
            const { data } = await api.get('/admin/reports', { 
                params: { type: reportType, start_date: startDate, end_date: endDate, page }
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

    const reportRows = Array.isArray(report?.data) ? report.data : [];
    const reportLinks = Array.isArray(report?.links) ? report.links : [];

    const stripHtml = (value) => String(value ?? '').replace(/<[^>]*>/g, '');

    const topDestinationsText = (destinations) => {
        if (!Array.isArray(destinations) || destinations.length === 0) {
            return '-';
        }

        return destinations
            .slice(0, 3)
            .map((d) => `${d?.name || 'Unknown'} (${Number(d?.views || 0).toLocaleString()})`)
            .join(', ');
    };

    const handlePageChange = (url) => {
        if (!url) return;

        try {
            const parsed = new URL(url);
            const nextPage = parsed.searchParams.get('page');
            if (nextPage) {
                setPage(Number(nextPage));
            }
        } catch {
            // Ignore malformed pagination URLs.
        }
    };

    return (
        <div>
            <div style={{ background: 'var(--wh)', padding: '20px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Report Type</label>
                        <select value={reportType} onChange={(e) => {
                            setReportType(e.target.value);
                            setPage(1);
                        }} className="form-input">
                            <option value="bookings">Bookings</option>
                            <option value="revenue">Revenue</option>
                            <option value="users">Users</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Start Date</label>
                        <input value={startDate} onChange={(e) => {
                            setStartDate(e.target.value);
                            setPage(1);
                        }} type="date" className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">End Date</label>
                        <input value={endDate} onChange={(e) => {
                            setEndDate(e.target.value);
                            setPage(1);
                        }} type="date" className="form-input" />
                    </div>
                </div>
                <button onClick={() => {
                    setPage(1);
                    refetch();
                }} className="s-btn dark" style={{ marginRight: '8px' }}>Generate Report</button>
                <button onClick={() => exportMutation.mutate()} className="s-btn dark">Export CSV</button>
            </div>

            {report && (
                <div style={{ background: 'var(--wh)', padding: '20px', borderRadius: 'var(--r2)', border: '1px solid var(--bd)' }}>
                    <h3 style={{ marginBottom: '16px' }}>Report: {reportType.toUpperCase()}</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--bd)' }}>
                                    <th style={{ textAlign: 'left', padding: '10px 8px' }}>Province</th>
                                    <th style={{ textAlign: 'left', padding: '10px 8px' }}>Month</th>
                                    <th style={{ textAlign: 'right', padding: '10px 8px' }}>Total Visitors</th>
                                    <th style={{ textAlign: 'right', padding: '10px 8px' }}>Unique Visitors</th>
                                    <th style={{ textAlign: 'right', padding: '10px 8px' }}>Avg Rating</th>
                                    <th style={{ textAlign: 'left', padding: '10px 8px' }}>Top Destinations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportRows.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--bd)' }}>
                                        <td style={{ padding: '10px 8px', fontWeight: '600' }}>{item.province?.name || '-'}</td>
                                        <td style={{ padding: '10px 8px' }}>{String(item.report_month || '').slice(0, 10)}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>{Number(item.total_visitors || 0).toLocaleString()}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>{Number(item.unique_visitors || 0).toLocaleString()}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>{Number(item.avg_destination_rating || 0).toFixed(2)}</td>
                                        <td style={{ padding: '10px 8px', fontSize: '12px', color: 'var(--i3)' }}>{topDestinationsText(item.top_destinations)}</td>
                                    </tr>
                                ))}
                                {reportRows.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '16px 8px', color: 'var(--i4)' }}>
                                            No reports found for the selected date range.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {reportLinks.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                            {reportLinks.map((link, idx) => (
                                <button
                                    key={`${idx}-${link?.page ?? stripHtml(link?.label)}`}
                                    className={`s-btn ${link?.active ? 'dark' : ''}`}
                                    disabled={!link?.url}
                                    onClick={() => handlePageChange(link?.url)}
                                >
                                    {stripHtml(link?.label)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
