const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas de Tareas
router.use(authMiddleware);

/**
 * @route GET /api/tasks
 * @desc Obtiene todas las tareas del usuario autenticado
 */
router.get('/', async (req, res) => {
    try {
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', req.user.id) // Filtrar por usuario
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
 * @desc Crea una nueva tarea vinculada al usuario autenticado
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
            priority: priority || 'medium',
            user_id: req.user.id // Vincular al usuario
        };

        const { data: insertedTask, error } = await supabase
            .from('tasks')
            .insert([newTaskData])
            .select()
            .single();

        if (error) throw error;

        const io = req.app.get('io');
        if (io) {
            io.to(`user:${req.user.id}`).emit('tasks:created', insertedTask);
        }

        res.status(201).json({ success: true, task: insertedTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error creating task' });
    }
});

/**
 * @route PUT /api/tasks/:id
 * @desc Actualiza una tarea asegurando pertenencia
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const { data: updatedTask, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.user.id) // Seguridad extra
            .select()
            .single();

        if (error) throw error;

        const io = req.app.get('io');
        if (io) {
            io.to(`user:${req.user.id}`).emit('tasks:updated', updatedTask);
        }

        res.json({ success: true, task: updatedTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error updating task' });
    }
});

/**
 * @route DELETE /api/tasks/:id
 * @desc Elimina permanentemente una tarea asegurando pertenencia
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id); // Seguridad extra

        if (error) throw error;

        const io = req.app.get('io');
        if (io) {
            io.to(`user:${req.user.id}`).emit('tasks:deleted', { id });
        }

        res.json({ success: true, message: 'Tarea eliminada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error deleting task' });
    }
});

module.exports = router;
