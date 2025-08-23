// app/api/colleges/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/models";

// GET /api/colleges - Get all colleges with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");
    const sort = searchParams.get("sort");
    const maxFees = searchParams.get("maxFees");
    const location = searchParams.get("location");

    // Create models instance
    const models = await getModels();

    let colleges;

    // Handle different filtering options
    if (sort === "rating") {
      // Get colleges sorted by average rating
      colleges = await models.college.getCollegesByRating(limit, skip);
    } else if (maxFees) {
      // Get colleges by maximum fees
      colleges = await models.college.getCollegesByMaxFees(
        parseInt(maxFees),
        limit,
        skip,
      );
    } else if (location) {
      // Get colleges by location
      colleges = await models.college.getCollegesByLocation(
        location,
        limit,
        skip,
      );
    } else {
      // Get all colleges
      colleges = await models.college.getAllColleges(limit, skip);
    }

    // Calculate average ratings and review counts
    const collegesWithRatings = await Promise.all(
      colleges.map(async (college) => {
        const averageRating = await models.college.getAverageRating(
          college._id!,
        );
        const reviewCount = college.reviews.length;

        return {
          ...college,
          _id: college._id?.toString(),
          averageRating,
          reviewCount,
          // Remove reviews array to reduce payload size
          reviews: undefined,
        };
      }),
    );

    return NextResponse.json({
      colleges: collegesWithRatings,
      hasMore: colleges.length === limit,
    });
  } catch (error: unknown) {
    console.error("Error fetching colleges:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch colleges", message },
      { status: 500 },
    );
  }
}

// POST /api/colleges - Create a new college (admin only)
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, location, fees, duration } = body;

    // Validate required fields
    if (!name || !location || !fees || !duration) {
      return NextResponse.json(
        { error: "Missing required fields: name, location, fees, duration" },
        { status: 400 },
      );
    }

    // Create models instance
    const models = await getModels();

    // Create the college
    const newCollege = await models.college.createCollege({
      name,
      location,
      fees: parseInt(fees),
      duration,
    });

    return NextResponse.json({
      success: true,
      college: {
        ...newCollege,
        _id: newCollege._id?.toString(),
        averageRating: 0,
        reviewCount: 0,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating college:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create college", message },
      { status: 500 },
    );
  }
}
