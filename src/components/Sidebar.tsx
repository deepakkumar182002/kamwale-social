"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

interface SidebarProps {
  onNotificationClick: () => void;
  isNotificationOpen: boolean;
  onMessageClick: () => void;
  isMessageOpen: boolean;
}

const Sidebar = ({ 
  onNotificationClick, 
  isNotificationOpen,
  onMessageClick,
  isMessageOpen 
}: SidebarProps) => {
  const [showMore, setShowMore] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const pathname = usePathname();

  const mainMenuItems = [
    { href: "/", icon: "/home.png", label: "Home", onClick: null },
    { href: "/search", icon: "/search.png", label: "Search", onClick: null },
    { href: "/friends", icon: "/friends.png", label: "Friends", onClick: null },
    { href: "/stories", icon: "/stories.png", label: "Stories", onClick: null },
  ];

  const moreMenuItems = [
    { href: "/groups", icon: "/groups.png", label: "Groups" },
    { href: "/events", icon: "/events.png", label: "Events" },
    { href: "/videos", icon: "/videos.png", label: "Videos" },
    { href: "/marketplace", icon: "/market.png", label: "Marketplace" },
    { href: "/settings", icon: "/settings.png", label: "Settings" },
  ];

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
    // Refresh every 10 seconds
    const interval = setInterval(fetchNotificationCount, 10000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  // Refresh when notification panel closes
  useEffect(() => {
    if (!isNotificationOpen) {
      setRefreshKey(prev => prev + 1);
    }
  }, [isNotificationOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex-col z-40 transition-all duration-300 ${
        isNotificationOpen || isMessageOpen ? 'w-20' : 'w-64 xl:w-72'
      }`}>
        {/* Logo */}
        <div className={`p-6 border-b border-gray-200 ${isNotificationOpen || isMessageOpen ? 'hidden' : 'block'}`}>
          <Link href="/" className="font-bold text-2xl text-blue-600">
            KAMWALE
          </Link>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <nav className="flex flex-col gap-1 px-3">
            {mainMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 ${
                  pathname === item.href ? "bg-gray-100 font-semibold" : ""
                }`}
                title={isNotificationOpen || isMessageOpen ? item.label : undefined}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <span className={`text-base ${isNotificationOpen || isMessageOpen ? 'hidden' : 'block'}`}>{item.label}</span>
              </Link>
            ))}

            {/* Messages - Special Button */}
            <button
              onClick={onMessageClick}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 w-full text-left ${
                isMessageOpen ? "bg-gray-100 font-semibold" : ""
              }`}
              title={isMessageOpen ? "Messages" : undefined}
            >
              <Image
                src="/messages.png"
                alt="Messages"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className={`text-base ${isNotificationOpen || isMessageOpen ? 'hidden' : 'block'}`}>Messages</span>
            </button>

            {/* Notifications - Special Button */}
            <button
              onClick={onNotificationClick}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 w-full text-left ${
                isNotificationOpen ? "bg-gray-100 font-semibold" : ""
              }`}
              title={isNotificationOpen ? "Notifications" : undefined}
            >
              <div className="relative">
                <Image
                  src="/notifications.png"
                  alt="Notifications"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                {unreadNotifCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </div>
                )}
              </div>
              <span className={`text-base ${isNotificationOpen || isMessageOpen ? 'hidden' : 'block'}`}>Notifications</span>
            </button>

            {/* More Button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 w-full text-left"
              title={isNotificationOpen || isMessageOpen ? "More" : undefined}
            >
              <Image
                src="/more.png"
                alt="More"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className={`text-base ${isNotificationOpen || isMessageOpen ? 'hidden' : 'block'}`}>More</span>
            </button>

            {/* More Menu Items */}
            {showMore && !isNotificationOpen && !isMessageOpen && (
              <div className="ml-4 mt-1 border-l-2 border-gray-200 pl-4 space-y-1">
                {moreMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 ${
                      pathname === item.href ? "bg-gray-100 font-semibold" : ""
                    }`}
                  >
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Create Post Button */}
            {!isNotificationOpen && !isMessageOpen && (
              <div className="mt-4 px-4">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Create Post
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* User Button at Bottom */}
        <div className="border-t border-gray-200 p-4">
          {isNotificationOpen || isMessageOpen ? (
            <div className="flex justify-center">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10"
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10"
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Profile & Settings</p>
                <p className="text-xs text-gray-500 truncate">Manage your account</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile - Keep BottomNav for mobile */}
    </>
  );
};

export default Sidebar;
