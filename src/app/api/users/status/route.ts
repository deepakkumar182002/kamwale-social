import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";

// Ensure this route is treated as dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
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

    const { isOnline } = await req.json();

    // Check if user exists first
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!existingUser) {
      // User doesn't exist yet, they will be created by getUserIdFromClerk on next API call
      return NextResponse.json({ success: true, message: "User pending creation" });
    }

    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        isOnline,
        lastSeen: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
