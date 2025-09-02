// Temporary debug script to check current user
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DebugUser() {
  const { userId } = auth();
  const user = await currentUser();
  
  console.log("Current User ID:", userId);
  console.log("Current User:", user);
  console.log("Username:", user?.username);
  
  return (
    <div>
      <h1>Debug User Info</h1>
      <p>User ID: {userId}</p>
      <p>Username: {user?.username}</p>
      <p>Email: {user?.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
