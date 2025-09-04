"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Comments from "./Comments";
import { Post as PostType, User } from "@prisma/client";
import PostInteraction from "./PostInteraction";
import { Suspense } from "react";
import PostInfo from "./PostInfo";
import FollowButton from "../FollowButton";
import ClickableUserInfo from "../ClickableUserInfo";

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

  const userId = user?.id;
  
  return (
    <div className="flex flex-col gap-4">
      {/* USER */}
      <div className="flex items-center justify-between">
        <ClickableUserInfo user={post.user} />
        <div className="flex items-center gap-2">
          {userId !== post.user.id && userId && !loading && (
            <FollowButton
              userId={post.user.id}
              isUserBlocked={followStatus.isBlocked}
              isFollowing={followStatus.isFollowing}
              isFollowingSent={followStatus.isFollowRequestSent}
            />
          )}
          {userId === post.user.id && <PostInfo postId={post.id} />}
        </div>
      </div>
      {/* DESC */}
      <div className="flex flex-col gap-4">
        {post.img && (
          <div className="w-full min-h-96 relative">
            <Image
              src={post.img}
              fill
              className="object-cover rounded-md"
              alt=""
            />
          </div>
        )}
        <p>{post.desc}</p>
      </div>
      {/* INTERACTION */}
      <Suspense fallback="Loading...">
        <PostInteraction
          postId={post.id}
          likes={post.likes.map((like) => like.userId)}
          commentNumber={post._count.comments}
        />
      </Suspense>
      <Suspense fallback="Loading...">
        <Comments postId={post.id} />
      </Suspense>
    </div>
  );
};

export default Post;
