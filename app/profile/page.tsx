"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { User } from "@/lib/models/types";

interface ProfileData {
  user: User & {
    artworkCount: number;
    courseCount: number;
  };
}

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    state: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setFormData({
          bio: data.user.bio || "",
          state: data.user.state || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData((prev) => (prev ? { ...prev, user: data.user } : null));
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
      </div>
    );
  }

  if (!clerkUser || !profileData) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profile</h1>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 rounded-md text-sm"
        >
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-1">
          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg p-6 flex flex-col items-center">
            {clerkUser.imageUrl ? (
              <Image
                src={clerkUser.imageUrl}
                alt={clerkUser.fullName || "User"}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full mb-4 object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-neutral-300 dark:bg-neutral-600 mb-4 flex items-center justify-center">
                <span className="text-2xl">
                  {clerkUser.firstName?.charAt(0) ||
                    clerkUser.username?.charAt(0) ||
                    "U"}
                </span>
              </div>
            )}
            <h2 className="text-lg font-medium">
              {clerkUser.fullName || clerkUser.username}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
              {profileData.user.role}
            </p>

            <div className="mt-4 flex gap-4">
              <div className="text-center">
                <p className="font-medium">{profileData.user.artworkCount}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Artworks
                </p>
              </div>
              {profileData.user.role === "artist" && (
                <div className="text-center">
                  <p className="font-medium">{profileData.user.courseCount}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Courses
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg p-6 mt-4">
            <h3 className="font-medium mb-3">About</h3>
            {editing ? (
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
                rows={4}
              />
            ) : (
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {profileData.user.bio || "No bio yet."}
              </p>
            )}

            <h3 className="font-medium mt-4 mb-2">Location</h3>
            {editing ? (
              <input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                placeholder="Your location..."
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
              />
            ) : (
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {profileData.user.state || "No location set"}
              </p>
            )}

            {editing && (
              <button
                onClick={handleSave}
                className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {/* Recent Activities */}
          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Recent Activities</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center py-8 text-neutral-500">
                <p>No recent activities yet.</p>
              </div>
            </div>
          </div>

          {/* User-specific content based on role */}
          {profileData.user.role === "artist" && (
            <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg p-6 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">My Artworks</h3>
                <button className="text-sm text-neutral-600 dark:text-neutral-300">
                  View All
                </button>
              </div>
              {profileData.user.artworkCount > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array(Math.min(profileData.user.artworkCount, 6))
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-neutral-300 dark:bg-neutral-600 rounded-md"
                      ></div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <p>No artworks yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
