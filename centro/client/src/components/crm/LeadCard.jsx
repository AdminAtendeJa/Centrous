import { useDraggable } from '@dnd-kit/core';
import { Edit3, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * CHAIN-OF-THOUGHT:
 * ¿Qué voy a hacer?: Crear un componente aislado para las tarjetas de Leads usando useDraggable de @dnd-kit/core.
 * ¿Por qué esta arquitectura?: Aislar el hook useDraggable evita renderizados innecesarios del KanbanBoard global. Además integramos Framer Motion para el layout hover, dando una experiencia "Premium Glassmorphic".
 */
export function LeadCard({ lead, onClick, onDoubleClick, onDelete, onEdit }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: lead.id,
        data: { lead }
    });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 999 : 1,
        opacity: isDragging ? 0.8 : 1,
        touchAction: 'none' // Prevent scrolling when dragging on mobile
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={() => onClick(lead.id, false)}
            onDoubleClick={() => onDoubleClick(lead.id, true)}
            whileHover={{ scale: isDragging ? 1 : 1.01 }}
            className="lead-card"
        >
            <div className="flex-between" style={{ marginBottom: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, pointerEvents: 'none', color: '#fff' }}>{lead.name}</div>
                <div className="flex gap-1" style={{ pointerEvents: 'auto' }}>
                    <button className="btn-icon" style={{ width: 26, height: 26, borderRadius: 6 }} onClick={(e) => { e.stopPropagation(); onEdit(lead); }}><Edit3 size={11} /></button>
                    <button className="btn-icon" style={{ width: 26, height: 26, borderRadius: 6, color: 'var(--color-danger)' }} onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }}><Trash2 size={11} /></button>
                </div>
            </div>

            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 12, pointerEvents: 'none', fontWeight: 500 }}>{lead.company}</div>

            <div className="flex-between" style={{ pointerEvents: 'none', marginBottom: lead.tags?.length ? 10 : 0 }}>
                <span className="badge badge-primary" style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}>{lead.channel}</span>
                {lead.value > 0 && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-success)', letterSpacing: '-0.01em' }}>
                        ${lead.value?.toLocaleString()}
                    </span>
                )}
            </div>

            {lead.tags && lead.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', pointerEvents: 'none' }}>
                    {lead.tags.map(tag => (
                        <span key={tag} style={{ 
                            background: 'rgba(99, 102, 241, 0.1)', 
                            color: 'var(--color-primary-light)', 
                            padding: '2px 8px', 
                            borderRadius: 6, 
                            fontSize: 10, 
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                            border: '1px solid rgba(99, 102, 241, 0.1)'
                        }}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

// Reusable CSS
const globalCardStyles = `
    .lead-card {
        background: #1c1c1f;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 14px;
        cursor: grab;
        transition: var(--transition);
        position: relative;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .lead-card:hover {
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: var(--shadow-lg);
        background: #232326;
    }
    .lead-card:active {
        cursor: grabbing;
        transform: scale(0.98);
    }
`;
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = globalCardStyles;
    document.head.appendChild(style);
}
