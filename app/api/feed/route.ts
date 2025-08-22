import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels, isComment } from "@/lib/models";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Create models instance
    const models = await getModels();

    // Get feed posts
    const posts = await models.post.getFeedPosts(limit, skip);

    // Fetch additional data for each post
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        // Get artist info
        const artist = await models.user.getUserById(post.artistId);

        // Get artwork info
        const artwork = await models.artwork.getArtworkById(post.artworkId);

        // Count total posts for this artwork (for timeline context)
        const totalPosts = await models.post.getPostCountByArtwork(
          post.artworkId,
        );

        // Map IDs to strings for better JSON compatibility
        return {
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
          artist: artist
            ? {
                id: artist._id?.toString(),
                name: artist.name,
                profilePic: artist.profilePic || null,
              }
            : null,
          artwork: artwork
            ? {
                id: artwork._id?.toString(),
                title: artwork.title,
                forSale: artwork.forSale,
                isAuction: artwork.isAuction,
              }
            : null,
          totalPostsInTimeline: totalPosts,
        };
      }),
    );

    return NextResponse.json({
      posts: postsWithDetails,
      hasMore: posts.length === limit,
    });
  } catch (error: unknown) {
    console.error("Error fetching feed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch feed", message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { artworkId, mediaType, mediaUrl, caption } = body;

    // Validate required fields
    if (!artworkId || !mediaType || !mediaUrl) {
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

    // Verify artwork exists and belongs to this artist
    const artwork = await models.artwork.getArtworkById(artworkId);
    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    if (artwork.artistId.toString() !== user._id?.toString()) {
      return NextResponse.json(
        { error: "You can only create posts for your own artworks" },
        { status: 403 },
      );
    }

    // Create the post
    const newPost = await models.post.createPost({
      artworkId: new ObjectId(artworkId),
      artistId: user._id as ObjectId,
      mediaType: mediaType as "image" | "video",
      mediaUrl,
      caption: caption || "",
    });

    return NextResponse.json({
      success: true,
      post: {
        ...newPost,
        _id: newPost._id?.toString(),
        artworkId: newPost.artworkId.toString(),
        artistId: newPost.artistId.toString(),
        likes: [],
        comments: [],
      },
    });
  } catch (error: unknown) {
    console.error("Error creating post:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create post", message },
      { status: 500 },
    );
  }
}
