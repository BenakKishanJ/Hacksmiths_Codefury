// app/home/layout.tsx
"use client";

import React from "react";
import { AppSidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-neutral-800 overflow-hidden">
      <SidebarProvider open={sidebarOpen} setOpen={setSidebarOpen}>
        <AppSidebar />
      </SidebarProvider>
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          sidebarOpen ? "md:ml-[300px]" : "md:ml-[60px]",
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
