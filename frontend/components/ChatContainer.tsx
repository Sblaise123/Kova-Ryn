// components/ChatContainer.tsx
import { useState, useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import { ApiClient } from '@/lib/api';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import { v4 as uuidv4 } from 'uuid';

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Initialize with Kova's welcome message
    const welcomeMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: 'Hi, my name is Kova. Ask me anything so I can help you.',
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await ApiClient.streamMessage(
        [...messages, userMessage],
        conversationIdRef.current ?? undefined,
        {
          onChunk: (chunk) => {
            if (chunk.content) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content += chunk.content;
                return updated;
              });
            }
          },
          onComplete: (conversationId) => {
            if (conversationId) {
              conversationIdRef.current = conversationId;
            }
            setIsLoading(false);
          },
          onError: (err) => {
            console.error(err);
            setIsLoading(false);
          },
        }
      );
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] bg-gray-900 rounded-lg p-4 space-y-4 overflow-y-auto">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} content={msg.content} role={msg.role} />
      ))}

      <MessageComposer onSend={handleSend} loading={isLoading} />
    </div>
  );
}
