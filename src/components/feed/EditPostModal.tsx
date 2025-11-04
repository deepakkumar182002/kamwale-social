"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { updatePost } from "@/lib/actions";

interface EditPostModalProps {
  postId: string;
  initialDesc: string;
  initialImg?: string | null;
  initialVideo?: string | null;
  onClose: () => void;
}

const EditPostModal = ({ postId, initialDesc, initialImg, initialVideo, onClose }: EditPostModalProps) => {
  const [desc, setDesc] = useState(initialDesc);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updatePost(postId, desc);
      onClose();
      window.location.reload(); // Refresh to show updated post
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Edit Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Text Area */}
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full min-h-[150px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />

          {/* Video Preview */}
          {initialVideo && (
            <div className="mt-4">
              <video
                src={initialVideo}
                controls
                className="w-full max-h-96 rounded-lg"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Note: Video cannot be changed while editing
              </p>
            </div>
          )}

          {/* Image Preview */}
          {initialImg && !initialVideo && (
            <div className="mt-4">
              <div className="relative w-full h-96">
                <Image
                  src={initialImg}
                  alt="Post"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Note: Image cannot be changed while editing
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition dark:text-white"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !desc.trim()}
            >
              {isSubmitting ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
