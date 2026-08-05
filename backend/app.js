const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const hackathonRoutes = require("./routes/hackathonRoutes");
const teamRoutes = require("./routes/teamRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// --- Rate limiting (applied to all /api routes) ---
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MIN || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 200),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api", limiter);

// --- Health check & welcome ---
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to the HackForge API. Access resources via /api/v1." });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "HackForge API is running.", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/hackathons", hackathonRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/registrations", registrationRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/bookmarks", bookmarkRoutes);
app.use("/api/v1/admin", adminRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
