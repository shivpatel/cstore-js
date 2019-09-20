const yaml = require('js-yaml');
const fs   = require('fs');

const provide = {};

/**
 * Given full file path, return contents of file in UTF8
 * @param {String} path Absolute path to cstore.yml file 
 */
provide.parseYaml = (path) => {
  const doc = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
  return doc;
}

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
  return desiredFile;
}

module.exports = provide;