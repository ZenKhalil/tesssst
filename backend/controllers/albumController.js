import * as albumService from '../services/albumService.js';
import * as trackService from '../services/trackService.js';
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
  try {
    const albumId = req.params.id;
    console.log(`Fetching image for album ID: ${albumId}`);

    const album = await getAlbumImage(albumId);

    if (!album) {
      console.log(`Album with ID ${albumId} not found.`);
      return res.status(404).send("Album not found");
    }

    if (!album.image || !album.image.data) {
      console.log(`Image data for album ID ${albumId} not found.`);
      return res.status(404).send("Image not found");
    }

    const buffer = Buffer.from(album.image.data);

    const magicNumbers = buffer.toString("hex", 0, 4);
    let contentType;
    switch (magicNumbers) {
      case "ffd8ffe0":
      case "ffd8ffe1":
      case "ffd8ffe2":
        contentType = "image/jpg";
        break;
      case "89504e47":
        contentType = "image/png";
        break;
      default:
        console.log(
          `Unsupported image format for album ID ${albumId}. Magic numbers: ${magicNumbers}`
        );
        return res.status(415).send("Unsupported image format");
    }

    res.set("Content-Type", contentType);
    res.send(buffer);
  } catch (error) {
    console.error(
      `Error while retrieving image for album ID ${albumId}:`,
      error
    );
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
