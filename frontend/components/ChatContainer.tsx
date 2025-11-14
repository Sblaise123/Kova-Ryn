import { useState, useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import ApiClient from '@/lib/api'; // default export
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import { v4 as uuidv4 } from 'uuid';

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const conversationId = useRef<string>(uuidv4());

  const handleSend = async (text: string) => {
    const userMessage: Message = { role: 'user', content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const assistantMessage: Message = { role: 'assistant', content: '', timestamp: Date.now() };
      setMessages((prev) => [...prev, assistantMessage]);

      for await (const chunk of ApiClient.streamMessage([...messages, userMessage], conversationId.current)) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content += chunk.content || '';
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
      </div>
      <MessageComposer onSend={handleSend} disabled={loading} />
    </div>
  );
}
