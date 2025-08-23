// app/artworks/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Artist {
  id: string;
  name: string;
  bio?: string;
  profilePic?: string;
}

interface Artform {
  id: string;
  name: string;
  state: string;
  history: string;
}

interface TimelinePost {
  _id: string;
  mediaUrl: string;
  caption: string;
  likes: string[];
  comments: unknown[];
  createdAt: string;
}

interface ArtworkDetail {
  _id: string;
  title: string;
  description: string;
  finalImageUrl: string;
  price: number;
  forSale: boolean;
  isAuction: boolean;
  artist?: Artist;
  artform?: Artform;
  timeline: TimelinePost[];
  auction?: unknown;
}

export default function ArtworkDetailPage() {
  const params = useParams();
  const artworkId = params.id as string;

  const [artwork, setArtwork] = useState<ArtworkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtworkDetails() {
      try {
        setLoading(true);

        // Use the API route instead of direct MongoDB calls
        const response = await fetch(`/api/artwork/${artworkId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Artwork not found");
          } else {
            throw new Error("Failed to fetch artwork details");
          }
          return;
        }

        const data = await response.json();
        setArtwork(data);
      } catch (err) {
        console.error("Error fetching artwork details:", err);
        setError("Failed to load artwork details");
      } finally {
        setLoading(false);
      }
    }

    if (artworkId) {
      fetchArtworkDetails();
    }
  }, [artworkId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error || "Artwork not found"}</p>
        <Link href="/artworks" className="ml-4 text-blue-600 hover:underline">
          Back to Artworks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Artwork Image */}
        {artwork && artwork.finalImageUrl && (
          <div className="aspect-square relative">
            <Image
              src={artwork.finalImageUrl}
              alt={
                artwork.title ||
                `Artwork by ${artwork.artist?.name || "Unknown Artist"}`
              }
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
        )}
        {/* Artwork Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{artwork.title}</h1>
            <p className="text-muted-foreground mt-2">{artwork.description}</p>
          </div>

          {/* Artist Info */}
          {artwork.artist && (
            <div className="flex items-center space-x-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
                {artwork.artist.profilePic ? (
                  <Image
                    src={artwork.artist.profilePic}
                    alt={artwork.artist.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    {artwork.artist.name?.charAt(0) || "A"}
                  </span>
                )}
              </div>
              <div>
                <Link
                  href={`/artists/${artwork.artist.id}`}
                  className="font-medium hover:underline"
                >
                  {artwork.artist.name}
                </Link>
                {artwork.artist.bio && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {artwork.artist.bio}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Artform Info */}
          {artwork.artform && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h3 className="font-medium mb-2">Artform Details</h3>
              <p className="text-sm">
                <span className="font-medium">Name:</span>{" "}
                {artwork.artform.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Region:</span>{" "}
                {artwork.artform.state}
              </p>
              <p className="text-sm mt-2 text-muted-foreground">
                {artwork.artform.history}
              </p>
            </div>
          )}

          {/* Pricing Info */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <h3 className="font-medium mb-2">Pricing</h3>
            <p className="text-2xl font-bold text-green-600">
              ₹{(artwork.price ?? 0).toLocaleString()}
            </p>
            {artwork.forSale && (
              <p className="text-sm text-green-600 mt-1">
                Available for purchase
              </p>
            )}
            {artwork.isAuction && (
              <p className="text-sm text-blue-600 mt-1">Currently in auction</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            {artwork.forSale && !artwork.isAuction && (
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Purchase Now
              </button>
            )}
            {artwork.isAuction && (
              <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Place Bid
              </button>
            )}
            <button className="px-6 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Posts */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Creation Timeline</h2>

        {artwork.timeline.length === 0 ? (
          <p className="text-muted-foreground">
            No posts yet for this artwork.
          </p>
        ) : (
          <div className="space-y-6">
            {artwork.timeline.map((post) => (
              <div
                key={post._id}
                className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
                    {artwork.artist?.profilePic ? (
                      <Image
                        src={artwork.artist.profilePic}
                        alt={artwork.artist.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {artwork.artist?.name?.charAt(0) || "A"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {artwork.artist?.name || "Artist"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="mb-4">{post.caption}</p>

                <div className="aspect-square relative max-w-md mx-auto">
                  <Image
                    src={post.mediaUrl}
                    alt={post.caption}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{post.likes.length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
