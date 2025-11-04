"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Comments from "./Comments";
import { Post as PostType, User } from "@prisma/client";
import { Suspense } from "react";
import PostInfo from "./PostInfo";
import FollowButton from "../FollowButton";
import ClickableUserInfo from "../ClickableUserInfo";
import { ThumbsUp, MessageCircle, Share2, Send } from "lucide-react";
import { switchLike } from "@/lib/actions";

type FeedPostType = PostType & { user: User } & {
  likes: [{ userId: string }];
} & {
  _count: { comments: number };
};

interface FollowStatus {
  isFollowing: boolean;
  isFollowRequestSent: boolean;
  isBlocked: boolean;
}

const Post = ({ post }: { post: FeedPostType }) => {
  const { user } = useUser();
  const [followStatus, setFollowStatus] = useState<FollowStatus>({
    isFollowing: false,
    isFollowRequestSent: false,
    isBlocked: false
  });
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(post.likes.length);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (user && user.id !== post.user.id) {
        try {
          const response = await fetch(`/api/users/follow-status?userId=${post.user.id}`);
          if (response.ok) {
            const status = await response.json();
            setFollowStatus(status);
          }
        } catch (error) {
          console.error('Error fetching follow status:', error);
        }
      }
      setLoading(false);
    };

    fetchFollowStatus();
  }, [user, post.user.id]);

  useEffect(() => {
    // Check if current user liked the post
    if (user) {
      const userLiked = post.likes.some((like) => like.userId === user.id);
      setIsLiked(userLiked);
    }
  }, [user, post.likes]);

  const userId = user?.id;
  const isOptimistic = (post as any)._isOptimistic;
  const isOwnPost = userId === post.user.clerkId;

  const handleLike = async () => {
    if (!user) return;
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    
    try {
      await switchLike(post.id);
    } catch (error) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
    }
  };

  const fetchLikedUsers = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/likes`);
      if (response.ok) {
        const users = await response.json();
        setLikedUsers(users);
        setShowLikesModal(true);
      }
    } catch (error) {
      console.error('Error fetching liked users:', error);
    }
  };
  
  return (
    <>
      <div className={`flex flex-col bg-white dark:bg-gray-900 md:rounded-lg md:shadow-sm border-b md:border border-gray-200 dark:border-gray-800 ${isOptimistic ? 'opacity-80 animate-pulse' : ''}`}>
        {/* HEADER - User info */}
        <div className="flex items-center justify-between p-4">
          <ClickableUserInfo user={post.user} />
          <div className="flex items-center gap-2">
            {isOptimistic && (
              <span className="text-xs text-gray-500 dark:text-gray-400 italic">Posting...</span>
            )}
            {!isOwnPost && userId && !loading && !isOptimistic && !followStatus.isFollowing && (
              <FollowButton
                userId={post.user.id}
                isUserBlocked={followStatus.isBlocked}
                isFollowing={followStatus.isFollowing}
                isFollowingSent={followStatus.isFollowRequestSent}
              />
            )}
            {userId && !isOptimistic && (
              <PostInfo 
                postId={post.id} 
                userClerkId={post.user.clerkId}
                postDesc={post.desc}
                postImg={post.img}
                postVideo={post.video}
              />
            )}
          </div>
        </div>
        
        {/* DESCRIPTION */}
        {post.desc && (
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {post.desc}
            </p>
          </div>
        )}
        
        {/* VIDEO */}
        {post.video && (
          <div className="w-full relative bg-black">
            <video
              src={post.video}
              controls
              className="w-full h-auto max-h-[600px] object-contain"
              preload="metadata"
            />
          </div>
        )}
        
        {/* IMAGE */}
        {post.img && !post.video && (
          <div className="w-full relative">
            <Image
              src={post.img}
              width={800}
              height={600}
              className="w-full h-auto object-cover"
              alt="Post image"
              priority={false}
            />
          </div>
        )}
        
        {/* LIKES AND COMMENTS COUNT */}
        {!isOptimistic && (
          <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            {/* Likes count with user avatars */}
            {likeCount > 0 && (
              <button 
                onClick={fetchLikedUsers}
                className="flex items-center gap-2 hover:underline"
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs">
                    <ThumbsUp className="w-3 h-3 fill-white" />
                  </div>
                </div>
                <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
              </button>
            )}
            
            {/* Comments count */}
            {post._count.comments > 0 && (
              <button 
                onClick={() => setShowComments(!showComments)}
                className="hover:underline"
              >
                {post._count.comments} {post._count.comments === 1 ? 'comment' : 'comments'}
              </button>
            )}
          </div>
        )}
        
        {/* DIVIDER */}
        {!isOptimistic && (
          <div className="border-t border-gray-200 dark:border-gray-800"></div>
        )}
        
        {/* ACTION BUTTONS - LinkedIn Style */}
        {!isOptimistic && (
          <div className="px-2 py-1 flex items-center justify-around">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                isLiked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">Like</span>
            </button>
            
            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-400"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Comment</span>
            </button>
            
            {/* Share Button */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Check out this post',
                    url: `${window.location.origin}/?postId=${post.id}`,
                  });
                } else {
                  navigator.clipboard.writeText(`${window.location.origin}/?postId=${post.id}`);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-400"
            >
              <Send className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        )}
        
        {/* COMMENTS SECTION */}
        {!isOptimistic && showComments && (
          <div className="border-t border-gray-200 dark:border-gray-800">
            <Suspense fallback={<div className="p-4 text-center text-gray-500">Loading comments...</div>}>
              <Comments postId={post.id} />
            </Suspense>
          </div>
        )}
      </div>

      {/* LIKES MODAL */}
      {showLikesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">Likes</h3>
              <button
                onClick={() => setShowLikesModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <svg className="w-5 h-5 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {likedUsers.map((likeUser: any) => (
                <div key={likeUser.id} className="flex items-center gap-3 py-2">
                  <Image
                    src={likeUser.avatar || "/noAvatar.png"}
                    alt={likeUser.username}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm dark:text-white">{likeUser.name || likeUser.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{likeUser.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Post;
