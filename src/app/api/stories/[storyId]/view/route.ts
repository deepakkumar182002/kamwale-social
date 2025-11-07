import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma, { getUserIdFromClerk } from "@/lib/client";

// POST - Mark story as viewed
export async function POST(
  req: Request,
  { params }: { params: { storyId: string } }
) {
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

    const { storyId } = params;

    // Check if story exists and not expired
    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    if (new Date() > story.expiresAt) {
      return NextResponse.json({ message: "Story expired" }, { status: 410 });
    }

    // Don't track views for own stories
    if (story.userId === userId) {
      return NextResponse.json({ message: "Cannot view own story" });
    }

    // Create or update view record
    const view = await prisma.storyView.upsert({
      where: {
        userId_storyId: {
          userId: userId,
          storyId: storyId,
        },
      },
      update: {
        createdAt: new Date(), // Update view time
      },
      create: {
        userId: userId,
        storyId: storyId,
      },
    });

    return NextResponse.json(view);
  } catch (error) {
    console.error("Error marking story as viewed:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get story views (for story owner only)
export async function GET(
  req: Request,
  { params }: { params: { storyId: string } }
) {
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

    const { storyId } = params;

    // Check if story exists and belongs to user
    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    if (story.userId !== userId) {
      return NextResponse.json(
        { message: "Not authorized to view story insights" },
        { status: 403 }
      );
    }

    // Get all views for this story
    const views = await prisma.storyView.findMany({
      where: { storyId: storyId },
      include: {
        story: {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      story: {
        id: story.id,
        type: story.type,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
      },
      viewCount: views.length,
      views: views.map(v => ({
        userId: v.userId,
        viewedAt: v.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching story views:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
