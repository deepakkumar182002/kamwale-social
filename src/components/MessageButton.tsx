"use client";

import { useState } from "react";
import Image from "next/image";
import ChatModal from "./ChatModal";

interface MessageButtonProps {
  userId: string;
  username: string;
}

const MessageButton = ({ userId, username }: MessageButtonProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleMessageClick = () => {
    setIsChatOpen(true);
  };

  return (
    <>
      <button
        onClick={handleMessageClick}
        className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-1.5 rounded-lg transition-colors font-semibold text-sm"
      >
        <span>Message</span>
      </button>

      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        initialUserId={userId}
      />
    </>
  );
};

export default MessageButton;
