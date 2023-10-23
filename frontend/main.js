"use strict";

import { showCreateArtistModal, showEditArtistModal } from './modify.js';
import { updateArtist, deleteArtist } from './CRUD.js';
import { ArtistComponent, artists, updateArtists, initializeUIComponents } from "./uiComponents.js";

// Initial Setup based on sessionStorage
window.addEventListener('load', function() {
    console.log("Page loaded");
    const lastTab = sessionStorage.getItem('lastTab');
    if (lastTab === 'home') {
        navigateToHomePage();
    } else if (lastTab === 'artists') {
        navigateToArtistsPage();
    } else if (lastTab === 'albums') {
        navigateToAlbumsPage();
    } else if (lastTab === 'tracks') {
        navigateToTracksPage();
    } else if (lastTab === 'favorites') {
        navigateToFavoritesPage();
    } else if (lastTab === 'about') {
        navigateToAboutPage();
    } else {
        navigateToHomePage();
    }
});

// Global Variables
let albums = []; // store fetched album data
let tracks = [];
let genre = [];
let homePageInterval; // Declare a variable to store the interval ID
let isNavigatingToGenrePage = false;
let lastViewedArtist = null; 
window.deleteArtists = deleteArtists;
window.deleteArtist = deleteArtist;
window.toggleFavorite = toggleFavorite;
let favorites = [];
const storedFavorites = localStorage.getItem('favorites');
if (storedFavorites) {
    favorites = JSON.parse(storedFavorites);
}

// Initialize page state
window.onload = function() {
    
    // Fetch artists and albums first
    Promise.all([fetchArtists(), fetchAlbums(artists)])
      .then(() => {
        const lastTab = sessionStorage.getItem("lastTab");
        if (lastTab === "favorites") {
          navigateToFavoritesPage();
        } else if (lastTab === "genre") {
          // Assuming you have a function to navigate to the genre page
          navigateToGenrePage();
        } else {
          // Handle the default case, if needed
        }
      })
      .catch((error) => {
        console.error("Error initializing page:", error);
      });
    createGenreModal();
};


// Create the album-popup and overlay divs
const albumPopup = document.createElement('div');
const overlay = document.createElement('div');

const artistPopup = document.createElement("div");
artistPopup.classList.add("artist-popup");
document.body.appendChild(artistPopup);

// Initialize UI components after artistPopup has been created
initializeUIComponents();

albumPopup.classList.add('album-popup');
overlay.classList.add('overlay');

document.body.appendChild(albumPopup);
document.body.appendChild(overlay);

// To hide the popup and overlay
overlay.addEventListener('click', function(event) {

    if (event.target === overlay) {
        albumPopup.classList.remove('active');
        overlay.classList.remove('active');
        artistPopup.classList.remove('active');
        document.getElementById('genreModal').style.display = 'none';  // Close the genre modal as well
    } else {
    }
});


// Event Listeners for Navigation
document.getElementById('home').addEventListener('click', navigateToHomePage);
document.getElementById('artistsPage').addEventListener('click', navigateToArtistsPage);
document.getElementById('albumsPage').addEventListener('click', navigateToAlbumsPage);
document.getElementById('tracksPage').addEventListener('click', navigateToTracksPage);
document.getElementById('genrePage').addEventListener('click', showGenreModal);
document.getElementById('favoritesPage').addEventListener('click', navigateToFavoritesPage);
document.getElementById('aboutPage').addEventListener('click', navigateToAboutPage);

// Add this function to dynamically add the "Create Artist" button
function addCreateArtistButton() {
    const nav = document.querySelector('nav');
    if (!document.getElementById('createArtistButton')) {
        const createArtistButton = document.createElement('a');
        createArtistButton.id = 'createArtistButton';
        createArtistButton.href = '#';
        createArtistButton.textContent = 'Create Artist';
        createArtistButton.addEventListener('click', showCreateArtistModal);
        nav.appendChild(createArtistButton);
    }
}


