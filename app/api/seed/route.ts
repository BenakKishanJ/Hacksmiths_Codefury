// api/seed/route.ts
import { NextResponse } from "next/server";
import { Database } from "@/lib/models/database";
import { UserModel } from "@/lib/models/user";
import { ArtformModel } from "@/lib/models/artform";
import { ArtworkModel } from "@/lib/models/artwork";
import { PostModel } from "@/lib/models/post";
import { AuctionModel } from "@/lib/models/auction";
import { CourseModel } from "@/lib/models/course";
import { CollegeModel } from "@/lib/models/college";
// import { ObjectId } from "mongodb";

export async function GET() {
  try {
    // Initialize database connection
    const db = await Database.getInstance();

    // Clear existing data (optional - comment out if you want to keep existing data)
    await Promise.all([
      db.users.deleteMany({}),
      db.artforms.deleteMany({}),
      db.artworks.deleteMany({}),
      db.posts.deleteMany({}),
      db.auctions.deleteMany({}),
      db.courses.deleteMany({}),
      db.colleges.deleteMany({}),
    ]);

    // Get model instances
    const userModel = await UserModel.getInstance();
    const artformModel = await ArtformModel.getInstance();
    const artworkModel = await ArtworkModel.getInstance();
    const postModel = await PostModel.getInstance();
    const auctionModel = await AuctionModel.getInstance();
    const courseModel = await CourseModel.getInstance();
    const collegeModel = await CollegeModel.getInstance();

    // Seed Indian Artforms
    const artforms = [
      {
        name: "Warli Painting",
        state: "Maharashtra",
        history:
          "Warli painting is a traditional art form that originated from the Warli tribe in Maharashtra. These paintings use basic geometric shapes like circles, triangles, and squares to depict daily life, festivals, and nature. The paintings are typically done on mud walls using white pigment made from rice paste.",
      },
      {
        name: "Madhubani Painting",
        state: "Bihar",
        history:
          "Madhubani or Mithila painting originated in the Mithila region of Bihar. This art form is characterized by eye-catching geometrical patterns and vibrant colors. Traditionally created by women, these paintings depict Hindu deities, natural elements, and social events.",
      },
      {
        name: "Pithora Painting",
        state: "Gujarat",
        history:
          "Pithora painting is a ritualistic art form practiced by the Rathwa, Bhil, and Nayak tribes of Gujarat. These paintings are created on walls during ceremonies and depict horses, gods, and scenes from tribal mythology. The art form is considered sacred and is believed to bring prosperity.",
      },
      {
        name: "Patachitra",
        state: "Odisha",
        history:
          "Patachitra is a traditional cloth-based scroll painting from Odisha, known for its intricate details and mythological narratives. Artists use natural colors and depict stories from Hindu epics, particularly the Jagannath and Vaishnava cults.",
      },
      {
        name: "Kalamkari",
        state: "Andhra Pradesh",
        history:
          "Kalamkari is a type of hand-painted or block-printed cotton textile from Andhra Pradesh. The name derives from 'kalam' (pen) and 'kari' (work). This art form features intricate patterns depicting mythological scenes, flowers, and animals using natural dyes.",
      },
    ];

    const createdArtforms = [];
    for (const artformData of artforms) {
      const artform = await artformModel.createArtform(artformData);
      createdArtforms.push(artform);
    }

    // Seed Artists
    const artists = [
      {
        clerkId: "artist_warli_1",
        role: "artist" as const,
        name: "Rajesh Warli",
        email: "rajesh.warli@example.com",
        bio: "Third-generation Warli artist preserving traditional techniques while incorporating contemporary themes. Awarded National Merit for Tribal Arts 2020.",
        state: "Maharashtra",
        profilePic:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
        achievements: [
          "National Merit Award 2020",
          "State Art Excellence 2018",
        ],
      },
      {
        clerkId: "artist_madhubani_1",
        role: "artist" as const,
        name: "Priya Devi",
        email: "priya.madhubani@example.com",
        bio: "Madhubani artist with 15 years of experience. Specializes in depicting goddess Durga and nature themes. Conducts workshops internationally.",
        state: "Bihar",
        profilePic:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
        achievements: [
          "International Folk Art Award 2019",
          "Bihar State Artist of the Year 2021",
        ],
      },
      {
        clerkId: "artist_pithora_1",
        role: "artist" as const,
        name: "Ramesh Rathwa",
        email: "ramesh.pithora@example.com",
        bio: "Pithora artist and tribal elder from Gujarat. Dedicated to preserving the sacred traditions of Pithora painting and teaching younger generations.",
        state: "Gujarat",
        profilePic:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        achievements: ["Tribal Heritage Preservation Award 2022"],
      },
    ];

    const createdArtists = [];
    for (const artistData of artists) {
      const artist = await userModel.createUser(artistData);
      createdArtists.push(artist);

      // Add artists to their respective artforms
      if (artist.name.includes("Warli")) {
        await artformModel.addArtistToArtform(
          createdArtforms[0]._id!,
          artist._id!,
        );
      } else if (artist.name.includes("Madhubani")) {
        await artformModel.addArtistToArtform(
          createdArtforms[1]._id!,
          artist._id!,
        );
      } else if (artist.name.includes("Pithora")) {
        await artformModel.addArtistToArtform(
          createdArtforms[2]._id!,
          artist._id!,
        );
      }
    }

    // Seed Artworks
    const artworks = [
      {
        artistId: createdArtists[0]._id!,
        artformId: createdArtforms[0]._id!,
        title: "Warli Harvest Festival",
        description:
          "Traditional Warli painting depicting the harvest festival with dancing figures and nature elements",
        finalImageUrl:
          "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600",
        price: 25000,
        forSale: true,
        isAuction: false,
      },
      {
        artistId: createdArtists[1]._id!,
        artformId: createdArtforms[1]._id!,
        title: "Goddess Durga Madhubani",
        description:
          "Vibrant Madhubani painting of Goddess Durga with intricate patterns and traditional motifs",
        finalImageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
        price: 35000,
        forSale: true,
        isAuction: true,
      },
      {
        artistId: createdArtists[2]._id!,
        artformId: createdArtforms[2]._id!,
        title: "Pithora Ceremonial Horses",
        description:
          "Sacred Pithora painting featuring ceremonial horses and tribal deities",
        finalImageUrl:
          "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=600",
        price: 45000,
        forSale: true,
        isAuction: false,
      },
    ];

    const createdArtworks = [];
    for (const artworkData of artworks) {
      const artwork = await artworkModel.createArtwork(artworkData);
      createdArtworks.push(artwork);
    }

    // Seed Posts
    const posts = [
      {
        artworkId: createdArtworks[0]._id!,
        artistId: createdArtists[0]._id!,
        mediaType: "image" as const,
        mediaUrl:
          "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600",
        caption:
          "Just completed this Warli harvest scene! Used traditional natural colors and techniques passed down through generations. #WarliArt #TraditionalIndianArt",
      },
      {
        artworkId: createdArtworks[1]._id!,
        artistId: createdArtists[1]._id!,
        mediaType: "image" as const,
        mediaUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
        caption:
          "New Madhubani piece featuring Goddess Durga. Took 3 weeks to complete with all the intricate details. #Madhubani #IndianFolkArt",
      },
    ];

    const createdPosts = [];
    for (const postData of posts) {
      const post = await postModel.createPost(postData);
      createdPosts.push(post);
    }

    // Seed Auctions
    const auctions = [
      {
        artworkId: createdArtworks[1]._id!,
        artistId: createdArtists[1]._id!,
        startPrice: 30000,
        currentBid: 32000,
        currentBidder: createdArtists[0]._id!,
        bids: [
          {
            userId: createdArtists[0]._id!,
            amount: 32000,
            time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
          {
            userId: createdArtists[2]._id!,
            amount: 31000,
            time: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          },
        ],
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        status: "ongoing" as const,
      },
    ];

    const createdAuctions = [];
    for (const auctionData of auctions) {
      const auction = await auctionModel.createAuction(auctionData);
      createdAuctions.push(auction);

      // Mark artwork as in auction
      await artworkModel.markAsInAuction(auctionData.artworkId, auction._id!);
    }

    // Seed Courses
    const courses = [
      {
        artistId: createdArtists[0]._id!,
        title: "Warli Painting for Beginners",
        description:
          "Learn the basics of Warli painting including traditional motifs, techniques, and natural color preparation",
        price: 2999,
        content: [
          { type: "video" as const, url: "https://example.com/video1" },
          { type: "pdf" as const, url: "https://example.com/guide1" },
        ],
      },
      {
        artistId: createdArtists[1]._id!,
        title: "Advanced Madhubani Techniques",
        description:
          "Master complex Madhubani patterns and learn professional finishing techniques",
        price: 4999,
        content: [
          { type: "video" as const, url: "https://example.com/video2" },
          { type: "pdf" as const, url: "https://example.com/guide2" },
        ],
      },
    ];

    const createdCourses = [];
    for (const courseData of courses) {
      const course = await courseModel.createCourse(courseData);
      createdCourses.push(course);
    }

    // Seed Colleges
    const colleges = [
      {
        name: "National Institute of Folk and Traditional Arts",
        location: "New Delhi",
        fees: 120000,
        duration: "4 years",
        reviews: [
          {
            userId: createdArtists[0]._id!,
            rating: 4,
            comment: "Excellent faculty and facilities for traditional arts",
            createdAt: new Date(),
          },
        ],
      },
      {
        name: "Maharashtra Tribal Arts College",
        location: "Mumbai, Maharashtra",
        fees: 80000,
        duration: "3 years",
        reviews: [],
      },
    ];

    const createdColleges = [];
    for (const collegeData of colleges) {
      const college = await collegeModel.createCollege(collegeData);
      createdColleges.push(college);
    }

    return NextResponse.json({
      message: "Database seeded successfully!",
      counts: {
        users: createdArtists.length,
        artforms: createdArtforms.length,
        artworks: createdArtworks.length,
        posts: createdPosts.length,
        auctions: createdAuctions.length,
        courses: createdCourses.length,
        colleges: createdColleges.length,
      },
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET();
}
