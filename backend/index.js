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

app.post("/tasks", async (req, res) => {
  try {
    const { title, completed = false } = req.body;
    const result = await mongoose.connection.db
      .collection("tasks")
      .insertOne({ title, completed });
    res
      .status(201)
      .json(
        result.ops
          ? result.ops[0]
          : { title, completed, _id: result.insertedId }
      );
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
