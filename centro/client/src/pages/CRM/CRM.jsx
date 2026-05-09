import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, MessageSquare, Phone, Mail, UserPlus, DollarSign, Building } from 'lucide-react';
import { useCRMStore } from '../../store/index.js';
import ModalV3 from '../../components/ui/ModalV3.jsx';

export default function CRM() {
    const { leads, addLead } = useCRMStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', company: '', value: '', stage: 'new' });

    const stats = [
      { label: 'Total Leads', value: leads.length, delta: '↑ 12%', trend: 'up' },
      { label: 'Pipeline', value: `R$${leads.reduce((a, b) => a + (b.value || 0), 0).toLocaleString()}`, delta: '↑ 8%', trend: 'up' },
      { label: 'Taxa Conversão', value: '24%', delta: '↓ 2%', trend: 'down' },
    ];

    const handleAddLead = () => {
        if (!newLead.name) return;
        addLead({
            id: Date.now(),
            ...newLead,
            value: Number(newLead.value),
            created_at: new Date().toISOString()
        });
        setIsModalOpen(false);
        setNewLead({ name: '', company: '', value: '', stage: 'new' });
    };

    const filteredLeads = leads.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (stage) => {
        switch(stage) {
            case 'new': return 'tag-blue';
            case 'qualified': return 'tag-amber';
            case 'proposal': return 'tag-green';
            case 'closed_won': return 'tag-zinc';
            case 'closed_lost': return 'tag-red';
            default: return 'tag-blue';
        }
    };

    return (
        <div className="crm-v3 animate-in" style={{ padding: '16px' }}>
            {/* Stats */}
            <div className="stat-grid-v3 mb-6 no-padding">
                {stats.map((stat, i) => (
                    <div key={i} className="kpi-card-v3">
                        <div className="kpi-label-v3">{stat.label}</div>
                        <div className="kpi-value-v3">{stat.value}</div>
                        <div className={`kpi-delta-v3 ${stat.trend === 'up' ? 'text-success' : 'text-danger'}`}>{stat.delta}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="toolbar-v3 mb-4">
                <div className="search-box-v3">
                    <Search size={12} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar leads..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="toolbar-actions-v3">
                    <button className="btn-v3-secondary">
                        <Filter size={12} /> Filtrar
                    </button>
                    <button className="btn-v3-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={12} /> Novo Lead
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
                                        <div className="lead-ava-v3" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                                            {lead.name[0]}
                                        </div>
                                        <span className="font-medium">{lead.name}</span>
                                    </div>
                                </td>
                                <td>{lead.company || '—'}</td>
                                <td>
                                    <span className={`tag-v3 ${getStatusColor(lead.stage)}`}>
                                        {lead.stage === 'new' ? 'Qualificado' : lead.stage}
                                    </span>
                                </td>
                                <td className="font-bold">R${(lead.value || 0).toLocaleString()}</td>
                                <td>
                                    <div className="channel-cell-v3">
                                        {lead.channel === 'WhatsApp' ? <Phone size={12} /> : <Mail size={12} />}
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

            {/* Modal Novo Lead */}
            <ModalV3 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Cadastrar Novo Lead"
                footer={(
                    <>
                        <button className="btn-v3-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button className="btn-v3-primary" onClick={handleAddLead}>Salvar Lead</button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <div>
                        <label className="label-v3">Nome Completo</label>
                        <input 
                            className="input-v3" 
                            placeholder="Ex: João Silva" 
                            value={newLead.name}
                            onChange={e => setNewLead({...newLead, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="label-v3">Empresa / Instituição</label>
                        <input 
                            className="input-v3" 
                            placeholder="Ex: Acme Corp" 
                            value={newLead.company}
                            onChange={e => setNewLead({...newLead, company: e.target.value})}
                        />
                    </div>
                    <div className="grid2-v3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label className="label-v3">Valor Estimado</label>
                            <input 
                                className="input-v3" 
                                type="number"
                                placeholder="R$ 0.00" 
                                value={newLead.value}
                                onChange={e => setNewLead({...newLead, value: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="label-v3">Etapa Inicial</label>
                            <select 
                                className="input-v3"
                                value={newLead.stage}
                                onChange={e => setNewLead({...newLead, stage: e.target.value})}
                            >
                                <option value="new">Qualificação</option>
                                <option value="qualified">Interesse</option>
                                <option value="proposal">Proposta</option>
                            </select>
                        </div>
                    </div>
                </div>
            </ModalV3>
        </div>
    );
}
