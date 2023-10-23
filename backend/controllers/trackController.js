import * as trackService from '../services/trackService.js';

export const getAllTracks = async (req, res, next) => {
    try {
        const { sort, order, title, limit, offset } = req.query;

        const queryParams = {
            sort: sort,
            order: order,
            title: title,
            limit: limit,
            offset: offset
        };

        const tracks = await trackService.getAllTracks(queryParams);
        res.json(tracks);
    } catch (error) {
        next(error);
    }
};

export const getTrackById = async (req, res, next) => {
    try {
        const track = await trackService.getTrackById(req.params.id);
        res.json(track);
    } catch (error) {
        next(error);
    }
};

export const createTrack = async (req, res, next) => {
    try {
        const track = await trackService.createTrack(req.body);
        res.status(201).json(track);
    } catch (error) {
        next(error);
    }
};

export const updateTrack = async (req, res, next) => {
    try {
        const track = await trackService.updateTrack(req.params.id, req.body);
        if (track) {
            res.json(track);
        } else {
            res.status(404).send('Track not found');
        }
    } catch (error) {
        next(error);
    }
};

export const deleteTrack = async (req, res, next) => {
    try {
        await trackService.deleteTrack(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const searchTracks = async (req, res) => {
    try {
        const tracks = await trackService.searchTracks(req.query.q);
        res.json(tracks);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
