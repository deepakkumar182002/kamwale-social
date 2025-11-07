import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma, { getUserIdFromClerk } from "@/lib/client";

// Ensure this route is treated as dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const exploreMode = searchParams.get("explore") === "true";

    let posts: any[] = [];

    if (username) {
      // Show posts from a specific user (for profile pages)
      posts = await prisma.post.findMany({
        where: {
          user: {
            username: username,
          },
        },
        include: {
          user: true,
          likes: {
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else if (exploreMode) {
      // Explore mode - Random posts from all users (Instagram style)
      const allPosts = await prisma.post.findMany({
        include: {
          user: true,
          likes: {
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50, // Get more posts for random selection
      });
      
      // Shuffle posts for random order (Instagram explore style)
      posts = allPosts.sort(() => Math.random() - 0.5).slice(0, 20);
    } else {
      // Show all posts from all users (home page)
      posts = await prisma.post.findMany({
        include: {
          user: true,
          likes: {
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20, // Limit to 20 most recent posts for better performance
      });
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await auth();
    const { userId: clerkUserId } = authResult;

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getUserIdFromClerk(clerkUserId);
    
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { 
      desc, 
      postType = "text",
      img,
      images,
      video,
      richContent,
      articleTitle,
      articleCoverImage,
      articleReadingTime,
      pollOptions,
      pollEndsAt,
      pollMultiple,
      pollShowVotes,
      pollVotes,
      eventTitle,
      eventStartDate,
      eventEndDate,
      eventLocation,
      eventType,
      eventCoverImage,
      eventRSVPs
    } = body;

    // Validation
    if (!desc || desc.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Create post with appropriate fields based on type
    const postData: any = {
      desc: desc.trim(),
      postType,
      userId,
    };

    // Add media fields if present
    if (img) postData.img = img;
    if (video) postData.video = video;
    if (richContent) postData.richContent = richContent;

    // Add article fields
    if (postType === "article") {
      if (!articleTitle) {
        return NextResponse.json({ error: "Article title is required" }, { status: 400 });
      }
      postData.articleTitle = articleTitle;
      postData.articleCoverImage = articleCoverImage;
      postData.articleReadingTime = articleReadingTime;
    }

    // Add poll fields
    if (postType === "poll") {
      if (!pollOptions || pollOptions.length < 2) {
        return NextResponse.json({ error: "Poll must have at least 2 options" }, { status: 400 });
      }
      postData.pollOptions = pollOptions;
      postData.pollEndsAt = pollEndsAt ? new Date(pollEndsAt) : null;
      postData.pollMultiple = pollMultiple || false;
      postData.pollShowVotes = pollShowVotes !== false;
      postData.pollVotes = pollVotes || {};
    }

    // Add event fields
    if (postType === "event") {
      if (!eventTitle || !eventStartDate) {
        return NextResponse.json({ error: "Event title and start date are required" }, { status: 400 });
      }
      postData.eventTitle = eventTitle;
      postData.eventStartDate = new Date(eventStartDate);
      postData.eventEndDate = eventEndDate ? new Date(eventEndDate) : null;
      postData.eventLocation = eventLocation;
      postData.eventType = eventType || "physical";
      postData.eventCoverImage = eventCoverImage;
      postData.eventRSVPs = eventRSVPs || [];
    }

    const post = await prisma.post.create({
      data: postData,
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
