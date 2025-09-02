import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, content, receiverId } = await request.json();

    if (!chatId || !content || !receiverId) {
      return NextResponse.json(
        { error: "Chat ID, content, and receiver ID are required" },
        { status: 400 }
      );
    }

    // Verify the user is a participant in this chat
    const chatParticipant = await prisma.chatParticipant.findFirst({
      where: {
        chatId: chatId,
        userId: userId,
      },
    });

    if (!chatParticipant) {
      return NextResponse.json(
        { error: "You are not a participant in this chat" },
        { status: 403 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: content,
        chatId: chatId,
        senderId: userId,
        receiverId: receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true,
          },
        },
      },
    });

    // Update the chat's updatedAt field
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
