import { ObjectId } from "mongodb";

export function isComment(comment: Comment | null): comment is Comment {
  return (
    comment !== null &&
    "userId" in comment &&
    "text" in comment &&
    "createdAt" in comment
  );
}
export type UserRole = "artist" | "student" | "admin";
// Users Collection
export interface User {
  _id?: ObjectId;
  clerkId: string; // Clerk auth ID
  role: UserRole;
  name: string;
  email: string;
  bio?: string;
  state?: string; // Artist location/state
  profilePic?: string; // URL
  achievements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Artforms Collection
export interface Artform {
  _id?: ObjectId;
  name: string; // e.g., Warli
  state: string; // Region/state
  history: string; // AI/curated description
  artists: ObjectId[]; // References to Users
  createdAt: Date;
  updatedAt: Date;
}

// Artworks Collection
export interface Artwork {
  _id?: ObjectId;
  artistId: ObjectId; // ref -> Users
  artformId: ObjectId; // ref -> Artforms
  title: string;
  description: string;
  finalImageUrl: string; // final artwork picture
  price: number;
  forSale: boolean;
  isAuction: boolean;
  auctionId?: ObjectId | null; // ref -> Auctions if applicable
  createdAt: Date;
  updatedAt: Date;
}

// Posts Collection
export interface Comment {
  userId: ObjectId;
  text: string;
  createdAt: Date;
}

export interface Post {
  _id?: ObjectId;
  artworkId: ObjectId; // ref -> Artworks
  artistId: ObjectId; // redundant for quick queries
  mediaType: "image" | "video";
  mediaUrl: string;
  caption: string;
  likes: ObjectId[]; // userIds
  comments: (Comment | null)[];
  createdAt: Date;
}

// Auctions Collection
export interface Bid {
  userId: ObjectId;
  amount: number;
  time: Date;
}

export interface Auction {
  _id?: ObjectId;
  artworkId: ObjectId;
  artistId: ObjectId;
  startPrice: number;
  currentBid: number;
  currentBidder?: ObjectId; // ref -> Users
  bids: Bid[];
  startTime: Date;
  endTime: Date;
  status: "ongoing" | "completed";
  createdAt: Date;
}

// Courses Collection
export interface CourseContent {
  type: "video" | "pdf" | "text";
  url: string;
}

export interface Course {
  _id?: ObjectId;
  artistId: ObjectId; // ref -> Users
  title: string;
  description: string;
  price: number; // free or paid
  content: CourseContent[];
  studentsEnrolled: ObjectId[]; // userIds
  createdAt: Date;
  updatedAt: Date;
}

// Colleges Collection
export interface CollegeReview {
  userId: ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface College {
  _id?: ObjectId;
  name: string;
  location: string;
  fees: number;
  duration: string;
  reviews: CollegeReview[];
  createdAt: Date;
  updatedAt: Date;
}
