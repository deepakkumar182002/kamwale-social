"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserInitializer() {
  const { user, isLoaded } = useUser();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      if (isLoaded && user && !initialized) {
        try {
          // Call the user creation endpoint
          const response = await fetch("/api/users/create", {
            method: "POST",
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("User initialization:", data.message || "User created");
            setInitialized(true);
          }
        } catch (error) {
          console.error("Error initializing user:", error);
        }
      }
    };

    initializeUser();
  }, [user, isLoaded, initialized]);

  return null; // This component doesn't render anything
}
