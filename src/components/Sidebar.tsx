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
  onSearchClick: () => void;
  isSearchOpen: boolean;
  onExpandSidebar: () => void;
}

const Sidebar = ({ 
  onNotificationClick, 
  isNotificationOpen,
  onMessageClick,
  isMessageOpen,
  onSearchClick,
  isSearchOpen,
  onExpandSidebar 
}: SidebarProps) => {
  const [showMore, setShowMore] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const pathname = usePathname();

  const mainMenuItems = [
    { href: "/", icon: "/home.png", label: "Home", onClick: null },
    { href: null, icon: "/search.png", label: "Search", onClick: onSearchClick },
    { href: "/explore", icon: "/people.png", label: "Explore", onClick: null },
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
      {/* Desktop Sidebar - Only visible on large screens (1024px+) */}
      <div className={`hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex-col z-40 transition-all duration-300 ${
        isNotificationOpen || isMessageOpen || isSearchOpen ? 'w-20' : 'w-64 xl:w-72'
      }`}>
        {/* Logo */}
        <div className={`p-6 border-b border-gray-200 ${isNotificationOpen || isMessageOpen || isSearchOpen ? 'flex justify-center' : 'flex items-center'}`}>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/main_logo.png"
              alt="Kamwale Logo"
              width={40}
              height={40}
              className={`w-10 h-10 ${isNotificationOpen || isMessageOpen || isSearchOpen ? 'block' : 'hidden'}`}
            />
            <span className={`font-bold text-3xl bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400 bg-clip-text text-transparent ${isNotificationOpen || isMessageOpen || isSearchOpen ? 'hidden' : 'block'}`} style={{ fontFamily: "'Pacifico', 'Segoe Script', cursive" }}>
              Kamwale
            </span>
          </Link>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <nav className="flex flex-col gap-1 px-3">
            {mainMenuItems.map((item) => (
              item.onClick ? (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-100 w-full text-left ${
                    (item.label === "Search" && isSearchOpen) ? "bg-gray-100 font-semibold" : ""
                  }`}
                  title={isNotificationOpen || isMessageOpen || isSearchOpen ? item.label : undefined}
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className={`text-sm ${isNotificationOpen || isMessageOpen || isSearchOpen ? 'hidden' : 'block'}`}>{item.label}</span>
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-100 ${
                    pathname === item.href ? "bg-gray-100 font-semibold" : ""
                  }`}
                  title={isNotificationOpen || isMessageOpen || isSearchOpen ? item.label : undefined}
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className={`text-sm ${isNotificationOpen || isMessageOpen || isSearchOpen ? 'hidden' : 'block'}`}>{item.label}</span>
                </Link>
              )
            ))}

            {/* Messages - Special Button */}
            <button
              onClick={onMessageClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-100 w-full text-left ${
                isMessageOpen ? "bg-gray-100 font-semibold" : ""
              }`}
              title={isMessageOpen ? "Messages" : undefined}
            >
              <Image
                src="/messages.png"
                alt="Messages"
                width={20}
                height={20}
                className="w-5 h-5"
              />
              <span className={`text-sm ${isNotificationOpen || isMessageOpen || isSearchOpen ? 'hidden' : 'block'}`}>Messages</span>
            </button>

            {/* Notifications - Special Button */}
            <button
              onClick={onNotificationClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-100 w-full text-left ${
                isNotificationOpen ? "bg-gray-100 font-semibold" : ""
              }`}
              title={isNotificationOpen ? "Notifications" : undefined}
            >
              <div className="relative">
                <Image
                  src="/notifications.png"
                  alt="Notifications"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                {unreadNotifCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </div>
                )}
              </div>
              <span className={`text-sm ${isNotificationOpen || isMessageOpen || isSearchOpen ? 'hidden' : 'block'}`}>Notifications</span>
            </button>

            {/* More Button */}
            <button
              onClick={() => {
                if (isNotificationOpen || isMessageOpen || isSearchOpen) {
                  // When sidebar is narrow, expand it
                  onExpandSidebar();
                } else {
                  // When sidebar is wide, toggle more menu
                  setShowMore(!showMore);
                }
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-100 w-full text-left"
              title={isNotificationOpen || isMessageOpen || isSearchOpen ? "More" : undefined}
            >
              {isNotificationOpen || isMessageOpen || isSearchOpen ? (
                // Show three dots when sidebar is narrow
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                  <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                  <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                </div>
              ) : (
                <>
                  <Image
                    src="/more.png"
                    alt="More"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className="text-sm">More</span>
                </>
              )}
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
