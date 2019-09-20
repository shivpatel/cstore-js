'use strict';

const AWS = require('aws-sdk');
const secretsmanager = new AWS.SecretsManager();

const provide = {};

/**
 * Fetches value for key from Secrets Manager given path as SecretId
 * @param {String} path SecretId
 * @param {String} key secret key name
 */
const get = async (path, key) => {
	return new Promise((resolve, reject) => {
		const params = {
			SecretId: path
		};
		secretsmanager.getSecretValue(params, function (err, data) {
			if (err) reject(err);
			else {
				if (data && data.SecretString) {
					resolve(JSON.parse(data.SecretString)[key]);
				} else {
					reject(`Key ${key} not found in secrets manager at ${path}`);
				}
			}
		});
	});
}

/**
 * Returns `true` if `val` matches cStore secret format.
 * @param {String} val any string to test
 */
const isInSecretFormat = (val) => {
	return /{{.+\/.+}}/.test(val);
}

/**
 * Parses Object of key/values for any in cStore secret syntax.
 * Fetches secret and replaces secret syntax with actual decrypted value.
 * @param {String} context context from cstore.yml
 * @param {Object} envVars key/value of env variables to scan
 */
provide.findAllAndInject = async (context, envVars) => {
	for (let key in envVars) {
		if (isInSecretFormat(envVars[key])) {
			let cstoreToken = envVars[key];
			cstoreToken = cstoreToken.slice(2, -2);
			const [pathB, secretKey] = cstoreToken.split('/');
			const pathC = key.toLowerCase().replace(/_/g, '-');
			const fullpath = `${context}/${pathB}/${pathC}`;
			envVars[key] = await get(fullpath, secretKey);
		}
	}
	return envVars;
}

module.exports = provide;