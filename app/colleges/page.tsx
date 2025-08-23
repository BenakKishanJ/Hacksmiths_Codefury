// app/colleges/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
// import Image from "next/image";

interface College {
  _id: string;
  name: string;
  location: string;
  fees: number;
  duration: string;
  averageRating?: number;
  reviewCount?: number;
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [maxFees, setMaxFees] = useState<number>(500000);

  useEffect(() => {
    async function fetchColleges() {
      try {
        setLoading(true);
        let url = '/api/colleges?limit=50';

        if (filter === "byRating") {
          url = '/api/colleges?sort=rating&limit=50';
        } else if (filter === "byFees") {
          url = `/api/colleges?maxFees=${maxFees}&limit=50`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch colleges');
        }

        const data = await response.json();
        setColleges(data.colleges || []);
      } catch (err) {
        console.error("Error fetching colleges:", err);
        setError("Failed to load colleges");
      } finally {
        setLoading(false);
      }
    }

    fetchColleges();
  }, [filter, maxFees]);

  const renderRatingStars = (rating: number = 0) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= Math.round(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
              }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
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
          <h1 className="text-2xl font-bold">Art Colleges</h1>
          <p className="text-muted-foreground">
            Explore top art and design colleges across India.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800"
          >
            <option value="all">All Colleges</option>
            <option value="byRating">Top Rated</option>
            <option value="byFees">By Fees</option>
          </select>

          {filter === "byFees" && (
            <select
              value={maxFees}
              onChange={(e) => setMaxFees(Number(e.target.value))}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800"
            >
              <option value={100000}>Up to ₹1L</option>
              <option value={200000}>Up to ₹2L</option>
              <option value={500000}>Up to ₹5L</option>
              <option value={1000000}>Up to ₹10L</option>
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colleges.map((college) => (
          <div
            key={college._id}
            className="bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl text-white font-bold">
                  {college.name.charAt(0)}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">{college.name}</h3>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {college.location}
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ₹{college.fees.toLocaleString()} / year
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {college.duration}
                </div>

                {college.averageRating && (
                  <div className="pt-2">
                    {renderRatingStars(college.averageRating)}
                    {college.reviewCount && (
                      <p className="text-xs text-gray-500 mt-1">
                        {college.reviewCount} reviews
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  Fine Arts
                </span>

                <Link
                  href={`/colleges/${college._id}`}
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {colleges.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No colleges found{filter !== "all" ? " matching your criteria" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
