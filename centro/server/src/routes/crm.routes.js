const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas de CRM
router.use(authMiddleware);

/**
 * @route GET /api/crm/leads
 * @desc Obtiene los leads del usuario autenticado
 */
router.get('/leads', async (req, res) => {
    try {
        const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
            .eq('user_id', req.user.id) // Filtrar por usuario
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, leads });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching leads' });
    }
});

/**
 * @route POST /api/crm/leads
 * @desc Crea un nuevo lead vinculado al usuario autenticado
 */
router.post('/leads', async (req, res) => {
    const { name, company, value, stage, channel, notes } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    }

    try {
        const newLeadData = {
            name,
            company: company || '',
            value: value || 0,
            stage: stage || 'new',
            channel: channel || 'API',
            notes: notes || '',
            user_id: req.user.id // Vincular al usuario
        };

        const { data: insertedLead, error } = await supabase
            .from('leads')
            .insert([newLeadData])
            .select()
            .single();

        if (error) throw error;

        // Emitimos al frontend solo al usuario correspondiente
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${req.user.id}`).emit('crm:lead_created', insertedLead);
        }

        res.status(201).json({ success: true, lead: insertedLead });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error creating lead' });
    }
});

/**
 * @route PUT /api/crm/leads/:id
 * @desc Actualiza un lead (asegurando pertenencia)
 */
router.put('/leads/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const { data: updatedLead, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.user.id) // Seguridad extra
            .select()
            .single();

        if (error) throw error;

        const io = req.app.get('io');
        if (io) {
            io.to(`user:${req.user.id}`).emit('crm:lead_updated', updatedLead);
        }

        res.json({ success: true, lead: updatedLead });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error updating lead' });
    }
});

/**
 * @route DELETE /api/crm/leads/:id
 * @desc Elimina un lead (asegurando pertenencia)
 */
router.delete('/leads/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id); // Seguridad extra

        if (error) throw error;

        const io = req.app.get('io');
        if (io) {
            io.to(`user:${req.user.id}`).emit('crm:lead_deleted', { id });
        }

        res.json({ success: true, message: 'Lead eliminado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error deleting lead' });
    }
});

module.exports = router;
