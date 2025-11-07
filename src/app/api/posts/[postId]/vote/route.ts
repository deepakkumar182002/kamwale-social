import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma, { getUserIdFromClerk } from "@/lib/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
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

    const { optionIndex } = await request.json();
    const { postId } = params;

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.postType !== "poll") {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Check if poll has ended
    if (post.pollEndsAt && new Date() > post.pollEndsAt) {
      return NextResponse.json({ error: "Poll has ended" }, { status: 400 });
    }

    const currentVotes = (post.pollVotes as Record<string, number>) || {};
    
    // Add or change vote
    currentVotes[userId] = optionIndex;

    // Update post
    await prisma.post.update({
      where: { id: postId },
      data: {
        pollVotes: currentVotes,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
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

    const { postId } = params;

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.postType !== "poll") {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Check if poll has ended
    if (post.pollEndsAt && new Date() > post.pollEndsAt) {
      return NextResponse.json({ error: "Poll has ended" }, { status: 400 });
    }

    const currentVotes = (post.pollVotes as Record<string, number>) || {};
    
    // Check if user has voted
    if (!currentVotes[userId]) {
      return NextResponse.json({ error: "No vote to remove" }, { status: 400 });
    }

    // Remove vote
    delete currentVotes[userId];

    // Update post
    await prisma.post.update({
      where: { id: postId },
      data: {
        pollVotes: currentVotes,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing vote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
