"use client";

import { useState, useCallback } from "react";
import AddPost from "@/components/AddPost";
import Stories from "@/components/Stories";
import Feed from "@/components/feed/Feed";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";

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
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 xl:gap-6 lg:pt-6 lg:justify-center relative z-10 w-full max-w-full overflow-x-hidden">
        {/* Desktop Left Sidebar - Hidden on mobile */}
        {/* <div className="hidden lg:block lg:w-[260px] xl:w-[300px] flex-shrink-0">
        </div> */}
          <LeftMenu type="home" />
        
        {/* Main Content - Responsive width with max constraints */}
        <div className="w-full lg:w-[480px] xl:w-[560px] flex-shrink-0 max-w-full">
          <div className="flex flex-col gap-0 md:gap-6">
            {/* Stories - full width on mobile like Instagram */}
            <div className="md:rounded-lg overflow-hidden">
              <Stories />
            </div>
            
            {/* Add Post - Now visible on all screen sizes */}
            <div className="bg-white md:rounded-lg md:shadow-sm border-b md:border border-gray-200">
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
        
        {/* Desktop Right Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:w-[260px] xl:w-[300px] flex-shrink-0">
          <RightMenu />
        </div>
      </div>
    </>
  );
};

export default Homepage;
