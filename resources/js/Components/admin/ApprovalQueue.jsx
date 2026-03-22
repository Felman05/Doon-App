import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

export default function ApprovalQueue() {
    const queryClient = useQueryClient();
    const { data = [] } = useQuery({
        queryKey: ['admin', 'approval-queue'],
        queryFn: async () => {
            const { data } = await api.get('/admin/approval-queue');
            return data.data?.data ?? [];
        },
    });

    const approveMutation = useMutation({
        mutationFn: async (id) => api.post(`/admin/approval-queue/${id}/approve`),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin', 'approval-queue'] });
            await queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async (id) => api.post(`/admin/approval-queue/${id}/reject`, { reason: 'Rejected by admin' }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin', 'approval-queue'] });
            await queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        },
    });

    return (
        <div>
            {data.length === 0 ? <div className="alert info">No pending listing approvals.</div> : null}
            {data.map((item) => (
                <div key={item.id} className="appr-item">
                    <div style={{ flex: 1 }}>
                        <div className="appr-name">{item.listing_title}</div>
                        <div className="appr-meta">{item.listing_type} · {item.status}</div>
                    </div>
                    <div className="appr-btns">
                        <button type="button" className="btn-ok" onClick={() => approveMutation.mutate(item.id)} disabled={approveMutation.isPending || rejectMutation.isPending}>Approve</button>
                        <button type="button" className="btn-no" onClick={() => rejectMutation.mutate(item.id)} disabled={approveMutation.isPending || rejectMutation.isPending}>Reject</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
