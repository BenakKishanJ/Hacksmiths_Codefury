import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels, UserRole } from "@/lib/models";
import { ObjectId } from "mongodb";

// GET /api/user - Get current user
// GET /api/user?id=123 - Get user by ID
// GET /api/user?role=artist - Get users by role
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("id");
    const role = searchParams.get("role");
    const state = searchParams.get("state");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Create models instance
    const models = await getModels();

    // Case 1: Get specific user by ID
    if (userId) {
      const user = await models.user.getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Count user's artworks
      const artworkCount = await models.artwork.getArtworkCountByArtist(
        user._id as ObjectId,
      );

      // Count user's courses if they're an artist
      let courseCount = 0;
      if (user.role === "artist") {
        courseCount = await models.course.getCourseCountByArtist(
          user._id as ObjectId,
        );
      }

      return NextResponse.json({
        user: {
          ...user,
          _id: user._id?.toString(),
          artworkCount,
          courseCount: user.role === "artist" ? courseCount : 0,
        },
      });
    }

    // Case 2: Get users by role and optionally by state
    if (role) {
      let users;
      const userRole = role as UserRole; // Type assertion

      if (userRole === "artist" && state) {
        users = await models.user.getUsersByRoleAndState(
          userRole,
          state,
          limit,
          skip,
        );
      } else {
        users = await models.user.getUsersByRole(userRole, limit, skip);
      }

      // Transform users for response
      const transformedUsers = await Promise.all(
        users.map(async (user) => {
          // Count artworks for artists
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

          return {
            ...user,
            _id: user._id?.toString(),
            artworkCount: user.role === "artist" ? artworkCount : 0,
            courseCount: user.role === "artist" ? courseCount : 0,
          };
        }),
      );

      return NextResponse.json({
        users: transformedUsers,
        hasMore: users.length === limit,
      });
    }

    // Case 3: Get current authenticated user
    const { userId: clerkId } = await auth();
    if (clerkId) {
      const user = await models.user.getUserByClerkId(clerkId);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Count user's artworks if they're an artist
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
          artworkCount: user.role === "artist" ? artworkCount : 0,
          courseCount: user.role === "artist" ? courseCount : 0,
        },
      });
    }

    // If no parameters and no authentication, return error
    return NextResponse.json(
      { error: "Missing user ID or authentication" },
      { status: 400 },
    );
  } catch (error: unknown) {
    console.error("Error fetching user(s):", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch user(s)", message },
      { status: 500 },
    );
  }
}

// POST /api/user - Create or update user from Clerk webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clerkId,
      role = "student", // Default role is student
      name,
      email,
      bio = "",
      state = "",
      profilePic = "",
    } = body;

    // Validate required fields
    if (!clerkId || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create models instance
    const models = await getModels();

    // Check if user already exists
    const existingUser = await models.user.getUserByClerkId(clerkId);

    if (existingUser) {
      // Update existing user
      const updateData = {
        name,
        email,
        bio,
        state,
        profilePic,
        role, // Only update role if provided
      };

      const success = await models.user.updateUser(
        existingUser._id as ObjectId,
        updateData,
      );

      if (!success) {
        return NextResponse.json(
          { error: "Failed to update user" },
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
        isNew: false,
      });
    } else {
      // Create new user
      const newUser = await models.user.createUser({
        clerkId,
        role,
        name,
        email,
        bio,
        state,
        profilePic,
      });

      return NextResponse.json({
        success: true,
        user: {
          ...newUser,
          _id: newUser._id?.toString(),
        },
        isNew: true,
      });
    }
  } catch (error: unknown) {
    console.error("Error creating/updating user:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create/update user", message },
      { status: 500 },
    );
  }
}

// PATCH /api/user - Update current user
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, bio, state, profilePic, role } = body;

    // Create models instance
    const models = await getModels();

    // Get user from Clerk ID
    const user = await models.user.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    interface UserUpdateData {
      name?: string;
      bio?: string;
      state?: string;
      profilePic?: string;
      role?: UserRole;
    }

    // Prepare update data
    const updateData: UserUpdateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (state !== undefined) updateData.state = state;
    if (profilePic !== undefined) updateData.profilePic = profilePic;
    if (role !== undefined && user.role === "admin") {
      updateData.role = role;
    }

    // Only admins can change roles
    if (role !== undefined && user.role === "admin") {
      updateData.role = role;
    }

    // Update user
    const success = await models.user.updateUser(
      user._id as ObjectId,
      updateData,
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }

    // Get updated user
    const updatedUser = await models.user.getUserByClerkId(clerkId);

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        _id: updatedUser?._id?.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process request", message },
      { status: 500 },
    );
  }
}
