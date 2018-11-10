
var jws = require('jws')
var convert = require('jwk-to-pem')


// Decode the ID token
var decode = (id_token) =>
  jws.decode(id_token, {json: true})


// Check if the ID token crypto algorithm is supported by the IDP
var algorithm = (jwt, idp) =>
  idp.id_token_signing_alg_values_supported.includes(jwt.header.alg)

// Verify ID token signature or HMAC
var signature = (id_token, jwt, jwk) => {
  var key = jwk.keys.find(({kid}) => kid === jwt.header.kid) || jwk.keys[0]
  var public_key = convert(key)
  return jws.verify(id_token, jwt.header.alg, public_key)
}

// Validate ID token claims
var claims = {
  // issuer - does the token originate from the expected IdP?
  issuer: (jwt, idp) =>
    // The issuer returned by discovery
    // MUST exactly match the value of iss in the ID token
    jwt.payload.iss === idp.issuer ||
    `https://${jwt.payload.iss}` === idp.issuer // google
  ,
  // audience - is the token intended for me?
  audience: (jwt, app) =>
    // audience - should be your OAuth app ID
    jwt.payload.aud === app
  ,
  // expiration - is the token within its validity window?
  expiration: (jwt) =>
    Date.now() >= (jwt.payload.iat * 1000) &&
    Date.now() <= (jwt.payload.exp * 1000)
  ,
  // nonce - if set, does it tie to a request of my own?
  nonce: (jwt, nonce) =>
    // nonce - session state set on your server during the authorization step
    jwt.payload.nonce === nonce
  ,
}

// id_token - raw string
// jwt - decoded id_token JSON
// idp - configuration JSON
// jwk - public keys JSON
// app - OAuth app ID
// nonce - session state string
var verify = ({id_token, jwt, idp, jwk, app, nonce}) =>

    !algorithm(jwt, idp)
  ? 'OIDC: Not supported crypto algorithm!'

  : !signature(id_token, jwt, jwk)
  ? 'OIDC: Invalid signature!'

  : !claims.issuer(jwt, idp)
  ? 'OIDC: Invalid issuer!'

  : !claims.audience(jwt, app)
  ? 'OIDC: Not issued for your app!'

  : !claims.expiration(jwt)
  ? 'OIDC: Token expired!'

  : nonce && !claims.nonce(jwt, nonce)
  ? 'OIDC: Nonce does not match authorization!'

  : undefined


module.exports = Object.assign(verify, {decode, algorithm, signature, claims})
