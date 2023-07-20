# Serverless - AWS Node.js Typescript

This project has been generated using the `aws-nodejs-typescript` template from the [Serverless framework](https://www.serverless.com/).

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/).

## Installation/deployment instructions

Depending on your preferred package manager, follow the instructions below to deploy your project.

> **Requirements**: NodeJS `lts/fermium (v.14.15.0)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npx sls deploy` to deploy this stack to AWS

### Using Yarn

- Run `yarn` to install the project dependencies
- Run `yarn sls deploy` to deploy this stack to AWS

## Setting up LocalStack
Setting up LocalStack for a Serverless app is fairly straightforward although it does require a few code changes.
In particular, it consists of the following two steps.

1. Installing and configuring the [Serverless-LocalStack plugin](https://github.com/localstack/serverless-localstack).
2. Adjusting AWS endpoints in Lambda functions.

### Installing and configuring the Serverless-LocalStack plugin
To install the plugin, execute the following command.
```
npm install -D serverless-localstack
```

Next, we set up the plugin in `serverless.yml`. For that simply add the following properties.
```yaml
...

plugins:
  - serverless-localstack

custom:
  localstack:
    stages:
      - local
```

This adds the LocalStack plugin to our Serverless setup but only activates the plugin for the stage "local". 

## Deploy to LocalStack

Start LocalStack by running
```bash
localstack start
```

Then to deploy the endpoint simply run
```bash
serverless deploy --stage local
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
........
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service serverless-python-rest-api-with-dynamodb.zip file to S3 (38.3 KB)...
Serverless: Validating template...
Serverless: Skipping template validation: Unsupported in Localstack
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.....................................
Serverless: Stack update finished...
Service Information
service: serverless-python-rest-api-with-dynamodb
stage: local
region: us-east-1
stack: serverless-python-rest-api-with-dynamodb-local
resources: 35
api keys:
  None
endpoints:
  http://localhost:4566/restapis/XXXXXXXXXX/local/_user_request_
functions:
  create: serverless-python-rest-api-with-dynamodb-local-create
  list: serverless-python-rest-api-with-dynamodb-local-list
  get: serverless-python-rest-api-with-dynamodb-local-get
  update: serverless-python-rest-api-with-dynamodb-local-update
  delete: serverless-python-rest-api-with-dynamodb-local-delete
layers:
  None
```

Note the endpoint `http://localhost:4566/restapis/XXXXXXXXXX/local/_user_request_`. We can use this endpoint to interact with our service. 

## Usage

You can signup and sign in with the following commands:

### singup

```bash
curl -X POST http://localhost:4566/restapis/XXXXXXXXXX/local/_user_request_/auth/singup --data '{ data }'
```


Follow similar step for signin

## Template features

### Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas

```
.
├── src
│   ├── functions               # Lambda configuration and source code folder
│   │   ├── auth
│   │   │   ├── handler.ts      # `auth` lambda source code
│   │   │   ├── index.ts        # `auth` lambda Serverless configuration
│   │   │   ├── mock.json       # `auth` lambda input parameter, if any, for local invocation
│   │   │   └── schema.ts       # `auth` lambda input event JSON-Schema
│   │   │
│   │   └── index.ts            # Import/export of all lambda configurations
│   │
│   └── libs                    # Lambda shared code
│       └── apiGateway.ts       # API Gateway specific helpers
│       └── handlerResolver.ts  # Sharable library for resolving lambda handlers
│       └── lambda.ts           # Lambda middleware
│
├── package.json
├── serverless.ts               # Serverless service file
├── tsconfig.json               # Typescript compiler configuration
├── tsconfig.paths.json         # Typescript paths
└── webpack.config.js           # Webpack configuration
```

## Remove the service
To remove the service simply run
```
serverless remove --stage local
```

When re-deploying the service to LocalStack, you may run into the following issue. 
```
 Serverless Error ----------------------------------------
 
  The serverless deployment bucket "serverless-python-rest-api-with-dynamodb-local-none-b971536a" does not exist. Create it manually if you want to reuse the CloudFormation stack "serverless-python-rest-api-with-dynamodb-local", or delete the stack if it is no longer required.
```

In this case, simply restart the LocalStack Docker container (`ctrl`+`C` and `localstack start`).

### Test

- npx jest

### 3rd party libraries

- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts) - uses JSON-Schema definitions used by API Gateway for HTTP request validation to statically generate TypeScript types in your lambda's handler code base
- [middy](https://github.com/middyjs/middy) - middleware engine for Node.Js lambda. This template uses [http-json-body-parser](https://github.com/middyjs/middy/tree/master/packages/http-json-body-parser) to convert API Gateway `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object
- [@serverless/typescript](https://github.com/serverless/typescript) - provides up-to-date TypeScript definitions for your `serverless.ts` service file

### Advanced usage

Any tsconfig.json can be used, but if you do, set the environment variable `TS_NODE_CONFIG` for building the application, eg `TS_NODE_CONFIG=./tsconfig.app.json npx serverless webpack`
