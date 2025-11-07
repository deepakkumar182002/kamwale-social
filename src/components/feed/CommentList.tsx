"use client";

import { addComment } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { Comment, User } from "@prisma/client";
import Image from "next/image";
import { useOptimistic, useState } from "react";
import { ThumbsUp, Send, X } from "lucide-react";

type CommentWithUser = Comment & { 
  user: User;
  _count?: {
    likes: number;
    replies: number;
  };
};

type ReplyType = {
  id: string;
  desc: string;
  createdAt: Date;
  userId: string;
  commentId: string;
  taggedUserId?: string | null;
  user?: {
    id: string;
    username: string;
    name?: string;
    surname?: string;
    avatar?: string;
  };
  taggedUser?: {
    id: string;
    username: string;
    name?: string;
    surname?: string;
  } | null;
  _count?: {
    likes: number;
  };
};

const CommentList = ({
  comments,
  postId,
}: {
  comments: CommentWithUser[];
  postId: string;
}) => {
  const { user } = useUser();
  const [commentState, setCommentState] = useState(comments);
  const [desc, setDesc] = useState("");
  const [replyTo, setReplyTo] = useState<{ commentId: string; username: string; userId: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    comments.forEach((comment) => {
      if (comment._count?.likes) {
        counts[comment.id] = comment._count.likes;
      }
    });
    return counts;
  });
  const [replyCounts, setReplyCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    comments.forEach((comment) => {
      if (comment._count?.replies) {
        counts[comment.id] = comment._count.replies;
      }
    });
    return counts;
  });
  const [replyLikeCounts, setReplyLikeCounts] = useState<Record<string, number>>({});
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [replies, setReplies] = useState<Record<string, ReplyType[]>>({});
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState<any[]>([]);

  const add = async () => {
    if (!user || !desc.trim()) return;

    addOptimisticComment({
      id: Math.random().toString(),
      desc,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      userId: user.id,
      postId: postId,
      user: {
        id: user.id,
        clerkId: user.id,
        username: "Sending Please Wait...",
        avatar: user.imageUrl || "/noAvatar.png",
        cover: "",
        description: "",
        name: "",
        surname: "",
        city: "",
        work: "",
        school: "",
        website: "",
        profession: null,
        occupation: null,
        links: null,
        createdAt: new Date(Date.now()),
        lastSeen: new Date(Date.now()),
        isOnline: true,
      },
    });
    try {
      const createdComment = await addComment(postId, desc);
      setCommentState((prev) => [createdComment, ...prev]);
      setDesc("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;

    // Optimistic update
    const isLiked = likedComments.has(commentId);
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });

    setLikeCounts((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) + (isLiked ? -1 : 1),
    }));

    try {
      await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
    } catch (error) {
      // Revert on error
      setLikedComments((prev) => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(commentId);
        } else {
          newSet.delete(commentId);
        }
        return newSet;
      });
      setLikeCounts((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) + (isLiked ? 1 : -1),
      }));
      console.error("Failed to like comment:", error);
    }
  };

  const handleLikeReply = async (replyId: string) => {
    if (!user) return;

    const isLiked = likedReplies.has(replyId);
    setLikedReplies((prev) => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(replyId);
      } else {
        newSet.add(replyId);
      }
      return newSet;
    });

    setReplyLikeCounts((prev) => ({
      ...prev,
      [replyId]: (prev[replyId] || 0) + (isLiked ? -1 : 1),
    }));

    try {
      await fetch(`/api/replies/${replyId}/like`, {
        method: "POST",
      });
    } catch (error) {
      setLikedReplies((prev) => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(replyId);
        } else {
          newSet.delete(replyId);
        }
        return newSet;
      });
      setReplyLikeCounts((prev) => ({
        ...prev,
        [replyId]: (prev[replyId] || 0) + (isLiked ? 1 : -1),
      }));
      console.error("Failed to like reply:", error);
    }
  };

  const handleReply = (commentId: string, username: string, userId: string) => {
    if (replyTo?.commentId === commentId) {
      setReplyTo(null);
      setReplyText("");
    } else {
      setReplyTo({ commentId, username, userId });
      setReplyText("");
    }
  };

  const fetchReplies = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/reply`);
      if (response.ok) {
        const data = await response.json();
        setReplies((prev) => ({ ...prev, [commentId]: data }));
        
        const counts: Record<string, number> = {};
        data.forEach((reply: ReplyType) => {
          if (reply._count?.likes) {
            counts[reply.id] = reply._count.likes;
          }
        });
        setReplyLikeCounts((prev) => ({ ...prev, ...counts }));
      }
    } catch (error) {
      console.error("Failed to fetch replies:", error);
    }
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
        if (!replies[commentId]) {
          fetchReplies(commentId);
        }
      }
      return newSet;
    });
  };

  const submitReply = async (commentId: string) => {
    if (!user || !replyText.trim()) return;

    try {
      const response = await fetch(`/api/comments/${commentId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: replyText,
          taggedUserId: replyTo?.userId,
        }),
      });

      if (response.ok) {
        const newReply = await response.json();
        setReplies((prev) => ({
          ...prev,
          [commentId]: [...(prev[commentId] || []), newReply],
        }));
        setReplyCounts((prev) => ({
          ...prev,
          [commentId]: (prev[commentId] || 0) + 1,
        }));
        setReplyTo(null);
        setReplyText("");
      }
    } catch (error) {
      console.error("Failed to submit reply:", error);
    }
  };

  const fetchLikedUsers = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`);
      if (response.ok) {
        const users = await response.json();
        setLikedUsers(users);
        setShowLikesModal(true);
      }
    } catch (error) {
      console.error("Error fetching liked users:", error);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInMs = now.getTime() - commentDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return commentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    commentState,
    (state, value: CommentWithUser) => [value, ...state]
  );
  return (
    <>
      {user && (
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
          <Image
            src={user.imageUrl || "/noAvatar.png"}
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={desc}
              className="bg-transparent outline-none flex-1 text-sm dark:text-white"
              onChange={(e) => setDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  add();
                }
              }}
            />
            <button
              onClick={add}
              disabled={!desc.trim()}
              className={`p-2 rounded-full transition ${
                desc.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
              title="Send comment"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <div className="px-4 py-2">
        {/* COMMENTS */}
        {optimisticComments.map((comment) => (
          <div key={comment.id}>
            <div className="flex gap-3 py-3">
              {/* AVATAR */}
              <Image
                src={comment.user.avatar || "/noAvatar.png"}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              {/* CONTENT */}
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                  <span className="font-semibold text-sm dark:text-white">
                    {comment.user.name && comment.user.surname
                      ? comment.user.name + " " + comment.user.surname
                      : comment.user.username}
                  </span>
                  <p className="text-sm mt-1 dark:text-gray-200">{comment.desc}</p>
                </div>
                
                <div className="flex items-center gap-4 mt-1 px-4">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      likedComments.has(comment.id)
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${likedComments.has(comment.id) ? 'fill-current' : ''}`} />
                    Like
                  </button>
                  
                  <button
                    onClick={() => handleReply(comment.id, comment.user.username, comment.user.id)}
                    className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Reply
                  </button>
                  
                  {((likeCounts[comment.id] || comment._count?.likes || 0) > 0) && (
                    <button
                      onClick={() => fetchLikedUsers(comment.id)}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                    >
                      {likeCounts[comment.id] || comment._count?.likes || 0} {(likeCounts[comment.id] || comment._count?.likes || 0) === 1 ? 'like' : 'likes'}
                    </button>
                  )}

                  {((replyCounts[comment.id] || comment._count?.replies || 0) > 0) && (
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                    >
                      {replyCounts[comment.id] || comment._count?.replies || 0} {(replyCounts[comment.id] || comment._count?.replies || 0) === 1 ? 'reply' : 'replies'}
                    </button>
                  )}
                  
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(comment.createdAt)}
                  </span>
                </div>

                {replyTo?.commentId === comment.id && user && (
                  <div className="mt-2 ml-0 flex items-start gap-2 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                    <Image
                      src={user.imageUrl || "/noAvatar.png"}
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
                        <input
                          type="text"
                          placeholder={`Reply to @${replyTo.username}...`}
                          value={replyText}
                          className="bg-transparent outline-none flex-1 text-sm dark:text-white"
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              submitReply(comment.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => submitReply(comment.id)}
                          disabled={!replyText.trim()}
                          className={`p-1.5 rounded-full transition ${
                            replyText.trim()
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showReplies.has(comment.id) && replies[comment.id] && (
                  <div className="mt-3 space-y-3">
                    {replies[comment.id].map((reply) => (
                      <div key={reply.id} className="flex gap-2 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                        <Image
                          src={reply.user?.avatar || "/noAvatar.png"}
                          alt=""
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2">
                            <span className="font-semibold text-sm dark:text-white">
                              {reply.user?.name && reply.user?.surname
                                ? reply.user.name + " " + reply.user.surname
                                : reply.user?.username}
                            </span>
                            <p className="text-sm mt-1 dark:text-gray-200">
                              {reply.taggedUser && (
                                <span className="font-bold text-blue-600 dark:text-blue-400 mr-1">
                                  @{reply.taggedUser.username}
                                </span>
                              )}
                              {reply.desc}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1 px-3">
                            <button
                              onClick={() => handleLikeReply(reply.id)}
                              className={`flex items-center gap-1 text-xs font-semibold ${
                                likedReplies.has(reply.id)
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                              }`}
                            >
                              <ThumbsUp className={`w-2.5 h-2.5 ${likedReplies.has(reply.id) ? 'fill-current' : ''}`} />
                              Like
                            </button>
                            
                            <button
                              onClick={() => handleReply(comment.id, reply.user?.username || '', reply.userId)}
                              className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              Reply
                            </button>

                            {((replyLikeCounts[reply.id] || reply._count?.likes || 0) > 0) && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {replyLikeCounts[reply.id] || reply._count?.likes || 0} {(replyLikeCounts[reply.id] || reply._count?.likes || 0) === 1 ? 'like' : 'likes'}
                              </span>
                            )}
                            
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(reply.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showLikesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold dark:text-white">Likes</h3>
              <button
                onClick={() => setShowLikesModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5 dark:text-white" />
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
                    <p className="font-semibold text-sm dark:text-white">
                      {likeUser.name && likeUser.surname 
                        ? `${likeUser.name} ${likeUser.surname}`
                        : likeUser.username}
                    </p>
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

export default CommentList;
