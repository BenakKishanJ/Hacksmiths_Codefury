// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels } from "@/lib/models";
import { ObjectId } from "mongodb";

// GET /api/courses - Get all courses with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");
    const price = searchParams.get("price");
    const artistId = searchParams.get("artistId");
    const sort = searchParams.get("sort");

    // Create models instance
    const models = await getModels();

    let courses;

    // Handle different filtering options
    if (artistId) {
      // Get courses by specific artist
      courses = await models.course.getCoursesByArtist(artistId, limit, skip);
    } else if (price === "0") {
      // Get free courses
      courses = await models.course.getFreeCourses(limit, skip);
    } else if (price === "1") {
      // Get paid courses
      courses = await models.course.getPaidCourses(limit, skip);
    } else {
      // Get all courses
      courses = await models.course.getAllCourses(limit, skip);
    }

    // Sort courses if specified
    if (sort === "popular") {
      // Sort by number of students enrolled (descending)
      courses.sort(
        (a, b) =>
          (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0),
      );
    } else if (sort === "newest") {
      // Sort by creation date (newest first)
      courses.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    // Enrich courses with artist information and student counts
    const enrichedCourses = await Promise.all(
      courses.map(async (course) => {
        const artist = await models.user.getUserById(course.artistId);
        const studentCount = course.studentsEnrolled.length;

        return {
          ...course,
          _id: course._id?.toString(),
          artistId: course.artistId.toString(),
          artist: artist
            ? {
              id: artist._id?.toString(),
              name: artist.name,
              profilePic: artist.profilePic,
            }
            : null,
          studentCount,
          // Remove large arrays to reduce payload size
          studentsEnrolled: undefined,
          content: undefined,
        };
      }),
    );

    return NextResponse.json({
      courses: enrichedCourses,
      hasMore: courses.length === limit,
    });
  } catch (error: unknown) {
    console.error("Error fetching courses:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch courses", message },
      { status: 500 },
    );
  }
}

// POST /api/courses - Create a new course (artist only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { title, description, price, content } = body;

    // Validate required fields
    if (!title || !description || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, price" },
        { status: 400 },
      );
    }

    // Create models instance
    const models = await getModels();

    // Get user from Clerk ID
    const user = await models.user.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify user is an artist
    if (user.role !== "artist") {
      return NextResponse.json(
        { error: "Only artists can create courses" },
        { status: 403 },
      );
    }

    // Create the course
    const newCourse = await models.course.createCourse({
      artistId: user._id as ObjectId,
      title,
      description,
      price: parseInt(price),
      content: content || [],
    });

    return NextResponse.json({
      success: true,
      course: {
        ...newCourse,
        _id: newCourse._id?.toString(),
        artistId: newCourse.artistId.toString(),
        artist: {
          id: user._id?.toString(),
          name: user.name,
          profilePic: user.profilePic,
        },
        studentCount: 0,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating course:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create course", message },
      { status: 500 },
    );
  }
}
