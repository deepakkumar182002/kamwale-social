"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import UserInfoCardInteraction from "./UserInfoCardInteraction";
import UpdateUser from "./UpdateUser";

interface UserInfoCardProps {
  user: User;
}

interface UserRelationStatus {
  isUserBlocked: boolean;
  isFollowing: boolean;
  isFollowingSent: boolean;
}

const UserInfoCard = ({ user }: UserInfoCardProps) => {
  const { user: currentUser, isLoaded } = useUser();
  const [relationStatus, setRelationStatus] = useState<UserRelationStatus>({
    isUserBlocked: false,
    isFollowing: false,
    isFollowingSent: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelationStatus = async () => {
      if (currentUser && currentUser.id !== user.id) {
        try {
          const response = await fetch(`/api/users/follow-status?userId=${user.id}`);
          if (response.ok) {
            const status = await response.json();
            setRelationStatus({
              isUserBlocked: status.isBlocked,
              isFollowing: status.isFollowing,
              isFollowingSent: status.isFollowRequestSent
            });
          }
        } catch (error) {
          console.error('Error fetching relation status:', error);
        }
      }
      setLoading(false);
    };

    if (isLoaded) {
      fetchRelationStatus();
    }
  }, [currentUser, user.id, isLoaded]);

  const createdAtDate = new Date(user.createdAt);
  const formattedDate = createdAtDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!isLoaded) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }
  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* TOP */}
      <div className="flex justify-between items-center font-medium">
        <span className="text-gray-500">User Information</span>
        {currentUser?.id === user.id ? (
          <UpdateUser user={user}/>
        ) : (
          <Link href="/" className="text-blue-500 text-xs">
            See all
          </Link>
        )}
      </div>
      {/* BOTTOM */}
      <div className="flex flex-col gap-4 text-gray-500">
        <div className="flex items-center gap-2">
          <span className="text-xl text-black">
            {" "}
            {user.name && user.surname
              ? user.name + " " + user.surname
              : user.username}
          </span>
          <span className="text-sm">@{user.username}</span>
        </div>
        {user.description && <p>{user.description}</p>}
        {user.city && (
          <div className="flex items-center gap-2">
            <Image src="/map.png" alt="" width={16} height={16} />
            <span>
              Living in <b>{user.city}</b>
            </span>
          </div>
        )}
        {user.school && (
          <div className="flex items-center gap-2">
            <Image src="/school.png" alt="" width={16} height={16} />
            <span>
              Went to <b>{user.school}</b>
            </span>
          </div>
        )}
        {user.work && (
          <div className="flex items-center gap-2">
            <Image src="/work.png" alt="" width={16} height={16} />
            <span>
              Works at <b>{user.work}</b>
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          {user.website && (
            <div className="flex gap-1 items-center">
              <Image src="/link.png" alt="" width={16} height={16} />
              <Link href={user.website} className="text-blue-500 font-medium">
                {user.website}
              </Link>
            </div>
          )}
          <div className="flex gap-1 items-center">
            <Image src="/date.png" alt="" width={16} height={16} />
            <span>Joined {formattedDate}</span>
          </div>
        </div>
        {currentUser && currentUser.id !== user.id && !loading && (
          <UserInfoCardInteraction
            userId={user.id}
            isUserBlocked={relationStatus.isUserBlocked}
            isFollowing={relationStatus.isFollowing}
            isFollowingSent={relationStatus.isFollowingSent}
          />
        )}
      </div>
    </div>
  );
};

export default UserInfoCard;
