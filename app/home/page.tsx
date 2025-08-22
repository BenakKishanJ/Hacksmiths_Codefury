import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8">
      <h1 className="text-3xl font-bold mb-4">
        🎨 Welcome to the Art & Culture Platform
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl text-center mb-8">
        Discover and promote Indian artforms through artworks, courses, and
        collaborations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mt-8">
        <div className="bg-neutral-200 dark:bg-neutral-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Explore Artworks</h2>
          <p className="mb-4">
            Discover beautiful artworks from talented artists across India.
          </p>
          <Link
            href="/artworks"
            className="inline-block px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 rounded-md text-sm"
          >
            Browse Artworks
          </Link>
        </div>

        <div className="bg-neutral-200 dark:bg-neutral-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Meet Artists</h2>
          <p className="mb-4">
            Connect with talented artists and creators from various disciplines.
          </p>
          <Link
            href="/artists"
            className="inline-block px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 rounded-md text-sm"
          >
            Find Artists
          </Link>
        </div>

        <div className="bg-neutral-200 dark:bg-neutral-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Learn with Courses</h2>
          <p className="mb-4">
            Enhance your skills with courses in various art forms and
            techniques.
          </p>
          <Link
            href="/courses"
            className="inline-block px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 rounded-md text-sm"
          >
            View Courses
          </Link>
        </div>

        <div className="bg-neutral-200 dark:bg-neutral-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Attend Auctions</h2>
          <p className="mb-4">
            Participate in exclusive art auctions and acquire unique pieces.
          </p>
          <Link
            href="/auctions"
            className="inline-block px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 rounded-md text-sm"
          >
            View Auctions
          </Link>
        </div>
      </div>

      <div className="mt-12">
        <p className="text-center mb-4">
          Join our community to access exclusive features
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/sign-in"
            className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 rounded-md text-sm"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 border border-neutral-800 dark:border-neutral-200 text-neutral-800 dark:text-neutral-200 rounded-md text-sm"
          >
            Sign Up
          </Link>
        </div>
      </div>

      <div className="mt-12 hidden">
        <div className="mt-12">
          <p className="text-center mb-4">
            Continue exploring your personalized experience
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/profile"
              className="px-4 py-2 bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 rounded-md text-sm"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
