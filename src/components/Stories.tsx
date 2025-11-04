"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import StoryList from "./StoryList";

const Stories = () => {
  const { user, isLoaded } = useUser();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stories');
        if (response.ok) {
          const data = await response.json();
          setStories(data);
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

    if (isLoaded && user) {
      fetchStories();
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [user, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="p-3 md:p-4 bg-white md:rounded-lg md:shadow-md border-b md:border border-gray-200 overflow-x-auto overflow-y-hidden text-xs scrollbar-hide">
        <div className="flex gap-4 md:gap-8 w-max animate-pulse">
          <div className="flex flex-col items-center gap-2 cursor-pointer">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200"></div>
            <div className="w-12 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-3 md:p-4 bg-white md:rounded-lg md:shadow-md border-b md:border border-gray-200 overflow-x-auto overflow-y-hidden text-xs scrollbar-hide">
      <div className="flex gap-4 md:gap-8 w-max">
        <StoryList stories={stories} userId={user.id}/>
      </div>
    </div>
  );
};

export default Stories;
