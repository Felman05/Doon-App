import { useState } from 'react';

export default function RecommendationForm({ onSubmit }) {
    const [form, setForm] = useState({
        budget: 'budget',
        theme: '',
        number_of_people: 1,
        trip_duration: 1,
        province_id: '',
        generational_profile: 'millennial',
    });

    return (
        <div className="rec-form">
            <div className="rf-g"><label className="rf-lbl">Budget</label><select className="rf-ctrl" value={form.budget} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}><option value="free">Free</option><option value="budget">Budget</option><option value="mid_range">Mid-range</option><option value="luxury">Luxury</option></select></div>
            <div className="rf-g"><label className="rf-lbl">Theme</label><input className="rf-ctrl" value={form.theme} onChange={(e) => setForm((p) => ({ ...p, theme: e.target.value }))} /></div>
            <div className="rf-g"><label className="rf-lbl">People</label><input className="rf-ctrl" type="number" min="1" value={form.number_of_people} onChange={(e) => setForm((p) => ({ ...p, number_of_people: Number(e.target.value) }))} /></div>
            <div className="rf-g"><label className="rf-lbl">Duration</label><input className="rf-ctrl" type="number" min="1" value={form.trip_duration} onChange={(e) => setForm((p) => ({ ...p, trip_duration: Number(e.target.value) }))} /></div>
            <div className="rf-g"><label className="rf-lbl">Province ID</label><input className="rf-ctrl" value={form.province_id} onChange={(e) => setForm((p) => ({ ...p, province_id: e.target.value }))} /></div>
            <button type="button" className="rf-go" onClick={() => onSubmit(form)}>Find →</button>
        </div>
    );
}
