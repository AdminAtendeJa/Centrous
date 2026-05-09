import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { INTEGRATION_CATALOG } from './integrations.config';
import { useIntegrationsStore } from './useIntegrationsStore';
import { supabase } from '../../config/supabase';

export default function ConnectModal() {
  const { selectedProvider, closeModal, fetchIntegrations } = useIntegrationsStore();
  const integration = INTEGRATION_CATALOG.find(i => i.provider === selectedProvider);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const credentials = {};
      const metadata = {};
      integration.fields?.forEach(f => {
        if (f.isMetadata) metadata[f.key] = form[f.key];
        else credentials[f.key] = form[f.key];
      });

      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/integrations-config', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ provider: selectedProvider, credentials, metadata })
      });

      if (!res.ok) throw new Error('Falha ao salvar integração');
      
      await fetchIntegrations();
      closeModal();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay-v3" style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'}}>
      <motion.div
        className="card-v3"
        style={{width: 400, background: '#fff'}}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex-between mb-6">
          <h3 className="section-title-v3">Conectar {integration?.name}</h3>
          <button className="btn-icon-v3" onClick={closeModal}><X size={16} /></button>
        </div>

        <div className="space-y-4 mb-6">
          {integration?.fields?.map(field => (
            <div key={field.key} className="config-field-v3">
              <label>{field.label}</label>
              <div className="config-input-v3">
                <input
                    type={field.type || 'text'}
                    placeholder={field.placeholder || ''}
                    value={form[field.key] || ''}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                />
              </div>
            </div>
          ))}

          {error && <p className="text-xs text-danger">{error}</p>}
        </div>

        <div className="flex gap-2 justify-end">
          <button className="btn-v3-secondary" onClick={closeModal}>Cancelar</button>
          <button
            className="btn-v3-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar Conexão'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
