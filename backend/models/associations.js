// associations.js

import Artist from './artistModel.js';
import Album from './albumModel.js';
import Track from './trackModel.js';

// Set up associations
Artist.hasMany(Album, { foreignKey: 'artist_id' });
Album.belongsTo(Artist, { foreignKey: 'artist_id' });

Album.hasMany(Track, { foreignKey: 'album_id' });
Track.belongsTo(Album, { foreignKey: 'album_id' });

export const setupAssociations = () => {};  // This is just a dummy function to ensure we execute this module.
