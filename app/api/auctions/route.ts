// app/api/auctions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels } from "@/lib/models";
import { ObjectId } from "mongodb";

// GET /api/auctions - Get auctions with filtering
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");
    const status = searchParams.get("status");
    const artistId = searchParams.get("artistId");

    // Create models instance
    const models = await getModels();

    let auctions;

    // Handle different filtering options
    if (status === "ongoing") {
      auctions = await models.auction.getOngoingAuctions(limit, skip);
    } else if (status === "ended") {
      auctions = await models.auction.getEndedAuctions(limit, skip);
    } else if (artistId) {
      auctions = await models.auction.getAuctionsByArtist(
        artistId,
        limit,
        skip,
      );
    } else {
      // Get all auctions
      auctions = await models.auction.getOngoingAuctions(limit, skip);
    }

    // Enrich auctions with artwork and artist information
    const enrichedAuctions = await Promise.all(
      auctions.map(async (auction) => {
        const artwork = await models.artwork.getArtworkById(auction.artworkId);
        const artist = artwork
          ? await models.user.getUserById(artwork.artistId)
          : null;
        const currentBidder = auction.currentBidder
          ? await models.user.getUserById(auction.currentBidder)
          : null;

        return {
          ...auction,
          _id: auction._id?.toString(),
          artworkId: auction.artworkId.toString(),
          artistId: auction.artistId.toString(),
          currentBidder: auction.currentBidder?.toString(),
          artwork: artwork
            ? {
              id: artwork._id?.toString(),
              title: artwork.title,
              finalImageUrl: artwork.finalImageUrl,
              description: artwork.description,
            }
            : null,
          artist: artist
            ? {
              id: artist._id?.toString(),
              name: artist.name,
              profilePic: artist.profilePic,
            }
            : null,
          bidder: currentBidder
            ? {
              id: currentBidder._id?.toString(),
              name: currentBidder.name,
            }
            : null,
          // Remove large arrays to reduce payload size
          bids: undefined,
        };
      }),
    );

    return NextResponse.json({
      auctions: enrichedAuctions,
      hasMore: auctions.length === limit,
    });
  } catch (error: unknown) {
    console.error("Error fetching auctions:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch auctions", message },
      { status: 500 },
    );
  }
}

// POST /api/auctions - Create a new auction (artist only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { artworkId, startPrice, endTime } = body;

    // Validate required fields
    if (!artworkId || !startPrice || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields: artworkId, startPrice, endTime" },
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
        { error: "Only artists can create auctions" },
        { status: 403 },
      );
    }

    // Get artwork
    const artwork = await models.artwork.getArtworkById(artworkId);
    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    // Verify user owns the artwork
    if (artwork.artistId.toString() !== user._id?.toString()) {
      return NextResponse.json(
        { error: "You can only create auctions for your own artworks" },
        { status: 403 },
      );
    }

    // Create the auction
    const newAuction = await models.auction.createAuction({
      artworkId: new ObjectId(artworkId),
      artistId: user._id as ObjectId,
      startPrice: parseInt(startPrice),
      currentBid: parseInt(startPrice),
      startTime: new Date(),
      endTime: new Date(endTime),
    });

    // Mark artwork as being in auction
    await models.artwork.markAsInAuction(artworkId, newAuction._id!);

    return NextResponse.json({
      success: true,
      auction: {
        ...newAuction,
        _id: newAuction._id?.toString(),
        artworkId: newAuction.artworkId.toString(),
        artistId: newAuction.artistId.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error creating auction:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create auction", message },
      { status: 500 },
    );
  }
}
