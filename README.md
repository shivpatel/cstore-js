# cStore for JavaScript

[![NPM](https://nodei.co/npm/cstore-js.png)](https://nodei.co/npm/cstore-js/)

`cstore-js` is a lightweight JavaScript package for using cStore configs in Node. It currently supports the cStore S3 and SSM Parameter Store storage methods. It can automatically inject your configs into Node's `process.env` and decrypt env vars encrypted in Secrets Manager with references written in the `{{ENV/KEY}}` syntax.

This module is only intended for use alongside an existing [cStore](https://github.com/turnerlabs/cstore) setup.

Tested against cStore `2.6.2`.

## Installation

**Important:** To minimize package size, `cstore-js` only includes the `aws-sdk` package as a dev dependency. You must have the `aws-sdk` available in your project when creating a production-ready build. AWS Lambda function code is immune from this requirement as the `aws-sdk` is provided for you in the Lambda Node runtime.

### npm
`npm install cstore-js --save`

### yarn
`yarn add cstore-js`

## Usage

#### Pull Existing Configs

```javascript
const cstore = require('cstore-js');

const initApp = async () => {
  
  const tag = process.env.NODE_ENV;
  const configs = await cstore.pull(tag);
  
  // Connect to DB
  // Start express.js, etc.
  
}

init();
```

## API

### pull (tag: String, ymlPath: String, injectIntoProcess: Boolean, injectSecrets: Boolean)

Locates the given `tag` in the `cstore.yml` file. Fetches the specified configs via AWS SDK and returns an object with env vars as key/value pairs. Also injects the variables into Node's `process.env` by default.

Params:
- `tag` *(required)* - a valid tag associated to the env you're pulling configs for.
- `ymlPath` *(default: `process.cwd()/cstore.yml`)* - Absolute path to your `cstore.yml` file.
- `injectIntoProcess` *(default: `true`)* - if `true`, pulled configs will automatically be injected into Node's `process.env`.
- `injectSecrets` *(default: `true`)* - if `true`, env vars referencing secrets manager will be fetched and returned in decrypted form. 
