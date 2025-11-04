"use client";

import { switchLike } from "@/lib/actions";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useOptimistic, useState } from "react";

const PostInteraction = ({
  postId,
  likes,
  commentNumber,
}: {
  postId: string;
  likes: string[];
  commentNumber: number;
}) => {
  const { isLoaded, userId } = useAuth();
  const [likeState, setLikeState] = useState({
    likeCount: likes.length,
    isLiked: userId ? likes.includes(userId) : false,
  });

  const [optimisticLike, switchOptimisticLike] = useOptimistic(
    likeState,
    (state, value) => {
      return {
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
        isLiked: !state.isLiked,
      };
    }
  );

  const likeAction = async () => {
    switchOptimisticLike("");
    try {
      switchLike(postId);
      setLikeState((state) => ({
        likeCount: state.isLiked ? state.likeCount - 1 : state.likeCount + 1,
        isLiked: !state.isLiked,
      }));
    } catch (err) {}
  };
  return (
    <div className="flex items-center justify-between py-2 md:py-3">
      {/* Instagram-style action buttons */}
      <div className="flex gap-4 md:gap-6">
        {/* Like Button */}
        <form action={likeAction}>
          <button className="flex items-center gap-2">
            <Image
              src={optimisticLike.isLiked ? "/liked.png" : "/like.png"}
              width={24}
              height={24}
              alt="Like"
              className="cursor-pointer w-6 h-6 md:w-7 md:h-7"
            />
            <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
              {optimisticLike.likeCount}
            </span>
          </button>
        </form>
        
        {/* Comment Button */}
        <div className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/comment.png"
            width={24}
            height={24}
            alt="Comment"
            className="w-6 h-6 md:w-7 md:h-7"
          />
          <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
            {commentNumber}
          </span>
        </div>
      </div>
      
      {/* Share Button */}
      <div className="cursor-pointer">
        <Image
          src="/share.png"
          width={24}
          height={24}
          alt="Share"
          className="w-6 h-6 md:w-7 md:h-7"
        />
      </div>
    </div>
  );
};

export default PostInteraction;
