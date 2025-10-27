import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

// Ensure this route is treated as dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error("WEBHOOK_SECRET is missing from environment variables");
      return new Response("Webhook secret not configured", {
        status: 500,
      });
    }

    // Get the headers
    let headerPayload;
    try {
      headerPayload = headers();
    } catch (error) {
      console.error("Error getting headers during build:", error);
      return new Response("Headers unavailable during build", {
        status: 503,
      });
    }

    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing svix headers:", { svix_id, svix_timestamp, svix_signature });
      return new Response("Error occured -- no svix headers", {
        status: 400,
      });
    }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Do something with the payload
  // For this guide, you simply log the payload to the console
  const { id } = evt.data;
  const eventType = evt.type;
  
  console.log(`Webhook received: ID=${id}, Type=${eventType}`);
  console.log('Full webhook body:', JSON.stringify(evt.data, null, 2));

  if (eventType === "user.created") {
    console.log("Creating new user...");
    try {
      const userData = {
        clerkId: evt.data.id,
        username: evt.data.username || `user_${evt.data.id.slice(-8)}`,
        avatar: evt.data.image_url || "/noAvatar.png",
        cover: "/noCover.png",
      };
      console.log("Creating user with data:", userData);
      
      await prisma.user.create({
        data: userData,
      });
      console.log("User created successfully!");
      return new Response("User has been created!", { status: 200 });
    } catch (err) {
      console.log("Error creating user:", err);
      return new Response("Failed to create the user!", { status: 500 });
    }
  }
  
  if (eventType === "user.updated") {
    console.log("Updating existing user...");
    try {
      const updateData: any = {
        avatar: evt.data.image_url || "/noAvatar.png",
      };
      
      // Only update username if it exists
      if (evt.data.username) {
        updateData.username = evt.data.username;
      }
      
      console.log("Updating user with data:", updateData);
      
      const updatedUser = await prisma.user.update({
        where: {
          clerkId: evt.data.id,
        },
        data: updateData,
      });
      console.log("User updated successfully:", updatedUser);
      return new Response("User has been updated!", { status: 200 });
    } catch (err) {
      console.log("Error updating user:", err);
      return new Response("Failed to update the user!", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
