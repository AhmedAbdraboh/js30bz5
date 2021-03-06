var URL = require('url')
var http = require('http')
var cuid = require('cuid')
var Corsify = require('corsify')
var sendJson = require('send-data/json')
var ReqLogger = require('req-logger')
var HttpHashRouter = require('http-hash-router')

var api = require('./api')
var version = require('../package.json').version

var router = HttpHashRouter()
var logger = ReqLogger({ version: version })

var cors = Corsify({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, accept, content-type'
})

router.set('/api/buyers', { POST: api.create })
router.set('/api/buyers/:id', { GET: api.get })
router.set('/api/route', { GET: api.getRoute })

module.exports = function createServer () {
  return http.createServer(cors(handler))
}

function handler (req, res) {
  req.id = cuid()
  logger(req, res, { requestId: req.id }, function (info) {
    console.log(info)
  })
  router(req, res, { query: getQuery(req.url) }, onError.bind(null, req, res))
}

function onError (req, res, err) {
  if (!err) return

  res.statusCode = err.statusCode || 500
  logError(req, res, err)

  sendJson(req, res, {
    error: err.message || http.STATUS_CODES[res.statusCode]
  })
}

function logError (req, res, err) {
  if (process.env.NODE_ENV === 'test') return

  var logType = res.statusCode >= 500 ? 'error' : 'warn'

  console[logType]({
    err: err,
    requestId: req.id,
    statusCode: res.statusCode
  }, err.message)
}

function getQuery (url) {
  return URL.parse(url, true).query
}
