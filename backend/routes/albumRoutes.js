import express from 'express';
import * as albumController from '../controllers/albumController.js';
import { authenticate } from './middleware/authMiddleware.js';
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/albums/image",
  upload.single("image"),
  albumController.uploadAlbumImage
);
router.get("/albums/:id/image", albumController.retrieveAlbumImage);

router.post('/albums', authenticate, albumController.createAlbum);

router.get('/search', albumController.searchAlbums);
router.get('/filterByDate', albumController.filterAlbumsByDate);

router.post('/complete', albumController.createCompleteAlbum);

router.get('/', albumController.getAllAlbums);

// Nested route to get tracks of a specific album
router.get('/:albumId/tracks', albumController.getTracksByAlbum);

router.get('/:id', albumController.getAlbumById);
router.post('/', albumController.createAlbum);
router.put('/:id', albumController.updateAlbum);
router.delete('/:id', albumController.deleteAlbum);

export default router;
