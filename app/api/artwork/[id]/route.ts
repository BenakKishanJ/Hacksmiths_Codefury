import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels, isComment } from "@/lib/models";
import { ObjectId } from "mongodb";

// GET /api/artwork/[id] - Get single artwork by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // Await params here

    // Create models instance
    const models = await getModels();

    // Get artwork
    const artwork = await models.artwork.getArtworkById(id);
    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    // Get artist
    const artist = await models.user.getUserById(artwork.artistId);

    // Get artform
    const artform = await models.artform.getArtformById(artwork.artformId);

    // Get timeline posts
    const posts = await models.post.getPostsByArtwork(artwork._id as ObjectId);

    // Get auction info if applicable
    let auction = null;
    if (artwork.isAuction && artwork.auctionId) {
      auction = await models.auction.getAuctionById(artwork.auctionId);
    }

    // Return detailed artwork information
    return NextResponse.json({
      artwork: {
        ...artwork,
        _id: artwork._id?.toString(),
        artistId: artwork.artistId.toString(),
        artformId: artwork.artformId.toString(),
        auctionId: artwork.auctionId?.toString(),
      },
      artist: artist
        ? {
          id: artist._id?.toString(),
          name: artist.name,
          bio: artist.bio,
          profilePic: artist.profilePic || null,
        }
        : null,
      artform: artform
        ? {
          id: artform._id?.toString(),
          name: artform.name,
          state: artform.state,
          history: artform.history,
        }
        : null,
      timeline: posts.map((post) => ({
        ...post,
        _id: post._id?.toString(),
        artworkId: post.artworkId.toString(),
        artistId: post.artistId.toString(),
        likes: post.likes.map((id) => id.toString()),
        comments: post.comments
          .filter(isComment) // Use the type guard
          .map((comment) => ({
            ...comment,
            userId: comment.userId.toString(),
            createdAt: comment.createdAt.toISOString(), // Ensure proper serialization
          })),
      })),
      auction: auction
        ? {
          id: auction._id?.toString(),
          startPrice: auction.startPrice,
          currentBid: auction.currentBid,
          currentBidder: auction.currentBidder?.toString(),
          startTime: auction.startTime,
          endTime: auction.endTime,
          status: auction.status,
          bids: auction.bids.map((bid) => ({
            ...bid,
            userId: bid.userId.toString(),
          })),
        }
        : null,
    });
  } catch (error: unknown) {
    console.error("Error fetching artwork:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch artwork", message },
      { status: 500 },
    );
  }
}

// PATCH /api/artwork/[id] - Update artwork
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Await params here

    // Parse request body
    const body = await request.json();
    const { title, description, finalImageUrl, price, forSale, isAuction } =
      body;

    // Create models instance
    const models = await getModels();

    // Get user from Clerk ID
    const user = await models.user.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get artwork
    const artwork = await models.artwork.getArtworkById(id);
    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    // Verify user is the artist or an admin
    if (
      artwork.artistId.toString() !== user._id?.toString() &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "You can only update your own artworks" },
        { status: 403 },
      );
    }

    interface ArtworkUpdateData {
      title?: string;
      description?: string;
      finalImageUrl?: string;
      price?: number;
      forSale?: boolean;
      isAuction?: boolean;
      auctionId?: ObjectId | null;
    }

    // In PATCH handler:
    const updateData: ArtworkUpdateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (finalImageUrl !== undefined) updateData.finalImageUrl = finalImageUrl;
    if (price !== undefined) updateData.price = price;
    if (forSale !== undefined) updateData.forSale = forSale;
    if (isAuction !== undefined) {
      updateData.isAuction = isAuction;
      // If changing to not an auction, remove auction ID
      if (!isAuction) {
        updateData.auctionId = null;
      }
    }

    // Update artwork
    const success = await models.artwork.updateArtwork(id, updateData);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update artwork" },
        { status: 500 },
      );
    }

    // Get updated artwork
    const updatedArtwork = await models.artwork.getArtworkById(id);

    return NextResponse.json({
      success: true,
      artwork: {
        ...updatedArtwork,
        _id: updatedArtwork?._id?.toString(),
        artistId: updatedArtwork?.artistId.toString(),
        artformId: updatedArtwork?.artformId.toString(),
        auctionId: updatedArtwork?.auctionId?.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error updating artwork:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update artwork", message },
      { status: 500 },
    );
  }
}

// DELETE /api/artwork/[id] - Delete artwork
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Await params here

    // Create models instance
    const models = await getModels();

    // Get user from Clerk ID
    const user = await models.user.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get artwork
    const artwork = await models.artwork.getArtworkById(id);
    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    // Verify user is the artist or an admin
    if (
      artwork.artistId.toString() !== user._id?.toString() &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "You can only delete your own artworks" },
        { status: 403 },
      );
    }

    // First delete all associated posts
    const posts = await models.post.getPostsByArtwork(id);
    for (const post of posts) {
      await models.post.deletePost(post._id as ObjectId);
    }

    // Delete any auction associated with this artwork
    if (artwork.isAuction && artwork.auctionId) {
      await models.auction.deleteAuction(artwork.auctionId);
    }

    // Delete the artwork
    await models.artwork.deleteArtwork(new ObjectId(id));

    return NextResponse.json({
      success: true,
      message: "Artwork and associated data deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting artwork:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete artwork", message },
      { status: 500 },
    );
  }
}
