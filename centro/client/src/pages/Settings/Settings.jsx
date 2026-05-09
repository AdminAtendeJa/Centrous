import { useState } from 'react';
import { Save, Eye, EyeOff, CheckCircle, Database, Settings as SettingsIcon, User, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
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
                    value={value}
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
    const [form, setForm] = useState({ ...settings });

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSave = () => {
        updateSettings(form);
        toast.success('Configuración guardada ✅');
    };

    const isCustomDB = !!localStorage.getItem('active_sb_key');

    return (
        <div className="page-container" style={{ padding: '40px 60px' }}>
            <div className="flex-between" style={{ marginBottom: 40 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
                        Configuración <span className="text-gradient">Avanzada</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestiona tu identidad, conexiones y el flujo de trabajo.</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={18} /> Guardar cambios
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 1000 }}>
                
                {/* 1. SECCIÓN DE BASE DE DATOS (BYOD) */}
                <div className="card" style={{ 
                    border: '1px solid var(--color-primary-glow)', 
                    background: 'linear-gradient(135deg, var(--color-surface), rgba(99, 102, 241, 0.05))',
                    padding: 24
                }}>
                    <div className="flex-between" style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Database size={18} color="var(--color-primary)" /> Base de Datos de Usuario
                        </h2>
                        {isCustomDB ? (
                            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <ShieldCheck size={12} /> Conectado
                            </span>
                        ) : (
                            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <AlertCircle size={12} /> Desconectado
                            </span>
                        )}
                    </div>
                    
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                        Conecta tu propio proyecto de Supabase para que Centrous gestione tus tablas de <strong>leads</strong> y <strong>tasks</strong>. Si está desconectado, el CRM estará vacío.
                    </p>

                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Supabase URL</label>
                        <input 
                            id="custom_sb_url"
                            defaultValue={localStorage.getItem('active_sb_url') || ''} 
                            placeholder="https://tu-proyecto.supabase.co"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                        />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Anon Key / Public Key</label>
                        <input 
                            id="custom_sb_key"
                            type="password"
                            defaultValue={localStorage.getItem('active_sb_key') || ''} 
                            placeholder="eyJhbGciOiJIUzI1Ni..."
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button 
                            className="btn btn-primary btn-sm" 
                            style={{ flex: 1 }}
                            onClick={() => {
                                const url = document.getElementById('custom_sb_url').value;
                                const key = document.getElementById('custom_sb_key').value;
                                if (!url || !key) return toast.error('Completa ambos campos');
                                updateDataProject(url, key);
                            }}
                        >
                            Vincular Proyecto
                        </button>
                        {isCustomDB && (
                            <button 
                                className="btn btn-ghost btn-sm"
                                onClick={() => updateDataProject(null, null)}
                            >
                                Desconectar
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. SECCIÓN DE IDENTIDAD Y ONBOARDING */}
                <div className="card" style={{ padding: 24 }}>
                    <div className="flex-between" style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <User size={18} color="var(--color-primary-light)" /> Perfil del Workspace
                        </h2>
                        <span className="badge" style={{ opacity: 0.8 }}>ID: {profile.userName || 'Usuario'}</span>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                            ¿Quieres volver a personalizar tu experiencia? Reiniciar el Onboarding te permitirá elegir de nuevo tu rol y herramientas.
                        </p>
                        <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ width: '100%', color: 'var(--color-primary-light)', border: '1px dashed rgba(99, 102, 241, 0.3)' }}
                            onClick={() => {
                                if (window.confirm('¿Reiniciar Onboarding? Volverás al flujo de bienvenida.')) {
                                    resetOnboarding();
                                    window.location.href = '/onboarding';
                                }
                            }}
                        >
                            <RefreshCw size={14} /> Reiniciar Flujo de Bienvenida
                        </button>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
                        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Resumen de Perfil</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            <span className="badge" style={{ background: 'var(--color-primary-glow)' }}>{profile.profession || 'Sin profesión'}</span>
                            {profile.apps && profile.apps.map(app => (
                                <span key={app} className="badge" style={{ opacity: 0.6 }}>{app}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. INTEGRACIONES TÉCNICAS */}
                <div className="card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🛠️ Integraciones de Automatización</h2>
                    <ApiField 
                        label="Notion API Key" 
                        field="notionKey" 
                        value={form.notionKey} 
                        onChange={set} 
                        placeholder="secret_..." 
                        hint="Necesario para sincronizar el Hub de Notion."
                    />
                    <ApiField 
                        label="n8n Webhook URL" 
                        field="n8nWebhook" 
                        value={form.n8nWebhook} 
                        onChange={set} 
                        placeholder="https://tu-n8n.com/..." 
                        type="text"
                        hint="URL base para disparar automatizaciones."
                    />
                </div>

                {/* 4. PREFERENCIAS DE IA */}
                <div className="card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🤖 Comportamiento de IA</h2>
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <span style={{ fontSize: 13 }}>Sugerencias Automáticas</span>
                        <input type="checkbox" checked={form.aiSuggestions} onChange={(e) => set('aiSuggestions', e.target.checked)} />
                    </div>
                    <div className="flex-between">
                        <span style={{ fontSize: 13 }}>Optimización de Campañas (Meta)</span>
                        <input type="checkbox" checked={form.autoOptimize} onChange={(e) => set('autoOptimize', e.target.checked)} />
                    </div>
                </div>

            </div>
        </div>
    );
}
