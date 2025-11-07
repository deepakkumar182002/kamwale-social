"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import CreatePostModal from "./create-post/CreatePostModal";

const AddPost = ({ 
  onNewPost, 
  onPostCreated 
}: { 
  onNewPost?: (post: any) => void;
  onPostCreated?: () => void;
}) => {
  const { user, isLoaded } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialPostType, setInitialPostType] = useState<"text" | "photo" | "video" | "article" | "poll" | "event">("text");

  if (!isLoaded) {
    return "Loading...";
  }

  const openModal = (type: "text" | "photo" | "video" | "article" | "poll" | "event" = "text") => {
    setInitialPostType(type);
    setIsModalOpen(true);
  };

  const handlePostCreated = () => {
    setIsModalOpen(false);
    onPostCreated?.();
  };

  return (
    <>
      <div className="p-3 md:p-4 bg-white md:shadow-md md:rounded-lg flex gap-3 md:gap-4 justify-between text-sm">
        {/* AVATAR */}
        <Image
          src={user?.imageUrl || "/noAvatar.png"}
          alt=""
          width={48}
          height={48}
          className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full flex-shrink-0"
        />
        {/* POST */}
        <div className="flex-1 min-w-0">
          {/* TEXT INPUT */}
          <div 
            onClick={() => openModal("text")}
            className="flex-1 bg-slate-100 rounded-lg p-2 md:p-3 cursor-pointer hover:bg-slate-200 transition-colors"
          >
            <p className="text-gray-500 text-sm md:text-base">What&apos;s on your mind?</p>
          </div>
          
          {/* POST OPTIONS */}
          <div className="flex items-center gap-2 md:gap-4 mt-3 md:mt-4 text-gray-400 overflow-x-auto hide-scrollbar">
            <div
              className="flex items-center gap-1 md:gap-2 cursor-pointer hover:text-gray-600 transition-colors whitespace-nowrap flex-shrink-0"
              onClick={() => openModal("photo")}
            >
              <Image src="/addimage.png" alt="" width={18} height={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">Photo</span>
            </div>
            <div
              className="flex items-center gap-1 md:gap-2 cursor-pointer hover:text-gray-600 transition-colors whitespace-nowrap flex-shrink-0"
              onClick={() => openModal("video")}
            >
              <Image src="/addVideo.png" alt="" width={18} height={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">Video</span>
            </div>
            <div 
              className="flex items-center gap-1 md:gap-2 cursor-pointer hover:text-gray-600 transition-colors whitespace-nowrap flex-shrink-0"
              onClick={() => openModal("article")}
            >
              <Image src="/news.png" alt="" width={18} height={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">Article</span>
            </div>
            <div 
              className="flex items-center gap-1 md:gap-2 cursor-pointer hover:text-gray-600 transition-colors whitespace-nowrap flex-shrink-0"
              onClick={() => openModal("poll")}
            >
              <Image src="/poll.png" alt="" width={18} height={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">Poll</span>
            </div>
            <div 
              className="flex items-center gap-1 md:gap-2 cursor-pointer hover:text-gray-600 transition-colors whitespace-nowrap flex-shrink-0"
              onClick={() => openModal("event")}
            >
              <Image src="/addevent.png" alt="" width={18} height={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">Event</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
        initialType={initialPostType}
      />
    </>
  );
};

export default AddPost;
