"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  name?: string;
  surname?: string;
  avatar?: string;
}

const SearchFriends = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(term)}`);
      if (response.ok) {
        const users = await response.json();
        setSearchResults(users);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`);
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <div className="flex items-center bg-slate-100 rounded-lg p-2 text-sm">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search friends..."
          className="bg-transparent outline-none flex-1 ml-2"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(e.target.value);
          }}
        />
      </div>

      {/* Search Results Dropdown */}
      {searchTerm && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => handleUserClick(user.username)}
              >
                <Image
                  src={user.avatar || "/noAvatar.png"}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{user.username}</span>
                  {(user.name || user.surname) && (
                    <span className="text-xs text-gray-500">
                      {user.name} {user.surname}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFriends;
