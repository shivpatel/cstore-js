const yaml = require('js-yaml');
const fs   = require('fs');
const s3   = require('./s3.js');

const provide = {};

/**
 * Given full file path, return contents of file in UTF8
 * @param {String} path Absolute path to cstore.yml file 
 */
const parseYaml = (path) => {
  const doc = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
  return doc;
}

/**
 * Pull configs via cStore (S3) given the provided cstore.yml path and env tag
 * @param {String} ymlPath Absolute path to cstore.yml file 
 * @param {String} tag Name of the desired env tag
 * @param {Boolean} injectIntoProcess If `true`, env vars will be automatically
 * injected into process.env
 */
provide.pull = async (ymlPath, tag, injectIntoProcess = true) => {
  console.info(`Loading configuration for ${tag}`);
  const doc = parseYaml(ymlPath);
  const context = doc.context;
  const fileinfo = s3.locateTag(doc, tag);
  const envVars = await s3.getConfig(context, fileinfo);
  console.info(`Loaded configuration for ${tag}`);
  if (injectIntoProcess) {
    for (let envKey in envVars) {
      process.env[envKey] = envVars[envKey];
    }
    console.info('Injected configuration into process.env');
  }
  return envVars;
}

module.exports = provide;