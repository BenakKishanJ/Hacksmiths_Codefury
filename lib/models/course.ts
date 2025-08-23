import { Collection, ObjectId } from 'mongodb';
import { Database } from './database';
import { Course } from './types';

export class CourseModel {
  private collection: Collection<Course>;

  constructor(collection: Collection<Course>) {
    this.collection = collection;
  }

  // Create a new course
  async createCourse(courseData: Omit<Course, '_id' | 'studentsEnrolled' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    const now = new Date();
    const newCourse: Course = {
      ...courseData,
      studentsEnrolled: [],
      createdAt: now,
      updatedAt: now
    };

    const result = await this.collection.insertOne(newCourse);
    return { ...newCourse, _id: result.insertedId };
  }

  // Get course by ID
  async getCourseById(id: string | ObjectId): Promise<Course | null> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return this.collection.findOne({ _id });
  }

  // Get courses by artist ID
  async getCoursesByArtist(artistId: string | ObjectId, limit = 20, skip = 0): Promise<Course[]> {
    const _artistId = typeof artistId === 'string' ? new ObjectId(artistId) : artistId;
    return this.collection
      .find({ artistId: _artistId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get all courses
  async getAllCourses(limit = 20, skip = 0): Promise<Course[]> {
    return this.collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get free courses
  async getFreeCourses(limit = 20, skip = 0): Promise<Course[]> {
    return this.collection
      .find({ price: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get paid courses
  async getPaidCourses(limit = 20, skip = 0): Promise<Course[]> {
    return this.collection
      .find({ price: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Update course
  async updateCourse(id: string | ObjectId, updateData: Partial<Course>): Promise<boolean> {
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

  // Enroll student in course
  async enrollStudent(courseId: string | ObjectId, studentId: string | ObjectId): Promise<boolean> {
    const _courseId = typeof courseId === 'string' ? new ObjectId(courseId) : courseId;
    const _studentId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;

    const result = await this.collection.updateOne(
      { _id: _courseId },
      {
        $addToSet: { studentsEnrolled: _studentId },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  }

  // Unenroll student from course
  async unenrollStudent(courseId: string | ObjectId, studentId: string | ObjectId): Promise<boolean> {
    const _courseId = typeof courseId === 'string' ? new ObjectId(courseId) : courseId;
    const _studentId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;

    const result = await this.collection.updateOne(
      { _id: _courseId },
      {
        $pull: { studentsEnrolled: _studentId },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  }

  // Get courses enrolled by student
  async getCoursesEnrolledByStudent(studentId: string | ObjectId, limit = 20, skip = 0): Promise<Course[]> {
    const _studentId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    return this.collection
      .find({ studentsEnrolled: _studentId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get student count for a course
  async getStudentCount(courseId: string | ObjectId): Promise<number> {
    const _courseId = typeof courseId === 'string' ? new ObjectId(courseId) : courseId;
    const course = await this.collection.findOne({ _id: _courseId });
    return course?.studentsEnrolled.length || 0;
  }

  // Get course count by artist
  async getCourseCountByArtist(artistId: string | ObjectId): Promise<number> {
    const _artistId = typeof artistId === 'string' ? new ObjectId(artistId) : artistId;
    return this.collection.countDocuments({ artistId: _artistId });
  }

  // Factory method to create a CourseModel instance
  static async getInstance(): Promise<CourseModel> {
    const db = await Database.getInstance();
    return new CourseModel(db.courses);
  }
}
