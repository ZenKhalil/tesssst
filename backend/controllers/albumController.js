import * as albumService from '../services/albumService.js';
import * as trackService from '../services/trackService.js';
import Album from "../models/albumModel.js";
import { createAlbumWithImage, getAlbumImage } from "../services/albumService.js";
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpg" || file.mimetype === "image/png") {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(null, false);
    cb(new Error("Only .jpg and .png format allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
  fileFilter: fileFilter,
});

export const uploadAlbumImage = async (req, res, next) => {
  try {
    const albumData = req.body;
    const imageFile = req.file; // Assuming you're using something like multer for file handling
    const album = await createAlbumWithImage(albumData, imageFile);
    res.status(201).json(album);
  } catch (error) {
    next(error);
  }
};

export const retrieveAlbumImage = async (req, res, next) => {
  const albumId = req.params.id;

  // Log to check if the function is being triggered
  console.log(`Attempting to retrieve image for album ID: ${albumId}`);

  try {
    const album = await Album.findByPk(albumId);

    // Check if the album exists
    if (!album) {
      console.error(`Album with ID ${albumId} not found.`);
      return res.status(404).send("Album not found");
    }

    // Check if the album has an image
    if (!album.image) {
      console.error(`No image associated with album ID ${albumId}.`);
      return res.status(404).send("Image not found");
    }

    // Send the image data with the appropriate content type
    res.set("Content-Type", "image/jpg");
    res.send(album.image);
  } catch (error) {
    console.error(`Error retrieving image for album ID ${albumId}:`, error);
    next(error);
  }
};


export const getAllAlbums = async (req, res, next) => {
    try {
        const { sort, order, release_date, title } = req.query;
        let { limit, offset } = req.query;

        limit = isNaN(parseInt(limit)) ? null : parseInt(limit);
        offset = isNaN(parseInt(offset)) ? 0 : parseInt(offset);

        const whereClause = {};

        if (release_date) {
            whereClause.release_date = release_date;
        }

        if (title) {
            whereClause.title = title;
        }

        const albums = await albumService.getAllAlbums(whereClause, sort, order, limit, offset);
        res.json(albums);
    } catch (error) {
        next(error);
    }
};

export const getTracksByAlbum = async (req, res, next) => {
    try {
        const albumId = req.params.albumId;
        const tracks = await trackService.getTracksByAlbum(albumId);
        res.json(tracks);
    } catch (error) {
        next(error);
    }
};

export const getAlbumById = async (req, res, next) => {
    try {
        const album = await albumService.getAlbumById(req.params.id);
        res.json(album);
    } catch (error) {
        next(error);
    }
};

export const createAlbum = async (req, res, next) => {
  try {
    const albumData = {
      ...req.body,
      image: req.file ? req.file.buffer : null,
    };

    const album = await albumService.createAlbum(albumData);
    res.status(201).json(album);
  } catch (error) {
    next(error);
  }
};


export const updateAlbum = async (req, res, next) => {
    try {
        const album = await albumService.updateAlbum(req.params.id, req.body);
        if (album) {
            res.json(album);
        } else {
            res.status(404).send('Album not found');
        }
    } catch (error) {
        next(error);
    }
};

export const deleteAlbum = async (req, res, next) => {
    try {
        await albumService.deleteAlbum(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const searchAlbums = async (req, res) => {
    try {
        const albums = await albumService.searchAlbums(req.query.q);
        res.json(albums);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const filterAlbumsByDate = async (req, res) => {
    try {
        const albums = await albumService.filterAlbumsByDate(req.query.date);
        res.json(albums);
    } catch (error) {
        res.status(500).send(error.message);
    }
};


export const createCompleteAlbum = async (req, res) => {
    try {
        const albumData = await albumService.createCompleteAlbum(req.body);
        res.status(201).json(albumData);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
