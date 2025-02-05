const API_BASE_URL = "http://localhost:10000";

// Fetch list of downloaded movies from the server
async function fetchDownloadedMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/list-downloads`);
        const movies = await response.json();

        if (movies.length === 0) {
            document.getElementById("downloadedMovies").innerHTML = "<p>No movies found.</p>";
            return;
        }

        const container = document.getElementById("downloadedMovies");
        container.innerHTML = movies.map(movie => `
            <div class="movie-item" onclick="playMovie('${movie.fileName}')">
                🎬 ${movie.fileName}
            </div>
        `).join("");
    } catch (error) {
        console.error("Failed to fetch downloaded movies", error);
    }
}

// Play the selected movie
function playMovie(fileName) {
    document.getElementById("playerContainer").classList.remove("hidden");
    document.getElementById("videoSource").src = `${API_BASE_URL}/stream-local?file=${encodeURIComponent(fileName)}`;
    document.getElementById("videoPlayer").load();
    document.getElementById("videoPlayer").play();
}

// Load movies when the page is opened
fetchDownloadedMovies();
