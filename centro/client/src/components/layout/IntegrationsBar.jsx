import { useSettingsStore } from '../../store/index.js';

export default function IntegrationsBar() {
    const { settings } = useSettingsStore();

    const integrations = [
        { name: 'Google', active: !!settings.googleClientId },
        { name: 'n8n', active: !!settings.n8nApiKey },
        { name: 'WhatsApp', active: !!settings.whatsappKey || true }, // Mocking active for demo
        { name: 'Notion', active: !!settings.notionKey },
        { name: 'MetaAds', active: !!settings.metaToken },
        { name: 'Supabase', active: true },
    ];

    return (
        <div className="integrations-bar-v3">
            <span className="text-10 font-bold text-tertiary uppercase tracking-widest mr-2">Conexões ativas</span>
            <div className="flex items-center gap-2">
                {integrations.map(int => (
                    <div 
                        key={int.name} 
                        className={`btn-v3-pill ${int.active ? 'active' : ''}`}
                        style={{ height: '22px', fontSize: '9px', padding: '0 10px' }}
                        title={int.active ? 'Conexão estável' : 'Aguardando configuração'}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${int.active ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                        {int.name}
                    </div>
                ))}
            </div>
            <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-9 font-bold text-secondary">SISTEMA ONLINE</span>
                </div>
                <div className="h-3 w-px bg-border-tertiary" />
                <span className="text-9 text-tertiary font-medium">v3.2.1-stable</span>
            </div>
        </div>
    );
}
