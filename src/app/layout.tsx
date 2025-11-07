import { Inter } from "next/font/google";
// @ts-ignore: side-effect CSS import has no type declarations
import "./globals.css";
import MessageView from "@/components/MessageView";
import LayoutClient from "@/components/LayoutClient";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
        </head>
        <body className={`${inter.className} overflow-x-hidden`}>
          <LayoutClient>
            {children}
          </LayoutClient>
          
          {/* Mobile: Full Screen Message View */}
          <Suspense fallback={<div></div>}>
            <MessageView />
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
