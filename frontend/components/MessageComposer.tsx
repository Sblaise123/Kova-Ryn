'use client';

import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';

interface MessageComposerProps {
  onSend: (message: string) => void;
  loading?: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ onSend, loading = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    onSend(message.trim());
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 mt-2">
      <motion.input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        aria-label="Type your message"
      />

      <motion.button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-white ${
          loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
        aria-label="Send message"
      >
        {loading ? 'Sending...' : 'Send'}
      </motion.button>
    </form>
  );
};

export default MessageComposer;
