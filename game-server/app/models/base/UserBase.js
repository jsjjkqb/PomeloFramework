let SAFE = require('../../util/modelUtil').SAFE;

/**
 * 用户表
 * 2019-04-19
 */
class UserBase {
    constructor(opts = {}) {
        // 数据库数据
        this.userId             = SAFE(opts.userId, '');
        this.nickName           = SAFE(opts.nickName, '');
        this.userIconUrl        = SAFE(opts.userIconUrl, '');
        this.sex                = SAFE(opts.sex, 0);
        this.openId             = SAFE(opts.openId, '');
        this.unionId            = SAFE(opts.unionId, '');
        this.roomId             = SAFE(opts.roomId, '');
        this.isAgent            = SAFE(opts.isAgent, 0);
        this.restCard           = SAFE(opts.restCard, 0);
        this.restGold           = SAFE(opts.restGold, 0);
        this.hadUseCard         = SAFE(opts.hadUseCard, 0);
        // 连接生成数据
        this.ipAddress          = SAFE(opts.ipAddress, '');
        this.serverId           = SAFE(opts.serverId, '');
        this.connectTime        = SAFE(opts.connectTime, Date.now());
        // 房间生成数据
        this.location           = SAFE(opts.location, {latitude:0, longtitude:0});
        this.isOnline           = SAFE(opts.isOnline, 1);
        this.isReady            = SAFE(opts.isReady, 0);
        this.inIndex            = SAFE(opts.inIndex, 0);
        this.roomScore          = SAFE(opts.roomScore, this.getInitScore());
        this.roomRank           = SAFE(opts.roomRank, this.getInitRank());
        this.isRoomCreator      = SAFE(opts.isRoomCreator, 0);
        this.isDealer           = SAFE(opts.isDealer, 0);
    }

    // --------------------- interface ----------------------

    getInitScore() {
        return 0;
    }

    getInitRank() {
        return 8;
    }

    // ----------------------- method ------------------------

    /**
     * 设置在线状态
     * @param {Boolean} isOnline 
     */
    setIsOnline(isOnline) {
        this.isOnline = isOnline ? 1 : 0;
        this.connectTime = Date.now();
    }
}

module.exports = UserBase