let SAFE = require('../../util/modelUtil').SAFE;

/**
 * 玩家信息
 * 2019-04-19
 */
class PlayerBase {
    constructor(opts = {}) {
        this.user               = SAFE(opts.user, null);                    // 用户信息

        this.handCards          = SAFE(opts.handCards, []);                 // 手牌Array<Card>
        this.originalCards      = SAFE(opts.originalCards, []);             // 原始手牌Array<Number>
        this.pastCards          = SAFE(opts.pastCards, []);                 // 历史牌
        this.lastCards          = SAFE(opts.lastCards, []);                 // 上手出牌
        this.runScore           = SAFE(opts.runScore, 0);                   // 小局分数
        this.runRank            = SAFE(opts.runRank, this.getInitRank());   // 小局排名
        this.runWin             = SAFE(opts.runWin, 0);                     // 输赢：0输，1赢，2平
    }

    // -------------------- interface -------------------------

    getInitRank() {
        return 8;
    }

    // --------------------- param set --------------------------

    set roomScore(roomScore) {
        this.user.roomScore = roomScore;
    }

    set roomRank(roomRank) {
        this.user.roomRank = roomRank;
    }

    // --------------------- param get ---------------------------

    get userId() {
        return this.user.userId;
    }

    get nickName() {
        return this.user.nickName;
    }

    get userIconUrl() {
        return this.user.userIconUrl;
    }

    get sex() {
        return this.user.sex;
    }

    get restGold() {
        return this.user.restGold;
    }

    get isOnline() {
        return this.user.isOnline;
    }

    get inIndex() {
        return this.user.inIndex;
    }

    get roomScore() {
        return this.user.roomScore;
    }

    get roomRank() {
        return this.user.roomRank;
    }
}

module.exports = PlayerBase