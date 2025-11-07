"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface ArticlePostProps {
  onClose: () => void;
  onPostCreated?: () => void;
  initialData?: any;
}

const ArticlePost = ({ onClose, onPostCreated, initialData }: ArticlePostProps) => {
  const [title, setTitle] = useState(initialData?.articleTitle || "");
  const [content, setContent] = useState(initialData?.desc || "");
  const [coverImage, setCoverImage] = useState<any>(
    initialData?.articleCoverImage ? { secure_url: initialData.articleCoverImage } : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please add a title and content");
      return;
    }

    setIsSubmitting(true);
    try {
      const readingTime = calculateReadingTime(content);
      
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desc: content,
          postType: "article",
          articleTitle: title,
          articleCoverImage: coverImage?.secure_url || null,
          articleReadingTime: readingTime,
        }),
      });

      if (response.ok) {
        onPostCreated?.();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Article creation failed:", response.status, errorData);
        throw new Error(errorData.error || "Failed to create article");
      }
    } catch (error) {
      console.error("Error creating article:", error);
      alert(`Failed to create article: ${error instanceof Error ? error.message : "Please try again"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Toggle */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {isPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {isPreview ? (
        /* Preview Mode */
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          {coverImage && (
            <Image
              src={coverImage.secure_url}
              alt="Cover"
              width={800}
              height={400}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title || "Untitled Article"}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span>{calculateReadingTime(content)} min read</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <>
          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cover Image (Optional)
            </label>
            {!coverImage ? (
              <CldUploadWidget
                uploadPreset="kamwale"
                options={{
                  resourceType: "image",
                  maxFileSize: 10000000, // 10MB
                  cloudName: "dhavbpm5k",
                }}
                onSuccess={(result) => {
                  setCoverImage(result.info);
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
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Image src="/addimage.png" alt="Upload" width={32} height={32} />
                      <p className="text-gray-600 text-sm">Add cover image</p>
                    </div>
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <div className="relative">
                <Image
                  src={coverImage.secure_url}
                  alt="Cover"
                  width={800}
                  height={300}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Article Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter an engaging title..."
              className="w-full px-4 py-3 text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={150}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/150 characters</p>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Article Content *
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your article content here... Use formatting, add links, mention people, and more!"
              minHeight="300px"
              showToolbar={true}
            />
            <p className="text-xs text-gray-500 mt-1">
              {calculateReadingTime(content)} min read • {content.trim().split(/\s+/).length} words
            </p>
          </div>
        </>
      )}

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
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Publishing..." : "Publish Article"}
        </button>
      </div>
    </div>
  );
};

export default ArticlePost;