// Add this function to dynamically remove the "Create Artist" button
function removeCreateArtistButton() {
    const createArtistButton = document.getElementById('createArtistButton');
    if (createArtistButton) {
        createArtistButton.remove();
    }
}

// To hide the popup and overlay
overlay.addEventListener('click', function() {
    albumPopup.classList.remove('active');
    overlay.classList.remove('active');
    artistPopup.classList.remove('active');
    overlay.classList.remove('active');
});

// Navigation Functions
function navigateToHomePage(event) {
  sessionStorage.setItem('lastTab', 'home');
  removeCreateArtistButton();
  if (event) event.preventDefault();
  const contentDiv = document.getElementById('content');

  contentDiv.classList.add('home-page-body');
  contentDiv.classList.remove('favorites-page');
  contentDiv.innerHTML = `
    <div class="home-container">
      <h1 id="animatedText" class="home-heading">WELCOME...</h1>
      <p class="home-text">Explore artists, albums, and tracks.</p>
    </div>
  `;

  let toggleText = true;
  // Clear any existing interval
  if (homePageInterval) {
    clearInterval(homePageInterval);
  }
  homePageInterval = setInterval(() => {
    const animatedText = document.getElementById('animatedText');
    if (animatedText) { // Check if the element exists
      if (toggleText) {
        animatedText.innerText = "TO MUSIC DIRECTORY!";
      } else {
        animatedText.innerText = "WELCOME...";
      }
      toggleText = !toggleText;
    }
  }, 5000);
}

// Add this function to clear the interval when navigating away from the home page
function clearHomePageInterval() {
  if (homePageInterval) {
    clearInterval(homePageInterval);
  }
}


async function navigateToArtistsPage(event, isInitialLoad = true) {
    document.getElementById('content').classList.remove('favorites-page');
    sessionStorage.setItem('lastTab', 'artists');
    addCreateArtistButton();
    if (event) event.preventDefault();

    // Only set up the search bar and content if it's the initial load
    if (isInitialLoad) {
        setupPageContent('artists', 'Search for artists...');
    }

    // Fetch artists and wait for it to complete
    await fetchArtists();

    // Generate the HTML for artists
    const artistHTML = displayArtists(artists);

    // Insert the generated HTML into the DOM
    const contentDiv = document.getElementById('artists');
    contentDiv.innerHTML = artistHTML;

    // Add event listener to the "Create Artist" button
    const createArtistButton = document.getElementById('create-artist-button');
    if (createArtistButton) {
        createArtistButton.addEventListener('click', showCreateArtistModal);
    }

    // Ensure the search bar event listener is set up correctly
    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
        searchBar.addEventListener('input', function() {
            const query = this.value;
            if (query) {
                searchAndUpdateArtists(query);
            } else {
                navigateToArtistsPage(null, false); // Call with isInitialLoad set to false
            }
        });
    }
}

async function searchAndUpdateArtists(query) {
    try {
        const response = await fetch(`http://localhost:3006/artists/search?q=${query}`);
        const data = await response.json();
        const artistHTML = displayArtists(data);
        const contentDiv = document.getElementById('artists');
        contentDiv.innerHTML = artistHTML;
    } catch (error) {
        console.error('Error searching artists:', error);
    }
}


document.querySelector('.close-btn-create').addEventListener('click', function() {
    document.getElementById('createArtistModal').style.display = 'none';
});

function navigateToAlbumsPage(event) {
    sessionStorage.setItem('lastTab', 'albums');
    document.getElementById('content').classList.remove('favorites-page');
    removeCreateArtistButton();
    if (event) event.preventDefault();
  setupPageContent("albums", "Search for albums...");

  // Fetch artists and then albums after setting up the page content
  fetchArtists().then(() => fetchAlbums(artists));
}

