import { useState, useEffect } from 'react';
import { Workflow, RefreshCw, Power, CheckCircle, XCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useSettingsStore } from '../../store/index.js';

const DEMO_WORKFLOWS = [
    { id: '1', name: 'AtendeJá — WhatsApp SDR', active: true, lastExecution: { status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() }, executionCount: 842 },
    { id: '2', name: 'Lead → Notion + Google Sheets', active: true, lastExecution: { status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() }, executionCount: 312 },
    { id: '3', name: 'Gmail Notificaciones Leads', active: false, lastExecution: { status: 'error', startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }, executionCount: 58 },
    { id: '4', name: 'Google Calendar — Recordatorios', active: true, lastExecution: { status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() }, executionCount: 204 },
    { id: '5', name: 'Reporte Semanal Automático', active: false, lastExecution: null, executionCount: 12 },
];

function StatusBadge({ status }) {
    if (status === 'success') return <span className="badge badge-success"><CheckCircle size={10} /> Exitoso</span>;
    if (status === 'error') return <span className="badge badge-danger"><XCircle size={10} /> Error</span>;
    return <span className="badge badge-muted">Sin ejecuciones</span>;
}

function relativeTime(dateStr) {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'hace un momento';
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h}h`;
    return `hace ${Math.floor(h / 24)}d`;
}

export default function N8nMonitor() {
    const { settings } = useSettingsStore();
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isConnected = !!settings.n8nUrl && !!settings.n8nApiKey;

    const fetchWorkflows = async () => {
        if (!isConnected) { setWorkflows(DEMO_WORKFLOWS); return; }
        setLoading(true); setError(null);
        try {
            const res = await axios.get('/api/n8n/workflows', {
                headers: {
                    'x-n8n-url': settings.n8nUrl,
                    'x-n8n-api-key': settings.n8nApiKey,
                }
            });
            setWorkflows(res.data);
        } catch (e) {
            setError(e.response?.data?.message || 'No se pudo conectar con n8n');
            setWorkflows(DEMO_WORKFLOWS);
        } finally {
            setLoading(false);
        }
    };

    const toggleWorkflow = async (id, active) => {
        if (!isConnected) {
            setWorkflows((prev) => prev.map((w) => w.id === id ? { ...w, active: !active } : w));
            return;
        }
        try {
            await axios.patch(`/api/n8n/workflows/${id}/toggle`, { active: !active }, {
                headers: {
                    'x-n8n-url': settings.n8nUrl,
                    'x-n8n-api-key': settings.n8nApiKey,
                }
            });
            fetchWorkflows();
        } catch (e) {
            setError('No se pudo cambiar el estado del workflow');
        }
    };

    useEffect(() => { fetchWorkflows(); }, [isConnected]);

    const activeCount = workflows.filter((w) => w.active).length;
    const errorCount = workflows.filter((w) => w.lastExecution?.status === 'error').length;

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1>n8n Monitor ⚙️</h1>
                <p>Estado de tus workflows en tiempo real.</p>
            </div>

            {!isConnected && (
                <div className="demo-banner">
                    <Info size={16} />
                    Datos de demo. Configura tu n8n URL y API Key en <strong style={{ marginLeft: 4 }}>Ajustes</strong>.
                </div>
            )}

            {/* Stats row */}
            <div className="grid-3" style={{ marginBottom: 24 }}>
                <div className="card flex-center gap-3">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={20} color="var(--color-success)" />
                    </div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>{activeCount}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Workflows Activos</div>
                    </div>
                </div>
                <div className="card flex-center gap-3">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,92,92,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={20} color="var(--color-danger)" />
                    </div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>{errorCount}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Con Errores</div>
                    </div>
                </div>
                <div className="card flex-center gap-3">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(108,99,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Workflow size={20} color="var(--color-primary-light)" />
                    </div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>{workflows.length}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Workflows</div>
                    </div>
                </div>
            </div>

            <div className="flex-between mb-4">
                <h2 style={{ fontSize: 15, fontWeight: 700 }}>Todos los Workflows</h2>
                <div className="flex gap-2">
                    <button className="btn btn-ghost" onClick={fetchWorkflows} disabled={loading}>
                        <RefreshCw size={14} /> {loading ? 'Actualizando…' : 'Actualizar'}
                    </button>
                    {isConnected && settings.n8nUrl && (
                        <a href={settings.n8nUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                            <ExternalLink size={14} /> Abrir n8n
                        </a>
                    )}
                </div>
            </div>

            {error && (
                <div style={{ background: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16, color: 'var(--color-danger)', fontSize: 13 }}>
                    ⚠️ {error}
                </div>
            )}

            {loading ? (
                <div className="empty-state"><div className="loading-spinner" /></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {workflows.map((wf) => (
                        <div key={wf.id} className="card" style={{ padding: '14px 18px' }}>
                            <div className="flex-between">
                                <div className="flex-center gap-3">
                                    <div style={{
                                        width: 10, height: 10, borderRadius: '50%',
                                        background: wf.active ? 'var(--color-success)' : 'var(--color-surface-3)',
                                        boxShadow: wf.active ? '0 0 8px var(--color-success)' : 'none',
                                    }} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{wf.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                            {wf.executionCount} ejecuciones · Última: {relativeTime(wf.lastExecution?.startedAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-center gap-3">
                                    <StatusBadge status={wf.lastExecution?.status} />
                                    <button
                                        onClick={() => toggleWorkflow(wf.id, wf.active)}
                                        className="btn-icon"
                                        title={wf.active ? 'Desactivar' : 'Activar'}
                                        style={{ color: wf.active ? 'var(--color-success)' : 'var(--text-muted)' }}
                                    >
                                        <Power size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
