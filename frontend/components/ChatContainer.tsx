'use client';

import { useState, useRef } from 'react';
import { Message } from '@/lib/types';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import { ApiClient } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-1',
      role: 'assistant',
      content: 'Hi, my name is Kova. Ask me anything so I can help you.',
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationIdRef = useRef<string | null>(null);

  const handleSend = async (userContent: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: userContent,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Add placeholder for assistant typing effect
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Stream assistant response
      for await (const chunk of ApiClient.streamMessage([...messages, userMessage], conversationIdRef.current)) {
        if (chunk.error) throw new Error(chunk.error);

        if (chunk.content) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content += chunk.content;
            return updated;
          });
        }

        if (chunk.conversationId) {
          conversationIdRef.current = chunk.conversationId;
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Oops! Something went wrong. Please try again.',
          timestamp: Date.now(),
        },
      ]);
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
};

export default ChatContainer;