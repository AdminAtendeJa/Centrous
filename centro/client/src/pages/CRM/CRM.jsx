import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit3, X, Check, MessageSquare, User, AtSign, Phone, Mail, Maximize, Minimize } from 'lucide-react';
import { useCRMStore, useUIStore } from '../../store/index.js';

import { KanbanBoard } from '../../components/crm/KanbanBoard.jsx';
import { AutomationTriggers } from '../../components/crm/AutomationTriggers.jsx';

const STAGES = [
    { id: 'new', label: '🆕 Nuevo', color: 'var(--color-info)' },
    { id: 'qualified', label: '✅ Calificado', color: 'var(--color-primary-light)' },
    { id: 'proposal', label: '📄 Propuesta', color: 'var(--color-warning)' },
    { id: 'closed_won', label: '🏆 Ganado', color: 'var(--color-success)' },
    { id: 'closed_lost', label: '❌ Perdido', color: 'var(--color-danger)' },
];

const CHANNELS = ['WhatsApp', 'Instagram', 'LinkedIn', 'Referido', 'Web', 'Email', 'Llamada'];

function LeadDrawer({ leadId, onClose, initialExpanded = false }) {
    const { leads, addLeadMessage, updateLead } = useCRMStore();
    const setIsDrawerExpanded = useUIStore(s => s.setIsDrawerExpanded);
    const [isExpanded, setIsExpanded] = useState(initialExpanded);
    const lead = leads.find(l => l.id === leadId);
    const [draft, setDraft] = useState('');

    useEffect(() => {
        if (initialExpanded) setIsDrawerExpanded(true);
    }, [initialExpanded]);

    const toggleExpand = () => {
        const next = !isExpanded;
        setIsExpanded(next);
        setIsDrawerExpanded(next);
    };

    if (!lead) return null;

    let themeColor = 'var(--color-primary-light)';
    let channelIcon = <MessageSquare size={16} />;

    if (lead.channel === 'WhatsApp') { themeColor = '#25D366'; channelIcon = <Phone size={16} />; }
    else if (lead.channel === 'Instagram') { themeColor = '#E1306C'; channelIcon = <AtSign size={16} />; }
    else if (lead.channel === 'LinkedIn') { themeColor = '#0077b5'; channelIcon = <User size={16} />; }
    else if (lead.channel === 'Email') { themeColor = '#EA4335'; channelIcon = <Mail size={16} />; }

    // Generar timeline unificado simulado (Feed 360)
    const timeline = [
        { type: 'system', text: 'Lead creado vía Integración API', time: '09:50', id: 't1' },
        { type: 'chat', sender: 'lead', text: `Hola, me comunico por ${lead.channel}. Estoy interesado en sus servicios para mi empresa ${lead.company || ''}.`, time: '10:00', id: 'm1' },
        { type: 'chat', sender: 'bot', text: `¡Hola ${lead.name}! Gracias por contactar a Centrous. Claro, ¿qué tipo de automatizaciones buscan implementar?`, time: '10:01', id: 'm2' },
        { type: 'system', text: 'Etapa cambiada de "Nuevo" a "Calificado"', time: '10:02', id: 't2' }
    ];

    if (lead.notes) {
        timeline.push({ type: 'note', text: lead.notes, time: '10:05', id: 'm3' });
    }
    
    // Anexamos los mensajes reales si existen
    if (lead.messages && lead.messages.length > 0) {
        lead.messages.forEach(m => timeline.push({ type: 'chat', ...m }));
    }

    const handleSend = () => {
        if (!draft.trim()) return;
        addLeadMessage(lead.id, { sender: 'bot', text: draft.trim(), time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
        setDraft('');
    };

    return createPortal(
        <div className="drawer-overlay" onClick={onClose}>
            <div className={`drawer-right ${isExpanded ? 'drawer-expanded' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="drawer-header flex-between">
                    <div className="flex-center gap-3">
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            {channelIcon}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{lead.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Perfil 360°</div>
                        </div>
                    </div>
                    <div>
                        <button className="btn-icon" onClick={toggleExpand} style={{ marginRight: 8 }}>
                            {isExpanded ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                        <button className="btn-icon" onClick={() => { setIsDrawerExpanded(false); onClose(); }}><X size={20} /></button>
                    </div>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* LEFT PANEL: Lead Details */}
                    <div style={{ width: '280px', borderRight: '1px solid var(--color-border)', padding: '20px 16px', overflowY: 'auto', background: 'var(--color-surface)' }}>
                        <div className="section-title">Información Principal</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                            <div>
                                <label style={{ fontSize: 11 }}>Empresa</label>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.company || 'N/A'}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: 11 }}>Canal de Origen</label>
                                <div className="flex-center gap-2" style={{ fontSize: 13, fontWeight: 500, color: themeColor }}>
                                    {channelIcon} {lead.channel}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 11 }}>Valor Estimado</label>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-success)' }}>${(lead.value || 0).toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="section-title">Actualizar Etapa</div>
                        <select
                            value={lead.stage}
                            onChange={(e) => updateLead(lead.id, { stage: e.target.value })}
                            style={{ marginBottom: 24, fontSize: 12 }}
                        >
                            {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>

                        <div className="section-title">Etiquetas (Tags)</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 24 }}>
                            {(lead.tags || ['B2B', 'Alta Prioridad']).map(tag => (
                                <span key={tag} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>#{tag}</span>
                            ))}
                            <button style={{ background: 'var(--color-surface-3)', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}>+ Añadir</button>
                        </div>

                        <div className="section-title">Tareas Asignadas</div>
                        <div style={{ background: 'var(--color-surface-2)', padding: 12, borderRadius: 8, fontSize: 12, marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <input type="checkbox" />
                                <span>Llamar para calificar presupuesto</span>
                            </div>
                            <button style={{ color: 'var(--color-primary-light)', background: 'none', border: 'none', fontSize: 11, cursor: 'pointer', padding: 0 }}>+ Nueva Tarea</button>
                        </div>
                    </div>

                    {/* RIGHT PANEL: 360 Unified Feed */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-surface-2)', position: 'relative' }}>
                        <div className="drawer-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', margin: '10px 0' }}>Hoy</div>

                            {timeline.map((item, i) => {
                                if (item.type === 'system') {
                                    return (
                                        <div key={item.id} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            <div style={{ height: 1, background: 'var(--color-border)', flex: 1, maxWidth: 30 }} />
                                            {item.time} - {item.text}
                                            <div style={{ height: 1, background: 'var(--color-border)', flex: 1, maxWidth: 30 }} />
                                        </div>
                                    );
                                }

                                if (item.type === 'note') {
                                    return (
                                        <div key={item.id} style={{ alignSelf: 'center', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: '#eab308', width: '80%' }}>
                                            <strong>Nota interna ({item.time}):</strong> {item.text}
                                        </div>
                                    );
                                }

                                const isLead = item.sender === 'lead';
                                return (
                                    <div key={item.id || i} style={{
                                        alignSelf: isLead ? 'flex-start' : 'flex-end',
                                        maxWidth: '90%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isLead ? 'flex-start' : 'flex-end',
                                        gap: 4
                                    }}>
                                        <div style={{
                                            background: isLead ? 'var(--color-surface-3)' : themeColor,
                                            color: isLead ? 'var(--text-primary)' : '#fff',
                                            padding: '10px 14px',
                                            borderRadius: isLead ? '12px 12px 12px 0' : '12px 12px 0 12px',
                                            fontSize: 13,
                                            lineHeight: 1.5,
                                            boxShadow: 'var(--shadow-sm)'
                                        }}>
                                            {item.text}
                                        </div>
                                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.time}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <button style={{ background: 'var(--color-surface-3)', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Chat</button>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>Nota Interna</button>
                            </div>
                            <div style={{ position: 'relative', display: 'flex', gap: 10 }}>
                                <input
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Escribe un mensaje..."
                                    style={{ flex: 1, padding: '12px 16px', borderRadius: 24, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 14 }}
                                />
                                <button
                                    onClick={handleSend}
                                    style={{
                                        width: 44, height: 44, borderRadius: '50%', background: themeColor,
                                        color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    Responder Lead
                                </button>
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                                Los mensajes simulan la respuesta automática de AtendeJá hacia el cliente.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

function LeadModal({ onClose, onSave, initialData }) {
    const [form, setForm] = useState(initialData || { name: '', company: '', value: '', channel: 'WhatsApp', stage: 'new', notes: '' });
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{initialData ? 'Editar Lead' : 'Nuevo Lead'}</h2>
                    <button className="btn-icon" onClick={onClose}><X size={16} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div><label>Nombre *</label><input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Juan Pérez" /></div>
                    <div><label>Empresa</label><input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="ACME S.A." /></div>
                    <div className="grid-2">
                        <div><label>Valor potencial ($)</label><input type="number" value={form.value} onChange={(e) => set('value', e.target.value)} placeholder="1000" /></div>
                        <div><label>Canal</label>
                            <select value={form.channel} onChange={(e) => set('channel', e.target.value)}>
                                {CHANNELS.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div><label>Etapa</label>
                        <select value={form.stage} onChange={(e) => set('stage', e.target.value)}>
                            {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                    </div>
                    <div><label>Notas</label><textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="Detalles del lead…" /></div>
                </div>
                <div className="flex gap-2" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={() => form.name && onSave({ ...form, value: Number(form.value) || 0 })}>
                        <Check size={14} /> Guardar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function CRM() {
    const { leads, addLead, updateLead, deleteLead, moveLead } = useCRMStore();
    const setIsDrawerExpanded = useUIStore(s => s.setIsDrawerExpanded);
    const [showModal, setShowModal] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [isInitialExpanded, setIsInitialExpanded] = useState(false);

    const openLead = (id, expanded = false) => {
        // Si ya está abierto y se pide expandir, simplemente lo hacemos
        if (selectedLeadId === id && expanded) {
            setIsInitialExpanded(true);
            setIsDrawerExpanded(true);
            return;
        }
        setSelectedLeadId(id);
        setIsInitialExpanded(expanded);
        if (expanded) setIsDrawerExpanded(true);
    };

    const closeLead = () => {
        setSelectedLeadId(null);
        setIsInitialExpanded(false);
        setIsDrawerExpanded(false);
    };

    const totalValue = leads.reduce((s, l) => s + (l.value || 0), 0);
    const wonValue = leads.filter((l) => l.stage === 'closed_won').reduce((s, l) => s + (l.value || 0), 0);

    const handleSave = (data) => {
        if (editingLead) {
            updateLead(editingLead.id, data);
        } else {
            addLead(data);
        }
        setShowModal(false);
        setEditingLead(null);
    };

    return (
        <div className="animate-in">
            {selectedLeadId && (
                <LeadDrawer
                    leadId={selectedLeadId}
                    onClose={closeLead}
                    initialExpanded={isInitialExpanded}
                />
            )}
            {(showModal || editingLead) && (
                <LeadModal
                    initialData={editingLead}
                    onClose={() => { setShowModal(false); setEditingLead(null); }}
                    onSave={handleSave}
                />
            )}

            <div className="page-header">
                <h1>CRM — Pipeline de Leads 🎯</h1>
                <p>Gestiona tu proceso de ventas de automatizaciones.</p>
            </div>

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {STAGES.slice(0, 4).map((stage) => {
                    const count = leads.filter((l) => l.stage === stage.id).length;
                    const val = leads.filter((l) => l.stage === stage.id).reduce((s, l) => s + (l.value || 0), 0);
                    return (
                        <div className="card" key={stage.id}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{stage.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 800 }}>{count}</div>
                            {val > 0 && <div style={{ fontSize: 11, color: 'var(--color-success)', marginTop: 2 }}>${val.toLocaleString()}</div>}
                        </div>
                    );
                })}
            </div>

            <div className="flex-between mb-4">
                <div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pipeline total: </span>
                    <strong style={{ color: 'var(--color-primary-light)' }}>${totalValue.toLocaleString()}</strong>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 12 }}>Ganado: </span>
                    <strong style={{ color: 'var(--color-success)' }}>${wonValue.toLocaleString()}</strong>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={14} /> Nuevo Lead
                </button>
            </div>

            {/* Kanban Board V3 */}
            <AutomationTriggers stages={STAGES} />
            <KanbanBoard
                stages={STAGES}
                leads={leads}
                onMoveLead={moveLead}
                onLeadClick={(id, bool) => openLead(id, bool)}
                onLeadDoubleClick={(id, bool) => openLead(id, bool)}
                onDeleteLead={deleteLead}
                onEditLead={(l) => setEditingLead(l)}
            />
        </div>
    );
}
