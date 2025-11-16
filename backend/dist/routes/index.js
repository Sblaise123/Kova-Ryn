"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = routes;
const chatController_1 = require("../controllers/chatController");
const ttsController_1 = require("../controllers/ttsController");
const historyController_1 = require("../controllers/historyController");
async function routes(fastify) {
    // Chat endpoint - POST only
    fastify.post('/chat', chatController_1.chatController);
    // TTS endpoint - POST only  
    fastify.post('/tts', ttsController_1.ttsController);
    // History endpoint - GET only
    fastify.get('/history', historyController_1.historyController);
    // Add OPTIONS support for CORS preflight
    fastify.options('/chat', async (request, reply) => {
        reply.send();
    });
    fastify.options('/tts', async (request, reply) => {
        reply.send();
    });
    fastify.options('/history', async (request, reply) => {
        reply.send();
    });
}
