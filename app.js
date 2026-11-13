
const express = require("express");
const itemsRoutes = require("./secondChanceItemsRoutes");
const searchRoutes = require("./searchRoutes");

const app = express();

app.use(express.json());

// SecondChance API routes
app.use(itemsRoutes);
app.use(searchRoutes);

app.get("/", (req, res) => {
  res.send("SecondChance API is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
