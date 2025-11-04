"use client";

import { Inter } from "next/font/google";
// @ts-ignore: side-effect CSS import has no type declarations
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import NotificationPanel from "@/components/NotificationPanel";
import MessagePanel from "@/components/MessagePanel";
import MessageView from "@/components/MessageView";
import { ClerkProvider } from "@clerk/nextjs";
import { useState, Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(undefined);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleNotificationToggle = () => {
    if (isMessageOpen) setIsMessageOpen(false);
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleMessageToggle = () => {
    if (isNotificationOpen) setIsNotificationOpen(false);
    setIsMessageOpen(!isMessageOpen);
  };

  const handleOpenMessageFromNotification = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsNotificationOpen(false);
    setIsMessageOpen(true);
  };

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* Desktop: Fixed left sidebar */}
          <Sidebar 
            onNotificationClick={handleNotificationToggle}
            isNotificationOpen={isNotificationOpen}
            onMessageClick={handleMessageToggle}
            isMessageOpen={isMessageOpen}
          />
          
          {/* Notification Panel */}
          <NotificationPanel 
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            onOpenMessage={handleOpenMessageFromNotification}
          />
          
          {/* Message Panel */}
          <MessagePanel 
            isOpen={isMessageOpen}
            onClose={() => setIsMessageOpen(false)}
            selectedChatId={selectedChatId}
            onChatSelect={(chatId) => setSelectedChatId(chatId)}
          />
          
          {/* Mobile: Fixed top navbar */}
          <div className="lg:hidden w-full bg-white sticky top-0 z-50 border-b border-gray-200 px-4">
            <Navbar />
          </div>
          
          {/* Main Content - Offset for sidebar on desktop */}
          <div className={`bg-slate-100 min-h-screen transition-all duration-300 ${
            isNotificationOpen 
              ? 'lg:ml-[480px]' 
              : isMessageOpen
              ? 'hidden lg:block'
              : 'lg:ml-64 xl:ml-72'
          }`}>
            {/* Content area */}
            <div className="px-0 lg:px-8 xl:px-16 pb-20 lg:pb-6">
              {children}
            </div>
          </div>
          
          {/* Mobile: Fixed bottom navigation */}
          <BottomNav />
          
          {/* Mobile: Full Screen Message View */}
          <Suspense fallback={<div></div>}>
            <MessageView />
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
