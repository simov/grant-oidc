
var crypto = require('crypto')
var jose = require('jose')
var jws = require('jws')


// PEM
var { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,  // the length of your key in bits
  publicKeyEncoding: {
    type: 'spki',       // recommended to be 'spki' by the Node.js docs
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',      // recommended to be 'pkcs8' by the Node.js docs
    format: 'pem',
    // cipher: 'aes-256-cbc',   // optional
    // passphrase: 'top secret' // optional
  }
})

var jwk = jose.JWK.asKey(publicKey)

var jwt = {
  success: jws.sign({
    header: {typ: 'JWT', alg: 'RS256', kid: jwk.kid},
    payload: {
      iss: 'http://localhost:5000',
      aud: 'key',
      iat: Math.floor(Date.now() / 1000) - 5,
      exp: Math.floor(Date.now() / 1000) + 5,
    },
    secret: privateKey
  }),
}

module.exports = {jwk, jwt}
