import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
});

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper function to get MongoDB ObjectId from Clerk userId
// Automatically creates user if they don't exist
export async function getUserIdFromClerk(clerkId: string): Promise<string | null> {
  try {
    let user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });
    
    // If user doesn't exist, create them automatically
    if (!user) {
      console.log(`User not found for clerkId: ${clerkId}, creating new user...`);
      
      // Import currentUser here to avoid circular dependencies
      const { currentUser } = await import("@clerk/nextjs/server");
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        console.error("Could not fetch Clerk user data");
        return null;
      }
      
      user = await prisma.user.create({
        data: {
          clerkId: clerkId,
          username: clerkUser.username || `user_${clerkId.slice(-8)}`,
          avatar: clerkUser.imageUrl || "/noAvatar.png",
          cover: "/noCover.png",
          name: clerkUser.firstName || "",
          surname: clerkUser.lastName || "",
        },
        select: { id: true }
      });
      
      console.log(`New user created successfully with id: ${user.id}`);
    }
    
    return user?.id || null;
  } catch (error) {
    console.error("Error in getUserIdFromClerk:", error);
    return null;
  }
}
