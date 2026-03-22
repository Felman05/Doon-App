import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

export default function DestinationTable() {
    const { data = [] } = useQuery({
        queryKey: ['admin', 'destinations'],
        queryFn: async () => {
            const response = await api.get('/admin/destinations');
            return response.data.data?.data ?? [];
        },
    });

    return (
        <>
            <table className="d-table">
                <thead>
                    <tr><th>Name</th><th>Province</th><th>Category</th><th>Status</th></tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.province?.name ?? 'N/A'}</td>
                            <td>{item.category?.name ?? 'N/A'}</td>
                            <td>
                                <span className={`pill ${item.is_active ? 'p-g' : 'p-r'}`}>
                                    {item.is_active ? 'active' : 'inactive'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length === 0 ? <div className="alert info" style={{ marginTop: '10px' }}>No destinations available.</div> : null}
        </>
    );
}
