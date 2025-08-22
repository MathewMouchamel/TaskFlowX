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

app.get("/", (req, res) => {
  res.send("Hello from TaskFlowX backend!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
