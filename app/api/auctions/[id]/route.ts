// app/api/auctions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels } from "@/lib/models";
import { ObjectId } from "mongodb";

// GET /api/auctions/[id] - Get single auction by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const auctionId = params.id;

    // Create models instance
    const models = await getModels();

    // Get auction
    const auction = await models.auction.getAuctionById(auctionId);
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Get artwork details
    const artwork = await models.artwork.getArtworkById(auction.artworkId);
    const artist = artwork
      ? await models.user.getUserById(artwork.artistId)
      : null;
    const artform = artwork
      ? await models.artform.getArtformById(artwork.artformId)
      : null;

    // Get bidder information for all bids
    const bidsWithBidders = await Promise.all(
      auction.bids.map(async (bid) => {
        const bidder = await models.user.getUserById(bid.userId);
        return {
          ...bid,
          userId: bid.userId.toString(),
          bidder: bidder
            ? {
              id: bidder._id?.toString(),
              name: bidder.name,
              profilePic: bidder.profilePic,
            }
            : null,
        };
      }),
    );

    // Get current bidder information
    const currentBidder = auction.currentBidder
      ? await models.user.getUserById(auction.currentBidder)
      : null;

    return NextResponse.json({
      auction: {
        ...auction,
        _id: auction._id?.toString(),
        artworkId: auction.artworkId.toString(),
        artistId: auction.artistId.toString(),
        currentBidder: auction.currentBidder?.toString(),
      },
      artwork: artwork
        ? {
          id: artwork._id?.toString(),
          title: artwork.title,
          description: artwork.description,
          finalImageUrl: artwork.finalImageUrl,
          artformId: artwork.artformId.toString(),
        }
        : null,
      artist: artist
        ? {
          id: artist._id?.toString(),
          name: artist.name,
          profilePic: artist.profilePic,
          bio: artist.bio,
        }
        : null,
      artform: artform
        ? {
          id: artform._id?.toString(),
          name: artform.name,
          state: artform.state,
        }
        : null,
      bids: bidsWithBidders,
      currentBidder: currentBidder
        ? {
          id: currentBidder._id?.toString(),
          name: currentBidder.name,
        }
        : null,
    });
  } catch (error: unknown) {
    console.error("Error fetching auction:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch auction", message },
      { status: 500 },
    );
  }
}

// POST /api/auctions/[id]/bid - Place a bid on an auction
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
    const auctionId = params.id;

    // Parse request body
    const body = await request.json();
    const { amount } = body;

    // Validate required fields
    if (!amount) {
      return NextResponse.json(
        { error: "Missing required field: amount" },
        { status: 400 },
      );
    }

    // Validate amount is a positive number
    const bidAmount = parseInt(amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      return NextResponse.json(
        { error: "Bid amount must be a positive number" },
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

    // Get auction
    const auction = await models.auction.getAuctionById(auctionId);
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Check if auction is still ongoing
    const now = new Date();
    if (auction.status !== "ongoing" || now > auction.endTime) {
      return NextResponse.json({ error: "Auction has ended" }, { status: 400 });
    }

    // Check if bid amount is higher than current bid
    if (bidAmount <= auction.currentBid) {
      return NextResponse.json(
        { error: "Bid amount must be higher than current bid" },
        { status: 400 },
      );
    }

    // Place the bid
    const success = await models.auction.placeBid(new ObjectId(auctionId), {
      userId: user._id as ObjectId,
      amount: bidAmount,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to place bid" },
        { status: 500 },
      );
    }

    // Get updated auction
    const updatedAuction = await models.auction.getAuctionById(auctionId);

    return NextResponse.json({
      success: true,
      currentBid: updatedAuction?.currentBid || bidAmount,
      currentBidder: user._id?.toString(),
      message: "Bid placed successfully",
    });
  } catch (error: unknown) {
    console.error("Error placing bid:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to place bid", message },
      { status: 500 },
    );
  }
}
