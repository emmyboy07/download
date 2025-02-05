const API_BASE_URL = "http://localhost:10000";

async function searchMovies() {
    const query = document.getElementById("searchInput").value.trim();
    if (!query) return;

    document.getElementById("errorMessage").textContent = "";
    document.getElementById("results").innerHTML = "Searching...";

    try {
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();

        if (results.error) throw new Error(results.error);
        displayResults(results);
    } catch (error) {
        document.getElementById("errorMessage").textContent = error.message;
    }
}

function displayResults(results) {
    const container = document.getElementById("results");
    container.innerHTML = results.map(result => `
        <div class="movie-item">
            <h3>${result.title}</h3>
            <p>Size: ${result.size} | Seeders: ${result.seeders}</p>
            <button onclick="startDownload('${result.magnet}')">Download</button>
        </div>
    `).join("");
}

async function startDownload(magnet) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/download?magnet=${encodeURIComponent(magnet)}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        document.getElementById("playerContainer").classList.remove("hidden");
        document.getElementById("videoSource").src = `${API_BASE_URL}/stream/${data.infoHash}?file=${encodeURIComponent(data.fileName)}`;
        document.getElementById("videoPlayer").load();
        
        trackProgress(data.infoHash);
    } catch (error) {
        document.getElementById("errorMessage").textContent = error.message;
    }
}

function trackProgress(infoHash) {
    setInterval(async () => {
        const response = await fetch(`${API_BASE_URL}/api/progress/${infoHash}`);
        const data = await response.json();

        document.getElementById("progress").textContent = data.progress;
        document.getElementById("status").textContent = data.done ? "Ready" : "Downloading...";
    }, 2000);
}
