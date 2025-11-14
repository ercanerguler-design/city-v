'use client';

import { useState, useEffect, useRef } from 'react';
import useChatStore, { ChatMessage, OnlineUser } from '@/store/chatStore';
import useSocketStore from '@/store/socketStore';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Search, 
  MapPin, 
  X, 
  Circle,
  MoreHorizontal,
  Phone,
  Video
} from 'lucide-react';

interface RealTimeChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
}

export default function RealTimeChat({ 
  isOpen, 
  onClose, 
  currentUserId, 
  currentUserName 
}: RealTimeChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isConnected } = useSocketStore();
  const {
    initializeChat,
    sendMessage,
    setActiveRoom,
    getRoomMessages,
    startTyping,
    stopTyping,
    createOrGetRoom,
    onlineUsers,
    rooms,
    activeRoomId,
    isTyping,
    getUnreadCount
  } = useChatStore();

  // Initialize chat when component mounts
  useEffect(() => {
    if (isConnected && currentUserId && currentUserName) {
      initializeChat(currentUserId, currentUserName);
    }
  }, [isConnected, currentUserId, currentUserName, initializeChat]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [getRoomMessages(activeRoomId || '')]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !activeRoomId) return;

    const recipientUser = onlineUsers.get(selectedUser);
    if (!recipientUser) return;

    sendMessage(activeRoomId, {
      senderId: currentUserId,
      senderName: currentUserName,
      recipientId: selectedUser,
      recipientName: recipientUser.name,
      message: newMessage.trim(),
      type: 'text'
    });

    setNewMessage('');
    stopTyping(activeRoomId);
  };

  const handleSelectUser = (userId: string, userName: string) => {
    setSelectedUser(userId);
    const roomId = createOrGetRoom(userId, userName);
    setActiveRoom(roomId);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (activeRoomId) {
      if (value.trim()) {
        startTyping(activeRoomId);
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          stopTyping(activeRoomId);
        }, 3000);
      } else {
        stopTyping(activeRoomId);
      }
    }
  };

  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOnlineUsers = () => {
    return Array.from(onlineUsers.values()).filter(user => user.id !== currentUserId);
  };

  const filteredUsers = getOnlineUsers().filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = activeRoomId ? getRoomMessages(activeRoomId) : [];
  const currentTypingUsers = activeRoomId ? isTyping.get(activeRoomId) || [] : [];
  const selectedUserData = selectedUser ? onlineUsers.get(selectedUser) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden">
        
        {/* Users Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="flex items-center justify-between text-white">
              <h2 className="font-bold text-lg">Mesajlaşma</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <MessageCircle className="w-5 h-5" />
                  {getUnreadCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {getUnreadCount()}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Circle className={`w-2 h-2 ${isConnected ? 'text-green-300 fill-green-300' : 'text-red-300 fill-red-300'}`} />
              <span className="text-white opacity-90">
                {isConnected ? 'Bağlı' : 'Bağlantı bekleniyor'}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Kullanıcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Online Users List */}
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id, user.name)}
                    className={`w-full p-3 rounded-lg text-left transition-all hover:bg-blue-50 ${
                      selectedUser === user.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <Circle className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                          user.isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'
                        } bg-white rounded-full`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {user.isOnline ? (
                            <span className="text-green-600">Çevrimiçi</span>
                          ) : (
                            <span>
                              {Math.floor((Date.now() - user.lastSeen) / 60000)}dk önce
                            </span>
                          )}
                          {user.location && (
                            <>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{user.location.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>
                  {searchQuery ? 'Kullanıcı bulunamadı' : 'Çevrimiçi kullanıcı yok'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser && selectedUserData ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedUserData.name.charAt(0).toUpperCase()}
                      </div>
                      <Circle className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                        selectedUserData.isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'
                      } bg-white rounded-full`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedUserData.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedUserData.isOnline ? 'Çevrimiçi' : `${Math.floor((Date.now() - selectedUserData.lastSeen) / 60000)}dk önce görüldü`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                      message.senderId === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      <div className="flex items-center justify-between mt-1 gap-2">
                        <span className={`text-xs ${
                          message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {message.senderId === currentUserId && (
                          <span className="text-xs text-blue-100">
                            {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓' : '○'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {currentTypingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-xl">
                      <p className="text-sm text-gray-600">Yazıyor...</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !isConnected}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Mesajlaşmaya Başlayın</h3>
                <p className="text-gray-500">
                  Sol taraftan bir kullanıcı seçerek mesajlaşmaya başlayabilirsiniz.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}