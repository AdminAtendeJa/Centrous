import { useState } from 'react';
import { TrendingUp, CheckCircle2, Clock, Calendar, Users, ArrowRight, Plus, MoreHorizontal, DollarSign, Zap, X, Save } from 'lucide-react';
import { useCRMStore, useTasksStore, useSettingsStore, useAIStore } from '../../store/index.js';
import { useNavigate } from 'react-router-dom';
import ModalV3 from '../../components/ui/ModalV3.jsx';

export default function Dashboard() {
    const navigate = useNavigate();
    const { leads } = useCRMStore();
    const { tasks, toggleTask } = useTasksStore();
    const { settings } = useSettingsStore();
    const { latestScanResult } = useAIStore();

    // New Project modal state
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '', color: '#6366f1' });

    // Derived real stats
    const completedTasks = tasks.filter(t => t.done).length;
    const pendingTasks = tasks.filter(t => !t.done).length;
    const activeLeads = leads.filter(l => l.stage !== 'closed_won' && l.stage !== 'closed_lost').length;
    const pipelineValue = leads
        .filter(l => l.stage !== 'closed_lost')
        .reduce((sum, l) => sum + (Number(l.value) || 0), 0);

    const stats = [
        {
            label: 'Tarefas concluídas',
            value: String(completedTasks),
            delta: `${pendingTasks} pendentes hoje`,
            trend: completedTasks > 0 ? 'up' : 'neutral'
        },
        {
            label: 'Leads ativos',
            value: String(activeLeads),
            delta: `Pipeline R$${pipelineValue.toLocaleString('pt-BR')}`,
            trend: activeLeads > 0 ? 'up' : 'neutral'
        },
        {
            label: 'Tarefas pendentes',
            value: String(pendingTasks),
            delta: pendingTasks > 5 ? '⚠ Muitas pendências' : 'Dentro do normal',
            trend: pendingTasks > 5 ? 'down' : 'neutral'
        },
    ];

    const todayTasks = tasks.slice(0, 5);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const userName = settings.ownerName || 'Empreendedor';

    return (
        <div className="dashboard-v3 animate-in">
            {/* Stats Header */}
            <div className="flex-between mb-6">
                <div className="flex flex-col">
                    <h1 className="text-18 font-extrabold text-primary tracking-tight">
                        {greeting()}, {userName} 👋
                    </h1>
                    <p className="text-11 text-tertiary font-medium">
                        {completedTasks > 0
                            ? `Você já completou ${completedTasks} tarefa${completedTasks > 1 ? 's' : ''} hoje. Continue assim!`
                            : 'Aqui está o que está acontecendo com seus projetos esta semana.'}
                    </p>
                </div>
                <button className="btn-v3-primary shadow-indigo" onClick={() => setIsProjectModalOpen(true)}>
                    <Plus size={14} /> Novo Projeto
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="card-v3 p-4 hover:bg-background-secondary cursor-pointer transition-all border-v3">
                        <div className="text-11 font-bold text-tertiary uppercase tracking-wider mb-2">{stat.label}</div>
                        <div className="text-28 font-extrabold text-primary leading-tight">{stat.value}</div>
                        <div className={`text-10 font-bold mt-2 ${
                            stat.trend === 'up' ? 'text-success' : 
                            stat.trend === 'down' ? 'text-danger' : 'text-tertiary'
                        }`}>
                            {stat.delta}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks Section */}
                <div className="section-v3">
                    <div className="flex-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-accent" />
                            <h2 className="text-13 font-bold text-primary">Tarefas de hoje</h2>
                        </div>
                        <button 
                            className="text-11 font-bold text-accent hover:underline flex items-center gap-1"
                            onClick={() => navigate('/productivity')}
                        >
                            Ver todas <ArrowRight size={12} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        {todayTasks.length === 0 && (
                            <div className="p-6 text-center text-tertiary text-11">
                                Nenhuma tarefa ainda. Crie uma no módulo Foco!
                            </div>
                        )}
                        {todayTasks.map((task) => (
                            <div 
                                key={task.id} 
                                className={`flex items-center gap-3 p-3 border-v3 rounded-xl transition-all cursor-pointer ${
                                    task.done ? 'bg-background-secondary opacity-60' : 'bg-white hover:border-accent/40'
                                }`}
                                onClick={() => toggleTask(task.id)}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex-center transition-all ${
                                    task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'
                                }`}>
                                    {task.done && <CheckCircle2 size={12} className="text-white" />}
                                </div>
                                <span className={`text-12 font-medium flex-1 ${task.done ? 'line-through text-tertiary' : 'text-primary'}`}>
                                    {task.title}
                                </span>
                                <span className={`tag-v3 ${
                                    task.priority === 'high' ? 'tag-red' : 
                                    task.priority === 'medium' ? 'tag-amber' : 'tag-zinc'
                                }`}>
                                    {task.priority === 'high' ? 'Urgente' : task.priority === 'medium' ? 'Médio' : 'Normal'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4">
                    {/* CRM Quick Overview */}
                    <div className="section-v3">
                        <div className="flex-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-emerald-500" />
                                <h2 className="text-13 font-bold text-primary">Leads Recentes</h2>
                            </div>
                            <button 
                                className="text-11 font-bold text-accent hover:underline flex items-center gap-1"
                                onClick={() => navigate('/crm')}
                            >
                                Ver CRM <ArrowRight size={12} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {leads.slice(0, 3).length === 0 && (
                                <div className="p-4 text-center text-tertiary text-11">
                                    Nenhum lead ainda. Crie um no CRM!
                                </div>
                            )}
                            {leads.slice(0, 3).map((lead) => (
                                <div 
                                    key={lead.id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-secondary cursor-pointer transition-all"
                                    onClick={() => navigate('/crm')}
                                >
                                    <div className="w-8 h-8 rounded-full bg-accent flex-center text-white text-10 font-bold shrink-0">
                                        {lead.name?.[0] || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-11 font-bold text-primary truncate">{lead.name}</div>
                                        <div className="text-10 text-tertiary">{lead.company || 'Sem empresa'}</div>
                                    </div>
                                    <span className="text-11 font-bold text-success">
                                        R${(lead.value || 0).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Copilot last result or tip */}
                    <div className="card-v3 p-4 border-v3" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.04))' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Zap size={14} className="text-accent" />
                            <span className="text-10 font-bold uppercase tracking-wider text-secondary">Copilot IA</span>
                        </div>
                        {latestScanResult ? (
                            <p className="text-11 text-secondary leading-relaxed">
                                {latestScanResult.resumen}
                            </p>
                        ) : (
                            <p className="text-11 text-tertiary leading-relaxed">
                                Clique no botão ✨ no canto inferior direito para escanear seu negócio e obter insights personalizados.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* New Project Modal */}
            <ModalV3
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                title="Criar Novo Projeto"
                footer={(
                    <>
                        <button className="btn-v3-ghost" onClick={() => setIsProjectModalOpen(false)}>Cancelar</button>
                        <button 
                            className="btn-v3-primary"
                            onClick={() => {
                                // For now, navigate to productivity as projects live there
                                setIsProjectModalOpen(false);
                                navigate('/productivity');
                            }}
                        >
                            <Save size={14} /> Criar Projeto
                        </button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <div>
                        <label className="label-v3">Nome do Projeto</label>
                        <input
                            className="input-v3"
                            placeholder="Ex: Lançamento Produto X"
                            value={newProject.name}
                            onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="label-v3">Descrição</label>
                        <input
                            className="input-v3"
                            placeholder="Objetivo ou contexto do projeto"
                            value={newProject.description}
                            onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label-v3">Cor do Projeto</label>
                        <div className="flex gap-2 mt-2">
                            {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setNewProject({ ...newProject, color })}
                                    style={{
                                        width: 28, height: 28, borderRadius: 8, background: color,
                                        border: newProject.color === color ? '3px solid #0f172a' : '3px solid transparent',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </ModalV3>
        </div>
    );
}