function navigateToTracksPage(event) {
  sessionStorage.setItem("lastTab", "tracks");
  document.getElementById("content").classList.remove("favorites-page");
  removeCreateArtistButton();
  if (event) event.preventDefault();
  setupPageContent("tracks", "Search for tracks...");

  // Create a container for tracks
  const trackContainer = document.createElement("div");
  trackContainer.id = "tracks";
  document.getElementById("content").appendChild(trackContainer);

  // Create and append the album dropdown
  createAlbumDropdown(albums);

  fetchTracks();
}

function createAlbumDropdown(albums) {
  const contentDiv = document.getElementById("content");

  // Create a container for the dropdown
  const dropdownContainer = document.createElement("div");
  dropdownContainer.classList.add("dropdown-container");

  // Create a label and dropdown for albums
  const albumLabel = document.createElement("label");
  albumLabel.innerText = "Filter by Album:";
  const albumDropdown = document.createElement("select");
  albumDropdown.id = "albumDropdown";

  // Add an option to show all tracks
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.innerText = "All Albums";
  albumDropdown.appendChild(allOption);

  // Add options for each album
  albums.forEach((album) => {
    const option = document.createElement("option");
    option.value = album.id;
    option.innerText = album.title;
    albumDropdown.appendChild(option);
  });

 // Append the label and dropdown to the dropdown container
    dropdownContainer.appendChild(albumLabel);
    dropdownContainer.appendChild(albumDropdown);

    // Insert the dropdown container at the top of the content div
    contentDiv.insertBefore(dropdownContainer, contentDiv.firstChild);

  // Add an event listener to the dropdown to filter tracks when an album is selected
  albumDropdown.addEventListener("change", function () {
    const selectedAlbumId = this.value;
    if (Array.isArray(tracks)) {
      let filteredTracks; // Declare the variable here
      if (selectedAlbumId === "all") {
        displayTracks(tracks);
      } else {
        filteredTracks = tracks.filter(
          (track) => track.album_id === parseInt(selectedAlbumId)
        );
        displayTracks(filteredTracks);
      }
    }
  });
}


// Få en unik liste over genrer
function getUniqueGenres() {
    const genres = new Set();
    artists.forEach(artist => {
        if (artist.genres) {  // Check if artist.genres is defined
            const genreArray = artist.genres.split(', ');  // Convert the string to an array
            genreArray.forEach(genre => {
                genres.add(genre);
            });
        }
    });
    return [...genres];
}

function navigateToGenrePage(event) {
    console.log("navigateToGenrePage called");
    sessionStorage.setItem('lastTab', 'genre');
    document.getElementById('content').classList.remove('favorites-page');
    
    // Use the flag variable to conditionally remove the "Create Artist" button
    if (isNavigatingToGenrePage) {
        removeCreateArtistButton();
    }
    
    if (event) event.preventDefault();
    
    const uniqueGenres = getUniqueGenres(); 

    let genreListHTML = '';
    uniqueGenres.forEach((genre, index) => {
        if (index % 5 === 0) genreListHTML += `<div class="genre-row">`;

        genreListHTML += `<div class="genre-icon" onclick="showArtistsByGenre('${genre}')">
            <img src="./genre-icons/${genre}.png" alt="${genre}"> 
            <p>${genre}</p>
        </div>`;

        if ((index + 1) % 5 === 0 || index === uniqueGenres.length - 1) genreListHTML += `</div>`;
    });

    const genreModal = document.getElementById('genreModal');
    if (genreModal) {
        console.log("Genre modal found");
        const genreContent = genreModal.querySelector('#genre-content');
        if (genreContent) {
            genreContent.innerHTML = genreListHTML;
        } else {
            console.error('Element with id "genre-content" not found');
        }
        genreModal.style.display = "block";
    } else {
        console.log("Genre modal not found");
        // Handle the error appropriately, maybe show a message to the user
    }
}


