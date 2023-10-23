import { overlay, artistPopup, fetchTracksForAlbum, albums, albumPopup, fetchAlbumsForArtist } from "./main.js";

let lastViewedArtist = null; 
let artists = []; // Store fetched artist data

function updateArtists(newArtists) {
  artists = newArtists;
}

class UIComponent {
  constructor(data) {
    this.data = data;
  }

  render() {
    return `<div>${this.data}</div>`;
  }

  update(newData) {
    this.data = newData;
  }
}

class ArtistComponent extends UIComponent {
  constructor(data, favorites, albums) {
    super(data);
    this.favorites = favorites;
    this.albums = albums;
  }

  render() {
    // Retrieve image from localStorage
    const base64Image = localStorage.getItem(`artistImage_${this.data.name}`);
    const imageSource = base64Image
      ? `data:image/jpg;base64,${base64Image}`
      : `./artists/${this.data.id}.jpg`;

    return `
            <div class="artist-card" data-artist-id="${this.data.id}">
                <div class="artist-image-container">
                    <i class="delete-icon" onclick="event.stopPropagation(); deleteArtists(${
                      this.data.id
                    });" title="Delete">✖</i>
                    <img src="${imageSource}" alt="${this.data.name}">
                </div>
                <h3>${this.data.name}</h3>
                <p>${this.data.biography}</p>
                <button class="favorite-btn" data-artist-id="${
                  this.data.id
                }" onclick="event.stopPropagation(); toggleFavorite(${
      this.data.id
    })">${this.favorites.includes(this.data.id) ? "❤️" : "🤍"}</button>
                <i class="edit-icon" data-artist-id="${
                  this.data.id
                }" data-action="edit">🖊️</i>
            </div>`;
  }

  async displayArtistPopup() {
    lastViewedArtist = this.data.id;
    displayArtistPopupById(lastViewedArtist);
  }
}

async function displayArtistPopupById(artistId) {
  const artistData = artists.find((artist) => artist.id === artistId);
  if (!artistData) {
    console.error("Artist data not found for ID:", artistId);
    return;
  }

  // Fetch albums linked to this artist if not already fetched
  let artistAlbums = albums.filter(
    (album) => album.artist_id === artistData.id
  );
if (!artistAlbums || !Array.isArray(artistAlbums) || !artistAlbums.length) {
  console.error("No albums found for artist:", artistId);
  return;
}

  // Generate the album titles
  const albumTitles = artistAlbums
    .map(
      (album) => `
            <li data-album-id="${album.id}" class="clickable-album-title">${album.title}</li>`
    )
    .join("");

  artistPopup.innerHTML = `
            <div class="artist-details">
                <img src="./artists/${artistData.id}.jpg" alt="${artistData.name}">
                <h2>${artistData.name}</h2>
                <p>${artistData.biography}</p>
                <ul>
                    ${albumTitles}
                </ul>
            </div>
        `;
  artistPopup.classList.add("active");
  overlay.classList.add("active");
}

async function displayAlbumPopup(albumId) {
  const tracks = await fetchTracksForAlbum(albumId);
  const album = albums.find((a) => a.id === parseInt(albumId));

  const tracksList = tracks
    .map(
      (track, index) => `
        <li>
            <span class="track-number">${index + 1}.</span>
            <span class="track-title">${track.title}</span>
            <span class="track-duration">${track.duration}</span>
        </li>
    `
    )
    .join("");

  albumPopup.innerHTML = `
        <div class="album-details">
            <img src="./images/${album.id}.jpg" alt="${album.title}" class="album-cover">
            <h2>${album.title}</h2>
            <ul class="track-list">
                ${tracksList}
            </ul>
            <button id="returnToArtist" class="return-icon"><i class="fas fa-arrow-left"></i></button>
        </div>
    `;

  artistPopup.classList.remove("active"); // Hide the artist popup
  albumPopup.classList.add("active"); // Show the album popup
  overlay.classList.add("active");

  const returnToArtistButton = document.getElementById("returnToArtist");

  // Remove any existing event listeners
  returnToArtistButton.replaceWith(returnToArtistButton.cloneNode(true));

  // Add the event listener to the new button element
document
  .getElementById("returnToArtist")
  .addEventListener("click", function () {
    console.log("Return to artist button clicked");
    albumPopup.classList.remove("active");
    if (lastViewedArtist) {
      console.log("Returning to artist:", lastViewedArtist);
      displayArtistPopupById(lastViewedArtist);
    } else {
      console.log("No last viewed artist found");
    }
  });

}

function initializeUIComponents() {
  artistPopup.addEventListener("click", function (event) {
    if (event.target.classList.contains("clickable-album-title")) {
      const albumId = event.target.getAttribute("data-album-id");
      displayAlbumPopup(albumId);
    }
  });
}


export { ArtistComponent, artists, updateArtists, displayAlbumPopup, initializeUIComponents };
