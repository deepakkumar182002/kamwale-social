import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { profileUserId, profileUsername, recipientUserIds } = body;

    if (!profileUserId || !recipientUserIds || recipientUserIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create notifications for all recipients
    const notifications = await Promise.all(
      recipientUserIds.map(async (recipientUserId: string) => {
        return prisma.notification.create({
          data: {
            userId: recipientUserId,
            fromUserId: currentUser.id,
            type: "profile_share",
            content: `${
              currentUser.name && currentUser.surname
                ? currentUser.name + " " + currentUser.surname
                : currentUser.username
            } shared @${profileUsername}'s profile with you. Visit /profile/${profileUsername}`,
          },
        });
      })
    );

    return NextResponse.json(
      { message: "Profile shared successfully", notifications },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sharing profile:", error);
    return NextResponse.json(
      { error: "Failed to share profile" },
      { status: 500 }
    );
  }
}
