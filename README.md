# JavaScript module for `cstore pull`

cstore-pull is a lightweight JavaScript module for pulling cStore configs in Node. It currently **only supports the cStore S3 storage method**; SSM Parameter Store and Secrets Manager coming soon. cstore-pull can automatically inject your configs into Node's `process.env`.

This module is only intended for use alongside an existing [cStore](https://github.com/turnerlabs/cstore) setup.

Supports up to cStore `2.5.1`.

## Installation

### npm
`npm install cstore-pull --save`

### yarn
`yarn add cstore-pull`

## Usage

```
const cstore = require('cstore-pull');

const initApp = async () => {
  
  const ymlPath = `${process.cwd()}/cstore.yml`;
  const tag = process.env.NODE_ENV;
  const injectIntoProcess = true;
  
  const configs = await cstore.pull(ymlPath, tag, injectIntoProcess);
  
  // Connect to DB
  // Start express.js, etc.
  
}

init();
```

## API

### pull (ymlPath: String, tag: String, injectIntoProcess: Boolean)

Locates the given `tag` in the `cstore.yml` file located at `ymlPath`. Fetches the corresponding object from S3 if the tag and file information is found. Parses file contents and returns an object with env vars as key/value pairs.

Params:
- `ymlPath` *(required)* - absolute path to your `cstore.yml` file
- `tag` *(required)* - a valid tag associated to the env you're pulling configs for
- `injectIntoProcess` *(default: `true`)* - if `true`, pulled configs will automatically be injected into Node's `process.env`
