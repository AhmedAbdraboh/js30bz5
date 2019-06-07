var redis = require('../redis')()
const buyers = 'buyers'
const routes = 'routes'
const _ = require('lodash')
module.exports = {
  create: set,
  get: get,
  getRoute: getRoute
}

function set (obj, cb) {
  let key = buyers + ':' + obj.id
  let cmd = redis.multi()
    .set(key, JSON.stringify(obj))
  for (let o of obj.offers) {
    let states = o.criteria.state.join('-')
    let devices = o.criteria.device.join('-')
    let hours = o.criteria.hour.join('-')
    let days = o.criteria.day.join('-')
    let k = routes + ':' + obj.id + ':' + states + ':' + devices + ':' + hours + ':' + days
    cmd.hmset('routes:values', k, o.value)
    cmd.hmset('routes:locations', k, o.location)
  }
  return cmd.exec(cb)
}

function get (id, cb) {
  let key = buyers + ':' + id
  return redis.get(key, cb)
}

function getRoute (requestId, query, cb) {
  let hours = new Date(query.timestamp).getUTCHours()
  let days = new Date(query.timestamp).getUTCDay()
  let searchQuery = routes + ':*:*' + query.state + '*:*' + query.device + '*:*' + hours + '*:*' + days + '*'
  let tempZSet = 'routes:temp:' + requestId
  return search(searchQuery, 0, tempZSet, function (err) {
    if (err) {
      return cb(err)
    }
    redis.ZREVRANGE(tempZSet, 0, 0, function (err, sortedRoutes) {
      if (err) {
        return cb(err)
      }
      if (!sortedRoutes.length) {
        let errMsg = 'Not Found'
        return cb(errMsg)
      }
      redis.HGET('routes:locations', sortedRoutes[0], function (err, location) {
        if (err) {
          return cb(err)
        }
        redis.del(tempZSet)
        return cb(null, location)
      })
    })
  })
}

function search (query, cursor, tempZSet, cb) {
  redis.hscan('routes:values', cursor, 'MATCH', query, function (err, scanResult) {
    if (err) {
      return cb(err)
    }
    const currentCursor = scanResult[0]
    const routes = scanResult[1]
    return addToTempZSet(tempZSet, routes, function (err) {
      if (err) {
        return cb(err)
      }
      if (currentCursor !== '0') {
        return search(query, currentCursor, tempZSet, cb)
      }
      return cb(null)
    })
  })
}

function addToTempZSet (tempZSet, routes, cb) {
  let client = redis.multi()
  _(routes).chunk(2)
    .forEach(route => {
      client.zadd(tempZSet, route[1], route[0])
    })
  client.exec(function (err, res) {
    if (err) {
      return cb(err)
    }
    return cb(null)
  })
}
