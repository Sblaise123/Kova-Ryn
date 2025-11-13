# Kova-Ryn
KovaRyn is a next-generation AI chat platform built with a fully-typed TypeScript stack — combining a Next.js + Tailwind + Framer Motion frontend and a Fastify/Node.js backend powered by Claude or OpenAI APIs. Designed for seamless, dynamic, and visually engaging conversations KovaRyn delivers both speed and personality in one futuristic interface.
# 🧠 KovaRyn — Conversational Intelligence Reimagined  

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=nextdotjs)
![Fastify](https://img.shields.io/badge/Fastify-Node.js-green?style=flat&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-lightgrey)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)
![Railway](https://img.shields.io/badge/Deploy-Railway-purple?style=flat&logo=railway)

> **KovaRyn** is a full-stack AI chat platform that combines an elegant, futuristic frontend with a modular backend built for speed, intelligence, and scalability.  

---

## 🌌 Overview  

KovaRyn redefines conversational AI by merging art and intelligence through a clean, animated interface powered by Next.js, Framer Motion, and React-Three-Fiber. The backend—built with Fastify and TypeScript—handles real-time chat streaming, text-to-speech, and AI model integration (Claude / OpenAI).  

> Designed to be **visually engaging**, **developer-friendly**, and **fully deployable** across Vercel and Railway.  

---

## 🧩 Features  

- 💬 **Real-time chat** streaming (SSE/WebSocket)
- 🎨 **Futuristic 3D UI** using React-Three-Fiber
- 🧠 **Provider-agnostic AI integration** (Claude / OpenAI)
- 🔊 **Text-to-Speech (TTS)** via ElevenLabs (mock fallback)
- 💾 **Persistent chat history** with SQLite / memory storage
- ⚡ **Fastify-based backend** for high performance
- 🔐 **Axios interceptor + token-based auth**
- 🎭 **Framer Motion animations** and clean Tailwind design
- 🧪 **Full CI/CD setup** with Jest + GitHub Actions
- ♿ **A11y compliant** with keyboard shortcuts  

---

## 🏗️ Tech Stack  

### **Frontend**
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + Framer Motion
- React-Three-Fiber (3D Canvas)
- Axios (streaming client)
- Deployed on **Vercel**

### **Backend**
- Fastify (Node.js, TypeScript)
- Claude / OpenAI integration
- ElevenLabs TTS (optional)
- SQLite / memory store
- Deployed on **Railway**

---
⚙️ Backend Setup
cd backend
cp .env.example .env
npm install
npm run dev


Access API at http://localhost:5000

🌍 Deployment
🚀 Frontend (Vercel)
vercel --prod

☁️ Backend (Railway or Render)

Set environment variables in dashboard

Deploy via GitHub connect or railway up

🔑 Environment Variables
Key	Description
CLAUDE_API_KEY	Claude API key (or OpenAI key as fallback)
ELEVENLABS_API_KEY	Optional for Text-to-Speech
BACKEND_URL	Base API URL for deployed backend
FRONTEND_URL	Base URL for deployed frontend
DATABASE_URL	Optional persistent DB (e.g., SQLite / Postgres)
PORT	Backend port (default: 5000)
🧪 Testing

Run unit + integration tests:

npm run test


GitHub Actions automatically runs:

✅ Lint

✅ Type Check

✅ Test

✅ Build

🧠 Project Structure
KovaRyn/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── chat/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ChatContainer.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageComposer.tsx
│   │   └── FloatingCanvas.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── interceptor.ts
│   │   └── types.ts
│   ├── public/
│   └── tailwind.config.ts
└── backend/
    ├── src/
    │   ├── server.ts
    │   ├── controllers/
    │   ├── services/
    │   ├── routes/
    │   ├── middleware/
    │   └── utils/
    └── tests/

🧬 Example API Calls
🗣️ Chat
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello KovaRyn!"}]}'

🔊 TTS
curl -X POST http://localhost:5000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from KovaRyn"}'

🪄 UI Preview

(Add screenshots or animated GIFs here)

🧩 Sleek Chat UI
🪶 FloatingCanvas with 3D motion
🎭 Smooth animations with Framer Motion

💡 Vision

KovaRyn isn’t just a chat — it’s a fusion of intelligence, art, and interactivity.
A minimalist yet powerful environment where design meets depth.

📜 License

MIT © 2025 KovaRyn Labs

🤝 Contributing

Pull requests are welcome!

Fork the repo

Create a feature branch (git checkout -b feature/amazing)

Commit your changes (git commit -m "feat: add amazing feature")

Push and open a PR

🧭 Maintained By

KovaRyn Labs

“Conversational Intelligence, Reimagined.”

🪶 Release Notes

v1.0.0 – Initial Launch

Full-stack TypeScript setup

Streaming chat + TTS integration

Framer Motion + 3D visuals

CI/CD + Deployment templates
