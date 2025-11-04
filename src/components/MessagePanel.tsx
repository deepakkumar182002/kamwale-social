"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

interface Chat {
  id: string;
  participants: Array<{
    userId: string;
    user: {
      id: string;
      username: string;
      avatar: string | null;
      name: string | null;
      surname: string | null;
      isOnline: boolean;
    };
  }>;
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    readAt: string | null;
  }>;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  readAt: string | null;
  sender: {
    id: string;
    username: string;
    name: string | null;
    surname: string | null;
    avatar: string | null;
  };
}

const MessagePanel = ({ 
  isOpen, 
  onClose,
  selectedChatId,
  onChatSelect 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
}) => {
  const { user } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);

  // Set current user ID from chats
  useEffect(() => {
    if (chats.length > 0 && user?.id) {
      // Find current user's participant entry in any chat
      for (const chat of chats) {
        const participant = chat.participants.find(p => p.user.username === user.username);
        if (participant) {
          setCurrentUserId(participant.userId);
          break;
        }
      }
    }
  }, [chats, user?.id, user?.username]);

  useEffect(() => {
    if (isOpen) {
      fetchChats();
      fetchFollowingUsers();
    }
  }, [isOpen]);

  const fetchFollowingUsers = async () => {
    try {
      const response = await fetch('/api/chats/following');
      if (response.ok) {
        const data = await response.json();
        setFollowingUsers(data);
      }
    } catch (error) {
      console.error('Error fetching following users:', error);
    }
  };

  useEffect(() => {
    if (selectedChatId) {
      const chat = chats.find(c => c.id === selectedChatId);
      if (chat) {
        setSelectedChat(chat);
        fetchMessages(selectedChatId);
      }
    }
  }, [selectedChatId, chats]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chats');
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return;

    try {
      setSending(true);
      const response = await fetch(`/api/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage("");
        // Update chat list
        fetchChats();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const createNewChat = async (userId: string) => {
    try {
      const response = await fetch('/api/chats/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (response.ok) {
        const chat = await response.json();
        setShowNewChat(false);
        setSelectedChat(chat);
        onChatSelect(chat.id);
        fetchChats();
        fetchMessages(chat.id);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    // Find participant that is NOT the current user (using MongoDB ID)
    const participant = chat.participants.find(p => p.userId !== currentUserId);
    return participant?.user;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return `${Math.floor(diffInMinutes / 10080)}w`;
  };

  const getMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const hours = messageDate.getHours();
    const minutes = messageDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Desktop: Chat List Panel */}
      <div className="hidden lg:block fixed left-20 top-0 h-screen w-[400px] bg-white border-r border-gray-200 z-30 overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{user?.username || 'Messages'}</h1>
          <button 
            onClick={() => setShowNewChat(!showNewChat)}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="New Message"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* New Chat Modal */}
        {showNewChat && (
          <div className="border-b border-gray-200 p-4 bg-gray-50">
            <h3 className="text-sm font-semibold mb-3">Start a conversation</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {followingUsers.map(followingUser => (
                <button
                  key={followingUser.id}
                  onClick={() => createNewChat(followingUser.id)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <Image
                    src={followingUser.avatar || '/noAvatar.png'}
                    alt={followingUser.username}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{followingUser.name || followingUser.username}</p>
                    <p className="text-xs text-gray-500">@{followingUser.username}</p>
                  </div>
                </button>
              ))}
              {followingUsers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Follow users to start messaging
                </p>
              )}
            </div>
          </div>
        )}

        {/* Chat List */}
        <div>
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm mt-2">Start a conversation with your friends!</p>
            </div>
          ) : (
            chats.map(chat => {
              const otherUser = getOtherParticipant(chat);
              if (!otherUser) return null;

              const lastMsg = chat.lastMessage || chat.messages[chat.messages.length - 1];
              const lastMessage = chat.messages[chat.messages.length - 1];
              const isUnread = lastMessage && !lastMessage.readAt && lastMessage.senderId !== currentUserId;

              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat);
                    onChatSelect(chat.id);
                    fetchMessages(chat.id);
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors ${
                    selectedChat?.id === chat.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="relative">
                    <Image
                      src={otherUser.avatar || '/noAvatar.png'}
                      alt={otherUser.username}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {otherUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm truncate ${isUnread ? 'font-bold' : 'font-medium'}`}>
                        {otherUser.name || otherUser.username}
                      </p>
                      {lastMsg && (
                        <span className="text-xs text-gray-400 ml-2">
                          {getTimeAgo(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    {lastMsg && (
                      <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                        {lastMsg.senderId === user?.id && 'You: '}
                        {lastMsg.content}
                      </p>
                    )}
                  </div>
                  {isUnread && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Screen */}
      {selectedChat && (
        <div className="hidden lg:flex fixed left-[420px] top-0 h-screen w-[calc(100vw-420px)] bg-white z-30 flex-col">
          {/* Chat Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={getOtherParticipant(selectedChat)?.avatar || '/noAvatar.png'}
                alt={getOtherParticipant(selectedChat)?.username || 'User'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">
                  {getOtherParticipant(selectedChat)?.name || getOtherParticipant(selectedChat)?.username}
                </p>
                {getOtherParticipant(selectedChat)?.isOnline && (
                  <p className="text-xs text-gray-500">Active now</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full" title="Audio Call">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full" title="Video Call">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full" title="Info">
                <Image src="/more.png" alt="Info" width={20} height={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-2">
            {messages.map(message => {
              const isSentByMe = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col max-w-[70%]">
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isSentByMe
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 px-2 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-500">{getMessageTime(message.createdAt)}</span>
                      {isSentByMe && (
                        <span className="text-xs">
                          {message.readAt ? (
                            // Double tick for seen
                            <span className="text-blue-500">✓✓</span>
                          ) : (
                            // Single tick for delivered
                            <span className="text-gray-400">✓</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Image src="/emoji.png" alt="Emoji" width={20} height={20} />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className={`px-4 py-2 rounded-full font-semibold ${
                  newMessage.trim() && !sending
                    ? 'text-blue-600 hover:text-blue-700'
                    : 'text-gray-400'
                }`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Full Screen Message Panel */}
      <div className="lg:hidden fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
        {selectedChat ? (
          /* Conversation View */
          <>
            {/* Mobile Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <button onClick={() => setSelectedChat(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {getOtherParticipant(selectedChat) && (
                <>
                  <Image
                    src={getOtherParticipant(selectedChat)!.avatar || '/noAvatar.png'}
                    alt={getOtherParticipant(selectedChat)!.username}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold dark:text-white">{getOtherParticipant(selectedChat)!.name || getOtherParticipant(selectedChat)!.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getOtherParticipant(selectedChat)!.isOnline ? 'Active now' : 'Offline'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {messages.map(message => {
                const isSentByMe = message.senderId === currentUserId;
                return (
                  <div key={message.id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isSentByMe ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'} rounded-2xl px-4 py-2 shadow-sm`}>
                      <p className="text-sm break-words">{message.content}</p>
                      <div className={`flex items-center gap-1 justify-end mt-1 text-xs ${isSentByMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        <span>{getMessageTime(message.createdAt)}</span>
                        {isSentByMe && (
                          message.readAt 
                            ? <span className="text-blue-200">✓✓</span>
                            : <span className="text-blue-300">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Input */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Message..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-white border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className={`p-2 rounded-full ${
                    newMessage.trim() && !sending
                      ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      : 'text-gray-400'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Chat List View */
          <>
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h1 className="text-xl font-bold dark:text-white">Messages</h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowNewChat(!showNewChat)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* New Chat Modal */}
            {showNewChat && (
              <div className="border-b border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-semibold mb-3 dark:text-white">Start a conversation</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {followingUsers.map(followingUser => (
                    <button
                      key={followingUser.id}
                      onClick={() => createNewChat(followingUser.id)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Image
                        src={followingUser.avatar || '/noAvatar.png'}
                        alt={followingUser.username}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium dark:text-white">{followingUser.name || followingUser.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{followingUser.username}</p>
                      </div>
                    </button>
                  ))}
                  {followingUsers.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Follow users to start messaging
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Chat List */}
            <div className="flex-1 overflow-y-auto pb-20">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : chats.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-lg">No messages yet</p>
                  <p className="text-sm mt-2">Start a conversation!</p>
                </div>
              ) : (
                chats.map(chat => {
                  const otherUser = getOtherParticipant(chat);
                  if (!otherUser) return null;

                  const lastMsg = chat.lastMessage || chat.messages[chat.messages.length - 1];
                  const lastMessage = chat.messages[chat.messages.length - 1];
                  const isUnread = lastMessage && !lastMessage.readAt && lastMessage.senderId !== currentUserId;

                  return (
                    <button
                      key={chat.id}
                      onClick={() => {
                        setSelectedChat(chat);
                        onChatSelect(chat.id);
                        fetchMessages(chat.id);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="relative">
                        <Image
                          src={otherUser.avatar || '/noAvatar.png'}
                          alt={otherUser.username}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        {otherUser.isOnline && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm truncate ${isUnread ? 'font-bold' : 'font-medium'} dark:text-white`}>
                            {otherUser.name || otherUser.username}
                          </p>
                          {lastMsg && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(lastMsg.createdAt)}</span>
                          )}
                        </div>
                        {lastMsg && (
                          <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            {lastMsg.content}
                          </p>
                        )}
                      </div>
                      {isUnread && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default MessagePanel;
