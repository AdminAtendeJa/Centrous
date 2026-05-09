import { useSettingsStore } from '../../store/index.js';

export default function IntegrationsBar() {
    const { settings } = useSettingsStore();

    const integrations = [
        { name: 'Google', active: !!settings.googleClientId },
        { name: 'n8n', active: !!settings.n8nApiKey },
        { name: 'WhatsApp', active: !!settings.whatsappKey }, // Assuming there's a key
        { name: 'Notion', active: !!settings.notionKey },
        { name: 'Meta', active: !!settings.metaToken },
    ];

    return (
        <div className="integrations-bar-v3">
            <span className="int-label-v3">Integrações ativas</span>
            <div className="int-chips-v3">
                {integrations.map(int => (
                    <div 
                        key={int.name} 
                        className={`int-chip-v3 ${int.active ? 'active' : ''}`}
                        title={int.active ? 'Conectado' : 'Não configurado'}
                    >
                        {int.name}
                    </div>
                ))}
                <button className="int-btn-more-v3">+ Ver todas</button>
            </div>
        </div>
    );
}
