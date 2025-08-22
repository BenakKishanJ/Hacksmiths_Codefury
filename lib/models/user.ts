import { Collection, ObjectId } from 'mongodb';
import { Database } from './database';
import { User } from './types';

export class UserModel {
  private collection: Collection<User>;

  constructor(collection: Collection<User>) {
    this.collection = collection;
  }

  // Create a new user
  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const newUser: User = {
      ...userData,
      createdAt: now,
      updatedAt: now
    };

    const result = await this.collection.insertOne(newUser);
    return { ...newUser, _id: result.insertedId };
  }

  // Get user by Clerk ID
  async getUserByClerkId(clerkId: string): Promise<User | null> {
    return this.collection.findOne({ clerkId });
  }

  // Get user by MongoDB ObjectId
  async getUserById(id: string | ObjectId): Promise<User | null> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return this.collection.findOne({ _id });
  }

  // Update user
  async updateUser(id: string | ObjectId, updateData: Partial<User>): Promise<boolean> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await this.collection.updateOne(
      { _id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );
    return result.modifiedCount > 0;
  }

  // Get all artists
  async getArtists(limit = 20, skip = 0): Promise<User[]> {
    return this.collection
      .find({ role: 'artist' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get artists by state
  async getArtistsByState(state: string, limit = 20, skip = 0): Promise<User[]> {
    return this.collection
      .find({ role: 'artist', state })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get artist count
  async getArtistCount(): Promise<number> {
    return this.collection.countDocuments({ role: 'artist' });
  }

  // Factory method to create a UserModel instance
  static async getInstance(): Promise<UserModel> {
    const db = await Database.getInstance();
    return new UserModel(db.users);
  }
}
