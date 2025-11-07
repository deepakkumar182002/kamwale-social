"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface PhotoPostProps {
  onClose: () => void;
  onPostCreated?: () => void;
  isTextOnly?: boolean;
  initialData?: any;
}

const PhotoPost = ({ onClose, onPostCreated, isTextOnly = false, initialData }: PhotoPostProps) => {
  const [description, setDescription] = useState(initialData?.desc || "");
  const [images, setImages] = useState<any[]>(initialData?.img ? [{ secure_url: initialData.img }] : []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim() && images.length === 0) {
      alert("Please add some content or images");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desc: description,
          postType: isTextOnly ? "text" : "photo",
          img: images.length > 0 ? images[0].secure_url : null,
          images: images.map(img => img.secure_url),
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

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Rich Text Editor */}
      <RichTextEditor
        value={description}
        onChange={setDescription}
        placeholder={isTextOnly ? "What's on your mind?" : "Add a description for your photos..."}
        minHeight="120px"
        showToolbar={true}
      />

      {/* Image Upload */}
      {!isTextOnly && (
        <div className="space-y-3">
          <CldUploadWidget
            uploadPreset="kamwale"
            options={{
              multiple: true,
              maxFiles: 10,
              resourceType: "image",
              cloudName: "dhavbpm5k",
            }}
            onSuccess={(result) => {
              setImages([...images, result.info]);
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
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <Image src="/addimage.png" alt="Upload" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10" />
                  <p className="text-gray-600 font-semibold text-sm md:text-base">Click to upload photos</p>
                  <p className="text-xs md:text-sm text-gray-500">or drag and drop (up to 10 images)</p>
                </div>
              </button>
            )}
          </CldUploadWidget>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={img.secure_url}
                    alt={`Upload ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-32 md:h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 md:top-2 right-1 md:right-2 bg-red-500 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-lg md:text-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 md:bottom-2 left-1 md:left-2 bg-black bg-opacity-50 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                    {index + 1} of {images.length}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 md:px-6 py-1.5 md:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm md:text-base"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || (!description.trim() && images.length === 0)}
          className="px-4 md:px-6 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default PhotoPost;
