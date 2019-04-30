let PlaybackListBase = require('../base/PlaybackListBase');
let Playback = require('./Playback');

let dataUtil = require('../../util/dataUtil');

/**
 * 回放列表
 * 2019-04-24
 */
class PlaybackList extends PlaybackListBase {
    constructor(opts = {}) {
        super(opts);
        
    }

    getPlaybackClass() {
        return Playback;
    }

    _newPlayback(operation, userId, cardList) {
        return super._newPlayback({
            userId      : userId,
            inIndex     : this.length,
            ongoingCards: dataUtil.convertCardToInt(cardList, true),
            operation   : operation
        })
    }

    pushPlayback(operation, userId, cardList, grabUserId, grabCard) {
        let playback = this._newPlayback(operation, userId, cardList);
        if (grabUserId) {
            playback.grabPlayer = {userId: grabUserId, card: dataUtil.convertCardToInt(grabCard)};
        }
        this.push(playback);
    }
}

module.exports = PlaybackList