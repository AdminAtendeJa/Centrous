import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, Users, FileCheck, Zap,
    Plus, CheckCircle2, Circle, Trash2,
    ArrowRight, MessageSquare, Briefcase
} from 'lucide-react';
import { useTasksStore, useSettingsStore, useCRMStore } from '../../store/index.js';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const navigate = useNavigate();
    const { tasks, addTask, toggleTask, deleteTask } = useTasksStore();
    const { settings } = useSettingsStore();
    const { leads } = useCRMStore();
    
    const [newTask, setNewTask] = useState('');

    const activeLeads = leads.filter(l => l.status !== 'won' && l.status !== 'lost');
    const totalValue = leads.filter(l => l.status === 'won').reduce((acc, l) => acc + (l.value || 0), 0);
    const pendingTasks = tasks.filter(t => !t.done);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        addTask({
            id: Date.now().toString(),
            text: newTask,
            done: false,
            priority: 'medium',
            created_at: new Date().toISOString()
        });
        setNewTask('');
        toast.success('Tarea agregada');
    };

    const QUICK_ACTIONS = [
        { label: 'Nuevo Lead', icon: Users, action: () => navigate('/crm'), color: 'var(--color-primary)' },
        { label: 'Crear Propuesta', icon: FileCheck, action: () => navigate('/proposals'), color: 'var(--color-warning)' },
        { label: 'Mensajes', icon: MessageSquare, action: () => navigate('/inbox'), color: 'var(--color-success)' },
        { label: 'Ajustes', icon: Zap, action: () => navigate('/settings'), color: 'var(--color-accent)' },
    ];

    const PRIORITY_COLOR = {
        low: 'var(--color-success)',
        medium: 'var(--color-warning)',
        high: 'var(--color-danger)'
    };

    return (
        <div className="animate-in" style={{ paddingBottom: 40 }}>
            {/* Header */}
            <header className="page-header" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Panel de Control</h1>
                        <p>Resumen táctico de tu negocio.</p>
                    </div>
                </div>
            </header>

            {/* Metrics */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="flex-between mb-4">
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Leads Activos</span>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={18} color="#3b82f6" />
                        </div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{activeLeads.length}</div>
                </div>
                <div className="card">
                    <div className="flex-between mb-4">
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Valor Cerrado</span>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={18} color="#22c55e" />
                        </div>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>${totalValue.toLocaleString()}</div>
                </div>
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
                            style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}
                        />
                        <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                            <Plus size={14} />
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {tasks.length === 0 && (
                            <div className="empty-state" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                                <CheckCircle2 size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
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
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.medium, flexShrink: 0 }} />
                                <span style={{ flex: 1, fontSize: 13, textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</span>
                                <button onClick={() => deleteTask(task.id)} className="btn-icon" style={{ padding: 4, background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}>
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
                        <div className="flex-between mb-3" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Zap size={14} color="#7c3aed" /> Estado del Agente
                            </h2>
                            <div className="ai-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: settings.aiApiKey ? '#22c55e' : '#64748b' }} />
                        </div>
                        <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                            {settings.aiApiKey ? (
                                <>
                                    Agente <strong>{settings.aiModel}</strong> activo.<br />
                                    Próximo escaneo automático en 30 min.
                                </>
                            ) : (
                                "IA no configurada. Ve a Ajustes para activar el Copiloto."
                            )}
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="card">
                        <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Acciones Rápidas</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {QUICK_ACTIONS.map(({ label, icon: Icon, action, color }) => (
                                <button key={label} onClick={action} className="btn btn-ghost" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 10px', fontSize: 11, background: 'var(--color-surface-2)', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                                    <Icon size={18} color={color} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Leads */}
                    <div className="card" style={{ flex: 1 }}>
                        <div className="flex-between mb-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: 14, fontWeight: 700 }}>Leads Recientes</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/crm')} style={{ fontSize: 11, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
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
                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-success)' }}>${lead.value?.toLocaleString() || 0}</div>
                                </div>
                            ))}
                            {leads.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>No hay leads aún.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
