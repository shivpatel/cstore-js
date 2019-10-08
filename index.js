const parser = require('./lib/parser');
const s3 = require('./lib/stores/s3');
const ssm = require('./lib/stores/ssm');
const secretsmanager = require('./lib/stores/secretsmanager');
const fileSystem = require('./lib/file-system');

const provide = {};

const stores = {
  'aws-s3': s3.getConfigs,
  'aws-parameter': ssm.getConfigs
}

/**
 * Get configs via cStore given the provided yml path and env tag. Returns as key/value object.
 * @param {String} tag Name of the desired env tag
 * @param {String} ymlPath Absolute path to cstore.yml file
 * @param {Boolean} injectSecrets If `true`, env vars referencing secrets manager 
 * will be fetched and returned in decrypted form. 
 */
const getConfigs = async (tag, ymlPath, injectSecrets) => {
  console.info(`Loading configuration for ${tag}`);
  const doc = parser.parseYaml(ymlPath);
  const context = doc.context;
  const fileinfos = parser.locateTag(doc, tag);
  let envVarsMerged = {};
  for (let fileinfo of fileinfos) {
    if (!stores[fileinfo.store]) {
      throw new Error(`cstore-js - unsupported store type ${fileinfo.store}`);
    }
    const envVars = await stores[fileinfo.store](context, fileinfo);
    envVarsMerged = Object.assign(envVarsMerged, envVars);
  }
  if (injectSecrets) {
    await secretsmanager.findAllAndInject(context, envVarsMerged);
  }
  console.info(`Loaded configuration for ${tag}`);
  return envVarsMerged;
}

/**
 * Pull configs via cStore given the provided cstore.yml path and env tag. Returns as object.
 * Will also inject straight into `process.env`.
 * @param {String} tag Name of the desired env tag
 * @param {String} ymlPath Absolute path to cstore.yml file. Defaults to process.cwd()/cstore.yml
 * @param {Boolean} injectIntoProcess If `true`, env vars will be automatically
 * injected into process.env
 * @param {Boolean} injectSecrets If `true`, env vars referencing secrets manager 
 * will be fetched and returned in decrypted form. 
 */
provide.pull = async (tag, ymlPath = `${process.cwd()}/cstore.yml`, injectIntoProcess = true, injectSecrets = true) => {
  const envVarsMerged = await getConfigs(tag, ymlPath, injectSecrets);
  if (injectIntoProcess) {
    for (let envKey in envVarsMerged) {
      process.env[envKey] = envVarsMerged[envKey];
    }
    console.info('Injected configuration into process.env');
  }
  return envVarsMerged;
}

/**
 * Pull configs via cStore given the provided cstore.yml path and env tag. Stores the results
 * in a random.env file located at `process.cwd()`. Returns the absolute filepath for the random
 * env file.
 * @param {String} tag Name of the desired env tag
 * @param {String} ymlPath Absolute path to cstore.yml file. Defaults to process.cwd()/cstore.yml
 * @param {Boolean} injectSecrets If `true`, env vars referencing secrets manager 
 * will be fetched and returned in decrypted form. 
 */
provide.download = async (tag, ymlPath = `${process.cwd()}/cstore.yml`, injectSecrets = true) => {
  const envVarsMerged = await getConfigs(tag, ymlPath, injectSecrets);
  let dataToWrite = '';
  for (let envKey in envVarsMerged) {
    dataToWrite += `${envKey}=${envVarsMerged[envKey]}\n`;
  }
  const filepath = await fileSystem.saveToRandomLocation(dataToWrite);
  return filepath;
}

module.exports = provide;