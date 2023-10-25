import express from "express";
import * as artistController from "../controllers/artistController.js";
import { body } from "express-validator";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Custom middleware to parse artist_genres field
const parseGenres = (req, res, next) => {
  if (req.body.artist_genres) {
    try {
      req.body.artist_genres = JSON.parse(req.body.artist_genres);
    } catch (error) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid genres format" }] });
    }
  }
  next();
};

// Route to search artists
router.get("/search", artistController.searchArtists);

// Route to get all artists
router.get("/", artistController.getAllArtists);

// Route to get a specific artist by ID
router.get("/:id", artistController.getArtistById);

// Endpoint to get artist image
router.get("/:id/image", artistController.getArtistImage);

// Route to get albums by artist ID
router.get("/:artistId/albums", artistController.getAlbumsByArtist);

// Route to create a new artist
router.post(
  "/",
  upload.single("image"),
  parseGenres,
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 255 })
      .withMessage("Name should not exceed 255 characters"),
    body("biography")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Biography should not exceed 1000 characters"),
    body("artist_genres").isArray().withMessage("Genres should be an array"),
  ],
  artistController.createArtist
);

// Route to update an artist by ID
router.put("/:id", upload.single("image"), artistController.updateArtist);

// Route to delete an artist by ID
router.delete("/:id", artistController.deleteArtist);

export default router;
