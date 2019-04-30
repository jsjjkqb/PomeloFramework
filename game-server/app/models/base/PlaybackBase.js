let SAFE = require('../../util/modelUtil').SAFE;

/**
 * 出牌/操作记录
 * 2019-04-18
 */
class PlaybackBase {
    constructor(opts = {}) {
        this.userId         = SAFE(opts.userId, '');        // 玩家ID
        this.inIndex        = SAFE(opts.inIndex, 0);        // 序号
        this.operation      = SAFE(opts.operation, 0);      // 操作类型
        this.ongoingCards   = SAFE(opts.ongoingCards, []);  // 该次出牌组
    }
}

module.exports = PlaybackBase