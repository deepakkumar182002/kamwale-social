import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma, { getUserIdFromClerk } from "@/lib/client";

// POST - Raise hand on a story
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

    // Get story details
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    // Don't raise hand on own story
    if (story.userId === userId) {
      return NextResponse.json({ message: "Cannot raise hand on own story" });
    }

    // Get current user details
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        name: true,
        surname: true,
      },
    });

    // Create notification for story owner
    const notification = await prisma.notification.create({
      data: {
        type: "story_raise_hand",
        content: `${currentUser?.name || currentUser?.username} raised hand on your story`,
        userId: story.userId,
        fromUserId: userId,
      },
    });

    return NextResponse.json({
      message: "Raised hand successfully",
      notification,
    });
  } catch (error) {
    console.error("Error raising hand on story:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
