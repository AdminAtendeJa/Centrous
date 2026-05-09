import { useState } from 'react';
import { Search, RefreshCw, ExternalLink, FileText, Database, MoreHorizontal } from 'lucide-react';
import { useSettingsStore } from '../../store/index.js';

const DEMO_PAGES = [
    { id: '1', title: 'Sistema Prompt — AtendeJá', emoji: '🤖', lastEdited: '2026-04-05', type: 'page' },
    { id: '2', title: 'Base de Clientes', emoji: '👥', lastEdited: '2026-04-06', type: 'database' },
    { id: '3', title: 'Pipeline de Ventas', emoji: '💼', lastEdited: '2026-04-07', type: 'database' },
    { id: '4', title: 'Ideas & Servicios', emoji: '💡', lastEdited: '2026-04-04', type: 'page' },
    { id: '5', title: 'Tarifas & Propuestas', emoji: '💰', lastEdited: '2026-04-03', type: 'page' },
    { id: '6', title: 'Reuniones Agendadas', emoji: '📅', lastEdited: '2026-04-07', type: 'database' },
];

export default function NotionHub() {
    const { settings } = useSettingsStore();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const isConnected = !!settings.notionKey;

    const filtered = DEMO_PAGES.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    const stats = [
        { label: 'Páginas total', value: 42, delta: '↑ 2', trend: 'up' },
        { label: 'Bases de dados', value: 8, delta: '↑ 1', trend: 'up' },
        { label: 'Sincronização', value: 'Ativa', delta: 'Estável', trend: 'neutral' },
    ];

    return (
        <div className="notion-hub-v3 animate-in">
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
                    <Search size={14} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar páginas no Notion..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="toolbar-actions-v3">
                    <button className="btn-v3-secondary" onClick={() => setLoading(true)}>
                        <RefreshCw size={14} className={loading ? 'spin' : ''} />
                    </button>
                    <button className="btn-v3-primary">
                        <ExternalLink size={14} /> Ir para o Notion
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="table-v3">
                    <thead>
                        <tr>
                            <th>Documento</th>
                            <th>Tipo</th>
                            <th>Última Edição</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((page) => (
                            <tr key={page.id}>
                                <td>
                                    <div className="lead-cell-v3">
                                        <span style={{ fontSize: 18, marginRight: 8 }}>{page.emoji}</span>
                                        <span className="font-medium">{page.title}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="channel-cell-v3">
                                        {page.type === 'database' ? <Database size={12} /> : <FileText size={12} />}
                                        <span>{page.type === 'database' ? 'Base de dados' : 'Página'}</span>
                                    </div>
                                </td>
                                <td>{page.lastEdited}</td>
                                <td>
                                    <div className="flex gap-2">
                                        <button className="btn-icon-v3"><ExternalLink size={14} /></button>
                                        <button className="btn-icon-v3"><MoreHorizontal size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
