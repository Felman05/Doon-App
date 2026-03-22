import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'tourist',
        data_privacy_consent: false,
    });
    const [error, setError] = useState('');

    const submit = async () => {
        setError('');

        if (!form.data_privacy_consent) {
            setError('Consent is required.');
            return;
        }

        try {
            const user = await register(form);
            if (user.role === 'tourist') navigate('/dashboard');
            if (user.role === 'local') navigate('/provider');
            if (user.role === 'admin') navigate('/admin');
        } catch (err) {
            setError(err?.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="auth-wrap">
            <div className="auth-left">
                <div className="auth-left-inner">
                    <div className="auth-logo">doon<b>.</b></div>
                    <h2 className="auth-tagline">Start your<br /><em>CALABARZON</em><br />journey</h2>
                    <p className="auth-sub-txt">Create your account and unlock AI recommendations, itinerary planning, and real-time travel updates.</p>
                    <div className="auth-provs">
                        <span className="auth-prov">Batangas</span>
                        <span className="auth-prov">Laguna</span>
                        <span className="auth-prov">Cavite</span>
                        <span className="auth-prov">Rizal</span>
                        <span className="auth-prov">Quezon</span>
                    </div>
                </div>
            </div>
            <div className="auth-right">
                <div className="auth-form-box">
                    <Link className="auth-back" to="/">← Back to home</Link>
                    <div className="auth-form-title">Create account</div>
                    <p className="auth-form-sub">Already have an account? <Link to="/signin">Sign in</Link></p>
                    <div className="form-group"><label className="form-label">Name</label><input className="form-input" placeholder="Juan Dela Cruz" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Create password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="Confirm" value={form.password_confirmation} onChange={(e) => setForm((p) => ({ ...p, password_confirmation: e.target.value }))} /></div>
                    </div>
                    <label className="form-label">Choose Role</label>
                    <div className="role-selector">
                        <button type="button" className={`role-opt ${form.role === 'tourist' ? 'selected' : ''}`} onClick={() => setForm((p) => ({ ...p, role: 'tourist' }))}>
                            <span className="role-opt-ico">🧳</span>
                            <span className="role-opt-lbl">Tourist</span>
                        </button>
                        <button type="button" className={`role-opt ${form.role === 'local' ? 'selected' : ''}`} onClick={() => setForm((p) => ({ ...p, role: 'local' }))}>
                            <span className="role-opt-ico">🏛️</span>
                            <span className="role-opt-lbl">LGU</span>
                        </button>
                    </div>
                    <div className="consent-box"><input id="consent" type="checkbox" checked={form.data_privacy_consent} onChange={(e) => setForm((p) => ({ ...p, data_privacy_consent: e.target.checked }))} /><label htmlFor="consent" className="consent-txt">I consent to data privacy policy.</label></div>
                    {error ? <p className="auth-footer-txt">{error}</p> : null}
                    <button type="button" className="btn-full btn-primary" onClick={submit}>Create account →</button>
                    <p className="auth-footer-txt">Your information is protected under our privacy and security standards.</p>
                </div>
            </div>
        </div>
    );
}
