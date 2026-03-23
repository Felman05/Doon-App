import '../css/app.css';
import './bootstrap';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import GlobalEffects from './components/ui/GlobalEffects';
import ScrollRevealEffects from './components/ui/ScrollRevealEffects';
import Toast from './components/ui/Toast';

function AppShell() {
    return (
        <ToastProvider>
            <AuthProvider>
                <GlobalEffects enableCursor />
                <ScrollRevealEffects />
                <Toast />
                <AppRouter />
            </AuthProvider>
        </ToastProvider>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AppShell />
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>,
);
