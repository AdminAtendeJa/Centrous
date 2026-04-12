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
            whileHover={{ scale: isDragging ? 1 : 1.02 }}
            className="lead-card"
        >
            <div className="flex-between" style={{ marginBottom: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 13, pointerEvents: 'none' }}>{lead.name}</div>
                <div className="flex gap-2" style={{ pointerEvents: 'auto' }}>
                    <button className="btn-icon" style={{ padding: 3 }} onClick={(e) => { e.stopPropagation(); onEdit(lead); }}><Edit3 size={12} /></button>
                    <button className="btn-icon" style={{ padding: 3 }} onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }}><Trash2 size={12} /></button>
                </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, pointerEvents: 'none' }}>{lead.company}</div>

            <div className="flex-between" style={{ pointerEvents: 'none' }}>
                <span className="badge badge-muted" style={{ fontSize: 10 }}>{lead.channel}</span>
                {lead.value > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-success)' }}>
                        ${lead.value?.toLocaleString()}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

// Reusable CSS injected via JS for simplicity without polluting global scoping too much
const globalCardStyles = `
    .lead-card {
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 12px 14px;
        cursor: grab;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
        position: relative;
    }
    .lead-card:active {
        cursor: grabbing;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
        border-color: var(--color-primary-light);
    }
`;
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = globalCardStyles;
    document.head.appendChild(style);
}
