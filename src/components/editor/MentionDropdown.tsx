"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface MentionDropdownProps {
  searchTerm: string;
  onSelect: (username: string, userId: string) => void;
  onClose: () => void;
}

const MentionDropdown = ({ searchTerm, onSelect, onClose }: MentionDropdownProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchTerm.length < 1) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  if (!searchTerm) return null;

  return (
    <div className="absolute z-20 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-w-sm w-full">
      <div className="p-2 border-b border-gray-200 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">Mention</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelect(user.username, user.id)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors"
            >
              <Image
                src={user.avatar || "/noAvatar.png"}
                alt={user.username}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-left">
                <div className="font-semibold text-sm">{user.name} {user.surname}</div>
                <div className="text-xs text-gray-500">@{user.username}</div>
              </div>
            </button>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">No users found</div>
        )}
      </div>
    </div>
  );
};

export default MentionDropdown;
