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
            time: '10:32', // Mock time
            color: '#534AB7'
        })).slice(0, 4);

    const quickActions = [
        { icon: FilePlus, label: 'Novo documento', sub: 'Crie e compartilhe' },
        { icon: FileText, label: 'Nova nota', sub: 'Rápida e privada' },
        { icon: Receipt, label: 'Cobrança', sub: 'Emitir fatura' },
        { icon: Calendar, label: 'Agendar reunião', sub: 'Sync automático' },
        { icon: FileCheck, label: 'Novo contrato', sub: 'Com assinatura' },
        { icon: LayoutGrid, label: 'Novo projeto', sub: 'Kanban ou lista' },
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
                    Ações rápidas
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
                                <div className="msg-unread-v3" />
                            </div>
                        )) : (
                            <div className="empty-state-v3">Sem mensagens recentes</div>
                        )}
                        <button className="panel-btn-v3">Ver todas as mensagens ↗</button>
                    </div>
                )}

                {activeTab === 'agenda' && (
                    <div className="tab-content-v3">
                        <div className="agenda-item-v3">
                            <div className="agenda-time-v3">9:00</div>
                            <div className="agenda-dot-v3" style={{ background: '#534AB7' }} />
                            <div className="agenda-info-v3">
                                <div className="agenda-title-v3">Stand-up do time</div>
                                <div className="agenda-sub-v3">Google Meet · 30 min</div>
                            </div>
                        </div>
                        <div className="agenda-item-v3">
                            <div className="agenda-time-v3">11:00</div>
                            <div className="agenda-dot-v3" style={{ background: '#E24B4A' }} />
                            <div className="agenda-info-v3">
                                <div className="agenda-title-v3">Cliente: Acme Corp</div>
                                <div className="agenda-sub-v3">Zoom · 1h</div>
                            </div>
                        </div>
                        <button className="panel-btn-v3">Ver agenda completa ↗</button>
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div className="quick-grid-v3">
                        {quickActions.map((action, i) => (
                            <button key={i} className="quick-btn-v3">
                                <action.icon size={18} className="quick-icon-v3" />
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
