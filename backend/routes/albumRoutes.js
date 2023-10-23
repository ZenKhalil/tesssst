import express from "express";
import * as albumController from "../controllers/albumController.js";
import { authenticate } from "./middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Route to upload an album image
router.post("/image", upload.single("image"), albumController.uploadAlbumImage);

// Route to retrieve an album image
router.get("/:id/image", albumController.retrieveAlbumImage);

// Route to create an album with authentication
router.post(
  "/",
  upload.single("image"),
  authenticate,
  albumController.createAlbum
);

// Other routes
router.get("/search", albumController.searchAlbums);
router.get("/filterByDate", albumController.filterAlbumsByDate);
router.post("/complete", albumController.createCompleteAlbum);
router.get("/", albumController.getAllAlbums);
router.get("/:albumId/tracks", albumController.getTracksByAlbum);
router.get("/:id", albumController.getAlbumById);
router.put("/:id", albumController.updateAlbum);
router.delete("/:id", albumController.deleteAlbum);

export default router;
