const WebTorrent = require('webtorrent');
const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const { ACCEPTED_FILE_TYPES, TORRENT_EVENTS } = require('../config/constants');

class TorrentManager {
  constructor() {
    this.client = new WebTorrent();
    this.downloadDir = process.env.DOWNLOAD_DIR || './downloads';
    this.activeTorrents = new Map();
    
    fs.ensureDirSync(this.downloadDir);
  }

  async addTorrent(magnetUri) {
    return new Promise((resolve, reject) => {
      const torrent = this.client.add(magnetUri, { path: this.downloadDir });
      
      const cleanup = () => {
        TORRENT_EVENTS.forEach(event => torrent.removeAllListeners(event));
      };

      torrent.on('error', err => {
        cleanup();
        reject(err);
      });

      torrent.on('ready', () => {
        const videoFile = torrent.files.find(file => 
          ACCEPTED_FILE_TYPES.includes(mime.lookup(file.name))
        );

        if (!videoFile) {
          cleanup();
          return reject(new Error('No playable video file found'));
        }

        this.activeTorrents.set(torrent.infoHash, torrent);
        resolve({
          infoHash: torrent.infoHash,
          name: torrent.name,
          file: videoFile,
          progress: torrent.progress,
          ready: torrent.ready
        });
      });
    });
  }

  getTorrent(infoHash) {
    return this.activeTorrents.get(infoHash);
  }

  removeTorrent(infoHash) {
    const torrent = this.activeTorrents.get(infoHash);
    if (torrent) {
      torrent.destroy();
      this.activeTorrents.delete(infoHash);
    }
  }
}

module.exports = new TorrentManager();