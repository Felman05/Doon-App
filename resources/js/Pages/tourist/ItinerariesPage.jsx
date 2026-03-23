import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { weatherEmoji } from '../../lib/weatherUi';

const DATE_FORMAT_OPTIONS = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
};

const BUDGET_OPTIONS = [
    { value: 'free', label: 'Free' },
    { value: 'budget', label: 'Budget' },
    { value: 'mid_range', label: 'Mid-range' },
    { value: 'luxury', label: 'Luxury' },
];

function formatDate(date) {
    if (!date) return 'No date';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'No date';
    return parsed.toLocaleDateString('en-PH', DATE_FORMAT_OPTIONS);
}

function formatDateRange(startDate, endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatBudgetLabel(budget) {
    if (!budget) return 'N/A';
    return String(budget).replace('_', '-');
}

export default function ItinerariesPage({ weatherState }) {
    const weather = weatherState?.weather ?? [];
    const queryClient = useQueryClient();
    const { addToast } = useContext(ToastContext) || {};
    const [selectedItineraryId, setSelectedItineraryId] = useState(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newForm, setNewForm] = useState({
        title: '',
        province_id: '',
        start_date: '',
        end_date: '',
        budget_label: '',
        number_of_people: 1,
    });

    const { data: itineraries = [], isLoading } = useQuery({
        queryKey: ['itineraries'],
        queryFn: async () => {
            const { data } = await api.get('/itineraries');
            return data.data ?? [];
        },
    });

    const { data: provinces = [] } = useQuery({
        queryKey: ['provinces'],
        queryFn: async () => {
            const { data } = await api.get('/provinces');
            return data.data ?? [];
        },
    });

    useEffect(() => {
        if (!selectedItineraryId && itineraries.length > 0) {
            setSelectedItineraryId(itineraries[0].id);
        }
    }, [itineraries, selectedItineraryId]);

    const {
        data: selectedItinerary,
        isLoading: isDetailLoading,
    } = useQuery({
        queryKey: ['itinerary-detail', selectedItineraryId],
        enabled: !!selectedItineraryId,
        queryFn: async () => {
            const { data } = await api.get(`/itineraries/${selectedItineraryId}`);
            return data.data ?? null;
        },
    });

    const createMutation = useMutation({
        mutationFn: () => api.post('/itineraries', {
            title: newForm.title,
            province_id: newForm.province_id ? Number(newForm.province_id) : null,
            start_date: newForm.start_date || null,
            end_date: newForm.end_date || null,
            budget_label: newForm.budget_label || null,
            number_of_people: Number(newForm.number_of_people || 1),
        }),
        onSuccess: async (res) => {
            addToast?.('Itinerary created!', 'success');
            setShowNewForm(false);
            setNewForm({
                title: '',
                province_id: '',
                start_date: '',
                end_date: '',
                budget_label: '',
                number_of_people: 1,
            });
            await queryClient.invalidateQueries({ queryKey: ['itineraries'] });
            const createdId = res?.data?.data?.id;
            if (createdId) {
                setSelectedItineraryId(createdId);
            }
        },
    });

    const shareMutation = useMutation({
        mutationFn: () => api.get(`/itineraries/${selectedItineraryId}/share`),
        onSuccess: (res) => {
            addToast?.('Share link copied to clipboard!', 'success');
            navigator.clipboard.writeText(`${window.location.origin}/itineraries/${res.data.data.token}`);
        },
    });

    const detailStops = (selectedItinerary?.items ?? [])
        .slice()
        .sort((a, b) => (a.day_number - b.day_number) || (a.order_index - b.order_index));

    const totalCost = detailStops.reduce((sum, item) => sum + Number(item.estimated_cost || 0), 0);

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
                                    onClick={() => setSelectedItineraryId(itin.id)}
                                    style={{
                                        padding: '12px 14px',
                                        borderRadius: 'var(--r)',
                                        background: selectedItineraryId === itin.id ? 'var(--acb)' : 'var(--bg)',
                                        border: `1px solid ${selectedItineraryId === itin.id ? 'var(--acbd)' : 'var(--bd)'}`,
                                        cursor: 'pointer',
                                        transition: 'all .1s',
                                    }}
                                >
                                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--i)' }}>{itin.title}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--i4)', marginTop: '4px' }}>
                                        {formatDateRange(itin.start_date, itin.end_date)}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--i4)' }}>
                                        {itin.stops_count ?? itin.items_count ?? itin.items?.length ?? 0} stops
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon="📋" title="No itineraries" message="Create your first itinerary to start planning!" />
                    )}
                </div>

                {/* Detail */}
                {selectedItineraryId ? (
                    <div className="dc sr d2">
                        {isDetailLoading || !selectedItinerary ? (
                            <Skeleton height="340px" />
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ flex: 1, fontSize: '16px', fontWeight: '600', color: 'var(--i)' }}>
                                        {selectedItinerary.title}
                                    </div>
                                    <button onClick={() => shareMutation.mutate()} className="s-btn" disabled={shareMutation.isPending}>
                                        🔗 Share
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--i3)' }}><strong>Date:</strong> {formatDateRange(selectedItinerary.start_date, selectedItinerary.end_date)}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--i3)' }}><strong>Province:</strong> {selectedItinerary.province || 'N/A'}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--i3)' }}><strong>Budget:</strong> {formatBudgetLabel(selectedItinerary.budget_label)}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--i3)' }}><strong>People:</strong> {selectedItinerary.number_of_people || 1}</div>
                                </div>

                                <div className="sub-lbl">Day-by-day stops</div>
                                {detailStops.length ? (
                                    <div className="itin">
                                        {detailStops.map((item) => {
                                            const stopProvince = item.province || selectedItinerary.province;
                                            const stopWeather = weather.find((entry) => entry.province === stopProvince);

                                            return (
                                            <div key={item.id} className="itin-row">
                                                <span className="itin-day">Day {item.day_number || 1}</span>
                                                <div style={{ flex: 1 }}>
                                                    <div className="itin-name">
                                                        {item.destination_name || 'Stop'}
                                                        <span style={{ fontSize: 11, color: 'var(--i4)', marginLeft: 8 }}>
                                                            {weatherEmoji(stopWeather?.condition, stopWeather?.icon)} {stopWeather?.temperature ?? '—'}°
                                                        </span>
                                                    </div>
                                                    <div className="itin-meta">
                                                        {item.arrival_time || 'TBD'} • ₱{Number(item.estimated_cost || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '12px', color: 'var(--i4)' }}>No stops added yet</p>
                                )}

                                <div style={{ marginTop: '16px', fontWeight: '600', fontSize: '14px', color: 'var(--i)' }}>
                                    Total: ₱{totalCost.toLocaleString()}
                                </div>
                            </>
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
                        <input
                            placeholder="Title"
                            value={newForm.title}
                            onChange={(e) => setNewForm((prev) => ({ ...prev, title: e.target.value }))}
                            className="form-input"
                            style={{ marginBottom: '12px' }}
                        />
                        <select
                            value={newForm.province_id}
                            onChange={(e) => setNewForm((prev) => ({ ...prev, province_id: e.target.value }))}
                            className="form-input"
                            style={{ marginBottom: '12px' }}
                        >
                            <option value="">Select province</option>
                            {provinces.map((province) => (
                                <option key={province.id} value={province.id}>{province.name}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={newForm.start_date}
                            onChange={(e) => setNewForm((prev) => ({ ...prev, start_date: e.target.value }))}
                            className="form-input"
                            style={{ marginBottom: '12px' }}
                        />
                        <input
                            type="date"
                            value={newForm.end_date}
                            onChange={(e) => setNewForm((prev) => ({ ...prev, end_date: e.target.value }))}
                            className="form-input"
                            style={{ marginBottom: '12px' }}
                        />
                        <select
                            value={newForm.budget_label}
                            onChange={(e) => setNewForm((prev) => ({ ...prev, budget_label: e.target.value }))}
                            className="form-input"
                            style={{ marginBottom: '12px' }}
                        >
                            <option value="">Select budget</option>
                            {BUDGET_OPTIONS.map((budget) => (
                                <option key={budget.value} value={budget.value}>{budget.label}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min="1"
                            value={newForm.number_of_people}
                            onChange={(e) => setNewForm((prev) => ({ ...prev, number_of_people: e.target.value }))}
                            className="form-input"
                            placeholder="People count"
                            style={{ marginBottom: '16px' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowNewForm(false)} className="s-btn">Cancel</button>
                            <button
                                onClick={() => createMutation.mutate()}
                                className="s-btn dark"
                                disabled={createMutation.isPending || !newForm.title.trim()}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
