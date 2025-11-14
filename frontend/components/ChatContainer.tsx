'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/lib/types';
import { api } from '@/lib/api';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import LoadingDots from './LoadingDots';

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const allMessages = [...messages, userMessage];
      let assistantContent = '';
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      for await (const chunk of api.streamMessage(allMessages, conversationId)) {
        if (chunk.error) {
          throw new Error(chunk.error);
        }

        if (chunk.chunk) {
          assistantContent += chunk.chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: assistantContent,
            };
            return updated;
          });
        }

        if (chunk.done && chunk.conversationId) {
          setConversationId(chunk.conversationId);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              isStreaming: false,
            };
            return updated;
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessages((prev) => prev.slice(0, -1)); // Remove failed assistant message
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(undefined);
    setError(null);
  };

  const handleTTS = async (text: string) => {
    try {
      const audioBlob = await api.textToSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl"
    >
      <div className="rounded-2xl bg-white/10 shadow-2xl backdrop-blur-xl border border-white/20">
        {/* Header */}
        <div className="border-b border-white/10 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                AI Chat Platform
              </h1>
              <p className="mt-1 text-sm text-gray-300">
                Powered by Claude & ElevenLabs
              </p>
            </div>
            <button
              onClick={handleNewChat}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 active:scale-95"
            >
              New Chat
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={containerRef}
          className="h-[50vh] sm:h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex h-full items-center justify-center"
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/20">
                    <svg
                      className="h-8 w-8 text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Start a conversation
                  </h3>
                  <p className="mt-2 text-sm text-gray-300">
                    Type a message below to begin chatting with AI
                  </p>
                </div>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <MessageBubble
                key={`${message.timestamp}-${index}`}
                message={message}
                onTTS={handleTTS}
              />
            ))}

            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <LoadingDots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="border-t border-white/10 bg-red-500/10 p-3 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Message Composer */}
        <div className="border-t border-white/10 p-4 sm:p-6">
          <MessageComposer
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder="Type your message..."
          />
        </div>
      </div>
    </motion.div>
  );
}