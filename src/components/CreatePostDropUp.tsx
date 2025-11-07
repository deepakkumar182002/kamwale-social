"use client";

import { useState } from "react";
import Image from "next/image";
import CreatePostModal from "./create-post/CreatePostModal";

const CreatePostDropUp = ({ onClose }: { onClose: () => void }) => {
  const [selectedType, setSelectedType] = useState<"text" | "photo" | "video" | "article" | "poll" | "event" | null>(null);

  const postTypes = [
    { id: "text" as const, label: "Text Post", icon: "/posts.png", desc: "Share your thoughts" },
    { id: "photo" as const, label: "Photo", icon: "/addimage.png", desc: "Share photos" },
    { id: "video" as const, label: "Video", icon: "/addVideo.png", desc: "Share videos" },
    { id: "article" as const, label: "Article", icon: "/news.png", desc: "Write an article" },
    { id: "poll" as const, label: "Poll", icon: "/poll.png", desc: "Create a poll" },
    { id: "event" as const, label: "Event", icon: "/addevent.png", desc: "Create an event" },
  ];

  return (
    <>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          What would you like to create?
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {postTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            >
              <Image
                src={type.icon}
                alt={type.label}
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div className="text-center">
                <p className="font-semibold text-sm text-gray-800 dark:text-white">
                  {type.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {type.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Full-featured Create Post Modal */}
      {selectedType && (
        <CreatePostModal
          isOpen={true}
          onClose={() => {
            setSelectedType(null);
            onClose();
          }}
          onPostCreated={() => {
            setSelectedType(null);
            onClose();
          }}
          initialType={selectedType}
        />
      )}
    </>
  );
};

export default CreatePostDropUp;
