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

    const { postId } = params;

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.postType !== "event") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const currentRSVPs = (post.eventRSVPs as string[]) || [];
    
    // Toggle RSVP
    const hasRSVPd = currentRSVPs.includes(userId);
    const newRSVPs = hasRSVPd
      ? currentRSVPs.filter(id => id !== userId)
      : [...currentRSVPs, userId];

    // Update post
    await prisma.post.update({
      where: { id: postId },
      data: {
        eventRSVPs: newRSVPs,
      },
    });

    return NextResponse.json({ success: true, hasRSVPd: !hasRSVPd });
  } catch (error) {
    console.error("Error RSVP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
