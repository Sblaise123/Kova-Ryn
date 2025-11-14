'use client';

import { motion } from 'framer-motion';
import { Message } from '@/lib/types';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
  onTTS?: (text: string) => void;
}

export default function MessageBubble({ message, onTTS }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isUser = message.role === 'user';

  const handleTTS = async () => {
    if (!onTTS || isPlaying) return;
    setIsPlaying(true);
    try {
      await onTTS(message.content);
    } finally {
      setIsPlaying(false);
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[85%] items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
            isUser ? 'bg-primary-500' : 'bg-purple-500'
          }`}
        >
          {isUser ? (
            <svg
              className="h-5 w-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          )}
        </div>

        {/* Message Content */}
        <div className="flex flex-col gap-1">
          <div
            className={`rounded-2xl px-4 py-3 shadow-lg ${
              isUser
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-gray-100 backdrop-blur-sm'
            } ${message.isStreaming ? 'animate-pulse' : ''}`}
          >
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {formatContent(message.content)}
              {message.isStreaming && (
                <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-current" />
              )}
            </p>
          </div>

          {/* Message Actions */}
          <div className="flex items-center gap-2 px-2">
            {message.timestamp && (
              <span className="text-xs text-gray-400">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}

            {!isUser && !message.isStreaming && onTTS && (
              <button
                onClick={handleTTS}
                disabled={isPlaying}
                className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="Text to Speech"
              >
                {isPlaying ? (
                  <svg
                    className="h-4 w-4 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}