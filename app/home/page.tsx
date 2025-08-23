// app/home/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
// import { ObjectId } from "mongodb";

// Define types for the API responses
interface Comment {
  userId: string;
  text: string;
  createdAt: string;
}

interface Post {
  _id: string;
  artworkId: string;
  artistId: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  caption: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  artist?: {
    id: string;
    name: string;
    profilePic?: string;
  };
  artwork?: {
    id: string;
    title: string;
    forSale?: boolean;
    isAuction?: boolean;
  };
  totalPostsInTimeline?: number;
}

export default function HomePage() {
  const { user: currentUser, isLoaded } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const response = await fetch("/api/feed?limit=20");

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      const result = await response.json();

      // Update local state
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              likes: result.likes,
              isLiked: result.isLiked,
            };
          }
          return post;
        }),
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!currentUser || !text.trim()) return;

    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const result = await response.json();

      // Update local state
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: result.comments,
            };
          }
          return post;
        }),
      );
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-6">Art Feed</h1>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No posts yet. Be the first to share your artwork!
          </p>
          <Link
            href="/artworks/upload"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Upload Artwork
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUser?.id}
              onLike={handleLike}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
}

function PostCard({
  post,
  currentUserId,
  onLike,
  onAddComment,
}: PostCardProps) {
  const [commentText, setCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    onAddComment(post._id, commentText);
    setCommentText("");
  };

  const handleLikeClick = () => {
    onLike(post._id);
  };

  const displayedComments = showAllComments
    ? post.comments
    : post.comments.slice(-2);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
            {post.artist?.profilePic ? (
              <Image
                src={post.artist.profilePic}
                alt={post.artist.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="text-sm">
                {post.artist?.name?.charAt(0) || "A"}
              </span>
            )}
          </div>
          <div>
            <Link
              href={`/artists/${post.artist?.id}`}
              className="font-medium hover:underline"
            >
              {post.artist?.name || "Unknown Artist"}
            </Link>
            <p className="text-xs text-muted-foreground">
              {post.artwork?.title}
            </p>
          </div>
        </div>
        <Link
          href={`/artworks/${post.artworkId}`}
          className="text-sm text-blue-600 hover:underline"
        >
          View Artwork
        </Link>
      </div>

      {/* Post Media */}
      <div className="aspect-square relative">
        <Image
          src={post.mediaUrl}
          alt={post.caption}
          fill
          className="object-cover"
        />
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <button onClick={handleLikeClick} className="focus:outline-none">
              {isLiked ? (
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </button>
            <button className="focus:outline-none">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Likes count */}
        {post.likes.length > 0 && (
          <p className="text-sm font-medium mb-2">
            {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
          </p>
        )}

        {/* Caption */}
        <div className="mb-2">
          <p className="text-sm">
            <span className="font-medium">{post.artist?.name || "Artist"}</span>{" "}
            {post.caption}
          </p>
        </div>

        {/* Comments */}
        {post.comments.length > 0 && (
          <div className="mb-2">
            {post.comments.length > 2 && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-sm text-muted-foreground mb-2"
              >
                View all {post.comments.length} comments
              </button>
            )}

            {displayedComments.map((comment, index) => (
              <div key={index} className="mb-1">
                <p className="text-sm">
                  <span className="font-medium">
                    User{comment.userId.slice(-4)}
                  </span>{" "}
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mb-3">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>

        {/* Add comment */}
        {currentUserId && (
          <form
            onSubmit={handleSubmitComment}
            className="flex items-center border-t border-neutral-200 dark:border-neutral-700 pt-3"
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="text-blue-600 font-medium text-sm disabled:opacity-50"
            >
              Post
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
