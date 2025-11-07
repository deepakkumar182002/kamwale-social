import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      surname,
      description,
      profession,
      occupation,
      website,
      links,
      city,
      school,
      work,
      avatar,
      cover,
    } = body;

    // Find user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || null,
        surname: surname || null,
        description: description || null,
        profession: profession || null,
        occupation: occupation || null,
        website: website || null,
        links: links || null,
        city: city || null,
        school: school || null,
        work: work || null,
        avatar: avatar || null,
        cover: cover || null,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
