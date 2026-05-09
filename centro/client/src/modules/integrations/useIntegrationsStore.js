import { create } from 'zustand';
import { supabase } from '../../config/supabase'; // Adjust path if needed

export const useIntegrationsStore = create((set, get) => ({
  integrations: [],
  loading: false,
  modalOpen: false,
  selectedProvider: null,

  fetchIntegrations: async () => {
    set({ loading: true });
    try {
        const { data, error } = await supabase
            .from('integration_credentials')
            .select('id, provider, is_active, connected_at, last_sync_at, metadata');
        
        if (error) throw error;
        set({ integrations: data || [], loading: false });
    } catch (err) {
        console.error('Error fetching integrations:', err);
        set({ loading: false });
    }
  },

  openModal: (provider) => set({ modalOpen: true, selectedProvider: provider }),
  closeModal: () => set({ modalOpen: false, selectedProvider: null }),

  toggleActive: async (id, current) => {
    try {
        const { error } = await supabase
            .from('integration_credentials')
            .update({ is_active: !current })
            .eq('id', id);
        
        if (error) throw error;
        get().fetchIntegrations();
    } catch (err) {
        console.error('Error toggling integration:', err);
    }
  },

  disconnect: async (id) => {
    try {
        const { error } = await supabase
            .from('integration_credentials')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        get().fetchIntegrations();
    } catch (err) {
        console.error('Error disconnecting integration:', err);
    }
  }
}));
