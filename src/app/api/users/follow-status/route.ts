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
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (userId === targetUserId) {
      return NextResponse.json({
        isFollowing: false,
        isFollowRequestSent: false,
        isBlocked: false
      });
    }

    const [followRelation, followRequest, blockRelation] = await Promise.all([
      prisma.follow.findFirst({
        where: {
          followerId: userId,
          followingId: targetUserId,
        },
      }),
      prisma.followRequest.findFirst({
        where: {
          senderId: userId,
          receiverId: targetUserId,
        },
      }),
      prisma.block.findFirst({
        where: {
          blockerId: targetUserId,
          blockedId: userId,
        },
      }),
    ]);

    return NextResponse.json({
      isFollowing: !!followRelation,
      isFollowRequestSent: !!followRequest,
      isBlocked: !!blockRelation
    });
  } catch (error) {
    console.error("Error fetching follow status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
