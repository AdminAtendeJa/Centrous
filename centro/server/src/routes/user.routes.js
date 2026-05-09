const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route GET /api/user/profile
 * @desc Obtiene el perfil del usuario autenticado
 */
router.get('/profile', async (req, res) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 es "no rows found"

        res.json({ success: true, profile: profile || null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
});

/**
 * @route POST /api/user/profile
 * @desc Crea o actualiza el perfil del usuario (Auto-sync)
 */
router.post('/profile', async (req, res) => {
    const profileData = req.body;
    
    try {
        const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .upsert({ 
                id: req.user.id,
                ...profileData,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, profile: updatedProfile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error syncing profile' });
    }
});

module.exports = router;
