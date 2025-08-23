// Export all database models
import { Database, getDatabase } from "./database";
import { UserModel } from "./user";
import { ArtformModel } from "./artform";
import { ArtworkModel } from "./artwork";
import { PostModel } from "./post";
import { AuctionModel } from "./auction";
import { CourseModel } from "./course";
import { CollegeModel } from "./college";

// Export types
export * from "./types";

// Export database classes
export {
  Database,
  getDatabase,
  UserModel,
  ArtformModel,
  ArtworkModel,
  PostModel,
  AuctionModel,
  CourseModel,
  CollegeModel,
};

// Helper function to get all model instances
export async function getModels() {
  return {
    user: await UserModel.getInstance(),
    artform: await ArtformModel.getInstance(),
    artwork: await ArtworkModel.getInstance(),
    post: await PostModel.getInstance(),
    auction: await AuctionModel.getInstance(),
    course: await CourseModel.getInstance(),
    college: await CollegeModel.getInstance(),
  };
}

// Default export of all models
const Models = {
  Database,
  getDatabase,
  UserModel,
  ArtformModel,
  ArtworkModel,
  PostModel,
  AuctionModel,
  CourseModel,
  CollegeModel,
  getModels,
};
export default Models;
