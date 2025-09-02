import Image from "next/image";
import Comments from "./Comments";
import { Post as PostType, User } from "@prisma/client";
import PostInteraction from "./PostInteraction";
import { Suspense } from "react";
import PostInfo from "./PostInfo";
import { auth } from "@clerk/nextjs/server";
import FollowButton from "../FollowButton";
import ClickableUserInfo from "../ClickableUserInfo";
import prisma from "@/lib/client";

type FeedPostType = PostType & { user: User } & {
  likes: [{ userId: string }];
} & {
  _count: { comments: number };
};

const Post = async ({ post }: { post: FeedPostType }) => {
  const { userId } = auth();
  
  // Check follow status for the post author
  let isFollowing = false;
  let isFollowRequestSent = false;
  let isBlocked = false;

  if (userId && userId !== post.user.id) {
    const [followRelation, followRequest, blockRelation] = await Promise.all([
      prisma.follower.findFirst({
        where: {
          followerId: userId,
          followingId: post.user.id,
        },
      }),
      prisma.followRequest.findFirst({
        where: {
          senderId: userId,
          receiverId: post.user.id,
        },
      }),
      prisma.block.findFirst({
        where: {
          blockerId: post.user.id,
          blockedId: userId,
        },
      }),
    ]);

    isFollowing = !!followRelation;
    isFollowRequestSent = !!followRequest;
    isBlocked = !!blockRelation;
  }
  return (
    <div className="flex flex-col gap-4">
      {/* USER */}
      <div className="flex items-center justify-between">
        <ClickableUserInfo user={post.user} />
        <div className="flex items-center gap-2">
          {userId !== post.user.id && userId && (
            <FollowButton
              userId={post.user.id}
              isUserBlocked={isBlocked}
              isFollowing={isFollowing}
              isFollowingSent={isFollowRequestSent}
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
