const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Middleware de auth asume que req.user está presente
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Get memory
router.get('/', async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('ai_brain_memories')
            .select('*')
            .eq('user_id', req.user.id)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found

        res.json({ success: true, memory: data || { preferences: {}, history: [] } });
    } catch (err) {
        next(err);
    }
});

// Update memory (telemetry and role)
router.post('/', async (req, res, next) => {
    try {
        const { role, preferences, history_entry } = req.body;

        // Check if exists
        const { data: existing } = await supabase
            .from('ai_brain_memories')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        let newHistory = existing?.history || [];
        if (history_entry) {
            newHistory = [history_entry, ...newHistory].slice(0, 50);
        }

        if (existing) {
            const { data, error } = await supabase
                .from('ai_brain_memories')
                .update({ 
                    role: role || existing.role, 
                    preferences: { ...existing.preferences, ...preferences },
                    history: newHistory,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            res.json({ success: true, memory: data });
        } else {
            const { data, error } = await supabase
                .from('ai_brain_memories')
                .insert({ 
                    user_id: req.user.id,
                    role: role,
                    preferences: preferences || {},
                    history: history_entry ? [history_entry] : []
                })
                .select()
                .single();
            if (error) throw error;
            res.json({ success: true, memory: data });
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
