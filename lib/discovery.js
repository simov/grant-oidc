
var request = require('request-compose').client


// Discover IDP configuration
var config = async (jwt) => {
  var base =
      jwt.payload.iss.includes('google.com')
    ? `https://${jwt.payload.iss}`

    : jwt.payload.iss.includes('paypal.com')
    ? 'https://www.paypalobjects.com'

    : jwt.payload.iss.replace(/\/$/, '')

  var {res, body} = await request({
    url: `${base}/.well-known/openid-configuration`,
  })

  // incorrect content-type
  if (res.client.servername === 'www.paypalobjects.com') {
    body = JSON.parse(body)
  }

  return {res, body}
}

// Obtain public keys
var keys = (idp) =>
  request({url: idp.jwks_uri})

module.exports = {config, keys}
