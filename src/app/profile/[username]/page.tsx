
"use client";

import Feed from "@/components/feed/Feed";
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
    <div className="flex gap-6 pt-6">
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
  );
};

export default ProfilePage;
