import * as albumService from '../services/albumService.js';
import * as trackService from '../services/trackService.js';
import {
  createAlbumWithImage,
  getAlbumImage,
} from "../services/albumService.js";

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
    const imageData = await getAlbumImage(albumId);
    res.set("Content-Type", "image/jpg"); // Adjust content type as necessary
    res.send(imageData);
  } catch (error) {
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
        const album = await albumService.createAlbum(req.body);
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
