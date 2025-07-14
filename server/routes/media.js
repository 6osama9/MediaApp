const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const MEDIA_DIR = path.join(__dirname, '../../media');
const SUPPORTED_EXT = ['.mp3', '.m4a', '.mp4'];

// GET /api/media - Liste aller Mediendateien
router.get('/', (req, res) => {
  fs.readdir(MEDIA_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Fehler beim Lesen des Medienordners.' });
    const media = files
      .filter(f => SUPPORTED_EXT.includes(path.extname(f).toLowerCase()))
      .map(f => ({
        filename: f,
        url: `/media/${encodeURIComponent(f)}`,
        title: path.parse(f).name
      }));
    res.json(media);
  });
});

// Statische Auslieferung der Mediendateien
router.use('/', express.static(MEDIA_DIR));

module.exports = router; 