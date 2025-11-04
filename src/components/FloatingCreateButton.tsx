"use client";

import { useState } from "react";
import Image from "next/image";
import AddPost from "./AddPost";

const FloatingCreateButton = ({ 
  onNewPost, 
  onPostCreated 
}: { 
  onNewPost?: (post: any) => void;
  onPostCreated?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button - Mobile Only */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center z-40 transition-all active:scale-95"
      >
        <Image
          src="/addimage.png"
          alt="Create Post"
          width={24}
          height={24}
          className="w-6 h-6 filter brightness-0 invert"
        />
      </button>

      {/* Modal for Create Post */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto pb-6">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Post</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <span className="text-2xl text-gray-500">&times;</span>
              </button>
            </div>
            
            {/* Content */}
            <div className="px-4 pt-4">
              <AddPost 
                onNewPost={(post) => {
                  onNewPost?.(post);
                  setIsOpen(false);
                }} 
                onPostCreated={onPostCreated}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCreateButton;
