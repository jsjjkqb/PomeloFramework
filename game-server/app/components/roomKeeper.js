
module.exports = function(app) {
    return new RoomKeeper(app);
};
  
let RoomKeeper = function(app) {
    this.app = app;
};

RoomKeeper.name = '__roomKeeper__';

RoomKeeper.prototype.start = function(cb) {
    console.log('RoomKeeper Start');
    // room服务器启动时恢复原有房间并保存到memory中

    process.nextTick(cb);
}

RoomKeeper.prototype.afterStart = function (cb) {
    console.log('RoomKeeper afterStart');
    process.nextTick(cb);
}

RoomKeeper.prototype.stop = function(force, cb) {
    console.log('RoomKeeper stop');
    process.nextTick(cb);
}