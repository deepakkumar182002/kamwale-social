"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface User {
  id: string;
  username: string;
  avatar: string | null;
  name: string | null;
  surname: string | null;
  isOnline?: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  imageUrl?: string;
  type: string;
  readAt?: string;
  sender: User;
}

interface Chat {
  id: string;
  participants: {
    user: User;
  }[];
  messages: Message[];
  lastMessage?: Message;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUserId?: string;
}

const ChatModal = ({ isOpen, onClose, initialUserId }: ChatModalProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Update user online status
  const updateOnlineStatus = useCallback(async () => {
    try {
      await fetch("/api/users/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOnline: true }),
      });
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      updateOnlineStatus();
      // Update status every 30 seconds
      const interval = setInterval(updateOnlineStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [user, updateOnlineStatus]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (chatId: string) => {
    try {
      await fetch(`/api/chats/${chatId}/read`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, []);

  const fetchFollowing = useCallback(async () => {
    try {
      const response = await fetch("/api/chats/following");
      if (response.ok) {
        const data = await response.json();
        setFollowing(data);
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chats");
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFollowing();
      fetchChats();
    }
  }, [isOpen, fetchFollowing, fetchChats]);

  const startChatWithUser = useCallback(async (targetUser: User) => {
    try {
      const response = await fetch("/api/chats/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otherUserId: targetUser.id }),
      });

      if (response.ok) {
        const chat = await response.json();
        setSelectedChat(chat);
        await fetchChats();
      }
    } catch (error) {
      console.error("Error creating/opening chat:", error);
    }
  }, [fetchChats]);

  useEffect(() => {
    if (initialUserId && following.length > 0) {
      const targetUser = following.find((f) => f.id === initialUserId);
      if (targetUser) {
        startChatWithUser(targetUser);
      }
    }
  }, [initialUserId, following, startChatWithUser]);

  const handleImageUpload = async (file: File) => {
    if (!file || !selectedChat) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Send image message
        const messageResponse = await fetch(`/api/chats/${selectedChat.id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: "",
            type: "image",
            imageUrl: data.secure_url,
          }),
        });

        if (messageResponse.ok) {
          const newMessage = await messageResponse.json();
          setSelectedChat((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              messages: [...prev.messages, newMessage],
            };
          });
          
          // Create notification for other participants
          await createNotification(selectedChat.id, "image");
          await fetchChats();
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const createNotification = async (chatId: string, messageType: string = "text") => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          type: "message",
          messageType,
        }),
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const response = await fetch(`/api/chats/${selectedChat.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
          type: "text",
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessage("");
        setSelectedChat((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, newMessage],
          };
        });
        
        // Create notification
        await createNotification(selectedChat.id);
        await fetchChats();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat);
    await markMessagesAsRead(chat.id);
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find((p) => p.user.id !== user?.id)?.user;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOnlineStatus = (participant: User) => {
    if (participant.isOnline) return "Online";
    if (participant.lastSeen) {
      return `Last seen ${formatDistanceToNow(new Date(participant.lastSeen))} ago`;
    }
    return "Offline";
  };

  const hasUnreadMessages = (chat: Chat) => {
    if (!user) return false;
    return chat.messages.some(
      (msg) => msg.senderId !== user.id && !msg.readAt
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full max-w-4xl max-h-[90vh] flex">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Messages</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : (
              <>
                {/* Existing Chats */}
                {chats.map((chat) => {
                  const otherUser = getOtherParticipant(chat);
                  if (!otherUser) return null;

                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleChatSelect(chat)}
                      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 relative ${
                        selectedChat?.id === chat.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Image
                            src={otherUser.avatar || "/noAvatar.png"}
                            alt={otherUser.username}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                          {otherUser.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm truncate">
                              {otherUser.name || otherUser.username}
                            </p>
                            {hasUnreadMessages(chat) && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                            )}
                          </div>
                          {chat.lastMessage && (
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500 truncate">
                                {chat.lastMessage.type === "image" 
                                  ? "📷 Photo" 
                                  : chat.lastMessage.content}
                              </p>
                              <span className="text-xs text-gray-400">
                                {formatTime(chat.lastMessage.createdAt)}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-gray-400">
                            {getOnlineStatus(otherUser)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Following List */}
                <div className="p-3 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Start new conversation
                  </p>
                  {following
                    .filter((f) => !chats.some((chat) => getOtherParticipant(chat)?.id === f.id))
                    .map((followedUser) => (
                      <div
                        key={followedUser.id}
                        onClick={() => startChatWithUser(followedUser)}
                        className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded"
                      >
                        <div className="relative">
                          <Image
                            src={followedUser.avatar || "/noAvatar.png"}
                            alt={followedUser.username}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                          {followedUser.isOnline && (
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {followedUser.name || followedUser.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getOnlineStatus(followedUser)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <div className="relative">
                  <Image
                    src={getOtherParticipant(selectedChat)?.avatar || "/noAvatar.png"}
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  {getOtherParticipant(selectedChat)?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {getOtherParticipant(selectedChat)?.name ||
                      getOtherParticipant(selectedChat)?.username}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getOnlineStatus(getOtherParticipant(selectedChat)!)}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === user?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.senderId === user?.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.type === "image" && msg.imageUrl ? (
                        <div className="mb-2">
                          <Image
                            src={msg.imageUrl}
                            alt="Shared image"
                            width={200}
                            height={200}
                            className="rounded object-cover"
                          />
                        </div>
                      ) : null}
                      
                      {msg.content && (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs opacity-70">
                          {formatTime(msg.createdAt)}
                        </p>
                        {msg.senderId === user?.id && (
                          <span className="text-xs opacity-70 ml-2">
                            {msg.readAt ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 text-blue-500 hover:bg-gray-100 rounded-full disabled:opacity-50"
                    title="Upload image"
                  >
                    📷
                  </button>
                  
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                    disabled={uploading}
                  />
                  
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || uploading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
                
                {uploading && (
                  <p className="text-sm text-gray-500 mt-2">Uploading image...</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">💬</p>
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
