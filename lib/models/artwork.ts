import { Collection, ObjectId, UpdateFilter } from "mongodb";
import { Database } from "./database";
import { Artwork } from "./types";

export class ArtworkModel {
  private collection: Collection<Artwork>;

  constructor(collection: Collection<Artwork>) {
    this.collection = collection;
  }

  // Create a new artwork
  async createArtwork(
    artworkData: Omit<Artwork, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Artwork> {
    const now = new Date();
    const newArtwork: Artwork = {
      ...artworkData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(newArtwork);
    return { ...newArtwork, _id: result.insertedId };
  }

  // Get artwork by ID
  async getArtworkById(id: string | ObjectId): Promise<Artwork | null> {
    const _id = typeof id === "string" ? new ObjectId(id) : id;
    return this.collection.findOne({ _id });
  }

  // Get artworks by artist ID
  async getArtworksByArtist(
    artistId: string | ObjectId,
    limit = 20,
    skip = 0,
  ): Promise<Artwork[]> {
    const _artistId =
      typeof artistId === "string" ? new ObjectId(artistId) : artistId;
    return this.collection
      .find({ artistId: _artistId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get artworks by artform ID
  async getArtworksByArtform(
    artformId: string | ObjectId,
    limit = 20,
    skip = 0,
  ): Promise<Artwork[]> {
    const _artformId =
      typeof artformId === "string" ? new ObjectId(artformId) : artformId;
    return this.collection
      .find({ artformId: _artformId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get all artworks for sale (not in auction)
  async getArtworksForSale(limit = 20, skip = 0): Promise<Artwork[]> {
    return this.collection
      .find({ forSale: true, isAuction: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get all artworks in auction
  async getArtworksInAuction(limit = 20, skip = 0): Promise<Artwork[]> {
    return this.collection
      .find({ isAuction: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Update artwork

  async updateArtwork(
    id: string | ObjectId,
    update: UpdateFilter<Artwork>,
  ): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id;
    const result = await this.collection.updateOne({ _id }, update);
    return result.modifiedCount > 0;
  }

  // Mark artwork as being in auction
  async markAsInAuction(
    id: string | ObjectId,
    auctionId: string | ObjectId,
  ): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id;
    const _auctionId =
      typeof auctionId === "string" ? new ObjectId(auctionId) : auctionId;

    const result = await this.collection.updateOne(
      { _id },
      {
        $set: {
          isAuction: true,
          auctionId: _auctionId,
          updatedAt: new Date(),
        },
      },
    );
    return result.modifiedCount > 0;
  }

  // Mark artwork as sold (no longer for sale or in auction)
  async markAsSold(id: string | ObjectId): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id;

    const result = await this.collection.updateOne(
      { _id },
      {
        $set: {
          forSale: false,
          isAuction: false,
          updatedAt: new Date(),
        },
        $unset: { auctionId: "" },
      },
    );
    return result.modifiedCount > 0;
  }

  // Get artwork count
  async getArtworkCount(): Promise<number> {
    return this.collection.countDocuments({});
  }

  // Get artwork count by artist
  async getArtworkCountByArtist(artistId: string | ObjectId): Promise<number> {
    const _artistId =
      typeof artistId === "string" ? new ObjectId(artistId) : artistId;
    return this.collection.countDocuments({ artistId: _artistId });
  }

  // Factory method to create an ArtworkModel instance
  static async getInstance(): Promise<ArtworkModel> {
    const db = await Database.getInstance();
    return new ArtworkModel(db.artworks);
  }

  async getArtworksPaginated(limit: number, skip: number) {
    return this.collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async deletePost(postId: ObjectId): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: postId });
    return result.deletedCount > 0;
  }

  async deleteAuction(auctionId: ObjectId): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: auctionId });
    return result.deletedCount > 0;
  }

  async deleteArtwork(artworkId: ObjectId): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: artworkId });
    return result.deletedCount > 0;
  }
}
