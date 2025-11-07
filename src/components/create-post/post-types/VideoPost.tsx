"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface VideoPostProps {
  onClose: () => void;
  onPostCreated?: () => void;
  initialData?: any;
}

const VideoPost = ({ onClose, onPostCreated, initialData }: VideoPostProps) => {
  const [description, setDescription] = useState(initialData?.desc || "");
  const [video, setVideo] = useState<any>(initialData?.video ? { secure_url: initialData.video } : null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!video) {
      alert("Please upload a video");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desc: description,
          postType: "video",
          video: video.secure_url,
        }),
      });

      if (response.ok) {
        onPostCreated?.();
        onClose();
      } else {
        throw new Error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Rich Text Editor */}
      <RichTextEditor
        value={description}
        onChange={setDescription}
        placeholder="Describe your video..."
        minHeight="100px"
        showToolbar={true}
      />

      {/* Video Upload */}
      <div className="space-y-3">
        {!video ? (
          <CldUploadWidget
            uploadPreset="kamwale"
            options={{
              resourceType: "video",
              maxFileSize: 100000000, // 100MB
              sources: ["local", "url", "camera"],
              cloudName: "dhavbpm5k",
            }}
            onSuccess={(result) => {
              setVideo(result.info);
            }}
            onError={(error) => {
              console.error("Upload error:", error);
              alert("Upload failed. Please try again.");
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <Image src="/addVideo.png" alt="Upload" width={40} height={40} />
                  <p className="text-gray-600 font-semibold">Click to upload video</p>
                  <p className="text-sm text-gray-500">MP4, MOV, AVI (max 100MB)</p>
                </div>
              </button>
            )}
          </CldUploadWidget>
        ) : (
          <div className="relative">
            <video
              src={video.secure_url}
              controls
              className="w-full rounded-lg max-h-96"
            />
            <button
              type="button"
              onClick={() => setVideo(null)}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg hover:bg-red-600"
            >
              ×
            </button>
            <div className="mt-2 bg-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Duration: {video.duration ? `${Math.round(video.duration)}s` : 'N/A'}</span>
                <span className="text-gray-600">Size: {video.bytes ? `${(video.bytes / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
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
          disabled={isSubmitting || !video}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default VideoPost;
