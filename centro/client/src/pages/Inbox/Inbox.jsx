import { useState } from 'react';
import { Mail, MessageSquare, MessageCircle, Send, MoreVertical, Search, Star, Clock } from 'lucide-react';
import './Inbox.css';

const MOCK_MESSAGES = [
    { id: 1, type: 'gmail', sender: 'Juan Pérez', subject: 'Reunión de coordinación', preview: 'Hola, ¿podemos revisar la propuesta m...', time: '10:32 AM', unread: true },
    { id: 2, type: 'whatsapp', sender: 'María Torres', subject: '+34 600000000', preview: '¡Perfecto! Nos vemos mañana.', time: 'Ayer', unread: false },
    { id: 3, type: 'instagram', sender: '@creative_studio', subject: 'Nuevo seguidor', preview: 'Respondío a tu historia: 🔥', time: 'Ayer', unread: false },
    { id: 4, type: 'gmail', sender: 'Soporte Meta', subject: 'Tu cuenta de anuncios...', preview: 'Tu cuenta está lista para publicar an...', time: 'Lun', unread: false },
    { id: 5, type: 'whatsapp', sender: 'Carlos Dev', subject: 'Proyecto Hub', preview: 'Te mandé los diseños finales al drive', time: 'Dom', unread: false }
];

export default function Inbox() {
    const [selectedId, setSelectedId] = useState(1);
    const [search, setSearch] = useState('');

    const getTypeIcon = (type) => {
        if (type === 'gmail') return <Mail size={14} color="#ea4335" />;
        if (type === 'whatsapp') return <MessageSquare size={14} color="#25D366" />;
        if (type === 'instagram') return <MessageCircle size={14} color="#E1306C" />;
        return <Mail size={14} />;
    };

    const activeMessage = MOCK_MESSAGES.find(m => m.id === selectedId);

    return (
        <div className="inbox-layout animate-in">
            {/* Header */}
            <div className="inbox-header">
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700 }}>Bandeja Unificada</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Todos tus mensajes en un solo lugar</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary">Nuevo Mensaje</button>
                </div>
            </div>

            {/* Split Pane */}
            <div className="inbox-container">
                {/* Left: List */}
                <div className="inbox-sidebar">
                    <div className="inbox-search">
                        <Search size={14} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Buscar correos, chats..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="inbox-list">
                        {MOCK_MESSAGES.map(msg => (
                            <div
                                key={msg.id}
                                className={`inbox-item ${selectedId === msg.id ? 'active' : ''} ${msg.unread ? 'unread' : ''}`}
                                onClick={() => setSelectedId(msg.id)}
                            >
                                <div className="inbox-item-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {getTypeIcon(msg.type)}
                                        <span className="sender">{msg.sender}</span>
                                    </div>
                                    <span className="time">{msg.time}</span>
                                </div>
                                <div className="subject">{msg.subject}</div>
                                <div className="preview">{msg.preview}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Content */}
                <div className="inbox-content">
                    {activeMessage ? (
                        <>
                            <div className="inbox-content-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div className="avatar">
                                        {activeMessage.sender[0]}
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: 15, fontWeight: 600 }}>{activeMessage.sender}</h2>
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{activeMessage.subject}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn-icon"><Star size={16} /></button>
                                    <button className="btn-icon"><Clock size={16} /></button>
                                    <button className="btn-icon"><MoreVertical size={16} /></button>
                                </div>
                            </div>

                            <div className="inbox-messages-scroll">
                                {/* Thread view mock */}
                                <div className="message-bubble received">
                                    <div className="bubble-text">
                                        Hola! Revisé la propuesta que enviaste ayer. Me parece excelente, pero tengo una duda sobre la integración con Stripe. ¿Podemos hacer una call rápida mañana?
                                    </div>
                                    <div className="bubble-time">10:32 AM</div>
                                </div>
                            </div>

                            <div className="inbox-reply-area">
                                <div className="ai-suggestion">
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>🤖 RESPUESTA SUGERIDA</span>
                                    <p style={{ fontSize: 13, marginTop: 4 }}>"¡Hola Juan! Claro, mañana tengo disponibilidad a las 10am o a las 3pm. ¿Cuál prefieres?"</p>
                                </div>
                                <div className="reply-box">
                                    <textarea placeholder="Escribe un mensaje..." rows={3}></textarea>
                                    <div className="reply-actions">
                                        <button className="btn btn-ghost btn-sm">Insertar Plantilla</button>
                                        <button className="btn btn-primary btn-sm"><Send size={14} /> Enviar</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <Mail size={40} />
                            <h3>Selecciona un mensaje</h3>
                            <p>Lee y responde a tus clientes desde aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
