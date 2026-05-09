import React from 'react';
import { Zap, ArrowRight, MessageCircle, Calendar } from 'lucide-react';

export function AutomationTriggers({ stages }) {
    // Simulamos reglas configuradas por el usuario
    const triggers = {
        'new': [
            { icon: <MessageCircle size={14} />, text: 'Responder vía AI', color: '#3b82f6' }
        ],
        'qualified': [
            { icon: <Calendar size={14} />, text: 'Crear Tarea: Llamar', color: '#10b981' }
        ],
        'proposal': [
            { icon: <Zap size={14} />, text: 'Webhook a Zapier', color: '#f59e0b' }
        ]
    };

    return (
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, marginBottom: -10 }}>
            {stages.map(stage => (
                <div key={stage.id} style={{ minWidth: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(triggers[stage.id] || []).map((t, i) => (
                        <div key={i} style={{ 
                            background: 'var(--color-surface-2)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: 6, 
                            padding: '6px 10px', 
                            fontSize: 11, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 6,
                            color: 'var(--text-secondary)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <span style={{ color: t.color, display: 'flex' }}>{t.icon}</span>
                            <span style={{ flex: 1 }}>{t.text}</span>
                        </div>
                    ))}
                    
                    <button style={{ 
                        background: 'transparent', 
                        border: '1px dashed var(--color-border)', 
                        borderRadius: 6, 
                        padding: '6px', 
                        fontSize: 11, 
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                    }}>
                        <Zap size={12} /> Añadir Trigger
                    </button>
                </div>
            ))}
        </div>
    );
}
