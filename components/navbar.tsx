"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export default function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="font-bold text-xl">
          🎨 Art & Culture
        </Link>
        <NavigationMenu>
          <NavigationMenuList className="flex gap-4">
            <NavigationMenuItem>
              <Link href="/artists">Artists</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/artworks/1">Artworks</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/auctions">Auctions</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/courses">Courses</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/colleges">Colleges</Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/notifications">Notifications</Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button asChild>
          <Link href="/sign-in">Login</Link>
        </Button>
      </div>
    </nav>
  );
}
