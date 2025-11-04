import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma, { getUserIdFromClerk } from "@/lib/client";

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

    const { userId: clerkUserId } = authResult;

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get MongoDB ObjectId from Clerk ID
    const userId = await getUserIdFromClerk(clerkUserId);
    
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            avatar: true,
            name: true,
            surname: true,
          },
        },
        post: {
          select: {
            id: true,
            img: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get MongoDB ObjectId from Clerk ID
    const userId = await getUserIdFromClerk(clerkUserId);
    
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { chatId, type, messageType = "text" } = await request.json();

    if (!chatId || !type) {
      return NextResponse.json(
        { error: "Chat ID and type are required" },
        { status: 400 }
      );
    }

    // Get the chat to find the recipient
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Find the recipient (the other participant)
    const recipient = chat.participants.find(p => p.userId !== userId);
    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Create notification content based on type
    let content = "";
    if (type === "message") {
      content = messageType === "image" ? "sent you a photo" : "sent you a message";
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        content,
        fromUserId: userId,
        userId: recipient.userId,
        chatId: chatId,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            avatar: true,
            name: true,
            surname: true,
          },
        },
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get MongoDB ObjectId from Clerk ID
    const userId = await getUserIdFromClerk(clerkUserId);
    
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { notificationId } = body;

    if (notificationId) {
      // Mark single notification as read
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId, // Ensure user owns this notification
        },
        data: {
          read: true,
        },
      });
    } else {
      // Mark all notifications as read for this user
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          read: false,
        },
        data: {
          read: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}