// app/artworks/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Artwork {
  _id: string;
  title: string;
  description: string;
  finalImageUrl: string;
  price: number;
  forSale: boolean;
  isAuction: boolean;
  artist?: {
    id: string;
    name: string;
    profilePic?: string;
  };
  artform?: {
    id: string;
    name: string;
  };
}

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchArtworks() {
      try {
        setLoading(true);
        let url = "/api/artwork?limit=50";

        if (filter === "forSale") {
          url = "/api/artwork?forSale=true&limit=50";
        } else if (filter === "auction") {
          url = "/api/artwork?isAuction=true&limit=50";
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch artworks");
        }

        const data = await response.json();
        setArtworks(data.artworks || []);
      } catch (err) {
        console.error("Error fetching artworks:", err);
        setError("Failed to load artworks");
      } finally {
        setLoading(false);
      }
    }

    fetchArtworks();
  }, [filter]);

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
          <h1 className="text-2xl font-bold">Artworks</h1>
          <p className="text-muted-foreground">
            Discover and explore beautiful artworks from talented artists.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("forSale")}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === "forSale"
                ? "bg-blue-600 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            For Sale
          </button>
          <button
            onClick={() => setFilter("auction")}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === "auction"
                ? "bg-blue-600 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            Auction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <div
            key={artwork._id}
            className="bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-700 group"
          >
            <Link href={`/artworks/${artwork._id}`}>
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={artwork.finalImageUrl}
                  alt={artwork.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {artwork.forSale && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    {artwork.isAuction ? "Auction" : "For Sale"}
                  </div>
                )}
              </div>
            </Link>

            <div className="p-4">
              <Link href={`/artworks/${artwork._id}`}>
                <h3 className="font-medium text-lg hover:text-blue-600 transition-colors">
                  {artwork.title}
                </h3>
              </Link>

              {artwork.artist && (
                <Link
                  href={`/artists/${artwork.artist.id}`}
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition-colors block mt-1"
                >
                  By {artwork.artist.name}
                </Link>
              )}

              {artwork.artform && (
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                  {artwork.artform.name}
                </p>
              )}

              <p className="text-sm mt-2 line-clamp-2">{artwork.description}</p>

              <div className="flex justify-between items-center mt-4">
                <span className="font-semibold text-lg">
                  ₹{artwork.price.toLocaleString()}
                </span>
                <Link
                  href={`/artworks/${artwork._id}`}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {artworks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No artworks found
            {filter !== "all" ? ` matching "${filter}" filter` : ""}
          </p>
        </div>
      )}
    </div>
  );
}
