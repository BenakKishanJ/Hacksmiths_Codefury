// app/api/posts/[id]/comment/route.ts
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

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 },
      );
    }

    const models = await getModels();
    const user = await models.user.getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await models.post.addComment(new ObjectId(postId), {
      userId: user._id!,
      text,
    });

    // Get updated post with comments
    const updatedPost = await models.post.getPostById(postId);
    const comments =
      updatedPost?.comments
        .filter((comment) => comment !== null)
        .map((comment) => ({
          userId: comment!.userId.toString(),
          text: comment!.text,
          createdAt: comment!.createdAt.toISOString(),
        })) || [];

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 },
    );
  }
}
