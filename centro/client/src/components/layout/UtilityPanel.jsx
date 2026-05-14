import { useState } from 'react';
import { 
    MessageSquare, Calendar, Zap, MoreHorizontal, 
    Clock, CheckCircle2, Plus, ArrowUpRight,
    FilePlus, StickyNote, Receipt, CalendarPlus, FileSignature, Kanban, X
} from 'lucide-react';
import { useCRMStore, useTasksStore, useUIStore, useNotesStore } from '../../store/index.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function UtilityPanel() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('msgs');
    const { leads } = useCRMStore();
    const { tasks, addTask } = useTasksStore();
    const { addNote } = useNotesStore();
    const { isUtilityOpen, toggleUtility } = useUIStore();

    const agendaItems = [
        { time: '09:00', title: 'Stand-up do time', sub: 'Google Meet · 30 min', color: '#6366f1' },
        { time: '11:00', title: 'Cliente: Acme Corp', sub: 'Zoom · 1h · 3 participantes', color: '#ef4444' },
        { time: '13:00', title: 'Almoço de trabalho', sub: 'Presencial · com sócios', color: '#10b981' },
        { time: '15:30', title: 'Revisão de métricas', sub: 'Teams · 45 min', color: '#f59e0b' },
    ];

    const quickActions = [
        { 
            icon: StickyNote, title: 'Nova nota', sub: 'Rápida e privada',
            action: () => {
                addNote({ title: 'Nova nota', content: '' });
                navigate('/productivity');
                toast.success('Nota criada!');
            }
        },
        { 
            icon: CheckCircle2, title: 'Nova tarefa', sub: 'Adicionar ao Foco',
            action: () => {
                addTask({ title: 'Nova tarefa', done: false, priority: 'medium', created_at: new Date().toISOString() });
                navigate('/productivity');
                toast.success('Tarefa criada!');
            }
        },
        { 
            icon: Receipt, title: 'Nova transação', sub: 'Registrar entrada/saída',
            action: () => navigate('/finance')
        },
        { 
            icon: CalendarPlus, title: 'Ver agenda', sub: 'Sincronização automática',
            action: () => toast('Integração com Google Calendar em breve! 📅', { icon: '⚡' })
        },
        { 
            icon: FilePlus, title: 'Nova proposta', sub: 'Criar e compartilhar',
            action: () => navigate('/proposals')
        },
        { 
            icon: Kanban, title: 'Ir ao CRM', sub: 'Pipeline de clientes',
            action: () => navigate('/crm')
        },
    ];

    const urgentTasks = tasks.filter(t => !t.done && t.priority === 'high').length;
    const pendingTasks = tasks.filter(t => !t.done).length;

    return (
        <aside className={`utility-panel-v3 ${isUtilityOpen ? 'open' : ''}`}>
            <div className="panel-tabs-v3">
                <div 
                    className={`panel-tab-v3 ${activeTab === 'msgs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('msgs')}
                >
                    Mensagens
                </div>
                <div 
                    className={`panel-tab-v3 ${activeTab === 'agenda' ? 'active' : ''}`}
                    onClick={() => setActiveTab('agenda')}
                >
                    Agenda
                </div>
                <div 
                    className={`panel-tab-v3 ${activeTab === 'actions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('actions')}
                >
                    Ações
                </div>
                
                <button 
                    className="ml-auto btn-icon-v3 lg:hidden" 
                    onClick={toggleUtility}
                    style={{ border: 'none', background: 'transparent' }}
                >
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'msgs' && (
                    <div className="flex flex-col gap-1">
                        {leads.slice(0, 5).map((lead) => (
                            <div 
                                key={lead.id} 
                                className="p-3 rounded-lg hover:bg-background-secondary cursor-pointer transition-all border border-transparent hover:border-v3 group"
                                onClick={() => navigate('/inbox')}
                            >
                                <div className="flex-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-accent text-white flex-center text-9 font-bold">
                                            {lead.name?.[0] || '?'}
                                        </div>
                                        <span className="text-11 font-bold text-primary">{lead.name}</span>
                                    </div>
                                    <span className="text-9 text-tertiary font-medium">recente</span>
                                </div>
                                <p className="text-10 text-secondary truncate pl-9">
                                    {lead.lastMessage || `Lead via ${lead.channel || 'direto'} — clique para ver`}
                                </p>
                            </div>
                        ))}
                        {leads.length === 0 && (
                            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 12 }}>
                                Sem leads ainda. Crie um no CRM!
                            </div>
                        )}
                        <button 
                            className="btn-v3-ghost w-full mt-2 text-10 border-v3" 
                            style={{ height: '28px' }}
                            onClick={() => navigate('/inbox')}
                        >
                            Ver todas as mensagens <ArrowUpRight size={10} className="ml-1" />
                        </button>
                    </div>
                )}

                {activeTab === 'agenda' && (
                    <div className="flex flex-col">
                        {agendaItems.map((item, idx) => (
                            <div key={idx} className="flex gap-3 py-3 border-bottom-v3 last:border-none cursor-pointer group">
                                <div className="text-10 font-bold text-tertiary w-10 pt-1">{item.time}</div>
                                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: item.color }} />
                                <div className="flex-1">
                                    <div className="text-11 font-bold text-primary group-hover:text-accent transition-colors">{item.title}</div>
                                    <div className="text-10 text-tertiary mt-0.5">{item.sub}</div>
                                </div>
                            </div>
                        ))}
                        <button 
                            className="btn-v3-ghost w-full mt-4 text-10 border-v3" 
                            style={{ height: '28px' }}
                            onClick={() => toast('Google Calendar em breve! 📅', { icon: '⚡' })}
                        >
                            Ver agenda completa <ArrowUpRight size={10} className="ml-1" />
                        </button>
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div className="grid grid-cols-2 gap-2">
                        {quickActions.map((action, idx) => (
                            <div 
                                key={idx} 
                                className="p-3 border-v3 rounded-lg bg-white hover:bg-background-secondary hover:border-accent/30 cursor-pointer transition-all flex flex-col gap-2 group"
                                onClick={action.action}
                            >
                                <action.icon size={16} className="text-secondary group-hover:text-accent" />
                                <div>
                                    <div className="text-11 font-bold text-primary">{action.title}</div>
                                    <div className="text-9 text-tertiary mt-0.5">{action.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Context Widget - AI Copilot Tip */}
            <div className="p-4 border-top-v3 bg-background-secondary/30">
                <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-10 font-bold text-secondary uppercase tracking-wider">Dica do Copilot</span>
                </div>
                <p className="text-10 text-tertiary leading-relaxed">
                    {urgentTasks > 0
                        ? <><strong className="text-primary">{urgentTasks} tarefa{urgentTasks > 1 ? 's' : ''} urgente{urgentTasks > 1 ? 's' : ''}</strong> pendente{urgentTasks > 1 ? 's' : ''} hoje. Priorize o que gera mais resultado.</>
                        : pendingTasks > 0
                        ? <>Você tem <strong className="text-primary">{pendingTasks} tarefa{pendingTasks > 1 ? 's' : ''}</strong> pendente{pendingTasks > 1 ? 's' : ''}. Foque e complete uma de cada vez!</>
                        : <>Tudo em dia! 🎉 Use o Copilot IA para gerar novas estratégias de crescimento.</>
                    }
                </p>
            </div>
        </aside>
    );
}
