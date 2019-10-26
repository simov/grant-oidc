
var t = require('assert').strict
var request = require('request-compose').extend({
  Request: {cookie: require('request-cookie').Request},
  Response: {cookie: require('request-cookie').Response},
}).client

var port = {oauth2: 5000, app: 5001}
var url = {
  oauth2: (path) => `http://localhost:${port.oauth2}${path}`,
  app: (path) => `http://localhost:${port.app}${path}`,
}

var provider = require('./util/provider')
var client = require('./util/client')


describe('middleware', () => {
  var server = {oauth2: null}

  before(async () => {
    server.oauth2 = await provider.oauth2(port.oauth2)
  })

  after((done) => server.oauth2.close(done))

  ;['express', 'koa', 'hapi'].forEach((name) => {
    describe(name, () => {
      var server, grant, consumer = name
      var config = {
        defaults: {
          protocol: 'http', host: `localhost:${port.app}`, callback: '/callback',
          transport: 'session',
        },
        grant: {
          authorize_url: url.oauth2('/authorize_url'),
          access_url: url.oauth2('/access_url'),
          oauth: 2,
          key: 'key',
        },
      }

      before(async () => {
        var obj = await client[consumer](config, port.app)
        server = obj.server
        grant = obj.grant
      })

      after((done) => {
        /express|koa/.test(consumer)
          ? server.close(done)
          : server.stop().then(done)
      })

      it('success', async () => {
        grant.config.grant.access_url = url.oauth2('/access_url/success')
        var {body: {session: {response}}} = await request({
          url: url.app('/connect/grant'),
          cookie: {}
        })
        t.equal(response.id_token.payload.iss, 'http://localhost:5000')
        t.equal(response.id_token.payload.aud, 'key')
      })
    })

  })

})
