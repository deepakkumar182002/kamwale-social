"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Post from "./Post";

const Feed = ({ username }: { username?: string }) => {
  const { user, isLoaded } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let url = '/api/posts';
        if (username) {
          url = `/api/posts?username=${encodeURIComponent(username)}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        } else {
          console.error('Failed to fetch posts:', response.status);
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchPosts();
    }
  }, [username, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-12">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-12">
      {posts.length ? (posts.map(post=>(
        <Post key={post.id} post={post}/>
      ))) : "No posts found!"}
    </div>
  );
};

export default Feed;
