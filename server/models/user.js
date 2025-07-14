const db = require('../database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const createUser = (username, password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
      if (err) return reject(err);
      db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hash],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, username });
        }
      );
    });
  });
};

const findUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const validatePassword = (user, password) => {
  return bcrypt.compare(password, user.password);
};

module.exports = {
  createUser,
  findUserByUsername,
  validatePassword,
}; 