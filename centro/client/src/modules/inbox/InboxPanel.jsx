import { useEffect } from 'react';
import { useInboxStore } from './useInboxStore';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';

export default function InboxPanel() {
  const { fetchThreads, subscribeRealtime, activeThread } = useInboxStore();

  useEffect(() => {
    fetchThreads();
    const unsubscribe = subscribeRealtime();
    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {activeThread ? <ConversationView /> : <ConversationList />}
    </div>
  );
}
