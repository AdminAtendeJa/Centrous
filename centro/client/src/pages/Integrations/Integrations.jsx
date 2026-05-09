import React, { useState, useEffect } from 'react';
import { 
    Key, Webhook, Plus, Trash2, Copy, 
    CheckCircle2, Terminal, Code, ExternalLink, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../../store/index.js';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Integrations() {
    const { session } = useAuthStore();
    const [keys, setKeys] = useState([]);
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [newKeyName, setNewKeyName] = useState('');
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [newWebhookEvent, setNewWebhookEvent] = useState('lead.created');
    const [secretToken, setSecretToken] = useState(null);

    useEffect(() => {
        if (session?.access_token) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [keysRes, hooksRes] = await Promise.all([
                axios.get('/api/developer/keys', { headers: { Authorization: `Bearer ${session.access_token}` }}),
                axios.get('/api/developer/webhooks', { headers: { Authorization: `Bearer ${session.access_token}` }})
            ]);
            setKeys(keysRes.data.data);
            setWebhooks(hooksRes.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando integraciones');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async (e) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;
        
        try {
            const res = await axios.post('/api/developer/keys', { name: newKeyName }, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            
            const { token, id, name, created_at } = res.data.data;
            setSecretToken(token);
            setKeys([{ id, name, created_at, last_used_at: null }, ...keys]);
            setNewKeyName('');
            toast.success('API Key creada');
        } catch (error) {
            toast.error('Error al crear API Key');
        }
    };

    const handleDeleteKey = async (id) => {
        if (!confirm('¿Estás seguro de revocar este token? Las integraciones que lo usen fallarán.')) return;
        try {
            await axios.delete(`/api/developer/keys/${id}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setKeys(keys.filter(k => k.id !== id));
            toast.success('Token revocado');
        } catch (error) {
            toast.error('Error revocando token');
        }
    };

    const handleCreateWebhook = async (e) => {
        e.preventDefault();
        if (!newWebhookUrl.trim()) return;
        try {
            const res = await axios.post('/api/developer/webhooks', {
                url: newWebhookUrl, event: newWebhookEvent
            }, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setWebhooks([res.data.data, ...webhooks]);
            setNewWebhookUrl('');
            toast.success('Webhook registrado');
        } catch (error) {
            toast.error('Error creando webhook');
        }
    };

    const handleDeleteWebhook = async (id) => {
        try {
            await axios.delete(`/api/developer/webhooks/${id}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setWebhooks(webhooks.filter(w => w.id !== id));
            toast.success('Webhook eliminado');
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado al portapapeles');
    };

    return (
        <div className="animate-in" style={{ paddingBottom: 40, maxWidth: 1000, margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <h1>Integraciones & API ⚡</h1>
                <p>Conecta Centrous con n8n, Make, Zapier o tus propias aplicaciones.</p>
            </div>

            {secretToken && (
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', borderRadius: 12, padding: 24, marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-success)', marginBottom: 12 }}>
                        <ShieldAlert size={24} />
                        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Guarda tu Secret API Key</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                        Por razones de seguridad, <strong>esta es la única vez que verás este token</strong>. Cópialo y guárdalo en un lugar seguro. Si lo pierdes, tendrás que generar uno nuevo.
                    </p>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <input 
                            value={secretToken}
                            readOnly
                            style={{ flex: 1, padding: '12px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontFamily: 'monospace', fontSize: 16 }}
                        />
                        <button onClick={() => copyToClipboard(secretToken)} className="btn btn-primary">
                            <Copy size={18} /> Copiar
                        </button>
                    </div>
                    <button onClick={() => setSecretToken(null)} className="btn btn-ghost" style={{ marginTop: 16 }}>
                        Ya lo he guardado, ocultar mensaje
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                
                {/* Internal Integrations / API Keys */}
                <div className="card">
                    <div className="flex-between mb-4">
                        <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Key size={18} /> Tokens de Acceso</h2>
                        <span className="badge badge-primary">{keys.length} activos</span>
                    </div>

                    <form onSubmit={handleCreateKey} className="flex gap-2 mb-6">
                        <input
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="Nombre (ej. Conexión n8n)"
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <Plus size={16} /> Crear
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {loading ? <div style={{ color: 'var(--text-muted)' }}>Cargando...</div> :
                        keys.length === 0 ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No tienes tokens activos.</div> :
                        keys.map(k => (
                            <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--color-surface-2)', borderRadius: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{k.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                        Creado: {new Date(k.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteKey(k.id)} className="btn-icon" style={{ color: 'var(--color-danger)' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Webhooks */}
                <div className="card">
                    <div className="flex-between mb-4">
                        <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Webhook size={18} /> Webhooks Salientes</h2>
                        <span className="badge" style={{ background: 'var(--color-surface-3)' }}>{webhooks.length} endpoints</span>
                    </div>

                    <form onSubmit={handleCreateWebhook} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                        <select 
                            value={newWebhookEvent} 
                            onChange={(e) => setNewWebhookEvent(e.target.value)}
                            style={{ padding: '10px 12px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--text)' }}
                        >
                            <option value="lead.created">Lead Creado (lead.created)</option>
                            <option value="task.created">Tarea Creada (task.created)</option>
                        </select>
                        <div className="flex gap-2">
                            <input
                                value={newWebhookUrl}
                                onChange={(e) => setNewWebhookUrl(e.target.value)}
                                placeholder="URL (ej. https://n8n.miweb.com/webhook/123)"
                                style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <Plus size={16} /> Añadir
                            </button>
                        </div>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {loading ? <div style={{ color: 'var(--text-muted)' }}>Cargando...</div> :
                        webhooks.length === 0 ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No hay webhooks registrados.</div> :
                        webhooks.map(w => (
                            <div key={w.id} style={{ padding: 12, background: 'var(--color-surface-2)', borderRadius: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span className="badge badge-primary" style={{ fontSize: 11 }}>{w.event}</span>
                                    <button onClick={() => handleDeleteWebhook(w.id)} className="btn-icon" style={{ padding: 2, color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                                </div>
                                <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                                    {w.url}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Documentación Viva */}
            <div className="card">
                <h2 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Code size={20} /> Documentación de la API
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Utiliza tus tokens de acceso en el header <code style={{ background: 'var(--color-surface-3)', padding: '2px 6px', borderRadius: 4 }}>Authorization: Bearer &lt;TOKEN&gt;</code> para interactuar con la plataforma.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Crear Lead */}
                    <div style={{ background: '#0f172a', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ padding: '8px 16px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>POST /api/external/leads</span>
                            <span style={{ fontSize: 11, background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 12 }}>Crear Prospecto</span>
                        </div>
                        <pre style={{ padding: 16, margin: 0, fontSize: 13, color: '#e2e8f0', overflowX: 'auto' }}>
                            <code>{`curl -X POST ${window.location.origin}/api/external/leads \\
-H "Authorization: Bearer cntr_sk_your_token_here" \\
-H "Content-Type: application/json" \\
-d '{
  "name": "Elon Musk",
  "email": "elon@tesla.com",
  "phone": "+123456789",
  "source": "Landing Page X"
}'`}</code>
                        </pre>
                    </div>

                    {/* Obtener Leads */}
                    <div style={{ background: '#0f172a', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ padding: '8px 16px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>GET /api/external/leads</span>
                            <span style={{ fontSize: 11, background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: 12 }}>Listar Prospectos</span>
                        </div>
                        <pre style={{ padding: 16, margin: 0, fontSize: 13, color: '#e2e8f0', overflowX: 'auto' }}>
                            <code>{`curl -X GET ${window.location.origin}/api/external/leads?limit=10 \\
-H "Authorization: Bearer cntr_sk_your_token_here"`}</code>
                        </pre>
                    </div>
                </div>
            </div>

        </div>
    );
}
