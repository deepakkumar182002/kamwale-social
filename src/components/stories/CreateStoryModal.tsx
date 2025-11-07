"use client";

import { useState } from "react";
import { X, Upload, Type, Image as ImageIcon, Video } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateStoryModal({ isOpen, onClose, onSuccess }: CreateStoryModalProps) {
  const [activeTab, setActiveTab] = useState<"text" | "photo" | "video">("photo");
  const [textContent, setTextContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setLoading(true);

    try {
      const body: any = { type: activeTab };

      if (activeTab === "text") {
        if (!textContent.trim()) {
          alert("Please enter some text");
          setLoading(false);
          return;
        }
        body.content = textContent;
      } else if (activeTab === "photo") {
        if (!selectedImage) {
          alert("Please select an image");
          setLoading(false);
          return;
        }
        body.img = selectedImage.secure_url;
      } else if (activeTab === "video") {
        if (!selectedVideo) {
          alert("Please select a video");
          setLoading(false);
          return;
        }
        body.video = selectedVideo.secure_url;
      }

      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // Reset form
        setTextContent("");
        setSelectedImage(null);
        setSelectedVideo(null);
        setActiveTab("photo");
        
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create story");
      }
    } catch (error) {
      console.error("Error creating story:", error);
      alert("Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Create Story</h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("text")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === "text"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Type size={20} className="inline mr-2" />
            Text
          </button>
          <button
            onClick={() => setActiveTab("photo")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === "photo"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ImageIcon size={20} className="inline mr-2" />
            Photo
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === "video"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Video size={20} className="inline mr-2" />
            Video
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "text" && (
            <div>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Write your story..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-2">
                {textContent.length}/500 characters
              </p>
            </div>
          )}

          {activeTab === "photo" && (
            <div>
              {selectedImage ? (
                <div className="relative">
                  <Image
                    src={selectedImage.secure_url}
                    alt="Selected"
                    width={400}
                    height={500}
                    className="w-full h-auto rounded-lg"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <CldUploadWidget
                  uploadPreset="kamwale"
                  options={{
                    cloudName: "dhavbpm5k",
                    resourceType: "image",
                    maxFileSize: 10000000, // 10MB
                  }}
                  onSuccess={(result) => {
                    setSelectedImage(result.info);
                  }}
                >
                  {({ open }) => (
                    <button
                      onClick={() => open()}
                      className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-4 hover:border-blue-500 transition-colors"
                    >
                      <Upload size={48} className="text-gray-400" />
                      <p className="text-gray-600 font-medium">
                        Click to upload photo
                      </p>
                      <p className="text-sm text-gray-400">Max 10MB</p>
                    </button>
                  )}
                </CldUploadWidget>
              )}
            </div>
          )}

          {activeTab === "video" && (
            <div>
              {selectedVideo ? (
                <div className="relative">
                  <video
                    src={selectedVideo.secure_url}
                    controls
                    className="w-full h-auto rounded-lg"
                  />
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <CldUploadWidget
                  uploadPreset="kamwale"
                  options={{
                    cloudName: "dhavbpm5k",
                    resourceType: "video",
                    maxFileSize: 50000000, // 50MB
                  }}
                  onSuccess={(result) => {
                    setSelectedVideo(result.info);
                  }}
                >
                  {({ open }) => (
                    <button
                      onClick={() => open()}
                      className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-4 hover:border-blue-500 transition-colors"
                    >
                      <Upload size={48} className="text-gray-400" />
                      <p className="text-gray-600 font-medium">
                        Click to upload video
                      </p>
                      <p className="text-sm text-gray-400">Max 50MB</p>
                    </button>
                  )}
                </CldUploadWidget>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Share Story"}
          </button>
        </div>
      </div>
    </div>
  );
}
