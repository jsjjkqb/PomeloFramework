let dispatcher = require('./dispatcher');

module.exports.roomRoute = function(session, msg, app, cb) {
    let roomServers = app.getServersByType('room');
  
    if(!roomServers || roomServers.length === 0) {
        cb(new Error('can not find room servers.'));
        return;
    }

    let roomId = session.get("roomId");
    if (!roomId) {
        cb(new Error('can not find roomId.'));
        return;
    }

    let res = dispatcher.getRoomServer(roomId, roomServers);

    cb(null, res.id);
};