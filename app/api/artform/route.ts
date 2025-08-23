// app/api/artform/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels } from "@/lib/models";
import { ObjectId } from "mongodb";

// GET /api/artform - Get all artforms
// GET /api/artform?state=stateName - Get artforms by state
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get("state");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Create models instance
    const models = await getModels();

    // Get artforms
    let artforms;
    if (state) {
      artforms = await models.artform.getArtformsByState(state, limit, skip);
    } else {
      artforms = await models.artform.getAllArtforms(limit, skip);
    }

    // Transform artforms for response and add artist counts
    const transformedArtforms = await Promise.all(
      artforms.map(async (artform) => {
        // For each artform, get the artists
        const artistCount = artform.artists.length;

        // Get sample artworks for this artform
        const artworks = await models.artwork.getArtworksByArtform(
          artform._id as ObjectId,
          3,
          0,
        );

        return {
          ...artform,
          _id: artform._id?.toString(),
          artists: artform.artists.map((id) => id.toString()),
          artistCount,
          sampleArtworks: artworks.map((artwork) => ({
            _id: artwork._id?.toString(),
            title: artwork.title,
            finalImageUrl: artwork.finalImageUrl,
          })),
        };
      }),
    );

    return NextResponse.json({
      artforms: transformedArtforms,
      hasMore: artforms.length === limit,
    });
  } catch (error: unknown) {
    console.error("Error fetching artforms:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch artforms", message },
      { status: 500 },
    );
  }
}

// POST /api/artform - Create a new artform (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, state, history } = body;

    // Validate required fields
    if (!name || !state || !history) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Verify user is an admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create artforms" },
        { status: 403 },
      );
    }

    // Check if artform with same name already exists
    const existingArtform = await models.artform.getArtformByName(name);
    if (existingArtform) {
      return NextResponse.json(
        { error: "Artform with this name already exists" },
        { status: 409 },
      );
    }

    // Create the artform
    const newArtform = await models.artform.createArtform({
      name,
      state,
      history,
    });

    return NextResponse.json({
      success: true,
      artform: {
        ...newArtform,
        _id: newArtform._id?.toString(),
        artists: [],
      },
    });
  } catch (error: unknown) {
    console.error("Error creating artform:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create artform", message },
      { status: 500 },
    );
  }
}
