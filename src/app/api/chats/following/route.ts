import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

export async function GET() {
  try {
    const { userId } = auth();

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
