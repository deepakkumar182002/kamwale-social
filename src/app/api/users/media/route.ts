import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

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

    const { userId } = authResult;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const postsWithMedia = await prisma.post.findMany({
      where: {
        userId: targetUserId,
        img: {
          not: null,
        },
      },
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(postsWithMedia);
  } catch (error) {
    console.error("Error fetching user media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
