import { useInboxStore } from './useInboxStore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Search } from 'lucide-react';

export default function ConversationList() {
  const { threads, openThread, activeThread, loading } = useInboxStore();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-bottom-v3">
        <div className="flex-between mb-4">
            <span className="section-title-v3">Inbox Unificado</span>
            <div className="view-badge-v3">REALTIME</div>
        </div>
        <div className="search-trigger-v3 w-full">
            <Search size={14} />
            <input type="text" placeholder="Buscar conversas..." className="bg-transparent border-none outline-none text-[11px] ml-2 w-full" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && threads.length === 0 ? (
            <div className="p-8 text-center text-tertiary text-xs">Carregando mensagens...</div>
        ) : threads.length > 0 ? (
            threads.map(thread => (
                <div 
                    key={thread.thread_id}
                    className={`inbox-item-v3 ${activeThread === thread.thread_id ? 'active' : ''}`}
                    onClick={() => openThread(thread.thread_id)}
                >
                    <div className="msg-ava-v3" style={{background: 'var(--color-background-tertiary)', color: 'var(--color-text-primary)'}}>
                        {thread.contacts?.name?.substring(0, 2).toUpperCase() || 'LW'}
                    </div>
                    <div className="inbox-item-info-v3">
                        <div className="flex-between mb-1">
                            <span className="inbox-item-name-v3 truncate pr-2">{thread.contacts?.name || 'Lead WhatsApp'}</span>
                            <span className="inbox-item-time-v3 shrink-0">
                                {formatDistanceToNow(new Date(thread.created_at), { locale: ptBR })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase ${thread.channel === 'whatsapp' ? 'text-green-600' : 'text-blue-600'}`}>
                                {thread.channel}
                            </span>
                            <span className="inbox-item-msg-v3">{thread.body}</span>
                        </div>
                    </div>
                    {thread.status === 'received' && <div className="inbox-unread-v3" />}
                </div>
            ))
        ) : (
            <div className="p-8 text-center text-tertiary text-xs">Nenhuma conversa encontrada.</div>
        )}
      </div>
    </div>
  );
}
