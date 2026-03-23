import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import useAuth from '../../hooks/useAuth';

export default function RecommendationForm({ onSubmit }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        budget: '',
        theme: '',
        people: '',
        duration: '',
        province_id: '',
    });

    const { data: provinces = [] } = useQuery({
        queryKey: ['provinces'],
        queryFn: async () => {
            const { data } = await api.get('/provinces');
            return data.data ?? [];
        },
    });

    const submit = () => {
        const filters = Object.fromEntries(
            Object.entries(form).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        );

        if (user?.tourist_profile?.generational_profile) {
            filters.generational_profile = user.tourist_profile.generational_profile;
        }

        onSubmit(filters);
    };

    return (
        <div className="rec-form">
            <div className="rf-g">
                <label className="rf-lbl">Budget</label>
                <select className="rf-ctrl" value={form.budget} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}>
                    <option value="">All Budgets</option>
                    <option value="free">Free</option>
                    <option value="budget">Budget (under ₱500)</option>
                    <option value="mid_range">Mid-range (₱500-₱2000)</option>
                    <option value="luxury">Luxury (₱2000+)</option>
                </select>
            </div>
            <div className="rf-g">
                <label className="rf-lbl">Theme</label>
                <select className="rf-ctrl" value={form.theme} onChange={(e) => setForm((p) => ({ ...p, theme: e.target.value }))}>
                    <option value="">All Themes</option>
                    <option value="beach-water">Beach & Water</option>
                    <option value="nature-outdoor">Nature & Outdoor</option>
                    <option value="cultural-heritage">Cultural & Heritage</option>
                    <option value="food-dining">Food & Dining</option>
                    <option value="adventure-sports">Adventure & Sports</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="events-festivals">Events & Festivals</option>
                    <option value="transportation">Transportation</option>
                    <option value="wellness-spa">Wellness & Spa</option>
                    <option value="shopping-markets">Shopping & Markets</option>
                </select>
            </div>
            <div className="rf-g">
                <label className="rf-lbl">People</label>
                <select className="rf-ctrl" value={form.people} onChange={(e) => setForm((p) => ({ ...p, people: e.target.value }))}>
                    <option value="">Any Size</option>
                    <option value="1">Solo (1)</option>
                    <option value="2">Couple (2)</option>
                    <option value="5">Small Group (3-5)</option>
                    <option value="10">Large Group (6+)</option>
                </select>
            </div>
            <div className="rf-g">
                <label className="rf-lbl">Duration</label>
                <select className="rf-ctrl" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}>
                    <option value="">Any Duration</option>
                    <option value="1">Day Trip (1 day)</option>
                    <option value="2">Weekend (2 days)</option>
                    <option value="4">Long Weekend (3-4 days)</option>
                    <option value="7">Week (7 days)</option>
                </select>
            </div>
            <div className="rf-g">
                <label className="rf-lbl">Province</label>
                <select className="rf-ctrl" value={form.province_id} onChange={(e) => setForm((p) => ({ ...p, province_id: e.target.value }))}>
                    <option value="">All Provinces</option>
                    {provinces.map((province) => (
                        <option key={province.id} value={province.id}>{province.name}</option>
                    ))}
                </select>
            </div>
            <button type="button" className="rf-go" onClick={submit}>Find</button>
        </div>
    );
}
