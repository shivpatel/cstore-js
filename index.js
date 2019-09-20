const parser = require('./lib/parser');
const s3 = require('./lib/stores/s3');
const ssm = require('./lib/stores/ssm');

const provide = {};

const stores = {
  'aws-s3': s3.getConfigs,
  'aws-parameter': ssm.getConfigs
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
  const doc = parser.parseYaml(ymlPath);
  const context = doc.context;
  const fileinfos = parser.locateTag(doc, tag);
  let envVarsMerged = {};
  for (let fileinfo of fileinfos) {
	  if (!stores[fileinfo.store]) {
	    throw new Error(`cstore-pull - unsupported store type ${fileinfo.store}`);
	  }
	  const envVars = await stores[fileinfo.store](context, fileinfo);
	  envVarsMerged = Object.assign(envVarsMerged, envVars);
  }
  console.info(`Loaded configuration for ${tag}`);
  if (injectIntoProcess) {
    for (let envKey in envVarsMerged) {
      process.env[envKey] = envVarsMerged[envKey];
    }
    console.info('Injected configuration into process.env');
  }
  return envVarsMerged;
}

module.exports = provide;