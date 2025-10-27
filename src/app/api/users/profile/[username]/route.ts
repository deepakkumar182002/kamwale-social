import { auth } from "@clerk/nextjs/server";
import prisma, { getUserIdFromClerk } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = async (
  req: NextRequest,
  { params }: { params: { username: string } }
) => {
  try {
    const username = params.username;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    console.log("Looking for username:", username);

    const user = await prisma.user.findFirst({
      where: {
        username,
      },
      select: {
        id: true,
        clerkId: true,
        username: true,
        avatar: true,
        cover: true,
        name: true,
        surname: true,
        description: true,
        city: true,
        school: true,
        work: true,
        website: true,
        createdAt: true,
        lastSeen: true,
        isOnline: true,
        _count: {
          select: {
            followers: true,
            followings: true,
            posts: true,
          },
        },
      },
    });

    console.log("User found:", user ? user.username : "No user found");

    if (!user) {
      console.log("User not found, returning 404");
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { userId: currentClerkUserId } = auth();

    let isBlocked = false;
    let isFollowing = false;
    let isFollowRequestSent = false;
    let currentUserId = null;

    if (currentClerkUserId) {
      // Get MongoDB ObjectId from Clerk ID
      currentUserId = await getUserIdFromClerk(currentClerkUserId);
      
      if (currentUserId) {
        const [blockRelation, followRelation, followRequest] = await Promise.all([
          prisma.block.findFirst({
            where: {
              blockerId: user.id,
              blockedId: currentUserId,
            },
          }),
          prisma.follow.findFirst({
            where: {
              followerId: currentUserId,
              followingId: user.id,
            },
          }),
          prisma.followRequest.findFirst({
            where: {
              senderId: currentUserId,
              receiverId: user.id,
            },
          }),
        ]);

        isBlocked = !!blockRelation;
        isFollowing = !!followRelation;
        isFollowRequestSent = !!followRequest;
      }
    }

    if (isBlocked) {
      return NextResponse.json(
        { error: "User is blocked" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user,
      isBlocked,
      isFollowing,
      isFollowRequestSent,
      currentUserId,
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
