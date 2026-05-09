import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { dataSupabase } from '../config/supabase';

// ── Settings Store (API keys, prefs) ────────────────────────────────────────
export const useSettingsStore = create(
    persist(
        (set) => ({
            settings: {
                notionKey: '',
                notionDbId: '',
                n8nUrl: '',
                n8nApiKey: '',
                googleEnabled: false,
                googleClientId: '',
                googleClientSecret: '',
                metaEnabled: false,
                metaAppId: '',
                metaAppSecret: '',
                metaToken: '',
                aiBaseUrl: 'https://api.groq.com/openai/v1',
                aiModel: 'llama3-70b-8192',
                aiApiKey: '',
                companyName: 'Mi Empresa',
                ownerName: '',
            },
            updateSettings: (partial) =>
                set((s) => ({ settings: { ...s.settings, ...partial } })),
        }),
        { name: 'centro-settings' }
    )
);

export const useCRMStore = create(
    persist(
        (set, get) => ({
            leads: [],
            fetchLeads: async () => {
                try {
                    const { data, error } = await dataSupabase
                        .from('leads')
                        .select('*')
                        .order('created_at', { ascending: false });
                    
                    if (error) throw error;
                    set({ leads: data || [] });
                } catch (err) { 
                    console.error('Error fetching leads:', err);
                }
            },
            addLead: async (lead) => {
                try {
                    const { error } = await dataSupabase
                        .from('leads')
                        .insert([lead]);
                    
                    if (error) throw error;
                    get().fetchLeads();
                } catch (err) { 
                    console.error('Error adding lead:', err);
                }
            },
            updateLead: async (id, payload) => {
                try {
                    const { error } = await dataSupabase
                        .from('leads')
                        .update(payload)
                        .eq('id', id);
                    
                    if (error) throw error;
                    get().fetchLeads();
                    toast.success('Lead actualizado');
                } catch (err) {
                    toast.error('Error al actualizar lead');
                    console.error(err);
                }
            },
            deleteLead: async (id) => {
                try {
                    const { error } = await dataSupabase
                        .from('leads')
                        .delete()
                        .eq('id', id);
                    
                    if (error) throw error;
                    set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
                    toast.success('Lead eliminado');
                } catch (err) {
                    toast.error('Error al eliminar lead');
                    console.error(err);
                }
            },
            moveLead: async (id, stage) => {
                try {
                    set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, stage } : l)) }));
                    const { error } = await dataSupabase
                        .from('leads')
                        .update({ stage })
                        .eq('id', id);
                    
                    if (error) throw error;
                    toast.success('Etapa actualizada');
                } catch (err) {
                    toast.error('Error al mover lead');
                    console.error(err);
                }
            },
            addLeadMessage: (id, msg) =>
                set((s) => ({
                    leads: s.leads.map((l) =>
                        l.id === id ? { ...l, messages: [...(l.messages || []), { ...msg, id: Date.now().toString(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] } : l
                    ),
                })),
        }),
        { name: 'centro-crm' }
    )
);

// ── Proposals Store ──────────────────────────────────────────────────────────
const INITIAL_PROPOSALS = [
    { id: '1', client: 'Jorge Ruiz', company: 'LogiTrans', amount: 800, status: 'pending', sentAt: new Date(Date.now() - 86400000 * 3).toISOString(), followUpAt: new Date(Date.now() + 86400000 * 2).toISOString(), description: 'Automatización de despachos' },
    { id: '2', client: 'Sofía Lima', company: 'Moda Express', amount: 1200, status: 'won', sentAt: new Date(Date.now() - 86400000 * 10).toISOString(), followUpAt: null, description: 'Bot WhatsApp + integración stock' },
    { id: '3', client: 'Raúl Pérez', company: 'Constructora RP', amount: 950, status: 'lost', sentAt: new Date(Date.now() - 86400000 * 15).toISOString(), followUpAt: null, description: 'CRM automatizado' },
];

