"use client";

import { useState } from "react";
import Image from "next/image";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface PollPostProps {
  onClose: () => void;
  onPostCreated?: () => void;
  initialData?: any;
}

const PollPost = ({ onClose, onPostCreated, initialData }: PollPostProps) => {
  const [question, setQuestion] = useState(initialData?.desc || "");
  const [options, setOptions] = useState<string[]>(
    initialData?.pollOptions || ["", ""]
  );
  const [duration, setDuration] = useState("1"); // days
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    const filledOptions = options.filter(opt => opt.trim());
    
    if (!question.trim()) {
      alert("Please enter a poll question");
      return;
    }

    if (filledOptions.length < 2) {
      alert("Please add at least 2 options");
      return;
    }

    setIsSubmitting(true);
    try {
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + parseInt(duration));

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desc: question,
          postType: "poll",
          pollOptions: filledOptions,
          pollEndsAt: endsAt.toISOString(),
          pollMultiple: allowMultiple,
          pollShowVotes: showResults,
          pollVotes: {},
        }),
      });

      if (response.ok) {
        onPostCreated?.();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Poll creation failed:", response.status, errorData);
        throw new Error(errorData.error || "Failed to create poll");
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      alert(`Failed to create poll: ${error instanceof Error ? error.message : "Please try again"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Poll Question */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Poll Question *
        </label>
        <RichTextEditor
          value={question}
          onChange={setQuestion}
          placeholder="Ask a question..."
          minHeight="80px"
          showToolbar={false}
        />
      </div>

      {/* Poll Options */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Poll Options * (2-10 options)
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2 items-center">
              <span className="text-gray-500 font-semibold w-6">{index + 1}.</span>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="text-red-500 hover:text-red-700 p-2 text-xl font-bold"
                  title="Remove option"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        
        {options.length < 10 && (
          <button
            type="button"
            onClick={addOption}
            className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            <span className="text-xl">+</span>
            Add Option
          </button>
        )}
      </div>

      {/* Poll Settings */}
      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700">Poll Settings</h3>
        
        {/* Duration */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Poll Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1 Day</option>
            <option value="3">3 Days</option>
            <option value="7">1 Week</option>
            <option value="14">2 Weeks</option>
            <option value="30">1 Month</option>
          </select>
        </div>

        {/* Multiple Selection */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allowMultiple}
            onChange={(e) => setAllowMultiple(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Allow multiple selections</span>
        </label>

        {/* Show Results */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showResults}
            onChange={(e) => setShowResults(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Show results after voting</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Poll"}
        </button>
      </div>
    </div>
  );
};

export default PollPost;
