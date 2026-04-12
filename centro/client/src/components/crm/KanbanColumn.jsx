import { useDroppable } from '@dnd-kit/core';
import { LeadCard } from './LeadCard.jsx';
import { motion } from 'framer-motion';

/**
 * CHAIN-OF-THOUGHT:
 * ¿Qué voy a hacer?: Construir una "Droppable Column" para las etapas Kanban.
 * ¿Por qué esta arquitectura?: Permite que la API de dnd-kit analice si el cursor entró al rectángulo del contenedor. Soporta un estilo Glassmorphism orgánico resaltando el borde cuando hay un "hover" de un ítem siendo arrastrado (isOver).
 */
export function KanbanColumn({ stage, leads, onLeadClick, onLeadDoubleClick, onDeleteLead, onEditLead }) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage.id,
    });

    return (
        <div style={{ minWidth: 260, display: 'flex', flexDirection: 'column' }}>
            {/* Header Column */}
            <div className="flex-between" style={{ marginBottom: 12, padding: '0 4px' }}>
                <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color || 'var(--text-muted)' }} />
                    {stage.label}
                </span>
                <span style={{
                    background: 'var(--color-surface-3)',
                    color: 'var(--text-primary)',
                    borderRadius: 99,
                    padding: '2px 10px',
                    fontSize: 11,
                    fontWeight: 700
                }}>
                    {leads.length}
                </span>
            </div>

            {/* Droppable Area */}
            <motion.div
                ref={setNodeRef}
                animate={{
                    backgroundColor: isOver ? 'rgba(124, 58, 237, 0.05)' : 'rgba(255,255,255,0.01)',
                    borderColor: isOver ? 'var(--color-primary-light)' : 'var(--color-border)',
                }}
                style={{
                    borderRadius: 'var(--radius-lg)',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    padding: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    flex: 1,
                    minHeight: 300,
                }}
            >
                {leads.map((lead) => (
                    <LeadCard
                        key={lead.id}
                        lead={lead}
                        onClick={onLeadClick}
                        onDoubleClick={onLeadDoubleClick}
                        onDelete={onDeleteLead}
                        onEdit={onEditLead}
                    />
                ))}
            </motion.div>
        </div>
    );
}
