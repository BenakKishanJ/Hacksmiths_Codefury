// app/api/artform/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/models";
// import { ObjectId } from "mongodb";
import { auth } from "@clerk/nextjs/server";

// GET /api/artform/[id] - Get single artform by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const id = params.id;

    // Create models instance
    const models = await getModels();

    // Get artform
    const artform = await models.artform.getArtformById(id);
    if (!artform) {
      return NextResponse.json({ error: "Artform not found" }, { status: 404 });
    }

    // Get all artists for this artform
    const artistObjects = await Promise.all(
      artform.artists.map(async (artistId) => {
        const artist = await models.user.getUserById(artistId);
        return artist
          ? {
            _id: artist._id?.toString(),
            name: artist.name,
            profilePic: artist.profilePic || null,
            state: artist.state || null,
          }
          : null;
      }),
    );

    // Filter out null values (artists that don't exist anymore)
    const artists = artistObjects.filter((artist) => artist !== null);

    // Get artworks for this artform
    const artworks = await models.artwork.getArtworksByArtform(id, 10, 0);

    // Transform artworks for response
    const transformedArtworks = artworks.map((artwork) => ({
      _id: artwork._id?.toString(),
      title: artwork.title,
      artistId: artwork.artistId.toString(),
      finalImageUrl: artwork.finalImageUrl,
      price: artwork.price,
      forSale: artwork.forSale,
      isAuction: artwork.isAuction,
    }));

    return NextResponse.json({
      artform: {
        ...artform,
        _id: artform._id?.toString(),
        artists: artform.artists.map((id) => id.toString()),
      },
      artists,
      artworks: transformedArtworks,
    });
  } catch (error: unknown) {
    console.error("Error fetching artform:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch artform", message },
      { status: 500 },
    );
  }
}

// PATCH /api/artform/[id] - Update artform (admin only)
export async function PATCH(
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
    const id = params.id;

    // Parse request body
    const body = await request.json();
    const { name, state, history } = body;

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
        { error: "Only admins can update artforms" },
        { status: 403 },
      );
    }

    // Build update data with proper typing
    const updateData: Partial<
      Pick<import("@/lib/models/types").Artform, "name" | "state" | "history">
    > = {};
    if (name !== undefined) updateData.name = name;
    if (state !== undefined) updateData.state = state;
    if (history !== undefined) updateData.history = history;

    const success = await models.artform.updateArtform(id, updateData);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update artform" },
        { status: 500 },
      );
    }

    // Get updated artform
    const updatedArtform = await models.artform.getArtformById(id);

    return NextResponse.json({
      success: true,
      artform: {
        ...updatedArtform,
        _id: updatedArtform?._id?.toString(),
        artists: updatedArtform?.artists.map((id) => id.toString()) || [],
      },
    });
  } catch (error: unknown) {
    console.error("Error updating artform:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update artform", message },
      { status: 500 },
    );
  }
}

// DELETE /api/artform/[id] - Delete artform (admin only)
export async function DELETE(
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
    const id = params.id;

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
        { error: "Only admins can delete artforms" },
        { status: 403 },
      );
    }

    // Delete artform - now using string id directly since the method handles conversion
    const success = await models.artform.deleteArtform(id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete artform" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Artform deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting artform:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete artform", message },
      { status: 500 },
    );
  }
}
