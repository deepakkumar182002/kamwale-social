import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma, { getUserIdFromClerk } from "@/lib/client";

// POST - Reply to a story (send message)
export async function POST(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = await getUserIdFromClerk(clerkUserId);

    if (!userId) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { storyId } = params;
    const body = await req.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { message: "Message content is required" },
        { status: 400 }
      );
    }

    // Get story details
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    // Don't send message on own story
    if (story.userId === userId) {
      return NextResponse.json({ message: "Cannot reply to own story" });
    }

    // Get current user details
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        name: true,
        surname: true,
      },
    });

    // Find or create chat between users
    const existingChat = await prisma.chat.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [userId, story.userId],
            },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    let chat;
    if (existingChat && existingChat.participants.length === 2) {
      chat = existingChat;
    } else {
      // Create new chat
      chat = await prisma.chat.create({
        data: {
          participants: {
            create: [
              { userId: userId },
              { userId: story.userId },
            ],
          },
        },
      });
    }

    // Create message
    const newMessage = await prisma.message.create({
      data: {
        content: message,
        type: "text",
        senderId: userId,
        receiverId: story.userId,
        chatId: chat.id,
      },
    });

    // Update chat timestamp
    await prisma.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });

    // Create notification for story owner
    const notification = await prisma.notification.create({
      data: {
        type: "story_reply",
        content: `${currentUser?.name || currentUser?.username} replied to your story: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
        userId: story.userId,
        fromUserId: userId,
        chatId: chat.id,
      },
    });

    return NextResponse.json({
      message: "Reply sent successfully",
      chatMessage: newMessage,
      notification,
    });
  } catch (error) {
    console.error("Error sending story reply:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
