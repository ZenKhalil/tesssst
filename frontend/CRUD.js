import { displayArtists, displayAlbums, displayTracks } from "./main.js";
import { artists, ArtistComponent } from "./uiComponents.js";

// Artist operations
function createArtist(name, genres, biography, imageFile, imageLink) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("artist_genres", genres); // genres is expected to be a string
    formData.append("biography", biography);

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (imageLink) {
      formData.append("imageLink", imageLink);
    }

    fetch("http://localhost:3006/artists", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text || "Server error");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (!data.id) {
          throw new Error("Artist creation did not return a valid ID.");
        }
        resolve(data);
      })
      .catch(reject);
  });
}

function updateArtist(id, name, genres, biography, imageData) {
  const updatedArtist = {
    name: name,
    artist_genres: genres, // genres is expected to be a string
    biography: biography,
    image: imageData,
  };
  return fetch(`http://localhost:3006/artists/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedArtist),
  })
    .then((response) => response.json())
    .then((data) => {
      const index = artists.findIndex((artist) => artist.id === id);
      if (index !== -1) {
        artists[index] = data;
        displayArtists(artists);
      }
    });
}

function deleteArtist(id) {
  return fetch(`http://localhost:3006/artists/${id}`, {
    method: "DELETE",
  }).then((response) => {
    if (response.ok) {
      artists = artists.filter((artist) => artist.id !== id);
      displayArtists(artists);
    } else {
      throw new Error("Failed to delete artist");
    }
  });
}
// Album operations
function createAlbum(title, artistId, releaseDate, imageData) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("artist_id", artistId);
  formData.append("release_date", releaseDate);
  formData.append("image", new Blob([imageData], { type: "image/jpeg" })); // Assuming imageData is a Buffer and the image type is JPEG

  return fetch("http://localhost:3006/albums", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      albums.push(data);
      displayAlbums(albums);
    });
}

function updateAlbum(id, title, artistId, releaseDate, imageData) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("artist_id", artistId);
  formData.append("release_date", releaseDate);
  formData.append("image", new Blob([imageData], { type: "image/jpeg" })); // Assuming imageData is a Buffer and the image type is JPEG

  return fetch(`http://localhost:3006/albums/${id}`, {
    method: "PUT",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      const index = albums.findIndex((album) => album.id === id);
      if (index !== -1) {
        albums[index] = data;
        displayAlbums(albums);
      }
    });
}

function deleteAlbum(id) {
  return fetch(`http://localhost:3006/albums/${id}`, {
    method: "DELETE",
  }).then(() => {
    albums = albums.filter((album) => album.id !== id);
    displayAlbums(albums);
  });
}

// Modify Tracks

// Create a track
function createTrack(title, albumId, duration) {
  console.log(
    `Creating track: ${title}, Album ID: ${albumId}, Duration: ${duration}`
  );
  fetch("http://localhost:3006/tracks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      album_id: albumId,
      duration: duration,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Track created:", data);
      // Assuming 'tracks' is an array that holds your tracks
      tracks.push(data);
      // Assuming 'displayTracks' is a function that takes an array of tracks and displays them
      displayTracks(tracks);
    })
    .catch((error) => {
      console.error("Error creating track:", error);
    });
}

// Update a track
function updateTrack(id, title, albumId, duration) {
  console.log(
    `Updating track with ID ${id}: ${title}, Album ID: ${albumId}, Duration: ${duration}`
  );
  fetch(`http://localhost:3006/tracks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      album_id: albumId,
      duration: duration,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const index = tracks.findIndex((track) => track.id === id);
      if (index !== -1) {
        tracks[index] = data;
        displayTracks(tracks);
      }
    })
    .catch((error) => {
      console.error("Error updating track:", error);
    });
}

// Delete a track
function deleteTrack(id) {
  console.log(`Deleting track with ID ${id}`);
  fetch(`http://localhost:3006/tracks/${id}`, {
    method: "DELETE",
  })
    .then(() => {
      tracks = tracks.filter((track) => track.id !== id);
      displayTracks(tracks);
    })
    .catch((error) => {
      console.error("Error deleting track:", error);
    });
}

// Export block
export {
  createArtist,
  updateArtist,
  deleteArtist,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  createTrack,
  updateTrack,
  deleteTrack,
};
