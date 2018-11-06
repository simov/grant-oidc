
# grant-oidc

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


  [grant]: https://github.com/simov/grant
