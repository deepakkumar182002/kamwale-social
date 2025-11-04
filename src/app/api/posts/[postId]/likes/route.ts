import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    // Fetch all likes for this post with user information
    const likes = await prisma.like.findMany({
      where: {
        postId,
      },
      include: {
        user: {
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

    // Transform to include full name
    const likedUsers = likes.map((like: any) => ({
      id: like.user.id,
      username: like.user.username,
      name: like.user.name && like.user.surname 
        ? `${like.user.name} ${like.user.surname}`
        : like.user.name || like.user.username,
      avatar: like.user.avatar,
    }));

    return NextResponse.json(likedUsers);
  } catch (error) {
    console.error("Error fetching liked users:", error);
    return NextResponse.json(
      { error: "Failed to fetch liked users" },
      { status: 500 }
    );
  }
}
