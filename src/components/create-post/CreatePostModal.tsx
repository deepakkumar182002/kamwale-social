"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import PhotoPost from "./post-types/PhotoPost";
import VideoPost from "./post-types/VideoPost";
import ArticlePost from "./post-types/ArticlePost";
import PollPost from "./post-types/PollPost";
import EventPost from "./post-types/EventPost";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  initialType?: "text" | "photo" | "video" | "article" | "poll" | "event";
}

const CreatePostModal = ({ 
  isOpen, 
  onClose, 
  onPostCreated,
  initialType = "text" 
}: CreatePostModalProps) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState(initialType);

  if (!isOpen) return null;

  const tabs = [
    { id: "text", label: "Text", icon: "/posts.png" },
    { id: "photo", label: "Photo", icon: "/addimage.png" },
    { id: "video", label: "Video", icon: "/addVideo.png" },
    { id: "article", label: "Article", icon: "/news.png" },
    { id: "poll", label: "Poll", icon: "/poll.png" },
    { id: "event", label: "Event", icon: "/addevent.png" },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 md:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 md:p-4 flex justify-between items-center rounded-t-lg z-10">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl leading-none w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
          >
            ×
          </button>
        </div>

        {/* User Info */}
        <div className="p-3 md:p-4 border-b border-gray-200 flex items-center gap-3">
          <Image
            src={user?.imageUrl || "/noAvatar.png"}
            alt=""
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-800 text-sm md:text-base">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs md:text-sm text-gray-500">@{user?.username}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              <Image 
                src={tab.icon} 
                alt={tab.label} 
                width={20} 
                height={20}
                className="w-4 h-4 md:w-5 md:h-5"
              />
              <span className="text-xs md:text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-3 md:p-4">
          {activeTab === "text" && (
            <PhotoPost 
              onClose={onClose} 
              onPostCreated={onPostCreated} 
              isTextOnly={true}
            />
          )}
          {activeTab === "photo" && (
            <PhotoPost 
              onClose={onClose} 
              onPostCreated={onPostCreated} 
            />
          )}
          {activeTab === "video" && (
            <VideoPost 
              onClose={onClose} 
              onPostCreated={onPostCreated} 
            />
          )}
          {activeTab === "article" && (
            <ArticlePost 
              onClose={onClose} 
              onPostCreated={onPostCreated} 
            />
          )}
          {activeTab === "poll" && (
            <PollPost 
              onClose={onClose} 
              onPostCreated={onPostCreated} 
            />
          )}
          {activeTab === "event" && (
            <EventPost 
              onClose={onClose} 
              onPostCreated={onPostCreated} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
