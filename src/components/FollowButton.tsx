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
    <form action={follow} className="flex-1">
      <button
        className={`w-full px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
          optimisticState.following
            ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            : optimisticState.followingRequestSent
            ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {optimisticState.following
          ? "Following"
          : optimisticState.followingRequestSent
          ? "Requested"
          : "Follow"}
      </button>
    </form>
  );
};

export default FollowButton;
