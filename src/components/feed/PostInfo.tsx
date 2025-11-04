"use client";

import { deletePost } from "@/lib/actions";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import EditPostModal from "./EditPostModal";

interface PostInfoProps {
  postId: string;
  userClerkId: string;
  postDesc: string;
  postImg: string | null;
  postVideo: string | null;
}

const PostInfo = ({ postId, userClerkId, postDesc, postImg, postVideo }: PostInfoProps) => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwnPost = user?.id === userClerkId;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    setIsDeleting(true);
    try {
      await deletePost(postId);
      setOpen(false);
      window.location.reload(); // Refresh to remove deleted post
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
      setIsDeleting(false);
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        url: `${window.location.origin}/?postId=${postId}`,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/?postId=${postId}`);
      alert('Link copied to clipboard!');
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen((prev) => !prev)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
      >
        <MoreHorizontal className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 min-w-[200px]">
            {/* Edit button - only for own posts */}
            {isOwnPost && (
              <button 
                onClick={() => {
                  setShowEditModal(true);
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-3 dark:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Post
              </button>
            )}
            
            {/* Share button - available for all posts */}
            <button 
              onClick={handleShare}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-3 dark:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            
            {/* Delete button - only for own posts */}
            {isOwnPost && (
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-3 font-medium border-t border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            
            {/* Cancel button - available for all */}
            <button 
              onClick={() => setOpen(false)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition border-t border-gray-200 dark:border-gray-700 dark:text-white"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Edit Post Modal */}
      {showEditModal && (
        <EditPostModal
          postId={postId}
          initialDesc={postDesc}
          initialImg={postImg}
          initialVideo={postVideo}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default PostInfo;
