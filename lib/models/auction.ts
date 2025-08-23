import { Collection, ObjectId } from "mongodb";
import { Database } from "./database";
import { Auction, Bid } from "./types";

export class AuctionModel {
  async deleteAuction(auctionId: ObjectId): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: auctionId });
    return result.deletedCount > 0;
  }

  private collection: Collection<Auction>;

  constructor(collection: Collection<Auction>) {
    this.collection = collection;
  }

  // Create a new auction
  async createAuction(
    auctionData: Omit<Auction, "_id" | "bids" | "status" | "createdAt">,
  ): Promise<Auction> {
    const now = new Date();
    const newAuction: Auction = {
      ...auctionData,
      bids: [],
      status: "ongoing",
      createdAt: now,
    };

    const result = await this.collection.insertOne(newAuction);
    return { ...newAuction, _id: result.insertedId };
  }

  // Get auction by ID
  async getAuctionById(id: string | ObjectId): Promise<Auction | null> {
    const _id = typeof id === "string" ? new ObjectId(id) : id;
    return this.collection.findOne({ _id });
  }

  // Get auction by artwork ID
  async getAuctionByArtwork(
    artworkId: string | ObjectId,
  ): Promise<Auction | null> {
    const _artworkId =
      typeof artworkId === "string" ? new ObjectId(artworkId) : artworkId;
    return this.collection.findOne({
      artworkId: _artworkId,
      status: "ongoing",
    });
  }

  // Get auctions by artist
  async getAuctionsByArtist(
    artistId: string | ObjectId,
    limit = 20,
    skip = 0,
  ): Promise<Auction[]> {
    const _artistId =
      typeof artistId === "string" ? new ObjectId(artistId) : artistId;
    return this.collection
      .find({ artistId: _artistId })
      .sort({ endTime: 1 }) // Ending soonest first
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get all ongoing auctions
  async getOngoingAuctions(limit = 20, skip = 0): Promise<Auction[]> {
    const now = new Date();
    return this.collection
      .find({
        status: "ongoing",
        endTime: { $gt: now },
      })
      .sort({ endTime: 1 }) // Ending soonest first
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get all ended auctions
  async getEndedAuctions(limit = 20, skip = 0): Promise<Auction[]> {
    return this.collection
      .find({ status: "completed" })
      .sort({ endTime: -1 }) // Most recently ended first
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Place a bid
  async placeBid(
    auctionId: string | ObjectId,
    bidData: Omit<Bid, "time">,
  ): Promise<boolean> {
    const _auctionId =
      typeof auctionId === "string" ? new ObjectId(auctionId) : auctionId;
    const now = new Date();

    // Get the current auction
    const auction = await this.getAuctionById(_auctionId);
    if (!auction) return false;

    // Check if auction is still ongoing
    if (auction.status !== "ongoing" || now > auction.endTime) {
      return false;
    }

    // Check if bid amount is higher than current bid
    if (bidData.amount <= auction.currentBid) {
      return false;
    }

    // Create the new bid
    const newBid: Bid = {
      ...bidData,
      time: now,
    };

    // Update the auction
    const result = await this.collection.updateOne(
      { _id: _auctionId },
      {
        $push: { bids: newBid },
        $set: {
          currentBid: bidData.amount,
          currentBidder: bidData.userId,
        },
      },
    );

    return result.modifiedCount > 0;
  }

  // End auction
  async endAuction(auctionId: string | ObjectId): Promise<boolean> {
    const _auctionId =
      typeof auctionId === "string" ? new ObjectId(auctionId) : auctionId;

    const result = await this.collection.updateOne(
      { _id: _auctionId },
      { $set: { status: "completed" } },
    );

    return result.modifiedCount > 0;
  }

  // Auto-end expired auctions
  async autoEndExpiredAuctions(): Promise<number> {
    const now = new Date();

    const result = await this.collection.updateMany(
      {
        status: "ongoing",
        endTime: { $lte: now },
      },
      { $set: { status: "completed" } },
    );

    return result.modifiedCount;
  }

  // Get auctions ending soon
  async getAuctionsEndingSoon(
    hoursThreshold = 24,
    limit = 10,
  ): Promise<Auction[]> {
    const now = new Date();
    const thresholdDate = new Date(
      now.getTime() + hoursThreshold * 60 * 60 * 1000,
    );

    return this.collection
      .find({
        status: "ongoing",
        endTime: {
          $gt: now,
          $lte: thresholdDate,
        },
      })
      .sort({ endTime: 1 })
      .limit(limit)
      .toArray();
  }

  // Get auction count by artist
  async getAuctionCountByArtist(artistId: string | ObjectId): Promise<number> {
    const _artistId =
      typeof artistId === "string" ? new ObjectId(artistId) : artistId;
    return this.collection.countDocuments({ artistId: _artistId });
  }

  // Factory method to create an AuctionModel instance
  static async getInstance(): Promise<AuctionModel> {
    const db = await Database.getInstance();
    return new AuctionModel(db.auctions);
  }
}
