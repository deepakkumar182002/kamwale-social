import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

// Ensure this route is treated as dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Handle case where auth might not be available during build
    let authResult;
    try {
      authResult = auth();
    } catch (error) {
      console.error("Auth error during build:", error);
      return NextResponse.json({ error: "Authentication unavailable" }, { status: 503 });
    }

    const { userId } = authResult;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get users that the current user is following
    const following = await prisma.follower.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
    });

    const followingUsers = following.map((f) => f.following);

    return NextResponse.json(followingUsers);
  } catch (error) {
    console.error("Error fetching following users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
