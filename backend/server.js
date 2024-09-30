require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const PORT = process.env.PORT;

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json({ limit: "10kb" })); // Body parser, limit size to prevent DOS attacks
app.use(helmet()); // Set security HTTP headers

// CORS Configuration
const corsOptions = {
  origin: [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`], // Update with your frontend URLs
  //origin: [`http://localhost:${PORT}`, path.resolve(__dirname, "../frontend/config.js", `${CONFIG.API_BASE_URL}`)],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter); // Apply to API routes

// Data Sanitization against NoSQL Injection and XSS
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
app.use(mongoSanitize());
app.use(xss());

// Prevent Parameter Pollution
const hpp = require("hpp");
app.use(hpp());

// Compression
const compression = require("compression");
app.use(compression());

// Define Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));

// Serve Static Assets in Production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "../frontend")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../frontend", "index.html"))
  );
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).json({ msg: "Server Error" });
});

// const PORT = process.env.PORT || 5500;

app.listen(PORT, () =>
  console.log(`Backend Server started on port: http://localhost:${PORT}`)
);
