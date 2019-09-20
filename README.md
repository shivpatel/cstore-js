# JavaScript module for `cstore pull`

[![NPM version](https://img.shields.io/npm/v/cstore-pull.svg)](https://www.npmjs.org/package/cstore-pull)

cstore-pull is a lightweight JavaScript module for pulling cStore configs in Node. It currently **only supports the cStore S3 and SSM Parameter Store storage methods**; values encrypted with Secrets Manager are not supported. cstore-pull can automatically inject your configs into Node's `process.env`.

This module is only intended for use alongside an existing [cStore](https://github.com/turnerlabs/cstore) setup.

Tested against cStore `2.6.2`.

## Installation

**Important:** To minimize package size, `cstore-pull` only includes the `aws-sdk` package as a dev dependency. You must have the `aws-sdk` available in your project when creating a production-ready build. AWS Lambda function code is immune from this requirement as the `aws-sdk` is provided for you in the Lambda Node runtime.

### npm
`npm install cstore-pull --save`

### yarn
`yarn add cstore-pull`

## Usage

```javascript
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

Locates the given `tag` in the `cstore.yml` file located at `ymlPath`. Fetches the specified configs via AWS SDK and returns an object with env vars as key/value pairs.

Params:
- `ymlPath` *(required)* - absolute path to your `cstore.yml` file
- `tag` *(required)* - a valid tag associated to the env you're pulling configs for
- `injectIntoProcess` *(default: `true`)* - if `true`, pulled configs will automatically be injected into Node's `process.env`
