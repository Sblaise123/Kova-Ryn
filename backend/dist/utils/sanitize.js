"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeMessages = exports.sanitizeInput = void 0;
const sanitizeInput = (input) => {
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
exports.sanitizeInput = sanitizeInput;
const sanitizeMessages = (messages) => {
    return messages.map((msg) => ({
        role: msg.role,
        content: (0, exports.sanitizeInput)(msg.content || ''),
    }));
};
exports.sanitizeMessages = sanitizeMessages;
