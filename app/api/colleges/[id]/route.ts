// app/api/colleges/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels } from "@/lib/models";
import { ObjectId } from "mongodb";

// GET /api/colleges/[id] - Get single college by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const collegeId = params.id;

    // Create models instance
    const models = await getModels();

    // Get college
    const college = await models.college.getCollegeById(collegeId);
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    // Calculate average rating
    const averageRating = await models.college.getAverageRating(college._id!);

    // Get user information for reviews
    const reviewsWithUsers = await Promise.all(
      college.reviews.map(async (review) => {
        const user = await models.user.getUserById(review.userId);
        return {
          ...review,
          userId: review.userId.toString(),
          user: user
            ? {
              id: user._id?.toString(),
              name: user.name,
              profilePic: user.profilePic,
            }
            : null,
        };
      }),
    );

    return NextResponse.json({
      college: {
        ...college,
        _id: college._id?.toString(),
        averageRating,
        reviewCount: college.reviews.length,
      },
      reviews: reviewsWithUsers,
    });
  } catch (error: unknown) {
    console.error("Error fetching college:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch college", message },
      { status: 500 },
    );
  }
}

// POST /api/colleges/[id]/reviews - Add a review to a college
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
    const collegeId = params.id;

    // Parse request body
    const body = await request.json();
    const { rating, comment } = body;

    // Validate required fields
    if (!rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields: rating, comment" },
        { status: 400 },
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
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

    // Add review to college
    const success = await models.college.addReview(collegeId, {
      userId: user._id as ObjectId,
      rating: parseInt(rating),
      comment,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to add review" },
        { status: 500 },
      );
    }

    // Get updated college with new review
    const updatedCollege = await models.college.getCollegeById(collegeId);
    const averageRating = await models.college.getAverageRating(collegeId);

    return NextResponse.json({
      success: true,
      averageRating,
      reviewCount: updatedCollege?.reviews.length || 0,
    });
  } catch (error: unknown) {
    console.error("Error adding review:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to add review", message },
      { status: 500 },
    );
  }
}
