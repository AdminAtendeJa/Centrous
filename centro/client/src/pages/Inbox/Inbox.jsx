import { useState, useEffect } from 'react';
import { Mail, MessageSquare, MessageCircle, Send, MoreVertical, Search, Star, Clock, Loader2 } from 'lucide-react';
import { useSettingsStore } from '../../store/index.js';
import './Inbox.css';

export default function Inbox() {
    const [messages, setMessages] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [search, setSearch] = useState('');

    // AI States
    const { settings } = useSettingsStore();
    const [suggestion, setSuggestion] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/webhooks/messages');
                const data = await res.json();
                if (data.success && data.messages) {
                    setMessages(data.messages);
                    if (data.messages.length > 0) setSelectedId(data.messages[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };
        fetchMessages();
    }, []);

    const getTypeIcon = (type) => {
        if (type === 'gmail') return <Mail size={14} color="#ea4335" />;
        if (type === 'whatsapp') return <MessageSquare size={14} color="#25D366" />;
        if (type === 'instagram') return <MessageCircle size={14} color="#E1306C" />;
        return <Mail size={14} />;
    };

    const activeMessage = messages.find(m => m.id === selectedId);

    // AI Trigger
    useEffect(() => {
        if (!activeMessage || !settings.aiApiKey || activeMessage.direction === 'sent') {
            setSuggestion('');
            return;
        }

        const fetchSuggestion = async () => {
            setIsGenerating(true);
            setSuggestion('');
            try {
                const systemPrompt = `Eres un asistente de servicio al cliente de WorkHub AI. Responde al siguiente mensaje estructurado amablemente. El usuario que envía el mensaje es: ${activeMessage.sender_name}. Responde estrictamente con un JSON que contenga UNA propiedad llamada "suggestion" con tu respuesta sugerida (máximo 2-3 líneas).`;
                const res = await fetch('http://localhost:3001/api/ai/groq', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-ai-key': settings.aiApiKey,
                        'x-ai-url': settings.aiBaseUrl || 'https://api.groq.com/openai/v1',
                        'x-ai-model': settings.aiModel || 'llama3-70b-8192'
                    },
                    body: JSON.stringify({
                        systemPrompt,
                        businessContext: { incomingMessage: activeMessage.text, channel: activeMessage.type }
                    })
                });
                const data = await res.json();
                if (data.success && data.data && data.data.suggestion) {
                    setSuggestion(data.data.suggestion);
                } else {
                    setSuggestion('No se pudo generar sugerencia.');
                }
            } catch (err) {
                console.error(err);
                setSuggestion('Error de red al conectar con IA.');
            } finally {
                setIsGenerating(false);
            }
        };

        // Delay slighty to avoid flashing and spamming when quickly switching
        const t = setTimeout(() => {
            fetchSuggestion();
        }, 300);

        return () => clearTimeout(t);
    }, [selectedId, messages, settings.aiApiKey, settings.aiBaseUrl, settings.aiModel]);

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
                        {messages.filter(msg => msg.sender_name?.toLowerCase().includes(search.toLowerCase()) || msg.text?.toLowerCase().includes(search.toLowerCase())).map(msg => (
                            <div
                                key={msg.id}
                                className={`inbox-item ${selectedId === msg.id ? 'active' : ''}`}
                                onClick={() => setSelectedId(msg.id)}
                            >
                                <div className="inbox-item-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {getTypeIcon(msg.type)}
                                        <span className="sender">{msg.sender_name}</span>
                                    </div>
                                    <span className="time">{msg.time || new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="subject">Mensaje por {msg.type}</div>
                                <div className="preview">{msg.text}</div>
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
                                        {activeMessage.sender_name ? activeMessage.sender_name[0].toUpperCase() : '?'}
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: 15, fontWeight: 600 }}>{activeMessage.sender_name}</h2>
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Vía {activeMessage.type}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn-icon"><Star size={16} /></button>
                                    <button className="btn-icon"><Clock size={16} /></button>
                                    <button className="btn-icon"><MoreVertical size={16} /></button>
                                </div>
                            </div>

                            <div className="inbox-messages-scroll">
                                {/* Thread view */}
                                <div className={`message-bubble ${activeMessage.direction === 'received' ? 'received' : 'sent'}`}>
                                    <div className="bubble-text">
                                        {activeMessage.text}
                                    </div>
                                    <div className="bubble-time">{activeMessage.time || new Date(activeMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>

                            <div className="inbox-reply-area">
                                {(isGenerating || suggestion) && (
                                    <div className="ai-suggestion" onClick={() => setReplyText(suggestion)} style={{ cursor: suggestion ? 'pointer' : 'default' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>🤖 RESPUESTA SUGERIDA MÁGICA</span>
                                            {isGenerating && <Loader2 size={12} className="ai-spin" style={{ color: 'var(--color-accent)' }} />}
                                        </div>
                                        {isGenerating ? (
                                            <p style={{ fontSize: 13, marginTop: 4, color: 'var(--text-muted)' }}>Analizando contexto y generando respuesta...</p>
                                        ) : (
                                            <p style={{ fontSize: 13, marginTop: 4 }}>"{suggestion}" (Haz clic para usar)</p>
                                        )}
                                    </div>
                                )}
                                <div className="reply-box">
                                    <textarea
                                        placeholder="Escribe un mensaje..."
                                        rows={3}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    ></textarea>
                                    <div className="reply-actions">
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => {
                                                if (suggestion) setReplyText(suggestion);
                                            }}
                                            disabled={!suggestion || isGenerating}
                                        >
                                            Insertar Plantilla IA
                                        </button>
                                        <button className="btn btn-primary btn-sm"><Send size={14} /> Enviar (Demo)</button>
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
            {/* Adding spin animation locally for convenience */}
            <style jsx="true">{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .ai-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
