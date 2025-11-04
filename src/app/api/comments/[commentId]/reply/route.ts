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
    const { text, taggedUserId } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create reply
    const reply = await prisma.commentReply.create({
      data: {
        desc: text.trim(),
        userId: user.id,
        commentId,
        taggedUserId: taggedUserId || null,
      },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return NextResponse.json(reply);
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    );
  }
}

// Get all replies for a comment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;

    const replies = await prisma.commentReply.findMany({
      where: {
        commentId,
      },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Get user data for each reply
    const repliesWithUsers = await Promise.all(
      replies.map(async (reply: any) => {
        const user = await prisma.user.findUnique({
          where: { id: reply.userId },
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true,
          },
        });

        let taggedUser = null;
        if (reply.taggedUserId) {
          taggedUser = await prisma.user.findUnique({
            where: { id: reply.taggedUserId },
            select: {
              id: true,
              username: true,
              name: true,
              surname: true,
            },
          });
        }

        return {
          ...reply,
          user,
          taggedUser,
        };
      })
    );

    return NextResponse.json(repliesWithUsers);
  } catch (error) {
    console.error("Error fetching replies:", error);
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 }
    );
  }
}
