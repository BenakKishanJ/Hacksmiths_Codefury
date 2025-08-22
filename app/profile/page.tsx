"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export default function ProfilePage() {
  const { user } = useUser();

  if (!user) {
    return <div>Loading...</div>;
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-1">
          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg p-6 flex flex-col items-center">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.fullName || "User"}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full mb-4 object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-neutral-300 dark:bg-neutral-600 mb-4 flex items-center justify-center">
                <span className="text-2xl">
                  {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
                </span>
              </div>
            )}
            <h2 className="text-lg font-medium">
              {user.fullName || user.username}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Artist / Collector
            </p>

            <div className="mt-4 flex gap-2">
              <div className="text-center">
                <p className="font-medium">42</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Artworks
                </p>
              </div>
              <div className="text-center">
                <p className="font-medium">1.2k</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Followers
                </p>
              </div>
              <div className="text-center">
                <p className="font-medium">567</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Following
                </p>
              </div>
            </div>

            <button className="mt-6 w-full px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 rounded-md text-sm">
              Edit Profile
            </button>
          </div>

          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg p-6 mt-4">
            <h3 className="font-medium mb-3">About</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Contemporary artist exploring the intersection of traditional
              Indian art forms and modern digital techniques. Based in Mumbai.
            </p>

            <h3 className="font-medium mt-4 mb-2">Contact</h3>
            <div className="text-sm">
              <p className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 mb-1">
                <span>✉️</span>{" "}
                {user.primaryEmailAddress?.emailAddress ||
                  "Email not available"}
              </p>
              <p className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                <span>🌐</span>{" "}
                {user.username
                  ? `${user.username}.artplatform.com`
                  : "Website not available"}
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">My Artworks</h3>
              <button className="text-sm text-neutral-600 dark:text-neutral-300">
                View All
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-neutral-300 dark:bg-neutral-600 rounded-md"
                  ></div>
                ))}
            </div>
          </div>

          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg p-6 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Recent Activities</h3>
              <button className="text-sm text-neutral-600 dark:text-neutral-300">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 pb-3 border-b border-neutral-300 dark:border-neutral-600 last:border-0"
                  >
                    <div className="h-8 w-8 rounded-full bg-neutral-300 dark:bg-neutral-600 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm">
                        {i % 2 === 0
                          ? "You uploaded a new artwork"
                          : "You commented on Artist's artwork"}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {i + 1} {i === 0 ? "hour" : "days"} ago
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg p-6 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Collections</h3>
              <button className="text-sm text-neutral-600 dark:text-neutral-300">
                Create New
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="border border-neutral-300 dark:border-neutral-600 rounded-md p-3"
                  >
                    <h4 className="font-medium text-sm">
                      {i === 0
                        ? "Modern Art Collection"
                        : "Traditional Indian Art"}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {i === 0 ? "15" : "8"} items
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
