/**
 * Seeds the database with realistic demo data so the app is usable immediately
 * after setup: admin, organizers, judges, participants, hackathons at various
 * stages, teams, registrations, submissions, and reviews.
 *
 * Run with: npm run seed
 * Destroy with: npm run seed -- --destroy
 */
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const Registration = require("../models/Registration");
const Submission = require("../models/Submission");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");
const Bookmark = require("../models/Bookmark");

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const run = async () => {
  await connectDB();

  const destroy = process.argv.includes("--destroy");

  console.log("[Seeder] Clearing existing collections...");
  await Promise.all([
    User.deleteMany(),
    Hackathon.deleteMany(),
    Team.deleteMany(),
    Registration.deleteMany(),
    Submission.deleteMany(),
    Review.deleteMany(),
    Notification.deleteMany(),
    ActivityLog.deleteMany(),
    Bookmark.deleteMany(),
  ]);

  if (destroy) {
    console.log("[Seeder] All collections cleared. Exiting (destroy mode).");
    process.exit(0);
  }

  console.log("[Seeder] Creating users...");

  const commonPassword = "Password@123";

  const admin = await User.create({
    name: "Ava Sharma",
    email: "admin@hackforge.dev",
    password: commonPassword,
    role: "admin",
    isEmailVerified: true,
    bio: "Platform administrator overseeing HackForge operations.",
  });

  const organizer1 = await User.create({
    name: "Rohan Mehta",
    email: "organizer1@hackforge.dev",
    password: commonPassword,
    role: "organizer",
    isEmailVerified: true,
    bio: "Community lead running developer events across India.",
  });

  const organizer2 = await User.create({
    name: "Priya Nair",
    email: "organizer2@hackforge.dev",
    password: commonPassword,
    role: "organizer",
    isEmailVerified: true,
    bio: "Startup ecosystem builder and hackathon organizer.",
  });

  const judgeNames = [
    ["Dr. Kavita Rao", "judge1@hackforge.dev"],
    ["Arjun Verma", "judge2@hackforge.dev"],
    ["Neha Kapoor", "judge3@hackforge.dev"],
  ];
  const judges = await Promise.all(
    judgeNames.map(([name, email]) =>
      User.create({
        name,
        email,
        password: commonPassword,
        role: "judge",
        isEmailVerified: true,
        bio: `Senior engineer and hackathon judge specializing in product & technical evaluation.`,
      })
    )
  );

  const participantSeed = [
    ["Aditya Kumar", "aditya@hackforge.dev", "IIT Delhi", ["React", "Node.js", "MongoDB"]],
    ["Sneha Iyer", "sneha@hackforge.dev", "BITS Pilani", ["Python", "TensorFlow", "Flask"]],
    ["Karan Singh", "karan@hackforge.dev", "NIT Trichy", ["Java", "Spring Boot", "MySQL"]],
    ["Meera Joshi", "meera@hackforge.dev", "VIT Vellore", ["React", "TypeScript", "GraphQL"]],
    ["Vikram Patel", "vikram@hackforge.dev", "Delhi University", ["Flutter", "Firebase", "Dart"]],
    ["Ishita Gupta", "ishita@hackforge.dev", "IIIT Hyderabad", ["Go", "Docker", "Kubernetes"]],
    ["Rahul Desai", "rahul@hackforge.dev", "Pune University", ["Vue.js", "Node.js", "PostgreSQL"]],
    ["Ananya Reddy", "ananya@hackforge.dev", "Manipal Institute", ["React Native", "Redux", "AWS"]],
  ];
  const participants = await Promise.all(
    participantSeed.map(([name, email, college, skills]) =>
      User.create({
        name,
        email,
        password: commonPassword,
        role: "participant",
        college,
        skills,
        isEmailVerified: true,
        bio: `Full-stack developer and hackathon enthusiast from ${college}.`,
      })
    )
  );

  console.log("[Seeder] Creating hackathons...");

  const hackathon1 = await Hackathon.create({
    title: "HackForge Global Summit 2026",
    tagline: "Build the future of AI-powered applications in 48 hours",
    description:
      "A 48-hour hackathon bringing together developers, designers, and innovators to build AI-powered solutions for real-world problems. Open to students and early-career developers worldwide.",
    organizer: organizer1._id,
    mode: "hybrid",
    location: "Bengaluru, India + Online",
    themes: ["Artificial Intelligence", "Climate Tech", "FinTech"],
    category: "AI/ML",
    prizePool: 500000,
    prizeBreakdown: [
      { position: "1st Place", amount: 250000, description: "Winner takes the grand prize" },
      { position: "2nd Place", amount: 150000, description: "Runner-up prize" },
      { position: "3rd Place", amount: 100000, description: "Second runner-up prize" },
    ],
    minTeamSize: 2,
    maxTeamSize: 4,
    registrationStart: daysFromNow(-10),
    registrationEnd: daysFromNow(5),
    startDate: daysFromNow(10),
    endDate: daysFromNow(12),
    timeline: [
      { title: "Registration Opens", date: daysFromNow(-10), description: "Team registration begins" },
      { title: "Opening Ceremony", date: daysFromNow(10), description: "Kickoff and problem statement release" },
      { title: "Submission Deadline", date: daysFromNow(12), description: "Final project submission" },
      { title: "Results Announcement", date: daysFromNow(14), description: "Winners announced" },
    ],
    rules: [
      "Teams must consist of 2-4 members",
      "All code must be written during the hackathon window",
      "Use of open-source libraries is permitted",
      "Plagiarism will result in disqualification",
    ],
    judgingCriteria: [
      { name: "Innovation", weight: 25 },
      { name: "Technical Complexity", weight: 20 },
      { name: "UI/UX", weight: 20 },
      { name: "Scalability", weight: 15 },
      { name: "Presentation", weight: 20 },
    ],
    judges: [judges[0]._id, judges[1]._id],
    maxParticipants: 200,
    status: "published",
    isFeatured: true,
    isTrending: true,
  });

  const hackathon2 = await Hackathon.create({
    title: "CodeSprint Web3 Challenge",
    tagline: "Decentralize everything. Ship in a weekend.",
    description:
      "Build innovative decentralized applications using blockchain technology. Perfect for developers exploring Web3, smart contracts, and DeFi solutions.",
    organizer: organizer2._id,
    mode: "online",
    location: "Online",
    themes: ["Blockchain", "Web3", "DeFi"],
    category: "Blockchain",
    prizePool: 300000,
    prizeBreakdown: [
      { position: "1st Place", amount: 150000, description: "Grand prize winner" },
      { position: "2nd Place", amount: 100000, description: "Runner-up" },
      { position: "3rd Place", amount: 50000, description: "Second runner-up" },
    ],
    minTeamSize: 1,
    maxTeamSize: 3,
    registrationStart: daysFromNow(-20),
    registrationEnd: daysFromNow(-3),
    startDate: daysFromNow(-2),
    endDate: daysFromNow(1),
    timeline: [
      { title: "Registration Opens", date: daysFromNow(-20) },
      { title: "Hacking Begins", date: daysFromNow(-2) },
      { title: "Submissions Close", date: daysFromNow(1) },
    ],
    rules: ["Solo or team submissions welcome", "Must deploy to a public testnet", "Original work only"],
    judgingCriteria: [
      { name: "Innovation", weight: 30 },
      { name: "Technical Complexity", weight: 30 },
      { name: "Documentation", weight: 20 },
      { name: "Presentation", weight: 20 },
    ],
    judges: [judges[1]._id, judges[2]._id],
    maxParticipants: 150,
    status: "ongoing",
    isFeatured: true,
  });

  const hackathon3 = await Hackathon.create({
    title: "EcoHack Sustainability Challenge",
    tagline: "Tech solutions for a greener tomorrow",
    description:
      "A completed hackathon focused on building technology solutions to combat climate change and promote sustainability. Results have been announced.",
    organizer: organizer1._id,
    mode: "offline",
    location: "Mumbai, India",
    themes: ["Climate Tech", "Sustainability", "IoT"],
    category: "GreenTech",
    prizePool: 200000,
    minTeamSize: 2,
    maxTeamSize: 4,
    registrationStart: daysFromNow(-40),
    registrationEnd: daysFromNow(-30),
    startDate: daysFromNow(-28),
    endDate: daysFromNow(-26),
    rules: ["Teams of 2-4", "Original projects only"],
    judgingCriteria: [
      { name: "Innovation", weight: 25 },
      { name: "Technical Complexity", weight: 20 },
      { name: "UI/UX", weight: 15 },
      { name: "Scalability", weight: 20 },
      { name: "Documentation", weight: 10 },
      { name: "Presentation", weight: 10 },
    ],
    judges: [judges[0]._id],
    status: "completed",
    resultsPublished: true,
  });

  const hackathon4 = await Hackathon.create({
    title: "HealthTech Innovators Hackathon",
    tagline: "Reimagining healthcare through technology",
    description:
      "Draft hackathon currently being planned by the organizer team, not yet visible to participants.",
    organizer: organizer2._id,
    mode: "hybrid",
    location: "Hyderabad, India + Online",
    themes: ["HealthTech", "AI", "Accessibility"],
    category: "HealthTech",
    prizePool: 400000,
    minTeamSize: 2,
    maxTeamSize: 5,
    registrationStart: daysFromNow(20),
    registrationEnd: daysFromNow(35),
    startDate: daysFromNow(40),
    endDate: daysFromNow(42),
    rules: ["Teams of 2-5", "Healthcare-focused solutions only"],
    judgingCriteria: [
      { name: "Innovation", weight: 30 },
      { name: "Technical Complexity", weight: 25 },
      { name: "Presentation", weight: 25 },
      { name: "Documentation", weight: 20 },
    ],
    status: "draft",
  });

  console.log("[Seeder] Creating teams, registrations, submissions, reviews...");

  // Team for hackathon1 (approved, in-progress)
  const team1 = await Team.create({
    name: "Neural Nexus",
    hackathon: hackathon1._id,
    description: "Building an AI-powered climate risk prediction platform.",
    members: [
      { user: participants[0]._id, role: "leader" },
      { user: participants[1]._id, role: "member" },
      { user: participants[2]._id, role: "member" },
    ],
    status: "approved",
  });

  await Promise.all(
    team1.members.map((m) =>
      Registration.create({
        hackathon: hackathon1._id,
        team: team1._id,
        participant: m.user,
        status: "approved",
        reviewedBy: organizer1._id,
        reviewedAt: new Date(),
      })
    )
  );
  hackathon1.registeredCount += team1.members?.length;
  await hackathon1.save({ validateBeforeSave: false });

  // Team for hackathon2 (ongoing, with a submitted project + partial reviews)
  const team2 = await Team.create({
    name: "Chain Reaction",
    hackathon: hackathon2._id,
    description: "A decentralized lending protocol with dynamic interest rates.",
    members: [
      { user: participants[3]._id, role: "leader" },
      { user: participants[4]._id, role: "member" },
    ],
    status: "approved",
  });

  await Promise.all(
    team2.members.map((m) =>
      Registration.create({
        hackathon: hackathon2._id,
        team: team2._id,
        participant: m.user,
        status: "approved",
        reviewedBy: organizer2._id,
        reviewedAt: new Date(),
      })
    )
  );
  hackathon2.registeredCount += team2.members?.length;
  await hackathon2.save({ validateBeforeSave: false });

  const submission2 = await Submission.create({
    hackathon: hackathon2._id,
    team: team2._id,
    submittedBy: participants[3]._id,
    projectName: "LendFlow Protocol",
    problemStatement: "Traditional lending platforms lack transparency and charge high fees.",
    solution: "A decentralized lending protocol with algorithmically adjusted interest rates and full on-chain transparency.",
    description:
      "LendFlow is a DeFi lending protocol built on Ethereum that dynamically adjusts interest rates based on pool utilization, offering better rates for both lenders and borrowers while maintaining full transparency through on-chain governance.",
    githubLink: "https://github.com/example/lendflow-protocol",
    demoLink: "https://lendflow-demo.example.com",
    techStack: ["Solidity", "React", "Hardhat", "Ethers.js"],
    status: "under_review",
    submittedAt: new Date(),
  });

  await Review.create({
    hackathon: hackathon2._id,
    submission: submission2._id,
    judge: judges[1]._id,
    scores: {
      innovation: 8,
      technicalComplexity: 9,
      ui: 7,
      ux: 7,
      scalability: 8,
      documentation: 8,
      presentation: 8,
    },
    comments: "Solid technical implementation with clear on-chain logic. UI could use more polish.",
  });

  // Recompute average manually to mirror what the controller would do
  submission2.averageScore = 7.86;
  await submission2.save({ validateBeforeSave: false });

  // Teams + submissions + full reviews for the completed hackathon3 (with results published)
  const team3 = await Team.create({
    name: "Green Coders",
    hackathon: hackathon3._id,
    description: "Smart irrigation system using IoT sensors.",
    members: [
      { user: participants[5]._id, role: "leader" },
      { user: participants[6]._id, role: "member" },
    ],
    status: "approved",
  });

  const team4 = await Team.create({
    name: "Eco Warriors",
    hackathon: hackathon3._id,
    description: "Carbon footprint tracking app for households.",
    members: [
      { user: participants[7]._id, role: "leader" },
      { user: participants[0]._id, role: "member" },
    ],
    status: "approved",
  });

  const submission3a = await Submission.create({
    hackathon: hackathon3._id,
    team: team3._id,
    submittedBy: participants[5]._id,
    projectName: "SmartIrrigate",
    problemStatement: "Farmers over-water crops, wasting water and reducing yield.",
    solution: "An IoT-based smart irrigation system that waters crops based on real-time soil moisture data.",
    description:
      "SmartIrrigate uses low-cost soil moisture sensors connected to a central hub that automatically triggers irrigation valves, reducing water usage by up to 40% while improving crop yield.",
    githubLink: "https://github.com/example/smart-irrigate",
    techStack: ["Python", "Raspberry Pi", "MQTT", "React"],
    status: "reviewed",
    submittedAt: daysFromNow(-27),
    averageScore: 8.4,
    rank: 1,
  });

  const submission3b = await Submission.create({
    hackathon: hackathon3._id,
    team: team4._id,
    submittedBy: participants[7]._id,
    projectName: "CarbonTrack",
    problemStatement: "Households have no easy way to track their daily carbon footprint.",
    solution: "A mobile app that estimates carbon footprint from daily activities and suggests reductions.",
    description:
      "CarbonTrack integrates with utility bills, transportation logs, and shopping habits to give households a real-time carbon footprint score, along with personalized tips to reduce their impact.",
    githubLink: "https://github.com/example/carbon-track",
    techStack: ["React Native", "Node.js", "MongoDB"],
    status: "reviewed",
    submittedAt: daysFromNow(-27),
    averageScore: 7.6,
    rank: 2,
  });

  await Review.create({
    hackathon: hackathon3._id,
    submission: submission3a._id,
    judge: judges[0]._id,
    scores: { innovation: 9, technicalComplexity: 8, ui: 8, ux: 8, scalability: 9, documentation: 8, presentation: 9 },
    comments: "Excellent real-world applicability with measurable impact on water conservation.",
  });

  await Review.create({
    hackathon: hackathon3._id,
    submission: submission3b._id,
    judge: judges[0]._id,
    scores: { innovation: 7, technicalComplexity: 7, ui: 8, ux: 8, scalability: 7, documentation: 8, presentation: 8 },
    comments: "Great concept and clean UI. Could expand data sources for more accurate scoring.",
  });

  // Notifications for the results-published hackathon
  await Promise.all(
    [...team3.members, ...team4.members].map((m) =>
      Notification.create({
        recipient: m.user,
        type: "results_announced",
        title: "Results are out!",
        message: `Results for "${hackathon3.title}" have been published.`,
        link: `/hackathons/${hackathon3.slug}/leaderboard`,
        relatedHackathon: hackathon3._id,
        isRead: Math.random() > 0.5,
      })
    )
  );

  // A pending team awaiting organizer approval (demonstrates the approval workflow)
  await Team.create({
    name: "Pixel Pioneers",
    hackathon: hackathon1._id,
    description: "An AR-based accessibility tool for visually impaired users.",
    members: [{ user: participants[3]._id, role: "leader" }, { user: participants[4]._id, role: "member" }],
    status: "pending_approval",
  });

  // Bookmarks
  await Bookmark.create({ user: participants[1]._id, hackathon: hackathon1._id });
  await Bookmark.create({ user: participants[2]._id, hackathon: hackathon4._id });
  hackathon1.bookmarksCount += 1;
  hackathon4.bookmarksCount += 1;
  await hackathon1.save({ validateBeforeSave: false });
  await hackathon4.save({ validateBeforeSave: false });

  // Sample activity logs
  await ActivityLog.create([
    {
      actor: admin._id,
      action: "PLATFORM_INITIALIZED",
      targetType: "Other",
      description: "Seed data loaded into the platform.",
    },
    {
      actor: organizer1._id,
      action: "HACKATHON_PUBLISHED",
      targetType: "Hackathon",
      targetId: hackathon1._id,
      description: `Published hackathon "${hackathon1.title}"`,
    },
  ]);

  console.log("\n[Seeder] ✅ Done! Demo accounts (all use password: Password@123):");
  console.log(`  Admin:        admin@hackforge.dev`);
  console.log(`  Organizer 1:  organizer1@hackforge.dev`);
  console.log(`  Organizer 2:  organizer2@hackforge.dev`);
  console.log(`  Judge 1:      judge1@hackforge.dev`);
  console.log(`  Judge 2:      judge2@hackforge.dev`);
  console.log(`  Judge 3:      judge3@hackforge.dev`);
  console.log(`  Participant:  aditya@hackforge.dev (+ 7 more participant accounts)`);

  process.exit(0);
};

run().catch((err) => {
  console.error("[Seeder] Failed:", err);
  process.exit(1);
});
