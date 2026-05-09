import { useState } from 'react';
import { 
    Save, Eye, EyeOff, Database, User, RefreshCw, Globe, Brain, 
    Layout, ChevronRight, Shield, Bell
} from 'lucide-react';
import { useSettingsStore, useOnboardingStore } from '../../store/index.js';
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

export default function Settings() {
    const { settings, updateSettings } = useSettingsStore();
    const { resetOnboarding } = useOnboardingStore();
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

                        {activeTab === 'ai' && (
                            <div className="form-v3">
                                <ConfigField 
                                    label="Groq API Key" 
                                    value={form.aiApiKey}
                                    type="password"
                                    onChange={(v) => setForm({...form, aiApiKey: v})}
                                    placeholder="gsk_..."
                                    hint="Utilizado para o Copilot e automações de IA."
                                />
                                <ConfigField 
                                    label="Modelo Principal" 
                                    value={form.aiModel}
                                    onChange={(v) => setForm({...form, aiModel: v})}
                                    placeholder="llama3-70b-8192"
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
                                    label="API Key" 
                                    value={form.n8nApiKey}
                                    type="password"
                                    onChange={(v) => setForm({...form, n8nApiKey: v})}
                                    placeholder="n8n_api_..."
                                />
                            </div>
                        )}

                        {/* Other tabs follow the same pattern... */}
                    </div>
                </div>
            </div>
        </div>
    );
}
