var redis = require('../redis')()
const buyers = 'buyers'
const routes = 'routes'

module.exports = {
  create: set,
  get: get,
  getRoute: getRoute
}

function set (obj, cb) {
  let key = buyers + ':' + obj.id
  let cmd = redis.multi()
    .set(key, JSON.stringify(obj))
  for (let offer of obj.offers) {
    for (let state of offer.criteria.state) {
      for (let device of offer.criteria.device) {
        let routeSetKey = routes + ':' + state + ':' + device
        cmd.zadd(routeSetKey, offer.value, offer.location)
      }
    }
  }
  return cmd.exec(cb)
}

function get (id, cb) {
  let key = buyers + ':' + id
  return redis.get(key, cb)
}

function getRoute (query, cb) {
  let key = routes + ':' + query.state + ':' + query.device
  return redis.zrevrange(key, 0, 0, cb)
}