function navigateToFavoritesPage(event) {
    sessionStorage.setItem('lastTab', 'favorites');
    removeCreateArtistButton();
    if (event) event.preventDefault();
    const contentDiv = document.getElementById('content');
    contentDiv.classList.add('favorites-page');

    // Fetch the latest favorites from localStorage
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
    }

    const favoriteArtists = artists.filter(artist => favorites.includes(artist.id));
    const artistHTML = displayArtists(favoriteArtists);
    contentDiv.innerHTML = `
        <h2>Favorites</h2>
        <div class="artist-grid-container">
            ${artistHTML}
        </div>
    `;
}


function navigateToAboutPage(event) {
  sessionStorage.setItem('lastTab', 'about');
  removeCreateArtistButton();
  if (event) event.preventDefault();
  const contentDiv = document.getElementById('content');
  document.getElementById('content').classList.remove('favorites-page');
  contentDiv.innerHTML = `
    <div class="about-container">
      <h2 class="about-heading">About Music Directory</h2>
      <p class="about-text">
        Welcome to Music Directory, your one-stop platform for all things music! Whether you're a casual listener or a dedicated audiophile, our platform offers a comprehensive database of artists, albums, and tracks that will surely pique your interest.
      </p>
      <hr class="about-divider">
      <p class="about-text">
        With Music Directory, you can explore a wide range of genres, from the classics to the latest hits. Our user-friendly interface allows you to easily navigate through artist biographies, album details, and individual tracks. You can even mark your favorite artists and come back to them anytime!
      </p>
      <hr class="about-divider">
      <p class="about-text">
        What sets us apart is our commitment to providing a seamless and enriching user experience. Our platform is constantly updated to include new releases and trending artists. Plus, our search functionality ensures that you find exactly what you're looking for in no time.
      </p>
      <hr class="about-divider">
      <p class="about-text">
        So why wait? Dive into the world of music and discover something new today with Music Directory!
      </p>
    </div>
  `;
}


// Utility Functions
function setupPageContent(sectionId, placeholderText) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = `
        <input type="text" id="searchBar" placeholder="${placeholderText}">
        <div id="${sectionId}"></div>
    `;

    document.getElementById('searchBar').addEventListener('input', function() {
        const query = this.value;
        if (query) {
            if (sectionId === 'artists') {
                searchArtists(query);
            } else if (sectionId === 'albums') {
                searchAlbums(query);
            } else if (sectionId === 'tracks') {
                searchTracks(query);
            }
        } else {
            if (sectionId === 'artists') {
                fetchArtists();
            } else if (sectionId === 'albums') {
                fetchAlbums();
            } else if (sectionId === 'tracks') {
                fetchTracks();
            }
        }
    });
}

// Fetch and Display Functions
function fetchAlbumsForArtist(artistId) {
  return fetch(`http://localhost:3006/artists/${artistId}/albums`)
    .then((response) => response.json())
    .catch((error) =>
      console.error("Error fetching albums for artist:", error)
    );
}

function fetchAlbums(artists) {
  return fetch("http://localhost:3006/albums")
    .then((response) => response.json())
    .then((data) => {
      albums = data;
      displayAlbums(data, artists);
    })
    .catch((error) => console.error("Error fetching albums:", error));
}

function fetchTracks() {
  fetch("http://localhost:3006/tracks")
    .then((response) => response.json())
    .then((fetchedTracks) => {
      tracks = fetchedTracks; // <-- Update the global tracks array
      displayTracks(fetchedTracks);
    })
    .catch((error) => console.error("Error fetching tracks:", error));
}

async function fetchTracksForAlbum(albumId) {
  const response = await fetch(
    `http://localhost:3006/albums/${albumId}/tracks`);
  const tracks = await response.json();
  return tracks;
}

function fetchArtists() {
    return fetch("http://localhost:3006/artists")
      .then((response) => response.json())
      .then((data) => {
        const updatedArtists = data.map((artist) => ({
          ...artist,
          biography: artist.biography || "Biography not available",
        }));
        updateArtists(updatedArtists);
        displayArtists(updatedArtists);
      })
      .catch((error) => console.error("Error fetching artists:", error));
}

