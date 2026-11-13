
const express = require("express");
const { connectToDatabase } = require("./db");

const router = express.Router();

// Search items by category
router.get("/api/secondchance/search", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("items");

    const category = req.query.category;
    const filter = category ? { category: category } : {};

    const items = await collection.find(filter).toArray();

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
