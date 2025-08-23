import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels } from "@/lib/models";
import { ObjectId } from "mongodb";

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const models = await getModels();
    const user = await models.user.getUserByClerkId(clerkId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user statistics
    let artworkCount = 0;
    let courseCount = 0;

    if (user.role === "artist") {
      artworkCount = await models.artwork.getArtworkCountByArtist(
        user._id as ObjectId,
      );
      courseCount = await models.course.getCourseCountByArtist(
        user._id as ObjectId,
      );
    }

    return NextResponse.json({
      user: {
        ...user,
        _id: user._id?.toString(),
        artworkCount,
        courseCount,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching profile:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch profile", message },
      { status: 500 },
    );
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bio, state, profilePic } = body;

    const models = await getModels();
    const user = await models.user.getUserByClerkId(clerkId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData = {
      ...(bio !== undefined && { bio }),
      ...(state !== undefined && { state }),
      ...(profilePic !== undefined && { profilePic }),
    };

    const success = await models.user.updateUser(
      user._id as ObjectId,
      updateData,
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }

    const updatedUser = await models.user.getUserByClerkId(clerkId);
    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        _id: updatedUser?._id?.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error updating profile:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update profile", message },
      { status: 500 },
    );
  }
}
