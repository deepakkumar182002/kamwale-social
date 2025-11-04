import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ replyId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { replyId } = await params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.replyLike.findUnique({
      where: {
        userId_replyId: {
          userId: user.id,
          replyId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.replyLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      return NextResponse.json({ liked: false, message: "Reply unliked" });
    } else {
      // Like
      await prisma.replyLike.create({
        data: {
          userId: user.id,
          replyId,
        },
      });
      return NextResponse.json({ liked: true, message: "Reply liked" });
    }
  } catch (error) {
    console.error("Error toggling reply like:", error);
    return NextResponse.json(
      { error: "Failed to toggle reply like" },
      { status: 500 }
    );
  }
}
