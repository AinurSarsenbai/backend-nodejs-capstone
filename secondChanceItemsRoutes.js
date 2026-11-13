
const express = require("express");
const multer = require("multer");
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("./db");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Get MongoDB collection
async function getCollection() {
  const db = await connectToDatabase();
  return db.collection("items");
}

// GET all items
router.get("/api/secondchance/items", async (req, res) => {
  try {
    const collection = await getCollection();
    const items = await collection.find({}).toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET item by ID
router.get("/api/secondchance/items/:id", async (req, res) => {
  try {
    const collection = await getCollection();
    const item = await collection.findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST item with file upload
router.post(
  "/api/secondchance/items",
  upload.single("file"),
  async (req, res) => {
    try {
      const collection = await getCollection();

      const item = {
        ...req.body,
        image: req.file ? req.file.filename : null,
        createdAt: new Date()
      };

      const result = await collection.insertOne(item);

      res.status(201).json({
        message: "Item created successfully",
        insertedId: result.insertedId
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE item by ID
router.delete("/api/secondchance/items/:id", async (req, res) => {
  try {
    const collection = await getCollection();

    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
