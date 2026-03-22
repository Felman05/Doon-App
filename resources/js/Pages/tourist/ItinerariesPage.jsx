import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';

export default function ItinerariesPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [selectedId, setSelectedId] = useState(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newProvince, setNewProvince] = useState('');
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');

    const { data: itineraries = [], isLoading } = useQuery({
        queryKey: ['itineraries'],
        queryFn: async () => {
            const { data } = await api.get('/itineraries');
            return data.data ?? [];
        },
    });

    const selected = itineraries.find(i => i.id === selectedId);

    const createMutation = useMutation({
        mutationFn: () => api.post('/itineraries', {
            title: newTitle,
            province_id: newProvince,
            start_date: newStartDate,
            end_date: newEndDate,
        }),
        onSuccess: () => {
            addToast?.('Itinerary created!', 'success');
            setShowNewForm(false);
            setNewTitle('');
        },
    });

    const shareMutation = useMutation({
        mutationFn: () => api.get(`/itineraries/${selectedId}/share`),
        onSuccess: (res) => {
            addToast?.('Share link copied to clipboard!', 'success');
            navigator.clipboard.writeText(`${window.location.origin}/itineraries/${res.data.data.token}`);
        },
    });

    return (
        <>
            <button onClick={() => setShowNewForm(true)} className="s-btn dark" style={{ marginBottom: '16px' }}>
                ➕ New Itinerary
            </button>

            <div className="g2">
                {/* List */}
                <div className="dc sr d1">
                    <div className="dc-title" style={{ marginBottom: '12px' }}>My Itineraries</div>
                    {isLoading ? (
                        <Skeleton height="300px" />
                    ) : itineraries.length ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {itineraries.map(itin => (
                                <div
                                    key={itin.id}
                                    onClick={() => setSelectedId(itin.id)}
                                    style={{
                                        padding: '12px 14px',
                                        borderRadius: 'var(--r)',
                                        background: selectedId === itin.id ? 'var(--acb)' : 'var(--bg)',
                                        border: `1px solid ${selectedId === itin.id ? 'var(--acbd)' : 'var(--bd)'}`,
                                        cursor: 'pointer',
                                        transition: 'all .1s',
                                    }}
                                >
                                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--i)' }}>{itin.title}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--i4)', marginTop: '4px' }}>
                                        {itin.start_date} → {itin.end_date}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--i4)' }}>
                                        {itin.items?.length || 0} stops
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon="📋" title="No itineraries" message="Create your first itinerary to start planning!" />
                    )}
                </div>

                {/* Detail */}
                {selected ? (
                    <div className="dc sr d2">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <input
                                value={selected.title}
                                onChange={(e) => {}}
                                style={{ flex: 1, fontSize: '16px', fontWeight: '600', border: 'none', background: 'transparent', color: 'var(--i)', outline: 'none' }}
                            />
                            <button onClick={() => shareMutation.mutate()} className="s-btn">
                                🔗 Share
                            </button>
                        </div>

                        <div style={{ fontSize: '12px', color: 'var(--i3)', marginBottom: '16px' }}>
                            {selected.start_date} - {selected.end_date}
                        </div>

                        <div className="sub-lbl">Items</div>
                        {selected.items?.length ? (
                            <div className="itin">
                                {selected.items.map((item, i) => (
                                    <div key={i} className="itin-row">
                                        <span className="itin-day">Day {i + 1}</span>
                                        <div style={{ flex: 1 }}>
                                            <div className="itin-name">{item.destination_name}</div>
                                            <div className="itin-meta">{item.estimated_duration} hrs • {item.estimated_cost} ₱</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '12px', color: 'var(--i4)' }}>No items added yet</p>
                        )}

                        {selected.items && (
                            <div style={{ marginTop: '16px', fontWeight: '600', fontSize: '14px', color: 'var(--i)' }}>
                                Total: ₱{selected.items.reduce((sum, item) => sum + (item.estimated_cost || 0), 0)}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="dc sr d2">
                        <EmptyState icon="📋" title="Select an itinerary" message="Click an itinerary on the left to view details." />
                    </div>
                )}
            </div>

            {/* New form modal */}
            {showNewForm && (
                <div className="modal-backdrop" onClick={() => setShowNewForm(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="dc-title" style={{ marginBottom: '16px' }}>New Itinerary</div>
                        <input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="form-input" style={{ marginBottom: '12px' }} />
                        <select value={newProvince} onChange={(e) => setNewProvince(e.target.value)} className="form-input" style={{ marginBottom: '12px' }}>
                            <option>Select province</option>
                            {['Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} className="form-input" style={{ marginBottom: '12px' }} />
                        <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} className="form-input" style={{ marginBottom: '16px' }} />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowNewForm(false)} className="s-btn">Cancel</button>
                            <button onClick={() => createMutation.mutate()} className="s-btn dark">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
