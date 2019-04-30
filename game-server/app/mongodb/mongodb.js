let MongoClient = require('mongodb').MongoClient;
let dbCfg = require('../../config/const.json');
let url = 'mongodb://localhost:27017/';

let dbs = {};

module.exports.createDB = function(cb = ()=>{}) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) {
            console.error('数据库创建失败', err);
            return
        }
        dbs.hall = db.db(dbCfg.dbName[0]);
        dbs.game = db.db(dbCfg.dbName[1]);
        // 返回
        cb(dbs);
    });
}

module.exports.hallDB = function(cb = ()=>{}) {
    if (dbs.hall) {
        return cb(dbs.hall);
    }
    this.createDB((dbs) => { cb(dbs.hall); })
}

module.exports.gameDB = function(cb = ()=>{}) {
    if (dbs.game) {
        return cb(dbs.game);
    }
    this.createDB((dbs) => { cb(dbs.game); })
}