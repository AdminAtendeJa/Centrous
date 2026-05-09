import { useState } from 'react';
import { ArrowLeft, Send, Sparkles, User, MessageSquare } from 'lucide-react';
import { useInboxStore } from './useInboxStore';

export default function ConversationView() {
  const { messages, activeThread, sendReply } = useInboxStore();
  const [reply, setReply] = useState('');
  
  const lastMsg = messages[messages.length - 1];
  const aiSuggestion = lastMsg?.ai_suggested_reply;

  const handleSend = () => {
    if (!reply.trim()) return;
    sendReply({
      thread_id: activeThread,
      channel: lastMsg.channel,
      contact_id: lastMsg.contact_id,
      body: reply
    });
    setReply('');
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in">
      {/* Header */}
      <div className="p-4 border-bottom-v3 flex items-center gap-3">
        <button 
            className="btn-icon-v3" 
            onClick={() => useInboxStore.setState({ activeThread: null })}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate">{lastMsg?.contacts?.name || 'Lead WhatsApp'}</p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[9px] text-tertiary uppercase font-bold tracking-wider">{lastMsg?.channel}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.direction === 'outbound' ? 'items-end' : 'items-start'}`}>
            <div className={`msg-bubble-v3 ${msg.direction === 'outbound' ? 'sent' : 'received'}`} style={{maxWidth: '85%'}}>
              <p className="text-xs leading-relaxed">{msg.body}</p>
              <span className="text-[9px] opacity-50 mt-1 block text-right">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Reply */}
      <div className="p-3 border-top-v3 bg-gray-50">
        {aiSuggestion && (
          <div 
            className="ai-suggestion-v3 mb-3" 
            onClick={() => setReply(aiSuggestion)}
          >
            <Sparkles size={12} className="shrink-0" />
            <span className="text-[10px] leading-tight italic line-clamp-2">{aiSuggestion}</span>
          </div>
        )}
        
        <div className="relative">
          <textarea
            className="w-full bg-white border-0.5px solid border-gray-200 rounded-md p-3 text-xs focus:ring-1 focus:ring-accent outline-none resize-none"
            placeholder="Responder..."
            rows={3}
            value={reply}
            onChange={e => setReply(e.target.value)}
          />
          <button 
            className="absolute bottom-3 right-3 btn-v3-primary p-2 h-auto"
            onClick={handleSend}
            disabled={!reply.trim()}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
