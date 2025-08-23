"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

interface SettingsData {
  bio: string;
  state: string;
  profilePic: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  privacy: {
    showEmail: boolean;
    showArtworks: boolean;
  };
}

export default function SettingsPage() {
  const { user } = useUser();
  const [settings, setSettings] = useState<SettingsData>({
    bio: "",
    state: "",
    profilePic: "",
    emailNotifications: true,
    pushNotifications: true,
    privacy: {
      showEmail: false,
      showArtworks: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePrivacyChange = (field: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
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
            {["Profile", "Notifications", "Privacy", "Account"].map(
              (item, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-md cursor-pointer text-sm ${i === 0
                      ? "bg-neutral-300 dark:bg-neutral-600 font-medium"
                      : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                >
                  {item}
                </div>
              ),
            )}
          </nav>
        </div>

        <div className="md:col-span-2 bg-neutral-200 dark:bg-neutral-700 p-6 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Profile Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={user.fullName || ""}
                disabled
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 opacity-70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={user.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 opacity-70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                value={settings.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={settings.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="Your location..."
                className="w-full p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600"
              />
            </div>

            <h3 className="text-lg font-medium mt-6 mb-4">
              Notification Settings
            </h3>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Email Notifications</label>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  handleInputChange("emailNotifications", e.target.checked)
                }
                className="h-4 w-4 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Push Notifications</label>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) =>
                  handleInputChange("pushNotifications", e.target.checked)
                }
                className="h-4 w-4 rounded"
              />
            </div>

            <h3 className="text-lg font-medium mt-6 mb-4">Privacy Settings</h3>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Email Publicly</label>
              <input
                type="checkbox"
                checked={settings.privacy.showEmail}
                onChange={(e) =>
                  handlePrivacyChange("showEmail", e.target.checked)
                }
                className="h-4 w-4 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Show Artworks Publicly
              </label>
              <input
                type="checkbox"
                checked={settings.privacy.showArtworks}
                onChange={(e) =>
                  handlePrivacyChange("showArtworks", e.target.checked)
                }
                className="h-4 w-4 rounded"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-4">
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
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
