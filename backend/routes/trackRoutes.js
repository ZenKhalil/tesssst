import express from 'express';
import * as trackController from '../controllers/trackController.js';

const router = express.Router();

router.get('/search', trackController.searchTracks);

router.get('/', trackController.getAllTracks);
router.get('/:id', trackController.getTrackById);
router.post('/', trackController.createTrack);
router.put('/:id', trackController.updateTrack);
router.delete('/:id', trackController.deleteTrack);

export default router;
