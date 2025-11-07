"use client";

import { useState, useEffect } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  name?: string;
  surname?: string;
  avatar?: string;
}

export default function SearchPage() {
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
  };

  const clearRecentSearch = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(u => u.id !== userId);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Search Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <X className="w-6 h-6 dark:text-white" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              autoFocus
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Search Results */}
        {searchQuery.length >= 2 ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              Search Results
            </h3>
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    <Image
                      src={user.avatar || "/noAvatar.png"}
                      alt={user.username}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-semibold dark:text-white">
                        {user.name && user.surname
                          ? `${user.name} ${user.surname}`
                          : user.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
              </div>
            )}
          </div>
        ) : (
          /* Recent Searches */
          <div>
            {recentSearches.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearAllRecent}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      <button
                        onClick={() => handleUserClick(user)}
                        className="flex-1 flex items-center gap-3"
                      >
                        <Image
                          src={user.avatar || "/noAvatar.png"}
                          alt={user.username}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                        <div className="text-left">
                          <p className="font-semibold dark:text-white">
                            {user.name && user.surname
                              ? `${user.name} ${user.surname}`
                              : user.username}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={(e) => clearRecentSearch(user.id, e)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                      >
                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">No recent searches</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Search for users to get started
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