function createGenreModal() {
    const modal = document.createElement('div');
    modal.id = 'genreModal';
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content genre-modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    const genreContent = document.createElement('div');
    genreContent.id = 'genre-content';

    modalContent.appendChild(closeBtn);  // Add this line back if you want the close button
    modalContent.appendChild(genreContent);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

document.getElementById('genreModal').addEventListener('click', function(event) {
    if (event.target === this || event.target.className === 'close-btn') {
        this.style.display = 'none';
    }
});

}

function showGenreModal(event) {
    isNavigatingToGenrePage = false; // Set the flag to false
    showGenre(); // Populate the modal with genres
    document.getElementById('genreModal').style.display = 'block';
    if (event) event.preventDefault();
}

function showGenre(event) {
    if(event) event.preventDefault();
    const uniqueGenres = getUniqueGenres();

let genreListHTML = '';
uniqueGenres.forEach((genre, index) => {
    if (index % 5 === 0) genreListHTML += `<div class="genre-row">`; // Begin a new row every 5 items

    genreListHTML += `<div class="genre-icon" onclick="showArtistsByGenre('${genre}')">
        <img src="./genre-icons/${genre}.png" alt="${genre}"> 
        <p>${genre}</p>
    </div>`;

    if ((index + 1) % 5 === 0 || index === uniqueGenres.length - 1) genreListHTML += `</div>`; // End the row
});

  document.getElementById('genre-content').innerHTML = genreListHTML;
}

async function showArtistsByGenre(genre) {
    isNavigatingToGenrePage = true; 
    removeCreateArtistButton();
    document.getElementById('genreModal').style.display = 'none';
    
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<div class="genre-page"></div>';
    const genrePageDiv = document.querySelector('.genre-page');
    
    // Declare these variables at a higher scope
    let artistListHTML = '';
    let albumListHTML = '';
    
    // Add checkboxes for toggling artists and albums
    let toggleHTML = `
        <div class="toggle-options">
            <input type="checkbox" id="showArtists" checked>
            <label for="showArtists">Show Artists</label>
            <input type="checkbox" id="showAlbums" checked>
            <label for="showAlbums">Show Albums</label>
        </div>
    `;

    if (genrePageDiv) {
         const filteredArtists = artists.filter(artist => {
        return artist.genres && artist.genres.includes(genre); // Add this check
    });
        artistListHTML = `<h1 class="genre">${genre} (Artists) </h1>`;
        let rowOpen = false;

            filteredArtists.forEach((artist, index) => {
            if (index % 4 === 0) {
                artistListHTML += `<div class="artist-row">`;
                rowOpen = true;
            }

            const imageName = `${artist.id}.jpg`;
            artistListHTML += `
                <div class="artist-card">
                    <img src="./artists/${imageName}" alt="${artist.name}">
                    <h3>${artist.name}</h3>
                    <p>${artist.biography}</p>
                    <button class="favorite-btn" data-artist-id="${artist.id}" onclick="event.stopPropagation(); toggleFavorite(${artist.id})">${favorites.includes(artist.id) ? '❤️' : '🤍'}</button>
                </div>
            `;

            if ((index + 1) % 4 === 0 || index === filteredArtists.length - 1) {
                artistListHTML += `</div>`;
                rowOpen = false;
            }
        });

        const filteredAlbums = albums.filter(album => {
            const artist = artists.find(a => a.id === album.artist_id);
            return artist && artist.genres.includes(genre);
        });

albumListHTML = '<h2 id="albumHeader">Albums</h2>';
for (const album of filteredAlbums) {
    const tracks = await fetchTracksForAlbum(album.id);  // Fetch tracks for each album
    let songListHTML = '<ul class="track-list">';
    tracks.forEach((track, i) => {
        songListHTML += `<li>${i + 1}. ${track.title} ${track.duration}</li>`;
    });
    songListHTML += '</ul>';

    albumListHTML += `
        <div class="album-card">
            <img src="http://localhost:3006/albums/${album.id}/image" alt="${album.title}" class="album-cover">
            <div class="album-info">
                <h3>${album.title}</h3>
                <p>Release Date: ${album.release_date}</p>
                ${songListHTML}
            </div>
        </div>`;
}

    // Combine toggle options, artist list, and album list
genrePageDiv.innerHTML = toggleHTML + artistListHTML + albumListHTML;

// Add event listeners to checkboxes to toggle visibility
document.getElementById('showArtists').addEventListener('change', function() {
    const artistCards = document.querySelectorAll('.artist-card');
    artistCards.forEach(card => {
        card.style.display = this.checked ? 'block' : 'none';
    });
});

document.getElementById('showAlbums').addEventListener('change', function() {
    const albumCards = document.querySelectorAll('.album-card');
    const albumHeader = document.getElementById('albumHeader');
    albumCards.forEach(card => {
        card.style.display = this.checked ? 'block' : 'none';
    });
    albumHeader.style.display = this.checked ? 'block' : 'none';  // Hide or show the album header
});

    } else {
        console.error('genre-page div not found');
    }
}


