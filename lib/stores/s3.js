'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const provide = {};

/**
 * Return contents of S3 object as UTF8 string
 * @param {String} Bucket S3 bucket name 
 * @param {*} Key Object key name
 */
const get = async (Bucket, Key) => {
  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket,
        Key
      },
      function (err, data) {
        if (!data || !!err) reject(err);
        else resolve(data.Body.toString('utf8'));
      }
    );
  });
};

/**
 * Returns `true` if sufficient param store info
 * is available in file.
 * @param {Object} fileinfo parsed fileinfo JSON from cstore.yml
 */
provide.isValidFileInfo = (fileinfo) => {
  if (!fileinfo.data.AWS_S3_BUCKET) {
    throw new Error(`cstore-pull - missing AWS S3 bucket name`);
  }
  return true;
}

/**
 * Return configs in key/value format given cStore context 
 * and parsed JSON file info
 * @param {String} context Context from cstore.yml
 * @param {Object} fileinfo Parse fileinfo JSON from cstore.yml
 */
provide.getConfigs = async (context, fileinfo) => {
  const key = `${context}/${fileinfo.path}`;
  const bucket = fileinfo.data.AWS_S3_BUCKET;
  const envVars = {};
  let data = await get(bucket, key);
  data = data.split('\n');
  for (let entry of data) {
    if (!entry) continue; // for empty rows
    const equalIndex = entry.indexOf('=');
    const key = entry.substring(0, equalIndex);
    const value = entry.substring(equalIndex + 1);
    envVars[key] = value;
  }
  return envVars;
}

module.exports = provide;