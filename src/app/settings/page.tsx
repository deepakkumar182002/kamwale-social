"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import EditProfileModal from "@/components/EditProfileModal";
import Image from "next/image";
import { Link as LinkIcon } from "lucide-react";

const SettingPage = () => {
  const { user: currentUser } = useUser();
  const [showEditModal, setShowEditModal] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/users/profile");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const handleEditSuccess = () => {
    // Refetch user data after successful edit
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/users/profile");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">User data not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Settings</h1>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold dark:text-white">Profile Information</h2>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            Edit Profile
          </button>
        </div>

        {/* Profile Display */}
        <div className="space-y-4">
          {/* Avatar and Cover */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
              {userData.cover ? (
                <Image src={userData.cover} alt="Cover" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No cover photo
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Image
                src={userData.avatar || "/noAvatar.png"}
                alt="Avatar"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-bold dark:text-white">
                  {userData.name && userData.surname
                    ? `${userData.name} ${userData.surname}`
                    : userData.username}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{userData.username}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold dark:text-white">{userData._count?.posts || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold dark:text-white">{userData._count?.followers || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold dark:text-white">{userData._count?.followings || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
            </div>
          </div>

          {/* Profession & Occupation */}
          {(userData.profession || userData.occupation) && (
            <div className="py-2">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Professional Info</div>
              <div className="text-base dark:text-white">
                {userData.profession && <span className="font-bold">{userData.profession}</span>}
                {userData.profession && userData.occupation && " • "}
                {userData.occupation && <span className="font-bold">{userData.occupation}</span>}
              </div>
            </div>
          )}

          {/* Description */}
          {userData.description && (
            <div className="py-2">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bio</div>
              <p className="text-base dark:text-white whitespace-pre-wrap">{userData.description}</p>
            </div>
          )}

          {/* Website */}
          {userData.website && (
            <div className="py-2">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Website</div>
              <a
                href={userData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {userData.website}
              </a>
            </div>
          )}

          {/* Additional Links */}
          {userData.links && userData.links.length > 0 && (
            <div className="py-2">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Links</div>
              <div className="flex flex-wrap gap-2">
                {userData.links.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    <LinkIcon size={14} />
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {userData.city && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">City</div>
                <div className="text-base dark:text-white">{userData.city}</div>
              </div>
            )}
            {userData.school && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">School/University</div>
                <div className="text-base dark:text-white">{userData.school}</div>
              </div>
            )}
            {userData.work && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Work/Company</div>
                <div className="text-base dark:text-white">{userData.work}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Account Settings</h2>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
            <div className="font-medium dark:text-white">Privacy & Security</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Manage your privacy settings</div>
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
            <div className="font-medium dark:text-white">Notifications</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Configure notification preferences</div>
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
            <div className="font-medium dark:text-white">Blocked Users</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Manage blocked accounts</div>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && userData && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          userData={{
            username: userData.username,
            name: userData.name,
            surname: userData.surname,
            description: userData.description,
            profession: userData.profession,
            occupation: userData.occupation,
            website: userData.website,
            links: userData.links,
            avatar: userData.avatar,
            cover: userData.cover,
            city: userData.city,
            school: userData.school,
            work: userData.work,
          }}
        />
      )}
    </div>
  );
};

export default SettingPage;