const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Each authenticated client joins a room named after their userId so we can
  // target notifications directly: io.to(userId).emit(...)
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
    }
  });

  // Clients viewing a hackathon's leaderboard join a room to receive live rank updates
  socket.on("joinLeaderboard", (hackathonId) => {
    if (hackathonId) {
      socket.join(`leaderboard:${hackathonId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Make io accessible inside controllers via req.app.get("io")
app.set("io", io);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[Server] HackForge API running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
};

start();

// Guard rails for unexpected failures
process.on("unhandledRejection", (err) => {
  console.error(`[UnhandledRejection] ${err.message}`);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error(`[UncaughtException] ${err.message}`);
  process.exit(1);
});
