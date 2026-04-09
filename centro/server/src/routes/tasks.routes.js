const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

/**
 * @route GET /api/tasks
 * @desc Obtiene todas las tareas de la base de datos Supabase
 */
router.get('/', async (req, res) => {
    try {
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, tasks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching tasks' });
    }
});

/**
 * @route POST /api/tasks
 * @desc Crea una nueva tarea en Supabase
 */
router.post('/', async (req, res) => {
    const { text, priority } = req.body;

    if (!text) {
        return res.status(400).json({ success: false, message: 'El texto es requerido' });
    }

    try {
        const newTaskData = {
            text,
            done: false,
            priority: priority || 'medium'
        };

        const { data: insertedTask, error } = await supabase
            .from('tasks')
            .insert([newTaskData])
            .select()
            .single();

        if (error) throw error;

        const io = req.app.get('io');
        if (io) {
            io.emit('tasks:created', insertedTask);
        }

        res.status(201).json({ success: true, task: insertedTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error creating task' });
    }
});

/**
 * @route PUT /api/tasks/:id
 * @desc Actualiza una tarea temporal (done/undone, priority, etc)
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const { data: updatedTask, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        const io = req.app.get('io');
        if (io) {
            io.emit('tasks:updated', updatedTask);
        }

        res.json({ success: true, task: updatedTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error updating task' });
    }
});

/**
 * @route DELETE /api/tasks/:id
 * @desc Elimina permanentemente una tarea en Supabase
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;

        const io = req.app.get('io');
        if (io) {
            io.emit('tasks:deleted', { id });
        }

        res.json({ success: true, message: 'Tarea eliminada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error deleting task' });
    }
});

module.exports = router;
