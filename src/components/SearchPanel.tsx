"use client";

import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  name?: string;
  surname?: string;
  avatar?: string;
}

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [recentSearches, setRecentSearches] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem("recentSearches");
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const users = await response.json();
          setSearchResults(users);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleUserClick = (user: User) => {
    // Add to recent searches
    const updated = [user, ...recentSearches.filter(u => u.id !== user.id)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    // Navigate to profile
    router.push(`/profile/${user.username}`);
    onClose();
  };

  const clearRecentSearch = (userId: string) => {
    const updated = recentSearches.filter(u => u.id !== userId);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <div
        className={`fixed top-0 left-20 h-full w-96 dark:bg-gray-900 shadow-xl transform transition-transform duration-300 z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold dark:text-white">Search se</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results / Recent */}
        <div className="overflow-y-auto h-[calc(100%-120px)]">
          {searchQuery.trim().length > 0 ? (
            // Search Results
            <div>
              {isSearching ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                    >
                      <Image
                        src={user.avatar || "/noAvatar.png"}
                        alt={user.username}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold dark:text-white truncate">
                          {user.username}
                        </p>
                        {(user.name || user.surname) && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user.name} {user.surname}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              )}
            </div>
          ) : (
            // Recent Searches
            <div>
              {recentSearches.length > 0 && (
                <div className="flex items-center justify-between p-4">
                  <p className="font-semibold dark:text-white">Recent</p>
                  <button
                    onClick={clearAllRecent}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Clear all
                  </button>
                </div>
              )}
              {recentSearches.length > 0 ? (
                <div>
                  {recentSearches.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <div
                        onClick={() => handleUserClick(user)}
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        <Image
                          src={user.avatar || "/noAvatar.png"}
                          alt={user.username}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold dark:text-white truncate">
                            {user.username}
                          </p>
                          {(user.name || user.surname) && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.name} {user.surname}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => clearRecentSearch(user.id)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                      >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No recent searches</p>
                  <p className="text-sm mt-1">Search for users to get started</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
}
