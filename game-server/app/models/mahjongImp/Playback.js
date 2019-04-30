let PlaybackBase = require('../base/PlaybackBase');

let SAFE = require('../../util/modelUtil').SAFE;

/**
 * 回放记录
 * 2019-04-24
 */
class Playback extends PlaybackBase {
    constructor(opts = {}) {
        super(opts);
        this.grabPlayer = SAFE(opts.grabPlayer, null);  // 被碰杠吃牌人的信息{userId, card}
    }
}

module.exports = Playback