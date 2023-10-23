import { createArtist, updateArtist, createAlbum, createTrack } from './CRUD.js';
import { getUniqueGenres, fetchArtists } from './main.js';


window.toggleGenreSelection = function(element) {
    element.classList.toggle('selected');
};

// Function to show the "Create Artist" form
export function showCreateArtistModal(event) {
  if (event) event.preventDefault();
  const uniqueGenres = getUniqueGenres();

  const genreBobbles = uniqueGenres
    .map(
      (genre) => `
        <div class="genre-label" data-genre="${genre}" onclick="toggleGenreSelection(this)">
            <span>${genre}</span>
        </div>
    `
    )
    .join("");

  const formHTML = `
    <form id="create-artist-form">
        <img src="./genre-icons/create.png" id="CreateArtist" alt="Create Artist"/> <!-- Include the image here -->
        <h1 id="createText">Create New Artist</h1> 
        <label for="name">Name:</label>
        <input type="text" id="name" required>
        
        <label>Genres:</label>
        <div id="genres-bobbles">
            ${genreBobbles}
        </div>
        
        <label>Image:</label>
        <div>
            <input type="radio" id="uploadImage" name="imageSource" value="upload" checked>
            <label for="uploadImage">Upload</label>
            <input type="radio" id="imageLink" name="imageSource" value="link">
            <label for="imageLink">Link</label>
        </div>
        
        <input type="file" id="imageUpload" accept="image/*">
        <input type="text" id="imageLinkInput" placeholder="Image Link" style="display: none;">
        
        <label for="biography">Biography:</label>
        <textarea id="biography" required></textarea>
        
        <label>Albums:</label>
        <div id="albums-container">
            <div class="album-entry">
                <label for="albumName">Album Name:</label>
                <input type="text" class="album-name">
                <label for="albumTracks">Tracks (comma-separated):</label>
                <input type="text" class="album-tracks">
                <label for="albumCover">Album Cover:</label>
                <input type="file" class="album-cover" accept="image/*">
            </div>
        </div>
        <button type="button" id="addAlbumButton">Add Another Album</button>
        
        <button type="submit">Create Artist</button>
    </form>
`;

  // Create the modal and content containers
  const modalContainer = document.createElement("div");
  modalContainer.id = "createArtistModal";
  modalContainer.classList.add("create-artist-modal");
  const modalContent = document.createElement("div");
  modalContent.id = "create-artist-content";
  modalContent.innerHTML = formHTML;

  // Append everything
  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);

  // Display the modal
  modalContainer.style.display = "block";

  // Add event listener for form submission
  document
    .getElementById("create-artist-form")
    .addEventListener("submit", handleCreateArtistFormSubmission);

  // Attach the addAlbumField function to the "Add Another Album" button
  document
    .getElementById("addAlbumButton")
    .addEventListener("click", addAlbumField);

  // Add event listener to close the modal when clicking outside of it
  modalContainer.addEventListener("click", function (event) {
    const formElement = document.getElementById("create-artist-form");
    if (!formElement.contains(event.target)) {
      modalContainer.style.display = "none";
      document.body.removeChild(modalContainer);
    }
  });
}

// Add this function to your JavaScript file
function toggleGenreSelection(element) {
    element.classList.toggle('selected');
}

async function handleCreateArtistFormSubmission(event) {
  event.preventDefault();
  console.log("handleCreateArtistFormSubmission called");

  const newArtist = {
    name: document.getElementById("name").value,
    genres: Array.from(document.querySelectorAll(".genre-label.selected")).map(
      (element) => element.getAttribute("data-genre")
    ),
    biography: document.getElementById("biography").value,
  };

  // Create a new FormData object
  const formData = new FormData();
  formData.append("name", newArtist.name);
  formData.append("genres", newArtist.genres.join(","));
  formData.append("biography", newArtist.biography);

  // Check which image source option is selected
  const uploadImageRadio = document.getElementById("uploadImage");
  if (uploadImageRadio.checked) {
    // Handle image upload
    const imageFile = document.getElementById("imageUpload").files[0];
    if (imageFile) {
      formData.append("image", imageFile);
    }
  } else {
    // If using an image link, you can append it to formData as well
    const imageLink = document.getElementById("imageLinkInput").value;
    formData.append("imageLink", imageLink);
  }

  // Collect album and track data
  const albumElements = document.querySelectorAll(".album-entry");
  const albums = Array.from(albumElements).map((albumElement) => {
    const album = {
      name: albumElement.querySelector(".album-name").value,
      tracks: albumElement
        .querySelector(".album-tracks")
        .value.split(",")
        .map((track) => track.trim()),
    };

    // Handle album image upload
    const albumImageFile = albumElement.querySelector(".album-image-upload")
      .files[0];
    if (albumImageFile) {
      formData.append(`albumImage_${album.name}`, albumImageFile);
    }

    return album;
  });
  newArtist.albums = albums;

  try {
    // Call the createArtist function from CRUD.js
    const artistData = await createArtist(formData);

    // Now, use the artistData.id for creating the album
    if (artistData && artistData.id) {
      for (const album of newArtist.albums) {
        const createdAlbum = await createAlbum(album.name, artistData.id);
        for (const track of album.tracks) {
          await createTrack(track, createdAlbum.id);
        }
      }
    } else {
      throw new Error("Artist ID is missing after creation.");
    }

    // Refresh the artists list
    await fetchArtists();

    // Close the modal
    const modals = document.querySelectorAll("#createArtistModal");
    modals.forEach((modal) => {
      modal.style.display = "none";
      document.body.removeChild(modal);
    });

    // Show success alert
    alert("Artist and associated albums/tracks have been created :)");
  } catch (error) {
    // Show error alert
    alert("Failed to create artist and associated albums/tracks :(");
    console.error("Error creating artist:", error);
  }
}

