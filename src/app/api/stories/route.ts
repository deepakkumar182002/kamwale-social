import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma, { getUserIdFromClerk } from "@/lib/client";

// Ensure this route is treated as dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch all active stories (not expired)
export async function GET() {
  try {
    // Handle case where auth might not be available during build
    let authResult;
    try {
      authResult = await auth();
    } catch (error) {
      console.error("Auth error during build:", error);
      return NextResponse.json({ error: "Authentication unavailable" }, { status: 503 });
    }

    const { userId: clerkUserId } = authResult;

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get MongoDB ObjectId from Clerk ID
    const userId = await getUserIdFromClerk(clerkUserId);
    
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all active stories (not expired) - visible to all users
    const now = new Date();
    
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: {
          gt: now, // Greater than current time (not expired)
        },
        // No follow restriction - all stories visible to everyone
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            name: true,
            surname: true,
          },
        },
        views: {
          where: {
            userId: userId,
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group stories by user
    const groupedStories = stories.reduce((acc: any, story) => {
      const userIdKey = story.user.id;
      if (!acc[userIdKey]) {
        acc[userIdKey] = {
          user: story.user,
          stories: [],
        };
      }
      acc[userIdKey].stories.push({
        ...story,
        hasViewed: story.views.length > 0,
      });
      return acc;
    }, {});

    // Convert to array and sort (unviewed first, then by latest story)
    const result = Object.values(groupedStories).sort((a: any, b: any) => {
      // Current user's stories first
      if (a.user.id === userId) return -1;
      if (b.user.id === userId) return 1;

      // Then unviewed stories
      const aHasUnviewed = a.stories.some((s: any) => !s.hasViewed);
      const bHasUnviewed = b.stories.some((s: any) => !s.hasViewed);
      
      if (aHasUnviewed && !bHasUnviewed) return -1;
      if (!aHasUnviewed && bHasUnviewed) return 1;

      // Then by latest story
      const aLatest = new Date(a.stories[0].createdAt).getTime();
      const bLatest = new Date(b.stories[0].createdAt).getTime();
      return bLatest - aLatest;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new story
export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = await getUserIdFromClerk(clerkUserId);

    if (!userId) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { type, content, img, video } = body;

    // Validate story type and content
    if (!type || !["text", "photo", "video"].includes(type)) {
      return NextResponse.json(
        { message: "Invalid story type" },
        { status: 400 }
      );
    }

    if (type === "text" && !content) {
      return NextResponse.json(
        { message: "Text content is required for text stories" },
        { status: 400 }
      );
    }

    if (type === "photo" && !img) {
      return NextResponse.json(
        { message: "Image is required for photo stories" },
        { status: 400 }
      );
    }

    if (type === "video" && !video) {
      return NextResponse.json(
        { message: "Video is required for video stories" },
        { status: 400 }
      );
    }

    // Calculate expiry time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create story
    const newStory = await prisma.story.create({
      data: {
        type,
        content: content || null,
        img: img || null,
        video: video || null,
        userId: userId,
        expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            name: true,
            surname: true,
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
    });

    return NextResponse.json(newStory, { status: 201 });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete expired stories (cron job or manual trigger)
export async function DELETE() {
  try {
    const now = new Date();

    // Delete all expired stories
    const result = await prisma.story.deleteMany({
      where: {
        expiresAt: {
          lte: now, // Less than or equal to current time
        },
      },
    });

    return NextResponse.json({
      message: `Deleted ${result.count} expired stories`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error deleting expired stories:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
