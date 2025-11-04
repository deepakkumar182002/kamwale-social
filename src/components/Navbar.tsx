"use client";

import Link from "next/link";
import MobileMenu from "./MobileMenu";
import Image from "next/image";
import ChatModal from "./ChatModal";
import NotificationIcon from "./NotificationIcon";
import { useState } from "react";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const Navbar = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialUserId, setInitialUserId] = useState<string | undefined>(undefined);

  const handleOpenChat = (userId?: string) => {
    setInitialUserId(userId);
    setIsChatOpen(true);
  };

  return (
    <div className="h-16 flex items-center justify-between">
      {/* LEFT - Mobile only logo */}
      <div className="w-auto">
        <Link href="/" className="font-bold text-lg text-blue-600">
          KAMWALE
        </Link>
      </div>
      
      {/* RIGHT - Icons for mobile */}
      <div className="flex items-center gap-3 justify-end">
        <ClerkLoading>
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-solid border-current border-e-transparent" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <div 
              className="cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => handleOpenChat()}
            >
              <Image src="/messages.png" alt="Messages" width={24} height={24} />
            </div>
            <NotificationIcon onOpenChat={handleOpenChat} />
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-2 text-sm">
              <Image src="/login.png" alt="" width={20} height={20} />
              <Link href="/sign-in">Login</Link>
            </div>
          </SignedOut>
        </ClerkLoaded>
        <MobileMenu />
      </div>

      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => {
          setIsChatOpen(false);
          setInitialUserId(undefined);
        }} 
        initialUserId={initialUserId}
      />
    </div>
  );
};

export default Navbar;
