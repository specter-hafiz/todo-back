/**
 * Server Entry Point
 * Initializes and starts the Express server with GraphQL
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createYoga, createSchema } from "graphql-yoga";
import dotenv from "dotenv";

import { connectDB, disconnectDB } from "./utils/database";
import { typeDefs } from "./schema/schema";
import { resolvers } from "./resolvers/TodoResolvers";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/todo-app";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Initialize Express app
const app = express();

// Security middleware
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         "default-src": ["'self'"],
//         "base-uri": ["'self'"],
//         "font-src": ["'self'", "https:", "data:"],
//         "form-action": ["'self'"],
//         "frame-ancestors": ["'self'"],
//         "img-src": ["'self'", "data:", "https:"],
//         "object-src": ["'none'"],
//         "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
//         "script-src-attr": ["'none'"],
//         "style-src": ["'self'", "https:", "'unsafe-inline'"],
//         "upgrade-insecure-requests": [],
//       },
//     },
//     crossOriginEmbedderPolicy: false,
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//   })
// );

// CORS configuration
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  message: "Too many requests from this IP, please try again later",
});
app.use("/graphql", limiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;
  res.status(dbStatus ? 200 : 503).json({
    status: dbStatus ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus ? "connected" : "disconnected",
  });
});

// Create GraphQL Yoga instance
const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  graphqlEndpoint: "/graphql",
  landingPage: true,
  cors: false, // Already handled by Express CORS middleware
});

// GraphQL endpoint
app.use("/graphql", yoga);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB(MONGODB_URI);

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await disconnectDB();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  await disconnectDB();
  process.exit(0);
});

// Start the server
startServer();
