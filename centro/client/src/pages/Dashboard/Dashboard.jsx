import { Activity, CheckCircle, Clock, Calendar, Users, ArrowRight, Plus, MoreHorizontal } from 'lucide-react';
import { useCRMStore, useTasksStore } from '../../store/index.js';

export default function Dashboard() {
    const { leads } = useCRMStore();
    const { tasks, toggleTask } = useTasksStore();

    const stats = [
        { label: 'Tarefas concluídas', value: '12', delta: '↑ 3 a mais que semana passada', trend: 'up' },
        { label: 'Reuniões', value: '4', delta: '↓ 1 a menos', trend: 'down' },
        { label: 'Projetos ativos', value: '3', delta: 'sem alteração', trend: 'neutral' },
    ];

    const todayTasks = tasks.slice(0, 5);

    return (
        <div className="dashboard-v3 animate-in">
            {/* Stats Header */}
            <div className="flex-between mb-6">
                <div className="flex flex-col">
                    <h1 className="text-18 font-extrabold text-primary tracking-tight">Bom dia, Victor</h1>
                    <p className="text-11 text-tertiary font-medium">Aqui está o que está acontecendo com seus projetos esta semana.</p>
                </div>
                <button className="btn-v3-primary shadow-indigo">
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
                            <CheckCircle size={16} className="text-accent" />
                            <h2 className="text-13 font-bold text-primary">Tarefas de hoje</h2>
                        </div>
                        <button className="text-11 font-bold text-accent hover:underline flex items-center gap-1">
                            Ver todas <ArrowRight size={12} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        {todayTasks.map((task) => (
                            <div 
                                key={task.id} 
                                className={`flex items-center gap-3 p-3 border-v3 rounded-xl transition-all cursor-pointer ${
                                    task.completed ? 'bg-background-secondary opacity-60' : 'bg-white hover:border-accent/40'
                                }`}
                                onClick={() => toggleTask(task.id)}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex-center transition-all ${
                                    task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'
                                }`}>
                                    {task.completed && <CheckCircle size={12} className="text-white" />}
                                </div>
                                <span className={`text-12 font-medium flex-1 ${task.completed ? 'line-through text-tertiary' : 'text-primary'}`}>
                                    {task.title}
                                </span>
                                <span className={`tag-v3 ${
                                    task.priority === 'high' ? 'tag-red' : 
                                    task.priority === 'medium' ? 'tag-amber' : 'tag-zinc'
                                }`}>
                                    {task.priority || 'Normal'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance / Projects */}
                <div className="section-v3">
                    <div className="flex-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className="text-emerald-500" />
                            <h2 className="text-13 font-bold text-primary">Projetos Ativos</h2>
                        </div>
                        <button className="btn-icon-v3"><Plus size={14} /></button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="card-v3 p-4 border-v3 hover:bg-background-secondary transition-all">
                            <div className="flex-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex-center text-white font-bold">A</div>
                                    <div>
                                        <div className="text-12 font-bold text-primary">Atende Já - V3</div>
                                        <div className="text-10 text-tertiary font-medium">Desenvolvimento de UI/UX</div>
                                    </div>
                                </div>
                                <button className="btn-icon-v3"><MoreHorizontal size={14} /></button>
                            </div>
                            <div className="w-full h-1.5 bg-background-tertiary rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-accent" style={{ width: '85%' }} />
                            </div>
                            <div className="flex-between text-10 font-bold text-tertiary">
                                <span>85% concluído</span>
                                <span>24 tarefas pendentes</span>
                            </div>
                        </div>

                        <div className="card-v3 p-4 border-v3 hover:bg-background-secondary transition-all">
                            <div className="flex-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex-center text-white font-bold">M</div>
                                    <div>
                                        <div className="text-12 font-bold text-primary">Marketing Hub</div>
                                        <div className="text-10 text-tertiary font-medium">Campanha Meta Ads Q2</div>
                                    </div>
                                </div>
                                <button className="btn-icon-v3"><MoreHorizontal size={14} /></button>
                            </div>
                            <div className="w-full h-1.5 bg-background-tertiary rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-emerald-500" style={{ width: '40%' }} />
                            </div>
                            <div className="flex-between text-10 font-bold text-tertiary">
                                <span>40% concluído</span>
                                <span>12 tarefas pendentes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
