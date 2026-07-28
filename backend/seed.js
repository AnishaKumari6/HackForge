// Fills the database with a small set of demo accounts and one hackathon,
// so you can log in and see something right away instead of starting empty.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Hackathon = require("./models/Hackathon");
const Team = require("./models/Team");

const run = async () => {
  await connectDB();

  console.log("Clearing old data...");
  await User.deleteMany();
  await Hackathon.deleteMany();
  await Team.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  const admin = await User.create({ name: "Admin User", email: "admin@test.com", password, role: "admin" });
  const organizer = await User.create({ name: "Olivia Organizer", email: "organizer@test.com", password, role: "organizer" });
  const judge = await User.create({ name: "Jordan Judge", email: "judge@test.com", password, role: "judge" });
  const participant = await User.create({ name: "Priya Participant", email: "participant@test.com", password, role: "participant" });

  const hackathon = await Hackathon.create({
    title: "Campus Code Sprint 2026",
    description: "A 24-hour hackathon for students to build a project from scratch and pitch it to judges.",
    organizer: organizer._id,
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    prizePool: 10000,
    maxTeamSize: 4,
    judges: [judge._id],
    status: "upcoming",
  });

  await Team.create({
    name: "Team Byte Force",
    hackathon: hackathon._id,
    leader: participant._id,
    members: [participant._id],
    status: "approved",
  });

  console.log("\nDone! Demo accounts (all use password: password123)");
  console.log("  Admin:       admin@test.com");
  console.log("  Organizer:   organizer@test.com");
  console.log("  Judge:       judge@test.com");
  console.log("  Participant: participant@test.com");

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
