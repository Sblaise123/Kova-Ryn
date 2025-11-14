import React, { useState, FormEvent } from 'react';

interface MessageComposerProps {
  onSend: (content: string) => void;
  loading?: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ onSend, loading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center mt-2 space-x-2"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
};

export default MessageComposer;
