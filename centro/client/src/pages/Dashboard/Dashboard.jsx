import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, Users, FileCheck, Workflow,
    Plus, CheckCircle2, Circle, Trash2,
    ArrowRight, Zap, AlertCircle
} from 'lucide-react';
import { useTasksStore, useCRMStore, useProposalsStore, useOnboardingStore, useAIStore } from '../../store/index.js';
import { useSettingsStore } from '../../store/index.js';

const QUOTES = [
    'El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.',
    'Automatiza lo repetible. Humaniza lo importante.',
    'Un sistema bien construido trabaja mientras tú descansas.',
    'La consistencia supera a la brillantez. Construye todos los días.',
];

export default function Dashboard() {
    const navigate = useNavigate();
    const { tasks, addTask, toggleTask, deleteTask } = useTasksStore();
    const { leads } = useCRMStore();
    const { proposals } = useProposalsStore();
    const { settings } = useSettingsStore();
    const { profile } = useOnboardingStore();
    const { latestScanResult } = useAIStore();
    const [newTask, setNewTask] = useState('');
    const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    const today = new Date();
    const greeting = today.getHours() < 12 ? 'Buenos días' : today.getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';

    const activeleads = leads.filter((l) => !['closed_won', 'closed_lost'].includes(l.stage)).length;
    const wonProposals = proposals.filter((p) => p.status === 'won');
    const pendingProposals = proposals.filter((p) => p.status === 'pending');
    const revenue = wonProposals.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingTasks = tasks.filter((t) => !t.done);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        addTask({ text: newTask.trim(), priority: 'medium' });
        setNewTask('');
    };

    const PRIORITY_COLOR = { high: 'var(--color-danger)', medium: 'var(--color-warning)', low: 'var(--color-success)' };

    const KPIS = [
        { label: 'Leads Activos', value: activeleads, icon: Users, color: 'var(--color-primary)', bg: 'rgba(108,99,255,0.12)', path: '/crm' },
        { label: 'Propuestas Enviadas', value: pendingProposals.length, icon: FileCheck, color: 'var(--color-warning)', bg: 'rgba(255,179,71,0.12)', path: '/proposals' },
        { label: 'Revenue Ganado', value: `$${revenue.toLocaleString()}`, icon: TrendingUp, color: 'var(--color-success)', bg: 'rgba(74,222,128,0.12)', path: '/proposals' },
        { label: 'Tareas Pendientes', value: pendingTasks.length, icon: CheckCircle2, color: 'var(--color-accent)', bg: 'rgba(0,212,170,0.12)', path: null },
    ];

    const QUICK_ACTIONS = [
        { label: 'Nuevo Lead', icon: Users, action: () => navigate('/crm'), color: 'var(--color-primary)' },
        { label: 'Nueva Propuesta', icon: FileCheck, action: () => navigate('/proposals'), color: 'var(--color-warning)' },
        { label: 'Ver n8n', icon: Workflow, action: () => navigate('/n8n'), color: 'var(--color-accent)' },
        { label: 'Agregar Nota', icon: Zap, action: () => navigate('/productivity'), color: 'var(--color-primary-light)' },
    ];

    return (
        <div className="animate-in">
            {/* Header */}
            <div className="page-header">
                <h1>{greeting}, {profile?.userName || settings.ownerName || 'Emprendedor'} 👋</h1>
                <p style={{ fontStyle: 'italic', color: 'var(--color-primary-light)', marginTop: 4 }}>"{quote}"</p>
            </div>

            {/* KPIs */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {KPIS.map(({ label, value, icon: Icon, color, bg, path }) => (
                    <div
                        key={label}
                        className="card"
                        style={{ cursor: path ? 'pointer' : 'default' }}
                        onClick={() => path && navigate(path)}
                    >
                        <div className="flex-between" style={{ marginBottom: 12 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={18} color={color} />
                            </div>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Main grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                {/* Tasks */}
                <div className="card">
                    <div className="flex-between mb-4">
                        <h2 style={{ fontSize: 15, fontWeight: 700 }}>Tareas del Día</h2>
                        <span className="badge badge-primary">{pendingTasks.length} pendientes</span>
                    </div>

                    <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                        <input
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Agregar tarea rápida…"
                        />
                        <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                            <Plus size={14} />
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {tasks.length === 0 && (
                            <div className="empty-state" style={{ padding: 24 }}>
                                <CheckCircle2 size={32} />
                                <p>¡Sin tareas! Disfruta el día 🎉</p>
                            </div>
                        )}
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '9px 12px',
                                    background: 'var(--color-surface-2)',
                                    borderRadius: 'var(--radius-sm)',
                                    opacity: task.done ? 0.5 : 1,
                                    transition: 'var(--transition)',
                                }}
                            >
                                <button
                                    onClick={() => toggleTask(task.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.done ? 'var(--color-success)' : 'var(--text-muted)', flexShrink: 0 }}
                                >
                                    {task.done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                </button>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLOR[task.priority], flexShrink: 0 }} />
                                <span style={{ flex: 1, fontSize: 13, textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</span>
                                <button onClick={() => deleteTask(task.id)} className="btn-icon" style={{ padding: 4 }}>
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Agent Status */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(219, 39, 119, 0.05))', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                        <div className="flex-between mb-3">
                            <h2 style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Zap size={14} color="#7c3aed" /> Estado de WorkHub AI
                            </h2>
                            <div className="ai-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: settings.aiApiKey ? '#22c55e' : '#64748b' }} />
                        </div>
                        <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                            {settings.aiApiKey ? (
                                latestScanResult && latestScanResult.resumen ? (
                                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginTop: '4px' }}>
                                        <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text)' }}>"{latestScanResult.resumen}"</p>
                                    </div>
                                ) : (
                                    <>
                                        Agente <strong>{settings.aiModel}</strong> activo.<br />
                                        Analizando background en tiempo real...
                                    </>
                                )
                            ) : (
                                "IA no configurada. Ve a Ajustes para activar el Copiloto."
                            )}
                        </div>
                    </div>

                    {/* Integrated Apps */}
                    {profile?.apps?.length > 0 && (
                        <div className="card">
                            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Apps Conectadas</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {profile.apps.map(app => (
                                    <span key={app} className="badge badge-primary">{app}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick actions */}
                    <div className="card">
                        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Acciones Rápidas</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {QUICK_ACTIONS.map(({ label, icon: Icon, action, color }) => (
                                <button key={label} onClick={action} className="btn btn-ghost" style={{ flexDirection: 'column', gap: 6, padding: '14px 10px', fontSize: 11 }}>
                                    <Icon size={18} color={color} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Leads */}
                    <div className="card" style={{ flex: 1 }}>
                        <div className="flex-between mb-4">
                            <h2 style={{ fontSize: 14, fontWeight: 700 }}>Leads Recientes</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/crm')}>
                                Ver todos <ArrowRight size={13} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {leads.slice(0, 4).map((lead) => (
                                <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--color-primary-light)', flexShrink: 0 }}>
                                        {lead.name[0]}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.company}</div>
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-success)' }}>${lead.value?.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
