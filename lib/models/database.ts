import { MongoClient, Db, Collection } from 'mongodb';
import clientPromise from '../mongodb';
import { User, Artform, Artwork, Post, Auction, Course, College } from './types';

// Define a class to handle database operations
export class Database {
  private static instance: Database;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  // Collections
  private _users: Collection<User> | null = null;
  private _artforms: Collection<Artform> | null = null;
  private _artworks: Collection<Artwork> | null = null;
  private _posts: Collection<Post> | null = null;
  private _auctions: Collection<Auction> | null = null;
  private _courses: Collection<Course> | null = null;
  private _colleges: Collection<College> | null = null;

  private constructor() {}

  // Singleton pattern
  public static async getInstance(): Promise<Database> {
    if (!Database.instance) {
      Database.instance = new Database();
      await Database.instance.initialize();
    }
    return Database.instance;
  }

  // Initialize the database connection
  private async initialize(): Promise<void> {
    try {
      this.client = await clientPromise;
      this.db = this.client.db(process.env.MONGODB_DB_NAME || 'artCulture');

      // Initialize collections
      this._users = this.db.collection<User>('users');
      this._artforms = this.db.collection<Artform>('artforms');
      this._artworks = this.db.collection<Artwork>('artworks');
      this._posts = this.db.collection<Post>('posts');
      this._auctions = this.db.collection<Auction>('auctions');
      this._courses = this.db.collection<Course>('courses');
      this._colleges = this.db.collection<College>('colleges');

      console.log('Database connection established');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  // Collection getters
  get users(): Collection<User> {
    if (!this._users) throw new Error('Users collection not initialized');
    return this._users;
  }

  get artforms(): Collection<Artform> {
    if (!this._artforms) throw new Error('Artforms collection not initialized');
    return this._artforms;
  }

  get artworks(): Collection<Artwork> {
    if (!this._artworks) throw new Error('Artworks collection not initialized');
    return this._artworks;
  }

  get posts(): Collection<Post> {
    if (!this._posts) throw new Error('Posts collection not initialized');
    return this._posts;
  }

  get auctions(): Collection<Auction> {
    if (!this._auctions) throw new Error('Auctions collection not initialized');
    return this._auctions;
  }

  get courses(): Collection<Course> {
    if (!this._courses) throw new Error('Courses collection not initialized');
    return this._courses;
  }

  get colleges(): Collection<College> {
    if (!this._colleges) throw new Error('Colleges collection not initialized');
    return this._colleges;
  }
}

// Helper function to get a database instance
export async function getDatabase(): Promise<Database> {
  return Database.getInstance();
}
