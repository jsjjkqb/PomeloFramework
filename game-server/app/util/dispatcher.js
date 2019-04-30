let crc = require('crc');

module.exports.dispatch = function(key, list) {
    var index = Math.abs(crc.crc32(key)) % list.length;
    return list[index];
};

module.exports.getRoomServer = function(roomId, roomServers) {
    let res = roomServers[0];

    if (roomServers.length > 1) {
        // 排序：因为servers拿到的是乱序
        roomServers.sort((serverA, serverB) => {
            return serverA.port - serverB.port;
        })
        // 获取index
        let index = parseInt(roomId) % roomServers.length;
        res = roomServers[index];
    }

    return res;
}