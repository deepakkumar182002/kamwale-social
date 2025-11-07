"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import NotificationPanel from "@/components/NotificationPanel";
import MessagePanel from "@/components/MessagePanel";
import SearchPanel from "@/components/SearchPanel";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import UserInitializer from "@/components/UserInitializer";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(undefined);

  const handleNotificationToggle = () => {
    // Close other panels first
    if (isMessageOpen) setIsMessageOpen(false);
    if (isSearchOpen) setIsSearchOpen(false);
    // Toggle notification panel
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleMessageToggle = () => {
    // Close other panels first
    if (isNotificationOpen) setIsNotificationOpen(false);
    if (isSearchOpen) setIsSearchOpen(false);
    // Toggle message panel
    setIsMessageOpen(!isMessageOpen);
  };

  const handleSearchToggle = () => {
    // Close other panels first
    if (isNotificationOpen) setIsNotificationOpen(false);
    if (isMessageOpen) setIsMessageOpen(false);
    // Toggle search panel
    setIsSearchOpen(!isSearchOpen);
  };

  const handleExpandSidebar = () => {
    // Close all panels to restore full sidebar width
    setIsNotificationOpen(false);
    setIsMessageOpen(false);
    setIsSearchOpen(false);
  };

  const handleOpenMessageFromNotification = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsNotificationOpen(false);
    setIsMessageOpen(true);
  };

  return (
    <>
      {/* User Initializer - Creates user in DB on first load */}
      <UserInitializer />
      
      {/* Desktop Sidebar - Hidden on mobile and tablet */}
      <div className="hidden lg:block">
        <Sidebar 
          onNotificationClick={handleNotificationToggle}
          isNotificationOpen={isNotificationOpen}
          onMessageClick={handleMessageToggle}
          isMessageOpen={isMessageOpen}
          onSearchClick={handleSearchToggle}
          isSearchOpen={isSearchOpen}
          onExpandSidebar={handleExpandSidebar}
        />
      </div>
      
      {/* Search Panel - Desktop only */}
      <div className="hidden lg:block">
        <SearchPanel 
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>
      
      {/* Notification Panel - Desktop only */}
      <div className="hidden lg:block">
        <NotificationPanel 
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          onOpenMessage={handleOpenMessageFromNotification}
        />
      </div>
      
      {/* Message Panel - Desktop only */}
      <div className="hidden lg:block">
        <MessagePanel 
          isOpen={isMessageOpen}
          onClose={() => setIsMessageOpen(false)}
          selectedChatId={selectedChatId}
          onChatSelect={(chatId) => setSelectedChatId(chatId)}
        />
      </div>

      {/* Mobile: Fixed top navbar */}
      <div className="lg:hidden w-full bg-white sticky top-0 z-50 border-b border-gray-200 px-4">
        <Navbar />
      </div>

      {/* Main Content - Responsive padding and margins */}
      <div className={`bg-slate-100 dark:bg-gray-950 min-h-screen transition-all duration-300 ${
        isNotificationOpen 
          ? 'lg:ml-[464px]' 
          : isMessageOpen
          ? 'lg:ml-[464px]'
          : isSearchOpen
          ? 'lg:ml-[464px]'
          : 'lg:ml-64 xl:ml-72'
      }`}>
        {/* Content area with proper max-width and responsive padding */}
        <div className="w-full max-w-[1400px] mx-auto px-0 lg:px-4 xl:px-8 pb-20 lg:pb-6">
          {children}
        </div>
      </div>
      
      {/* Mobile: Fixed bottom navigation */}
      <BottomNav />
    </>
  );
}
