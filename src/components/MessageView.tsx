"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

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
}

const MessageView = () => {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const messageId = searchParams?.get('messageId');

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (messageId) {
      fetchChat();
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId]);

  useEffect(() => {
    if (chat && user?.username) {
      const participant = chat.participants.find(p => p.user.username === user.username);
      if (participant) {
        setCurrentUserId(participant.userId);
      }
    }
  }, [chat, user?.username]);

  const fetchChat = async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const chats = await response.json();
        const foundChat = chats.find((c: Chat) => c.id === messageId);
        if (foundChat) {
          setChat(foundChat);
        }
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chats/${messageId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch(`/api/chats/${messageId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (!chat || !currentUserId) return null;
    const participant = chat.participants.find(p => p.userId !== currentUserId);
    return participant?.user;
  };

  const getMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const hours = messageDate.getHours();
    const minutes = messageDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleBack = () => {
    router.push('/');
  };

  if (!messageId) return null;

  const otherUser = getOtherParticipant();

  return (
    <div className="lg:hidden fixed inset-0 bg-white dark:bg-gray-900 z-[60] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button onClick={handleBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <ArrowLeft className="w-6 h-6 dark:text-white" />
        </button>
        {otherUser && (
          <>
            <Image
              src={otherUser.avatar || '/noAvatar.png'}
              alt={otherUser.username}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold dark:text-white">{otherUser.name || otherUser.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {otherUser.isOnline ? 'Active now' : 'Offline'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          messages.map(message => {
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
          })
        )}
      </div>

      {/* Input */}
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
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageView;
