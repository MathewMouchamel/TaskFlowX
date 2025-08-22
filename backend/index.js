import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());

// Access the "tasks" collection directly without a schema
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await mongoose.connection.db
      .collection("tasks")
      .find({})
      .toArray();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
