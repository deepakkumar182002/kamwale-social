"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  img?: string;
  video?: string;
  desc: string;
  _count: {
    likes: number;
    comments: number;
  };
  user: {
    id: string;
    username: string;
    avatar?: string;
    name?: string;
    surname?: string;
  };
}

const ExplorePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchExplorePosts();
  }, []);

  const fetchExplorePosts = async () => {
    try {
      const response = await fetch("/api/posts?exploreMode=true&limit=30");
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching explore posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-0 sm:px-4 lg:px-8 pb-20 lg:pb-6">
        {/* Header - Hidden on mobile */}
        <div className="hidden md:block mb-6 pt-6">
          <h1 className="text-2xl font-bold dark:text-white">Explore</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Discover posts from around the world
          </p>
        </div>

        {/* Grid Gallery - Instagram Style */}
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1 md:gap-2">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="relative aspect-square cursor-pointer group overflow-hidden bg-gray-100 dark:bg-gray-800"
            >
              {post.video ? (
                <video
                  src={post.video}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : post.img ? (
                <Image
                  src={post.img}
                  alt={post.desc || "Post"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <p className="text-white font-semibold text-center px-4 line-clamp-3 text-sm">
                    {post.desc}
                  </p>
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1 sm:gap-2 text-white font-semibold text-sm sm:text-base">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                  <span>{post._count.likes}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-white font-semibold text-sm sm:text-base">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                  <span>{post._count.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">No posts found</p>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedPost(null)}
        >
          <button
            onClick={() => setSelectedPost(null)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white p-2 hover:bg-white/10 rounded-full transition z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="bg-white dark:bg-gray-900 rounded-none sm:rounded-lg max-w-5xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media Section */}
            <div className="flex-1 bg-black flex items-center justify-center">
              {selectedPost.video ? (
                <video
                  src={selectedPost.video}
                  controls
                  className="max-w-full max-h-[60vh] sm:max-h-[90vh] object-contain"
                  autoPlay
                />
              ) : selectedPost.img ? (
                <Image
                  src={selectedPost.img}
                  alt={selectedPost.desc || "Post"}
                  width={800}
                  height={800}
                  className="max-w-full max-h-[60vh] sm:max-h-[90vh] object-contain"
                />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-white text-lg">{selectedPost.desc}</p>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="w-full md:w-96 flex flex-col bg-white dark:bg-gray-900">
              {/* User Info */}
              <div 
                className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                onClick={() => router.push(`/profile/${selectedPost.user.username}`)}
              >
                <Image
                  src={selectedPost.user.avatar || "/noAvatar.png"}
                  alt={selectedPost.user.username}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold dark:text-white">
                    {selectedPost.user.username}
                  </p>
                  {(selectedPost.user.name || selectedPost.user.surname) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedPost.user.name} {selectedPost.user.surname}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="dark:text-white whitespace-pre-wrap">
                  {selectedPost.desc}
                </p>
              </div>

              {/* Stats */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    <span>{selectedPost._count.likes} likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>{selectedPost._count.comments} comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExplorePage;
