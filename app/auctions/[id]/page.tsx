// app/auctions/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Bid {
  amount: number;
  time: string;
  bidder?: {
    id: string;
    name: string;
    profilePic?: string;
  };
}

interface AuctionDetail {
  _id: string;
  currentBid?: number;
  startPrice?: number;
  startTime?: string;
  endTime?: string;
  status?: "ongoing" | "completed";
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
    bio?: string;
  };
  bids?: Bid[];
  currentBidder?: {
    id: string;
    name: string;
  };
}

export default function AuctionDetailPage() {
  const params = useParams();
  const auctionId = params.id as string;

  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [placingBid, setPlacingBid] = useState(false);

  useEffect(() => {
    async function fetchAuctionDetails() {
      try {
        setLoading(true);
        const response = await fetch(`/api/auctions/${auctionId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch auction details");
        }

        const data = await response.json();
        setAuction(data);
      } catch (err) {
        console.error("Error fetching auction details:", err);
        setError("Failed to load auction details");
      } finally {
        setLoading(false);
      }
    }

    if (auctionId) {
      fetchAuctionDetails();
    }
  }, [auctionId]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || placingBid || !auction?.currentBid) return;

    try {
      setPlacingBid(true);
      const response = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parseInt(bidAmount) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place bid");
      }

      // Refresh auction data
      const refreshResponse = await fetch(`/api/auctions/${auctionId}`);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAuction(data);
      }

      setBidAmount("");
      alert("Bid placed successfully!");
    } catch (err) {
      console.error("Error placing bid:", err);
      alert(err instanceof Error ? err.message : "Failed to place bid");
    } finally {
      setPlacingBid(false);
    }
  };

  const calculateTimeLeft = () => {
    if (!auction?.endTime) return "Loading...";

    const end = new Date(auction.endTime);
    const now = new Date();
    const difference = end.getTime() - now.getTime();

    if (difference <= 0) {
      return "Auction ended";
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  const isAuctionActive = () => {
    if (!auction?.status || !auction.endTime) return false;
    const now = new Date();
    const endTime = new Date(auction.endTime);
    return auction.status === "ongoing" && now < endTime;
  };

  // Safe value getters with fallbacks
  const getCurrentBid = () => auction?.currentBid || auction?.startPrice || 0;
  const getStartPrice = () => auction?.startPrice || 0;
  const getBids = () => auction?.bids || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error || "Auction not found"}</p>
        <Link href="/auctions" className="ml-4 text-blue-600 hover:underline">
          Back to Auctions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Artwork Image */}
        <div className="aspect-square relative rounded-lg overflow-hidden">
          {auction.artwork?.finalImageUrl ? (
            <Image
              src={auction.artwork.finalImageUrl}
              alt={auction.artwork.title || "Artwork"}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <span className="text-4xl text-white font-bold">
                {auction.artwork?.title?.charAt(0) || "A"}
              </span>
            </div>
          )}
        </div>

        {/* Auction Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {auction.artwork?.title || "Untitled Artwork"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {auction.artwork?.description || "No description available"}
            </p>
          </div>

          {/* Artist Info */}
          {auction.artist && (
            <div className="flex items-center space-x-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
                {auction.artist.profilePic ? (
                  <Image
                    src={auction.artist.profilePic}
                    alt={auction.artist.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    {auction.artist.name?.charAt(0) || "A"}
                  </span>
                )}
              </div>
              <div>
                <Link
                  href={`/artists/${auction.artist.id}`}
                  className="font-medium hover:underline"
                >
                  {auction.artist.name}
                </Link>
                {auction.artist.bio && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {auction.artist.bio}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Auction Status */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <h3 className="font-semibold mb-4">Auction Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Bid</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{getCurrentBid().toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Starting Price</p>
                <p className="text-lg">₹{getStartPrice().toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Left</p>
                <p className="text-lg">{calculateTimeLeft()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${isAuctionActive()
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 text-white"
                      }`}
                  >
                    {isAuctionActive() ? "Live" : "Ended"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Bid Form */}
          {isAuctionActive() && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h3 className="font-semibold mb-4">Place Your Bid</h3>
              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bid Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Minimum ₹${(getCurrentBid() + 100).toLocaleString()}`}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900"
                    min={getCurrentBid() + 100}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={placingBid || !bidAmount}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {placingBid ? "Placing Bid..." : "Place Bid"}
                </button>
              </form>
            </div>
          )}

          {/* Current Bidder */}
          {auction.currentBidder && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h3 className="font-semibold mb-2">Current Highest Bidder</h3>
              <p className="text-sm">{auction.currentBidder.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bids History */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Bid History</h2>
        {getBids().length === 0 ? (
          <p className="text-muted-foreground">No bids yet.</p>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Bidder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                {getBids().map((bid, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center mr-3">
                          {bid.bidder?.profilePic ? (
                            <Image
                              src={bid.bidder.profilePic}
                              alt={bid.bidder.name}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs">
                              {bid.bidder?.name?.charAt(0) || "B"}
                            </span>
                          )}
                        </div>
                        <span className="text-sm">
                          {bid.bidder?.name || "Anonymous"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold">
                        ₹{bid.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(bid.time).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
