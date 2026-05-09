import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useEffect, Suspense, lazy } from 'react';
import { io } from 'socket.io-client';
import { useCRMStore, useUIStore, useOnboardingStore, useTasksStore, useAuthStore, useAnalyticsStore } from './store/index.js';
import { supabase } from './config/supabase';

// Layout Components
import Sidebar from './components/layout/Sidebar.jsx';
import TopBar from './components/layout/TopBar';
import UtilityPanel from './components/layout/UtilityPanel';
import IntegrationsBar from './components/layout/IntegrationsBar';
import Copilot from './components/ui/Copilot.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

// Lazy Pages
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard.jsx'));
const SupabaseMonitor = lazy(() => import('./pages/SupabaseMonitor/SupabaseMonitor.jsx'));
const Integrations = lazy(() => import('./pages/Integrations/Integrations.jsx'));
const NotionHub = lazy(() => import('./pages/NotionHub/NotionHub.jsx'));
const N8nMonitor = lazy(() => import('./pages/N8nMonitor/N8nMonitor.jsx'));
const SocialMedia = lazy(() => import('./pages/SocialMedia/SocialMedia.jsx'));
const CRM = lazy(() => import('./pages/CRM/CRM.jsx'));
const Proposals = lazy(() => import('./pages/Proposals/Proposals.jsx'));
const Productivity = lazy(() => import('./pages/Productivity/Productivity.jsx'));
const Finance = lazy(() => import('./pages/Finance/Finance.jsx'));
const Settings = lazy(() => import('./pages/Settings/Settings.jsx'));
const Onboarding = lazy(() => import('./pages/Onboarding/Onboarding.jsx'));
const Inbox = lazy(() => import('./pages/Inbox/Inbox.jsx'));
const Auth = lazy(() => import('./pages/Auth/Auth.jsx'));
const MetaAds = lazy(() => import('./pages/Marketing/MetaAds.jsx'));

function LocationTracker() {
    const location = useLocation();
    const logVisit = useAnalyticsStore(s => s.logVisit);
    useEffect(() => { logVisit(location.pathname); }, [location.pathname, logVisit]);
    return null;
}

function SocketManager() {
    const { addLead, addLeadMessage } = useCRMStore();
    const { session } = useAuthStore();
    useEffect(() => {
        if (!session?.access_token) return;
        const wsUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/';
        const socket = io(wsUrl, { auth: { token: session.access_token } });
        socket.on('chat:message', (payload) => {
            const { leads } = useCRMStore.getState();
            const existingLead = leads.find(l => l.id === payload.leadId || l.name === payload.senderName);
            if (existingLead) addLeadMessage(existingLead.id, payload);
            else addLead({ name: payload.senderName || 'Desconocido', company: payload.company || '', value: 0, stage: 'new', channel: payload.channel || 'WhatsApp', notes: 'Lead automático', messages: [payload] });
        });
        socket.on('crm:lead_created', () => useCRMStore.getState().fetchLeads());
        socket.on('crm:lead_updated', () => useCRMStore.getState().fetchLeads());
        socket.on('tasks:created', () => useTasksStore.getState().fetchTasks());
        return () => socket.disconnect();
    }, [session, addLead, addLeadMessage]);
    return null;
}

function BodyScrollLock() {
    const isDrawerExpanded = useUIStore(s => s.isDrawerExpanded);
    useEffect(() => { document.body.style.overflow = isDrawerExpanded ? 'hidden' : 'auto'; }, [isDrawerExpanded]);
    return null;
}

function PageWrapper({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', height: '100%' }}
        >
            {children}
        </motion.div>
    );
}

function AnimatedRoutes() {
    const location = useLocation();
    const onboardingCompleted = useOnboardingStore(s => s.onboardingCompleted);
    const { user, session, setSession, setUser } = useAuthStore();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user || null);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user || null);
        });
        return () => subscription.unsubscribe();
    }, [setSession, setUser]);

    useEffect(() => {
        if (user && onboardingCompleted) {
            useCRMStore.getState().fetchLeads();
            useTasksStore.getState().fetchTasks();
        }
    }, [user, onboardingCompleted]);

    if (!session) {
        return (
            <AnimatePresence mode="wait">
                <Routes location={location} key="auth">
                    <Route path="/auth" element={<Auth />} />
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </AnimatePresence>
        );
    }

    const currentTitle = location.pathname.split('/')[1]?.toUpperCase() || 'PAINEL';

    return (
        <AnimatePresence mode="wait">
            {!onboardingCompleted ? (
                <Routes location={location} key="onboarding">
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="*" element={<Navigate to="/onboarding" replace />} />
                </Routes>
            ) : (
                <div key="app-shell" className="app-shell-v3">
                    <SocketManager />
                    <BodyScrollLock />
                    <Sidebar />
                    
                    <div className="main-canvas-v3">
                        <TopBar title={currentTitle} />
                        <main className="content-v3">
                            <ErrorBoundary dropoff={true}>
                                <Suspense fallback={<div className="flex-center" style={{ height: '100%', justifyContent: 'center' }}><div className="loading-spinner" /></div>}>
                                    <Routes location={location} key={location.pathname}>
                                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
                                        <Route path="/crm" element={<PageWrapper><CRM /></PageWrapper>} />
                                        <Route path="/meta-ads" element={<PageWrapper><MetaAds /></PageWrapper>} />
                                        <Route path="/inbox" element={<PageWrapper><Inbox /></PageWrapper>} />
                                        <Route path="/proposals" element={<PageWrapper><Proposals /></PageWrapper>} />
                                        <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
                                        <Route path="/supabase-monitor" element={<PageWrapper><SupabaseMonitor /></PageWrapper>} />
                                        <Route path="/integrations" element={<PageWrapper><Integrations /></PageWrapper>} />
                                        <Route path="/notion" element={<PageWrapper><NotionHub /></PageWrapper>} />
                                        <Route path="/n8n" element={<PageWrapper><N8nMonitor /></PageWrapper>} />
                                        <Route path="/social" element={<PageWrapper><SocialMedia /></PageWrapper>} />
                                        <Route path="/productivity" element={<PageWrapper><Productivity /></PageWrapper>} />
                                        <Route path="/finance" element={<PageWrapper><Finance /></PageWrapper>} />
                                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                    </Routes>
                                </Suspense>
                            </ErrorBoundary>
                        </main>
                        <IntegrationsBar />
                    </div>

                    <UtilityPanel />
                    <Copilot />
                </div>
            )}
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <LocationTracker />
            <Toaster position="top-right" toastOptions={{
                duration: 4000,
                style: { background: 'var(--color-surface)', color: 'var(--text-primary)', border: '1px solid var(--color-border)' }
            }} />
            <AnimatedRoutes />
        </BrowserRouter>
    );
}
