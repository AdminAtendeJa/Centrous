import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/layout/Sidebar.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import NotionHub from './pages/NotionHub/NotionHub.jsx';
import N8nMonitor from './pages/N8nMonitor/N8nMonitor.jsx';
import SocialMedia from './pages/SocialMedia/SocialMedia.jsx';
import CRM from './pages/CRM/CRM.jsx';
import Proposals from './pages/Proposals/Proposals.jsx';
import Productivity from './pages/Productivity/Productivity.jsx';
import Finance from './pages/Finance/Finance.jsx';
import Settings from './pages/Settings/Settings.jsx';
import Onboarding from './pages/Onboarding/Onboarding.jsx';
import Inbox from './pages/Inbox/Inbox.jsx';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useCRMStore, useUIStore, useOnboardingStore, useTasksStore } from './store/index.js';
import Copilot from './components/ui/Copilot.jsx';

// Conectar al backend (proxy bypass o directo al puerto del server Express)
const socket = io('/', { path: '/socket.io' }); // Vite hace el proxy si está configurado, o usamos directo el puerto de express si no.
// Debido a que Vite (5173) hace proxy hacia (3001), usamos localhost:3001 directo para el WebSocket
const wsUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/';
const socketClient = io(wsUrl);

function SocketManager() {
    const { addLead, addLeadMessage } = useCRMStore();

    useEffect(() => {
        const handleMessage = (payload) => {
            console.log('📬 Nuevo mensaje en tiempo real:', payload);
            const { leads } = useCRMStore.getState(); // Fetch actual sin suscribirse

            const existingLead = leads.find(l => l.id === payload.leadId || l.name === payload.senderName);

            if (existingLead) {
                addLeadMessage(existingLead.id, payload);
            } else {
                addLead({
                    name: payload.senderName || 'Desconocido',
                    company: payload.company || '',
                    value: 0,
                    stage: 'new',
                    channel: payload.channel || 'WhatsApp',
                    notes: 'Lead creado automáticamente por mensaje entrante.',
                    messages: [payload]
                });
            }

            // Reproducir sonido de notificación suave
            try {
                // Short pop sound
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.volume = 0.5;
                audio.play();
            } catch (e) { }
        };

        socketClient.on('chat:message', handleMessage);
        return () => socketClient.off('chat:message', handleMessage);
    }, [addLead, addLeadMessage]);

    return null;
}

function BodyScrollLock() {
    const isDrawerExpanded = useUIStore(s => s.isDrawerExpanded);
    useEffect(() => {
        document.body.style.overflow = isDrawerExpanded ? 'hidden' : 'auto';
    }, [isDrawerExpanded]);
    return null;
}

function PageWrapper({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ width: '100%', height: '100%' }}
        >
            {children}
        </motion.div>
    );
}

function AnimatedRoutes() {
    const location = useLocation();
    const isDrawerExpanded = useUIStore(s => s.isDrawerExpanded);
    const onboardingCompleted = useOnboardingStore(s => s.onboardingCompleted);

    useEffect(() => {
        if (onboardingCompleted) {
            useCRMStore.getState().fetchLeads();
            useTasksStore.getState().fetchTasks();
        }
    }, [onboardingCompleted]);

    return (
        <AnimatePresence mode="wait">
            {!onboardingCompleted ? (
                <Routes location={location} key="onboarding">
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="*" element={<Navigate to="/onboarding" replace />} />
                </Routes>
            ) : (
                <div key="app-layout" className={`app-layout ${isDrawerExpanded ? 'drawer-expanded-view' : ''}`}>
                    <SocketManager />
                    <BodyScrollLock />
                    <Copilot />
                    <Sidebar />
                    <main className="page-content">
                        <ErrorBoundary dropoff={true}>
                            <Routes location={location} key={location.pathname}>
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
                                <Route path="/notion" element={<PageWrapper><NotionHub /></PageWrapper>} />
                                <Route path="/n8n" element={<PageWrapper><N8nMonitor /></PageWrapper>} />
                                <Route path="/social" element={<PageWrapper><SocialMedia /></PageWrapper>} />
                                <Route path="/crm" element={<PageWrapper><CRM /></PageWrapper>} />
                                <Route path="/inbox" element={<PageWrapper><Inbox /></PageWrapper>} />
                                <Route path="/proposals" element={<PageWrapper><Proposals /></PageWrapper>} />
                                <Route path="/productivity" element={<PageWrapper><Productivity /></PageWrapper>} />
                                <Route path="/finance" element={<PageWrapper><Finance /></PageWrapper>} />
                                <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </ErrorBoundary>
                    </main>
                </div>
            )}
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" toastOptions={{
                duration: 4000,
                style: {
                    background: 'var(--color-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--color-border)',
                },
            }} />
            <AnimatedRoutes />
        </BrowserRouter>
    );
}
