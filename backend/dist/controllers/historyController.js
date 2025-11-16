"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyController = void 0;
const storageService_1 = require("../services/storageService");
const logger_1 = require("../utils/logger");
const historyController = async (request, reply) => {
    const { conversation_id } = request.query;
    try {
        if (conversation_id) {
            const history = storageService_1.storageService.getHistory(conversation_id);
            if (!history) {
                return reply.status(404).send({ error: 'Conversation not found' });
            }
            reply.send(history);
        }
        else {
            const all = storageService_1.storageService.getAllConversations();
            reply.send({ conversations: all });
        }
    }
    catch (error) {
        logger_1.logger.error('History error:', error);
        reply.status(500).send({ error: 'Failed to fetch history' });
    }
};
exports.historyController = historyController;
