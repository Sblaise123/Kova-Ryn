import React from 'react';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content }) => {
  const isUser = role === 'user';

  return (
    <div
      className={`max-w-[80%] px-4 py-2 rounded-lg break-words ${
        isUser
          ? 'bg-blue-600 text-white self-end'
          : 'bg-gray-700 text-white self-start'
      }`}
    >
      {content}
    </div>
  );
};

export default MessageBubble;
