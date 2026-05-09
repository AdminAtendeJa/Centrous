import { useState } from 'react';
import { 
    Save, Eye, EyeOff, CheckCircle, Database, Settings as SettingsIcon, 
    User, RefreshCw, AlertCircle, ShieldCheck, Share2, Globe, Brain, 
    MessageSquare, Layout, CreditCard
} from 'lucide-react';
import { useSettingsStore, useOnboardingStore } from '../../store/index.js';
import { updateDataProject } from '../../config/supabase';
import toast from 'react-hot-toast';

function ApiField({ label, field, placeholder, value, onChange, hint, type = "password" }) {
    const [visible, setVisible] = useState(false);
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={visible || type === "text" ? 'text' : 'password'}
                    value={value || ''}
                    onChange={(e) => onChange(field, e.target.value)}
                    placeholder={placeholder}
                    style={{ 
                        paddingRight: 40,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        fontSize: 13
                    }}
                />
                {type === "password" && (
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                )}
            </div>
            {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
        </div>
    );
}

export default function Settings() {
    const { settings, updateSettings } = useSettingsStore();
    const { profile, resetOnboarding } = useOnboardingStore();
    const [activeTab, setActiveTab] = useState('general');
    const [form, setForm] = useState({ ...settings });

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSave = () => {
        updateSettings(form);
        toast.success('Configuración guardada ✅');
    };

    const isCustomDB = !!localStorage.getItem('active_sb_key');

    const tabs = [
        { id: 'general', label: 'General', icon: <Layout size={16} /> },
        { id: 'database', label: 'Base de Datos', icon: <Database size={16} /> },
        { id: 'ai', label: 'IA & Automatización', icon: <Brain size={16} /> },
        { id: 'social', label: 'Meta & Google', icon: <Globe size={16} /> },
        { id: 'notion', label: 'Notion Hub', icon: <Layout size={16} /> },
    ];

    return (
        <div className="page-container" style={{ padding: '40px 60px' }}>
            <div className="flex-between" style={{ marginBottom: 40 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
                        Centro de <span className="text-gradient">Control</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Configura tu ecosistema inteligente de trabajo.</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={18} /> Guardar cambios
                </button>
            </div>

            <div style={{ display: 'flex', gap: 40 }}>
                {/* Sidebar de Navegación de Ajustes */}
                <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 10, 
                                padding: '12px 16px',
                                border: 'none',
                                background: activeTab === tab.id ? 'var(--color-primary-glow)' : 'transparent',
                                borderRadius: 8,
                                color: activeTab === tab.id ? 'var(--text-bright)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: 14,
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                transition: 'all 0.2s'
                            }}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Contenido Principal de Ajustes */}
                <div style={{ flex: 1, maxWidth: 800 }}>
                    
                    {activeTab === 'general' && (
                        <div className="animate-in">
                            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>👤 Perfil del Workspace</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div style={{ marginBottom: 14 }}>
                                        <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nombre de Empresa</label>
                                        <input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
                                    </div>
                                    <div style={{ marginBottom: 14 }}>
                                        <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Propietario</label>
                                        <input value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} />
                                    </div>
                                </div>
                                
                                <div style={{ marginTop: 24, padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Personalización</h3>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>¿Quieres volver a elegir tu rol y herramientas? Esto reiniciará el flujo de bienvenida.</p>
                                    <button 
                                        className="btn btn-ghost btn-sm" 
                                        style={{ color: 'var(--color-primary-light)' }}
                                        onClick={() => {
                                            if (window.confirm('¿Reiniciar Onboarding?')) {
                                                resetOnboarding();
                                                window.location.href = '/onboarding';
                                            }
                                        }}
                                    >
                                        <RefreshCw size={14} /> Reiniciar Onboarding
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'database' && (
                        <div className="animate-in">
                            <div className="card" style={{ 
                                border: '1px solid var(--color-primary-glow)', 
                                background: 'linear-gradient(135deg, var(--color-surface), rgba(99, 102, 241, 0.05))',
                                padding: 24 
                            }}>
                                <div className="flex-between" style={{ marginBottom: 20 }}>
                                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>🔌 Conexión Supabase (BYOD)</h2>
                                    {isCustomDB ? (
                                        <span className="badge badge-success">Conectado</span>
                                    ) : (
                                        <span className="badge badge-error">Desconectado</span>
                                    )}
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Configura tu base de datos externa para gestionar tus leads y tareas de forma privada.</p>
                                
                                <ApiField label="Supabase URL" field="custom_sb_url" placeholder="https://..." value={localStorage.getItem('active_sb_url')} onChange={() => {}} type="text" />
                                <ApiField label="Anon Key" field="custom_sb_key" placeholder="eyJ..." value={localStorage.getItem('active_sb_key')} onChange={() => {}} />

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button 
                                        className="btn btn-primary" 
                                        style={{ flex: 1 }}
                                        onClick={() => {
                                            const url = document.querySelector('[placeholder="https://..."]').value;
                                            const key = document.querySelector('[placeholder="eyJ..."]').value;
                                            updateDataProject(url, key);
                                        }}
                                    >
                                        Vincular Proyecto
                                    </button>
                                    {isCustomDB && (
                                        <button className="btn btn-ghost" onClick={() => updateDataProject(null, null)}>Desconectar</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="animate-in">
                            <div className="card" style={{ padding: 24 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>🤖 Motor de Inteligencia Artificial</h2>
                                <ApiField label="Groq / OpenAI API Key" field="aiApiKey" value={form.aiApiKey} onChange={set} placeholder="gsk_..." />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <ApiField label="Modelo" field="aiModel" value={form.aiModel} onChange={set} placeholder="llama3-70b-8192" type="text" />
                                    <ApiField label="Base URL" field="aiBaseUrl" value={form.aiBaseUrl} onChange={set} placeholder="https://api.groq.com/..." type="text" />
                                </div>
                                
                                <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>⚙️ Automatización (n8n)</h3>
                                    <ApiField label="n8n Instance URL" field="n8nUrl" value={form.n8nUrl} onChange={set} placeholder="https://tu-n8n.com" type="text" />
                                    <ApiField label="n8n API Key" field="n8nApiKey" value={form.n8nApiKey} onChange={set} placeholder="n8n_api_..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="animate-in">
                            <div className="card" style={{ padding: 24 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>🔵 Meta Ads & Marketing</h2>
                                <ApiField label="Meta Access Token" field="metaToken" value={form.metaToken} onChange={set} placeholder="EAAB..." />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <ApiField label="App ID" field="metaAppId" value={form.metaAppId} onChange={set} placeholder="123456" type="text" />
                                    <ApiField label="App Secret" field="metaAppSecret" value={form.metaAppSecret} onChange={set} placeholder="abcdef..." />
                                </div>

                                <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
                                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>🟡 Google Search & Ads</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <ApiField label="Client ID" field="googleClientId" value={form.googleClientId} onChange={set} placeholder="xxx.apps.google..." type="text" />
                                        <ApiField label="Client Secret" field="googleClientSecret" value={form.googleClientSecret} onChange={set} placeholder="GOCSPX-..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notion' && (
                        <div className="animate-in">
                            <div className="card" style={{ padding: 24 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📔 Conexión con Notion Hub</h2>
                                <ApiField label="Notion Integration Token" field="notionKey" value={form.notionKey} onChange={set} placeholder="secret_..." />
                                <ApiField label="Database ID (Principal)" field="notionDbId" value={form.notionDbId} onChange={set} placeholder="abcdef123..." type="text" />
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                                    Asegúrate de haber compartido tu base de datos de Notion con la integración creada en el portal de desarrolladores.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
