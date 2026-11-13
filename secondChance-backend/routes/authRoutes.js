
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectToDatabase } = require("./db");

const router = express.Router();

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
}

// REGISTER
router.post("/api/secondchance/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const db = await connectToDatabase();
    const users = db.collection("users");

    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Registration successful",
      userId: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post("/api/secondchance/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await connectToDatabase();
    const user = await db.collection("users").findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      getJwtSecret(),
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE PROFILE
router.put("/api/secondchance/profile", async (req, res) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Token required" });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const { ObjectId } = require("mongodb");
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Valid name required" });
    }

    const db = await connectToDatabase();
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: { name: name.trim() } }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated" });
  } catch (error) {
    res.status(401).json({ error: "Invalid token or request" });
  }
});

module.exports = router;
