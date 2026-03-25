import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { ToastContext } from '../../context/ToastContext';

export default function NewListingPage() {
    const navigate = useNavigate();
    const { addToast } = useContext(ToastContext) || {};
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        listing_title: '',
        listing_type: '',
        province: 'Batangas',
        municipality: '',
        price: '',
        capacity: '',
        avg_duration_hours: '',
        opening_time: '',
        closing_time: '',
        open_days: [],
        contact_number: '',
        website_url: '',
        description: '',
    });

    const { data: providerStats } = useQuery({
        queryKey: ['provider-stats-for-form'],
        queryFn: async () => {
            const { data } = await api.get('/provider/stats');
            return data;
        },
        retry: 1,
    });

    const mapListingType = (value) => {
        const map = {
            'accommodation': 'accommodation',
            'tour package': 'tour_package',
            'restaurant': 'restaurant',
            'transport': 'transport',
            'event': 'event',
            'activity': 'activity',
            'other': 'other',
        };
        return map[value.toLowerCase()] || value;
    };

    const inferPriceLabel = (price) => {
        const amount = Number(price || 0);
        if (amount <= 0) return 'free';
        if (amount <= 1000) return 'budget';
        if (amount <= 3000) return 'mid_range';
        return 'luxury';
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.listing_title?.trim()) {
            newErrors.listing_title = 'Listing title is required';
        }
        if (!form.listing_type) {
            newErrors.listing_type = 'Listing type is required';
        }
        if (!form.province) {
            newErrors.province = 'Province is required';
        }
        if (!form.municipality?.trim()) {
            newErrors.municipality = 'Municipality is required';
        }
        if (!form.price || Number(form.price) <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }
        if (!form.capacity || Number(form.capacity) <= 0) {
            newErrors.capacity = 'Capacity must be greater than 0';
        }
        if (!form.contact_number?.trim()) {
            newErrors.contact_number = 'Contact number is required';
        }
        if (!form.description?.trim()) {
            newErrors.description = 'Description is required';
        } else if (form.description.length < 50) {
            newErrors.description = 'Description must be at least 50 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitMutation = useMutation({
        mutationFn: () => {
            const payload = {
                provider_id: providerStats?.provider_id,
                destination_id: null,
                listing_title: form.listing_title,
                listing_type: mapListingType(form.listing_type),
                description: form.description,
                images: [],
                price: form.price ? Number(form.price) : null,
                price_label: inferPriceLabel(form.price),
                capacity: form.capacity ? Number(form.capacity) : null,
                contact_number: form.contact_number,
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
            addToast?.('Listing submitted for review. Admin will review within 1-2 business days.', 'success');
            setTimeout(() => navigate('/provider/listings'), 500);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || 'Failed to submit listing';
            addToast?.(message, 'error');
        },
    });

    const handleSubmit = () => {
        if (validateForm()) {
            submitMutation.mutate();
        }
    };

    const provinceOpts = ['Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon'];
    const typeOpts = ['accommodation', 'tour package', 'restaurant', 'event', 'transport', 'activity', 'other'];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const FormField = ({ label, required, error, children }) => (
        <div style={{ marginBottom: '16px' }}>
            <label className="form-label">
                {label} {required && '*'}
            </label>
            {children}
            {error && (
                <div style={{ color: 'var(--r)', fontSize: '11px', marginTop: '4px' }}>
                    {error}
                </div>
            )}
        </div>
    );

    return (
        <>
            <div className="dc mb16 sr">
                <div className="dc-title" style={{ marginBottom: '16px' }}>Submit New Listing</div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <FormField label="Listing Title" required error={errors.listing_title}>
                        <input
                            type="text"
                            value={form.listing_title}
                            onChange={(e) => {
                                setForm({...form, listing_title: e.target.value});
                                if (e.target.value) setErrors({...errors, listing_title: null});
                            }}
                            placeholder="e.g., Taal Volcano Tour"
                            className="form-input"
                            style={{ borderColor: errors.listing_title ? 'var(--r)' : undefined }}
                        />
                    </FormField>
                    <FormField label="Type" required error={errors.listing_type}>
                        <select
                            value={form.listing_type}
                            onChange={(e) => {
                                setForm({...form, listing_type: e.target.value});
                                if (e.target.value) setErrors({...errors, listing_type: null});
                            }}
                            className="form-input"
                            style={{ borderColor: errors.listing_type ? 'var(--r)' : undefined }}
                        >
                            <option value="">Select type</option>
                            {typeOpts.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </FormField>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <FormField label="Province" required error={errors.province}>
                        <select
                            value={form.province}
                            onChange={(e) => {
                                setForm({...form, province: e.target.value});
                                if (e.target.value) setErrors({...errors, province: null});
                            }}
                            className="form-input"
                            style={{ borderColor: errors.province ? 'var(--r)' : undefined }}
                        >
                            {provinceOpts.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Municipality" required error={errors.municipality}>
                        <input
                            type="text"
                            value={form.municipality}
                            onChange={(e) => {
                                setForm({...form, municipality: e.target.value});
                                if (e.target.value) setErrors({...errors, municipality: null});
                            }}
                            className="form-input"
                            style={{ borderColor: errors.municipality ? 'var(--r)' : undefined }}
                        />
                    </FormField>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <FormField label="Price (PHP)" required error={errors.price}>
                        <input
                            type="number"
                            value={form.price}
                            onChange={(e) => {
                                setForm({...form, price: e.target.value});
                                if (e.target.value && Number(e.target.value) > 0) setErrors({...errors, price: null});
                            }}
                            className="form-input"
                            style={{ borderColor: errors.price ? 'var(--r)' : undefined }}
                        />
                    </FormField>
                    <FormField label="Capacity" required error={errors.capacity}>
                        <input
                            type="number"
                            value={form.capacity}
                            onChange={(e) => {
                                setForm({...form, capacity: e.target.value});
                                if (e.target.value && Number(e.target.value) > 0) setErrors({...errors, capacity: null});
                            }}
                            placeholder="Max guests"
                            className="form-input"
                            style={{ borderColor: errors.capacity ? 'var(--r)' : undefined }}
                        />
                    </FormField>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Duration (hours)</label>
                        <input
                            type="number"
                            value={form.avg_duration_hours}
                            onChange={(e) => setForm({...form, avg_duration_hours: e.target.value})}
                            className="form-input"
                        />
                    </div>
                    <div></div>
                </div>

                <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Opening Time</label>
                        <input
                            type="time"
                            value={form.opening_time}
                            onChange={(e) => setForm({...form, opening_time: e.target.value})}
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label className="form-label">Closing Time</label>
                        <input
                            type="time"
                            value={form.closing_time}
                            onChange={(e) => setForm({...form, closing_time: e.target.value})}
                            className="form-input"
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">Open Days</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {daysOfWeek.map(day => (
                            <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={form.open_days.includes(day)}
                                    onChange={() => {
                                        const updated = form.open_days.includes(day)
                                            ? form.open_days.filter(d => d !== day)
                                            : [...form.open_days, day];
                                        setForm({...form, open_days: updated});
                                    }}
                                />
                                {day}
                            </label>
                        ))}
                    </div>
                </div>

                <FormField label="Contact Number" required error={errors.contact_number}>
                    <input
                        type="tel"
                        value={form.contact_number}
                        onChange={(e) => {
                            setForm({...form, contact_number: e.target.value});
                            if (e.target.value) setErrors({...errors, contact_number: null});
                        }}
                        className="form-input"
                        style={{ borderColor: errors.contact_number ? 'var(--r)' : undefined }}
                    />
                </FormField>

                <div>
                    <label className="form-label">Website</label>
                    <input
                        type="url"
                        value={form.website_url}
                        onChange={(e) => setForm({...form, website_url: e.target.value})}
                        className="form-input"
                    />
                </div>

                <FormField label="Description" required error={errors.description}>
                    <textarea
                        value={form.description}
                        onChange={(e) => {
                            setForm({...form, description: e.target.value});
                            if (e.target.value.length >= 50) setErrors({...errors, description: null});
                        }}
                        placeholder="Detailed description of your listing..."
                        className="form-input"
                        style={{ minHeight: '120px', maxLength: 500, borderColor: errors.description ? 'var(--r)' : undefined }}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--i4)', marginTop: '4px' }}>
                        {form.description.length}/500 characters
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--i3)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        💡 More detailed descriptions get featured higher in the Doon AI recommendation results.
                    </div>
                </FormField>

                <p style={{ fontSize: '12px', color: 'var(--i4)', marginBottom: '20px' }}>
                    Listings are reviewed by Admin within 1-2 business days.
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleSubmit}
                        className="s-btn dark"
                        disabled={!providerStats?.provider_id || submitMutation.isPending}
                    >
                        {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                    </button>
                </div>
            </div>
        </>
    );
}
