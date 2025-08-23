import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { createClient } from "redis";
import { initializeQueue, scheduleReminder } from "./reminderQueue.js";

dotenv.config();

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});
client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();
initializeQueue(client);

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "taskflowx-70787",
});

await client.set("x", "bar");
const result = await client.get("foo");
console.log(result); // >>> bar

const app = express();
const PORT = process.env.PORT;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", TaskSchema, "tasks");

app.get("/tasks", verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const tasks = await Task.find({ userId: req.user.uid }).sort({
      createdAt: -1,
    });

    const tasksDue = await Task.find({
      userId: req.user.uid,
      dueDate: { $gte: now, $lte: twoDaysFromNow },
    }).sort({ createdAt: -1 });

    // Add jobs to the queue for each task
    for (const task of tasksDue) {
      await scheduleReminder({
        userId: req.user.uid,
        taskId: task._id,
      });
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.post("/tasks", verifyToken, async (req, res) => {
  try {
    const { title, description, dueDate, priority, completed } = req.body;

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      completed,
      userId: req.user.uid,
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/tasks/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, completed } = req.body;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.uid },
      { title, description, dueDate, priority, completed },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/tasks/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      userId: req.user.uid,
    });

    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    res.json({ message: "Task deleted successfully", task: deletedTask });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { client };
