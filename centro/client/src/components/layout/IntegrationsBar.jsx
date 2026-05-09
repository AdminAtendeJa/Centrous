export default function IntegrationsBar() {
    const integrations = [
        { name: 'Google', active: true },
        { name: 'Slack', active: true },
        { name: 'WhatsApp', active: true },
        { name: 'Notion', active: false },
        { name: 'Trello', active: false },
    ];

    return (
        <div className="integrations-bar-v3">
            <span className="int-label-v3">Integrações ativas</span>
            <div className="int-chips-v3">
                {integrations.map(int => (
                    <div 
                        key={int.name} 
                        className={`int-chip-v3 ${int.active ? 'active' : ''}`}
                    >
                        {int.name}
                    </div>
                ))}
                <button className="int-btn-more-v3">+ Ver todas</button>
            </div>
        </div>
    );
}
