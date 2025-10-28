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
  type: string;
  readAt?: string;
  sender: User;
  // client-only flag for optimistic UI (true while waiting for server)
  _isSending?: boolean;
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
  const [currentUserMongoId, setCurrentUserMongoId] = useState<string | null>(null);
  const { user } = useUser();
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
  
  // Fetch current user's MongoDB ID
  const fetchCurrentUserMongoId = useCallback(async () => {
    try {
      const response = await fetch("/api/users/current");
      if (response.ok) {
        const userData = await response.json();
        setCurrentUserMongoId(userData.id);
      }
    } catch (error) {
      console.error("Error fetching current user ID:", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentUserMongoId();
      fetchFollowing();
      fetchChats();
    }
  }, [isOpen, fetchFollowing, fetchChats, fetchCurrentUserMongoId]);

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
        
        // Fetch full messages for this chat
        const messagesResponse = await fetch(`/api/chats/${chat.id}/messages`);
        if (messagesResponse.ok) {
          const messages = await messagesResponse.json();
          setSelectedChat({
            ...chat,
            messages: messages,
          });
        } else {
          setSelectedChat(chat);
        }
        
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

    // Optimistic UI: create a temporary message and append immediately
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content: message,
      senderId: currentUserMongoId || "",
      createdAt: new Date().toISOString(),
      type: "text",
      _isSending: true,
      sender: {
        id: currentUserMongoId || "",
        username: user?.username || "",
        avatar: user?.imageUrl || null,
        name: user?.firstName || null,
        surname: user?.lastName || null,
      },
    };

    // Clear input immediately
    setMessage("");

    // Append to selected chat messages optimistically
    setSelectedChat((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, tempMessage],
      };
    });

    // Also update chats list lastMessage locally to reflect recent message
    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? { ...c, lastMessage: { ...tempMessage, id: tempId } as any }
          : c
      )
    );

    // Scroll to bottom so optimistic message is visible
    setTimeout(scrollToBottom, 50);

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

        // Replace temp message with server message
        setSelectedChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((m) => (m.id === tempId ? newMessage : m)),
          };
        });

        // Update chats list lastMessage with real message
        setChats((prev) =>
          prev.map((c) =>
            c.id === selectedChat.id ? { ...c, lastMessage: newMessage } : c
          )
        );

        // Create notification (fire-and-forget)
        createNotification(selectedChat.id).catch((e) =>
          console.error("Notification error:", e)
        );

        // Optionally refresh chats in background
        fetchChats().catch(() => {});
      } else {
        // If send failed, mark the temp message as failed (remove _isSending)
        setSelectedChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === tempId ? { ...m, _isSending: false } : m
            ),
          };
        });
        console.error("Failed to send message, server returned non-OK");
      }
    } catch (error) {
      // Network error - mark message as failed
      setSelectedChat((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === tempId ? { ...m, _isSending: false } : m
          ),
        };
      });
      console.error("Error sending message:", error);
    }
  };

  const handleChatSelect = async (chat: Chat) => {
    try {
      // Fetch full messages for this chat
      const response = await fetch(`/api/chats/${chat.id}/messages`);
      if (response.ok) {
        const messages = await response.json();
        setSelectedChat({
          ...chat,
          messages: messages,
        });
        await markMessagesAsRead(chat.id);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Fallback to chat with existing messages
      setSelectedChat(chat);
      await markMessagesAsRead(chat.id);
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find((p) => p.user.id !== currentUserMongoId)?.user;
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
    // Check if last message is unread and not sent by current user
    if (chat.lastMessage) {
      return chat.lastMessage.senderId !== user.id && !chat.lastMessage.readAt;
    }
    return false;
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
                      msg.senderId === currentUserMongoId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.senderId === currentUserMongoId
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      } ${msg._isSending ? "opacity-80 italic" : ""}`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs opacity-70">
                          {formatTime(msg.createdAt)}
                        </p>
                        {msg.senderId === currentUserMongoId && (
                          <span className="text-xs opacity-70 ml-2">
                            {msg._isSending ? "Sending..." : msg.readAt ? "✓✓" : "✓"}
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
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                  />
                  
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
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
