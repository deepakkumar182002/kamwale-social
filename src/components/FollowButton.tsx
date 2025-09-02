"use client";

import { useState, useOptimistic } from "react";
import { switchFollow } from "@/lib/actions";

interface FollowButtonProps {
  userId: string;
  isUserBlocked: boolean;
  isFollowing: boolean;
  isFollowingSent: boolean;
}

const FollowButton = ({
  userId,
  isUserBlocked,
  isFollowing,
  isFollowingSent,
}: FollowButtonProps) => {
  const [userState, setUserState] = useState({
    following: isFollowing,
    blocked: isUserBlocked,
    followingRequestSent: isFollowingSent,
  });

  const [optimisticState, switchOptimisticState] = useOptimistic(
    userState,
    (state, value) => {
      return {
        ...state,
        following: value === "follow" ? true : false,
        followingRequestSent:
          value === "follow" ? true : false,
      };
    }
  );

  const follow = async () => {
    switchOptimisticState("follow");
    try {
      await switchFollow(userId);
      setUserState((prev) => ({
        ...prev,
        following: prev.following ? false : true,
        followingRequestSent: prev.following ? false : !prev.followingRequestSent,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  if (optimisticState.blocked) return null;

  return (
    <form action={follow}>
      <button
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          optimisticState.following
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
            : optimisticState.followingRequestSent
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {optimisticState.following
          ? "Following"
          : optimisticState.followingRequestSent
          ? "Request Sent"
          : "Follow"}
      </button>
    </form>
  );
};

export default FollowButton;
