// app/default-layout.tsx
"use client";

import React from "react";
import { AppSidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useAuth, SignInButton } from "@clerk/nextjs";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();
  const { isLoaded, userId } = useAuth();

  // Check if the current path is in the auth route group
  const isAuthPage =
    pathname?.includes("/sign-in") || pathname?.includes("/sign-up");

  // Hide sidebar on auth pages
  const showSidebar = !isAuthPage;

  // If it's a protected route (inside main group) and user is not logged in
  const isProtectedRoute =
    pathname?.includes("/(main)") ||
    pathname?.match(/^\/(profile|settings|notifications|auctions)($|\/)/);

  // Show authentication required for protected routes
  if (isLoaded && !userId && isProtectedRoute) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-center mb-6">
          You need to sign in to access this page
        </p>
        <SignInButton mode="modal">
          <button className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 rounded">
            Sign In
          </button>
        </SignInButton>
      </div>
    );
  }

  // Show loading spinner while auth is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-neutral-800 overflow-hidden">
      {showSidebar && (
        <SidebarProvider open={sidebarOpen} setOpen={setSidebarOpen}>
          <AppSidebar />
        </SidebarProvider>
      )}
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          showSidebar && sidebarOpen
            ? "md:ml-[300px]"
            : showSidebar
              ? "md:ml-[60px]"
              : "ml-0"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
