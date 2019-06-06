var body = require('body/json')
var send = require('send-data/json')

var Buyers = require('./models/buyers')

module.exports = {
  create: create
}

function create(req, res, opts, cb) {
  body(req, res, function (err, data) {
    if (err) return cb(err)
    let body = validateCreateBuyerBody(data, ["id", "offers"])
    Buyers.create(body, function (err) {
      if (err) return cb(err)

      send(req, res, {
        body: body,
        statusCode: 201
      })
    })
  })
}

function validateCreateBuyerBody(body, allowedParams) {
  let allowedBody = {};
  allowedParams.forEach(element => {
    allowedBody[element] = body[element]
  });
  return allowedBody;
}