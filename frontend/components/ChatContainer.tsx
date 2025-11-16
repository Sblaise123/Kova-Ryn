'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '../lib/types';
import { ApiClient } from '../lib/api';

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Use streaming API
      let assistantMsg: Message = { role: 'assistant', content: '', timestamp: Date.now() };
      setMessages(prev => [...prev, assistantMsg]);

      ApiClient.streamMessage([...messages, userMsg], undefined, {
        onChunk: (chunk) => {
          if (chunk.content) {
            assistantMsg.content += chunk.content;
            setMessages(prev => [...prev.slice(0, -1), assistantMsg]);
          }
          if (chunk.error) {
            setError(chunk.error);
          }
        },
        onComplete: () => {
          setLoading(false);
        },
        onError: (err) => {
          console.error('Chat error:', err);
          setError('Failed to connect to server.');
          setMessages(prev => prev.slice(0, -1));
          setLoading(false);
        },
      });
    } catch (err) {
      console.error(err);
      setError('Unexpected error.');
      setMessages(prev => prev.slice(0, -1));
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>AI Chat</h1>
        </div>

        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', maxWidth: '70%', background: msg.role === 'user' ? '#0ea5e9' : 'rgba(255,255,255,0.1)' }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <div>Thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputContainer}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            disabled={loading}
            style={styles.input}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={styles.button}>
            {loading ? '...' : 'Send'}
          </button>
        </div>

        {error && <div style={{ color: 'red', marginTop: '12px' }}>{error}</div>}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px' },
  card: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', minHeight: '500px', display: 'flex', flexDirection: 'column' as const },
  header: { marginBottom: '16px' },
  title: { fontSize: '20px', fontWeight: 'bold' },
  messages: { flex: 1, overflowY: 'auto', marginBottom: '16px' },
  inputContainer: { display: 'flex', gap: '8px' },
  input: { flex: 1, padding: '12px', borderRadius: '8px', border: 'none', outline: 'none' },
  button: { padding: '12px 16px', borderRadius: '8px', border: 'none', background: '#0ea5e9', color: 'white', cursor: 'pointer' },
};
