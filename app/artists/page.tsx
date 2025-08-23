// app/artists/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Artist {
  _id: string;
  name: string;
  bio?: string;
  profilePic?: string;
  state?: string;
  artworkCount: number;
  role: string;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>("");

  useEffect(() => {
    async function fetchArtists() {
      try {
        setLoading(true);
        const url = selectedState
          ? `/api/user?role=artist&state=${selectedState}&limit=50`
          : "/api/user?role=artist&limit=50";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch artists");
        }

        const data = await response.json();
        setArtists(data.users || []);
      } catch (err) {
        console.error("Error fetching artists:", err);
        setError("Failed to load artists");
      } finally {
        setLoading(false);
      }
    }

    fetchArtists();
  }, [selectedState]);

  // Get unique states for filter
  const states = Array.from(
    new Set(artists.map((artist) => artist.state).filter(Boolean)),
  ) as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Artists</h1>
          <p className="text-muted-foreground">
            Discover talented artists from across India and around the world.
          </p>
        </div>

        {states.length > 0 && (
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800"
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {artists.map((artist) => (
          <div
            key={artist._id}
            className="bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-700"
          >
            <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 relative">
              {artist.profilePic ? (
                <Image
                  src={artist.profilePic}
                  alt={artist.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                  <span className="text-4xl text-white font-bold">
                    {artist.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-20"></div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg">{artist.name}</h3>
              {artist.state && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {artist.state}
                </p>
              )}
              {artist.bio && (
                <p className="text-sm mt-2 line-clamp-2">{artist.bio}</p>
              )}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-neutral-600 dark:text-neutral-300">
                  <span>{artist.artworkCount} artworks</span>
                </div>
                <Link
                  href={`/artists/${artist._id}`}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {artists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {selectedState
              ? `No artists found in ${selectedState}`
              : "No artists found"}
          </p>
        </div>
      )}
    </div>
  );
}
