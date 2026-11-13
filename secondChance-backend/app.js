
const express = require("express");
const path = require("path");

const itemsRoutes = require("./secondChanceItemsRoutes");
const searchRoutes = require("./searchRoutes");
const authRoutes = require("./authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SecondChance API routes
app.use(itemsRoutes);
app.use(searchRoutes);
app.use(authRoutes);

// Landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "SecondChance API is running"
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`SecondChance: http://localhost:${PORT}`);
});

