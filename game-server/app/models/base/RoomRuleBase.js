let SAFE = require('../../util/modelUtil').SAFE;

class RoomRuleBase {
    constructor(opts = {}) {
        this.countOfRun         = SAFE(opts.countOfRun, 0);         // 局数
        this.payWay             = SAFE(opts.payWay, 1);             // 支付方式：1房主支付，2AA支付
        this.isFraud            = SAFE(opts.isFraud, 0);            // 防作弊：1防作弊，0不防作弊
        this.maxUserCount       = SAFE(opts.maxUserCount, 8);       // 最大玩家数量
        this.consumeCardCount   = SAFE(opts.consumeCardCount, 0);   // 耗卡数
        this.maxRunCount        = SAFE(opts.maxRunCount, 0);        // 最大局数（麻将以风圈计）
    }
}

module.exports = RoomRuleBase