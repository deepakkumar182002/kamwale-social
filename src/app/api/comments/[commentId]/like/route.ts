import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      return NextResponse.json({ liked: false, message: "Comment unliked" });
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          userId: user.id,
          commentId,
        },
      });
      return NextResponse.json({ liked: true, message: "Comment liked" });
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json(
      { error: "Failed to toggle comment like" },
      { status: 500 }
    );
  }
}

// Get all users who liked a comment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;

    const likes = await prisma.commentLike.findMany({
      where: {
        commentId,
      },
    });

    // Get user data for each like
    const usersWhoLiked = await Promise.all(
      likes.map(async (like: any) => {
        const user = await prisma.user.findUnique({
          where: { id: like.userId },
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true,
          },
        });
        return user;
      })
    );

    return NextResponse.json(usersWhoLiked.filter(Boolean));
  } catch (error) {
    console.error("Error fetching comment likes:", error);
    return NextResponse.json(
      { error: "Failed to fetch comment likes" },
      { status: 500 }
    );
  }
}
