import { useState } from 'react';
import { useCRMStore } from '../../store/index.js';
import { FilePlus, FileText, Receipt, Calendar, Sparkles, MessageSquare } from 'lucide-react';
import InboxPanel from '../../modules/inbox/InboxPanel';

export default function UtilityPanel() {
    const [activeTab, setActiveTab] = useState('msgs');
    
    const quickActions = [
        { icon: FilePlus, label: 'Proposta', sub: 'Criar nova' },
        { icon: FileText, label: 'Nota', sub: 'Rápida' },
        { icon: Receipt, label: 'Fatura', sub: 'Emitir' },
        { icon: Calendar, label: 'Reunião', sub: 'Agendar' },
    ];

    return (
        <aside className="utility-panel-v3">
            <div className="panel-tabs-v3">
                <button 
                    className={`panel-tab-v3 ${activeTab === 'msgs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('msgs')}
                >
                    <MessageSquare size={14} />
                    <span>Inbox</span>
                </button>
                <button 
                    className={`panel-tab-v3 ${activeTab === 'agenda' ? 'active' : ''}`}
                    onClick={() => setActiveTab('agenda')}
                >
                    <span>Agenda</span>
                </button>
                <button 
                    className={`panel-tab-v3 ${activeTab === 'actions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('actions')}
                >
                    <span>Atalhos</span>
                </button>
            </div>

            <div className="panel-body-v3 no-padding">
                {activeTab === 'msgs' && (
                    <InboxPanel />
                )}

                {activeTab === 'agenda' && (
                    <div className="tab-content-v3 p-4">
                        <div className="empty-state-v3 py-8 text-center text-tertiary">
                            Nenhum compromisso agendado
                        </div>
                        <button className="btn-v3-secondary w-full">Sincronizar Google Calendar</button>
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div className="quick-grid-v3 p-4">
                        {quickActions.map((action, i) => (
                            <button key={i} className="quick-btn-v3">
                                <action.icon size={16} className="quick-icon-v3" />
                                <span className="quick-label-v3">{action.label}</span>
                                <p className="quick-sub-v3">{action.sub}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
