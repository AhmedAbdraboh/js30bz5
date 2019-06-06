var redis = require('../redis')();
const buyers = "buyers"

module.exports = {
    create: set
}

function set(obj, cb) {
    let key = buyers + ":" + obj.id;
    return redis.set(key, JSON.stringify(obj), cb)
}