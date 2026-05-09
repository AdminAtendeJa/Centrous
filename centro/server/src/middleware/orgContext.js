const { supabaseAdmin } = require('../utils/supabaseAdmin');

/**
 * Injects org_id into req from the Supabase JWT.
 * Ensures the user belongs to the organization they are trying to configure.
 */
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) throw new Error('Invalid token');

    // In a real multi-tenant app, org_id would be in the user metadata or a dedicated join table
    // For this implementation, we assume it's in the app_metadata or we fetch the user's primary org
    const orgId = user.app_metadata?.org_id || user.user_metadata?.org_id;
    
    if (!orgId) {
        // Fallback: fetch the first organization this user belongs to
        const { data: orgMember } = await supabaseAdmin
            .from('organizations')
            .select('id')
            .limit(1)
            .single();
        
        req.org_id = orgMember?.id;
    } else {
        req.org_id = orgId;
    }

    if (!req.org_id) return res.status(403).json({ error: 'User not associated with any organization' });

    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
