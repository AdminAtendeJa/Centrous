const express = require('express');
const router = express.Router();

// POST /api/webhooks/messages
// Recibe mensajes entrantes desde n8n o Evolution API
router.post('/messages', (req, res) => {
    try {
        const { leadId, channel, senderName, text, company } = req.body;

        // Obtener la instancia de socket.io del ecosistema de express
        const io = req.app.get('io');

        // Construir el payload de mensaje para el CRM del Frontend
        const messagePayload = {
            id: Date.now().toString(),
            leadId: leadId || null,
            sender: 'lead',
            text: text || '',
            channel: channel || 'WhatsApp',
            senderName: senderName || 'Desconocido',
            company: company,
            time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
        };

        // Emitir a todos los clientes web (El CRM de Centro)
        io.emit('chat:message', messagePayload);
        console.log(`📨 Webhook recibido de ${channel}: ${messagePayload.text.substring(0, 30)}...`);

        res.status(200).json({ success: true, message: 'Evento emitido al CRM mediante WebSocket' });
    } catch (error) {
        console.error('[WEBHOOK ERROR]', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
