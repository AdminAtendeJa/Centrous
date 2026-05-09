import React from 'react';
import { 
    Users, ArrowRight, Plus, 
} from 'lucide-react';
import { useTasksStore, useCRMStore } from '../../store/index.js';

export default function Dashboard() {
    const { tasks, toggleTask } = useTasksStore();
    const { leads } = useCRMStore();
    
    const stats = [
        { label: 'Leads Ativos', value: leads.length, delta: 'Total no funil', trend: 'neutral' },
        { label: 'Tarefas Pendentes', value: tasks.filter(t => !t.done).length, delta: 'Agendadas para hoje', trend: 'neutral' },
        { label: 'Cierres do Mês', value: leads.filter(l => l.stage === 'closed_won').length, delta: 'Conversões reais', trend: 'up' },
    ];

    const todayTasks = tasks.slice(0, 5);

    const getTagClass = (priority) => {
        if (priority === 'high') return 'tag-red';
        if (priority === 'medium') return 'tag-amber';
        return 'tag-blue';
    };

    const getStatusLabel = (done, priority) => {
        if (done) return 'Concluído';
        if (priority === 'high') return 'Urgente';
        return 'Em foco';
    };

    return (
        <div className="dashboard-v3 animate-in">
            {/* Stats Grid */}
            <div className="section-v3 mb-6">
                <div className="section-header-v3">
                    <span className="section-title-v3">Resumo Executivo</span>
                    <button className="btn-v3-secondary">
                        Ver Relatório <ArrowRight size={11} />
                    </button>
                </div>
                <div className="stat-grid-v3">
                    {stats.map((stat, i) => (
                        <div key={i} className="stat-card-v3">
                            <div className="stat-label-v3">{stat.label}</div>
                            <div className="stat-value-v3">{stat.value}</div>
                            <div className={`stat-delta-v3 ${stat.trend}`}>
                                {stat.delta}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-main-v3">
                {/* Tasks Section */}
                <div className="section-v3">
                    <div className="section-header-v3">
                        <span className="section-title-v3">Próximas Ações</span>
                        <button className="btn-v3-primary">
                            <Plus size={11} /> Nova tarefa
                        </button>
                    </div>
                    <div className="task-list-v3">
                        {todayTasks.length > 0 ? todayTasks.map((task) => (
                            <div key={task.id} className="task-item-v3 card-v3 mb-2" style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <button 
                                    className={`check-circle-v3 ${task.done ? 'done' : ''}`}
                                    onClick={() => toggleTask(task.id)}
                                />
                                <span className={`task-text-v3 ${task.done ? 'done' : ''}`} style={{flex: 1, fontSize: 13}}>
                                    {task.text}
                                </span>
                                <span className={`tag-v3 ${getTagClass(task.priority)}`}>
                                    {getStatusLabel(task.done, task.priority)}
                                </span>
                            </div>
                        )) : (
                            <div className="empty-state-v3 card-v3 py-8 text-center text-tertiary">
                                Nenhuma tarefa pendente
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Card Section */}
                <div className="section-v3">
                    <div className="card-v3" style={{background: 'var(--color-background-secondary)'}}>
                        <span className="section-title-v3 mb-4 block" style={{fontSize: 11}}>Saúde do Pipeline</span>
                        <div className="pipeline-health-v3">
                            <div style={{height: 4, background: 'var(--color-border-tertiary)', borderRadius: 2, overflow: 'hidden', marginBottom: 12}}>
                                <div style={{width: '65%', height: '100%', background: 'var(--color-accent)'}} />
                            </div>
                            <p style={{fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5}}>
                                Você tem {leads.filter(l => l.stage === 'new').length} novos leads aguardando primeiro contato.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
