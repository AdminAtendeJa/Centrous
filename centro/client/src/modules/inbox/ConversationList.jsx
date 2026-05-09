import { useInboxStore } from './useInboxStore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Search } from 'lucide-react';

export default function ConversationList() {
  const { threads, openThread, activeThread, loading } = useInboxStore();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-3 border-bottom-v3">
        <div className="flex-between mb-3">
            <span className="section-title-v3">Inbox Unificado</span>
            <span className="text-10 text-accent font-bold cursor-pointer">Ver tudo</span>
        </div>
        <div className="search-trigger-v3 w-full">
            <Search size={12} />
            <input type="text" placeholder="Buscar conversas..." className="bg-transparent border-none outline-none text-10 ml-2 w-full" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && threads.length === 0 ? (
            <div className="p-8 text-center text-tertiary text-10">Carregando mensagens...</div>
        ) : threads.length > 0 ? (
            threads.map(thread => (
                <div 
                    key={thread.thread_id}
                    className={`inbox-item-v3 ${activeThread === thread.thread_id ? 'active' : ''}`}
                    onClick={() => openThread(thread.thread_id)}
                    style={{ padding: '8px 12px', gap: '10px' }}
                >
                    <div className="msg-ava-v3" style={{width: '28px', height: '28px', fontSize: '10px', background: 'var(--color-accent)', color: '#fff'}}>
                        {thread.contacts?.name?.substring(0, 2).toUpperCase() || 'LW'}
                    </div>
                    <div className="inbox-item-info-v3">
                        <div className="flex-between mb-0.5">
                            <span className="text-11 font-bold text-primary truncate pr-2">{thread.contacts?.name || 'Lead WhatsApp'}</span>
                            <span className="text-9 text-tertiary shrink-0">
                                {formatDistanceToNow(new Date(thread.created_at), { locale: ptBR })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-9 text-secondary truncate">{thread.body}</span>
                        </div>
                    </div>
                    {thread.status === 'received' && <div className="inbox-unread-v3" style={{ width: '5px', height: '5px', background: 'var(--color-accent)' }} />}
                </div>
            ))
        ) : (
            <div className="p-8 text-center text-tertiary text-10">Nenhuma conversa.</div>
        )}
      </div>
    </div>
  );
}
