// app/auctions/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Auction {
  _id: string;
  currentBid: number;
  startPrice: number;
  startTime: string;
  endTime: string;
  status: "ongoing" | "completed";
  artwork?: {
    id: string;
    title: string;
    finalImageUrl: string;
    description: string;
  };
  artist?: {
    id: string;
    name: string;
    profilePic?: string;
  };
  bidder?: {
    id: string;
    name: string;
  };
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ongoing");

  useEffect(() => {
    async function fetchAuctions() {
      try {
        setLoading(true);
        const url = `/api/auctions?status=${filter}&limit=50`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch auctions");
        }

        const data = await response.json();
        setAuctions(data.auctions || []);
      } catch (err) {
        console.error("Error fetching auctions:", err);
        setError("Failed to load auctions");
      } finally {
        setLoading(false);
      }
    }

    fetchAuctions();
  }, [filter]);

  const calculateTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const difference = end.getTime() - now.getTime();

    if (difference <= 0) {
      return "Ended";
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  const getAuctionStatus = (auction: Auction) => {
    const now = new Date();
    const endTime = new Date(auction.endTime);

    if (auction.status === "completed" || now > endTime) {
      return "Ended";
    }

    return "Live Now";
  };

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
          <h1 className="text-2xl font-bold">Art Auctions</h1>
          <p className="text-muted-foreground">
            Participate in exclusive art auctions and acquire unique pieces.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("ongoing")}
            className={`px-4 py-2 rounded-md ${filter === "ongoing"
                ? "bg-blue-600 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
          >
            Live Auctions
          </button>
          <button
            onClick={() => setFilter("ended")}
            className={`px-4 py-2 rounded-md ${filter === "ended"
                ? "bg-blue-600 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
          >
            Ended Auctions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {auctions.map((auction) => (
          <div
            key={auction._id}
            className="bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
          >
            <Link href={`/auctions/${auction._id}`}>
              <div className="aspect-[4/3] relative overflow-hidden">
                {auction.artwork?.finalImageUrl ? (
                  <Image
                    src={auction.artwork.finalImageUrl}
                    alt={auction.artwork.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <span className="text-4xl text-white font-bold">
                      {auction.artwork?.title?.charAt(0) || "A"}
                    </span>
                  </div>
                )}

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getAuctionStatus(auction) === "Live Now"
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 text-white"
                      }`}
                  >
                    {getAuctionStatus(auction)}
                  </span>
                </div>

                {getAuctionStatus(auction) === "Live Now" && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {calculateTimeLeft(auction.endTime)}
                    </span>
                  </div>
                )}
              </div>
            </Link>

            <div className="p-6">
              <Link href={`/auctions/${auction._id}`}>
                <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors mb-2">
                  {auction.artwork?.title || "Untitled Artwork"}
                </h3>
              </Link>

              {auction.artist && (
                <Link
                  href={`/artists/${auction.artist.id}`}
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition-colors block mb-3"
                >
                  By {auction.artist.name}
                </Link>
              )}

              {auction.artwork?.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                  {auction.artwork.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Current Bid
                  </span>
                  <span className="font-semibold text-lg">
                    ₹{auction.currentBid.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Starting Price
                  </span>
                  <span className="text-sm">
                    ₹{auction.startPrice.toLocaleString()}
                  </span>
                </div>

                {auction.bidder && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      Current Bidder
                    </span>
                    <span className="text-sm">{auction.bidder.name}</span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                {getAuctionStatus(auction) === "Live Now" ? (
                  <Link
                    href={`/auctions/${auction._id}`}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-center block"
                  >
                    Place Bid
                  </Link>
                ) : (
                  <Link
                    href={`/auctions/${auction._id}`}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block"
                  >
                    View Results
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {auctions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {filter === "ongoing"
              ? "No live auctions at the moment. Check back soon!"
              : "No ended auctions found."}
          </p>
          {filter === "ended" && (
            <button
              onClick={() => setFilter("ongoing")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Live Auctions
            </button>
          )}
        </div>
      )}
    </div>
  );
}
