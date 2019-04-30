
module.exports = function(opts) {
    return new OnlineUser(opts);
}

let moduleId = "onlineUser";
module.exports.moduleId = moduleId;

let OnlineUser = function(opts) {
    this.app = opts.app;
    this.type = opts.type || 'pull';
    this.interval = opts.interval || 5;
}

OnlineUser.prototype.monitorHandler = function(agent, msg, cb) {
    let connectionService = this.app.components.__connection__;
    if (!connectionService) {
        console.error('没有该服务器')
        return;
    }
    agent.notify(moduleId, connectionService.getStatisticsInfo());
};

OnlineUser.prototype.masterHandler = function(agent, msg) {
    if (!msg) {
        let list = agent.typeMap['connector'];
        if (!list || list.length == 0) {
            // connector服务器还未启动
            return;
        }
        agent.notifyByType("connector", moduleId);
    } else {
        agent.set(msg.serverId, msg);
    }
};

OnlineUser.prototype.clientHandler = function(agent, msg, cb) {
    cb(null, agent.get(msg.serverId));
}