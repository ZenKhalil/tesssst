import express from "express";
import { Genre } from "../models/artistModel.js"; // Assuming this is where your Genres model is located
import multer from "multer";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Route to fetch predefined genres for checkboxes
router.get("/", async (req, res) => {
  try {
    const genres = await Genre.findAll();
    res.json(genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;