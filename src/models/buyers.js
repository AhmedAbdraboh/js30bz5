var redis = require('../redis')();
const buyers = "buyers"

module.exports = {
    create: set,
    get: get
}

function set(obj, cb) {
    let key = buyers + ":" + obj.id;
    return redis.set(key, JSON.stringify(obj), cb)
}

function get(id, cb) {
    let key = buyers + ":" + id;
    return redis.get(key, cb)
}