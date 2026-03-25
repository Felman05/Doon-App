import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useMemo, useState, useCallback, memo } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import Skeleton from '../../components/ui/Skeleton';

const KPIDashboard = memo(({ dashboard, kpiLoading }) => (
    <div className="kpi-row c4 mb20">
        <div className="kpi sr">
            <div className="kpi-lbl">Total Users</div>
            <div className="kpi-val">{kpiLoading ? <Skeleton height="28px" /> : dashboard?.total_users || 0}</div>
        </div>
        <div className="kpi sr d1">
            <div className="kpi-lbl">Destinations</div>
            <div className="kpi-val">{kpiLoading ? <Skeleton height="28px" /> : dashboard?.destinations || 0}</div>
        </div>
        <div className="kpi sr d2">
            <div className="kpi-lbl">Pending Listings</div>
            <div className="kpi-val">{kpiLoading ? <Skeleton height="28px" /> : dashboard?.pending_listings || 0}</div>
        </div>
        <div className="kpi sr d3">
            <div className="kpi-lbl">Monthly AI Requests</div>
            <div className="kpi-val">{kpiLoading ? <Skeleton height="28px" /> : dashboard?.monthly_requests || 0}</div>
        </div>
    </div>
));

const ProvinceTrafficCard = memo(({ provinceTraffic, trafficLoading, maxVisitors }) => (
    <div className="dc sr d1">
        <div className="dc-title">Province Traffic</div>
        {trafficLoading ? <Skeleton height="160px" /> : (
            <div className="bar-list">
                {provinceTraffic.map((prov) => {
                    const width = `${((Number(prov.visitors || 0) / maxVisitors) * 100).toFixed(2)}%`;
                    return (
                        <div key={prov.province} className="bar-row">
                            <div className="bar-lbl">{prov.province}</div>
                            <div className="bar-bg">
                                <div className="bar-f ac" style={{ width }}></div>
                            </div>
                            <div className="bar-val">{prov.visitors || 0}</div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
));

const QuickActionsCard = memo(({ onViewApprovals }) => (
    <div className="dc sr d2">
        <div className="dc-title">Quick Actions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button type="button" className="s-btn dark" onClick={onViewApprovals}>📋 Review Approvals</button>
            <button type="button" className="s-btn" onClick={() => window.location.assign('/admin/reviews')}>⚠️ Flagged Reviews</button>
            <button type="button" className="s-btn" onClick={() => window.location.assign('/admin/users')}>👥 Manage Users</button>
        </div>
    </div>
));

const TopDestinationsCard = memo(({ topDestinations, topDestLoading }) => (
    <div className="dc sr d2">
        <div className="dc-title">Top Destinations</div>
        {topDestLoading ? <Skeleton height="150px" /> : topDestinations.map((dest) => (
            <div key={dest.id} style={{ fontSize: '13px', padding: '8px 0', borderBottom: '1px solid var(--bd)' }}>
                <div style={{ fontWeight: '600' }}>{dest.name} <span style={{ color: 'var(--i4)', fontWeight: 400 }}>({dest.province})</span></div>
                <div style={{ fontSize: '11px', color: 'var(--i4)' }}>{dest.views} views • ⭐ {Number(dest.avg_rating || 0).toFixed(1)}</div>
            </div>
        ))}
    </div>
));

const SystemAlertsCard = memo(({ alerts, alertsLoading }) => {
    const alertClassMap = {
        warning: 'warn',
        error: 'err',
        info: 'info',
        success: 'ok',
    };
    return (
        <div className="dc sr d3">
            <div className="dc-title">System Alerts</div>
            {alertsLoading ? <Skeleton height="150px" /> : alerts.map((alert, index) => (
                <div key={`${alert.type}-${index}`} className={`alert ${alertClassMap[alert.type] || 'info'}`}>
                    {alert.message}
                </div>
            ))}
        </div>
    );
});

const ApprovalRow = memo(({ row, approvalStatus, rejectingId, rejectReason, onReject, onApprove, onRejectClick, onRejectChange, onRejectCancel }) => (
    <div className="appr-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div>
                <div className="appr-name">{row.listing_title || row.destination?.name || 'Listing'}</div>
                <div className="appr-meta">
                    {row.provider?.business_name || row.provider?.user?.name || 'Provider'} • {row.status}
                </div>
            </div>
            {approvalStatus === 'pending' ? (
                <div className="appr-btns">
                    <button type="button" className="btn-ok" onClick={() => onApprove(row.id)}>Approve</button>
                    <button type="button" className="btn-no" onClick={() => onRejectClick(row.id)}>Reject</button>
                </div>
            ) : null}
        </div>
        {rejectingId === row.id ? (
            <div style={{ marginTop: '10px' }}>
                <textarea
                    className="form-input"
                    placeholder="Reason for rejection..."
                    value={rejectReason}
                    onChange={onRejectChange}
                    style={{ minHeight: '70px' }}
                />
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <button
                        type="button"
                        className="btn-no"
                        onClick={() => onReject(row.id, rejectReason)}
                    >
                        Confirm Reject
                    </button>
                    <button type="button" className="s-btn" onClick={onRejectCancel}>Cancel</button>
                </div>
            </div>
        ) : null}
    </div>
));

const UserRow = memo(({ user, optimisticActive, onToggleActive }) => (
    <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{user.role}</td>
        <td>
            <span className={`pill ${optimisticActive ? 'p-g' : 'p-r'}`}>
                {optimisticActive ? 'active' : 'inactive'}
            </span>
        </td>
        <td>
            <button type="button" className="s-btn" onClick={() => onToggleActive(user.id)}>
                Toggle Active
            </button>
        </td>
    </tr>
));

function AdminHome() {
    const queryClient = useQueryClient();
    const { addToast } = useContext(ToastContext) || {};

    const [approvalStatus, setApprovalStatus] = useState('pending');
    const [approvalRows, setApprovalRows] = useState([]);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [optimisticUsers, setOptimisticUsers] = useState({});

    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    const handleViewApprovals = useCallback(() => setApprovalStatus('pending'), []);
    const handleApprovalStatusChange = useCallback((status) => setApprovalStatus(status), []);
    const handleSearchChange = useCallback((e) => setSearchInput(e.target.value), []);
    const handleRoleFilterChange = useCallback((e) => setRoleFilter(e.target.value), []);
    const handleStatusFilterChange = useCallback((e) => setStatusFilter(e.target.value), []);
    const handleProvinceChange = useCallback((e) => setSelectedProvinceId(e.target.value), []);
    const handleMonthChange = useCallback((e) => setReportMonth(e.target.value), []);
    const handleGenerateReport = useCallback(() => generateReportMutation.mutate(), []);
    const handleRejectReasonChange = useCallback((e) => setRejectReason(e.target.value), []);
    const handleRejectClick = useCallback((id) => {
        setRejectingId(id);
        setRejectReason('');
    }, []);
    const handleRejectCancel = useCallback(() => setRejectingId(null), []);

    const { data: dashboard, isLoading: kpiLoading } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: async () => {
            const { data } = await api.get('/admin/dashboard');
            return data.kpis || {};
        },
        retry: 1,
        staleTime: 3 * 60 * 1000,
    });

    const { data: provinceTraffic = [], isLoading: trafficLoading } = useQuery({
        queryKey: ['admin-province-traffic'],
        queryFn: async () => {
            const { data } = await api.get('/admin/province-traffic');
            return data.data || [];
        },
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    const { data: alerts = [], isLoading: alertsLoading } = useQuery({
        queryKey: ['admin-alerts'],
        queryFn: async () => {
            const { data } = await api.get('/admin/alerts');
            return data.alerts || [];
        },
        retry: 1,
        staleTime: 2 * 60 * 1000,
    });

    const { data: topDestinations = [], isLoading: topDestLoading } = useQuery({
        queryKey: ['admin-top-destinations'],
        queryFn: async () => {
            const { data } = await api.get('/admin/top-destinations');
            return data.data || [];
        },
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    const { data: approvals, isLoading: approvalsLoading } = useQuery({
        queryKey: ['admin-approvals', approvalStatus],
        queryFn: async () => {
            const { data } = await api.get('/admin/approvals', {
                params: { status: approvalStatus },
            });
            return data;
        },
        retry: 1,
        staleTime: 2 * 60 * 1000,
    });

    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users', debouncedSearch, roleFilter, statusFilter],
        queryFn: async () => {
            const { data } = await api.get('/admin/users', {
                params: {
                    search: debouncedSearch || undefined,
                    role: roleFilter || undefined,
                    status: statusFilter || undefined,
                },
            });
            return data;
        },
        retry: 1,
        staleTime: 2 * 60 * 1000,
    });

    const { data: provincesData = [] } = useQuery({
        queryKey: ['all-provinces-admin'],
        queryFn: async () => {
            const { data } = await api.get('/provinces');
            return data.data || [];
        },
        retry: 1,
        staleTime: 10 * 60 * 1000,
    });

    const { data: reportsData = [] } = useQuery({
        queryKey: ['admin-lgu-reports'],
        queryFn: async () => {
            const { data } = await api.get('/admin/reports');
            return data.data?.data || data.data || [];
        },
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    const { data: monthlyProvinceReport, isLoading: monthlyReportLoading } = useQuery({
        queryKey: ['province-monthly', selectedProvinceId, reportMonth],
        queryFn: async () => {
            if (!selectedProvinceId) return null;
            const { data } = await api.get(`/analytics/provinces/${selectedProvinceId}/monthly`, {
                params: { month: reportMonth },
            });
            return data.data;
        },
        enabled: Boolean(selectedProvinceId),
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (!selectedProvinceId && provincesData.length) {
            setSelectedProvinceId(String(provincesData[0].id));
        }
    }, [selectedProvinceId, provincesData]);

    useEffect(() => {
        setApprovalRows(approvals?.data || []);
    }, [approvals]);

    const approveMutation = useMutation({
        mutationFn: async (id) => {
            const previousRows = approvalRows;
            setApprovalRows((rows) => rows.filter((row) => row.id !== id));
            try {
                await api.post(`/admin/approvals/${id}/approve`);
                addToast?.('Listing approved and is now live', 'success');
                queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
                queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
            } catch (error) {
                setApprovalRows(previousRows);
                addToast?.('Failed to approve listing', 'error');
                throw error;
            }
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }) => {
            await api.post(`/admin/approvals/${id}/reject`, { reason });
        },
        onSuccess: (_, vars) => {
            setApprovalRows((rows) => rows.filter((row) => row.id !== vars.id));
            setRejectingId(null);
            setRejectReason('');
            addToast?.('Listing rejected - provider notified', 'info');
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
        },
        onError: () => {
            addToast?.('Failed to reject listing', 'error');
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: async (id) => {
            const { data } = await api.put(`/admin/users/${id}/toggle-active`);
            return { id, ...data };
        },
        onMutate: (id) => {
            setOptimisticUsers((prev) => ({
                ...prev,
                [id]: !(usersData?.data || []).find((row) => row.id === id)?.is_active,
            }));
        },
        onSuccess: (res) => {
            setOptimisticUsers((prev) => ({
                ...prev,
                [res.id]: res.is_active,
            }));
            addToast?.(res.message, 'success');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (_, id) => {
            setOptimisticUsers((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
            addToast?.('Unable to update user status', 'error');
        },
    });

    const generateReportMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/analytics/reports/generate', {
                province_id: Number(selectedProvinceId),
                month: reportMonth,
            });
            return data;
        },
        onSuccess: (data) => {
            addToast?.(data.message || 'Report generated', 'success');
            queryClient.invalidateQueries({ queryKey: ['admin-lgu-reports'] });
            queryClient.invalidateQueries({ queryKey: ['province-monthly', selectedProvinceId, reportMonth] });
        },
        onError: () => {
            addToast?.('Failed to generate report', 'error');
        },
    });

    const maxVisitors = useMemo(() => {
        return Math.max(1, ...provinceTraffic.map((item) => Number(item.visitors || 0)));
    }, [provinceTraffic]);

    const topReportStats = useMemo(() => {
        return [...reportsData]
            .sort((a, b) => Number(b.total_visitors || 0) - Number(a.total_visitors || 0))
            .slice(0, 3);
    }, [reportsData]);

    const users = usersData?.data || [];
    const pendingBadge = dashboard?.pending_listings || 0;

    return (
        <>
            <KPIDashboard dashboard={dashboard} kpiLoading={kpiLoading} />

            <div className="g2 mb16">
                <ProvinceTrafficCard provinceTraffic={provinceTraffic} trafficLoading={trafficLoading} maxVisitors={maxVisitors} />
                <QuickActionsCard onViewApprovals={handleViewApprovals} />
            </div>

            <div className="g2">
                <TopDestinationsCard topDestinations={topDestinations} topDestLoading={topDestLoading} />
                <SystemAlertsCard alerts={alerts} alertsLoading={alertsLoading} />
            </div>

            <div className="dc sr d2" style={{ marginTop: '16px' }}>
                <div className="dc-head">
                    <div>
                        <div className="dc-title">Approval Queue</div>
                        <div className="dc-sub">Review provider submissions</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" className={`s-btn ${approvalStatus === 'pending' ? 'dark' : ''}`} onClick={() => handleApprovalStatusChange('pending')}>
                            Pending <span className="sb-badge" style={{ marginLeft: '6px' }}>{pendingBadge}</span>
                        </button>
                        <button type="button" className={`s-btn ${approvalStatus === 'active' ? 'dark' : ''}`} onClick={() => handleApprovalStatusChange('active')}>Approved</button>
                        <button type="button" className={`s-btn ${approvalStatus === 'rejected' ? 'dark' : ''}`} onClick={() => handleApprovalStatusChange('rejected')}>Rejected</button>
                    </div>
                </div>

                {approvalsLoading ? <Skeleton height="180px" /> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {approvalRows.length === 0 ? <div style={{ fontSize: '13px', color: 'var(--i4)' }}>No listings found for this status.</div> : approvalRows.map((row) => (
                            <ApprovalRow 
                                key={row.id}
                                row={row}
                                approvalStatus={approvalStatus}
                                rejectingId={rejectingId}
                                rejectReason={rejectReason}
                                onReject={(id, reason) => rejectMutation.mutate({ id, reason })}
                                onApprove={(id) => approveMutation.mutate(id)}
                                onRejectClick={handleRejectClick}
                                onRejectChange={handleRejectReasonChange}
                                onRejectCancel={handleRejectCancel}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="dc sr d3" style={{ marginTop: '16px' }}>
                <div className="dc-title" style={{ marginBottom: '12px' }}>User Management</div>

                <div className="form-row" style={{ marginBottom: '12px' }}>
                    <input
                        className="form-input"
                        placeholder="Search name or email"
                        value={searchInput}
                        onChange={handleSearchChange}
                    />
                    <select className="form-input" value={roleFilter} onChange={handleRoleFilterChange}>
                        <option value="">All roles</option>
                        <option value="tourist">Tourist</option>
                        <option value="local">Local</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="form-row" style={{ marginBottom: '12px' }}>
                    <select className="form-input" value={statusFilter} onChange={handleStatusFilterChange}>
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <div></div>
                </div>

                {usersLoading ? <Skeleton height="220px" /> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="d-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => {
                                    const computedActive = optimisticUsers[user.id] ?? user.is_active;
                                    return (
                                        <UserRow 
                                            key={user.id}
                                            user={user}
                                            optimisticActive={computedActive}
                                            onToggleActive={(id) => toggleActiveMutation.mutate(id)}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="dc sr d4" style={{ marginTop: '16px' }}>
                <div className="dc-head">
                    <div>
                        <div className="dc-title">LGU Reports</div>
                        <div className="dc-sub">Generate and review provincial monthly reports</div>
                    </div>
                </div>

                <div className="form-row" style={{ marginBottom: '12px' }}>
                    <select
                        className="form-input"
                        value={selectedProvinceId}
                        onChange={handleProvinceChange}
                    >
                        {provincesData.map((province) => (
                            <option key={province.id} value={province.id}>{province.name}</option>
                        ))}
                    </select>
                    <input
                        type="month"
                        className="form-input"
                        value={reportMonth}
                        onChange={handleMonthChange}
                    />
                </div>

                <button
                    type="button"
                    className="s-btn dark"
                    onClick={handleGenerateReport}
                    disabled={!selectedProvinceId || generateReportMutation.isPending}
                >
                    {generateReportMutation.isPending ? 'Generating...' : 'Generate'}
                </button>

                <div className="kpi-row c3" style={{ marginTop: '16px' }}>
                    {topReportStats.map((report) => (
                        <div className="kpi" key={report.id}>
                            <div className="kpi-lbl">{report.province?.name || 'Province'}</div>
                            <div className="kpi-val">{report.total_visitors || 0}</div>
                            <div className="kpi-sub">Total visitors</div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--i3)' }}>
                    {monthlyReportLoading ? <Skeleton height="20px" /> : (
                        monthlyProvinceReport
                            ? `Selected month visitors: ${monthlyProvinceReport.total_visitors || 0}`
                            : 'No report for selected period yet.'
                    )}
                </div>
            </div>
        </>
    );
}

export default memo(AdminHome);
