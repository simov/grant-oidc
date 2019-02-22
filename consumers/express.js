
var discover = require('../lib/discovery.js')
var verify = require('../lib/id_token.js')


module.exports = (config) => async (req, res, next) => {

  var transport = (error) => {
    if (req.session.grant.response) {
      req.session.grant.response = {error}
    }
    else {
      req.query = {error}
    }
  }

  var session = req.session.grant
  var response = req.session.grant.response || req.query

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
  var app = config[session.provider].key || config[session.provider].client_id
  var error = verify({id_token, jwt, idp, jwk, app, nonce})

  if (error) {
    transport(error)
    next()
    return
  }

  transport.id_token = jwt
  next()
}
