import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import Post from "@/components/feed/Post";

// Future enhancement: Different feed types
export type FeedType = 'home' | 'following' | 'explore' | 'profile';

interface FeedProps {
  username?: string;
  type?: FeedType;
}

const Feed = async ({ username, type = 'explore' }: FeedProps) => {
  const { userId } = auth();
  let posts: any[] = [];

  if (username) {
    // Profile page - show user's posts
    posts = await prisma.post.findMany({
      where: { user: { username } },
      include: { user: true, likes: { select: { userId: true } }, _count: { select: { comments: true } } },
      orderBy: { createdAt: "desc" },
    });
  } else {
    switch (type) {
      case 'following':
        // Show posts from followed users only
        if (userId) {
          const following = await prisma.follower.findMany({
            where: { followerId: userId },
            select: { followingId: true },
          });
          const followingIds = following.map((f: { followingId: string }) => f.followingId);
          const ids = [userId, ...followingIds];
          
          posts = await prisma.post.findMany({
            where: { userId: { in: ids } },
            include: { user: true, likes: { select: { userId: true } }, _count: { select: { comments: true } } },
            orderBy: { createdAt: "desc" },
            take: 20,
          });
        }
        break;
      
      case 'explore':
      case 'home':
      default:
        // Show all posts (current implementation)
        posts = await prisma.post.findMany({
          include: { user: true, likes: { select: { userId: true } }, _count: { select: { comments: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        });
        break;
    }
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-12">
      {posts.length ? (
        posts.map(post => <Post key={post.id} post={post} />)
      ) : (
        "No posts found!"
      )}
    </div>
  );
};

export default Feed;
