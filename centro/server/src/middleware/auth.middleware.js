const supabase = require('../config/supabase');

/**
 * Middleware para proteger rutas de la API verificando el token JWT de Supabase
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: true,
                message: 'No se proporcionó token de autenticación'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verificar el token con Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: true,
                message: 'Token inválido o expirado'
            });
        }

        // Adjuntar el usuario al request
        req.user = user;
        next();
    } catch (err) {
        console.error('[AUTH ERROR]', err);
        res.status(500).json({
            error: true,
            message: 'Error de servidor durante la autenticación'
        });
    }
};

module.exports = authMiddleware;
