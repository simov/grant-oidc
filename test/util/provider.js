
var http = require('http')
var url = require('url')
var qs = require('qs')

var {jwt, jwk} = require('./jwt')

module.exports = {
  oauth2: (port) => new Promise((resolve) => {
    var server = http.createServer()
    server.on('request', (req, res) => {
      if (/^\/authorize_url/.test(req.url)) {
        var parsed = url.parse(req.url, false)
        var query = qs.parse(parsed.query)
        var location = query.redirect_uri + '?' + qs.stringify({code: 'code'})
        res.writeHead(302, {location})
        res.end()
      }
      else if (/^\/access_url/.test(req.url)) {
        res.writeHead(200, {'content-type': 'application/json'})
        var [, name] = /^\/access_url\/(.*)$/.exec(req.url)
        res.end(JSON.stringify({id_token: jwt[name]}))
      }
      else if (/^\/\.well-known\/openid-configuration/.test(req.url)) {
        res.writeHead(200, {'content-type': 'application/json'})
        res.end(JSON.stringify({
          issuer: 'http://localhost:5000',
          id_token_signing_alg_values_supported: ['RS256'],
          jwks_uri: 'http://localhost:5000/jwks_uri',
        }))
      }
      else if (/^\/jwks_uri/.test(req.url)) {
        res.writeHead(200, {'content-type': 'application/json'})
        res.end(JSON.stringify({keys: [jwk]}))
      }
    })
    server.listen(port, () => resolve(server))
  }),
}
