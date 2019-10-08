const crypto = require('crypto');
const fs = require('fs');

/**
 * Generate and return a random string with `len` characters.
 * @param {Number} len number of desired characters
 */
function randomValueHex(len) {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString('hex')
    .slice(0, len)
}

/**
 * Returns a promise that will write `data` to `path` using `fs.writeFile`
 * @param {String} path absolute filepath
 * @param {String} data data to be stored in file 
 */
function writeFile(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, err => {
      if (err) reject(err);
      else resolve(path);
    });
  });
}

const provide = {};

/**
 * Saves `data` to random file location relative to `process.cwd()`.
 * Returns the absolute path to the randomly saved file.
 * @param {String} data data to be stored in file
 * @param {Stirng} extension file extension including the dot. If not provided 
 * uses `.env`
 */
provide.saveToRandomLocation = async (data, extension = `.env`) => {
  const randomFilename = randomValueHex(12);
  const filepath = `${process.cwd()}/${randomFilename}${extension}`;
  await writeFile(filepath, data);
  return filepath;
}

module.exports = provide;