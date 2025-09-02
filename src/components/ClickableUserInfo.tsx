"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface UserInfoProps {
  user: {
    id: string;
    username: string;
    name?: string | null;
    surname?: string | null;
    avatar?: string | null;
  };
}

const ClickableUserInfo = ({ user }: UserInfoProps) => {
  const router = useRouter();

  const handleUserClick = () => {
    router.push(`/profile/${user.username}`);
  };

  return (
    <div className="flex items-center gap-4">
      <Image
        src={user.avatar || "/noAvatar.png"}
        width={40}
        height={40}
        alt=""
        className="w-10 h-10 rounded-full cursor-pointer"
        onClick={handleUserClick}
      />
      <div className="flex flex-col">
        <span 
          className="font-medium cursor-pointer hover:underline"
          onClick={handleUserClick}
        >
          {user.name && user.surname
            ? user.name + " " + user.surname
            : user.username}
        </span>
        <span className="text-sm text-gray-500">@{user.username}</span>
      </div>
    </div>
  );
};

export default ClickableUserInfo;
