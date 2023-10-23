import Album from "../models/albumModel.js";
import Artist from "../models/artistModel.js";
import Track from "../models/trackModel.js";
import { Op } from "sequelize";

export const getAllAlbums = async (
  whereClause = {},
  sort = "title",
  order = "ASC",
  limit = null,
  offset = 0
) => {
  limit = isNaN(limit) ? null : limit;
  offset = isNaN(offset) ? 0 : offset;

  const queryOptions = {
    where: whereClause,
    order: [[sort, order]],
    offset: offset,
  };

  if (limit !== null) {
    queryOptions.limit = limit;
  }

  return await Album.findAll(queryOptions);
};

export const getAlbumsByArtist = async (artistId) => {
  return await Album.findAll({
    where: { artist_id: artistId },
  });
};

export const getAlbumById = async (id) => {
  return await Album.findByPk(id, {
    include: Artist,
  });
};

export const createAlbum = async (data) => {
  return await Album.create(data);
};

export const updateAlbum = async (id, data) => {
  const album = await Album.findByPk(id);
  if (!album) return null;
  Object.assign(album, data);
  await album.save();
  return album;
};

export const deleteAlbum = async (id) => {
  const album = await Album.findByPk(id);
  if (!album) return null;
  await album.destroy();
  return album;
};

export const searchAlbums = async (query) => {
  return await Album.findAll({
    where: {
      title: {
        [Op.like]: `%${query}%`,
      },
    },
  });
};

export const filterAlbumsByDate = async (date) => {
  return await Album.findAll({
    where: {
      release_date: {
        [Op.gte]: date,
      },
    },
  });
};

export const createCompleteAlbum = async (data) => {
  const { artist, tracks, ...albumDetails } = data;

  // Check if artist exists or create a new one
  let [artistInstance, created] = await Artist.findOrCreate({
    where: { name: artist.name },
    defaults: artist,
  });

  // Create the album
  const album = await Album.create({
    ...albumDetails,
    artistId: artistInstance.id,
  });

  // Check each track and associate with the album
  for (let track of tracks) {
    let [trackInstance] = await Track.findOrCreate({
      where: { name: track.name },
      defaults: track,
    });
    await album.addTrack(trackInstance);
  }

  return album;
};

// Function to upload an album image
export const uploadAlbumImage = async (id, imageData) => {
  const album = await Album.findByPk(id);
  if (!album) return null;

  album.image = imageData; // Assuming you have an image field in your Album model
  await album.save();

  return album;
};

// Function to retrieve an album image
export const getAlbumImage = async (id) => {
  const album = await Album.findByPk(id);
  if (!album || !album.image) {
    return null;
  }
  return album.image;
};

export const createAlbumWithImage = async (albumData, imageFile) => {
  const album = await createAlbum(albumData);

  if (imageFile) {
    await uploadAlbumImage(album.id, imageFile.buffer);
  }

  return album;
};
