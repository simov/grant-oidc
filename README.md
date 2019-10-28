
# grant-oidc

[![npm-version]][npm] [![travis-ci]][travis]

> *`id_token` validation middleware for [Grant][grant]*

- IdP configuration discovery *(no caching)*
- IdP public keys discovery *(no caching)*
- `id_token` validation including its signature

## Configuration

> **grant-oidc accepts your Grant [configuration][grant-config]**

## Middlewares

For Express and Koa grant-profile needs to be mounted after Grant, and before any of the callback URLs defined in your Grant configuration.

## Express

```js
var express = require('express')
var session = require('express-session')
var grant = require('grant-express') // or require('grant').express()
var oidc = require('grant-oidc').express()
var config = require('./config.json')

express()
  .use(session({name: 'grant', secret: 'grant', saveUninitialized: true}))
  .use(grant(config))
  .use(oidc(config))
  .get('/hi', (req, res) => {
    res.end(JSON.stringify(req.session.grant.response, null, 2))
  })
  .listen(3000)
```

## Koa

```js
var Koa = require('koa')
var session = require('koa-session')
var grant = require('grant-koa') // or require('grant').koa()
var oidc = require('grant-oidc').koa()
var config = require('./config.json')

var app = new Koa()
app.keys = ['grant']
app.use(session(app))
app.use(grant(config))
app.use(oidc(config))
app.use((ctx, next) => {
  if (ctx.path === '/hi') {
    ctx.body = JSON.stringify(ctx.session.grant.response, null, 2)
  }
})
app.listen(3000)
```

## Hapi

```js
var Hapi = require('hapi')
var yar = require('yar')
var grant = require('grant-hapi') // or require('grant').hapi()
var oidc = require('grant-oidc').hapi()
var config = require('./config.json')

var server = new Hapi.Server({host: 'localhost', port: 3000})

server.route({method: 'GET', path: '/hi', handler: (req, res) => {
  return res.response(JSON.stringify(req.yar.get('grant').response, null, 2))
    .header('content-type', 'text/plain')
}})

server.register([
  {plugin: grant(), options: config},
  {plugin: oidc(), options: config},
  {plugin: yar, options: {cookieOptions: {password: '01234567890123456789012345678912', isSecure: false}}},
])
.then(() => server.start())
```

## Example

```json
{
  "defaults": {
    "protocol": "http",
    "host": "localhost:3000",
    "transport": "session",
    "state": true,
    "nonce": true,
    "scope": [
      "openid"
    ],
    "callback": "/hi"
  },
  "asana": {"key": "...", "secret": "..."},
  "auth0": {"key": "...", "secret": "..."},
  "authentiq": {"key": "...", "secret": "..."},
  "google": {"key": "...", "secret": "..."},
  "ibm": {"key": "...", "secret": "..."},
  "line": {"key": "...", "secret": "..."},
  "microsoft": {"key": "...", "secret": "..."},
  "okta": {"key": "...", "secret": "..."},
  "onelogin": {"key": "...", "secret": "..."},
  "paypal": {"key": "...", "secret": "..."},
  "phantauth": {"key": "...", "secret": "..."},
  "salesforce": {"key": "...", "secret": "..."},
  "twitch": {"key": "...", "secret": "..."},
  "yahoo": {"key": "...", "secret": "..." }
}
```

## Quirks

- Google issuer URL doesn't have protocol

- Paypal issuer have different domain than the configuration URL
- Paypal returns the `idp` configuration JSON with wrong _content-type_

- Asana doesn't return `kid` in the header, and a single key is found in `jwks_uri` that should be picked
- Asana doesn't honor the `nonce` parameter and doesn't embed it in the `id_token`


  [npm-version]: https://img.shields.io/npm/v/grant-oidc.svg?style=flat-square (NPM Version)
  [travis-ci]: https://img.shields.io/travis/simov/grant-oidc/master.svg?style=flat-square (Build Status)
  [coveralls-status]: https://img.shields.io/coveralls/simov/grant-oidc.svg?style=flat-square (Test Coverage)

  [npm]: https://www.npmjs.com/package/grant-oidc
  [travis]: https://travis-ci.org/simov/grant-oidc
  [coveralls]: https://coveralls.io/r/simov/grant-oidc?branch=master

  [grant]: https://github.com/simov/grant
  [grant-config]: https://github.com/simov/grant#configuration
