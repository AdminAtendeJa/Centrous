import { useState } from 'react';
import { useCRMStore } from '../../store/index.js';
import { FilePlus, FileText, Receipt, Calendar, FileCheck, LayoutGrid } from 'lucide-react';

export default function UtilityPanel() {
    const [activeTab, setActiveTab] = useState('msgs');
    const { leads } = useCRMStore();
    
    // Get last messages from CRM leads
    const lastMessages = leads
        .filter(l => l.messages && l.messages.length > 0)
        .map(l => ({
            name: l.name,
            preview: l.messages[l.messages.length - 1].text,
            time: 'Agora', 
            color: '#1a1a2e'
        })).slice(0, 4);

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
                    Mensagens
                </button>
                <button 
                    className={`panel-tab-v3 ${activeTab === 'agenda' ? 'active' : ''}`}
                    onClick={() => setActiveTab('agenda')}
                >
                    Agenda
                </button>
                <button 
                    className={`panel-tab-v3 ${activeTab === 'actions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('actions')}
                >
                    Atalhos
                </button>
            </div>

            <div className="panel-body-v3">
                {activeTab === 'msgs' && (
                    <div className="tab-content-v3">
                        {lastMessages.length > 0 ? lastMessages.map((msg, i) => (
                            <div key={i} className="msg-item-v3">
                                <div className="msg-ava-v3" style={{ background: msg.color }}>
                                    {msg.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="msg-meta-v3">
                                    <div className="msg-top-v3">
                                        <span className="msg-name-v3">{msg.name}</span>
                                        <span className="msg-time-v3">{msg.time}</span>
                                    </div>
                                    <div className="msg-preview-v3">{msg.preview}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state-v3 py-8 text-center text-tertiary">
                                Sem mensagens recentes
                            </div>
                        )}
                        <button className="panel-btn-v3">Ver todas</button>
                    </div>
                )}

                {activeTab === 'agenda' && (
                    <div className="tab-content-v3">
                        <div className="empty-state-v3 py-8 text-center text-tertiary">
                            Nenhum compromisso agendado
                        </div>
                        <button className="panel-btn-v3">Sincronizar Google Calendar</button>
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div className="quick-grid-v3">
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
