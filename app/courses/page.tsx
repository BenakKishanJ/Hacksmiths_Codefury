// app/courses/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  artist?: {
    id: string;
    name: string;
    profilePic?: string;
  };
  studentCount?: number;
  duration?: string;
  level?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        let url = "/api/courses?limit=50";

        if (filter === "free") {
          url = "/api/courses?price=0&limit=50";
        } else if (filter === "paid") {
          url = "/api/courses?price=1&limit=50";
        } else if (filter === "popular") {
          url = "/api/courses?sort=popular&limit=50";
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data.courses || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [filter]);

  const formatDuration = (weeks: number) => {
    if (weeks >= 12) {
      const months = Math.floor(weeks / 4);
      return `${months} month${months > 1 ? "s" : ""}`;
    }
    return `${weeks} week${weeks > 1 ? "s" : ""}`;
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
          <h1 className="text-2xl font-bold">Art Courses</h1>
          <p className="text-muted-foreground">
            Enhance your artistic skills with our curated courses.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-md text-sm ${filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilter("free")}
            className={`px-3 py-1 rounded-md text-sm ${filter === "free"
                ? "bg-blue-600 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
          >
            Free
          </button>
          <button
            onClick={() => setFilter("paid")}
            className={`px-3 py-1 rounded-md text-sm ${filter === "paid"
                ? "bg-blue-600 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter("popular")}
            className={`px-3 py-1 rounded-md text-sm ${filter === "popular"
                ? "bg-blue-600 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
          >
            Popular
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow group"
          >
            <div className="aspect-video bg-gradient-to-br from-orange-400 to-red-500 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl text-white font-bold">
                  {course.title.charAt(0)}
                </span>
              </div>
              {course.price === 0 && (
                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  FREE
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Instructor Info */}
              {course.artist && (
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
                    {course.artist.profilePic ? (
                      <Image
                        src={course.artist.profilePic}
                        alt={course.artist.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs">
                        {course.artist.name?.charAt(0) || "A"}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    By {course.artist.name}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    {course.duration
                      ? formatDuration(parseInt(course.duration))
                      : "6 weeks"}
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                    {course.level || "Beginner"}
                  </span>
                </div>

                {course.studentCount && (
                  <div className="text-xs text-gray-500">
                    {course.studentCount} students
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">
                  {course.price === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>₹{course.price.toLocaleString()}</span>
                  )}
                </div>

                <Link
                  href={`/courses/${course._id}`}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No courses found{filter !== "all" ? " matching your criteria" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