export const useProposalsStore = create(
    persist(
        (set) => ({
            proposals: INITIAL_PROPOSALS,
            addProposal: (p) =>
                set((s) => ({ proposals: [{ ...p, id: Date.now().toString(), sentAt: new Date().toISOString() }, ...s.proposals] })),
            updateProposal: (id, data) =>
                set((s) => ({ proposals: s.proposals.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
            deleteProposal: (id) =>
                set((s) => ({ proposals: s.proposals.filter((p) => p.id !== id) })),
        }),
        { name: 'centro-proposals' }
    )
);

export const useTasksStore = create(
    persist(
        (set, get) => ({
            tasks: [],
            fetchTasks: async () => {
                try {
                    const { data, error } = await dataSupabase
                        .from('tasks')
                        .select('*')
                        .order('created_at', { ascending: false });
                    
                    if (error) throw error;
                    set({ tasks: data || [] });
                } catch (err) { 
                    console.error('Error fetching tasks:', err);
                }
            },
            addTask: async (t) => {
                try {
                    const { error } = await dataSupabase
                        .from('tasks')
                        .insert([t]);
                    
                    if (error) throw error;
                    get().fetchTasks();
                } catch (err) { 
                    console.error('Error adding task:', err);
                }
            },
            toggleTask: async (id) => {
                try {
                    const task = get().tasks.find((t) => t.id === id);
                    if (!task) return;

                    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));

                    const { error } = await dataSupabase
                        .from('tasks')
                        .update({ done: !task.done })
                        .eq('id', id);
                    
                    if (error) throw error;
                } catch (err) { 
                    console.error('Error toggling task:', err);
                }
            },
            deleteTask: async (id) => {
                try {
                    const { error } = await dataSupabase
                        .from('tasks')
                        .delete()
                        .eq('id', id);
                    
                    if (error) throw error;
                    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
                } catch (err) { 
                    console.error('Error deleting task:', err);
                }
            },
        }),
        { name: 'centro-tasks' }
    )
);

// ── Notes Store ──────────────────────────────────────────────────────────────
export const useNotesStore = create(
    persist(
        (set) => ({
            notes: [
                { id: '1', title: 'Ideas de servicios', content: '- Automatización de WhatsApp\n- CRM integration\n- Lead gen con IA', updatedAt: new Date().toISOString() },
            ],
            addNote: (n) =>
                set((s) => ({ notes: [{ ...n, id: Date.now().toString(), updatedAt: new Date().toISOString() }, ...s.notes] })),
            updateNote: (id, data) =>
                set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n)) })),
            deleteNote: (id) =>
                set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
        }),
        { name: 'centro-notes' }
    )
);

// ── Analytics Store (AI Telemetry) ──────────────────────────────────────────
export const useAnalyticsStore = create(
    persist(
        (set, get) => ({
            moduleVisits: {}, 
            actionLogs: [], 
            
            logVisit: (path) => set((state) => {
                const visits = { ...state.moduleVisits };
                visits[path] = (visits[path] || 0) + 1;
                return { moduleVisits: visits };
            }),

            logAction: (action, data = {}) => set((state) => {
                const newLog = { action, data, time: new Date().toISOString() };
                const updatedLogs = [newLog, ...state.actionLogs].slice(0, 50);
                return { actionLogs: updatedLogs };
            }),

            clearAnalytics: () => set({ moduleVisits: {}, actionLogs: [] })
        }),
        { name: 'centro-analytics' }
    )
);

// ── UI Store (Layout, Modals) ────────────────────────────────────────────────
export const useUIStore = create((set) => ({
    isDrawerExpanded: false,
    setIsDrawerExpanded: (val) => set({ isDrawerExpanded: val }),
}));

// ── Onboarding Store ─────────────────────────────────────────────────────────
export const useOnboardingStore = create(
    persist(
        (set) => ({
            onboardingCompleted: false,
            profile: {
                userName: '',
                profession: null,
                apps: [],
                clientTier: null,
            },
            completeOnboarding: (profile) =>
                set({ onboardingCompleted: true, profile }),
            resetOnboarding: () =>
                set({ onboardingCompleted: false, profile: { userName: '', profession: null, apps: [], clientTier: null } }),
        }),
        { name: 'centro-onboarding' }
    )
);

// ── Auth Store ──────────────────────────────────────────────────────────────
export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            session: null,
            isLoading: true,
            setUser: (user) => set({ user }),
            setSession: (session) => set({ session, isLoading: false }),
            signOut: async () => {
                const { supabase } = await import('../config/supabase');
                await supabase.auth.signOut();
                set({ user: null, session: null });
            },
        }),
        { name: 'centro-auth' }
    )
);

// ── AI State Store ───────────────────────────────────────────────────────────
export const useAIStore = create((set) => ({
    latestScanResult: null,
    setLatestScanResult: (result) => set({ latestScanResult: result }),
}));
