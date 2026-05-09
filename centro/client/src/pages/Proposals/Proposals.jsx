import { useState } from 'react';
import { Plus, Search, FileText, Download, MoreHorizontal, Clock } from 'lucide-react';

export default function Proposals() {
    const [searchTerm, setSearchTerm] = useState('');

    // Demo data for now, but following V3 high-density table pattern
    const proposals = [
        { id: '1', client: 'Acme Corp', title: 'Implementação CRM', value: 12500, date: '10 Mai, 2026', status: 'Draft' },
        { id: '2', client: 'TechFlow', title: 'Consultoria n8n', value: 3200, date: '08 Mai, 2026', status: 'Sent' },
        { id: '3', client: 'Global Logistics', title: 'Automação WhatsApp', value: 8900, date: '05 Mai, 2026', status: 'Accepted' },
    ];

    return (
        <div className="proposals-v3 animate-in">
            {/* Stats */}
            <div className="stat-grid-v3 mb-6">
                <div className="stat-card-v3">
                    <div className="stat-label-v3">Total em Propostas</div>
                    <div className="stat-value-v3">$24,600</div>
                    <div className="stat-delta-v3 up">↑ 12% vs mês anterior</div>
                </div>
                <div className="stat-card-v3">
                    <div className="stat-label-v3">Taxa de Aceite</div>
                    <div className="stat-value-v3">68%</div>
                    <div className="stat-delta-v3 neutral">Estável</div>
                </div>
                <div className="stat-card-v3">
                    <div className="stat-label-v3">Propostas Ativas</div>
                    <div className="stat-value-v3">12</div>
                    <div className="stat-delta-v3 up">↑ 3 novas</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar-v3 mb-4">
                <div className="search-box-v3">
                    <Search size={14} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar propostas..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="toolbar-actions-v3">
                    <button className="btn-v3-primary">
                        <Plus size={14} /> Criar Proposta
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="table-v3">
                    <thead>
                        <tr>
                            <th>Proposta</th>
                            <th>Cliente</th>
                            <th>Valor</th>
                            <th>Data</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proposals.map((p) => (
                            <tr key={p.id}>
                                <td>
                                    <div className="lead-cell-v3">
                                        <div className="lead-ava-v3" style={{background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)'}}>
                                            <FileText size={12} />
                                        </div>
                                        <span className="font-medium">{p.title}</span>
                                    </div>
                                </td>
                                <td>{p.client}</td>
                                <td className="font-medium">${p.value.toLocaleString()}</td>
                                <td>{p.date}</td>
                                <td>
                                    <span className={`tag-v3 ${p.status === 'Accepted' ? 'tag-green' : p.status === 'Sent' ? 'tag-blue' : 'tag-zinc'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button className="btn-icon-v3"><Download size={14} /></button>
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
