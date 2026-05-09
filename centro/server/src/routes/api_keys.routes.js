const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const supabase = require('../config/supabase');
const crypto = require('crypto');

router.use(authMiddleware);

// Generar una nueva API Key
router.post('/keys', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        // Generar un token seguro estilo Stripe/Notion
        const rawToken = 'cntr_sk_' + crypto.randomBytes(24).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        const newKey = {
            user_id: req.user.id,
            name,
            token_hash: tokenHash
        };

        const { data, error } = await supabase
            .from('api_keys')
            .insert(newKey)
            .select()
            .single();

        if (error) throw error;

        // Solo retornamos el rawToken UNA VEZ
        res.status(201).json({ 
            success: true, 
            data: {
                id: data.id,
                name: data.name,
                created_at: data.created_at,
                token: rawToken // THE SECRET
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Listar API Keys (ocultando el token real)
router.get('/keys', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('api_keys')
            .select('id, name, created_at, last_used_at')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Borrar API Key
router.delete('/keys/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('api_keys')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- Webhooks ---

router.post('/webhooks', async (req, res) => {
    try {
        const { url, event } = req.body;
        if (!url || !event) return res.status(400).json({ success: false, message: 'URL and Event required' });

        const { data, error } = await supabase
            .from('webhooks')
            .insert({ user_id: req.user.id, url, event })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/webhooks', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('webhooks')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/webhooks/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('webhooks')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
