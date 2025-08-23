import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels } from "@/lib/models";
import { ObjectId } from "mongodb";

// GET /api/settings - Get user settings
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

    return NextResponse.json({
      settings: {
        bio: user.bio || "",
        state: user.state || "",
        profilePic: user.profilePic || "",
        emailNotifications: true, // Default settings
        pushNotifications: true,
        privacy: {
          showEmail: false,
          showArtworks: true,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching settings:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch settings", message },
      { status: 500 },
    );
  }
}

// PATCH /api/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      bio,
      state,
      profilePic,
      emailNotifications,
      pushNotifications,
      privacy,
    } = body;

    const models = await getModels();
    const user = await models.user.getUserByClerkId(clerkId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user profile data
    const updateData = {
      ...(bio !== undefined && { bio }),
      ...(state !== undefined && { state }),
      ...(profilePic !== undefined && { profilePic }),
    };

    if (Object.keys(updateData).length > 0) {
      const success = await models.user.updateUser(
        user._id as ObjectId,
        updateData,
      );

      if (!success) {
        return NextResponse.json(
          { error: "Failed to update settings" },
          { status: 500 },
        );
      }
    }

    // Here you would also update settings in a separate collection if needed
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error updating settings:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update settings", message },
      { status: 500 },
    );
  }
}
