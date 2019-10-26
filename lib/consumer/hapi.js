
var grant = require('grant/lib/config')
var discover = require('../discovery.js')
var verify = require('../id_token.js')


module.exports = (_config) => {
  var app = {}

  function register (server, options) {
    var config = grant(Object.keys(options).length ? options : _config)

    server.ext('onPreHandler', async (req, res) => {
      var session = (req.session || req.yar).get('grant')
      if (!session) {
        return res.continue
      }
      var response = session.response || req.query // FIX: qs.parse()

      var transport = (error) => {
        if (session.response) {
          session.response = {error}
          ;(req.session || req.yar).set('grant', session)
        }
        else {
          req.query = {error}
        }
      }

      var {id_token} = response
      if (!id_token) {
        return res.continue
      }
      // id_token is already parsed in Grant
      else if (typeof id_token === 'object') {
        id_token = response.raw.id_token
      }

      var jwt = verify.decode(id_token)
      if (!jwt) {
        transport('OIDC: Malformed ID token')
        return res.continue
      }

      try {
        // idp and jwk responses should be cached and should have expiration set
        var {body:idp} = await discover.config(jwt)
        var {body:jwk} = await discover.keys(idp)
      }
      catch (error) {
        transport(error.message)
        return res.continue
      }

      var nonce = session && session.nonce
      var app = config[session.provider].key
      var error = verify({id_token, jwt, idp, jwk, app, nonce})

      if (error) {
        transport(error)
        return res.continue
      }

      response.id_token = jwt
      return res.continue
    })
  }

  app.pkg = require('../../package.json')
  app.register = register
  return app
}
