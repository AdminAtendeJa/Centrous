import React, { useState, useEffect } from 'react';
import { 
    Key, Webhook, Plus, Trash2, Copy, 
    CheckCircle2, Code, ShieldAlert, ExternalLink, Zap
} from 'lucide-react';
import { useAuthStore } from '../../store/index.js';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Integrations() {
    const { session } = useAuthStore();
    const [keys, setKeys] = useState([]);
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [newKeyName, setNewKeyName] = useState('');
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [newWebhookEvent, setNewWebhookEvent] = useState('lead.created');
    const [secretToken, setSecretToken] = useState(null);

    useEffect(() => {
        if (session?.access_token) fetchData();
    }, [session]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [keysRes, hooksRes] = await Promise.all([
                axios.get('/api/developer/keys', { headers: { Authorization: `Bearer ${session.access_token}` }}),
                axios.get('/api/developer/webhooks', { headers: { Authorization: `Bearer ${session.access_token}` }})
            ]);
            setKeys(keysRes.data.data || []);
            setWebhooks(hooksRes.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar integrações');
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
            toast.success('API Key criada!');
        } catch (error) {
            toast.error('Erro ao criar API Key');
        }
    };

    const handleDeleteKey = async (id) => {
        if (!confirm('Tem certeza que deseja revogar este token? Integrações que o utilizam irão falhar.')) return;
        try {
            await axios.delete(`/api/developer/keys/${id}`, { headers: { Authorization: `Bearer ${session.access_token}` }});
            setKeys(keys.filter(k => k.id !== id));
            toast.success('Token revogado');
        } catch (error) {
            toast.error('Erro ao revogar token');
        }
    };

    const handleCreateWebhook = async (e) => {
        e.preventDefault();
        if (!newWebhookUrl.trim()) return;
        try {
            const res = await axios.post('/api/developer/webhooks', {
                url: newWebhookUrl, event: newWebhookEvent
            }, { headers: { Authorization: `Bearer ${session.access_token}` }});
            setWebhooks([res.data.data, ...webhooks]);
            setNewWebhookUrl('');
            toast.success('Webhook registrado!');
        } catch (error) {
            toast.error('Erro ao criar webhook');
        }
    };

    const handleDeleteWebhook = async (id) => {
        try {
            await axios.delete(`/api/developer/webhooks/${id}`, { headers: { Authorization: `Bearer ${session.access_token}` }});
            setWebhooks(webhooks.filter(w => w.id !== id));
            toast.success('Webhook removido');
        } catch (error) {
            toast.error('Erro ao remover');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado para a área de transferência!');
    };

    return (
        <div className="animate-in" style={{ padding: '16px', paddingBottom: 40 }}>
            {/* Header */}
            <div className="flex-between mb-6">
                <div>
                    <h1 className="text-18 font-extrabold text-primary tracking-tight">Integrações & API</h1>
                    <p className="text-11 text-tertiary">Conecte o Centrous com n8n, Make, Zapier ou suas próprias aplicações.</p>
                </div>
            </div>

            {/* Secret Token Alert */}
            {secretToken && (
                <div className="card-v3 mb-6" style={{ background: 'rgba(34, 197, 94, 0.06)', borderColor: 'rgba(34,197,94,0.3)', padding: 24 }}>
                    <div className="flex items-center gap-3 mb-3" style={{ color: '#16a34a' }}>
                        <ShieldAlert size={22} />
                        <h2 className="text-14 font-bold">Guarde seu Secret API Key</h2>
                    </div>
                    <p className="text-11 text-secondary mb-4">
                        Por razões de segurança, <strong>esta é a única vez que você verá este token</strong>. Copie e guarde em local seguro.
                    </p>
                    <div className="flex gap-2">
                        <div className="config-input-v3 flex-1">
                            <input value={secretToken} readOnly style={{ fontFamily: 'monospace', fontSize: 13 }} />
                        </div>
                        <button onClick={() => copyToClipboard(secretToken)} className="btn-v3-primary">
                            <Copy size={14} /> Copiar
                        </button>
                    </div>
                    <button onClick={() => setSecretToken(null)} className="btn-v3-ghost mt-3 text-11">
                        Já salvei, ocultar mensagem
                    </button>
                </div>
            )}

            {/* Keys & Webhooks Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                
                {/* API Keys */}
                <div className="section-v3">
                    <div className="section-header-v3 mb-4">
                        <div className="flex items-center gap-2">
                            <Key size={16} className="text-accent" />
                            <span className="section-title-v3">Tokens de Acesso</span>
                        </div>
                        <span className="tag-v3 tag-blue">{keys.length} ativos</span>
                    </div>

                    <form onSubmit={handleCreateKey} className="flex gap-2 mb-4">
                        <div className="config-input-v3 flex-1">
                            <input
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="Nome (ex: Conexão n8n)"
                            />
                        </div>
                        <button type="submit" className="btn-v3-primary" disabled={loading}>
                            <Plus size={14} /> Criar
                        </button>
                    </form>

                    <div className="flex flex-col gap-2">
                        {loading ? <div className="text-11 text-tertiary p-4 text-center">Carregando...</div> :
                        keys.length === 0 ? <div className="text-11 text-tertiary p-4 text-center">Nenhum token ativo.</div> :
                        keys.map(k => (
                            <div key={k.id} className="flex-between p-3 border-v3 rounded-xl bg-white">
                                <div>
                                    <div className="text-12 font-bold text-primary">{k.name}</div>
                                    <div className="text-10 text-tertiary mt-0.5">
                                        Criado em {new Date(k.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteKey(k.id)} className="btn-icon-v3" style={{ color: 'var(--color-danger, #ef4444)' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Webhooks */}
                <div className="section-v3">
                    <div className="section-header-v3 mb-4">
                        <div className="flex items-center gap-2">
                            <Webhook size={16} className="text-accent" />
                            <span className="section-title-v3">Webhooks de Saída</span>
                        </div>
                        <span className="tag-v3 tag-zinc">{webhooks.length} endpoints</span>
                    </div>

                    <form onSubmit={handleCreateWebhook} className="flex flex-col gap-2 mb-4">
                        <select 
                            value={newWebhookEvent} 
                            onChange={(e) => setNewWebhookEvent(e.target.value)}
                            className="input-v3"
                        >
                            <option value="lead.created">Lead Criado (lead.created)</option>
                            <option value="lead.updated">Lead Atualizado (lead.updated)</option>
                            <option value="task.created">Tarefa Criada (task.created)</option>
                        </select>
                        <div className="flex gap-2">
                            <div className="config-input-v3 flex-1">
                                <input
                                    value={newWebhookUrl}
                                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                                    placeholder="URL (ex: https://n8n.meusite.com/webhook/123)"
                                />
                            </div>
                            <button type="submit" className="btn-v3-primary" disabled={loading}>
                                <Plus size={14} /> Adicionar
                            </button>
                        </div>
                    </form>

                    <div className="flex flex-col gap-2">
                        {loading ? <div className="text-11 text-tertiary p-4 text-center">Carregando...</div> :
                        webhooks.length === 0 ? <div className="text-11 text-tertiary p-4 text-center">Nenhum webhook registrado.</div> :
                        webhooks.map(w => (
                            <div key={w.id} className="p-3 border-v3 rounded-xl bg-white">
                                <div className="flex-between mb-2">
                                    <span className="tag-v3 tag-blue text-10">{w.event}</span>
                                    <button onClick={() => handleDeleteWebhook(w.id)} className="btn-icon-v3" style={{ color: 'var(--color-danger, #ef4444)' }}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                <div className="text-10 text-tertiary" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                    {w.url}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* API Docs */}
            <div className="section-v3">
                <div className="section-header-v3 mb-6">
                    <div className="flex items-center gap-2">
                        <Code size={18} className="text-accent" />
                        <span className="section-title-v3">Documentação da API</span>
                    </div>
                </div>
                <p className="text-11 text-secondary mb-6">
                    Use seus tokens de acesso no header{' '}
                    <code style={{ background: 'var(--color-background-tertiary)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11 }}>
                        Authorization: Bearer &lt;TOKEN&gt;
                    </code>{' '}
                    para interagir com a plataforma.
                </p>

                <div className="flex flex-col gap-4">
                    {[
                        { method: 'POST', path: '/api/external/leads', label: 'Criar Prospecto', color: '#10b981', body: `{\n  "name": "João Silva",\n  "email": "joao@empresa.com",\n  "phone": "+55119999999",\n  "source": "Landing Page"\n}` },
                        { method: 'GET', path: '/api/external/leads', label: 'Listar Prospectos', color: '#3b82f6', body: null },
                    ].map((endpoint, i) => (
                        <div key={i} style={{ background: '#0f172a', borderRadius: 12, overflow: 'hidden' }}>
                            <div style={{ padding: '8px 16px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace', fontWeight: 600 }}>
                                    {endpoint.method} {endpoint.path}
                                </span>
                                <span style={{ fontSize: 10, background: endpoint.color, color: '#fff', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                                    {endpoint.label}
                                </span>
                            </div>
                            <pre style={{ padding: 16, margin: 0, fontSize: 12, color: '#e2e8f0', overflowX: 'auto', fontFamily: 'monospace' }}>
                                <code>{`curl -X ${endpoint.method} ${window.location.origin}${endpoint.path} \\
-H "Authorization: Bearer cntr_sk_seu_token" \\
-H "Content-Type: application/json"${endpoint.body ? ` \\
-d '${endpoint.body}'` : ''}`}</code>
                            </pre>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
