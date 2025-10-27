"use client";

import { useState, useEffect } from "react";
import { User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

const UserMediaCard = ({ user }: { user: User }) => {
  const [postsWithMedia, setPostsWithMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserMedia = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/media?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setPostsWithMedia(data);
        } else {
          console.error('Failed to fetch user media:', response.status);
          setPostsWithMedia([]);
        }
      } catch (error) {
        console.error('Error fetching user media:', error);
        setPostsWithMedia([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMedia();
  }, [user.id]);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="flex gap-4 justify-between flex-wrap">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="w-1/4 h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* TOP */}
      <div className="flex justify-between items-center font-medium">
        <span className="text-gray-500">User Media</span>
        <Link href="/" className="text-blue-500 text-xs">
          See all
        </Link>
      </div>
      {/* BOTTOM */}
      <div className="flex gap-4 justify-between flex-wrap">
        {postsWithMedia.length
          ? postsWithMedia.map((post) => (
              <div className="relative w-1/5 h-24" key={post.id}>
                <Image
                  src={post.img!}
                  alt=""
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            ))
          : "No media found!"}
      </div>
    </div>
  );
};

export default UserMediaCard;
