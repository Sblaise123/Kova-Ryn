'use client';

import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/lib/types';
import { ApiClient } from '@/lib/api';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';

interface ChatContainerProps {
  initialMessages?: Message[];
}

export default function ChatContainer({ initialMessages = [] }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const conversationIdRef = useRef<string>(uuidv4());

  const handleSend = async (content: string) => {
    const userMessage: Message = { id: uuidv4(), role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);

    try {
      // Stream assistant messages
      const allMessages = [...messages, userMessage];
      const assistantMessage: Message = { id: uuidv4(), role: 'assistant', content: '' };
      setMessages((prev) => [...prev, assistantMessage]);

      for await (const chunk of ApiClient.streamMessage(allMessages, conversationIdRef.current)) {
        if (chunk.error) throw new Error(chunk.error);

        if (chunk.content) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content += chunk.content;
            return updated;
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [...prev, { id: uuidv4(), role: 'assistant', content: 'Error: ' + err.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] bg-gray-900 rounded-lg p-4 space-y-4 overflow-y-auto">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
      ))}
      <MessageComposer onSend={handleSend} loading={isLoading} />
    </div>
  );
}
