import { useState, useRef } from 'react';
import { Message } from '@/lib/types';
import { ApiClient } from '@/lib/api';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import { v4 as uuidv4 } from 'uuid';

interface ChatContainerProps {}

const ChatContainer: React.FC<ChatContainerProps> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationIdRef = useRef<string>(uuidv4());

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { id: uuidv4(), role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const allMessages = [...messages, userMessage];

    // Create assistant placeholder
    const assistantMessage: Message = { id: uuidv4(), role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Streaming using callbacks
      ApiClient.streamMessage(
        allMessages,
        conversationIdRef.current,
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            // Update last message (assistant)
            updated[updated.length - 1].content += chunk.content || '';
            return updated;
          });
        },
        (err) => {
          console.error('Stream error:', err);
        },
        () => {
          setIsLoading(false);
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
};

export default ChatContainer;
