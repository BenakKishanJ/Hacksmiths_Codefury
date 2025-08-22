import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels, isComment } from "@/lib/models";
import { ObjectId } from "mongodb";

// GET /api/artwork - List all artworks with pagination
// GET /api/artwork?artistId=123 - Get artworks by artist
// GET /api/artwork?artformId=123 - Get artworks by artform
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");
    const artistId = searchParams.get("artistId");
    const artformId = searchParams.get("artformId");
    const forSale = searchParams.get("forSale");
    const isAuction = searchParams.get("isAuction");

    // Create models instance
    const models = await getModels();

    // Determine which query to use based on parameters
    let artworks;
    if (artistId) {
      artworks = await models.artwork.getArtworksByArtist(
        artistId,
        limit,
        skip,
      );
    } else if (artformId) {
      artworks = await models.artwork.getArtworksByArtform(
        artformId,
        limit,
        skip,
      );
    } else if (forSale === "true") {
      artworks = await models.artwork.getArtworksForSale(limit, skip);
    } else if (isAuction === "true") {
      artworks = await models.artwork.getArtworksInAuction(limit, skip);
    } else {
      // Get all artworks with pagination
      artworks = await models.artwork.getArtworksPaginated(limit, skip);
    }

    // Fetch additional data for each artwork
    const artworksWithDetails = await Promise.all(
      artworks.map(async (artwork) => {
        // Get artist info
        const artist = await models.user.getUserById(artwork.artistId);

        // Get artform info
        const artform = await models.artform.getArtformById(artwork.artformId);

        // Get timeline posts for this artwork
        const posts = await models.post.getPostsByArtwork(
          artwork._id as ObjectId,
        );

        // Get auction info if applicable
        let auction = null;
        if (artwork.isAuction && artwork.auctionId) {
          auction = await models.auction.getAuctionById(artwork.auctionId);
        }

        // Map IDs to strings for better JSON compatibility
        return {
          ...artwork,
          _id: artwork._id?.toString(),
          artistId: artwork.artistId.toString(),
          artformId: artwork.artformId.toString(),
          auctionId: artwork.auctionId?.toString(),
          artist: artist
            ? {
                id: artist._id?.toString(),
                name: artist.name,
                profilePic: artist.profilePic || null,
              }
            : null,
          artform: artform
            ? {
                id: artform._id?.toString(),
                name: artform.name,
                state: artform.state,
              }
            : null,
          timelineCount: posts.length,
          auction: auction
            ? {
                id: auction._id?.toString(),
                currentBid: auction.currentBid,
                endTime: auction.endTime,
                status: auction.status,
              }
            : null,
        };
      }),
    );

    return NextResponse.json({
      artworks: artworksWithDetails,
      hasMore: artworks.length === limit,
    });
  } catch (error: unknown) {
    console.error("Error fetching artworks:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch artworks", message },
      { status: 500 },
    );
  }
}

// POST /api/artwork - Create a new artwork
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      finalImageUrl,
      price,
      artformId,
      forSale = false,
      isAuction = false,
    } = body;

    // Validate required fields
    if (!title || !description || !finalImageUrl || !artformId) {
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

    // Verify user is an artist
    if (user.role !== "artist") {
      return NextResponse.json(
        { error: "Only artists can create artworks" },
        { status: 403 },
      );
    }

    // Verify artform exists
    const artform = await models.artform.getArtformById(artformId);
    if (!artform) {
      return NextResponse.json({ error: "Artform not found" }, { status: 404 });
    }

    // Create the artwork
    const newArtwork = await models.artwork.createArtwork({
      artistId: user._id as ObjectId,
      artformId: new ObjectId(artformId),
      title,
      description,
      finalImageUrl,
      price: price || 0,
      forSale,
      isAuction,
    });

    // Add artist to artform if not already added
    await models.artform.addArtistToArtform(artformId, user._id as ObjectId);

    return NextResponse.json({
      success: true,
      artwork: {
        ...newArtwork,
        _id: newArtwork._id?.toString(),
        artistId: newArtwork.artistId.toString(),
        artformId: newArtwork.artformId.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error creating artwork:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create artwork", message },
      { status: 500 },
    );
  }
}

// GET /api/artwork/[id] - Get single artwork by ID
export async function GET_byId(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;

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
