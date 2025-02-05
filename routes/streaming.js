const express = require('express');
const router = express.Router();
const torrentManager = require('../utils/torrent');
const mime = require('mime-types');

router.get('/:infoHash', (req, res) => {
  const torrent = torrentManager.getTorrent(req.params.infoHash);
  if (!torrent) return res.status(404).send('Torrent not found');

  const file = torrent.files.find(f => f.name === req.query.file);
  if (!file) return res.status(404).send('File not found');

  const range = req.headers.range;
  if (!range) return res.status(400).send('Requires Range header');

  const fileSize = file.length;
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': end - start + 1,
    'Content-Type': mime.lookup(file.name)
  };

  res.writeHead(206, headers);
  file.createReadStream({ start, end }).pipe(res);
});

module.exports = router;