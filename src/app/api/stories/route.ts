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
      authResult = await auth();
    } catch (error) {
      console.error("Auth error during build:", error);
      return NextResponse.json({ error: "Authentication unavailable" }, { status: 503 });
    }

    const { userId } = authResult;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stories = await prisma.story.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
        OR: [
          {
            user: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
          {
            userId: userId,
          },
        ],
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
