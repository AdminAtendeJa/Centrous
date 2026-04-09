const express = require('express');

const router = express.Router();

/**
 * @route GET /api/integrations/google/auth
 * @desc Inicia el flujo OAuth2 de Google (Gmail/Calendar)
 */
router.get('/google/auth', (req, res) => {
    // Aquí se configuraría la redrección a Google usando google-auth-library
    // Para simplificar, devolvemos un JSON de éxito simulando que el popup del frontend cerrará exitosamente.
    const clientId = req.query.clientId || 'default';

    // Simulación: en producción haríamos res.redirect(googleAuthUrl);
    // Devuelve un HTML que cierra el popup para que el usuario sepa que fue exitoso en esta demo.
    res.send(`
        <html>
            <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                <h2 style="color: #4ade80;">Google Authenticated successfully!</h2>
                <p>You can close this window now.</p>
                <script>
                    setTimeout(() => window.close(), 3000);
                </script>
            </body>
        </html>
    `);
});

/**
 * @route GET /api/integrations/google/callback
 * @desc Callback OAuth2 de Google
 */
router.get('/google/callback', (req, res) => {
    const { code } = req.query;
    res.json({ success: true, message: "Token negotiated via code: " + code });
});

/**
 * @route GET /api/integrations/meta/auth
 * @desc Inicia el flujo de Meta (Facebook Login for Business / WhatsApp / IG)
 */
router.get('/meta/auth', (req, res) => {
    const appId = req.query.appId || 'default';
    // Mismo mock pero para Facebook
    res.send(`
        <html>
            <body style="font-family: sans-serif; text-align: center; margin-top: 50px; background: #1877F2; color: #fff">
                <h2>Meta / Facebook Authenticated!</h2>
                <p>Window will close automatically.</p>
                <script>
                    setTimeout(() => window.close(), 3000);
                </script>
            </body>
        </html>
    `);
});

/**
 * @route GET /api/integrations/meta/callback
 * @desc Callback OAuth2 de Meta
 */
router.get('/meta/callback', (req, res) => {
    res.json({ success: true, meta: 'Connected' });
});

module.exports = router;
