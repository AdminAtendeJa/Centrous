import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, Users, FileCheck, Zap,
    Plus, CheckCircle2, Circle, Trash2,
    ArrowRight, Settings
} from 'lucide-react';
import { useTasksStore, useOnboardingStore, useAIStore, useSettingsStore } from '../../store/index.js';

const QUOTES = [
    'El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.',
    'Automatiza lo repetible. Humaniza lo importante.',
    'Un sistema bien construido trabaja mientras tú descansas.',
    'La consistencia supera a la brillantez. Construye todos los días.',
];

export default function Dashboard() {
    const navigate = useNavigate();
    const { tasks, addTask, toggleTask, deleteTask } = useTasksStore();
    const { profile } = useOnboardingStore();
    const { settings } = useSettingsStore();
    const { latestScanResult } = useAIStore();
    
    const [newTask, setNewTask] = useState('');
    const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    // Supabase State
    const [sbUrl, setSbUrl] = useState(() => localStorage.getItem('sb_url') || '');
    const [sbKey, setSbKey] = useState(() => localStorage.getItem('sb_key') || '');
    const [isConfigOpen, setIsConfigOpen] = useState(!localStorage.getItem('sb_key'));
    
    const [sbLeads, setSbLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdate, setLastUpdate] = useState('-');

    const handleSaveConfig = (e) => {
        e.preventDefault();
        const url = sbUrl.trim().replace(/\/$/, '');
        const key = sbKey.trim();
        if (!key || !url) return;
        localStorage.setItem('sb_url', url);
        localStorage.setItem('sb_key', key);
        setSbUrl(url);
        setSbKey(key);
        setIsConfigOpen(false);
        fetchData(url, key);
    };

    const fetchData = useCallback(async (url = sbUrl, key = sbKey) => {
        if (!url || !key) return;
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`${url}/rest/v1/leads?select=*&order=ultima_actividad.desc`, {
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) throw new Error(`Error de conexión: ${res.status}`);
            const data = await res.json();
            setSbLeads(data);
            setLastUpdate(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [sbUrl, sbKey]);

    useEffect(() => {
        if (sbUrl && sbKey) {
            fetchData();
            const interval = setInterval(() => fetchData(), 30000);
            return () => clearInterval(interval);
        }
    }, [fetchData, sbUrl, sbKey]);

    // KPI Calculations
    const total = sbLeads.length;
    const qualified = sbLeads.filter(l => l.calificacion === 'INTERESADO').length;
    const disqualified = sbLeads.filter(l => l.calificacion === 'NO_VIABLE').length;
    const active = sbLeads.filter(l => l.fase === 'EN_CALIFICACION').length;
    const paused = sbLeads.filter(l => l.is_pausada).length;
    const finalized = sbLeads.filter(l => l.fase === 'FINALIZADO').length;
    const conversionRate = total > 0 ? Math.round((qualified / total) * 100) : 0;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLeads = sbLeads.filter(l => l.ultima_actividad?.startsWith(todayStr)).length;

    // Charts Data
    const areas = sbLeads.reduce((acc, l) => {
        const a = l.area_legal || 'desconocida';
        acc[a] = (acc[a] || 0) + 1;
        return acc;
    }, {});
    const areaLabels = { transito: 'Tránsito', laboral: 'Laboral', desconocida: 'Sin definir' };
    const areaColors = { transito: 'linear-gradient(90deg,#3b82f6,#60a5fa)', laboral: 'linear-gradient(90deg,#f59e0b,#fbbf24)', desconocida: 'linear-gradient(90deg,#6b7280,#9ca3af)' };
    
    const sortedAreas = Object.entries(areas).sort((a, b) => b[1] - a[1]);

    const statusData = [
        { label: 'Calificados', count: qualified, bg: 'linear-gradient(90deg,var(--color-success),#4ade80)' },
        { label: 'En Calificación', count: active, bg: 'linear-gradient(90deg,var(--color-warning),#facc15)' },
        { label: 'Finalizados', count: finalized, bg: 'linear-gradient(90deg,var(--color-primary),#60a5fa)' },
        { label: 'Descalificados', count: disqualified, bg: 'linear-gradient(90deg,var(--color-danger),#f87171)' },
        { label: 'Pausados', count: paused, bg: 'linear-gradient(90deg,#a855f7,#c084fc)' }
    ].filter(s => s.count > 0);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        addTask({ text: newTask.trim(), priority: 'medium' });
        setNewTask('');
    };

    const PRIORITY_COLOR = { high: 'var(--color-danger)', medium: 'var(--color-warning)', low: 'var(--color-success)' };

    const getPillClass = (fase) => {
        switch(fase) {
            case 'FINALIZADO': return { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' };
            case 'EN_CALIFICACION': return { bg: 'rgba(234,179,8,0.12)', color: '#eab308' };
            case 'INICIAL': return { bg: 'rgba(168,85,247,0.12)', color: '#a855f7' };
            default: return { bg: 'rgba(168,85,247,0.12)', color: '#a855f7' };
        }
    };
    
    const getCalifPill = (calif) => {
        switch(calif) {
            case 'INTERESADO': return { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' };
            case 'NO_VIABLE': return { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' };
            default: return { bg: 'rgba(234,179,8,0.12)', color: '#eab308' };
        }
    };

    const timeAgo = (dateStr) => {
        if (!dateStr) return '-';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Ahora';
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        const days = Math.floor(hrs / 24);
        return `${days}d`;
    };

    const recentLeads = sbLeads.slice(0, 10);

    return (
        <div className="animate-in" style={{ paddingBottom: 40 }}>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Panel de Métricas - Leads ⚖️</h1>
                    <p style={{ fontStyle: 'italic', color: 'var(--color-primary-light)', marginTop: 4 }}>"{quote}"</p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ padding: '8px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', animation: 'pulse 2s infinite' }} />
                        {lastUpdate}
                    </div>
                    <button className="btn btn-ghost" onClick={() => fetchData()} disabled={isLoading}>
                        {isLoading ? '...' : '↻ Actualizar'}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setIsConfigOpen(true)}>
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            {/* Config Modal */}
            {isConfigOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ maxWidth: 480, width: '90%', textAlign: 'center', padding: 40 }}>
                        <h2 style={{ marginBottom: 8, fontSize: 24, fontWeight: 700 }}>Conectar a Supabase</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Ingresa tu API Key (anon/public) para cargar las métricas</p>
                        <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <input
                                value={sbUrl}
                                onChange={e => setSbUrl(e.target.value)}
                                placeholder="Supabase URL"
                                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--text)' }}
                            />
                            <input
                                value={sbKey}
                                onChange={e => setSbKey(e.target.value)}
                                placeholder="Tu anon/public key (eyJ...)"
                                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--text)' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '14px', justifyContent: 'center', fontSize: 15 }}>
                                Conectar
                            </button>
                            {localStorage.getItem('sb_key') && (
                                <button type="button" className="btn btn-ghost" onClick={() => setIsConfigOpen(false)}>Cancelar</button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {error && (
                <div style={{ padding: 16, background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderRadius: 12, marginBottom: 24, border: '1px solid rgba(239,68,68,0.2)' }}>
                    Error cargando datos: {error}
                </div>
            )}

            {/* KPIs */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,var(--color-primary),#a855f7)' }} />
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>Total Leads</div>
                    <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{total}</div>
                    <div style={{ fontSize: 12, marginTop: 10 }}>
                        <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>+{todayLeads} hoy</span>
                    </div>
                </div>
                
                <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--color-success)' }} />
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>Calificados</div>
                    <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{qualified}</div>
                    <div style={{ fontSize: 12, marginTop: 10 }}>
                        <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{qualified} listos</span>
                    </div>
                </div>
                
                <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--color-danger)' }} />
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>Descalificados</div>
                    <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{disqualified}</div>
                    <div style={{ fontSize: 12, marginTop: 10 }}>
                        <span style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{disqualified} no viables</span>
                    </div>
                </div>
                
                <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--color-warning)' }} />
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>En Calificación</div>
                    <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{active}</div>
                    <div style={{ fontSize: 12, marginTop: 10 }}>
                        <span style={{ background: 'rgba(234,179,8,0.12)', color: '#eab308', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{paused} pausados</span>
                    </div>
                </div>
            </div>

            {/* Main grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                {/* Left Column (Charts & Table) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    
                    {/* Charts Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Area Legal Chart */}
                        <div className="card">
                            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>📊 Leads por Área Legal</h3>
                            {isLoading ? (
                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
                            ) : sortedAreas.length === 0 ? (
                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Sin datos</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {sortedAreas.map(([key, count]) => {
                                        const pct = total > 0 ? Math.round((count/total)*100) : 0;
                                        return (
                                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 90, fontSize: 13, color: 'var(--text-muted)', textAlign: 'right' }}>
                                                    {areaLabels[key] || key}
                                                </div>
                                                <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 8, position: 'relative' }}>
                                                    <div style={{ 
                                                        width: `${Math.max(pct, 5)}%`, 
                                                        height: '100%', 
                                                        background: areaColors[key] || areaColors.desconocida,
                                                        borderRadius: 8, 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        paddingLeft: 10, 
                                                        fontSize: 12, 
                                                        fontWeight: 600 
                                                    }}>
                                                        {count} ({pct}%)
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Status Chart */}
                        <div className="card">
                            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>📈 Leads por Estado</h3>
                            {isLoading ? (
                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
                            ) : statusData.length === 0 ? (
                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Sin datos</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {statusData.map((s) => {
                                        const pct = total > 0 ? Math.round((s.count/total)*100) : 0;
                                        return (
                                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 100, fontSize: 13, color: 'var(--text-muted)', textAlign: 'right' }}>
                                                    {s.label}
                                                </div>
                                                <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 8, position: 'relative' }}>
                                                    <div style={{ 
                                                        width: `${Math.max(pct, 5)}%`, 
                                                        height: '100%', 
                                                        background: s.bg,
                                                        borderRadius: 8, 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        paddingLeft: 10, 
                                                        fontSize: 12, 
                                                        fontWeight: 600,
                                                        color: '#fff'
                                                    }}>
                                                        {s.count} ({pct}%)
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card" style={{ overflowX: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Últimos Leads (Supabase)</h3>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{recentLeads.length} de {total}</span>
                        </div>
                        
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--color-border)' }}>Nombre</th>
                                    <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--color-border)' }}>Teléfono</th>
                                    <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--color-border)' }}>Área</th>
                                    <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--color-border)' }}>Fase</th>
                                    <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--color-border)' }}>Calificación</th>
                                    <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--color-border)' }}>Actividad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan="6" style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando datos...</td></tr>
                                ) : recentLeads.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Sin leads encontrados</td></tr>
                                ) : (
                                    recentLeads.map(l => (
                                        <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: 12 }}><strong>{l.nombre || 'Prospecto'}</strong></td>
                                            <td style={{ padding: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{l.telefono || '-'}</td>
                                            <td style={{ padding: 12 }}>{l.area_legal || '-'}</td>
                                            <td style={{ padding: 12 }}>
                                                <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, ...getPillClass(l.fase) }}>
                                                    {l.fase || '-'}
                                                </span>
                                            </td>
                                            <td style={{ padding: 12 }}>
                                                <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, ...getCalifPill(l.calificacion) }}>
                                                    {l.calificacion || '-'}
                                                </span>
                                            </td>
                                            <td style={{ padding: 12, color: 'var(--text-muted)' }}>{timeAgo(l.ultima_actividad)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* Right Column (Tasks & AI) */}
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

                    {/* Tasks */}
                    <div className="card">
                        <div className="flex-between mb-4">
                            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Tareas del Día</h2>
                            <span className="badge badge-primary">{tasks.filter(t => !t.done).length} pendientes</span>
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
                                <div className="empty-state" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
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
                                    <button onClick={() => deleteTask(task.id)} className="btn-icon" style={{ padding: 4 }}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Pulsing CSS for AI indicator */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
            `}} />
        </div>
    );
}
