let SAFE = require('../../util/modelUtil').SAFE;
let PlaybackBase = require('./PlaybackBase');

/**
 * 回放列表
 * 2019-04-18
 */
class PlaybackListBase extends Array {
    constructor(opts = {}) {
        super()
    }

    // ------------- interface ----------------

    /**
     * 获取记录Class
     */
    getPlaybackClass() {
        return PlaybackBase
    }

    /**
     * 创建一条记录
     * @param {Object} opts 
     */
    _newPlayback(opts = {}) {
        let PlaybackClass = this.getPlaybackClass();
        return new PlaybackClass(opts);
    }

    // ------------- method -------------------

    /**
     * 加入一条记录
     * @param {Object} opts 
     */
    pushOnePlayback(opts = {}) {
        let playback = this._newPlayback(opts);
        this.push(playback);
    }

    /**
     * 获取操作的最后一个记录
     * 操作为空则返回最后一个记录
     * @param {Number} operation 
     */
    getLastPlayback(operation = null) {
        if (operation == null) {
            return this[this.length - 1];
        }
        for (let i = this.length - 1; i >= 0; i--) {
            const playback = this[i];
            if (playback.operation == operation) {
                return playback;
            }
        }
    }
}

module.exports = PlaybackListBase