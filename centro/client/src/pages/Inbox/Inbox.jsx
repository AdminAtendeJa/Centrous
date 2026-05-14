import { useState, useRef, useEffect } from 'react';
import { Search, Send, Phone, MoreHorizontal, Filter, Paperclip, Smile, Bot } from 'lucide-react';
import { useCRMStore } from '../../store/index.js';

const MOCK_CHATS = [
    { id: 1, name: 'Ana Silva', lastMsg: 'Pode me enviar o orçamento?', time: '10:30', unread: 2, channel: 'WA', color: '#6366f1' },
    { id: 2, name: 'Carlos Tech', lastMsg: 'O sistema está rodando bem!', time: 'Ontem', unread: 0, channel: 'TG', color: '#10b981' },
    { id: 3, name: 'Bia Designer', lastMsg: 'A logo nova ficou pronta.', time: 'Ontem', unread: 0, channel: 'IG', color: '#f59e0b' },
    { id: 4, name: 'Rafael Costa', lastMsg: 'Quando podemos marcar uma call?', time: 'Seg', unread: 1, channel: 'WA', color: '#ef4444' },
];

const INITIAL_MESSAGES = {
    1: [
        { id: 1, text: 'Olá! Tudo bem?', sent: false, time: '10:28' },
        { id: 2, text: 'Olá Ana! Tudo ótimo, em que posso ajudar?', sent: true, time: '10:29' },
        { id: 3, text: 'Pode me enviar o orçamento?', sent: false, time: '10:30' },
    ],
    2: [{ id: 1, text: 'O sistema está rodando bem!', sent: false, time: 'Ontem' }],
    3: [{ id: 1, text: 'A logo nova ficou pronta.', sent: false, time: 'Ontem' }],
    4: [{ id: 1, text: 'Quando podemos marcar uma call?', sent: false, time: 'Seg' }],
};

const CHANNEL_BADGES = {
    WA: { label: 'WhatsApp', color: '#22c55e' },
    TG: { label: 'Telegram', color: '#0088cc' },
    IG: { label: 'Instagram', color: '#e1306c' },
    LI: { label: 'LinkedIn', color: '#0077b5' },
};

export default function Inbox() {
    const [selected, setSelected] = useState(MOCK_CHATS[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [chats, setChats] = useState(MOCK_CHATS);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selected]);

    const filteredChats = chats.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastMsg.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSend = () => {
        if (!inputText.trim() || !selected) return;
        const newMsg = {
            id: Date.now(),
            text: inputText.trim(),
            sent: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => ({
            ...prev,
            [selected.id]: [...(prev[selected.id] || []), newMsg]
        }));
        setChats(prev => prev.map(c =>
            c.id === selected.id ? { ...c, lastMsg: inputText.trim(), time: 'Agora', unread: 0 } : c
        ));
        setInputText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSelect = (chat) => {
        setSelected(chat);
        // Mark as read
        setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
    };

    const currentMessages = messages[selected?.id] || [];
    const channelInfo = selected ? CHANNEL_BADGES[selected.channel] : null;

    return (
        <div className="inbox-v3 animate-in">
            <div className="dashboard-main-v3 no-padding" style={{ height: 'calc(100vh - 150px)', border: '0.5px solid var(--color-border-primary)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
                
                {/* Chat List */}
                <div className="inbox-list-v3">
                    <div className="inbox-header-v3">
                        <span className="section-title-v3">Mensagens</span>
                        <div className="flex gap-1">
                            <button className="btn-icon-v3"><Filter size={14} /></button>
                        </div>
                    </div>
                    <div className="search-box-v3 mx-4 mb-4" style={{ height: 32 }}>
                        <Search size={12} />
                        <input 
                            type="text" 
                            placeholder="Pesquisar..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="inbox-items-v3">
                        {filteredChats.map(chat => (
                            <div 
                                key={chat.id} 
                                className={`inbox-item-v3 ${selected?.id === chat.id ? 'active' : ''}`}
                                onClick={() => handleSelect(chat)}
                            >
                                <div className="lead-ava-v3" style={{ background: chat.color }}>
                                    {chat.name[0]}
                                </div>
                                <div className="inbox-item-info-v3">
                                    <div className="flex-between">
                                        <span className="inbox-item-name-v3">{chat.name}</span>
                                        <span className="inbox-item-time-v3">{chat.time}</span>
                                    </div>
                                    <div className="flex-between">
                                        <span className="inbox-item-msg-v3">{chat.lastMsg}</span>
                                        <span style={{ fontSize: 9, color: (CHANNEL_BADGES[chat.channel] || {}).color, fontWeight: 700 }}>
                                            {chat.channel}
                                        </span>
                                    </div>
                                </div>
                                {chat.unread > 0 && <div className="inbox-unread-v3">{chat.unread}</div>}
                            </div>
                        ))}
                        {filteredChats.length === 0 && (
                            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 12 }}>
                                Nenhuma conversa encontrada.
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat View */}
                <div className="inbox-view-v3">
                    <div className="inbox-header-v3">
                        <div className="flex-center gap-3">
                            <div className="lead-ava-v3" style={{ background: selected?.color }}>
                                {selected?.name[0]}
                            </div>
                            <div>
                                <div className="font-semibold text-sm">{selected?.name}</div>
                                <div className="text-[10px]" style={{ color: channelInfo?.color, fontWeight: 700 }}>
                                    {channelInfo?.label || 'Canal desconhecido'}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="btn-icon-v3"><Phone size={14} /></button>
                            <button className="btn-icon-v3"><MoreHorizontal size={14} /></button>
                        </div>
                    </div>
                    
                    <div className="inbox-messages-v3">
                        {currentMessages.map((msg) => (
                            <div key={msg.id} className={`msg-bubble-v3 ${msg.sent ? 'sent' : 'received'}`}>
                                {msg.text}
                                <span style={{ display: 'block', fontSize: 9, opacity: 0.6, marginTop: 2, textAlign: msg.sent ? 'right' : 'left' }}>
                                    {msg.time}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="inbox-footer-v3">
                        <button className="btn-icon-v3" style={{ flexShrink: 0 }}>
                            <Paperclip size={14} />
                        </button>
                        <div className="config-input-v3 flex-1">
                            <input 
                                type="text" 
                                placeholder="Escreva uma mensagem..." 
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <button 
                            className="btn-v3-primary" 
                            style={{ height: 32, width: 32, padding: 0, flexShrink: 0 }}
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                        >
                            <Send size={13} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
