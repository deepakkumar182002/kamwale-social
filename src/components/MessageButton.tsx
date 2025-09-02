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
        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
      >
        <Image src="/messages.png" alt="" width={16} height={16} />
        <span>Message</span>
      </button>

      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        initialUserId={userId} // We'll add this prop to open chat with specific user
      />
    </>
  );
};

export default MessageButton;
