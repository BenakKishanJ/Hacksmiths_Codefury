// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels } from "@/lib/models";
import { ObjectId } from "mongodb";

// GET /api/courses/[id] - Get single course by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const courseId = params.id;

    // Create models instance
    const models = await getModels();

    // Get course
    const course = await models.course.getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get artist information
    const artist = await models.user.getUserById(course.artistId);

    // Get enrolled students count
    const studentCount = course.studentsEnrolled.length;

    // Check if current user is enrolled
    const { userId } = await auth();
    let isEnrolled = false;
    if (userId) {
      const user = await models.user.getUserByClerkId(userId);
      if (user) {
        isEnrolled = course.studentsEnrolled.some(
          (studentId) => studentId.toString() === user._id?.toString(),
        );
      }
    }

    return NextResponse.json({
      course: {
        ...course,
        _id: course._id?.toString(),
        artistId: course.artistId.toString(),
        studentsEnrolled: course.studentsEnrolled.map((id) => id.toString()),
      },
      artist: artist
        ? {
          id: artist._id?.toString(),
          name: artist.name,
          profilePic: artist.profilePic,
          bio: artist.bio,
        }
        : null,
      studentCount,
      isEnrolled,
    });
  } catch (error: unknown) {
    console.error("Error fetching course:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch course", message },
      { status: 500 },
    );
  }
}

// POST /api/courses/[id]/enroll - Enroll in a course
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const courseId = params.id;

    // Create models instance
    const models = await getModels();

    // Get user from Clerk ID
    const user = await models.user.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get course
    const course = await models.course.getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already enrolled
    const isEnrolled = course.studentsEnrolled.some(
      (studentId) => studentId.toString() === user._id?.toString(),
    );

    if (isEnrolled) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 },
      );
    }

    // Enroll student in course
    const success = await models.course.enrollStudent(
      new ObjectId(courseId),
      user._id as ObjectId,
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to enroll in course" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in course",
    });
  } catch (error: unknown) {
    console.error("Error enrolling in course:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to enroll in course", message },
      { status: 500 },
    );
  }
}
