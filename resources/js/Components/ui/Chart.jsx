import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Chart({ data, type = 'line' }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />
                <XAxis dataKey="name" stroke="var(--tx2)" />
                <YAxis stroke="var(--tx2)" />
                <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--wh)', border: '1px solid var(--bd)', borderRadius: 'var(--r1)' }}
                    labelStyle={{ color: 'var(--tx)' }}
                />
                <Legend />
                {data.length > 0 && Object.keys(data[0]).filter(key => key !== 'name').map((key, idx) => (
                    <Line 
                        key={key}
                        type="monotone" 
                        dataKey={key} 
                        stroke={['#3b82f6', '#ef4444', '#10b981', '#f59e0b'][idx % 4]}
                        dot={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}
