"use client";

import { useState, useCallback } from "react";
import AddPost from "@/components/AddPost";
import Stories from "@/components/Stories";
import Feed from "@/components/feed/Feed";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
import FloatingCreateButton from "@/components/FloatingCreateButton";

const Homepage = () => {
  const [optimisticPost, setOptimisticPost] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewPost = useCallback((post: any) => {
    setOptimisticPost(post);
  }, []);

  const handlePostCreated = useCallback(() => {
    // Trigger feed refresh after post is successfully created
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handlePostsLoaded = useCallback(() => {
    // Clear optimistic post once real posts are loaded
    setOptimisticPost(null);
  }, []);

  return (
    <>
      <div className="flex gap-0 lg:gap-8 lg:pt-6 lg:justify-center">
        {/* Main Content - Wider center column */}
        <div className="w-full lg:w-[600px] xl:w-[700px]">
          <div className="flex flex-col gap-0 md:gap-6">
            {/* Stories - full width on mobile like Instagram */}
            <div className="md:rounded-lg overflow-hidden">
              <Stories />
            </div>
            
            {/* Add Post - hidden on mobile, show on tablet+ */}
            <div className="hidden md:block">
              <AddPost onNewPost={handleNewPost} onPostCreated={handlePostCreated} />
            </div>
            
            {/* Feed - full width on mobile */}
            <Feed 
              onPostsLoaded={handlePostsLoaded} 
              optimisticPost={optimisticPost}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
        
        {/* Desktop Right Sidebar - Profile & Birthdays */}
        <div className="hidden lg:block w-[320px] xl:w-[360px]">
          <RightMenu />
        </div>
      </div>
      
      {/* Floating Create Button - Mobile Only */}
      <FloatingCreateButton 
        onNewPost={handleNewPost} 
        onPostCreated={handlePostCreated}
      />
    </>
  );
};

export default Homepage;
