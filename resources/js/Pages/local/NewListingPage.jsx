import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';

export default function NewListingPage() {
    const { addToast } = useContext(ToastContext) || {};
    const [form, setForm] = useState({
        title: '',
        type: 'Tour Package',
        province: 'Batangas',
        municipality: '',
        price: '',
        price_type: 'per person',
        capacity: '',
        duration: '',
        opening_time: '',
        closing_time: '',
        open_days: [],
        contact: '',
        website: '',
        description: '',
        short_description: '',
    });

    const { data: providerStats } = useQuery({
        queryKey: ['provider-stats-for-submit'],
        queryFn: async () => {
            const { data } = await api.get('/provider/stats');
            return data;
        },
    });

    const mapListingType = (value) => {
        const map = {
            Accommodation: 'accommodation',
            'Tour Package': 'tour_package',
            Restaurant: 'restaurant',
            Transport: 'transport',
            Event: 'event',
            Other: 'other',
            Activity: 'other',
        };

        return map[value] || 'other';
    };

    const inferPriceLabel = (price) => {
        const amount = Number(price || 0);
        if (amount <= 0) return 'free';
        if (amount <= 1000) return 'budget';
        if (amount <= 3000) return 'mid_range';
        return 'luxury';
    };

    const submitMutation = useMutation({
        mutationFn: () => {
            const payload = {
                provider_id: providerStats?.provider_id,
                destination_id: null,
                listing_title: form.title,
                listing_type: mapListingType(form.type),
                description: form.description,
                images: [],
                price: form.price ? Number(form.price) : null,
                price_label: inferPriceLabel(form.price),
                capacity: form.capacity ? Number(form.capacity) : null,
                contact_number: form.contact,
                availability: {
                    opening_time: form.opening_time || null,
                    closing_time: form.closing_time || null,
                    open_days: form.open_days,
                },
                status: 'pending',
            };

            return api.post('/provider-listings', payload);
        },
        onSuccess: () => {
            addToast?.('Listing submitted for review!', 'success');
            setForm({
                title: '', type: 'Tour Package', province: 'Batangas', municipality: '',
                price: '', price_type: 'per person', capacity: '', duration: '',
                opening_time: '', closing_time: '', open_days: [], contact: '',
                website: '', description: '', short_description: '',
            });
        },
        onError: (error) => {
            const message = error?.response?.data?.message || 'Failed to submit listing';
            addToast?.(message, 'error');
        },
    });

    const provinceOpts = ['Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'];
    const typeOpts = ['Tour Package', 'Accommodation', 'Restaurant', 'Event', 'Transport', 'Activity', 'Other'];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <>
            <div className="dc mb16 sr">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Submit New Listing</div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Listing Title *</label>
                        <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="e.g., Taal Volcano Tour" className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Type *</label>
                        <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="form-input">
                            {typeOpts.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Province *</label>
                        <select value={form.province} onChange={(e) => setForm({...form, province: e.target.value})} className="form-input">
                            {provinceOpts.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Municipality *</label>
                        <input type="text" value={form.municipality} onChange={(e) => setForm({...form, municipality: e.target.value})} className="form-input" />
                    </div>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Price (PHP) *</label>
                        <input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Price Type *</label>
                        <select value={form.price_type} onChange={(e) => setForm({...form, price_type: e.target.value})} className="form-input">
                            <option>per person</option>
                            <option>per group</option>
                            <option>per night</option>
                            <option>flat rate</option>
                        </select>
                    </div>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Capacity *</label>
                        <input type="number" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} placeholder="Max guests" className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Duration (hours)</label>
                        <input type="number" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} className="form-input" />
                    </div>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Opening Time</label>
                        <input type="time" value={form.opening_time} onChange={(e) => setForm({...form, opening_time: e.target.value})} className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Closing Time</label>
                        <input type="time" value={form.closing_time} onChange={(e) => setForm({...form, closing_time: e.target.value})} className="form-input" />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">Open Days</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {daysOfWeek.map(day => (
                            <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.open_days.includes(day)} onChange={() => {
                                    const updated = form.open_days.includes(day) ? form.open_days.filter(d => d !== day) : [...form.open_days, day];
                                    setForm({...form, open_days: updated});
                                }} />
                                {day}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Contact Number *</label>
                        <input type="tel" value={form.contact} onChange={(e) => setForm({...form, contact: e.target.value})} className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Website</label>
                        <input type="url" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} className="form-input" />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">Description * ({form.description.length}/500)</label>
                    <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Detailed description of your listing..." className="form-input" style={{ minHeight: '120px', maxLength: 500 }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Short Description ({form.short_description.length}/150)</label>
                    <input type="text" value={form.short_description} onChange={(e) => setForm({...form, short_description: e.target.value})} placeholder="Brief summary..." className="form-input" maxLength="150" />
                </div>

                <p style={{ fontSize: '12px', color: 'var(--i4)', marginBottom: '16px' }}>
                    Listings are reviewed by Admin within 1-2 business days.
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => submitMutation.mutate()} className="s-btn dark" disabled={!providerStats?.provider_id || submitMutation.isPending}>
                        {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                    </button>
                    <button className="s-btn" type="button" disabled>
                        Save as Draft
                    </button>
                </div>
            </div>
        </>
    );
}
