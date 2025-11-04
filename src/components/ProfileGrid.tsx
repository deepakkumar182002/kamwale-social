"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";

interface Post {
  id: string;
  img: string | null;
  desc: string;
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
  };
}

const ProfileGrid = ({ username }: { username: string }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts?username=${encodeURIComponent(username)}`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [username]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-2 border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-2xl font-semibold dark:text-white mb-1">No Posts Yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">When they post, you&apos;ll see their photos and videos here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map(post => (
        <Link
          key={post.id}
          href={`/?postId=${post.id}`}
          className="relative aspect-square bg-gray-100 dark:bg-gray-800 group overflow-hidden"
        >
          {post.img ? (
            <>
              <Image
                src={post.img}
                alt={post.desc || "Post"}
                fill
                className="object-cover"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Heart className="w-6 h-6 fill-white" />
                  <span>{post._count.likes}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-semibold">
                  <MessageCircle className="w-6 h-6 fill-white" />
                  <span>{post._count.comments}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 p-4">
              <p className="text-xs text-center text-gray-600 dark:text-gray-400 line-clamp-6">
                {post.desc}
              </p>
              {/* Hover Overlay for text posts */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Heart className="w-6 h-6 fill-white" />
                  <span>{post._count.likes}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-semibold">
                  <MessageCircle className="w-6 h-6 fill-white" />
                  <span>{post._count.comments}</span>
                </div>
              </div>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};

export default ProfileGrid;
