import { Collection, ObjectId } from "mongodb";
import { Database } from "./database";
import { Artform } from "./types";

export class ArtformModel {
  private collection: Collection<Artform>;

  constructor(collection: Collection<Artform>) {
    this.collection = collection;
  }

  // Create a new artform
  async createArtform(
    artformData: Omit<Artform, "_id" | "createdAt" | "updatedAt" | "artists">,
  ): Promise<Artform> {
    const now = new Date();
    const newArtform: Artform = {
      ...artformData,
      artists: [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(newArtform);
    return { ...newArtform, _id: result.insertedId };
  }

  // Get artform by ID
  async getArtformById(id: string | ObjectId): Promise<Artform | null> {
    const _id = typeof id === "string" ? new ObjectId(id) : id;
    return this.collection.findOne({ _id });
  }

  // Get artform by name
  async getArtformByName(name: string): Promise<Artform | null> {
    return this.collection.findOne({ name });
  }

  // Get all artforms
  async getAllArtforms(limit = 20, skip = 0): Promise<Artform[]> {
    return this.collection
      .find({})
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get artforms by state
  async getArtformsByState(
    state: string,
    limit = 20,
    skip = 0,
  ): Promise<Artform[]> {
    return this.collection
      .find({ state })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Update artform
  async updateArtform(
    id: string | ObjectId,
    updateData: Partial<Artform>,
  ): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id;
    const result = await this.collection.updateOne(
      { _id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    );
    return result.modifiedCount > 0;
  }

  // Delete artform
  async deleteArtform(id: string | ObjectId): Promise<boolean> {
    const _id = typeof id === "string" ? new ObjectId(id) : id;
    const result = await this.collection.deleteOne({ _id });
    return result.deletedCount > 0;
  }

  // Add artist to artform
  async addArtistToArtform(
    artformId: string | ObjectId,
    artistId: string | ObjectId,
  ): Promise<boolean> {
    const _artformId =
      typeof artformId === "string" ? new ObjectId(artformId) : artformId;
    const _artistId =
      typeof artistId === "string" ? new ObjectId(artistId) : artistId;

    const result = await this.collection.updateOne(
      { _id: _artformId },
      {
        $addToSet: { artists: _artistId },
        $set: { updatedAt: new Date() },
      },
    );
    return result.modifiedCount > 0;
  }

  // Remove artist from artform
  async removeArtistFromArtform(
    artformId: string | ObjectId,
    artistId: string | ObjectId,
  ): Promise<boolean> {
    const _artformId =
      typeof artformId === "string" ? new ObjectId(artformId) : artformId;
    const _artistId =
      typeof artistId === "string" ? new ObjectId(artistId) : artistId;

    const result = await this.collection.updateOne(
      { _id: _artformId },
      {
        $pull: { artists: _artistId },
        $set: { updatedAt: new Date() },
      },
    );
    return result.modifiedCount > 0;
  }

  // Get artform count
  async getArtformCount(): Promise<number> {
    return this.collection.countDocuments({});
  }

  // Factory method to create an ArtformModel instance
  static async getInstance(): Promise<ArtformModel> {
    const db = await Database.getInstance();
    return new ArtformModel(db.artforms);
  }
}
