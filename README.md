
# grant-oidc

[![npm-version]][npm]

> *`id_token` validation middleware for [Grant][grant]*

**EXPERIMENTAL! DO NOT USE IN PRODUCTION!**

This module implements:

- IdP configuration discovery *(no caching)*
- IdP public keys discovery *(no caching)*
- `id_token` validation including its signature

## middleware

Currently only Express middleware is available:

```js
var express = require('express')
var session = require('express-session')
var grant = require('grant-express')
var oidc = require('grant-oidc')

var config = require('./config.json')


express()
  .use(session({name: 'grant', secret: 'grant', saveUninitialized: true, resave: true}))
  .use(grant(config))
  .get('/callback', oidc(config), (req, res) => {
    res.end(JSON.stringify(req.session.grant.response, null, 2))
  })
  .listen(3000)
```

## config

List of known OpenID Connect providers:

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
    "callback": "/callback"
  },
  "asana": {
    "key": "[APP_ID]",
    "secret": "[APP_SECRET]"
  },
  "auth0": {
    "key": "[APP_ID]",
    "secret": "[APP_SECRET]"
  },
  "authentiq": {
    "key": "[APP_ID]",
    "secret": "[APP_SECRET]"
  },
  "google": {
    "key": "[APP_ID]",
    "secret": "[APP_SECRET]"
  },
  "ibm": {
    "key": "[APP_ID]",
    "secret": "[APP_SECRET]"
  },
  "microsoft": {
    "key": "[APP_ID]",
    "secret": "[APP_SECRET]"
  },
  "okta": {
    "key": "[APP_ID]",
    "secret": "[APP_SECRET]"
  },
  "onelogin": {
    "key": "[APP_ID]",
    "secret": "[APP_SECRET]"
  },
  "paypal": {
    "key": "[APP_ID]",
    "secret": "[APP_SECRET]"
  },
  "salesforce": {
    "key": "[APP_ID]",
    "secret": "[APP_SECRET]"
  },
  "twitch": {
    "key": "[APP_ID]",
    "secret": "[APP_SECRET]"
  },
  "yahoo": {
    "key": "[APP_ID]",
    "secret": "[APP_SECRET]"
  }
}
```

## quirks

- Google issuer URL doesn't have protocol

- Paypal issuer have different domain than the configuration URL
- Paypal returns the `idp` configuration JSON with wrong _content-type_

- Asana doesn't return `kid` in the header, and a single key is found in `jwks_uri` that should be picked
- Asana doesn't honor the `nonce` parameter and doesn't embed it in the `id_token`


  [npm-version]: https://img.shields.io/npm/v/grant-oidc.svg?style=flat-square (NPM Version)
  [npm]: https://www.npmjs.com/package/grant-oidc

  [grant]: https://github.com/simov/grant