const genreTabElement = document.getElementById('genrePage');
if (genreTabElement) {
    genreTabElement.addEventListener('click', function() {
        
        // Set the flag variable based on your condition
        isNavigatingToGenrePage = false;
        
        showGenreModal();
    });
} else {
    console.log("Element with ID 'genrePage' not found.");
}


function displayAlbums(albums, artists) {
  const albumContainer = document.getElementById("albums");
  if (!albumContainer) {
    return;
  }

  let html = "";
  albums.forEach((album) => {
    const artist = artists.find((a) => a.id === album.artist_id);
    const artistName = artist ? artist.name : "Unknown Artist";

    html += `
            <div class="album" data-album-id="${album.id}">
                <img src="http://localhost:3006/albums/${album.id}/image" alt="${album.title}">
                <h2>${album.title}</h2>
                <p>Release Date: ${album.release_date}</p>
                <p>${artistName}</p>
            </div>
        `;
  });
  albumContainer.innerHTML = html;
}


function displayTracks(tracks) {
  const trackContainer = document.getElementById("tracks");
  let html = "";
  tracks.forEach((track) => {
    // Find the album using the track's album_id
    const album = albums.find((a) => a.id === track.album_id);

    const albumTitle = album ? album.title : "Unknown Album";
    const albumColor = album ? getColorForAlbum(album.id) : "#ccc"; // getColorForAlbum is a function to get a unique color for each album

    html += `
            <div class="track" style="border-left: 5px solid ${albumColor};">
                <h2>${track.title}</h2>
                <div class="track-info">
                    <span><i class="fas fa-clock"></i> ${track.duration}</span>
                    <span><i class="fas fa-cd"></i> ${albumTitle}</span>
                </div>
            </div>
        `;
  });
  trackContainer.innerHTML = html;
}

function getColorForAlbum(albumId) {
  // This is a simple example. You can expand this to have a unique color for each album.
  const colors = ["#FF5733", "#33FF57", "#5733FF", "#FF33A1", "#33A1FF"];
  return colors[albumId % colors.length];
}

// Album Popup Functionality
document.getElementById('content').addEventListener('click', async function(event) {
    if (event.target.closest('.album')) {
        const albumElement = event.target.closest('.album');
        if (!albumElement) {
            console.error("No album element found!");
            return;
        }
        const albumId = albumElement.getAttribute('data-album-id'); // Extract albumId from the clicked element
        console.log("Album clicked!");
        console.log("Album ID:", albumId);
        const albumTitle = albumElement.querySelector('h2').innerText;
        // Fetch tracks for the clicked album
        const tracks = await fetchTracksForAlbum(albumId);
        console.log("Fetched tracks:", tracks);

        // Generate the tracks list
        const tracksList = tracks.map((track, index) => `
            <li>
                <span class="track-number">${index + 1}.</span>
                <span class="track-title">${track.title}</span>
                <span class="track-duration">${track.duration}</span>
            </li>
        `).join('');

        albumPopup.innerHTML = `
            <div class="album-details">
                <img src="./images/${albumId}.jpg" alt="${albumTitle}" class="album-cover">
                <h2>${albumTitle}</h2>
                <ul class="track-list">
                    ${tracksList}
                </ul>
            </div>
        `;

        // Display the popup and overlay
        albumPopup.classList.add('active');
        overlay.classList.add('active');
    }
});


