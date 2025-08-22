// components/layout/app-layout.tsx
"use client";
import React, { useState } from "react";
import { AppSidebar } from "../Sidebar";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Check if the current path is in the auth route group
  const isAuthPage =
    pathname?.includes("sign-in") || pathname?.includes("sign-up");

  // Hide sidebar on auth pages
  const showSidebar = !isAuthPage;

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
              : "ml-0",
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
