import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma, { getUserIdFromClerk } from "@/lib/client";

// DELETE - Delete a specific story (owner only)
export async function DELETE(
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

    // Check if story exists and belongs to user
    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    if (story.userId !== userId) {
      return NextResponse.json(
        { message: "Not authorized to delete this story" },
        { status: 403 }
      );
    }

    // Delete story (views will be deleted automatically due to cascade)
    await prisma.story.delete({
      where: { id: storyId },
    });

    return NextResponse.json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
