"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
class StorageService {
    constructor() {
        this.conversations = new Map();
    }
    saveMessage(conversationId, message) {
        const id = conversationId || (0, uuid_1.v4)();
        const existing = this.conversations.get(id);
        const now = Date.now();
        if (existing) {
            existing.messages.push(message);
            existing.updatedAt = now;
        }
        else {
            this.conversations.set(id, {
                conversationId: id,
                messages: [message],
                createdAt: now,
                updatedAt: now,
            });
        }
        logger_1.logger.debug(`Saved message to conversation ${id}`);
        return id;
    }
    getHistory(conversationId) {
        return this.conversations.get(conversationId) || null;
    }
    getAllConversations() {
        return Array.from(this.conversations.values());
    }
    clearOldConversations(maxAge = 24 * 60 * 60 * 1000) {
        const now = Date.now();
        let cleared = 0;
        this.conversations.forEach((conv, id) => {
            if (now - conv.updatedAt > maxAge) {
                this.conversations.delete(id);
                cleared++;
            }
        });
        if (cleared > 0) {
            logger_1.logger.info(`Cleared ${cleared} old conversations`);
        }
    }
}
exports.storageService = new StorageService();
// Clean up old conversations every hour
setInterval(() => {
    exports.storageService.clearOldConversations();
}, 60 * 60 * 1000);
