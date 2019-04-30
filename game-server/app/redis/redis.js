let redisClient = require('redis');
let dbCfg = require('../../config/const.json');

let redis = null;

module.exports = {
    createRedis(app, key) {
        redis = redisClient.createClient(dbCfg.redisPort, dbCfg.redisHost);
        redis.on('error', (err)=>{
            console.error('redis', err)
        })
        app.set(key, redis);
    },

    setRoom(room) {

    },

    getRoom(roomId) {

    },

    delRoom(roomId) {

    },

    setRoomIds(roomIds) {

    },

    getRoomIds() {

    },

    // 回放
    setPlaybackList(uuid, playbackList) {

    },

    // proxy
    setProxyRoomIds(userId, roomIds) {

    },

    getProxyRoomIds(userId) {

    },

    addProxyRoomId(userId, roomId) {
        
    }
}