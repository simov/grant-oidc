
var grant = require('grant/lib/config')
var discover = require('../discovery.js')
var verify = require('../id_token.js')


module.exports = (_config) => {
  var config = grant(_config)

  return async (ctx, next) => {
    var session = ctx.session.grant
    var response = ctx.session.grant.response || ctx.request.query

    var transport = (error) => {
      if (ctx.session.grant.response) {
        ctx.session.grant.response = {error}
      }
      else {
        ctx.request.query = {error}
      }
    }

    var {id_token} = response
    if (!id_token) {
      next()
      return
    }
    // id_token is already parsed in Grant
    else if (typeof id_token === 'object') {
      id_token = response.raw.id_token
    }

    var jwt = verify.decode(id_token)
    if (!jwt) {
      transport('OIDC: Malformed ID token')
      next()
      return
    }

    try {
      // idp and jwk responses should be cached and should have expiration set
      var {body:idp} = await discover.config(jwt)
      var {body:jwk} = await discover.keys(idp)
    }
    catch (error) {
      transport(error.message)
      next()
      return
    }

    var nonce = session && session.nonce
    var app = config[session.provider].key
    var error = verify({id_token, jwt, idp, jwk, app, nonce})

    if (error) {
      transport(error)
      next()
      return
    }

    response.id_token = jwt
    next()
  }
}
