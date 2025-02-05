const express = require('express');
const router = express.Router();
const { scrape1337x } = require('../scraper');
const torrentManager = require('../utils/torrent');

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Search query required' });
    
    const results = await scrape1337x(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/download', async (req, res) => {
  try {
    const magnetUri = req.query.magnet;
    if (!magnetUri) return res.status(400).json({ error: 'Magnet URI required' });

    const torrent = await torrentManager.addTorrent(magnetUri);
    res.json({
      infoHash: torrent.infoHash,
      fileName: torrent.file.name,
      progress: torrent.progress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;