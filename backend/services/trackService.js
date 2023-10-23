import { Op } from 'sequelize'; // Import the Op object for operations like 'like'
import Track from '../models/trackModel.js';

export const getAllTracks = async (queryParams) => {
    const page = parseInt(queryParams.page, 10) || 1; 
    const limit = parseInt(queryParams.limit, 200) || 200; 
    const offset = (page - 1) * limit;

    const sort = queryParams.sort || 'title'; 
    const order = queryParams.order || 'ASC'; 

    return await Track.findAll({
        order: [[sort, order]],
        limit: limit,
        offset: offset
    });
};

export const getTracksByAlbum = async (albumId) => {
    return await Track.findAll({
        where: { album_id: albumId }
    });
};

export const getTrackById = async (id) => {
    return await Track.findByPk(id);
};

export const createTrack = async (data) => {
    return await Track.create(data);
};

export const updateTrack = async (id, data) => {
    const track = await Track.findByPk(id);
    if (!track) return null;
    Object.assign(track, data);
    await track.save();
    return track;
};

export const deleteTrack = async (id) => {
    const track = await Track.findByPk(id);
    if (!track) return null;
    await track.destroy();
    return track;
};

export const searchTracks = async (query) => {
    return await Track.findAll({
        where: {
            title: {
                [Op.like]: `%${query}%`
            }
        }
    });
};
