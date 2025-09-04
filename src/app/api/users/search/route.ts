import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";

// Ensure this route is treated as dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: userId, // Exclude current user from search results
            },
          },
          {
            OR: [
              {
                username: {
                  contains: query,
                },
              },
              {
                name: {
                  contains: query,
                },
              },
              {
                surname: {
                  contains: query,
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        avatar: true,
      },
      take: 10, // Limit results
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
