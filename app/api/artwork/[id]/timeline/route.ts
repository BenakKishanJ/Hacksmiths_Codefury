import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels, isComment } from "@/lib/models";
import { ObjectId } from "mongodb";

// GET /api/artwork/[id]/timeline - Get all posts for an artwork (timeline)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const artworkId = params.id;

    // Create models instance
    const models = await getModels();

    // Verify artwork exists
    const artwork = await models.artwork.getArtworkById(artworkId);
    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    // Get all posts for this artwork ordered by creation time (chronologically for the timeline)
    const posts = await models.post.getPostsByArtwork(artworkId);

    // Get artist info
    const artist = await models.user.getUserById(artwork.artistId);

    // Transform posts for response
    const transformedPosts = posts.map((post) => ({
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
    }));

    return NextResponse.json({
      timeline: transformedPosts,
      artwork: {
        _id: artwork._id?.toString(),
        title: artwork.title,
        finalImageUrl: artwork.finalImageUrl,
      },
      artist: artist
        ? {
            _id: artist._id?.toString(),
            name: artist.name,
            profilePic: artist.profilePic,
          }
        : null,
    });
  } catch (error: unknown) {
    console.error("Error fetching artwork timeline:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch timeline", message },
      { status: 500 },
    );
  }
}

// POST /api/artwork/[id]/timeline - Add a new post to the artwork timeline
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const artworkId = params.id;

    // Parse request body
    const body = await request.json();
    const { mediaType, mediaUrl, caption } = body;

    // Validate required fields
    if (!mediaType || !mediaUrl) {
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

    // Verify artwork exists
    const artwork = await models.artwork.getArtworkById(artworkId);
    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    // Verify user is the artist of this artwork
    if (artwork.artistId.toString() !== user._id?.toString()) {
      return NextResponse.json(
        { error: "You can only add posts to your own artworks" },
        { status: 403 },
      );
    }

    // Create new post
    const newPost = await models.post.createPost({
      artworkId: new ObjectId(artworkId),
      artistId: user._id as ObjectId,
      mediaType: mediaType as "image" | "video",
      mediaUrl,
      caption: caption || "",
    });

    // Return the created post
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
    console.error("Error creating timeline post:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create post", message },
      { status: 500 },
    );
  }
}
