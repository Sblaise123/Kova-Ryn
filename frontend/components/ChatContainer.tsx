'use client';

import { useState, useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import { ApiClient } from '@/lib/api';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import { v4 as uuidv4 } from 'uuid';

interface ChatContainerProps {
  conversationId?: string;
}

export default function ChatContainer({ conversationId }: ChatContainerProps) {
  const api = useRef(new ApiClient()).current;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    try {
      // STREAMING: Async iterator version
      for await (const chunk of api.streamChat([...messages, userMessage], conversationId)) {
        if (chunk.error) {
          console.error('Stream error:', chunk.error);
          continue;
        }

        setMessages((prev) => {
          // Merge chunks into last assistant message
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: lastMsg.content + chunk.content },
            ];
          } else {
            return [...prev, { role: 'assistant', content: chunk.content }];
          }
        });
      }
    } catch (err: any) {
      console.error('Chat failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 rounded-xl overflow-hidden shadow-lg">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        {loading && (
          <div className="text-sm text-gray-400 animate-pulse">
            Assistant is typing...
          </div>
        )}
      </div>

      <div className="border-t border-gray-700 p-4">
        <MessageComposer onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