function addAlbumField() {
  const albumContainer = document.getElementById("albums-container");
  const albumEntry = document.createElement("div");
  albumEntry.className = "album-entry";
  albumEntry.innerHTML = `
        <label for="albumName">Album Name:</label>
        <input type="text" class="album-name">
        <label for="albumTracks">Tracks (comma-separated):</label>
        <input type="text" class="album-tracks">
        <label for="albumCover">Album Cover:</label>
        <input type="file" class="album-cover" accept="image/*">
    `;
  albumContainer.appendChild(albumEntry);
}

// Function to show the "Edit Artist" form
export function showEditArtistModal(artist) {
    const uniqueGenres = getUniqueGenres();

    const genreBobbles = uniqueGenres.map(genre => `
        <div class="genre-label" data-genre="${genre}" onclick="toggleGenreSelection(this)">
            <span>${genre}</span>
        </div>
    `).join('');

    const formHTML = `
        <form id="edit-artist-form">
            <img src="./artists/${artist.id}.jpg" id="EditArtistImage" alt="Edit Artist"/>
            <label for="name">Name:</label>
            <input type="text" id="name" required>
            <label>Genres:</label>
            <div id="genres-bobbles">
                ${genreBobbles}
            </div>
            <label>Image:</label>
            <div>
                <input type="radio" id="uploadImage" name="imageSource" value="upload" checked>
                <label for="uploadImage">Upload</label>
                <input type="radio" id="imageLink" name="imageSource" value="link">
                <label for="imageLink">Link</label>
            </div>
            <input type="file" id="imageUpload" accept="image/*">
            <input type="text" id="imageLinkInput" placeholder="Image Link" style="display: none;">
            <label for="biography">Biography:</label>
            <textarea id="biography" required></textarea>
            <button type="submit">Update Artist</button>
        </form>
    `;

    // Create the modal and content containers
    const modalContainer = document.createElement('div');
    modalContainer.id = 'editArtistModal';
    modalContainer.classList.add('edit-artist-modal');
    const modalContent = document.createElement('div');
    modalContent.id = 'edit-artist-content';
    modalContent.innerHTML = formHTML;

    // Append everything
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);

    // Display the modal
    modalContainer.style.display = 'block';

    // Populate the form fields with the existing artist data
    document.getElementById('name').value = artist.name || '';
    document.getElementById('biography').textContent = artist.biography || '';

   // Handle genres (assuming genres is a comma-separated string)
    if (artist.genres) {
        const artistGenres = artist.genres.split(', '); // Convert the string to an array
        artistGenres.forEach(genre => {
            const genreElement = document.querySelector(`.genre-label[data-genre="${genre}"]`);
            if (genreElement) {
                genreElement.classList.add('selected');
            }
        });
    }

    // Add event listener for form submission
    document.getElementById('edit-artist-form').addEventListener('submit', function(event) {
        handleEditArtistFormSubmission(event, artist.id);
    });

    // Add event listener to close the modal when clicking outside of it
    modalContainer.addEventListener('click', function(event) {
        const formElement = document.getElementById('edit-artist-form');
        if (!formElement.contains(event.target)) {
            modalContainer.style.display = 'none';
            document.body.removeChild(modalContainer);
        }
    });
}

// Function to handle form submission for editing an artist
function handleEditArtistFormSubmission(event, artistId) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const genres = Array.from(document.querySelectorAll('.genre-label.selected')).map(element => element.getAttribute('data-genre')).join(', ');
    const biography = document.getElementById('biography').value;
    let image = ''; // Initialize image as an empty string

    // Check which image source option is selected
    const uploadImageRadio = document.getElementById('uploadImage');
    if (uploadImageRadio.checked) {
        // Handle image upload
        const imageFile = document.getElementById('imageUpload').files[0];
        if (imageFile) {
            image = imageFile.name;
        }
    } else {
        // Handle image link
        image = document.getElementById('imageLinkInput').value;
    }

    // Call the updateArtist function from CRUD.js
    updateArtist(artistId, name, genres, biography)
        .then(() => {
            // Close the modal
            const modal = document.getElementById('editArtistModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.removeChild(modal);
            }

            // Show a success alert
            alert('Artist has been updated successfully.');

            // Refresh the artist list
            fetchArtists();  // This function should re-fetch the artists and update the UI
        })
        .catch((error) => {
            // Handle error, e.g., show an error message
            alert('Failed to update artist.');
            console.error('Error updating artist:', error);
        });
}
