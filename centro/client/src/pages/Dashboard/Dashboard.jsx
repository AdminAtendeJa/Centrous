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
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--color-surface), rgba(99, 102, 241, 0.03))' }}>
                    <div className="flex-between mb-4">
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Leads Activos</span>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={18} color="var(--color-primary)" />
                        </div>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>{activeLeads.length}</div>
                </div>
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--color-surface), rgba(16, 185, 129, 0.03))' }}>
                    <div className="flex-between mb-4">
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Valor Cerrado</span>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={18} color="var(--color-success)" />
                        </div>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>${totalValue.toLocaleString()}</div>
                </div>
            </div>

            {/* Main grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                {/* Tasks */}
                <div className="card">
                    <div className="flex-between mb-4">
                        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Tareas Pendientes</h2>
                        <span className="badge badge-primary">{pendingTasks.length} hoy</span>
                    </div>

                    <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                        <input
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="¿Qué hay que hacer hoy?"
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 16px' }}>
                            <Plus size={18} />
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {tasks.length === 0 && (
                            <div className="empty-state" style={{ padding: 32 }}>
                                <CheckCircle2 size={40} style={{ opacity: 0.2 }} />
                                <h3>¡Todo despejado!</h3>
                                <p>No tienes tareas pendientes para este momento.</p>
                            </div>
                        )}
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="glass-panel"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 16px',
                                    opacity: task.done ? 0.4 : 1,
                                    transition: 'var(--transition)',
                                    background: 'rgba(255, 255, 255, 0.01)',
                                }}
                            >
                                <button
                                    onClick={() => toggleTask(task.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.done ? 'var(--color-success)' : 'var(--text-muted)', display: 'flex' }}
                                >
                                    {task.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </button>
                                <div style={{ width: 4, height: 16, borderRadius: 2, background: PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.medium, flexShrink: 0 }} />
                                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</span>
                                <button onClick={() => deleteTask(task.id)} className="btn-icon" style={{ width: 32, height: 32, color: 'var(--color-danger)', background: 'transparent', border: 'none' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Agent Status */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <div className="flex-between mb-3">
                            <h2 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Zap size={16} color="var(--color-primary)" fill="var(--color-primary)" /> Centrous Copilot
                            </h2>
                            <div className="ai-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: settings.aiApiKey ? 'var(--color-success)' : 'var(--text-muted)' }} />
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', fontWeight: 400 }}>
                            {settings.aiApiKey ? (
                                <>
                                    Inteligencia artificial <strong style={{ color: '#fff' }}>{settings.aiModel}</strong> activa y lista para calificar tus leads.
                                </>
                            ) : (
                                "Conecta tu API Key de Groq o OpenAI para activar la calificación automática."
                            )}
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="card">
                        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Acceso Rápido</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {QUICK_ACTIONS.map(({ label, icon: Icon, action, color }) => (
                                <button 
                                    key={label} 
                                    onClick={action} 
                                    className="btn-ghost" 
                                    style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        gap: 8, 
                                        padding: '16px 12px', 
                                        fontSize: 12, 
                                        fontWeight: 600,
                                        borderRadius: 12,
                                        border: '1px solid var(--color-border)',
                                        cursor: 'pointer' 
                                    }}
                                >
                                    <Icon size={20} color={color} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Leads */}
                    <div className="card" style={{ flex: 1 }}>
                        <div className="flex-between mb-4">
                            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Leads Recientes</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/crm')} style={{ color: 'var(--text-muted)', border: 'none', background: 'transparent' }}>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {leads.slice(0, 5).map((lead) => (
                                <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--color-primary-light)', flexShrink: 0 }}>
                                        {lead.name[0]}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{lead.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.company}</div>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-success)' }}>${lead.value?.toLocaleString() || 0}</div>
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
