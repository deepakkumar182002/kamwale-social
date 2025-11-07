"use client";

import { useState, useEffect } from "react";

interface HashtagDropdownProps {
  searchTerm: string;
  onSelect: (tag: string) => void;
  onClose: () => void;
}

const popularHashtags = [
  "trending", "news", "technology", "programming", "design",
  "photography", "art", "music", "travel", "food",
  "fitness", "health", "business", "marketing", "innovation",
  "education", "science", "sports", "fashion", "lifestyle"
];

const HashtagDropdown = ({ searchTerm, onSelect, onClose }: HashtagDropdownProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (searchTerm.length === 0) {
      setSuggestions(popularHashtags.slice(0, 8));
    } else {
      const filtered = popularHashtags.filter(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8));
    }
  }, [searchTerm]);

  if (suggestions.length === 0 && searchTerm.length > 0) {
    return (
      <div className="absolute z-20 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-w-sm w-full p-4">
        <div className="text-sm text-gray-500 mb-2">No matching hashtags</div>
        <button
          type="button"
          onClick={() => onSelect(searchTerm)}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm font-semibold text-blue-600"
        >
          Use #{searchTerm}
        </button>
      </div>
    );
  }

  return (
    <div className="absolute z-20 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-w-sm w-full">
      <div className="p-2 border-b border-gray-200 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">Hashtags</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSelect(searchTerm)}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors border-b border-gray-100"
          >
            <span className="font-semibold text-blue-600">#{searchTerm}</span>
            <span className="text-xs text-gray-500 ml-2">(Create new)</span>
          </button>
        )}
        {suggestions.map((tag, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(tag)}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            <span className="font-semibold text-gray-700">#{tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HashtagDropdown;
