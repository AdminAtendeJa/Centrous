import React from 'react';
import { 
    Users, ArrowRight, Plus, 
    TrendingUp, TrendingDown,
    DollarSign, Briefcase
} from 'lucide-react';
import { useTasksStore, useCRMStore } from '../../store/index.js';

export default function Dashboard() {
    const { tasks, toggleTask } = useTasksStore();
    const { leads } = useCRMStore();
    
    // KPI Data (Derived from real state)
    const stats = [
        { label: 'Receita Est.', value: 'R$48k', delta: '↑ 12% vs mês anterior', trend: 'up' },
        { label: 'Leads Ativos', value: leads.length, delta: '↑ 8 novos hoje', trend: 'up' },
        { label: 'Conversão', value: '23%', delta: '↓ 2% vs meta', trend: 'down' },
    ];

    const pipelineLeads = leads.slice(0, 4);

    return (
        <div className="dashboard-v3 animate-in" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Executive KPIs */}
            <div className="stat-grid-v3 no-padding">
                {stats.map((stat, i) => (
                    <div key={i} className="kpi-card-v3">
                        <div className="kpi-label-v3">{stat.label}</div>
                        <div className="kpi-value-v3">{stat.value}</div>
                        <div className={`kpi-delta-v3 ${stat.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                            {stat.delta}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid2-v3" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', flex: 1 }}>
                
                {/* Flow Chart (Fake bars for high-density look) */}
                <div className="section-v3">
                    <div className="section-header-v3">
                        <span className="section-title-v3">Fluxo de Caixa</span>
                        <button className="btn-v3-secondary" style={{ height: '22px', fontSize: '10px' }}>Ver tudo</button>
                    </div>
                    <div className="p-4">
                        <div className="chart-bars-v3" style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px', marginBottom: '12px' }}>
                            {[30, 55, 40, 70, 50, 85, 60, 95, 75, 80, 45, 90].map((h, i) => (
                                <div key={i} className="flex-1" style={{ 
                                    height: `${h}%`, 
                                    background: i % 2 === 0 ? 'var(--color-accent)' : 'var(--color-accent-light)',
                                    borderRadius: '3px 3px 0 0'
                                }} />
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--color-accent)' }} />
                                <span className="text-9 text-secondary">Receita</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--color-accent-light)' }} />
                                <span className="text-9 text-secondary">Despesa</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pipeline List */}
                <div className="section-v3">
                    <div className="section-header-v3">
                        <span className="section-title-v3">Pipeline CRM</span>
                        <button className="btn-v3-primary" style={{ height: '22px', fontSize: '10px' }}>+ Novo</button>
                    </div>
                    <div className="p-2">
                        {pipelineLeads.length > 0 ? pipelineLeads.map((lead) => (
                            <div key={lead.id} className="lead-row-v3 flex items-center gap-3 p-2 border-bottom-v3 last:border-none" style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: lead.stage === 'closed_won' ? 'var(--color-success)' : 'var(--color-warning)' }} />
                                <span className="text-11 font-medium flex-1 truncate">{lead.name}</span>
                                <span className="text-10 text-secondary">R${lead.value?.toLocaleString() || '0'}</span>
                                <span className={`tag-v3 ${lead.stage === 'closed_won' ? 'tag-zinc' : 'tag-amber'}`}>
                                    {lead.stage === 'new' ? 'Qualif.' : lead.stage === 'closed_won' ? 'Ganho' : 'Negoc.'}
                                </span>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-tertiary text-10">Nenhum lead no funil.</div>
                        )}
                    </div>
                </div>

            </div>

            {/* Bottom Actions Grid */}
            <div className="dashboard-footer-v3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="card-v3">
                    <div className="flex-between mb-4">
                        <span className="text-10 font-bold uppercase tracking-wider text-secondary">Próximas Tarefas</span>
                        <button className="text-10 text-accent font-bold">Agenda completa</button>
                    </div>
                    <div className="space-y-2">
                        {tasks.slice(0, 3).map(task => (
                            <div key={task.id} className="flex items-center gap-3">
                                <button 
                                    className={`check-circle-v3 ${task.done ? 'done' : ''}`}
                                    onClick={() => toggleTask(task.id)}
                                />
                                <span className={`text-11 truncate ${task.done ? 'text-tertiary line-through' : 'text-primary'}`}>{task.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="card-v3" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                    <div className="flex-between mb-2">
                        <span className="text-10 font-bold uppercase opacity-80">Insight de IA</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                    <p className="text-11 leading-relaxed mb-4 opacity-90">
                        Você tem 3 propostas vencendo hoje. Sugerimos enviar um follow-up automático para acelerar o fechamento.
                    </p>
                    <button className="w-full h-8 rounded-md bg-white text-accent text-10 font-bold hover:bg-opacity-90 transition-all">
                        Executar automação
                    </button>
                </div>
            </div>

        </div>
    );
}
