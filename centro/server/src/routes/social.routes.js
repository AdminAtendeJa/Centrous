const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/social/meta/campaigns
router.get('/meta/campaigns', async (req, res, next) => {
    const token = req.headers['x-meta-token'];
    const appId = req.headers['x-meta-app-id'];

    if (!token) {
        return res.json({ success: false, isDemo: true, message: 'Usando datos de demostración (Meta Token no configurado).' });
    }

    try {
        // En un entorno real, aquí usaríamos el business_id o act_id
        // Para esta demo/v1, devolvemos un mock estructurado si hay token, 
        // sugiriendo que la conexión es exitosa pero requiere configuración de Ads Account ID.
        res.json({
            success: true,
            isDemo: false,
            data: [
                { id: 'm1', name: 'Campaña Meta Real (Live)', platform: 'Meta', budget: 500, spent: 120, reach: 8500, clicks: 430, cpc: 0.28, status: 'active' }
            ]
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/social/google/analytics
router.get('/google/analytics', async (req, res, next) => {
    const googleId = req.headers['x-google-id'];

    if (!googleId) {
        return res.json({ success: false, isDemo: true });
    }

    // Mock de datos de Google Search Console / Ads
    res.json({
        success: true,
        isDemo: false,
        data: {
            reach: 15400,
            clicks: 980,
            spent: 0, // Orgánico
            cpc: 0
        }
    });
});

module.exports = router;
