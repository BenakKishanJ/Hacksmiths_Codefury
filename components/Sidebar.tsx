"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  Home,
  User,
  Palette,
  BookOpen,
  GraduationCap,
  Gavel,
  Settings,
  // LogOut,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
// import Image from "next/image";
import { useUser, useClerk, UserButton } from "@clerk/nextjs";

export function AppSidebar() {
  const routes = [
    {
      label: "Home",
      href: "/",
      icon: (
        <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Artists",
      href: "/artists",
      icon: (
        <User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Artworks",
      href: "/artworks",
      icon: (
        <Palette className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Courses",
      href: "/courses",
      icon: (
        <BookOpen className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Colleges",
      href: "/colleges",
      icon: (
        <GraduationCap className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Auctions",
      href: "/auctions",
      icon: (
        <Gavel className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const [open, setOpen] = useState(false);
  const { user } = useUser();

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {routes.map((route, idx) => (
              <SidebarLink key={idx} link={route} />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {user ? (
            <div className="flex items-center gap-2 px-2 py-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-7 w-7",
                    userButtonPopoverCard: "shadow-lg",
                  },
                }}
                showName={open}
                userProfileMode="navigation"
                userProfileUrl="/profile"
              />
              {open && (
                <motion.span
                  animate={{
                    opacity: open ? 1 : 0,
                  }}
                  className="text-neutral-700 dark:text-neutral-200 text-sm whitespace-pre"
                >
                  {user.fullName || "User Profile"}
                </motion.span>
              )}
            </div>
          ) : (
            <SidebarLink
              link={{
                label: "Sign In",
                href: "/sign-in",
                icon: (
                  <div className="h-7 w-7 bg-neutral-300 dark:bg-neutral-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-neutral-700 dark:text-neutral-200" />
                  </div>
                ),
              }}
            />
          )}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Art Platform
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
