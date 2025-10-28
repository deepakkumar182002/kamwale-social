"use client";

import { useUser } from "@clerk/nextjs";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useState } from "react";
import AddPostButton from "./AddPostButton";
import { addPost } from "@/lib/actions";

const AddPost = ({ 
  onNewPost, 
  onPostCreated 
}: { 
  onNewPost?: (post: any) => void;
  onPostCreated?: () => void;
}) => {
  const { user, isLoaded } = useUser();
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState<any>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoaded) {
    return "Loading...";
  }

  const handleSubmit = async (formData: FormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Create optimistic post immediately
    const optimisticPost = {
      id: `temp-${Date.now()}`,
      desc: desc,
      img: img?.secure_url || null,
      createdAt: new Date().toISOString(),
      user: {
        id: user?.id || "",
        username: user?.username || "",
        avatar: user?.imageUrl || "/noAvatar.png",
        name: user?.firstName || "",
        surname: user?.lastName || "",
      },
      _count: {
        likes: 0,
        comments: 0,
      },
      likes: [],
      comments: [],
      _isOptimistic: true,
    };

    // Show optimistic post immediately
    onNewPost?.(optimisticPost);

    // Clear form immediately for better UX
    const descValue = desc;
    const imgValue = img;
    setDesc("");
    setImg(null);

    try {
      await addPost(formData, imgValue?.secure_url || "");
      // Post created successfully - trigger feed refresh
      onPostCreated?.();
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Failed to post. Please try again.");
      // Restore form values on error
      setDesc(descValue);
      setImg(imgValue);
      // Clear optimistic post
      onNewPost?.(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex gap-4 justify-between text-sm">
      {/* AVATAR */}
      <Image
        src={user?.imageUrl || "/noAvatar.png"}
        alt=""
        width={48}
        height={48}
        className="w-12 h-12 object-cover rounded-full"
      />
      {/* POST */}
      <div className="flex-1">
        {/* TEXT INPUT */}
        <form action={handleSubmit} className="flex gap-4">
          <textarea
            placeholder="What's on your mind?"
            className="flex-1 bg-slate-100 rounded-lg p-2"
            name="desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={isSubmitting}
          ></textarea>
          <div className="">
            <Image
              src="/emoji.png"
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 cursor-pointer self-end"
            />
            <AddPostButton />
          </div>
        </form>
        {/* UPLOADED IMAGE PREVIEW */}
        {img && (
          <div className="mt-4 relative">
            <Image
              src={img.secure_url}
              alt="Uploaded"
              width={200}
              height={200}
              className="object-cover rounded-lg"
            />
            <button
              onClick={() => setImg(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              type="button"
            >
              ×
            </button>
          </div>
        )}
        {/* POST OPTIONS */}
        <div className="flex items-center gap-4 mt-4 text-gray-400 flex-wrap">
          <CldUploadWidget
            uploadPreset="kamwale"
            onSuccess={(result, { widget }) => {
              console.log("Upload successful:", result.info);
              setImg(result.info);
              widget.close();
            }}
            onError={(error) => {
              console.error("Upload error:", error);
              alert("Upload failed. Please try again.");
            }}
          >
            {({ open }) => {
              return (
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => open()}
                >
                  <Image src="/addimage.png" alt="" width={20} height={20} />
                  Photo
                </div>
              );
            }}
          </CldUploadWidget>
          <div className="flex items-center gap-2 cursor-pointer">
            <Image src="/addVideo.png" alt="" width={20} height={20} />
            Video
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <Image src="/poll.png" alt="" width={20} height={20} />
            Poll
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <Image src="/addevent.png" alt="" width={20} height={20} />
            Event
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
