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

    // Add placeholder assistant message
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Use the callback-based stream
      ApiClient.streamMessage([...messages, userMessage], conversationIdRef.current, {
        onChunk: (chunk) => {
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
        },
        onError: (err) => {
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
        },
        onComplete: () => {
          setIsLoading(false);
        },
      });
    } catch (err) {
      console.error(err);
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
