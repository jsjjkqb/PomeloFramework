let dispatcher = require('../../../util/dispatcher');
let Code = require('../../../util/code');

module.exports = function (app) {
    return new Handler(app);
};

let Handler = function (app) {
    this.app = app;
};

let handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 * 分配connector服务器的ip地址，以及client Port;
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next step callback
 *
 */

handler.queryEntry = function (msg, session, next) {
    let uid = msg.uid ? msg.uid : "111";
    if (session.uid) {
        next(null, Code.FAIL);
        return;
    }
    // get all connectors
    let connectors = this.app.getServersByType('connector');
    if (!connectors || connectors.length === 0) {
        next(null, Code.FAIL);
        return;
    }
    // select connector, because more than one connector existed.
    let res = dispatcher.dispatch(uid, connectors);

    console.log("==========queryEntry==============", res.clientHost, res.clientPort)

    return next(null, {
        code: 200,
        data: {
            host: res.clientHost,
            port: res.clientPort
        }
    });

};