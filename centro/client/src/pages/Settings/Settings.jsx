import { useState } from 'react';
import { Save, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/index.js';
import toast from 'react-hot-toast';

function ApiField({ label, field, placeholder, value, onChange, hint }) {
    const [visible, setVisible] = useState(false);
    return (
        <div style={{ marginBottom: 16 }}>
            <label>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(field, e.target.value)}
                    placeholder={placeholder}
                    style={{ paddingRight: 40 }}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                    {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            </div>
            {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
        </div>
    );
}

export default function Settings() {
    const { settings, updateSettings } = useSettingsStore();
    const [form, setForm] = useState({ ...settings });

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSave = () => {
        updateSettings(form);
        toast.success('Configuración guardada ✅');
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1>Ajustes ⚙️</h1>
                <p>Configura tus integraciones y preferencias del workspace.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
                {/* Profile */}
                <div className="card">
                    <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>👤 Perfil de Empresa</h2>
                    <div style={{ marginBottom: 14 }}>
                        <label>Tu nombre</label>
                        <input value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} placeholder="Víctor Martínez" />
                    </div>
                    <div>
                        <label>Nombre de la empresa</label>
                        <input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="Mi Empresa de Automatizaciones" />
                    </div>
                </div>

                {/* Notion */}
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700 }}>📝 Notion</h2>
                        {settings.notionKey && <span className="badge badge-success"><CheckCircle size={10} /> Conectado</span>}
                    </div>
                    <ApiField label="API Key de Notion" field="notionKey" placeholder="secret_…" value={form.notionKey} onChange={set}
                        hint="Obtén tu API Key en notion.so/my-integrations" />
                    <div>
                        <label>ID de Base de Datos (opcional)</label>
                        <input value={form.notionDbId} onChange={(e) => set('notionDbId', e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-…" />
                    </div>
                </div>

                {/* n8n */}
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700 }}>⚙️ n8n</h2>
                        {settings.n8nUrl && settings.n8nApiKey && <span className="badge badge-success"><CheckCircle size={10} /> Conectado</span>}
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label>URL de tu instancia n8n</label>
                        <input value={form.n8nUrl} onChange={(e) => set('n8nUrl', e.target.value)} placeholder="https://tu-n8n.app.n8n.cloud" />
                    </div>
                    <ApiField label="API Key de n8n" field="n8nApiKey" placeholder="n8n_api_…" value={form.n8nApiKey} onChange={set}
                        hint="En n8n: Settings → API → Create API Key" />
                </div>

                {/* LLM / AI Copilot */}
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700 }}>🧠 Agente IA (Copiloto)</h2>
                        {settings.aiApiKey && <span className="badge badge-success"><CheckCircle size={10} /> Conectado</span>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                        Configura la conexión compatible con OpenAI. Úsalo con Groq, OpenAI, Ollama o cualquier endpoint compatible.
                    </p>
                    <div style={{ marginBottom: 14 }}>
                        <label>Base URL del API (termina en /v1)</label>
                        <input value={form.aiBaseUrl} onChange={(e) => set('aiBaseUrl', e.target.value)} placeholder="https://api.groq.com/openai/v1" />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label>Nombre del Modelo</label>
                        <input value={form.aiModel} onChange={(e) => set('aiModel', e.target.value)} placeholder="llama3-70b-8192 o gpt-4o" />
                    </div>
                    <ApiField label="API Key de tu proveedor" field="aiApiKey" placeholder="sk-..." value={form.aiApiKey || ''} onChange={set} />
                </div>

                {/* Google */}
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: 8 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700 }}>🔵 Google (Gmail / Calendar)</h2>
                        <span className={`badge ${form.googleEnabled ? 'badge-success' : 'badge-muted'}`}>
                            {form.googleEnabled ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
                        <input type="checkbox" checked={form.googleEnabled} onChange={(e) => set('googleEnabled', e.target.checked)} style={{ width: 'auto' }} />
                        Habilitar integración Google
                    </label>
                    {form.googleEnabled && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <ApiField label="Google Client ID" field="googleClientId" placeholder="ID de cliente OAuth" value={form.googleClientId || ''} onChange={set} />
                            <ApiField label="Google Client Secret" field="googleClientSecret" placeholder="Secreto del cliente" value={form.googleClientSecret || ''} onChange={set} />

                            <button
                                className="btn"
                                style={{ background: '#fff', color: '#444', border: '1px solid #ddd', padding: '10px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
                                onClick={() => {
                                    if (!form.googleClientId) return toast.error('Ingresa el Client ID primero');
                                    toast.success('Iniciando flujo OAuth 2.0...');
                                    window.open('https://accounts.google.com/o/oauth2/v2/auth', '_blank', 'width=500,height=600');
                                }}
                            >
                                <img src="https://www.google.com/favicon.ico" style={{ width: 16 }} />
                                <span style={{ fontWeight: 600, fontSize: 13 }}>Vincular con Google Workspace</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Meta */}
                <div className="card">
                    <div className="flex-between" style={{ marginBottom: 8 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700 }}>📱 Meta Ads API</h2>
                        <span className={`badge ${form.metaEnabled ? 'badge-success' : 'badge-muted'}`}>
                            {form.metaEnabled ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
                        <input type="checkbox" checked={form.metaEnabled} onChange={(e) => set('metaEnabled', e.target.checked)} style={{ width: 'auto' }} />
                        Habilitar Meta Ads API
                    </label>
                    {form.metaEnabled && (
                        <>
                            <ApiField label="Meta App ID" field="metaAppId" placeholder="ID de tu App en Meta for Developers" value={form.metaAppId || ''} onChange={set} />
                            <ApiField label="Meta App Secret" field="metaAppSecret" placeholder="Secreto de tu App" value={form.metaAppSecret || ''} onChange={set} />
                            <ApiField label="System User Access Token" field="metaToken" placeholder="EAAB..." value={form.metaToken || ''} onChange={set} />
                        </>
                    )}
                </div>
            </div>

            <div style={{ marginTop: 24, maxWidth: 900 }}>
                <button className="btn btn-primary" onClick={handleSave} style={{ padding: '11px 24px' }}>
                    <Save size={16} /> Guardar Cambios
                </button>
            </div>
        </div>
    );
}
