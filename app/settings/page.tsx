"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useUser();
  const [bio, setBio] = useState("");

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground">
        Manage your account preferences and application settings.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-1">
          <nav className="space-y-1">
            {[
              "Account",
              "Appearance",
              "Notifications",
              "Privacy",
              "Security",
              "Payments",
              "Help & Support",
            ].map((item, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded-md cursor-pointer text-sm ${
                  i === 0
                    ? "bg-neutral-300 dark:bg-neutral-600 font-medium"
                    : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
        </div>

        <div className="md:col-span-2 bg-neutral-200 dark:bg-neutral-700 p-6 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Account Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={user.fullName || ""}
                disabled
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 opacity-70"
              />
              <p className="text-xs text-neutral-500 mt-1">
                To change your name, go to your Clerk account settings.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={user.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 opacity-70"
              />
              <p className="text-xs text-neutral-500 mt-1">
                To change your email, go to your Clerk account settings.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                placeholder="Tell us about yourself"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={user.username || ""}
                disabled
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 opacity-70"
              />
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() =>
                  window.open(
                    "https://accounts.clerk.dev/user/account",
                    "_blank",
                  )
                }
                className="px-4 py-2 bg-neutral-300 dark:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded"
              >
                Manage Clerk Account
              </button>
              <button className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 rounded">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
