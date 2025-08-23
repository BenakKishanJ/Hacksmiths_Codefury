// app/artworks/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Artwork, Post, User, Artform } from "@/lib/models/types";
import { ArtworkModel, PostModel, UserModel, ArtformModel } from "@/lib/models";

export default function ArtworkDetailPage() {
  const params = useParams();
  const artworkId = params.id as string;

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [artist, setArtist] = useState<User | null>(null);
  const [artform, setArtform] = useState<Artform | null>(null);
  const [timelinePosts, setTimelinePosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtworkDetails() {
      try {
        setLoading(true);
        const artworkModel = await ArtworkModel.getInstance();
        const userModel = await UserModel.getInstance();
        const artformModel = await ArtformModel.getInstance();
        const postModel = await PostModel.getInstance();

        // Fetch artwork
        const artworkData = await artworkModel.getArtworkById(artworkId);
        if (!artworkData) {
          setError("Artwork not found");
          return;
        }
        setArtwork(artworkData);

        // Fetch artist and artform in parallel
        const [artistData, artformData, postsData] = await Promise.all([
          userModel.getUserById(artworkData.artistId),
          artformModel.getArtformById(artworkData.artformId),
          postModel.getPostsByArtwork(artworkData._id!),
        ]);

        setArtist(artistData);
        setArtform(artformData);
        setTimelinePosts(postsData);
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Artwork Image */}
        <div className="aspect-square relative">
          <Image
            src={artwork.finalImageUrl}
            alt={artwork.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        {/* Artwork Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{artwork.title}</h1>
            <p className="text-muted-foreground">{artwork.description}</p>
          </div>

          {/* Artist Info */}
          {artist && (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
                {artist.profilePic ? (
                  <Image
                    src={artist.profilePic}
                    alt={artist.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm">
                    {artist.name?.charAt(0) || "A"}
                  </span>
                )}
              </div>
              <div>
                <Link
                  href={`/artists/${artist._id}`}
                  className="font-medium hover:underline"
                >
                  {artist.name}
                </Link>
                <p className="text-sm text-muted-foreground">{artist.bio}</p>
              </div>
            </div>
          )}

          {/* Artform Info */}
          {artform && (
            <div>
              <h3 className="font-medium mb-2">Artform Details</h3>
              <p className="text-sm">
                <span className="font-medium">Name:</span> {artform.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Region:</span> {artform.state}
              </p>
              <p className="text-sm mt-2">{artform.history}</p>
            </div>
          )}

          {/* Pricing Info */}
          <div>
            <h3 className="font-medium mb-2">Pricing</h3>
            <p className="text-2xl font-bold">
              ₹{artwork.price.toLocaleString()}
            </p>
            {artwork.forSale && (
              <p className="text-sm text-green-600">Available for purchase</p>
            )}
            {artwork.isAuction && (
              <p className="text-sm text-blue-600">Currently in auction</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {artwork.forSale && !artwork.isAuction && (
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md">
                Purchase Now
              </button>
            )}
            {artwork.isAuction && (
              <button className="px-6 py-2 bg-green-600 text-white rounded-md">
                Place Bid
              </button>
            )}
            <button className="px-6 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md">
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Posts */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Creation Timeline</h2>

        {timelinePosts.length === 0 ? (
          <p className="text-muted-foreground">
            No posts yet for this artwork.
          </p>
        ) : (
          <div className="space-y-6">
            {timelinePosts.map((post) => (
              <div
                key={post._id?.toString()}
                className="bg-white dark:bg-neutral-800 rounded-lg p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
                    {artist?.profilePic ? (
                      <Image
                        src={artist.profilePic}
                        alt={artist.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm">
                        {artist?.name?.charAt(0) || "A"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{artist?.name || "Artist"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="mb-4">{post.caption}</p>

                <div className="aspect-square relative max-w-md">
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
