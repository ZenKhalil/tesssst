import Artist from "../models/artistModel.js";
import Album from "../models/albumModel.js";
import { Op } from "sequelize";

const getAllArtists = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 100) || 100;
  const offset = (page - 1) * limit;

  const sort = queryParams.sort || "name";
  const order = queryParams.order || "ASC";

  return await Artist.findAll({
    attributes: ["id", "name", "biography", "genres", "image"],
    order: [[sort, order]],
    limit: limit,
    offset: offset,
  });
};

const getAlbumsByArtist = async (artistId) => {
  const artist = await Artist.findByPk(artistId, {
    include: [
      {
        model: Album,
        as: "albums",
        attributes: ["id", "title", "release_date"],
      },
    ],
  });
  if (!artist) return null;
  return artist.albums;
};

const getArtistById = async (id) => {
  return await Artist.findByPk(id, {
    attributes: ["id", "name", "biography", "genres", "image"],
  });
};

const createArtist = async (data) => {
  return await Artist.create(data);
};

const updateArtist = async (id, data) => {
  const artist = await Artist.findByPk(id);
  if (!artist) return null;

  Object.assign(artist, data);
  await artist.save();
  return artist;
};

const deleteArtist = async (id) => {
  const artist = await Artist.findByPk(id);
  if (!artist) return;

  const associatedAlbums = await Album.findAll({ where: { artist_id: id } });
  if (associatedAlbums.length > 0) {
    for (const album of associatedAlbums) {
      await album.destroy();
    }
  }

  await artist.destroy();
};

const searchArtists = async (query) => {
  return await Artist.findAll({
    where: {
      name: {
        [Op.like]: `%${query}%`,
      },
    },
  });
};

 const uploadArtistImage = async (id, imageData) => {
  const artist = await Artist.findByPk(id);
  if (!artist) return null;

  artist.image = imageData;
  await artist.save();

  return artist;
};

// Function to retrieve an artist image
 const getArtistImage = async (id) => {
  const artist = await Artist.findByPk(id);
  if (!artist) return null;

  return artist.image;
};

export {
  searchArtists,
  getAllArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist,
  getAlbumsByArtist,
  uploadArtistImage,
  getArtistImage,
};
