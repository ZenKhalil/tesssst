import express from "express";
import * as artistController from "../controllers/artistController.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

router.get("/search", artistController.searchArtists);

router.get("/", artistController.getAllArtists);
router.get("/:id", artistController.getArtistById);

// Endpoint to get artist image
router.get("/:id/image", artistController.getArtistImage);

router.get("/:artistId/albums", artistController.getAlbumsByArtist);

router.post(
  "/",
  [
    artistController.uploadMiddleware,
    body("name").notEmpty().withMessage("Name is required").isLength({ max: 255 }).withMessage("Name should not exceed 255 characters"),
    body("biography").optional().isLength({ max: 1000 }).withMessage("Biography should not exceed 1000 characters"),
    body("genres").optional().isLength({ max: 255 }).withMessage("Genre should not exceed 255 characters"),
  ],
  artistController.createArtist
);

router.put(
  "/:id",artistController.uploadMiddleware,artistController.updateArtist
);
router.delete("/:id", artistController.deleteArtist);

export default router;
