export const sanitizeInput = (input: string): string => {
  // Remove potential prompt injection patterns
  const dangerous = [
    /ignore previous instructions/gi,
    /disregard all.+instructions/gi,
    /new instructions:/gi,
    /system:/gi,
  ];

  let sanitized = input;
  dangerous.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });

  // Trim and limit length
  sanitized = sanitized.trim().slice(0, 10000);

  return sanitized;
};

export const sanitizeMessages = (messages: any[]): any[] => {
  return messages.map((msg) => ({
    role: msg.role,
    content: sanitizeInput(msg.content || ''),
  }));
};