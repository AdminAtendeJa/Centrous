const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../utils/supabaseAdmin');
const { contactUpsert } = require('../utils/contactUpsert');
const { groqEnrich } = require('../services/groqEnrich.service');
const webhookVerify = require('../middleware/webhookVerify');

/**
 * Public Webhook: WhatsApp (360dialog)
 * POST /integrations/whatsapp/:org_id
 */
router.post('/whatsapp/:org_id', webhookVerify('whatsapp_360dialog'), async (req, res) => {
  const { org_id } = req.params;
  const payload = req.body;

  try {
    // 1. Audit log
    await supabaseAdmin.from('integration_events').insert({
      organization_id: org_id,
      provider: 'whatsapp_360dialog',
      event_type: 'message.received',
      payload
    });

    const msg = payload.messages?.[0];
    if (!msg) return res.sendStatus(200);

    // 2. Contact Upsert
    const contact = await contactUpsert({
      org_id,
      phone: msg.from,
      name: payload.contacts?.[0]?.profile?.name || 'Lead WhatsApp',
      source_channel: 'whatsapp'
    });

    // 3. AI Enrichment (Background)
    const enriched = await groqEnrich(msg.text?.body, contact);

    // 4. Save Message
    await supabaseAdmin.from('messages').insert({
      organization_id: org_id,
      contact_id: contact.id,
      channel: 'whatsapp',
      direction: 'inbound',
      thread_id: msg.from,
      external_id: msg.id,
      body: msg.text?.body || '[Arquivo de Mídia]',
      ai_summary: enriched.summary,
      ai_suggested_reply: enriched.reply,
      metadata: { wa_msg_id: msg.id, timestamp: msg.timestamp }
    });

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ [WhatsApp Webhook] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Public Webhook: Stripe Payments
 * POST /integrations/stripe/:org_id
 */
router.post('/stripe/:org_id', webhookVerify('stripe'), async (req, res) => {
    const { org_id } = req.params;
    const event = req.body;

    try {
        await supabaseAdmin.from('integration_events').insert({
            organization_id: org_id,
            provider: 'stripe',
            event_type: event.type,
            payload: event
        });

        if (event.type === 'payment_intent.succeeded') {
            const payment = event.data.object;
            await supabaseAdmin.from('payment_events').insert({
                organization_id: org_id,
                provider: 'stripe',
                external_id: payment.id,
                type: 'payment_succeeded',
                amount_cents: payment.amount,
                currency: payment.currency.toUpperCase(),
                description: payment.description || 'Stripe Payment',
                metadata: payment.metadata
            });
        }

        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
