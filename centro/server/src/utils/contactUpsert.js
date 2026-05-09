const { supabaseAdmin } = require('./supabaseAdmin');

/**
 * Deduplicates contacts based on phone OR email.
 * Updates existing contact with missing info.
 */
async function contactUpsert({ org_id, phone, email, name, source_channel }) {
  try {
    const query = supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('organization_id', org_id);

    if (phone) {
      query.eq('phone', phone);
    } else if (email) {
      query.eq('email', email);
    } else {
      throw new Error('Phone or email required for contact upsert');
    }

    const { data: existing, error: fetchError } = await query.maybeSingle();
    if (fetchError) throw fetchError;

    if (existing) {
      // Update missing fields
      const updates = {};
      if (!existing.name && name) updates.name = name;
      if (!existing.email && email) updates.email = email;
      if (!existing.phone && phone) updates.phone = phone;
      
      if (Object.keys(updates).length > 0) {
        await supabaseAdmin
          .from('contacts')
          .update(updates)
          .eq('id', existing.id);
      }
      return existing;
    }

    // Create new contact
    const { data: newContact, error: insertError } = await supabaseAdmin
      .from('contacts')
      .insert({ organization_id: org_id, phone, email, name, source_channel })
      .select()
      .single();

    if (insertError) throw insertError;
    return newContact;
  } catch (error) {
    console.error('❌ [contactUpsert] Error:', error.message);
    throw error;
  }
}

module.exports = { contactUpsert };
