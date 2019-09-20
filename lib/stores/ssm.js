'use strict';

const AWS = require('aws-sdk');
const ssm = new AWS.SSM();

const provide = {};

let count = 0;

/**
 * Calls AWS API to get up to 10 param payloads starting
 * with `path` after the provided `nextToken`
 * @param {String} path pattern to match against
 * @param {String} nextToken starting point page of results.
 * If null or undefined, will start with page 0 of results.
 */
const get = async (path, nextToken) => {
  count++;
  return new Promise((resolve, reject) => {
    const params = {
      Path: path,
      MaxResults: 10,
      Recursive: true,
      WithDecryption: true
    };
    if (nextToken) params.NextToken = nextToken;
    ssm.getParametersByPath(params, function(err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

/**
 * Returns array of all param payloads where param 
 * name starts with the provided `path`
 * @param {String} path pattern to match against 
 */
const getAll = async (path) => {
  let results = [];
  let lastKnownToken = null;
  while (true) {
    const { Parameters, NextToken } = await get(path, lastKnownToken);
    if (Parameters && Parameters.length) {
      results.push(...Parameters);
    }
    if (NextToken) {
      lastKnownToken = NextToken;
    } else {
      return results;
    }
  }
}

/**
 * Parses raw AWS SSM parameter data into key/values.
 * @param {String} path path of parameter name not desired 
 * in the final env var key
 * @param {Object} params raw list of params from AWS API 
 */
const parseRawParams = (path, params) => {
	const results = {};
	for (let param of params) {
		const key = param.Name.split(path)[1];
		results[key] = param.Value;
	}
	return results;
}

/**
 * Returns `true` if sufficient param store info
 * is available in file.
 * @param {Object} fileinfo parsed fileinfo JSON from cstore.yml
 */
provide.isValidFileInfo = (fileinfo) => {
  return true;
}

/**
 * Return configs in key/value format given cStore context 
 * and parsed JSON file info
 * @param {String} context context value from cstore.yml
 * @param {Object} fileinfo parsed fileinfo JSON from cstore.yml
 */
provide.getConfigs = async (context, fileinfo) => {
  const path = `/${context}/${fileinfo.path}/`;
  const params = await getAll(path);
  const envVars = parseRawParams(path, params);
  return envVars;
}

module.exports = provide;