import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, MessageSquare, Phone, Mail, UserPlus, DollarSign, Trash2, Edit2, CheckCircle, X } from 'lucide-react';
import { useCRMStore } from '../../store/index.js';
import ModalV3 from '../../components/ui/ModalV3.jsx';
import toast from 'react-hot-toast';

const STAGE_LABELS = {
    new: 'Qualificação',
    qualified: 'Interesse',
    proposal: 'Proposta',
    closed_won: 'Fechado ✓',
    closed_lost: 'Perdido',
};

const STAGE_FILTERS = ['Todos', 'new', 'qualified', 'proposal', 'closed_won', 'closed_lost'];

export default function CRM() {
    const { leads, addLead, updateLead, deleteLead } = useCRMStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [actionMenu, setActionMenu] = useState(null); // leadId with open menu
    const [editingLead, setEditingLead] = useState(null);
    const [newLead, setNewLead] = useState({ name: '', company: '', value: '', stage: 'new', channel: 'Direct' });

    const stats = [
      { label: 'Total Leads', value: leads.length, delta: '↑ 12%', trend: 'up' },
      { label: 'Pipeline', value: `R$${leads.reduce((a, b) => a + (b.value || 0), 0).toLocaleString('pt-BR')}`, delta: '↑ 8%', trend: 'up' },
      { label: 'Taxa Conversão', value: `${leads.length > 0 ? Math.round((leads.filter(l => l.stage === 'closed_won').length / leads.length) * 100) : 0}%`, delta: 'Calculado', trend: 'neutral' },
    ];

    const handleAddLead = () => {
        if (!newLead.name) return;
        addLead({
            ...newLead,
            value: Number(newLead.value),
            created_at: new Date().toISOString()
        });
        setIsModalOpen(false);
        setNewLead({ name: '', company: '', value: '', stage: 'new', channel: 'Direct' });
        toast.success('Lead adicionado com sucesso!');
    };

    const handleUpdateLead = () => {
        if (!editingLead) return;
        updateLead(editingLead.id, {
            name: editingLead.name,
            company: editingLead.company,
            value: Number(editingLead.value),
            stage: editingLead.stage,
        });
        setEditingLead(null);
    };

    const handleDeleteLead = (id) => {
        if (!confirm('Tem certeza que deseja excluir este lead?')) return;
        deleteLead(id);
        setActionMenu(null);
    };

    const filteredLeads = leads.filter(l => {
        const matchSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            l.company?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStage = stageFilter === 'Todos' || l.stage === stageFilter;
        return matchSearch && matchStage;
    });

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
                        <div className={`kpi-delta-v3 ${stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-danger' : 'text-tertiary'}`}>{stat.delta}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="toolbar-v3 mb-4">
                <div className="search-box-v3" style={{ flex: 1 }}>
                    <Search size={12} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar leads..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="toolbar-actions-v3">
                    <div style={{ position: 'relative' }}>
                        <button 
                            className={`btn-v3-secondary ${isFilterOpen ? 'border-accent text-accent' : ''}`}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <Filter size={12} /> 
                            Filtrar {stageFilter !== 'Todos' && `(${STAGE_LABELS[stageFilter] || stageFilter})`}
                        </button>
                        {isFilterOpen && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, marginTop: 4,
                                background: 'white', border: '0.5px solid var(--color-border-primary)',
                                borderRadius: 12, padding: 8, zIndex: 100, minWidth: 180,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }}>
                                {STAGE_FILTERS.map(f => (
                                    <button
                                        key={f}
                                        style={{
                                            display: 'block', width: '100%', textAlign: 'left',
                                            padding: '8px 12px', borderRadius: 8, border: 'none',
                                            background: stageFilter === f ? 'var(--color-accent-light)' : 'transparent',
                                            color: stageFilter === f ? 'var(--color-accent)' : 'var(--color-text-primary)',
                                            fontSize: 12, fontWeight: 600, cursor: 'pointer'
                                        }}
                                        onClick={() => { setStageFilter(f); setIsFilterOpen(false); }}
                                    >
                                        {f === 'Todos' ? 'Todos os leads' : STAGE_LABELS[f]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
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
                        {filteredLeads.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-tertiary)', fontSize: 12 }}>
                                    Nenhum lead encontrado.
                                </td>
                            </tr>
                        )}
                        {filteredLeads.map((lead) => (
                            <tr key={lead.id}>
                                <td>
                                    <div className="lead-cell-v3">
                                        <div className="lead-ava-v3" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                                            {lead.name?.[0] || '?'}
                                        </div>
                                        <span className="font-medium">{lead.name}</span>
                                    </div>
                                </td>
                                <td>{lead.company || '—'}</td>
                                <td>
                                    <span className={`tag-v3 ${getStatusColor(lead.stage)}`}>
                                        {STAGE_LABELS[lead.stage] || lead.stage}
                                    </span>
                                </td>
                                <td className="font-bold">R${(lead.value || 0).toLocaleString('pt-BR')}</td>
                                <td>
                                    <div className="channel-cell-v3">
                                        {lead.channel === 'WhatsApp' ? <Phone size={12} /> : <Mail size={12} />}
                                        <span>{lead.channel || 'Direct'}</span>
                                    </div>
                                </td>
                                <td style={{ position: 'relative' }}>
                                    <button 
                                        className="btn-icon-v3"
                                        onClick={() => setActionMenu(actionMenu === lead.id ? null : lead.id)}
                                    >
                                        <MoreHorizontal size={14} />
                                    </button>
                                    {actionMenu === lead.id && (
                                        <div style={{
                                            position: 'absolute', right: 0, top: '100%', marginTop: 4,
                                            background: 'white', border: '0.5px solid var(--color-border-primary)',
                                            borderRadius: 12, padding: 8, zIndex: 200, minWidth: 160,
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                                        }}>
                                            <button
                                                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--color-text-primary)' }}
                                                onClick={() => { setEditingLead({...lead}); setActionMenu(null); }}
                                            >
                                                <Edit2 size={12} /> Editar Lead
                                            </button>
                                            <button
                                                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--color-danger)' }}
                                                onClick={() => handleDeleteLead(lead.id)}
                                            >
                                                <Trash2 size={12} /> Excluir Lead
                                            </button>
                                        </div>
                                    )}
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
                            autoFocus
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                    <div>
                        <label className="label-v3">Canal de Origem</label>
                        <select 
                            className="input-v3"
                            value={newLead.channel}
                            onChange={e => setNewLead({...newLead, channel: e.target.value})}
                        >
                            <option value="Direct">Direto</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Instagram">Instagram</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Indicação">Indicação</option>
                            <option value="Meta Ads">Meta Ads</option>
                        </select>
                    </div>
                </div>
            </ModalV3>

            {/* Modal Editar Lead */}
            <ModalV3
                isOpen={!!editingLead}
                onClose={() => setEditingLead(null)}
                title="Editar Lead"
                footer={(
                    <>
                        <button className="btn-v3-ghost" onClick={() => setEditingLead(null)}>Cancelar</button>
                        <button className="btn-v3-primary" onClick={handleUpdateLead}>Salvar Alterações</button>
                    </>
                )}
            >
                {editingLead && (
                    <div className="space-y-4">
                        <div>
                            <label className="label-v3">Nome Completo</label>
                            <input 
                                className="input-v3" 
                                value={editingLead.name}
                                onChange={e => setEditingLead({...editingLead, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="label-v3">Empresa</label>
                            <input 
                                className="input-v3" 
                                value={editingLead.company || ''}
                                onChange={e => setEditingLead({...editingLead, company: e.target.value})}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="label-v3">Valor</label>
                                <input 
                                    className="input-v3"
                                    type="number"
                                    value={editingLead.value || ''}
                                    onChange={e => setEditingLead({...editingLead, value: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="label-v3">Etapa</label>
                                <select 
                                    className="input-v3"
                                    value={editingLead.stage}
                                    onChange={e => setEditingLead({...editingLead, stage: e.target.value})}
                                >
                                    {Object.entries(STAGE_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </ModalV3>
        </div>
    );
}
