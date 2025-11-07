"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateStoryModal from "./stories/CreateStoryModal";

const Stories = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stories');
      if (response.ok) {
        const data = await response.json();
        
        // Add isOwn flag to each story group
        const processedData = data.map((group: any) => ({
          ...group,
          isOwn: user?.id === group.user.id,
        }));
        
        setStories(processedData);
      } else {
        console.error('Failed to fetch stories:', response.status);
        setStories([]);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchStories();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchStories, 30000);
      return () => clearInterval(interval);
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [user, isLoaded]);

  const handleStoryClick = (username: string) => {
    // Navigate to story page with username
    router.push(`/stories/${username}`);
  };

  const handleCreateSuccess = () => {
    fetchStories(); // Refresh stories after creating
  };

  if (!isLoaded || loading) {
    return (
      <div className="p-3 md:p-4 bg-white md:rounded-lg md:shadow-md border-b md:border border-gray-200 overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div className="flex gap-4 w-max animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200"></div>
              <div className="w-12 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Find current user's stories
  const ownStories = stories.find((s) => s.user.username === user.username);
  const othersStories = stories.filter((s) => s.user.username !== user.username);

  return (
    <>
      <div className="p-3 md:p-4 bg-white md:rounded-lg md:shadow-md border-b md:border border-gray-200 overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div className="flex gap-3 md:gap-4 w-max">
          {/* Create/Add Story Button - Always First */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <div className="relative">
              {ownStories ? (
                // If has stories, show + icon on gray background
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-300">
                  <Plus size={32} className="text-blue-500" />
                </div>
              ) : (
                // If no stories, show user avatar with + badge
                <>
                  <Image
                    src={user.imageUrl || "/noAvatar.png"}
                    alt="Create story"
                    width={80}
                    height={80}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-gray-300"
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Plus size={16} className="text-white" />
                  </div>
                </>
              )}
            </div>
            <span className="text-xs font-medium text-gray-700">
              {ownStories ? "Add Story" : "Your Story"}
            </span>
          </div>

          {/* Own Stories (if any) */}
          {ownStories && (
            <div
              onClick={() => handleStoryClick(user.username || user.id)}
              className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <div className="relative">
                <Image
                  src={user.imageUrl || "/noAvatar.png"}
                  alt="Your story"
                  width={80}
                  height={80}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-blue-500"
                />
                {ownStories.stories.length > 1 && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold text-blue-500 border border-blue-500">
                    {ownStories.stories.length}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-gray-700">Your Story</span>
            </div>
          )}

          {/* Others' Stories */}
          {othersStories.map((storyGroup: any, index: number) => {
            const hasUnviewed = storyGroup.stories.some((s: any) => !s.hasViewed);

            return (
              <div
                key={storyGroup.user.id}
                onClick={() => handleStoryClick(storyGroup.user.username)}
                className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
              >
                <div className="relative">
                  <Image
                    src={storyGroup.user.avatar || "/noAvatar.png"}
                    alt={storyGroup.user.username}
                    width={80}
                    height={80}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ${
                      hasUnviewed ? "ring-blue-500" : "ring-gray-400"
                    }`}
                  />
                  {storyGroup.stories.length > 1 && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold text-blue-500 border border-blue-500">
                      {storyGroup.stories.length}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700 truncate max-w-[64px] md:max-w-[80px]">
                  {storyGroup.user.name || storyGroup.user.username}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
};

export default Stories;
