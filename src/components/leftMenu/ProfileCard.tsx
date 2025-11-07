"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, MapPin, GraduationCap } from "lucide-react";
import { usePathname } from "next/navigation";

interface UserData {
  id: string;
  username: string;
  avatar?: string;
  cover?: string;
  name?: string;
  surname?: string;
  description?: string;
  profession?: string;
  city?: string;
  school?: string;
  _count: {
    followers: number;
  };
}

const ProfileCard = () => {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchUserData();
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [user, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-6">
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-md mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user || !userData) return null;

  // Hide ProfileCard on own profile page
  const isOwnProfile = pathname?.includes(`/profile/${userData.username}`);
  if (isOwnProfile) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
      {/* Header Banner with Cover */}
      <div className="h-24 relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
        {userData.cover && (
          <Image
            src={userData.cover}
            alt="Cover"
            fill
            className="object-cover opacity-90"
          />
        )}
      </div>

      {/* Profile Picture - Overlapping banner */}
      <div className="px-4 pb-4">
        <div className="flex flex-col items-center -mt-12">
          <div className="relative">
            <Image
              src={userData.avatar || "/noAvatar.png"}
              alt={userData.username}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
          </div>

          {/* Name with Verification Badge */}
          <div className="flex items-center gap-1 mt-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {userData.name && userData.surname
                ? `${userData.name} ${userData.surname}`
                : userData.username}
            </h2>
            <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-500" />
          </div>

          {/* Profession/Bio */}
          {userData.profession && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
              {userData.profession}
            </p>
          )}
          
          {userData.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1 line-clamp-2 px-2">
              {userData.description}
            </p>
          )}

          {/* Location and School */}
          <div className="flex flex-col gap-1.5 mt-3 w-full">
            {userData.city && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{userData.city}</span>
              </div>
            )}
            {userData.school && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <GraduationCap className="w-4 h-4" />
                <span className="line-clamp-1">{userData.school}</span>
              </div>
            )}
          </div>

          {/* My Profile Button */}
          <Link href={`/profile/${userData.username}`} className="w-full mt-4">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
              My Profile
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
