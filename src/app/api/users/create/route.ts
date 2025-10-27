import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { NextResponse } from "next/server";

// Ensure this route is treated as dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    // Handle case where auth might not be available during build
    let authResult;
    try {
      authResult = auth();
    } catch (error) {
      console.error("Auth error during build:", error);
      return NextResponse.json({ error: "Authentication unavailable" }, { status: 503 });
    }

    const { userId } = authResult;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId }
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
        clerkId: userId,
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
