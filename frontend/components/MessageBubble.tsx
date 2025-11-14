'use client';

import { Message } from '@/lib/types';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`max-w-[80%] px-4 py-2 rounded-xl break-words ${
        isUser
          ? 'bg-primary-600 text-white self-end'
          : 'bg-gray-800 text-gray-200 self-start'
      }`}
    >
      {message.content}
    </motion.div>
  );
}
