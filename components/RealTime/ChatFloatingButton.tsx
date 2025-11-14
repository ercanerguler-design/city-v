'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import RealTimeChat from './RealTimeChat';
import useChatStore from '@/store/chatStore';

interface ChatFloatingButtonProps {
  currentUserId: string;
  currentUserName: string;
  className?: string;
}

export default function ChatFloatingButton({ 
  currentUserId, 
  currentUserName,
  className = ''
}: ChatFloatingButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { getUnreadCount } = useChatStore();

  const unreadCount = getUnreadCount();

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`
          fixed bottom-6 right-6 z-40
          w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 
          text-white rounded-full shadow-lg hover:shadow-xl
          transform hover:scale-110 transition-all duration-300
          flex items-center justify-center
          ${className}
        `}
      >
        <MessageCircle className="w-6 h-6" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Modal */}
      <RealTimeChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />
    </>
  );
}