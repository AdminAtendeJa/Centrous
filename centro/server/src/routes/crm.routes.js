const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

/**
 * @route GET /api/crm/leads
 * @desc Obtiene todos los leads usando Supabase
 */
router.get('/leads', async (req, res) => {
    try {
        const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
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
 * @desc Crea un nuevo lead (Endpoint para webhooks) y lo guarda en Supabase
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
            notes: notes || ''
        };

        const { data: insertedLead, error } = await supabase
            .from('leads')
            .insert([newLeadData])
            .select()
            .single();

        if (error) throw error;

        // Emitimos al frontend
        const io = req.app.get('io');
        if (io) {
            io.emit('crm:lead_created', insertedLead);
        }

        res.status(201).json({ success: true, lead: insertedLead });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error creating lead' });
    }
});

/**
 * @route PUT /api/crm/leads/:id
 * @desc Actualiza un lead en Supabase
 */
router.put('/leads/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const { data: updatedLead, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        const io = req.app.get('io');
        if (io) {
            io.emit('crm:lead_updated', updatedLead);
        }

        res.json({ success: true, lead: updatedLead });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error updating lead' });
    }
});

/**
 * @route DELETE /api/crm/leads/:id
 * @desc Elimina un lead en Supabase
 */
router.delete('/leads/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) throw error;

        const io = req.app.get('io');
        if (io) {
            io.emit('crm:lead_deleted', { id });
        }

        res.json({ success: true, message: 'Lead eliminado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error deleting lead' });
    }
});

module.exports = router;
