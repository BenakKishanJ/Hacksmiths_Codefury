// seed.ts
// Seed script for the Art & Culture web app (fits your current modules)

// import { ObjectId } from "mongodb";
import { Database } from "@/lib/models/database";
import type {
  User,
  Artform,
  Artwork,
  Post,
  Auction,
  Course,
  College,
  CollegeReview,
} from "@/lib/models/types";

const now = () => new Date();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000);
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
const daysFromNow = (d: number) =>
  new Date(Date.now() + d * 24 * 60 * 60 * 1000);

async function main() {
  const db = await Database.getInstance();

  // 1) Clear existing data (safe for hackathon/dev)
  await Promise.all([
    db.posts.deleteMany({}),
    db.auctions.deleteMany({}),
    db.courses.deleteMany({}),
    db.colleges.deleteMany({}),
    db.artworks.deleteMany({}),
    db.artforms.deleteMany({}),
    db.users.deleteMany({}),
  ]);

  // 2) Users
  const users: Omit<User, "_id">[] = [
    {
      clerkId: "artist_warli_1",
      role: "artist",
      name: "Sunita Patil",
      email: "sunita.warli@example.com",
      bio: "Traditional Warli artist from Palghar, Maharashtra.",
      state: "Maharashtra",
      profilePic: "/images/users/sunita.jpg",
      achievements: [
        "Featured at Kala Ghoda Arts Festival",
        "Folk Art Excellence Award 2023",
      ],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      clerkId: "artist_madhubani_1",
      role: "artist",
      name: "Rajiv Mishra",
      email: "rajiv.madhubani@example.com",
      bio: "Mithila/Madhubani painter using natural dyes.",
      state: "Bihar",
      profilePic: "/images/users/rajiv.jpg",
      achievements: ["Crafts Council Awardee", "Solo exhibition in Patna 2024"],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      clerkId: "artist_pithora_1",
      role: "artist",
      name: "Bhupendra Rathwa",
      email: "bhupendra.pithora@example.com",
      bio: "Rathwa community artist practicing ritual Pithora painting.",
      state: "Gujarat",
      profilePic: "/images/users/bhupendra.jpg",
      achievements: ["Tribal Art Residency 2022"],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      clerkId: "student_anjali",
      role: "student",
      name: "Anjali Sharma",
      email: "anjali@example.com",
      bio: "Design student exploring Indian folk arts.",
      state: "Karnataka",
      profilePic: "/images/users/anjali.jpg",
      achievements: [],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      clerkId: "student_aarav",
      role: "student",
      name: "Aarav Verma",
      email: "aarav@example.com",
      bio: "BFA aspirant, loves traditional motifs.",
      state: "Delhi",
      profilePic: "/images/users/aarav.jpg",
      achievements: [],
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  const usersResult = await db.users.insertMany(users);
  const [sunitaId, rajivId, bhupendraId, anjaliId, aaravId] = Object.values(
    usersResult.insertedIds,
  );

  // 3) Artforms
  const artforms: Omit<Artform, "_id">[] = [
    {
      name: "Warli",
      state: "Maharashtra",
      history:
        "Tribal art from Maharashtra using circles, triangles, and lines to depict village life and rituals.",
      artists: [sunitaId],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      name: "Madhubani",
      state: "Bihar",
      history:
        "Mithila region painting characterized by intricate patterns and natural pigments.",
      artists: [rajivId],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      name: "Pithora",
      state: "Gujarat",
      history:
        "Ritualistic painting by Rathwa community; horses and deities are common motifs.",
      artists: [bhupendraId],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      name: "Gond",
      state: "Madhya Pradesh",
      history:
        "Vivid patterns inspired by nature and folklore, traditionally done by Gondi people.",
      artists: [],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      name: "Kalamkari",
      state: "Andhra Pradesh",
      history:
        "Hand-painted and block-printed cotton textile art using natural dyes.",
      artists: [],
      createdAt: now(),
      updatedAt: now(),
    },
  ];
  const artformsRes = await db.artforms.insertMany(artforms);
  const warliId = artformsRes.insertedIds["0"];
  const madhubaniId = artformsRes.insertedIds["1"];
  const pithoraId = artformsRes.insertedIds["2"];

  // 4) Artworks (the “final” pieces)
  const artworks: Omit<Artwork, "_id">[] = [
    {
      artistId: sunitaId,
      artformId: warliId,
      title: "Village Harvest",
      description:
        "Warli depiction of harvest celebrations with tarpa dance and daily life.",
      finalImageUrl: "/images/artworks/warli_village_harvest.jpg",
      price: 3500,
      forSale: true,
      isAuction: false,
      auctionId: null,
      createdAt: hoursAgo(8),
      updatedAt: hoursAgo(1),
    },
    {
      artistId: rajivId,
      artformId: madhubaniId,
      title: "Monsoon Peacocks",
      description:
        "Madhubani painting of twin peacocks amidst monsoon flora patterns.",
      finalImageUrl: "/images/artworks/madhubani_monsoon_peacocks.jpg",
      price: 4200,
      forSale: true,
      isAuction: false,
      auctionId: null,
      createdAt: hoursAgo(10),
      updatedAt: hoursAgo(2),
    },
    {
      artistId: bhupendraId,
      artformId: pithoraId,
      title: "Seven Horses",
      description:
        "Ritual Pithora composition featuring seven horses and deities.",
      finalImageUrl: "/images/artworks/pithora_seven_horses.jpg",
      price: 0,
      forSale: false,
      isAuction: true,
      auctionId: null, // will fill after auction is created
      createdAt: daysAgo(1),
      updatedAt: hoursAgo(1),
    },
  ];
  const artworksRes = await db.artworks.insertMany(artworks);
  const warliArtworkId = artworksRes.insertedIds["0"];
  const madhubaniArtworkId = artworksRes.insertedIds["1"];
  const pithoraArtworkId = artworksRes.insertedIds["2"];

  // 5) Posts (timelines) — these drive the Home feed
  const posts: Omit<Post, "_id">[] = [
    // Warli timeline
    {
      artworkId: warliArtworkId,
      artistId: sunitaId,
      mediaType: "image",
      mediaUrl: "/images/posts/warli_sketch.jpg",
      caption: "Initial sketch with basic shapes ✍️",
      likes: [anjaliId],
      comments: [
        {
          userId: anjaliId,
          text: "Love the composition already!",
          createdAt: minutesAgo(90),
        },
      ],
      createdAt: hoursAgo(6),
    },
    {
      artworkId: warliArtworkId,
      artistId: sunitaId,
      mediaType: "image",
      mediaUrl: "/images/posts/warli_fill.jpg",
      caption: "Filling in figures and the tarpa dance circle.",
      likes: [aaravId],
      comments: [
        {
          userId: aaravId,
          text: "Lines look so clean!",
          createdAt: minutesAgo(70),
        },
      ],
      createdAt: hoursAgo(5),
    },
    {
      artworkId: warliArtworkId,
      artistId: sunitaId,
      mediaType: "image",
      mediaUrl: "/images/posts/warli_details.jpg",
      caption: "Final detailing done ✅",
      likes: [anjaliId, aaravId],
      comments: [],
      createdAt: hoursAgo(3),
    },

    // Madhubani timeline
    {
      artworkId: madhubaniArtworkId,
      artistId: rajivId,
      mediaType: "image",
      mediaUrl: "/images/posts/mithila_grid.jpg",
      caption: "Pencil grid and motif planning.",
      likes: [],
      comments: [],
      createdAt: hoursAgo(8),
    },
    {
      artworkId: madhubaniArtworkId,
      artistId: rajivId,
      mediaType: "video",
      mediaUrl: "/videos/posts/mithila_dyes.mp4",
      caption: "Mixing natural dyes from turmeric and indigo.",
      likes: [anjaliId],
      comments: [
        {
          userId: anjaliId,
          text: "Please share dye ratios!",
          createdAt: minutesAgo(110),
        },
      ],
      createdAt: hoursAgo(7),
    },
    {
      artworkId: madhubaniArtworkId,
      artistId: rajivId,
      mediaType: "image",
      mediaUrl: "/images/posts/mithila_fill.jpg",
      caption: "Filling peacock motifs and borders.",
      likes: [aaravId],
      comments: [],
      createdAt: hoursAgo(4),
    },

    // Pithora timeline
    {
      artworkId: pithoraArtworkId,
      artistId: bhupendraId,
      mediaType: "image",
      mediaUrl: "/images/posts/pithora_base.jpg",
      caption: "Wall prepped with base coat.",
      likes: [],
      comments: [],
      createdAt: daysAgo(1),
    },
    {
      artworkId: pithoraArtworkId,
      artistId: bhupendraId,
      mediaType: "image",
      mediaUrl: "/images/posts/pithora_outline.jpg",
      caption: "Outlines for seven horses in place.",
      likes: [anjaliId],
      comments: [
        {
          userId: anjaliId,
          text: "Dynamic movement 👌",
          createdAt: hoursAgo(20),
        },
      ],
      createdAt: hoursAgo(22),
    },
    {
      artworkId: pithoraArtworkId,
      artistId: bhupendraId,
      mediaType: "image",
      mediaUrl: "/images/posts/pithora_color.jpg",
      caption: "Color layers added, nearing completion!",
      likes: [aaravId],
      comments: [],
      createdAt: hoursAgo(18),
    },
  ];
  await db.posts.insertMany(posts);

  // 6) Courses
  const courses: Omit<Course, "_id">[] = [
    {
      artistId: sunitaId,
      title: "Warli Basics: Shapes to Story",
      description:
        "Learn Warli grammar of shapes and build a narrative composition.",
      price: 0,
      content: [
        { type: "video", url: "/videos/courses/warli_intro.mp4" },
        { type: "pdf", url: "/docs/warli_worksheet.pdf" },
      ],
      studentsEnrolled: [anjaliId],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      artistId: rajivId,
      title: "Madhubani Motifs & Natural Dyes",
      description:
        "Motifs, borders, and eco-friendly dye preparation from local materials.",
      price: 499,
      content: [
        { type: "video", url: "/videos/courses/madhubani_motifs.mp4" },
        { type: "text", url: "/notes/mithila_tips.txt" },
      ],
      studentsEnrolled: [aaravId],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      artistId: bhupendraId,
      title: "Pithora: Ritual & Process",
      description:
        "Context, iconography, and process of Pithora mural painting.",
      price: 699,
      content: [{ type: "video", url: "/videos/courses/pithora_process.mp4" }],
      studentsEnrolled: [],
      createdAt: now(),
      updatedAt: now(),
    },
  ];
  await db.courses.insertMany(courses);

  // 7) Colleges
  const colleges: Omit<College, "_id">[] = [
    {
      name: "Sir JJ School of Art",
      location: "Mumbai, Maharashtra",
      fees: 120000,
      duration: "BFA (4 years)",
      reviews: [
        {
          userId: anjaliId,
          rating: 5,
          comment: "Great exposure to traditional and contemporary practices.",
          createdAt: now(),
        } as CollegeReview,
      ],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      name: "Kala Bhavana, Visva-Bharati",
      location: "Santiniketan, West Bengal",
      fees: 95000,
      duration: "BFA (4 years)",
      reviews: [
        {
          userId: aaravId,
          rating: 4,
          comment: "Strong emphasis on Indian aesthetics and craft.",
          createdAt: now(),
        } as CollegeReview,
      ],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      name: "College of Fine Arts",
      location: "Bengaluru, Karnataka",
      fees: 80000,
      duration: "BFA (4 years)",
      reviews: [],
      createdAt: now(),
      updatedAt: now(),
    },
  ];
  await db.colleges.insertMany(colleges);

  // 8) Auction for the Pithora artwork
  const auction: Omit<Auction, "_id"> = {
    artworkId: pithoraArtworkId,
    artistId: bhupendraId,
    startPrice: 3000,
    currentBid: 3800,
    currentBidder: aaravId,
    bids: [
      { userId: anjaliId, amount: 3200, time: daysAgo(0.9) },
      { userId: aaravId, amount: 3800, time: hoursAgo(16) },
    ],
    startTime: daysAgo(1),
    endTime: daysFromNow(2),
    status: "ongoing",
    createdAt: now(),
  };
  const auctionRes = await db.auctions.insertOne(auction);

  // Link auctionId back to the artwork
  await db.artworks.updateOne(
    { _id: pithoraArtworkId },
    { $set: { auctionId: auctionRes.insertedId, updatedAt: now() } },
  );

  console.log("✅ Seed complete:");
  console.log({
    users: Object.keys(usersResult.insertedIds).length,
    artforms: Object.keys(artformsRes.insertedIds).length,
    artworks: Object.keys(artworksRes.insertedIds).length,
    posts: posts.length,
    courses: courses.length,
    colleges: colleges.length,
    auctions: 1,
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  });
