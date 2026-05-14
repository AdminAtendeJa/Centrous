import { useState } from 'react';
import { 
    Save, Eye, EyeOff, Database, User, RefreshCw, Globe, Brain, 
    Layout, ChevronRight, Shield, Bell, LogOut, Key, Webhook
} from 'lucide-react';
import { useSettingsStore, useOnboardingStore, useAuthStore } from '../../store/index.js';
import toast from 'react-hot-toast';

function ConfigField({ label, value, onChange, placeholder, type = "text", hint }) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="config-field-v3 mb-4">
            <label>{label}</label>
            <div className="config-input-v3">
                <input 
                    type={type === 'password' && !visible ? 'password' : 'text'}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
                {type === 'password' && (
                    <button className="btn-icon-v3" onClick={() => setVisible(!visible)}>
                        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                )}
            </div>
            {hint && <span className="config-hint-v3">{hint}</span>}
        </div>
    );
}

function ToggleField({ label, value, onChange, hint }) {
    return (
        <div className="config-field-v3 mb-4">
            <div className="flex-between">
                <div>
                    <label style={{ marginBottom: 2 }}>{label}</label>
                    {hint && <span className="config-hint-v3">{hint}</span>}
                </div>
                <button
                    onClick={() => onChange(!value)}
                    style={{
                        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: value ? 'var(--color-accent)' : 'var(--color-background-tertiary)',
                        position: 'relative', transition: 'all 0.2s', flexShrink: 0
                    }}
                >
                    <span style={{
                        position: 'absolute', top: 3, left: value ? 23 : 3,
                        width: 18, height: 18, borderRadius: '50%', background: 'white',
                        transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                    }} />
                </button>
            </div>
        </div>
    );
}

