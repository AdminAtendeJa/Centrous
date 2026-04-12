import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { KanbanColumn } from './KanbanColumn.jsx';
import { LeadCard } from './LeadCard.jsx';

/**
 * CHAIN-OF-THOUGHT:
 * ¿Qué voy a hacer?: Contenedor principal de DndContext. Provee el engine de Drag and Drop para todo el tablero.
 * ¿Por qué esta arquitectura?: Aislar el contexto de dnd-kit permite que CRM.jsx se mantenga limpio como una capa de coordinación (Controllers), delegando toda la complejidad visual y de física DND a este core.
 */
export function KanbanBoard({ stages, leads, onMoveLead, onLeadClick, onLeadDoubleClick, onDeleteLead, onEditLead }) {
    const [activeId, setActiveId] = useState(null);

    // Activamos dragging si el cursor se mueve 5px o más. Evita que hacer un simple "click" en la tarjeta la arrastre accidentalmente.
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        setActiveId(null);
        const { active, over } = event;

        if (over && active.id) {
            // active.id es el lead.id. over.id es el nombre del stage destino
            const draggedLead = leads.find(l => l.id === active.id);
            if (draggedLead && draggedLead.stage !== over.id) {
                onMoveLead(active.id, over.id);
            }
        }
    };

    const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
                {stages.map((stage) => (
                    <KanbanColumn
                        key={stage.id}
                        stage={stage}
                        leads={leads.filter((l) => l.stage === stage.id)}
                        onLeadClick={onLeadClick}
                        onLeadDoubleClick={onLeadDoubleClick}
                        onDeleteLead={onDeleteLead}
                        onEditLead={onEditLead}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeLead ? (
                    <LeadCard lead={activeLead} onClick={() => { }} onDoubleClick={() => { }} onDelete={() => { }} onEdit={() => { }} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
