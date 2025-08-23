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

export async function GET() {
  try {
    // Initialize database connection
    const db = await Database.getInstance();

    // Clear existing data
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

    // Seed Indian Artforms (8 entries)
    const artforms = [
      {
        name: "Warli Painting",
        state: "Maharashtra",
        history:
          "Warli painting is a traditional art form that originated from the Warli tribe in Maharashtra. These paintings use basic geometric shapes like circles, triangles, and squares to depict daily life, festivals, and nature.",
      },
      {
        name: "Madhubani Painting",
        state: "Bihar",
        history:
          "Madhubani or Mithila painting originated in the Mithila region of Bihar. This art form is characterized by eye-catching geometrical patterns and vibrant colors.",
      },
      {
        name: "Pithora Painting",
        state: "Gujarat",
        history:
          "Pithora painting is a ritualistic art form practiced by the Rathwa, Bhil, and Nayak tribes of Gujarat. These paintings are created on walls during ceremonies.",
      },
      {
        name: "Patachitra",
        state: "Odisha",
        history:
          "Patachitra is a traditional cloth-based scroll painting from Odisha, known for its intricate details and mythological narratives.",
      },
      {
        name: "Kalamkari",
        state: "Andhra Pradesh",
        history:
          "Kalamkari is a type of hand-painted or block-printed cotton textile from Andhra Pradesh featuring intricate patterns depicting mythological scenes.",
      },
      {
        name: "Rajasthani Miniature",
        state: "Rajasthan",
        history:
          "Rajasthani Miniature paintings are known for their intricate brushwork and vibrant colors, often depicting royal courts, festivals, and Krishna legends.",
      },
      {
        name: "Tanjore Painting",
        state: "Tamil Nadu",
        history:
          "Tanjore paintings are characterized by rich colors, dense composition, and use of gold foil, typically depicting Hindu gods and goddesses.",
      },
      {
        name: "Gond Art",
        state: "Madhya Pradesh",
        history:
          "Gond art is a tribal painting style featuring intricate patterns and vibrant colors, often depicting flora, fauna, and mythological stories.",
      },
    ];

    const createdArtforms = [];
    for (const artformData of artforms) {
      const artform = await artformModel.createArtform(artformData);
      createdArtforms.push(artform);
    }

    // Seed Users (10 entries - 8 artists, 2 collectors)
    const users = [
      // Artists
      {
        clerkId: "artist_warli_1",
        role: "artist" as const,
        name: "Rajesh Warli",
        email: "rajesh.warli@example.com",
        bio: "Third-generation Warli artist preserving traditional techniques while incorporating contemporary themes.",
        state: "Maharashtra",
        profilePic:
          "https://unsplash.com/photos/a-man-in-a-yellow-shirt-standing-next-to-a-tree-5mGNU_QNsp4",
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
        bio: "Madhubani artist with 15 years of experience. Specializes in depicting goddess Durga and nature themes.",
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
        bio: "Pithora artist and tribal elder from Gujarat dedicated to preserving sacred traditions.",
        state: "Gujarat",
        profilePic:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        achievements: ["Tribal Heritage Preservation Award 2022"],
      },
      {
        clerkId: "artist_kalamkari_1",
        role: "artist" as const,
        name: "Suresh Kalamkari",
        email: "suresh.kalamkari@example.com",
        bio: "Master Kalamkari artist specializing in intricate mythological narratives and natural dye techniques.",
        state: "Andhra Pradesh",
        profilePic:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        achievements: ["National Handicrafts Award 2021"],
      },
      {
        clerkId: "artist_rajasthani_1",
        role: "artist" as const,
        name: "Lakshmi Kumari",
        email: "lakshmi.rajasthani@example.com",
        bio: "Rajasthani miniature painter known for exquisite details and vibrant color palettes.",
        state: "Rajasthan",
        profilePic:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
        achievements: ["Rajasthan State Art Award 2020"],
      },
      {
        clerkId: "artist_tanjore_1",
        role: "artist" as const,
        name: "Krishna Iyer",
        email: "krishna.tanjore@example.com",
        bio: "Tanjore painting specialist with expertise in gold foil work and traditional iconography.",
        state: "Tamil Nadu",
        profilePic:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        achievements: ["Tanjore Art Excellence Award 2019"],
      },
      {
        clerkId: "artist_gond_1",
        role: "artist" as const,
        name: "Maya Gond",
        email: "maya.gond@example.com",
        bio: "Contemporary Gond artist blending traditional patterns with modern themes.",
        state: "Madhya Pradesh",
        profilePic:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        achievements: ["Tribal Art Innovation Award 2021"],
      },
      {
        clerkId: "artist_patachitra_1",
        role: "artist" as const,
        name: "Biswajit Patra",
        email: "biswajit.patachitra@example.com",
        bio: "Patachitra scroll painter preserving ancient Odisha storytelling traditions.",
        state: "Odisha",
        profilePic:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
        achievements: ["Odisha Heritage Art Award 2020"],
      },

      // Collectors
      {
        clerkId: "collector_1",
        role: "student" as const,
        name: "Amit Sharma",
        email: "amit.collector@example.com",
        bio: "Art collector and enthusiast specializing in traditional Indian folk art.",
        state: "Delhi",
        profilePic:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
        achievements: [],
      },
      {
        clerkId: "collector_2",
        role: "student" as const,
        name: "Priya Patel",
        email: "priya.collector@example.com",
        bio: "Art investor and gallery owner promoting indigenous Indian art forms.",
        state: "Maharashtra",
        profilePic:
          "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400",
        achievements: [],
      },
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = await userModel.createUser(userData);
      createdUsers.push(user);
    }

    // Add artists to their respective artforms
    const artistArtformMap = [
      { artistIndex: 0, artformIndex: 0 }, // Rajesh Warli -> Warli
      { artistIndex: 1, artformIndex: 1 }, // Priya Devi -> Madhubani
      { artistIndex: 2, artformIndex: 2 }, // Ramesh Rathwa -> Pithora
      { artistIndex: 3, artformIndex: 4 }, // Suresh Kalamkari -> Kalamkari
      { artistIndex: 4, artformIndex: 5 }, // Lakshmi Kumari -> Rajasthani
      { artistIndex: 5, artformIndex: 6 }, // Krishna Iyer -> Tanjore
      { artistIndex: 6, artformIndex: 7 }, // Maya Gond -> Gond
      { artistIndex: 7, artformIndex: 3 }, // Biswajit Patra -> Patachitra
    ];

    for (const mapping of artistArtformMap) {
      await artformModel.addArtistToArtform(
        createdArtforms[mapping.artformIndex]._id!,
        createdUsers[mapping.artistIndex]._id!,
      );
    }

    // Seed Artworks (12 entries)
    const artworks = [
      {
        artistId: createdUsers[0]._id!,
        artformId: createdArtforms[0]._id!,
        title: "Warli Harvest Festival",
        description:
          "Traditional Warli painting depicting the harvest festival with dancing figures and nature elements",
        finalImageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX56RVl1wd5FCMzAJV4Hs2Z3jpADIywAbev_Esn5MP9AO_skp6wHFq9ySGUiO0eJJh-bA&usqp=CAU",
        price: 25000,
        forSale: true,
        isAuction: false,
      },
      {
        artistId: createdUsers[1]._id!,
        artformId: createdArtforms[1]._id!,
        title: "Goddess Durga Madhubani",
        description:
          "Vibrant Madhubani painting of Goddess Durga with intricate patterns and traditional motifs",
        finalImageUrl:
          "https://media.istockphoto.com/id/612007378/vector/goddess-durga-for-happy-dussehra.jpg?s=612x612&w=0&k=20&c=VnaKddfSJ9dxSCRvl6q-pML7kkB20Y48jMPMmAXRvJk=",
        price: 35000,
        forSale: true,
        isAuction: true,
      },
      {
        artistId: createdUsers[2]._id!,
        artformId: createdArtforms[2]._id!,
        title: "Pithora Ceremonial Horses",
        description:
          "Sacred Pithora painting featuring ceremonial horses and tribal deities",
        finalImageUrl:
          "https://shop.gaatha.com/image/catalog/Chanchal-Soni/6-phad-painting1cc.jpg",
        price: 45000,
        forSale: true,
        isAuction: false,
      },
      {
        artistId: createdUsers[3]._id!,
        artformId: createdArtforms[4]._id!,
        title: "Krishna Leela Kalamkari",
        description:
          "Detailed Kalamkari depicting scenes from Krishna's life using natural dyes",
        finalImageUrl:
          "https://www.utsavpedia.com/wp-content/uploads/2014/06/kalamkari.jpg",
        price: 38000,
        forSale: true,
        isAuction: false,
      },
      {
        artistId: createdUsers[4]._id!,
        artformId: createdArtforms[5]._id!,
        title: "Royal Court Miniature",
        description:
          "Rajasthani miniature painting showing a royal court scene with intricate details",
        finalImageUrl:
          "https://media.istockphoto.com/id/1280344990/photo/ancient-miniature-wall-painting-of-patwon-ki-haveli-in-jaisalmer-india.jpg?s=612x612&w=0&k=20&c=YLHKt_GYySpl31bJwf78abQdFigPQf8BtdMFaViUpiI=",
        price: 42000,
        forSale: true,
        isAuction: true,
      },
      {
        artistId: createdUsers[5]._id!,
        artformId: createdArtforms[6]._id!,
        title: "Golden Ganesha Tanjore",
        description:
          "Tanjore painting of Lord Ganesha with gold foil and precious stone work",
        finalImageUrl:
          "https://5.imimg.com/data5/MG/PN/MY-35471767/ganesha-tanjore-painting-500x500.jpg",
        price: 55000,
        forSale: true,
        isAuction: false,
      },
      {
        artistId: createdUsers[6]._id!,
        artformId: createdArtforms[7]._id!,
        title: "Forest Spirits Gond",
        description:
          "Contemporary Gond art depicting forest spirits and wildlife in traditional patterns",
        finalImageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo-I3u0HsNgcEkzN5N5h-N1qfIdgesfpm9Bg&s",
        price: 32000,
        forSale: true,
        isAuction: false,
      },
      {
        artistId: createdUsers[7]._id!,
        artformId: createdArtforms[3]._id!,
        title: "Jagannath Patachitra Scroll",
        description:
          "Traditional Patachitra scroll depicting Lord Jagannath's journey",
        finalImageUrl:
          "https://www.indianvillez.com/cdn/shop/files/13be3672-943e-4825-b29d-6e3d703a8a54.jpg?v=1710592498",
        price: 48000,
        forSale: true,
        isAuction: true,
      },
      {
        artistId: createdUsers[0]._id!,
        artformId: createdArtforms[0]._id!,
        title: "Warli Wedding Celebration",
        description:
          "Traditional Warli painting showing wedding rituals and celebrations",
        finalImageUrl: "https://i.ytimg.com/vi/siQiGNzP-Bg/maxresdefault.jpg",
        price: 28000,
        forSale: true,
        isAuction: false,
      },
      {
        artistId: createdUsers[1]._id!,
        artformId: createdArtforms[1]._id!,
        title: "Madhubani Peacock Dance",
        description: "Colorful Madhubani painting of peacocks dancing in rain",
        finalImageUrl:
          "https://www.memeraki.com/cdn/shop/files/AD150.2_800x.png?v=1700807830",
        price: 32000,
        forSale: true,
        isAuction: false,
      },
      {
        artistId: createdUsers[3]._id!,
        artformId: createdArtforms[4]._id!,
        title: "Kalamkari Tree of Life",
        description:
          "Traditional Kalamkari depicting the tree of life with mythological creatures",
        finalImageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVWiqG_Q3rNLFkk828nNCbkfkWVup9Rg6Khw&s",
        price: 41000,
        forSale: true,
        isAuction: false,
      },
      {
        artistId: createdUsers[4]._id!,
        artformId: createdArtforms[5]._id!,
        title: "Miniature Krishna Rasleela",
        description: "Rajasthani miniature showing Krishna's dance with gopis",
        finalImageUrl:
          "http://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5NTErMDc2sPmUMc1U4L2x6FA6wKi8C8sdFw&s",
        price: 46000,
        forSale: true,
        isAuction: true,
      },
    ];

    const createdArtworks = [];
    for (const artworkData of artworks) {
      const artwork = await artworkModel.createArtwork(artworkData);
      createdArtworks.push(artwork);
    }

    // Seed Posts (10 entries)
    const posts = [
      {
        artworkId: createdArtworks[0]._id!,
        artistId: createdUsers[0]._id!,
        mediaType: "image" as const,
        mediaUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX56RVl1wd5FCMzAJV4Hs2Z3jpADIywAbev_Esn5MP9AO_skp6wHFq9ySGUiO0eJJh-bA&usqp=CAU",
        caption:
          "Just completed this Warli harvest scene! Used traditional natural colors and techniques passed down through generations. #WarliArt #TraditionalIndianArt",
      },
      {
        artworkId: createdArtworks[1]._id!,
        artistId: createdUsers[1]._id!,
        mediaType: "image" as const,
        mediaUrl:
          "https://media.istockphoto.com/id/612007378/vector/goddess-durga-for-happy-dussehra.jpg?s=612x612&w=0&k=20&c=VnaKddfSJ9dxSCRvl6q-pML7kkB20Y48jMPMmAXRvJk=",
        caption:
          "New Madhubani piece featuring Goddess Durga. Took 3 weeks to complete with all the intricate details. #Madhubani #IndianFolkArt",
      },
      {
        artworkId: createdArtworks[2]._id!,
        artistId: createdUsers[2]._id!,
        mediaType: "image" as const,
        mediaUrl:
          "https://shop.gaatha.com/image/catalog/Chanchal-Soni/6-phad-painting1cc.jpg",
        caption:
          "Sacred Pithora painting completed for upcoming tribal ceremony. Blessed to continue this ancient tradition. #Pithora #TribalArt",
      },
      {
        artworkId: createdArtworks[3]._id!,
        artistId: createdUsers[3]._id!,
        mediaType: "image" as const,
        mediaUrl:
          "https://www.utsavpedia.com/wp-content/uploads/2014/06/kalamkari.jpg",
        caption:
          "Kalamkari piece showing Krishna's childhood stories. Used only natural dyes as per tradition. #Kalamkari #NaturalDyes",
      },
      {
        artworkId: createdArtworks[4]._id!,
        artistId: createdUsers[4]._id!,
        mediaType: "image" as const,
        mediaUrl:
          "https://media.istockphoto.com/id/1280344990/photo/ancient-miniature-wall-painting-of-patwon-ki-haveli-in-jaisalmer-india.jpg?s=612x612&w=0&k=20&c=YLHKt_GYySpl31bJwf78abQdFigPQf8BtdMFaViUpiI=",
        caption:
          "Miniature painting of royal court life. Each figure took hours of detailed work! #RajasthaniMiniature #FineArt",
      },
      {
        artworkId: createdArtworks[5]._id!,
        artistId: createdUsers[5]._id!,
        mediaType: "video" as const,
        mediaUrl:
          "https://5.imimg.com/data5/MG/PN/MY-35471767/ganesha-tanjore-painting-500x500.jpg",
        caption:
          "Time-lapse of creating a Tanjore painting with gold foil work. So satisfying to see it come together! #Tanjore #GoldFoil",
      },
      {
        artworkId: createdArtworks[6]._id!,
        artistId: createdUsers[6]._id!,
        mediaType: "image" as const,
        mediaUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo-I3u0HsNgcEkzN5N5h-N1qfIdgesfpm9Bg&s",
        caption:
          "New Gond artwork exploring the relationship between forest spirits and modern life. #GondArt #ContemporaryTribal",
      },
      {
        artworkId: createdArtworks[7]._id!,
        artistId: createdUsers[7]._id!,
        mediaType: "image" as const,
        mediaUrl:
          "https://www.indianvillez.com/cdn/shop/files/13be3672-943e-4825-b29d-6e3d703a8a54.jpg?v=1710592498",
        caption:
          "Patachitra scroll telling the story of Lord Jagannath. Scroll painting is such a meditative process. #Patachitra #ScrollArt",
      },
      {
        artworkId: createdArtworks[8]._id!,
        artistId: createdUsers[0]._id!,
        mediaType: "image" as const,
        mediaUrl: "https://i.ytimg.com/vi/siQiGNzP-Bg/maxresdefault.jpg",
        caption:
          "Warli wedding scene commission completed! Love depicting traditional ceremonies. #Warli #TraditionalWedding",
      },
      {
        artworkId: createdArtworks[9]._id!,
        artistId: createdUsers[1]._id!,
        mediaType: "image" as const,
        mediaUrl:
          "https://www.memeraki.com/cdn/shop/files/AD150.2_800x.png?v=1700807830",
        caption:
          "Peacocks dancing in rain - a classic Madhubani theme with my personal style. #Madhubani #PeacockArt",
      },
    ];

    const createdPosts = [];
    for (const postData of posts) {
      const post = await postModel.createPost(postData);
      createdPosts.push(post);
    }

    // Seed Auctions (6 entries)
    const auctions = [
      {
        artworkId: createdArtworks[1]._id!,
        artistId: createdUsers[1]._id!,
        startPrice: 30000,
        currentBid: 32000,
        currentBidder: createdUsers[8]._id!, // Collector 1
        bids: [
          {
            userId: createdUsers[8]._id!,
            amount: 32000,
            time: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            userId: createdUsers[9]._id!,
            amount: 31000,
            time: new Date(Date.now() - 3 * 60 * 60 * 1000),
          },
        ],
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "ongoing" as const,
      },
      {
        artworkId: createdArtworks[4]._id!,
        artistId: createdUsers[4]._id!,
        startPrice: 40000,
        currentBid: 43000,
        currentBidder: createdUsers[9]._id!, // Collector 2
        bids: [
          {
            userId: createdUsers[9]._id!,
            amount: 43000,
            time: new Date(Date.now() - 1 * 60 * 60 * 1000),
          },
          {
            userId: createdUsers[8]._id!,
            amount: 42000,
            time: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
        ],
        startTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 36 * 60 * 60 * 1000),
        status: "ongoing" as const,
      },
      {
        artworkId: createdArtworks[7]._id!,
        artistId: createdUsers[7]._id!,
        startPrice: 45000,
        currentBid: 48000,
        currentBidder: createdUsers[8]._id!, // Collector 1
        bids: [
          {
            userId: createdUsers[8]._id!,
            amount: 48000,
            time: new Date(Date.now() - 4 * 60 * 60 * 1000),
          },
          {
            userId: createdUsers[9]._id!,
            amount: 47000,
            time: new Date(Date.now() - 5 * 60 * 60 * 1000),
          },
        ],
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "ongoing" as const,
      },
      {
        artworkId: createdArtworks[11]._id!,
        artistId: createdUsers[4]._id!,
        startPrice: 44000,
        currentBid: 46000,
        currentBidder: createdUsers[9]._id!, // Collector 2
        bids: [
          {
            userId: createdUsers[9]._id!,
            amount: 46000,
            time: new Date(Date.now() - 3 * 60 * 60 * 1000),
          },
          {
            userId: createdUsers[8]._id!,
            amount: 45000,
            time: new Date(Date.now() - 4 * 60 * 60 * 1000),
          },
        ],
        startTime: new Date(Date.now() - 18 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 30 * 60 * 60 * 1000),
        status: "ongoing" as const,
      },
      {
        artworkId: createdArtworks[5]._id!,
        artistId: createdUsers[5]._id!,
        startPrice: 52000,
        currentBid: 55000,
        currentBidder: createdUsers[8]._id!, // Collector 1
        bids: [
          {
            userId: createdUsers[8]._id!,
            amount: 55000,
            time: new Date(Date.now() - 6 * 60 * 60 * 1000),
          },
        ],
        startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 66 * 60 * 60 * 1000),
        status: "ongoing" as const,
      },
      {
        artworkId: createdArtworks[2]._id!,
        artistId: createdUsers[2]._id!,
        startPrice: 42000,
        currentBid: 45000,
        currentBidder: createdUsers[9]._id!, // Collector 2
        bids: [
          {
            userId: createdUsers[9]._id!,
            amount: 45000,
            time: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            userId: createdUsers[8]._id!,
            amount: 43000,
            time: new Date(Date.now() - 3 * 60 * 60 * 1000),
          },
        ],
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: "ongoing" as const,
      },
    ];

    const createdAuctions = [];
    for (const auctionData of auctions) {
      const auction = await auctionModel.createAuction(auctionData);
      createdAuctions.push(auction);
      await artworkModel.markAsInAuction(auctionData.artworkId, auction._id!);
    }

    // Seed Courses (8 entries)
    const courses = [
      {
        artistId: createdUsers[0]._id!,
        title: "Warli Painting for Beginners",
        description:
          "Learn the basics of Warli painting including traditional motifs, techniques, and natural color preparation",
        price: 2999,
        content: [
          {
            type: "video" as const,
            url: "https://www.bing.com/videos/riverview/relatedvideo?q=warli+art+form+youtube+shorts&mid=2CD50A7A1B95485F73952CD50A7A1B95485F7395&mmscn=stvo&FORM=VIRE",
          },
          {
            type: "pdf" as const,
            url: "https://www.dsource.in/sites/default/files/resource/documentation-warli-art/downloads/file/documentation-warli-art.pdf",
          },
        ],
      },
      {
        artistId: createdUsers[1]._id!,
        title: "Advanced Madhubani Techniques",
        description:
          "Master complex Madhubani patterns and learn professional finishing techniques",
        price: 4999,
        content: [
          {
            type: "video" as const,
            url: "https://www.bing.com/videos/riverview/relatedvideo?q=advanced%20madhubani%20techniques%20vedio%20youtube%20shorts%20video&mid=FF8208675CC72294578EFF8208675CC72294578E&ajaxhist=0",
          },
          {
            type: "pdf" as const,
            url: "https://ijamsr.com/issues/6_Volume%205_Issue%206/20240810_054321_Dr.%20Rajan%20Taneja%202022.pdf",
          },
        ],
      },
      {
        artistId: createdUsers[2]._id!,
        title: "Pithora Ritual Painting",
        description:
          "Learn sacred Pithora painting techniques and their cultural significance",
        price: 3999,
        content: [
          {
            type: "video" as const,
            url: "https://www.bing.com/videos/riverview/relatedvideo?q=Pithora+Ritual+Painting+youtube+shorts&&mid=FBB16D50FA8077F98A28FBB16D50FA8077F98A28&&mmscn=stvo&FORM=VRDGAR",
          },
          {
            type: "pdf" as const,
            url: "https://nios.ac.in/media/documents/244_Folk_art/Folk_Art_Practical_L-4.pdf",
          },
        ],
      },
      {
        artistId: createdUsers[3]._id!,
        title: "Kalamkari Natural Dye Masterclass",
        description:
          "Comprehensive course on Kalamkari techniques and natural dye preparation",
        price: 5999,
        content: [
          {
            type: "video" as const,
            url: "https://www.bing.com/videos/riverview/relatedvideo?q=%22Kalamkari+Natural+Dye+Masterclass%22+youtube+shorts+&mid=5A89BEB92D9E4C5919745A89BEB92D9E4C591974&mmscn=stvo&FORM=VIRE",
          },
          {
            type: "pdf" as const,
            url: "https://chitrolekha.com/V5/n2/08_Kalamkari.pdf",
          },
        ],
      },
      {
        artistId: createdUsers[4]._id!,
        title: "Rajasthani Miniature Fundamentals",
        description:
          "Learn the art of Rajasthani miniature painting with focus on detail and color",
        price: 4499,
        content: [
          {
            type: "video" as const,
            url: "https://www.bing.com/videos/riverview/relatedvideo?q=rajasthani++miniature+painting+youtube+shorts&mid=067946001C40401FC308067946001C40401FC308&mmscn=stvo&FORM=VCGVRP",
          },
          {
            type: "pdf" as const,
            url: "https://www.scribd.com/document/668807870/02-The-Rajasthani-school-of-Miniature-Painting",
          },
        ],
      },
      {
        artistId: createdUsers[5]._id!,
        title: "Tanjore Gold Foil Workshop",
        description:
          "Master the technique of gold foil application in Tanjore paintings",
        price: 6999,
        content: [
          {
            type: "video" as const,
            url: "https://www.bing.com/videos/riverview/relatedvideo?q=Tanjore+Gold+Foil+Workshop+youtube+shorts+vedio&mid=F824C2C44A57A3F66C82F824C2C44A57A3F66C82&mmscn=stvo&FORM=VIRE",
          },
          {
            type: "pdf" as const,
            url: "https://www.exoticindiaart.com/blog/the-legacy-of-an-ancient-art-tanjore-paintings/",
          },
        ],
      },
      {
        artistId: createdUsers[6]._id!,
        title: "Contemporary Gond Art",
        description:
          "Blend traditional Gond patterns with modern themes and styles",
        price: 3499,
        content: [
          {
            type: "video" as const,
            url: "https://www.bing.com/videos/riverview/relatedvideo?q=Contemporary+Gond+Art+youtube+shorts&mid=CD340E01A462A657CEAECD340E01A462A657CEAE&mmscn=stvo&FORM=VIRE",
          },
          {
            type: "pdf" as const,
            url: "https://pdfs.semanticscholar.org/d907/9dfd5ffdbc1a2d18aac64989165be592993c.pdf",
          },
        ],
      },
      {
        artistId: createdUsers[7]._id!,
        title: "Patachitra Scroll Storytelling",
        description:
          "Learn to create narrative scroll paintings in the Patachitra tradition",
        price: 4999,
        content: [
          {
            type: "video" as const,
            url: "https://www.bing.com/videos/riverview/relatedvideo?q=patachitra+scroll+storytelling+youtube+short+video&mid=FD673333510846B3CB62FD673333510846B3CB62&mmscn=stvo&FORM=VIRE",
          },
          {
            type: "pdf" as const,
            url: "https://www.ijssr.com/wp-content/uploads/journal/published_paper/volume-2/issue-3/IJSSR30438.pdf",
          },
        ],
      },
    ];

    const createdCourses = [];
    for (const courseData of courses) {
      const course = await courseModel.createCourse(courseData);
      createdCourses.push(course);
    }

    // Seed Colleges (6 entries)
    const colleges = [
      {
        name: "National Institute of Folk and Traditional Arts",
        location: "New Delhi",
        fees: 120000,
        duration: "4 years",
        reviews: [
          {
            userId: createdUsers[0]._id!,
            rating: 4,
            comment: "Excellent faculty and facilities for traditional arts",
            createdAt: new Date(),
          },
          {
            userId: createdUsers[3]._id!,
            rating: 5,
            comment: "Best place to learn authentic folk art techniques",
            createdAt: new Date(),
          },
        ],
      },
      {
        name: "Maharashtra Tribal Arts College",
        location: "Mumbai, Maharashtra",
        fees: 80000,
        duration: "3 years",
        reviews: [
          {
            userId: createdUsers[2]._id!,
            rating: 4,
            comment: "Great focus on tribal art preservation",
            createdAt: new Date(),
          },
        ],
      },
      {
        name: "Bihar School of Madhubani Arts",
        location: "Patna, Bihar",
        fees: 75000,
        duration: "3 years",
        reviews: [
          {
            userId: createdUsers[1]._id!,
            rating: 5,
            comment: "Authentic Madhubani training from masters",
            createdAt: new Date(),
          },
        ],
      },
      {
        name: "South Indian Traditional Arts Academy",
        location: "Chennai, Tamil Nadu",
        fees: 95000,
        duration: "4 years",
        reviews: [
          {
            userId: createdUsers[5]._id!,
            rating: 4,
            comment: "Excellent for Tanjore and other South Indian arts",
            createdAt: new Date(),
          },
        ],
      },
      {
        name: "Rajasthan Miniature Painting Institute",
        location: "Jaipur, Rajasthan",
        fees: 110000,
        duration: "4 years",
        reviews: [
          {
            userId: createdUsers[4]._id!,
            rating: 5,
            comment: "World-class miniature painting instruction",
            createdAt: new Date(),
          },
        ],
      },
      {
        name: "Eastern India Folk Arts University",
        location: "Kolkata, West Bengal",
        fees: 85000,
        duration: "3 years",
        reviews: [
          {
            userId: createdUsers[7]._id!,
            rating: 4,
            comment: "Great for Patachitra and Eastern art forms",
            createdAt: new Date(),
          },
        ],
      },
    ];

    const createdColleges = [];
    for (const collegeData of colleges) {
      const college = await collegeModel.createCollege(collegeData);
      createdColleges.push(college);
    }

    return NextResponse.json({
      message: "Database seeded successfully with expanded data!",
      counts: {
        users: createdUsers.length,
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
