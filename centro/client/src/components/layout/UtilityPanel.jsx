import { useState } from 'react';
import { 
    MessageSquare, Calendar, Zap, MoreHorizontal, 
    Clock, CheckCircle2, Plus, ArrowUpRight,
    FilePlus, StickyNote, Receipt, CalendarPlus, FileSignature, Kanban, X
} from 'lucide-react';
import { useCRMStore, useTasksStore, useUIStore } from '../../store/index.js';

export default function UtilityPanel() {
    const [activeTab, setActiveTab] = useState('msgs');
    const { leads } = useCRMStore();
    const { tasks } = useTasksStore();
    const { isUtilityOpen, toggleUtility } = useUIStore();

    // Mock data for Agenda
    const agendaItems = [
        { time: '09:00', title: 'Stand-up do time', sub: 'Google Meet · 30 min', color: '#6366f1' },
        { time: '11:00', title: 'Cliente: Acme Corp', sub: 'Zoom · 1h · 3 participantes', color: '#ef4444' },
        { time: '13:00', title: 'Almoço de trabalho', sub: 'Presencial · com sócios', color: '#10b981' },
        { time: '15:30', title: 'Revisão de métricas', sub: 'Teams · 45 min', color: '#f59e0b' },
    ];

    const quickActions = [
        { icon: FilePlus, title: 'Novo documento', sub: 'Crie e compartilhe' },
        { icon: StickyNote, title: 'Nova nota', sub: 'Rápida e privada' },
        { icon: Receipt, title: 'Cobrança', sub: 'Emitir fatura' },
        { icon: CalendarPlus, title: 'Agendar reunião', sub: 'Sync automático' },
        { icon: FileSignature, title: 'Novo contrato', sub: 'Com assinatura' },
        { icon: Kanban, title: 'Novo projeto', sub: 'Kanban ou lista' },
    ];

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
                            <div key={lead.id} className="p-3 rounded-lg hover:bg-background-secondary cursor-pointer transition-all border border-transparent hover:border-v3 group">
                                <div className="flex-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-accent text-white flex-center text-9 font-bold">
                                            {lead.name[0]}
                                        </div>
                                        <span className="text-11 font-bold text-primary">{lead.name}</span>
                                    </div>
                                    <span className="text-9 text-tertiary font-medium">10:32</span>
                                </div>
                                <p className="text-10 text-secondary truncate pl-9">
                                    {lead.lastMessage || 'Consegui fechar com o cliente! Vamos alinhar...'}
                                </p>
                            </div>
                        ))}
                        <button className="btn-v3-ghost w-full mt-2 text-10 border-v3" style={{ height: '28px' }}>
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
                        <button className="btn-v3-ghost w-full mt-4 text-10 border-v3" style={{ height: '28px' }}>
                            Ver agenda completa <ArrowUpRight size={10} className="ml-1" />
                        </button>
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div className="grid grid-cols-2 gap-2">
                        {quickActions.map((action, idx) => (
                            <div key={idx} className="p-3 border-v3 rounded-lg bg-white hover:bg-background-secondary hover:border-accent/30 cursor-pointer transition-all flex flex-col gap-2 group">
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
                    Você tem **3 tarefas urgentes** pendentes hoje. Comece pela revisão do contrato Acme para otimizar seu pipeline.
                </p>
            </div>
        </aside>
    );
}
