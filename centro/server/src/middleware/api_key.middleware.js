const supabase = require('../config/supabase');
const crypto = require('crypto');

/**
 * Middleware para proteger rutas de la API usando Secret API Keys.
 * Usado por integraciones externas (n8n, Zapier).
 */
const apiKeyMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: true,
                message: 'No API Key provided. Expected format: Bearer <cntr_sk_...>'
            });
        }

        const token = authHeader.split(' ')[1];
        
        // El token viene crudo desde el cliente (ej. cntr_sk_948f2...).
        // En la base de datos lo guardamos hasheado (sha256) por seguridad.
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const { data: apiKeyData, error } = await supabase
            .from('api_keys')
            .select('user_id, id')
            .eq('token_hash', tokenHash)
            .single();

        if (error || !apiKeyData) {
            return res.status(401).json({
                error: true,
                message: 'Invalid or revoked API Key.'
            });
        }

        // Actualizamos "last_used_at" asincronamente sin bloquear la petición
        supabase.from('api_keys')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', apiKeyData.id)
            .then(() => {})
            .catch(e => console.error('Failed to update last_used_at for api key', e));

        // Para mantener compatibilidad con las otras rutas, 
        // simulamos que req.user es el dueño de la API Key.
        req.user = { id: apiKeyData.user_id };
        req.isApiKey = true; // Flag para saber que viene de una integración externa
        
        next();
    } catch (err) {
        console.error('[API KEY ERROR]', err);
        res.status(500).json({
            error: true,
            message: 'Server error during API Key authentication'
        });
    }
};

module.exports = apiKeyMiddleware;
