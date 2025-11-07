"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postContent: string;
  postAuthor: string;
  postAuthorAvatar?: string;
}

const SharePostModal = ({
  isOpen,
  onClose,
  postId,
  postContent,
  postAuthor,
  postAuthorAvatar,
}: SharePostModalProps) => {
  const [activeTab, setActiveTab] = useState<"internal" | "external">("external");
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  const postUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/posts/${postId}`;

  // Load user's conversations when internal tab is active
  useEffect(() => {
    if (activeTab === "internal" && isOpen) {
      loadConversations();
    }
  }, [activeTab, isOpen]);

  const loadConversations = async () => {
    setIsLoadingChats(true);
    try {
      const response = await fetch("/api/chats");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleShareToChat = async () => {
    if (!selectedChat || isSending) return;

    setIsSending(true);
    try {
      const shareMessage = message 
        ? `${message}\n\nShared post: ${postUrl}`
        : `Check out this post from ${postAuthor}: ${postUrl}`;

      const response = await fetch(`/api/chats/${selectedChat}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: shareMessage,
        }),
      });

      if (response.ok) {
        setMessage("");
        setSelectedChat(null);
        onClose();
      }
    } catch (error) {
      console.error("Error sharing to chat:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleExternalShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedText = encodeURIComponent(
      `Check out this post from ${postAuthor}: ${postContent.slice(0, 100)}...`
    );

    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(
          `Post from ${postAuthor}`
        )}&body=${encodedText}%20${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleWebShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `Post from ${postAuthor}`,
          text: postContent.slice(0, 100),
          url: postUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Share Post</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-center font-medium transition ${
              activeTab === "external"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("external")}
          >
            Share Externally
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium transition ${
              activeTab === "internal"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("internal")}
          >
            Send to Message
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "external" ? (
            <div className="space-y-4">
              {/* Web Share API (Mobile) */}
              {typeof window !== "undefined" && typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  onClick={handleWebShare}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">📱</span>
                  </div>
                  <span className="font-medium">Share via...</span>
                </button>
              )}

              {/* Copy Link */}
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
                <span className="font-medium">Copy Link</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleExternalShare("whatsapp")}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">💬</span>
                </div>
                <span className="font-medium">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleExternalShare("facebook")}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">f</span>
                </div>
                <span className="font-medium">Facebook</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleExternalShare("linkedin")}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">in</span>
                </div>
                <span className="font-medium">LinkedIn</span>
              </button>

              {/* Twitter */}
              <button
                onClick={() => handleExternalShare("twitter")}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">🐦</span>
                </div>
                <span className="font-medium">Twitter</span>
              </button>

              {/* Email */}
              <button
                onClick={() => handleExternalShare("email")}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">📧</span>
                </div>
                <span className="font-medium">Email</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {isLoadingChats ? (
                <div className="text-center py-8 text-gray-500">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No conversations yet</div>
              ) : (
                <>
                  {/* Conversation List */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-2">Select a conversation:</p>
                    {conversations.map((chat) => {
                      const otherUser = chat.users.find((u: any) => u.id !== chat.currentUserId);
                      return (
                        <button
                          key={chat.id}
                          onClick={() => setSelectedChat(chat.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                            selectedChat === chat.id
                              ? "bg-blue-100 border-2 border-blue-500"
                              : "hover:bg-gray-100 border-2 border-transparent"
                          }`}
                        >
                          <Image
                            src={otherUser?.avatar || "/noAvatar.png"}
                            alt={otherUser?.username || "User"}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                          <span className="font-medium">
                            {otherUser?.username || "Unknown User"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  {selectedChat && (
                    <div className="space-y-3 mt-4 pt-4 border-t">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message (optional)"
                        className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <button
                        onClick={handleShareToChat}
                        disabled={isSending}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isSending ? "Sending..." : "Send to Chat"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharePostModal;
