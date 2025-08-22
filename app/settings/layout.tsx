// app/profile/layout.tsx
"use client";

import React, { useEffect } from "react";
import { AppSidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  // Show loading spinner while auth is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect happens in useEffect)
  if (!userId) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-neutral-800 overflow-hidden">
      <SidebarProvider open={sidebarOpen} setOpen={setSidebarOpen}>
        <AppSidebar />
      </SidebarProvider>
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          sidebarOpen ? "md:ml-[300px]" : "md:ml-[60px]"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
