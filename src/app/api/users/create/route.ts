import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (existingUser) {
      return NextResponse.json({ user: existingUser, message: "User already exists" });
    }

    // Get user data from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: "Could not get user data" }, { status: 400 });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        username: clerkUser.username || `user_${userId.slice(-8)}`,
        avatar: clerkUser.imageUrl || "/noAvatar.png",
        cover: "/noCover.png",
        name: clerkUser.firstName || "",
        surname: clerkUser.lastName || "",
      },
    });

    return NextResponse.json({ user: newUser, message: "User created successfully" });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
