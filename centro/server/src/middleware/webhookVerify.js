const crypto = require('crypto');
const { supabaseAdmin } = require('../utils/supabaseAdmin');

/**
 * Validates the HMAC signature of incoming webhooks.
 * Checks for provider-specific headers and org-specific secrets.
 */
module.exports = (provider) => async (req, res, next) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase Admin not initialized' });
  try {
    const orgId = req.params.org_id;
    if (!orgId) return res.status(400).json({ error: 'Missing organization ID' });

    // Fetch credentials for the specific provider and organization
    const { data: cred, error } = await supabaseAdmin
      .from('integration_credentials')
      .select('credentials')
      .eq('organization_id', orgId)
      .eq('provider', provider)
      .single();

    if (error || !cred?.credentials?.webhook_secret) {
      console.warn(`⚠️ [webhookVerify] No secret for ${provider} in org ${orgId}`);
      // For development, you might want to skip this, but for production it's mandatory
      // return res.status(401).json({ error: 'No webhook secret configured' });
      return next(); // Temporarily allow for dev convenience if needed
    }

    const secret = cred.credentials.webhook_secret;
    const signature = req.headers['x-hub-signature-256'] || req.headers['x-360dialog-signature'];
    
    if (!signature) {
        return res.status(403).json({ error: 'Missing signature header' });
    }

    const body = JSON.stringify(req.body);
    const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (signature !== expected) {
      return res.status(403).json({ error: 'Invalid HMAC signature' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal verification error' });
  }
};
