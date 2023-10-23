import * as artistService from "../services/artistService.js";
import { validationResult } from "express-validator";
import multer from "multer";

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

export const getArtistImage = async (req, res, next) => {
  try {
    const artistId = req.params.id;
    const imageData = await artistService.getArtistImage(artistId);
    if (!imageData) {
      return res.status(404).send("Image not found");
    }

    // Dynamically set content type
    const imageType = imageData.mimetype; // Assuming your service returns the mimetype. Adjust accordingly.
    res.contentType(imageType);

    res.send(imageData.data); // Assuming the image data is stored in a 'data' property. Adjust accordingly.
  } catch (error) {
    next(error);
  }
};

export const getAllArtists = async (req, res, next) => {
  try {
    const { sort, order, name, limit, offset } = req.query;

    const queryParams = {
      sort: sort,
      order: order,
      name: name,
      limit: limit,
      offset: offset,
    };

    const artists = await artistService.getAllArtists(queryParams);
    res.json(artists);
  } catch (error) {
    next(error);
  }
};

export const getAlbumsByArtist = async (req, res, next) => {
  try {
    const artistId = req.params.artistId;
    const albums = await artistService.getAlbumsByArtist(artistId);
    if (albums) {
      res.json(albums);
    } else {
      res.status(404).send("Artist not found");
    }
  } catch (error) {
    next(error);
  }
};

export const getArtistById = async (req, res, next) => {
  try {
    const artist = await artistService.getArtistById(req.params.id);
    res.json(artist);
  } catch (error) {
    next(error);
  }
};

export const createArtist = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const artistData = {
      ...req.body,
      image: req.file ? req.file.buffer : null,
    };

    const artist = await artistService.createArtist(artistData);
    res.status(201).json(artist);
  } catch (error) {
    next(error);
  }
};

export const updateArtist = async (req, res, next) => {
  try {
    const artistData = {
      ...req.body,
      image: req.file ? req.file.buffer : null,
    };

    const artist = await artistService.updateArtist(req.params.id, artistData);
    if (artist) {
      res.json(artist);
    } else {
      res.status(404).send("Artist not found");
    }
  } catch (error) {
    next(error);
  }
};

export const deleteArtist = async (req, res, next) => {
  try {
    await artistService.deleteArtist(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const searchArtists = async (req, res) => {
  try {
    const artists = await artistService.searchArtists(req.query.q);
    res.json(artists);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const uploadMiddleware = upload.single("image");
