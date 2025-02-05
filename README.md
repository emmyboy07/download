# Torrent Backend

This is the backend for a torrent streaming application. It provides APIs for searching, downloading, and streaming torrents.

## Features
- Search torrents by movie name
- Download torrents via magnet links
- Stream videos while downloading
- Progress tracking

## Deployment to Render
1. Push the code to a GitHub repository.
2. Create a new Web Service on Render.
3. Connect your GitHub repository.
4. Set the environment variables in the Render dashboard:
   - `PORT=3000`
   - `NODE_ENV=production`
   - `DOWNLOAD_DIR=./downloads`
5. Deploy!

## Local Development
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install