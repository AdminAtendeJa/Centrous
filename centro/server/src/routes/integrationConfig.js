const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../utils/supabaseAdmin');
const orgContext = require('../middleware/orgContext');

/**
 * List all configured integrations for the org
 */
router.get('/', orgContext, async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase Admin not initialized' });
  const { data, error } = await supabaseAdmin
    .from('integration_credentials')
    .select('id, provider, is_active, connected_at, last_sync_at, metadata')
    .eq('organization_id', req.org_id);

  if (error) return res.status(500).json({ error });
  res.json(data);
});

/**
 * Add or update integration credentials
 */
router.post('/', orgContext, async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase Admin not initialized' });
  const { provider, credentials, metadata } = req.body;
  const organization_id = req.org_id;

  const { data, error } = await supabaseAdmin
    .from('integration_credentials')
    .upsert({
      organization_id,
      provider,
      credentials,
      metadata,
      connected_at: new Date().toISOString()
    }, { onConflict: 'organization_id,provider' })
    .select()
    .single();

  if (error) return res.status(500).json({ error });
  res.json({ success: true, integration: { id: data.id, provider, metadata } });
});

/**
 * Toggle integration status (active/paused)
 */
router.put('/:id/toggle', orgContext, async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    const { error } = await supabaseAdmin
        .from('integration_credentials')
        .update({ is_active })
        .eq('id', id)
        .eq('organization_id', req.org_id);

    if (error) return res.status(500).json({ error });
    res.json({ success: true });
});

/**
 * Delete / Disconnect integration
 */
router.delete('/:id', orgContext, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('integration_credentials')
    .delete()
    .eq('id', id)
    .eq('organization_id', req.org_id);

  if (error) return res.status(500).json({ error });
  res.json({ success: true });
});

module.exports = router;
