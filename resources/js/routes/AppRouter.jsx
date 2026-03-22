import { Navigate, Route, Routes } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LandingPage from '../pages/LandingPage';
import SignInPage from '../pages/SignInPage';
import RegisterPage from '../pages/RegisterPage';
import TouristDashboard from '../pages/tourist/TouristDashboard';
import LocalDashboard from '../pages/local/LocalDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/signin" replace />;

    return children;
}

function RoleRoute({ role, children }) {
    const auth = useAuth();

    if (auth.loading) return null;
    if (!auth.isAuthenticated) return <Navigate to="/signin" replace />;

    if (auth.role !== role) {
        if (auth.role === 'tourist') return <Navigate to="/dashboard" replace />;
        if (auth.role === 'local') return <Navigate to="/provider" replace />;
        if (auth.role === 'admin') return <Navigate to="/admin" replace />;
    }

    return children;
}

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
                path="/dashboard/*"
                element={
                    <ProtectedRoute>
                        <RoleRoute role="tourist">
                            <TouristDashboard />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/provider/*"
                element={
                    <ProtectedRoute>
                        <RoleRoute role="local">
                            <LocalDashboard />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute>
                        <RoleRoute role="admin">
                            <AdminDashboard />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
