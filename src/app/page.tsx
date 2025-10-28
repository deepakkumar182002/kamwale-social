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
    <div className="flex gap-6 pt-6">
      <div className="hidden xl:block w-[20%]">
        <LeftMenu type="home" />
      </div>
      <div className="w-full lg:w-[70%] xl:w-[50%]">
        <div className="flex flex-col gap-6">
          <Stories />
          <AddPost onNewPost={handleNewPost} onPostCreated={handlePostCreated} />
          <Feed 
            onPostsLoaded={handlePostsLoaded} 
            optimisticPost={optimisticPost}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
      <div className="hidden lg:block w-[30%]">
        <RightMenu />
      </div>
    </div>
  );
};

export default Homepage;
