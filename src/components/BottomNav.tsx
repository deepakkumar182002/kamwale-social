"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Search, PlusSquare, Heart, User, MessageCircle } from "lucide-react";
import DropUpPanel from "./DropUpPanel";
import MessageDropUp from "./MessageDropUp";
import NotificationDropUp from "./NotificationDropUp";
import CreatePostDropUp from "./CreatePostDropUp";

type ActivePanel = 'messages' | 'notifications' | 'create' | null;

const BottomNav = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [maxHeight, setMaxHeight] = useState(500); // Default height

  // Set window height for drop-up panels
  useEffect(() => {
    const updateHeight = () => {
      setMaxHeight(window.innerHeight - 120);
    };
    
    // Set initial height
    updateHeight();
    
    // Update on resize
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          const unreadCount = data.filter((n: any) => !n.read).length;
          setUnreadNotifCount(unreadCount);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch unread message count
  useEffect(() => {
    const fetchMessageCount = async () => {
      try {
        const response = await fetch('/api/chats');
        if (response.ok) {
          const chats = await response.json();
          let unreadCount = 0;
          chats.forEach((chat: any) => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            if (lastMsg && !lastMsg.readAt && lastMsg.senderId !== user?.id) {
              unreadCount++;
            }
          });
          setUnreadMsgCount(unreadCount);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (user) {
      fetchMessageCount();
      const interval = setInterval(fetchMessageCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setActivePanel(null);
    // Open full screen message panel in background
    router.push(`/?messageId=${chatId}`);
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.type === 'message' && notification.chatId) {
      handleChatSelect(notification.chatId);
    } else if (notification.postId) {
      router.push(`/?postId=${notification.postId}`);
    } else {
      router.push(`/profile/${notification.fromUser.username}`);
    }
  };

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-14 px-2">
          {/* Home */}
          <Link
            href="/"
            onClick={() => setActivePanel(null)}
            className={`flex flex-col items-center justify-center w-14 h-14 transition-colors ${
              pathname === "/" && !activePanel ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <Home 
              className={`w-6 h-6 ${pathname === "/" && !activePanel ? "fill-current" : ""}`} 
              strokeWidth={pathname === "/" && !activePanel ? 2.5 : 2}
            />
          </Link>

          {/* Search */}
          <Link
            href="/search"
            onClick={() => setActivePanel(null)}
            className={`flex flex-col items-center justify-center w-14 h-14 transition-colors ${
              pathname === "/search" ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <Search 
              className="w-6 h-6" 
              strokeWidth={pathname === "/search" ? 2.5 : 2}
            />
          </Link>

          {/* Create Post - Center - Opens modal with all post types */}
          <button
            onClick={() => setActivePanel(activePanel === 'create' ? null : 'create')}
            className={`flex flex-col items-center justify-center w-14 h-14 transition-colors ${
              activePanel === 'create' ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <PlusSquare 
              className={`w-7 h-7 ${activePanel === 'create' ? "fill-current" : ""}`}
              strokeWidth={activePanel === 'create' ? 2.5 : 2}
            />
          </button>

          {/* Messages */}
          <button
            onClick={() => setActivePanel(activePanel === 'messages' ? null : 'messages')}
            className={`relative flex flex-col items-center justify-center w-14 h-14 transition-colors ${
              activePanel === 'messages' ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <MessageCircle 
              className={`w-6 h-6 ${activePanel === 'messages' ? "fill-current" : ""}`}
              strokeWidth={activePanel === 'messages' ? 2.5 : 2}
            />
            {unreadMsgCount > 0 && (
              <div className="absolute top-1 right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {unreadMsgCount > 9 ? '9+' : unreadMsgCount}
              </div>
            )}
          </button>

          {/* Profile */}
          <Link
            href={user?.username ? `/profile/${user.username}` : "/sign-in"}
            onClick={() => setActivePanel(null)}
            className={`flex flex-col items-center justify-center w-14 h-14 transition-colors`}
          >
            {user?.imageUrl ? (
              <div className={`relative w-7 h-7 rounded-full border-2 ${
                pathname.includes('/profile') && !activePanel ? "border-blue-600 dark:border-blue-400" : "border-gray-300 dark:border-gray-600"
              }`}>
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <User 
                className={`w-6 h-6 ${
                  pathname.includes('/profile') && !activePanel ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                }`}
                strokeWidth={pathname.includes('/profile') && !activePanel ? 2.5 : 2}
              />
            )}
          </Link>
        </div>
      </div>

      {/* Drop-up Panels */}
      <DropUpPanel
        isOpen={activePanel === 'messages'}
        onClose={() => setActivePanel(null)}
        title="Messages"
        minHeight={300}
        maxHeight={maxHeight}
      >
        <MessageDropUp 
          onChatSelect={handleChatSelect}
        />
      </DropUpPanel>

      <DropUpPanel
        isOpen={activePanel === 'create'}
        onClose={() => setActivePanel(null)}
        title="Create Post"
        minHeight={400}
        maxHeight={maxHeight}
      >
        <CreatePostDropUp onClose={() => setActivePanel(null)} />
      </DropUpPanel>
    </>
  );
};

export default BottomNav;