// Search functions for each section
function searchArtists(query) {
    fetch(`http://localhost:3006/artists/search?q=${query}`)
        .then(response => response.json())
        .then(data => displayArtists(data))
        .catch(error => console.error('Error searching artists:', error));
}

function searchAlbums(query) {
    fetch(`http://localhost:3006/albums/search?q=${query}`)
        .then(response => response.json())
        .then(data => displayAlbums(data))
        .catch(error => console.error('Error searching albums:', error));
}

function searchTracks(query) {
    fetch(`http://localhost:3006/tracks/search?q=${query}`)
        .then(response => response.json())
        .then(data => displayTracks(data))
        .catch(error => console.error('Error searching tracks:', error));
}

// Assuming this is in your main JavaScript module where toggleFavorite is defined
function toggleFavorite(artistId) {
    const wasFavorited = favorites.includes(artistId);

    if (wasFavorited) {
        const index = favorites.indexOf(artistId);
        favorites.splice(index, 1);
    } else {
        favorites.push(artistId);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));

    // Update the heart icon
    const heartButton = document.querySelector(`.favorite-btn[data-artist-id="${artistId}"]`);
    if (heartButton) {
        heartButton.innerHTML = favorites.includes(artistId) ? '❤️' : '🤍';
    }

    // Refresh the favorites view if an artist is unfavorited and you're on the favorites page
    if (wasFavorited && !favorites.includes(artistId) && sessionStorage.getItem('lastTab') === 'favorites') {
    }
}

// Display artists Function
function displayArtists(artistsList) {
  return artistsList
    .map((artist) => {
      const artistComponent = new ArtistComponent(artist, favorites, albums);
      return artistComponent.render();
    })
    .join("");
}

document.getElementById("content").addEventListener("click", function (event) {
  const action = event.target.getAttribute("data-action");
  const artistId = event.target.getAttribute("data-artist-id");

  if (action === "edit") {
    event.stopPropagation(); // Stop the event from propagating to the artist card
    const artist = artists.find((a) => a.id === parseInt(artistId));
    if (artist) {
      showEditArtistModal(artist); // Call your function to show the edit modal
      return; // Exit the function early
    }
  }

  if (event.target.closest(".artist-card")) {
    const artistElement = event.target.closest(".artist-card");
    const artistId = artistElement.getAttribute("data-artist-id");
    const artist = artists.find((a) => a.id === parseInt(artistId));
    if (artist) {
      const artistComponent = new ArtistComponent(artist, favorites, albums);
      artistComponent.displayArtistPopup();
    }
  }
});


// Delete artist
function deleteArtists(artistId) {

    const confirmDelete = window.confirm("Are you sure you want to delete this artist?");
    if (!confirmDelete) return;

    // Using the function from rest-service.js to delete the artist
    deleteArtist(artistId)
        .then(() => {
            artists = artists.filter(artist => artist.id !== artistId);
            navigateToArtistsPage();
            alert('Artist has been deleted :)');
        })
        .catch(error => {
            console.error("Error deleting artist:", error);
            alert('There was an issue deleting the artist. Please try again.');
        });
}

window.showArtistsByGenre = showArtistsByGenre;

export {
  displayAlbums,
  displayArtists,
  displayTracks,
  getUniqueGenres,
  fetchArtists,
  showArtistsByGenre,
  fetchAlbums,
  artistPopup,
  overlay,
  albums,
  favorites,
  fetchTracksForAlbum,
  lastViewedArtist,
  albumPopup,
  fetchAlbumsForArtist
};