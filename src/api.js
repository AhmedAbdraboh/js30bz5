var body = require('body/json')
var send = require('send-data/json')

var Buyers = require('./models/buyers')

module.exports = {
  create: create,
  get: get,
  getRoute: getRoute
}

function create (req, res, opts, cb) {
  body(req, res, function (err, data) {
    if (err) return cb(err)
    let body = validateCreateBuyerBody(data, ['id', 'offers'])
    Buyers.create(body, function (err) {
      if (err) return cb(err)

      return send(req, res, {
        body: body,
        statusCode: 201
      })
    })
  })
}

function validateCreateBuyerBody (body, allowedParams) {
  let allowedBody = {}
  allowedParams.forEach(element => {
    allowedBody[element] = body[element]
  })
  return allowedBody
}

function get (req, res, opts, cb) {
  Buyers.get(opts.params.id, function (err, value) {
    if (err) return cb(err)
    if (value) {
      let response = JSON.parse(value)
      return send(req, res, response)
    } else {
      let error = newNotFoundError()
      return cb(error)
    }
  })
}

function getRoute (req, res, opts, cb) {
  Buyers.getRoute(opts.query, function (err, value) {
    if (err) return cb(err)
    if (value.length) {
      return send(req, res, {
        statusCode: 302,
        headers: {
          location: value[0]
        }
      })
    } else {
      let error = newNotFoundError()
      return cb(error)
    }
  })
}

function newNotFoundError () {
  let error = new Error('Not Found')
  error.statusCode = 404
  return error
}
