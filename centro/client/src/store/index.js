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

// ── CRM Store ────────────────────────────────────────────────────────────────
const INITIAL_LEADS = [
    { id: '1', name: 'Carlos Méndez', company: 'TechPymes SA', value: 1500, stage: 'new', channel: 'WhatsApp', notes: 'Interesado en automatización de facturación', createdAt: new Date().toISOString() },
    { id: '2', name: 'Ana García', company: 'Retail Plus', value: 3200, stage: 'qualified', channel: 'Instagram', notes: 'Quiere integrar CRM con WhatsApp', createdAt: new Date().toISOString() },
    { id: '3', name: 'Jorge Ruiz', company: 'LogiTrans', value: 800, stage: 'proposal', channel: 'LinkedIn', notes: 'Propuesta enviada el lunes', createdAt: new Date().toISOString() },
    { id: '4', name: 'María Torres', company: 'ConsultMar', value: 2100, stage: 'closed_won', channel: 'Referido', notes: 'Cliente ganado ✅', createdAt: new Date().toISOString() },
];

export const useCRMStore = create(
    persist(
        (set) => ({
            leads: INITIAL_LEADS,
            addLead: (lead) =>
                set((s) => ({ leads: [{ ...lead, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...s.leads] })),
            updateLead: (id, data) =>
                set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...data } : l)) })),
            deleteLead: (id) =>
                set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),
            moveLead: (id, stage) =>
                set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, stage } : l)) })),
            addLeadMessage: (id, msg) =>
                set((s) => ({
                    leads: s.leads.map((l) =>
                        l.id === id
                            ? {
                                ...l,
                                messages: [
                                    ...(l.messages || []),
                                    { ...msg, id: Date.now().toString(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                                ],
                            }
                            : l
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

// ── Tasks Store (for Dashboard) ──────────────────────────────────────────────
const INITIAL_TASKS = [
    { id: '1', text: 'Revisar workflows de n8n', done: false, priority: 'high' },
    { id: '2', text: 'Seguimiento a Jorge Ruiz', done: false, priority: 'high' },
    { id: '3', text: 'Publicar post en LinkedIn', done: false, priority: 'medium' },
    { id: '4', text: 'Actualizar propuesta LogiTrans', done: true, priority: 'low' },
];

export const useTasksStore = create(
    persist(
        (set) => ({
            tasks: INITIAL_TASKS,
            addTask: (t) =>
                set((s) => ({ tasks: [{ ...t, id: Date.now().toString(), done: false }, ...s.tasks] })),
            toggleTask: (id) =>
                set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
            deleteTask: (id) =>
                set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
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
