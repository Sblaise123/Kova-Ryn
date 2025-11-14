'use client';

import React from 'react';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content }) => {
  const isUser = role === 'user';

  return (
    <div
      className={`p-3 rounded-lg max-w-[70%] break-words ${
        isUser ? 'bg-blue-600 text-white self-end' : 'bg-gray-700 text-white self-start'
      }`}
    >
      {content}
    </div>
  );
};

export default MessageBubble;
