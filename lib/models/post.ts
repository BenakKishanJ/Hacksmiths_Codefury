import { Collection, ObjectId } from "mongodb";
import { Database } from "./database";
import { Post, Comment } from "./types";

export class PostModel {
  private collection: Collection<Post>;

  constructor(collection: Collection<Post>) {
    this.collection = collection;
  }

  // Create a new post
  async createPost(
    postData: Omit<Post, "_id" | "likes" | "comments" | "createdAt">,
  ): Promise<Post> {
    const now = new Date();
    const newPost: Post = {
      ...postData,
      likes: [],
      comments: [],
      createdAt: now,
    };

    const result = await this.collection.insertOne(newPost);
    return { ...newPost, _id: result.insertedId };
  }

  // Get post by ID
  async getPostById(id: string | ObjectId): Promise<Post | null> {
    const _id = typeof id === "string" ? new ObjectId(id) : id;
    return this.collection.findOne({ _id });
  }

  // Get all posts for a specific artwork (timeline)
  async getPostsByArtwork(artworkId: string | ObjectId): Promise<Post[]> {
    const _artworkId =
      typeof artworkId === "string" ? new ObjectId(artworkId) : artworkId;
    return this.collection
      .find({ artworkId: _artworkId })
      .sort({ createdAt: 1 }) // Chronological order for timeline
      .toArray();
  }

  // Get posts by artist
  async getPostsByArtist(
    artistId: string | ObjectId,
    limit = 20,
    skip = 0,
  ): Promise<Post[]> {
    const _artistId =
      typeof artistId === "string" ? new ObjectId(artistId) : artistId;
    return this.collection
      .find({ artistId: _artistId })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get feed posts (most recent posts from all artists)
  async getFeedPosts(limit = 20, skip = 0): Promise<Post[]> {
    return this.collection
      .find({})
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Like a post
  async likePost(
    postId: string | ObjectId,
    userId: string | ObjectId,
  ): Promise<boolean> {
    const _postId = typeof postId === "string" ? new ObjectId(postId) : postId;
    const _userId = typeof userId === "string" ? new ObjectId(userId) : userId;

    const result = await this.collection.updateOne(
      { _id: _postId },
      { $addToSet: { likes: _userId } },
    );
    return result.modifiedCount > 0;
  }

  // Unlike a post
  async unlikePost(
    postId: string | ObjectId,
    userId: string | ObjectId,
  ): Promise<boolean> {
    const _postId = typeof postId === "string" ? new ObjectId(postId) : postId;
    const _userId = typeof userId === "string" ? new ObjectId(userId) : userId;

    const result = await this.collection.updateOne(
      { _id: _postId },
      { $pull: { likes: _userId } },
    );
    return result.modifiedCount > 0;
  }

  // Add comment to post
  async addComment(
    postId: string | ObjectId,
    comment: Omit<Comment, "createdAt">,
  ): Promise<boolean> {
    const _postId = typeof postId === "string" ? new ObjectId(postId) : postId;
    const newComment: Comment = {
      ...comment,
      createdAt: new Date(),
    };

    const result = await this.collection.updateOne(
      { _id: _postId },
      { $push: { comments: newComment } },
    );
    return result.modifiedCount > 0;
  }

  // Delete comment from post
  async deleteComment(
    postId: string | ObjectId,
    commentIndex: number,
  ): Promise<boolean> {
    const _postId = typeof postId === "string" ? new ObjectId(postId) : postId;

    // First unset the element at the specified index
    const unsetResult = await this.collection.updateOne(
      { _id: _postId },
      { $unset: { [`comments.${commentIndex}`]: 1 } },
    );

    if (unsetResult.modifiedCount === 0) return false;

    // Then pull all null values from the array
    const pullResult = await this.collection.updateOne(
      { _id: _postId },
      { $pull: { comments: null } },
    );

    return pullResult.modifiedCount > 0;
  }

  // Get post count by artwork
  async getPostCountByArtwork(artworkId: string | ObjectId): Promise<number> {
    const _artworkId =
      typeof artworkId === "string" ? new ObjectId(artworkId) : artworkId;
    return this.collection.countDocuments({ artworkId: _artworkId });
  }

  // Get post count by artist
  async getPostCountByArtist(artistId: string | ObjectId): Promise<number> {
    const _artistId =
      typeof artistId === "string" ? new ObjectId(artistId) : artistId;
    return this.collection.countDocuments({ artistId: _artistId });
  }

  // Factory method to create a PostModel instance
  static async getInstance(): Promise<PostModel> {
    const db = await Database.getInstance();
    return new PostModel(db.posts);
  }
}
