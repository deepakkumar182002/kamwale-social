"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoryViewer from "@/components/stories/StoryViewer";

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/stories');
        if (response.ok) {
          const data = await response.json();
          
          // Find the index of the user whose story was clicked
          const userIndex = data.findIndex((group: any) => 
            group.user.username === username
          );
          
          if (userIndex !== -1) {
            setStories(data);
            setCurrentUserIndex(userIndex);
          } else {
            // User not found, redirect to home
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchStories();
    }
  }, [username, router]);

  const handleClose = () => {
    router.push('/');
  };

  const handleRefresh = async () => {
    try {
      const response = await fetch('/api/stories');
      if (response.ok) {
        const data = await response.json();
        setStories(data);
      }
    } catch (error) {
      console.error('Error refreshing stories:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <StoryViewer
      stories={stories}
      currentUserIndex={currentUserIndex}
      onClose={handleClose}
      onRefresh={handleRefresh}
    />
  );
}
