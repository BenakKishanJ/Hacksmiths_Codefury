// app/api/posts/[id]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getModels } from "@/lib/models";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Correct way to access params in Next.js App Router
    const params = await context.params;
    const postId = params.id;

    const models = await getModels();
    const user = await models.user.getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await models.post.getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isLiked = post.likes.some(
      (like) => like.toString() === user._id?.toString(),
    );

    if (isLiked) {
      await models.post.unlikePost(new ObjectId(postId), user._id!);
    } else {
      await models.post.likePost(new ObjectId(postId), user._id!);
    }

    // Get updated post
    const updatedPost = await models.post.getPostById(postId);

    return NextResponse.json({
      likes: updatedPost?.likes.map((id) => id.toString()) || [],
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 },
    );
  }
}
