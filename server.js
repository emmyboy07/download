require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { scrape1337x } = require('./scraper');
const WebTorrent = require('webtorrent');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const client = new WebTorrent();
const PORT = process.env.PORT || 3000;
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || './downloads';

// Ensure download directory exists
fs.ensureDirSync(DOWNLOAD_DIR);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Search query required' });

    console.log(`Searching for: ${query}`);
    const results = await scrape1337x(query);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download endpoint
app.get('/api/download', async (req, res) => {
  try {
    const magnet = req.query.magnet;
    if (!magnet) return res.status(400).json({ error: 'Magnet link required' });

    console.log(`Starting download: ${magnet.slice(0, 50)}...`);
    const torrent = client.add(magnet, { path: DOWNLOAD_DIR });

    torrent.on('ready', () => {
      const videoFile = torrent.files.find(file => 
        file.name.endsWith('.mp4') || 
        file.name.endsWith('.mkv') ||
        file.name.endsWith('.avi')
      );

      if (!videoFile) {
        return res.status(404).json({ error: 'No video file found' });
      }

      res.json({
        infoHash: torrent.infoHash,
        fileName: videoFile.name,
        progress: torrent.progress
      });
    });

    torrent.on('error', error => {
      console.error('Torrent error:', error);
      res.status(500).json({ error: error.message });
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Streaming endpoint
app.get('/stream/:infoHash', (req, res) => {
  const torrent = client.get(req.params.infoHash);
  if (!torrent) return res.status(404).send('Torrent not found');

  const file = torrent.files.find(f => f.name === req.query.file);
  if (!file) return res.status(404).send('File not found');

  res.setHeader('Content-Type', 'video/mp4');
  file.createReadStream().pipe(res);
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



// Endpoint to list downloaded files
app.get('/api/downloads', (req, res) => {
  try {
    const files = fs.readdirSync(DOWNLOAD_DIR);
    const downloads = files.map(file => ({
      name: file,
      size: `${(fs.statSync(path.join(DOWNLOAD_DIR, file)).size / (1024 * 1024)).toFixed(2)} MB`,
      fileName: file
    }));
    res.json(downloads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve downloaded files
app.use('/downloads', express.static(DOWNLOAD_DIR));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});