import { useSettingsStore } from '../../store/index.js';

export default function IntegrationsBar() {
    const { settings } = useSettingsStore();

    const integrations = [
        { name: 'Google', active: !!settings.googleClientId },
        { name: 'n8n', active: !!settings.n8nApiKey },
        { name: 'WhatsApp', active: true }, 
        { name: 'Notion', active: !!settings.notionKey },
        { name: 'MetaAds', active: !!settings.metaToken },
        { name: 'Supabase', active: true },
    ];

    return (
        <footer className="integrations-bar-v3">
            <div className="flex items-center gap-2 w-full justify-center">
                {integrations.map(int => (
                    <div 
                        key={int.name} 
                        className={`btn-v3-pill ${int.active ? 'active' : ''}`}
                        title={int.active ? 'Conexão estável' : 'Aguardando configuração'}
                        style={{ border: 'none', background: int.active ? 'var(--color-accent-light)' : 'transparent' }}
                    >
                        <div className={`w-1 h-1 rounded-full mr-2 ${int.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span className={`text-9 font-bold ${int.active ? 'text-accent' : 'text-tertiary'}`}>
                            {int.name}
                        </span>
                    </div>
                ))}
            </div>
        </footer>
    );
}
