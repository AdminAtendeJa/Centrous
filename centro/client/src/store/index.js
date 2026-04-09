import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
                    const res = await fetch('http://localhost:3001/api/crm/leads');
                    const data = await res.json();
                    if (data.success) set({ leads: data.leads });
                } catch (err) { console.error(err); }
            },
            addLead: async (lead) => {
                try {
                    const res = await fetch('http://localhost:3001/api/crm/leads', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(lead)
                    });
                    const data = await res.json();
                    if (data.success) get().fetchLeads();
                } catch (err) { console.error(err); }
            },
            updateLead: async (id, payload) => {
                try {
                    await fetch(`http://localhost:3001/api/crm/leads/${id}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    get().fetchLeads();
                } catch (err) { console.error(err); }
            },
            deleteLead: async (id) => {
                try {
                    await fetch(`http://localhost:3001/api/crm/leads/${id}`, { method: 'DELETE' });
                    set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
                } catch (err) { console.error(err); }
            },
            moveLead: async (id, stage) => {
                try {
                    // Update state optimistically immediately
                    set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, stage } : l)) }));
                    await fetch(`http://localhost:3001/api/crm/leads/${id}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ stage })
                    });
                } catch (err) { console.error(err); }
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
                    const res = await fetch('http://localhost:3001/api/tasks');
                    const data = await res.json();
                    if (data.success) set({ tasks: data.tasks });
                } catch (err) { console.error(err); }
            },
            addTask: async (t) => {
                try {
                    const res = await fetch('http://localhost:3001/api/tasks', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(t)
                    });
                    const data = await res.json();
                    if (data.success) get().fetchTasks();
                } catch (err) { console.error(err); }
            },
            toggleTask: async (id) => {
                try {
                    const task = get().tasks.find((t) => t.id === id);
                    if (!task) return;

                    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));

                    await fetch(`http://localhost:3001/api/tasks/${id}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ done: !task.done })
                    });
                } catch (err) { console.error(err); }
            },
            deleteTask: async (id) => {
                try {
                    await fetch(`http://localhost:3001/api/tasks/${id}`, { method: 'DELETE' });
                    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
                } catch (err) { console.error(err); }
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
