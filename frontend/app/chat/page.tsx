'use client';

import { useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          stream: false
        })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not connect to server' }]);
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

        <div style={styles.messagesContainer}>
          {messages.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyTitle}>Start a conversation</p>
              <p style={styles.emptyText}>Type a message below</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} style={{
              ...styles.messageRow,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                ...styles.messageBubble,
                background: msg.role === 'user' ? '#0ea5e9' : 'rgba(255,255,255,0.1)'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{...styles.messageRow, justifyContent: 'flex-start'}}>
              <div style={styles.messageBubble}>Loading...</div>
            </div>
          )}
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
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center'
  },
  card: {
    width: '100%',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '600px'
  },
  header: {
    marginBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    opacity: 0.8,
    margin: 0
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    marginBottom: '20px',
    minHeight: '300px'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px 0'
  },
  emptyTitle: {
    fontSize: '18px',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '14px',
    opacity: 0.7
  },
  messageRow: {
    display: 'flex',
    marginBottom: '16px'
  },
  messageBubble: {
    padding: '12px 16px',
    borderRadius: '16px',
    maxWidth: '70%',
    wordBreak: 'break-word' as const
  },
  inputContainer: {
    display: 'flex',
    gap: '8px'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    border: 'none',
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    outline: 'none',
    fontSize: '14px'
  },
  button: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    background: '#0ea5e9',
    color: 'white',
    fontWeight: 'bold' as const,
    fontSize: '14px'
  }
};