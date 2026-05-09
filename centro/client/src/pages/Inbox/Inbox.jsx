import { useState } from 'react';
import { Search, Send, Phone, MoreHorizontal, User, Filter } from 'lucide-react';

const CHATS = [
    { id: 1, name: 'Ana Silva', lastMsg: 'Pode me enviar o orçamento?', time: '10:30', unread: 2, channel: 'WA' },
    { id: 2, name: 'Carlos Tech', lastMsg: 'O sistema está rodando bem!', time: 'Ontem', unread: 0, channel: 'TG' },
    { id: 3, name: 'Bia Designer', lastMsg: 'A logo nova ficou pronta.', time: 'Ontem', unread: 0, channel: 'IG' },
];

export default function Inbox() {
    const [selected, setSelected] = useState(CHATS[0]);

    return (
        <div className="inbox-v3 animate-in">
            <div className="dashboard-main-v3 no-padding" style={{ height: 'calc(100vh - 150px)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
                
                {/* Chat List */}
                <div className="inbox-list-v3">
                    <div className="inbox-header-v3">
                        <span className="section-title-v3">Mensagens</span>
                        <button className="btn-icon-v3"><Filter size={14} /></button>
                    </div>
                    <div className="search-box-v3 mx-4 mb-4">
                        <Search size={14} />
                        <input type="text" placeholder="Pesquisar..." />
                    </div>
                    <div className="inbox-items-v3">
                        {CHATS.map(chat => (
                            <div 
                                key={chat.id} 
                                className={`inbox-item-v3 ${selected?.id === chat.id ? 'active' : ''}`}
                                onClick={() => setSelected(chat)}
                            >
                                <div className="lead-ava-v3">{chat.name[0]}</div>
                                <div className="inbox-item-info-v3">
                                    <div className="flex-between">
                                        <span className="inbox-item-name-v3">{chat.name}</span>
                                        <span className="inbox-item-time-v3">{chat.time}</span>
                                    </div>
                                    <span className="inbox-item-msg-v3">{chat.lastMsg}</span>
                                </div>
                                {chat.unread > 0 && <div className="inbox-unread-v3">{chat.unread}</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat View */}
                <div className="inbox-view-v3">
                    <div className="inbox-header-v3">
                        <div className="flex-center gap-3">
                            <div className="lead-ava-v3">{selected?.name[0]}</div>
                            <div>
                                <div className="font-semibold text-sm">{selected?.name}</div>
                                <div className="text-[10px] text-tertiary">Online via WhatsApp</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="btn-icon-v3"><Phone size={14} /></button>
                            <button className="btn-icon-v3"><MoreHorizontal size={14} /></button>
                        </div>
                    </div>
                    
                    <div className="inbox-messages-v3">
                        <div className="msg-bubble-v3 received">Olá! Tudo bem?</div>
                        <div className="msg-bubble-v3 sent">Olá Ana! Tudo ótimo, em que posso ajudar?</div>
                        <div className="msg-bubble-v3 received">{selected?.lastMsg}</div>
                    </div>

                    <div className="inbox-footer-v3">
                        <div className="config-input-v3 flex-1">
                            <input type="text" placeholder="Escreva uma mensagem..." />
                            <button className="btn-v3-primary" style={{ height: 28, width: 28, padding: 0 }}>
                                <Send size={12} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
