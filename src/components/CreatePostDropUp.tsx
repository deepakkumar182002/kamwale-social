"use client";

import { useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { CldUploadWidget } from "next-cloudinary";

const CreatePostDropUp = ({ onClose }: { onClose: () => void }) => {
  const { user } = useUser();
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!desc.trim() && !img) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("desc", desc);
      if (img?.secure_url) {
        formData.append("img", img.secure_url);
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setDesc("");
        setImg(null);
        onClose();
        // Refresh page to show new post
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* User Info */}
      <div className="flex items-center gap-3 mb-4">
        <Image
          src={user?.imageUrl || "/noAvatar.png"}
          alt="Profile"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold dark:text-white">{user?.username}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Public</p>
        </div>
      </div>

      {/* Text Input */}
      <textarea
        placeholder="What's on your mind?"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="w-full p-3 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none scrollbar-hide"
        rows={4}
      />

      {/* Image Preview */}
      {img && (
        <div className="relative mt-3">
          <Image
            src={img.secure_url}
            alt="Upload"
            width={400}
            height={300}
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={() => setImg(null)}
            className="absolute top-2 right-2 p-1.5 bg-gray-900/70 hover:bg-gray-900 text-white rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {/* Upload Image */}
          <CldUploadWidget
            uploadPreset="social"
            onSuccess={(result) => setImg(result.info)}
          >
            {({ open }) => (
              <button
                onClick={() => open()}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Image src="/addimage.png" alt="Photo" width={20} height={20} />
                <span className="text-sm text-gray-600 dark:text-gray-400">Photo</span>
              </button>
            )}
          </CldUploadWidget>

          {/* Video Button */}
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Image src="/addVideo.png" alt="Video" width={20} height={20} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Video</span>
          </button>
        </div>

        {/* Post Button */}
        <button
          onClick={handlePost}
          disabled={loading || (!desc.trim() && !img)}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            loading || (!desc.trim() && !img)
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default CreatePostDropUp;
