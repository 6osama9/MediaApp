const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Registrierung
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Benutzername und Passwort erforderlich.' });
  }
  try {
    const existing = await User.findUserByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'Benutzername bereits vergeben.' });
    }
    const user = await User.createUser(username, password);
    res.status(201).json({ message: 'Registrierung erfolgreich', user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: 'Fehler bei der Registrierung.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Benutzername und Passwort erforderlich.' });
  }
  try {
    const user = await User.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Ungültige Zugangsdaten.' });
    }
    const valid = await User.validatePassword(user, password);
    if (!valid) {
      return res.status(401).json({ error: 'Ungültige Zugangsdaten.' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login erfolgreich', token, user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Login.' });
  }
});

module.exports = router; 