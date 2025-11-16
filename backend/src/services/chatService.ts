import fetch from 'node-fetch';

export const getChatResponse = async (messages: { role: string; content: string }[], conversationId?: string) => {
  // Normal POST to Claude
  const res = await fetch('https://api.anthropic.com/v1/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.ANTHROPIC_API_KEY!,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || 'claude-3-5',
      messages,
      max_tokens_to_sample: Number(process.env.LLM_MAX_TOKENS) || 1000,
    }),
  });

  const data = await res.json();
  return data?.completion || 'No response from AI';
};

// Stream chat responses to client via SSE
export const streamChatResponse = async (
  messages: { role: string; content: string }[],
  conversationId: string | undefined,
  sendChunk: (chunk: { content?: string; done?: boolean }) => void
) => {
  // Example: streaming via Claude (pseudo-streaming logic)
  const response = await fetch('https://api.anthropic.com/v1/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.ANTHROPIC_API_KEY!,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || 'claude-3-5',
      messages,
      max_tokens_to_sample: Number(process.env.LLM_MAX_TOKENS) || 1000,
      stream: true, // enable streaming
    }),
  });

  if (!response.body) throw new Error('No response body from Claude');

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let doneReading = false;

  while (!doneReading) {
    const { value, done } = await reader.read();
    doneReading = done;

    if (value) {
      const chunkStr = decoder.decode(value);
      const lines = chunkStr.split('\n').filter(Boolean);

      lines.forEach((line) => {
        try {
          const parsed = JSON.parse(line);
          sendChunk({ content: parsed.completion });
        } catch {
          // ignore non-JSON lines
        }
      });
    }
  }
};
