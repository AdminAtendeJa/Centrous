import { create } from 'zustand';
import { supabase } from '../../config/supabase';

export const useInboxStore = create((set, get) => ({
  threads: [],
  activeThread: null,
  messages: [],
  unreadCount: 0,
  loading: false,

  fetchThreads: async () => {
    set({ loading: true });
    try {
        const { data, error } = await supabase
            .from('messages')
            .select(`
                thread_id,
                channel,
                body,
                created_at,
                status,
                contacts (id, name, phone, email)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Deduplicate threads (keep latest message)
        const threadsMap = {};
        data?.forEach(msg => {
            if (!threadsMap[msg.thread_id]) threadsMap[msg.thread_id] = msg;
        });
        
        const threads = Object.values(threadsMap);
        const unreadCount = threads.filter(t => t.status === 'received').length;
        
        set({ threads, unreadCount, loading: false });
    } catch (err) {
        console.error('Error fetching threads:', err);
        set({ loading: false });
    }
  },

  openThread: async (thread_id) => {
    set({ activeThread: thread_id, loading: true });
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*, contacts (name, phone)')
            .eq('thread_id', thread_id)
            .order('created_at', { ascending: true });

        if (error) throw error;
        set({ messages: data || [], loading: false });

        // Mark as read
        await supabase
            .from('messages')
            .update({ status: 'read' })
            .eq('thread_id', thread_id)
            .eq('status', 'received');
    } catch (err) {
        console.error('Error opening thread:', err);
        set({ loading: false });
    }
  },

  sendReply: async ({ thread_id, channel, contact_id, body }) => {
    try {
        // 1. Save outbound message
        const { error: dbError } = await supabase.from('messages').insert({
            thread_id, channel, contact_id, direction: 'outbound',
            body, status: 'replied'
        });

        if (dbError) throw dbError;

        // 2. Call backend to send via provider
        await fetch(`/api/send/${channel}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thread_id, body, contact_id })
        });

        get().openThread(thread_id);
    } catch (err) {
        console.error('Error sending reply:', err);
    }
  },

  subscribeRealtime: () => {
    const channel = supabase
      .channel('inbox-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMsg = payload.new;
        if (newMsg.thread_id === get().activeThread) {
            set(state => ({ messages: [...state.messages, newMsg] }));
        }
        get().fetchThreads();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
}));
