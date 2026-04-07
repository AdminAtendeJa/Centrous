import { useState } from 'react';
import { Plus, Trash2, X, Check, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useProposalsStore } from '../../store/index.js';

const STATUS_OPTIONS = ['pending', 'won', 'lost'];
const STATUS_MAP = {
    pending: { label: 'Pendiente', cls: 'badge-warning' },
    won: { label: '🏆 Ganada', cls: 'badge-success' },
    lost: { label: 'Perdida', cls: 'badge-danger' },
};

function ProposalModal({ onClose, onSave }) {
    const [form, setForm] = useState({ client: '', company: '', amount: '', description: '', followUpAt: '' });
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Nueva Propuesta</h2>
                    <button className="btn-icon" onClick={onClose}><X size={16} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="grid-2">
                        <div><label>Cliente *</label><input value={form.client} onChange={(e) => set('client', e.target.value)} placeholder="Nombre" /></div>
                        <div><label>Empresa</label><input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Empresa SA" /></div>
                    </div>
                    <div><label>Descripción del servicio</label><input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Bot WhatsApp + integración CRM…" /></div>
                    <div className="grid-2">
                        <div><label>Monto ($)</label><input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="1500" /></div>
                        <div><label>Follow-up el</label><input type="date" value={form.followUpAt} onChange={(e) => set('followUpAt', e.target.value)} /></div>
                    </div>
                </div>
                <div className="flex gap-2" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={() => form.client && onSave({ ...form, amount: Number(form.amount) || 0, status: 'pending' })}>
                        <Check size={14} /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Proposals() {
    const { proposals, addProposal, updateProposal, deleteProposal } = useProposalsStore();
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all' ? proposals : proposals.filter((p) => p.status === filter);
    const wonTotal = proposals.filter((p) => p.status === 'won').reduce((s, p) => s + p.amount, 0);
    const pendingTotal = proposals.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    const winRate = proposals.length ? Math.round((proposals.filter((p) => p.status === 'won').length / proposals.length) * 100) : 0;

    const isOverdue = (followUpAt) => followUpAt && new Date(followUpAt) < new Date();

    return (
        <div className="animate-in">
            {showModal && <ProposalModal onClose={() => setShowModal(false)} onSave={(d) => { addProposal(d); setShowModal(false); }} />}

            <div className="page-header">
                <h1>Propuestas 💼</h1>
                <p>Rastrea el estado de tus cotizaciones y cierres.</p>
            </div>

            {/* KPIs */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Revenue Ganado', value: `$${wonTotal.toLocaleString()}`, icon: TrendingUp, color: 'var(--color-success)' },
                    { label: 'Pipeline Pendiente', value: `$${pendingTotal.toLocaleString()}`, icon: Clock, color: 'var(--color-warning)' },
                    { label: 'Tasa de Cierre', value: `${winRate}%`, icon: CheckCircle, color: 'var(--color-primary-light)' },
                    { label: 'Total Propuestas', value: proposals.length, icon: XCircle, color: 'var(--text-secondary)' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="card flex-center gap-3">
                        <Icon size={22} color={color} style={{ flexShrink: 0 }} />
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-between mb-4">
                <div className="flex gap-2">
                    {['all', 'pending', 'won', 'lost'].map((f) => (
                        <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}>
                            {f === 'all' ? 'Todas' : STATUS_MAP[f].label}
                        </button>
                    ))}
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={14} /> Nueva Propuesta
                </button>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Descripción</th>
                            <th>Monto</th>
                            <th>Enviada</th>
                            <th>Follow-up</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((p) => (
                            <tr key={p.id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{p.client}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.company}</div>
                                </td>
                                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
                                <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>${p.amount?.toLocaleString()}</td>
                                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(p.sentAt).toLocaleDateString('es')}</td>
                                <td>
                                    {p.followUpAt ? (
                                        <span style={{ fontSize: 12, color: isOverdue(p.followUpAt) ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
                                            {isOverdue(p.followUpAt) ? '⚠️ ' : ''}{new Date(p.followUpAt).toLocaleDateString('es')}
                                        </span>
                                    ) : '—'}
                                </td>
                                <td>
                                    <select
                                        value={p.status}
                                        onChange={(e) => updateProposal(p.id, { status: e.target.value })}
                                        style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
                                    >
                                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_MAP[s].label}</option>)}
                                    </select>
                                </td>
                                <td>
                                    <button className="btn-icon" onClick={() => deleteProposal(p.id)}><Trash2 size={13} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
