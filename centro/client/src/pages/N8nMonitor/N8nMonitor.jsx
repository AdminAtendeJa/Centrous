import { useState } from 'react';
import { RefreshCw, Power, CheckCircle, XCircle, ExternalLink, Workflow, MoreHorizontal, Activity } from 'lucide-react';
import { useSettingsStore } from '../../store/index.js';

const DEMO_WORKFLOWS = [
    { id: '1', name: 'AtendeJá — WhatsApp SDR', active: true, status: 'success', lastRun: '5m atrás', executions: 842 },
    { id: '2', name: 'Lead → Notion + Google Sheets', active: true, status: 'success', lastRun: '12m atrás', executions: 312 },
    { id: '3', name: 'Gmail Notificaciones Leads', active: false, status: 'error', lastRun: '2h atrás', executions: 58 },
    { id: '4', name: 'Google Calendar — Recordatórios', active: true, status: 'success', lastRun: '30m atrás', executions: 204 },
];

export default function N8nMonitor() {
    const { settings } = useSettingsStore();
    const [loading, setLoading] = useState(false);
    const [workflows, setWorkflows] = useState(DEMO_WORKFLOWS);

    const stats = [
        { label: 'Workflows Ativos', value: workflows.filter(w => w.active).length, delta: 'Estável', trend: 'neutral' },
        { label: 'Erros Recentes', value: workflows.filter(w => w.status === 'error').length, delta: '↑ 1 novo', trend: 'down' },
        { label: 'Execuções (24h)', value: '1.2k', delta: '↑ 15%', trend: 'up' },
    ];

    const toggleActive = (id) => {
        setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
    };

    return (
        <div className="n8n-monitor-v3 animate-in">
            {/* Stats */}
            <div className="stat-grid-v3 mb-6">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card-v3">
                        <div className="stat-label-v3">{stat.label}</div>
                        <div className="stat-value-v3">{stat.value}</div>
                        <div className={`stat-delta-v3 ${stat.trend}`}>{stat.delta}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="toolbar-v3 mb-4">
                <div className="search-box-v3">
                    <Activity size={14} />
                    <span style={{fontSize: 13, fontWeight: 500}}>Status do Servidor: <span className="text-success">Operacional</span></span>
                </div>
                <div className="toolbar-actions-v3">
                    <button className="btn-v3-secondary" onClick={() => setLoading(true)}>
                        <RefreshCw size={14} className={loading ? 'spin' : ''} />
                    </button>
                    <button className="btn-v3-primary">
                        <ExternalLink size={14} /> Abrir n8n
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="table-v3">
                    <thead>
                        <tr>
                            <th>Workflow</th>
                            <th>Status</th>
                            <th>Última Execução</th>
                            <th>Total</th>
                            <th>Ativo</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {workflows.map((wf) => (
                            <tr key={wf.id}>
                                <td>
                                    <div className="lead-cell-v3">
                                        <div className="lead-ava-v3" style={{background: 'rgba(255, 109, 90, 0.1)', color: '#ff6d5a'}}>
                                            <Workflow size={12} />
                                        </div>
                                        <span className="font-medium">{wf.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="channel-cell-v3">
                                        {wf.status === 'success' ? (
                                            <CheckCircle size={12} className="text-success" />
                                        ) : (
                                            <XCircle size={12} className="text-danger" />
                                        )}
                                        <span className={wf.status === 'success' ? 'text-success' : 'text-danger'}>
                                            {wf.status === 'success' ? 'Sucesso' : 'Erro'}
                                        </span>
                                    </div>
                                </td>
                                <td>{wf.lastRun}</td>
                                <td>{wf.executions}</td>
                                <td>
                                    <button 
                                        className={`btn-icon-v3 ${wf.active ? 'text-success' : ''}`}
                                        onClick={() => toggleActive(wf.id)}
                                    >
                                        <Power size={14} />
                                    </button>
                                </td>
                                <td>
                                    <button className="btn-icon-v3">
                                        <MoreHorizontal size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
