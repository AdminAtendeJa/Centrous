import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, MessageSquare, Phone, Mail } from 'lucide-react';
import { useCRMStore } from '../../store/index.js';

export default function CRM() {
    const { leads } = useCRMStore();
    const [searchTerm, setSearchTerm] = useState('');

    const stats = [
      { label: 'Total Leads', value: leads.length, delta: '↑ 12%', trend: 'up' },
      { label: 'Pipeline', value: `$${leads.reduce((a, b) => a + (b.value || 0), 0).toLocaleString()}`, delta: '↑ 8%', trend: 'up' },
      { label: 'Taxa Conversão', value: '24%', delta: '↓ 2%', trend: 'down' },
    ];

    const filteredLeads = leads.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (stage) => {
        switch(stage) {
            case 'new': return 'tag-blue';
            case 'qualified': return 'tag-amber';
            case 'proposal': return 'tag-green';
            case 'closed_won': return 'tag-green';
            case 'closed_lost': return 'tag-red';
            default: return 'tag-blue';
        }
    };

    return (
        <div className="crm-v3 animate-in">
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
                        placeholder="Pesquisar leads..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="toolbar-actions-v3">
                    <button className="btn-v3-secondary">
                        <Filter size={14} /> Filtrar
                    </button>
                    <button className="btn-v3-primary">
                        <Plus size={14} /> Novo Lead
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="table-v3">
                    <thead>
                        <tr>
                            <th>Lead</th>
                            <th>Empresa</th>
                            <th>Status</th>
                            <th>Valor</th>
                            <th>Canal</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.map((lead) => (
                            <tr key={lead.id}>
                                <td>
                                    <div className="lead-cell-v3">
                                        <div className="lead-ava-v3">{lead.name[0]}</div>
                                        <span>{lead.name}</span>
                                    </div>
                                </td>
                                <td>{lead.company || '—'}</td>
                                <td>
                                    <span className={`tag-v3 ${getStatusColor(lead.stage)}`}>
                                        {lead.stage}
                                    </span>
                                </td>
                                <td className="font-medium">${(lead.value || 0).toLocaleString()}</td>
                                <td>
                                    <div className="channel-cell-v3">
                                        {lead.channel === 'WhatsApp' && <Phone size={12} />}
                                        {lead.channel === 'Email' && <Mail size={12} />}
                                        {(!lead.channel || lead.channel === 'Web') && <MessageSquare size={12} />}
                                        <span>{lead.channel || 'Direct'}</span>
                                    </div>
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
