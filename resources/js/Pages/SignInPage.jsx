import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function SignInPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const submit = async () => {
        try {
            setError('');
            const user = await login(form);
            if (user.role === 'tourist') navigate('/dashboard');
            if (user.role === 'local') navigate('/provider');
            if (user.role === 'admin') navigate('/admin');
        } catch (err) {
            setError(err?.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="auth-wrap">
            <div className="auth-left">
                <div className="auth-left-inner">
                    <div className="auth-logo">doon<b>.</b></div>
                    <h2 className="auth-tagline">Welcome<br />back to<br /><em>CALABARZON</em></h2>
                    <p className="auth-sub-txt">Sign in to continue planning trips, saving itineraries, and discovering recommendations powered by Doon.</p>
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
                    <div className="auth-form-title">Sign in</div>
                    <p className="auth-form-sub">New here? <Link to="/register">Create an account</Link></p>
                    <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Enter password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} /></div>
                    <Link className="forgot-link" to="/signin">Forgot password?</Link>
                    {error ? <p className="auth-footer-txt">{error}</p> : null}
                    <button type="button" className="btn-full btn-primary" onClick={submit}>Sign in</button>
                    <p className="auth-footer-txt">By continuing, you agree to our data privacy policy.</p>
                </div>
            </div>
        </div>
    );
}
