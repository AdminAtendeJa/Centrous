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
        <div style={{ minWidth: 280, display: 'flex', flexDirection: 'column' }}>
            {/* Header Column */}
            <div style={{ marginBottom: 16, padding: '0 8px' }}>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color || 'var(--text-muted)', boxShadow: `0 0 8px ${stage.color || 'transparent'}` }} />
                        {stage.label}
                    </span>
                    <span style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-secondary)',
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontSize: 11,
                        fontWeight: 700,
                        border: '1px solid var(--color-border)'
                    }}>
                        {leads.length}
                    </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    VALOR TOTAL: <span style={{ color: 'var(--color-success)' }}>${leads.reduce((sum, lead) => sum + (lead.value || 0), 0).toLocaleString()}</span>
                </div>
            </div>

            {/* Droppable Area */}
            <motion.div
                ref={setNodeRef}
                animate={{
                    backgroundColor: isOver ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.01)',
                    borderColor: isOver ? 'var(--color-primary)' : 'var(--color-border)',
                }}
                style={{
                    borderRadius: 'var(--radius-lg)',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    padding: '12px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    flex: 1,
                    minHeight: '60vh',
                    background: 'rgba(255, 255, 255, 0.01)',
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
