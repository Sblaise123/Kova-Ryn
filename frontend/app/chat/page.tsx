'use client';

import { Suspense } from 'react';
import ChatContainer from '@/components/ChatContainer';
import FloatingCanvas from '@/components/FloatingCanvas';

export default function ChatPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <Suspense fallback={null}>
        <FloatingCanvas />
      </Suspense>

      {/* Main Chat Interface */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <ChatContainer />
      </div>

      {/* Gradient Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
    </div>
  );
}