export default function Settings() {
    const { settings, updateSettings } = useSettingsStore();
    const { resetOnboarding } = useOnboardingStore();
    const { signOut } = useAuthStore();
    const [activeTab, setActiveTab] = useState('general');
    const [form, setForm] = useState({ ...settings });

    const tabs = [
        { id: 'general', label: 'Geral', icon: <User size={14} /> },
        { id: 'database', label: 'Banco de Dados', icon: <Database size={14} /> },
        { id: 'ai', label: 'IA & Automação', icon: <Brain size={14} /> },
        { id: 'marketing', label: 'Marketing Hub', icon: <Globe size={14} /> },
        { id: 'security', label: 'Segurança', icon: <Shield size={14} /> },
        { id: 'notifications', label: 'Notificações', icon: <Bell size={14} /> },
    ];

    const handleSave = () => {
        updateSettings(form);
        toast.success('Configurações salvas com sucesso');
    };

    return (
        <div className="settings-v3 animate-in">
            <div className="dashboard-main-v3">
                {/* Side Nav */}
                <div className="section-v3" style={{ maxWidth: 240 }}>
                    <div className="settings-nav-v3">
                        {tabs.map(tab => (
                            <button 
                                key={tab.id}
                                className={`settings-nav-item-v3 ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                <ChevronRight size={12} className="ml-auto" />
                            </button>
                        ))}
                    </div>
                    
                    <div className="divider-v3 my-4" />

                    <button 
                        className="settings-nav-item-v3 text-danger w-full"
                        style={{ color: 'var(--color-danger, #ef4444)' }}
                        onClick={async () => {
                            await signOut();
                            toast.success('Sessão encerrada');
                        }}
                    >
                        <LogOut size={14} />
                        <span>Sair da conta</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="section-v3">
                    <div className="card-v3" style={{ maxWidth: 640 }}>
                        <div className="section-header-v3 mb-6">
                            <span className="section-title-v3">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </span>
                            <button className="btn-v3-primary" onClick={handleSave}>
                                <Save size={14} /> Salvar Alterações
                            </button>
                        </div>

                        {activeTab === 'general' && (
                            <div className="form-v3">
                                <ConfigField 
                                    label="Nome da Empresa" 
                                    value={form.companyName}
                                    onChange={(v) => setForm({...form, companyName: v})}
                                    placeholder="Ex: Centrous Pro"
                                />
                                <ConfigField 
                                    label="Nome do Proprietário" 
                                    value={form.ownerName}
                                    onChange={(v) => setForm({...form, ownerName: v})}
                                    placeholder="Seu nome"
                                    hint="Este nome aparecerá na barra superior e nas saudações do Copilot."
                                />
                                <div className="divider-v3 my-6" />
                                <div className="danger-zone-v3">
                                    <span className="text-xs font-bold uppercase mb-2 block">Zona de Risco</span>
                                    <p className="text-xs text-tertiary mb-4">Reiniciar o onboarding irá limpar as configurações iniciais de fluxo.</p>
                                    <button className="btn-v3-secondary text-danger" onClick={resetOnboarding}>
                                        <RefreshCw size={12} /> Reiniciar Sistema
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'database' && (
                            <div className="form-v3">
                                <div style={{ background: 'var(--color-background-secondary)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                                        <span className="text-11 font-bold text-primary">Supabase Conectado</span>
                                    </div>
                                    <p className="text-10 text-tertiary">A conexão com Supabase é configurada via variáveis de ambiente no servidor.</p>
                                </div>
                                <ConfigField 
                                    label="Supabase URL (público)" 
                                    value={form.supabaseUrl || ''}
                                    onChange={(v) => setForm({...form, supabaseUrl: v})}
                                    placeholder="https://xxx.supabase.co"
                                    hint="Usado pelo cliente para autenticação e dados públicos."
                                />
                                <ConfigField 
                                    label="Supabase Anon Key" 
                                    value={form.supabaseAnonKey || ''}
                                    type="password"
                                    onChange={(v) => setForm({...form, supabaseAnonKey: v})}
                                    placeholder="eyJhbGci..."
                                />
                                <div className="divider-v3 my-4" />
                                <span className="text-11 font-bold text-secondary block mb-3">Tabelas Monitoradas</span>
                                <p className="text-10 text-tertiary">Acesse <strong>Dados → Monitor Supabase</strong> para visualizar suas tabelas com dashboards gerados por IA.</p>
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="form-v3">
                                <ConfigField 
                                    label="Groq API Key" 
                                    value={form.aiApiKey}
                                    type="password"
                                    onChange={(v) => setForm({...form, aiApiKey: v})}
                                    placeholder="gsk_..."
                                    hint="Utilizado pelo Copilot e automações de IA. Obtenha em console.groq.com"
                                />
                                <ConfigField 
                                    label="Modelo Principal" 
                                    value={form.aiModel}
                                    onChange={(v) => setForm({...form, aiModel: v})}
                                    placeholder="llama3-70b-8192"
                                    hint="Modelos disponíveis: llama3-70b-8192, mixtral-8x7b-32768, gemma-7b-it"
                                />
                                <ConfigField 
                                    label="AI Base URL" 
                                    value={form.aiBaseUrl}
                                    onChange={(v) => setForm({...form, aiBaseUrl: v})}
                                    placeholder="https://api.groq.com/openai/v1"
                                />
                                <div className="divider-v3 my-6" />
                                <span className="section-title-v3 mb-4 block" style={{fontSize: 11}}>Conexão n8n</span>
                                <ConfigField 
                                    label="Instance URL" 
                                    value={form.n8nUrl}
                                    onChange={(v) => setForm({...form, n8nUrl: v})}
                                    placeholder="https://seu-n8n.app"
                                />
                                <ConfigField 
                                    label="API Key n8n" 
                                    value={form.n8nApiKey}
                                    type="password"
                                    onChange={(v) => setForm({...form, n8nApiKey: v})}
                                    placeholder="n8n_api_..."
                                />
                            </div>
                        )}

                        {activeTab === 'marketing' && (
                            <div className="form-v3">
                                <span className="section-title-v3 mb-4 block" style={{fontSize: 11}}>Meta Ads / Facebook</span>
                                <ToggleField
                                    label="Habilitar Meta Ads"
                                    value={form.metaEnabled || false}
                                    onChange={(v) => setForm({...form, metaEnabled: v})}
                                    hint="Ativa o painel de Meta Ads e Auto-Pilot."
                                />
                                <ConfigField 
                                    label="Meta App ID" 
                                    value={form.metaAppId}
                                    onChange={(v) => setForm({...form, metaAppId: v})}
                                    placeholder="123456789"
                                />
                                <ConfigField 
                                    label="Meta Access Token" 
                                    value={form.metaToken}
                                    type="password"
                                    onChange={(v) => setForm({...form, metaToken: v})}
                                    placeholder="EAAxxxxx..."
                                    hint="Token de acesso à API do Meta para ler métricas de campanhas."
                                />
                                <div className="divider-v3 my-4" />
                                <span className="section-title-v3 mb-4 block" style={{fontSize: 11}}>Google</span>
                                <ToggleField
                                    label="Habilitar Google OAuth"
                                    value={form.googleEnabled || false}
                                    onChange={(v) => setForm({...form, googleEnabled: v})}
                                    hint="Para sincronizar Google Calendar e Google Drive."
                                />
                                <ConfigField 
                                    label="Google Client ID" 
                                    value={form.googleClientId}
                                    onChange={(v) => setForm({...form, googleClientId: v})}
                                    placeholder="xxx.apps.googleusercontent.com"
                                />
                                <div className="divider-v3 my-4" />
                                <span className="section-title-v3 mb-4 block" style={{fontSize: 11}}>Notion</span>
                                <ConfigField 
                                    label="Notion Integration Key" 
                                    value={form.notionKey}
                                    type="password"
                                    onChange={(v) => setForm({...form, notionKey: v})}
                                    placeholder="secret_..."
                                />
                                <ConfigField 
                                    label="Database ID padrão" 
                                    value={form.notionDbId}
                                    onChange={(v) => setForm({...form, notionDbId: v})}
                                    placeholder="xxxxxxxxxxxxxxxx"
                                />
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="form-v3">
                                <div style={{ background: 'var(--color-background-secondary)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield size={14} style={{ color: 'var(--color-accent)' }} />
                                        <span className="text-11 font-bold text-primary">Autenticação via Supabase Auth</span>
                                    </div>
                                    <p className="text-10 text-tertiary">Sua conta é protegida com JWT e Row Level Security (RLS) no Supabase.</p>
                                </div>
                                <div className="divider-v3 my-4" />
                                <span className="section-title-v3 mb-4 block" style={{fontSize: 11}}>Tokens de API & Webhooks</span>
                                <p className="text-10 text-tertiary mb-4">Gerencie seus tokens de acesso e webhooks de saída na seção <strong>Conexões → Integrações & API</strong>.</p>
                                <div className="divider-v3 my-4" />
                                <span className="section-title-v3 mb-4 block" style={{fontSize: 11}}>Sessão Ativa</span>
                                <button 
                                    className="btn-v3-secondary" 
                                    style={{ color: 'var(--color-danger, #ef4444)' }}
                                    onClick={async () => {
                                        await signOut();
                                        toast.success('Sessão encerrada com segurança');
                                    }}
                                >
                                    <LogOut size={12} /> Encerrar sessão atual
                                </button>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="form-v3">
                                <span className="text-11 font-bold text-secondary block mb-4">Alertas da Plataforma</span>
                                <ToggleField
                                    label="Notificações de novos leads"
                                    value={form.notifyLeads !== false}
                                    onChange={(v) => setForm({...form, notifyLeads: v})}
                                    hint="Receba um alerta quando um novo lead entrar no CRM."
                                />
                                <ToggleField
                                    label="Alertas de tarefas urgentes"
                                    value={form.notifyUrgentTasks !== false}
                                    onChange={(v) => setForm({...form, notifyUrgentTasks: v})}
                                    hint="Notificação quando uma tarefa de alta prioridade está pendente."
                                />
                                <ToggleField
                                    label="Relatório semanal do Copilot"
                                    value={form.notifyWeeklyReport || false}
                                    onChange={(v) => setForm({...form, notifyWeeklyReport: v})}
                                    hint="Receba um resumo semanal com insights de IA toda segunda-feira."
                                />
                                <ToggleField
                                    label="Alertas de Meta Ads"
                                    value={form.notifyMetaAlerts || false}
                                    onChange={(v) => setForm({...form, notifyMetaAlerts: v})}
                                    hint="Seja notificado quando uma campanha precisar de atenção."
                                />
                                <div className="divider-v3 my-4" />
                                <span className="text-11 font-bold text-secondary block mb-2">Canal de Notificações</span>
                                <p className="text-10 text-tertiary">Notificações via WhatsApp e Email estarão disponíveis em breve via n8n.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
