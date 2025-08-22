import { Collection, ObjectId } from 'mongodb';
import { Database } from './database';
import { College, CollegeReview } from './types';

export class CollegeModel {
  private collection: Collection<College>;

  constructor(collection: Collection<College>) {
    this.collection = collection;
  }

  // Create a new college
  async createCollege(collegeData: Omit<College, '_id' | 'reviews' | 'createdAt' | 'updatedAt'>): Promise<College> {
    const now = new Date();
    const newCollege: College = {
      ...collegeData,
      reviews: [],
      createdAt: now,
      updatedAt: now
    };

    const result = await this.collection.insertOne(newCollege);
    return { ...newCollege, _id: result.insertedId };
  }

  // Get college by ID
  async getCollegeById(id: string | ObjectId): Promise<College | null> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return this.collection.findOne({ _id });
  }

  // Get all colleges
  async getAllColleges(limit = 20, skip = 0): Promise<College[]> {
    return this.collection
      .find({})
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get colleges by location
  async getCollegesByLocation(location: string, limit = 20, skip = 0): Promise<College[]> {
    return this.collection
      .find({ location: { $regex: new RegExp(location, 'i') } })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get colleges by max fees
  async getCollegesByMaxFees(maxFees: number, limit = 20, skip = 0): Promise<College[]> {
    return this.collection
      .find({ fees: { $lte: maxFees } })
      .sort({ fees: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Update college
  async updateCollege(id: string | ObjectId, updateData: Partial<College>): Promise<boolean> {
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

  // Add review to college
  async addReview(collegeId: string | ObjectId, review: Omit<CollegeReview, 'createdAt'>): Promise<boolean> {
    const _collegeId = typeof collegeId === 'string' ? new ObjectId(collegeId) : collegeId;
    const newReview: CollegeReview = {
      ...review,
      createdAt: new Date()
    };

    // Check if the user already has a review for this college
    const existingReview = await this.collection.findOne({
      _id: _collegeId,
      'reviews.userId': review.userId
    });

    if (existingReview) {
      // Update existing review
      const result = await this.collection.updateOne(
        { _id: _collegeId, 'reviews.userId': review.userId },
        {
          $set: {
            'reviews.$.rating': review.rating,
            'reviews.$.comment': review.comment,
            'reviews.$.createdAt': newReview.createdAt,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount > 0;
    } else {
      // Add new review
      const result = await this.collection.updateOne(
        { _id: _collegeId },
        {
          $push: { reviews: newReview },
          $set: { updatedAt: new Date() }
        }
      );
      return result.modifiedCount > 0;
    }
  }

  // Delete review from college
  async deleteReview(collegeId: string | ObjectId, userId: string | ObjectId): Promise<boolean> {
    const _collegeId = typeof collegeId === 'string' ? new ObjectId(collegeId) : collegeId;
    const _userId = typeof userId === 'string' ? new ObjectId(userId) : userId;

    const result = await this.collection.updateOne(
      { _id: _collegeId },
      {
        $pull: { reviews: { userId: _userId } },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  }

  // Get average rating for a college
  async getAverageRating(collegeId: string | ObjectId): Promise<number> {
    const _collegeId = typeof collegeId === 'string' ? new ObjectId(collegeId) : collegeId;

    const college = await this.collection.findOne({ _id: _collegeId });

    if (!college || college.reviews.length === 0) {
      return 0;
    }

    const sum = college.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / college.reviews.length;
  }

  // Get colleges sorted by average rating
  async getCollegesByRating(limit = 20, skip = 0): Promise<College[]> {
    // Use MongoDB aggregation to calculate average ratings
    const colleges = await this.collection
      .aggregate([
        {
          $addFields: {
            averageRating: {
              $cond: [
                { $eq: [{ $size: '$reviews' }, 0] },
                0,
                { $avg: '$reviews.rating' }
              ]
            }
          }
        },
        { $sort: { averageRating: -1 } },
        { $skip: skip },
        { $limit: limit }
      ])
      .toArray();

    return colleges as College[];
  }

  // Get college count
  async getCollegeCount(): Promise<number> {
    return this.collection.countDocuments({});
  }

  // Factory method to create a CollegeModel instance
  static async getInstance(): Promise<CollegeModel> {
    const db = await Database.getInstance();
    return new CollegeModel(db.colleges);
  }
}
