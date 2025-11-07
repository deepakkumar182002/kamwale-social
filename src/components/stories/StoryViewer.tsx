"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause, MoreVertical, Trash2, AlertCircle, Send, Hand } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface StoryViewerProps {
  stories: any[];
  currentUserIndex: number;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function StoryViewer({ stories, currentUserIndex, onClose, onRefresh }: StoryViewerProps) {
  const { user } = useUser();
  const [userIndex, setUserIndex] = useState(currentUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [comment, setComment] = useState("");
  const [hasRaisedHand, setHasRaisedHand] = useState(false);

  const currentUserStories = stories[userIndex];
  const currentStory = currentUserStories.stories[storyIndex];
  const isOwn = currentUserStories.isOwn;

  const STORY_DURATION = 15000; // 15 seconds like Instagram
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Progress bar animation with pause support
  useEffect(() => {
    if (isPaused) return;

    const startProgress = () => {
      startTimeRef.current = Date.now() - pausedTimeRef.current;

      const updateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const progressPercent = (elapsed / STORY_DURATION) * 100;

        if (progressPercent >= 100) {
          setProgress(100);
          handleNext();
        } else {
          setProgress(progressPercent);
          timerRef.current = requestAnimationFrame(updateProgress) as any;
        }
      };

      updateProgress();
    };

    startProgress();

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current as any);
    };
  }, [userIndex, storyIndex, isPaused]);

  // Save pause time
  useEffect(() => {
    if (isPaused) {
      pausedTimeRef.current = (progress / 100) * STORY_DURATION;
    }
  }, [isPaused, progress]);

  // Reset progress on story change
  useEffect(() => {
    setProgress(0);
    pausedTimeRef.current = 0;
    setIsPaused(false);
    markAsViewed();
  }, [currentStory.id]);

  // Control video playback
  useEffect(() => {
    if (currentStory.type === "video" && videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.log("Video play error:", err));
      }
    }
  }, [isPaused, currentStory.type]);

  const handleNext = () => {
    if (storyIndex < currentUserStories.stories.length - 1) {
      // Next story in same user
      setStoryIndex(storyIndex + 1);
    } else if (userIndex < stories.length - 1) {
      // Next user's stories
      setUserIndex(userIndex + 1);
      setStoryIndex(0);
    } else {
      // All stories finished - auto close
      onClose();
    }
  };

  const handlePrevious = () => {
    if (storyIndex > 0) {
      // Previous story in same user
      setStoryIndex(storyIndex - 1);
    } else if (userIndex > 0) {
      // Previous user's stories (go to last story)
      setUserIndex(userIndex - 1);
      const prevUser = stories[userIndex - 1];
      setStoryIndex(prevUser.stories.length - 1);
    }
    // If first story of first user, do nothing
  };

  const handleDelete = async () => {
    if (!isOwn) return;

    try {
      const response = await fetch(`/api/stories/${currentStory.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (onRefresh) onRefresh();
        handleNext();
      }
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  const markAsViewed = async () => {
    if (isOwn || currentStory.hasViewed) return;

    try {
      await fetch(`/api/stories/${currentStory.id}/view`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error marking story as viewed:", error);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await fetch(`/api/stories/${currentStory.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: comment }),
      });

      if (response.ok) {
        // Show success (you can add a toast notification here)
        setComment("");
        alert(`Message sent to ${currentUserStories.user.username}`);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  const handleRaiseHand = async () => {
    if (isOwn) return;
    
    try {
      const response = await fetch(`/api/stories/${currentStory.id}/raise-hand`, {
        method: "POST",
      });

      if (response.ok) {
        setHasRaisedHand(!hasRaisedHand);
        // Show success feedback
        if (!hasRaisedHand) {
          // Raised hand successfully
          console.log("Raised hand for story:", currentStory.id);
        }
      } else {
        const error = await response.json();
        console.error("Failed to raise hand:", error.message);
      }
    } catch (error) {
      console.error("Error raising hand:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[99999]">
      {/* Story container - Full Screen */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-50 max-w-2xl mx-auto">
          {currentUserStories.stories.map((story: any, index: number) => (
            <div key={story.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white ${
                  index < storyIndex ? "w-full" : index === storyIndex ? "" : "w-0"
                }`}
                style={
                  index === storyIndex
                    ? { width: `${Math.min(progress, 100)}%`, transition: isPaused ? 'none' : 'width 0.1s linear' }
                    : undefined
                }
              />
            </div>
          ))}
        </div>

        {/* Top Controls Bar */}
        <div className="absolute top-3 left-0 right-0 px-4 z-50 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {/* User Info */}
            <div className="flex items-center gap-2">
              <Image
                src={currentUserStories.user.avatar || "/noAvatar.png"}
                alt={currentUserStories.user.username}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full ring-2 ring-white object-cover"
              />
              <div className="text-white text-sm">
                <p className="font-semibold">
                  {currentUserStories.user.name && currentUserStories.user.surname
                    ? `${currentUserStories.user.name} ${currentUserStories.user.surname}`
                    : currentUserStories.user.username}
                </p>
              </div>
            </div>

            {/* Top Right Controls */}
            <div className="flex items-center gap-1">
              {/* Play/Pause Button */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                title={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </button>

              {/* Speaker On/Off (for video) */}
              {currentStory.type === "video" && (
                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                    }
                  }}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              )}

              {/* Three Dots Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <MoreVertical size={20} />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden">
                    {isOwn ? (
                      <>
                        <button
                          onClick={handleDelete}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 text-red-600"
                        >
                          <Trash2 size={18} />
                          <span className="font-medium">Delete Story</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3">
                          <AlertCircle size={18} />
                          <span>About this account</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 border-t"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Previous Button */}
        {(userIndex > 0 || storyIndex > 0) && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-3 z-40 transition-colors"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        {/* Next Button */}
        {(userIndex < stories.length - 1 || storyIndex < currentUserStories.stories.length - 1) && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-3 z-40 transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        )}

        {/* Story content - Full screen with max width */}
        <div className="w-full h-full max-w-2xl mx-auto relative">
          <div 
            className="w-full h-full flex items-center justify-center"
            onClick={(e) => {
              // Only toggle pause on content click
              if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
                setIsPaused(!isPaused);
              }
            }}
          >
            {currentStory.type === "text" && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-8">
                <p className="text-white text-2xl md:text-4xl font-bold text-center break-words max-w-xl">
                  {currentStory.content}
                </p>
              </div>
            )}

            {currentStory.type === "photo" && (
              <div className="relative w-full h-full">
                <Image
                  src={currentStory.img}
                  alt="Story"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}

            {currentStory.type === "video" && (
              <video
                ref={videoRef}
                src={currentStory.video}
                className="w-full h-full object-contain"
                autoPlay
                loop
                playsInline
                controls={false}
                muted={isMuted}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(!isPaused);
                }}
              />
            )}

            {/* Pause indicator */}
            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-30">
                <div className="bg-black/50 rounded-full p-4">
                  <Pause size={48} className="text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Comment & Raise Hand Section - Only for other's stories */}
          {!isOwn && (
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent z-40">
              <form onSubmit={handleSendComment} className="flex items-center gap-2">
                {/* Raise Hand Button */}
                <button
                  type="button"
                  onClick={handleRaiseHand}
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    hasRaisedHand 
                      ? "bg-yellow-500 text-white scale-110" 
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <Hand size={24} className={hasRaisedHand ? "animate-bounce" : ""} />
                </button>

                {/* Comment Input */}
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Send message to ${currentUserStories.user.username}...`}
                  className="flex-1 bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaused(true);
                  }}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                  <Send size={20} className="text-white" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
