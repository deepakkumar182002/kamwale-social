
"use client";

import Feed from "@/components/feed/Feed";
import ProfileGrid from "@/components/ProfileGrid";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
import FollowButton from "@/components/FollowButton";
import MessageButton from "@/components/MessageButton";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";

interface UserProfile {
  id: string;
  clerkId: string;
  username: string;
  avatar: string | null;
  cover: string | null;
  name: string | null;
  surname: string | null;
  description: string | null;
  city: string | null;
  school: string | null;
  work: string | null;
  website: string | null;
  createdAt: Date;
  lastSeen: Date;
  isOnline: boolean;
  _count: {
    followers: number;
    followings: number;
    posts: number;
  };
}

interface ProfileData {
  user: UserProfile;
  isBlocked: boolean;
  isFollowing: boolean;
  isFollowRequestSent: boolean;
  currentUserId: string | null;
}

const ProfilePage = ({ params }: { params: Promise<{ username: string }> }) => {
  const { user: currentUser } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setUsername(resolvedParams.username);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (!username) return;
    
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/profile/${username}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found");
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex gap-6 pt-6">
        <div className="hidden xl:block w-[20%]">
          <LeftMenu type="profile" />
        </div>
        <div className="w-full lg:w-[70%] xl:w-[50%]">
          <div className="animate-pulse">
            <div className="w-full h-64 bg-gray-300 rounded-md mb-6"></div>
            <div className="h-6 bg-gray-300 rounded mb-4 mx-auto w-48"></div>
            <div className="flex justify-center gap-12 mb-4">
              <div className="h-16 w-16 bg-gray-300 rounded"></div>
              <div className="h-16 w-16 bg-gray-300 rounded"></div>
              <div className="h-16 w-16 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block w-[30%]">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-300 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return notFound();
  }

  const { user, isBlocked, isFollowing, isFollowRequestSent, currentUserId } = profileData;

  return (
    <>
      {/* Mobile & Tablet View (Instagram Style) */}
      <div className="lg:hidden">
        {/* Header with Username */}
        <div className="sticky top-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold dark:text-white">{user.username}</h1>
            <button className="p-2">
              <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-4 py-3">
          {/* Avatar and Stats Row */}
          <div className="flex items-center gap-4 mb-3">
            {/* Avatar */}
            <Image
              src={user.avatar || "/noAvatar.png"}
              alt={user.username}
              width={88}
              height={88}
              className="w-20 h-20 md:w-22 md:h-22 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
            />

            {/* Stats */}
            <div className="flex-1 flex justify-around text-center">
              <div>
                <div className="font-semibold text-base dark:text-white">{user._count.posts}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">posts</div>
              </div>
              <div>
                <div className="font-semibold text-base dark:text-white">{user._count.followers}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">followers</div>
              </div>
              <div>
                <div className="font-semibold text-base dark:text-white">{user._count.followings}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">following</div>
              </div>
            </div>
          </div>

          {/* Name and Bio */}
          <div className="mb-3">
            <p className="font-semibold text-sm dark:text-white">
              {user.name && user.surname ? `${user.name} ${user.surname}` : user.username}
            </p>
            {user.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                {user.description}
              </p>
            )}
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 mt-1 block">
                {user.website}
              </a>
            )}
          </div>

          {/* Action Buttons */}
          {currentUserId && currentUserId !== user.id && (
            <div className="flex gap-2">
              <FollowButton
                userId={user.id}
                isUserBlocked={isBlocked}
                isFollowing={isFollowing}
                isFollowingSent={isFollowRequestSent}
              />
              <MessageButton
                userId={user.id}
                username={user.username}
              />
            </div>
          )}
        </div>

        {/* Highlights/Stories Row */}
        <div className="border-t border-b border-gray-200 dark:border-gray-800 px-4 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-4">
            {/* Story Highlights would go here */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">New</span>
            </div>
          </div>
        </div>

        {/* Tabs (Posts/Saved/Tagged) */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button className="flex-1 py-3 border-t border-gray-900 dark:border-white">
            <svg className="w-6 h-6 mx-auto dark:text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="2" width="9" height="9" rx="1" />
              <rect x="13" y="2" width="9" height="9" rx="1" />
              <rect x="2" y="13" width="9" height="9" rx="1" />
              <rect x="13" y="13" width="9" height="9" rx="1" />
            </svg>
          </button>
          <button className="flex-1 py-3">
            <svg className="w-6 h-6 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button className="flex-1 py-3">
            <svg className="w-6 h-6 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>

        {/* Posts Grid */}
        <div className="pb-20">
          <ProfileGrid username={user.username} />
        </div>
      </div>

      {/* Desktop View (Original) */}
      <div className="hidden lg:flex gap-6 pt-6">
        <div className="hidden xl:block w-[20%]">
          <LeftMenu type="profile" />
        </div>
        <div className="w-full lg:w-[70%] xl:w-[50%]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center">
              <div className="w-full h-64 relative">
                <Image
                  src={user.cover || "/noCover.png"}
                  alt=""
                  fill
                  className="rounded-md object-cover"
                />
                <Image
                  src={user.avatar || "/noAvatar.png"}
                  alt=""
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full absolute left-0 right-0 m-auto -bottom-16 ring-4 ring-white object-cover"
                />
              </div>
              <h1 className="mt-20 mb-4 text-2xl font-medium">
                {user.name && user.surname
                  ? user.name + " " + user.surname
                  : user.username}
              </h1>
              
              {/* Follow Button */}
              {currentUserId && currentUserId !== user.id && (
                <div className="mb-4 flex gap-3 justify-center">
                  <FollowButton
                    userId={user.id}
                    isUserBlocked={isBlocked}
                    isFollowing={isFollowing}
                    isFollowingSent={isFollowRequestSent}
                  />
                  <MessageButton
                    userId={user.id}
                    username={user.username}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-center gap-12 mb-4">
                <div className="flex flex-col items-center">
                  <span className="font-medium">{user._count.posts}</span>
                  <span className="text-sm">Posts</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-medium">{user._count.followers}</span>
                  <span className="text-sm">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-medium">{user._count.followings}</span>
                  <span className="text-sm">Following</span>
                </div>
              </div>
            </div>
            <Feed username={user.username}/>
          </div>
        </div>
        <div className="hidden lg:block w-[30%]">
          <RightMenu user={user} />
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
