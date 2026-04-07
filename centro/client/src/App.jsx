import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import NotionHub from './pages/NotionHub/NotionHub.jsx';
import N8nMonitor from './pages/N8nMonitor/N8nMonitor.jsx';
import SocialMedia from './pages/SocialMedia/SocialMedia.jsx';
import CRM from './pages/CRM/CRM.jsx';
import Proposals from './pages/Proposals/Proposals.jsx';
import Productivity from './pages/Productivity/Productivity.jsx';
import Settings from './pages/Settings/Settings.jsx';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useCRMStore, useUIStore } from './store/index.js';
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

export default function App() {
    const isDrawerExpanded = useUIStore(s => s.isDrawerExpanded);

    return (
        <BrowserRouter>
            <div className={`app-layout ${isDrawerExpanded ? 'drawer-expanded-view' : ''}`}>
                <SocketManager />
                <BodyScrollLock />
                <Copilot />
                <Sidebar />
                <main className="page-content">
                    <ErrorBoundary>
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/notion" element={<NotionHub />} />
                            <Route path="/n8n" element={<N8nMonitor />} />
                            <Route path="/social" element={<SocialMedia />} />
                            <Route path="/crm" element={<CRM />} />
                            <Route path="/proposals" element={<Proposals />} />
                            <Route path="/productivity" element={<Productivity />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </ErrorBoundary>
                </main>
            </div>
        </BrowserRouter>
    );
}
