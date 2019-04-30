let redis = require('../redis/redis');
let mongodb = require('../mongodb/mongodb');

module.exports.configure = function(app, cb = ()=>{}) {
    redis.createRedis(app, 'redis');
    mongodb.createDB((dbs) => {
        app.set('mongodb', dbs);
        cb()
    })
}