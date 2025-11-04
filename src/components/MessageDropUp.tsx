"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Search } from "lucide-react";

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

interface MessageDropUpProps {
  onChatSelect: (chatId: string) => void;
}

const MessageDropUp = ({ onChatSelect }: MessageDropUpProps) => {
  const { user } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chats.length > 0 && user?.username) {
      for (const chat of chats) {
        const participant = chat.participants.find(p => p.user.username === user.username);
        if (participant) {
          setCurrentUserId(participant.userId);
          break;
        }
      }
    }
  }, [chats, user?.username]);

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

  const getOtherParticipant = (chat: Chat) => {
    const participant = chat.participants.find(p => p.userId !== currentUserId);
    return participant?.user;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return `${Math.floor(diffInMinutes / 10080)}w`;
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery.trim())}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateChat = async (userId: string) => {
    try {
      const response = await fetch('/api/chats/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (response.ok) {
        const chat = await response.json();
        onChatSelect(chat.id);
        setSearchQuery("");
        setSearchResults([]);
        fetchChats();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <div className="h-full">
      {/* Search Section */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search users..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-white rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || searching}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              searchQuery.trim() && !searching
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {searching ? '...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {searchResults.map(result => (
              <button
                key={result.id}
                onClick={() => handleCreateChat(result.id)}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Image
                  src={result.avatar || '/noAvatar.png'}
                  alt={result.username}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium dark:text-white">{result.name || result.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">@{result.username}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat List */}
      <div>
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No messages yet</p>
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
                onClick={() => onChatSelect(chat.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800"
              >
                <div className="relative flex-shrink-0">
                  <Image
                    src={otherUser.avatar || '/noAvatar.png'}
                    alt={otherUser.username}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {otherUser.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm truncate ${isUnread ? 'font-bold' : 'font-medium'} dark:text-white`}>
                      {otherUser.name || otherUser.username}
                    </p>
                    {lastMsg && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {getTimeAgo(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  {lastMsg && (
                    <p className={`text-xs truncate ${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      {lastMsg.content}
                    </p>
                  )}
                </div>
                {isUnread && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessageDropUp;
