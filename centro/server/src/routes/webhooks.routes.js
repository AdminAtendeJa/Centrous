const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// GET /api/webhooks/messages
// Obtiene el historial de la Bandeja Unificada
router.get('/messages', async (req, res) => {
    try {
        const { data: messages, error } = await supabase
            .from('lead_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, messages });
    } catch (error) {
        console.error('[MESSAGES FETCH ERROR]', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/webhooks/messages
// Recibe mensajes entrantes desde n8n o Evolution API
router.post('/messages', async (req, res) => {
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

        // Insert in Supabase
        const dbPayload = {
            lead_id: leadId || null,
            sender_name: senderName || 'Desconocido',
            text: text || '',
            type: channel || 'whatsapp',
            direction: 'received',
            time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
        };

        const { data: insertedMsg, error } = await supabase
            .from('lead_messages')
            .insert([dbPayload])
            .select()
            .single();

        if (error) throw error;

        // Emitir a todos los clientes web (El CRM y la Bandeja)
        io.emit('chat:message', insertedMsg);
        console.log(`📨 Webhook/Supabase recibido de ${channel}: ${text.substring(0, 30)}...`);

        res.status(200).json({ success: true, message: 'Evento guardado y emitido al CRM' });
    } catch (error) {
        console.error('[WEBHOOK ERROR]', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
