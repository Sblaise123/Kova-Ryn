'use client';

import { useState, useRef, useEffect } from 'react';
import { ApiClient } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi, my name is Kova! Ask me anything so I can help you.', timestamp: Date.now() },
  ]);
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
      // Send message via ApiClient
      const res = await ApiClient.sendMessage([...messages, userMsg]);

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.content, timestamp: Date.now() },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      let errorMessage = 'Failed to send message. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to server. Check your internet connection.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Server error. Please try again in a moment.';
        }
      }
      setError(errorMessage);
      setMessages(prev => prev.slice(0, -1)); // remove last user message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>AI Chat Platform</h1>
          <p style={styles.subtitle}>Powered by Claude</p>
        </div>

        <div style={styles.messages}>
          {error && (
            <div style={styles.errorBanner}>
              <span>{error}</span>
              <button onClick={() => setError(null)} style={styles.closeButton}>×</button>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              ...styles.messageRow,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                ...styles.bubble,
                background: msg.role === 'user' ? '#0ea5e9' : 'rgba(255,255,255,0.1)'
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
              <div style={styles.bubble}>Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputContainer}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            disabled={loading}
            style={styles.input}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              ...styles.button,
              opacity: loading || !input.trim() ? 0.5 : 1,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px', minHeight: '100vh', display: 'flex', alignItems: 'center' },
  card: { width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', minHeight: '600px', display: 'flex', flexDirection: 'column' as const },
  header: { marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' },
  title: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  subtitle: { fontSize: '14px', opacity: 0.8, margin: 0 },
  messages: { flex: 1, overflowY: 'auto' as const, marginBottom: '20px', minHeight: '300px' },
  errorBanner: { background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  closeButton: { background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px', padding: '0 8px', lineHeight: 1 },
  messageRow: { display: 'flex', marginBottom: '12px' },
  bubble: { padding: '12px 16px', borderRadius: '16px', maxWidth: '70%', wordBreak: 'break-word' as const },
  inputContainer: { display: 'flex', gap: '8px' },
  input: { flex: 1, padding: '12px 16px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', fontSize: '14px' },
  button: { padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#0ea5e9', color: 'white', fontWeight: 'bold' as const, fontSize: '14px' },
};
