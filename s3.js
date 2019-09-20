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
      function(err, data) {
        if (!data || !!err) reject(err);
        else resolve(data.Body.toString('utf8'));
      }
    );
  });
};

/**
 * Locate and return file info from parsed YAML given tag name
 * @param {Object} parsedYaml Processed YAML file in JSON format
 * @param {String} tag Tag name
 */
provide.locateTag = (parsedYaml, tag) => {
  const files = Object.keys(parsedYaml.files);
  let desiredFile = null;
  for (let file of files) {
    const fileinfo = parsedYaml.files[file];
    if (fileinfo.tags && fileinfo.tags.includes(tag)) {
      desiredFile = fileinfo;
      break;
    }
  }
  if (desiredFile === null) {
    throw new Error('cstore-pull - tag not found');
  }
  if (desiredFile.store !== 'aws-s3') {
    throw new Error(`cstore-pull - unsupported store ${desiredFile.store}`);
  }
  if (!desiredFile.data.AWS_S3_BUCKET) {
    throw new Error(`cstore-pull - missing AWS S3 bucket name`);
  }
  return desiredFile;
}

/**
 * Return configs in key/value format given cStore context 
 * and parsed JSON file info
 * @param {String} context Context from cstore.yml
 * @param {Object} fileinfo Parse fileinfo JSON from cstore.yml
 */
provide.getConfig = async (context, fileinfo) => {
  const key = `${context}/${fileinfo.path}`;
  const bucket = fileinfo.data.AWS_S3_BUCKET;
  const envVars = {};
  let data = await get(bucket, key);
  data = data.split('\n');
  for (let entry of data) {
    if (!entry) continue; // for empty rows
    const equalIndex = entry.indexOf('=');
    const key = entry.substring(0, equalIndex);
    const value = entry.substring(equalIndex+1);
    envVars[key] = value;
  }
  return envVars;
}

module.exports = provide;