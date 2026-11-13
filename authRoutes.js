

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
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields required"
      });
    }

    const db = await connectToDatabase();
    const users = db.collection("users");

    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(409).json({
        error: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      message: "Registration successful",
      userId: result.insertedId,
      userName: name,
      userEmail: email
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

router.post("/api/auth/register", register);
router.post("/api/secondchance/register", register);

// LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required"
      });
    }

    const db = await connectToDatabase();
    const user = await db.collection("users").findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      getJwtSecret(),
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      userName: user.name,
      userEmail: user.email,
      token
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

router.post("/api/auth/login", login);
router.post("/api/secondchance/login", login);

// UPDATE PROFILE
router.put("/api/secondchance/profile", async (req, res) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        error: "Token required"
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const { ObjectId } = require("mongodb");
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        error: "Valid name required"
      });
    }

    const db = await connectToDatabase();

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: { name: name.trim() } }
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    return res.json({
      message: "Profile updated"
    });
  } catch (error) {
    return res.status(401).json({
      error: "Invalid token or request"
    });
  }
});

module.exports = router;
