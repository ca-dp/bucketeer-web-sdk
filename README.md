# Bucketeer Client-side SDK for Web

## Setup

Install prerequisite tools.

- [Yarn](https://yarnpkg.com/en/docs/install)
- [Bazelisk](https://github.com/bazelbuild/bazelisk)

Setup npm token.

```
export NPM_TOKEN=<YOUR_NPM_TOKEN>
```

Install dependencies.

```
make init
```

## Development

### SDK

Format.

```
make fmt
```

Lint.

```
make lint
```

Build.

```
make build
```

Run unit tests.

```
make test
```

Run e2e tests.
First, replace placeholders in [ava-e2e.config.js](./ava-e2e.config.js), then run the command below.

```
make e2e
```

Publish to npm.
First, add version field to [package.json](./package.json), then run the command below.
(Usually you don't need to publish manually because CI/CD workflow publishes automatically.)

```
make publish
```

### example

Before build example, you need some setups.

- Build SDK.
- Replace placeholders in [client/index.ts](./example/src/client/index.ts)
- Move to example directory. `cd example`
- Install dependencies. `make init`

Build.

```
make build
```

Start example server.

```
make start
```

## SDK User Docs

- [Tutorial](https://bucketeer.io/docs/#/sdk-tutorial-web)
- [Integration](https://bucketeer.io/docs/#/sdk-reference-guides-web)

## Samples 

[Bucketeer Samples](https://github.com/ca-dp/bucketeer-samples)
