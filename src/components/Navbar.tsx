"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import NotificationDropUp from "./NotificationDropUp";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const router = useRouter();

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

  const handleNotificationClick = (notification: any) => {
    setShowNotifications(false);
    if (notification.type === 'message' && notification.chatId) {
      router.push(`/?messageId=${notification.chatId}`);
    } else if (notification.postId) {
      router.push(`/?postId=${notification.postId}`);
    } else {
      router.push(`/profile/${notification.fromUser.username}`);
    }
  };

  return (
    <div className="h-16 flex items-center justify-between">
      {/* LEFT - Mobile only logo */}
      <div className="w-auto">
        <Link href="/" className="font-bold text-lg text-blue-600">
          KAMWALE
        </Link>
      </div>
      
      {/* RIGHT - Notifications and User button */}
      <div className="flex items-center gap-3 justify-end">
        {/* Notifications Icon */}
        <ClerkLoaded>
          <SignedIn>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <Heart 
                  className={`w-6 h-6 ${showNotifications ? "fill-blue-600 text-blue-600" : "text-gray-700"}`}
                />
                {unreadNotifCount > 0 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </div>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                  <div className="overflow-y-auto max-h-80">
                    <NotificationDropUp
                      onNotificationClick={handleNotificationClick}
                      onClose={() => setShowNotifications(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          </SignedIn>
        </ClerkLoaded>

        <ClerkLoading>
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-solid border-current border-e-transparent" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-2 text-sm">
              <Image src="/login.png" alt="" width={20} height={20} />
              <Link href="/sign-in">Login</Link>
            </div>
          </SignedOut>
        </ClerkLoaded>
      </div>
    </div>
  );
};

export default Navbar;
