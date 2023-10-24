// testGetAlbumImage.js
import { getAlbumImage } from "./backend/services/albumService.js";

const testGetAlbumImage = async () => {
  const albumId = 16; // Replace with a known album ID
  const imageData = await getAlbumImage(albumId);
  console.log(imageData);
};

testGetAlbumImage();
