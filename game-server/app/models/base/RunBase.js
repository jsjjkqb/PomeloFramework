let EventEmitter = require('events').EventEmitter;

let SAFE = require('../../util/modelUtil').SAFE;
let CircleTokenBase = require('./CircleTokenBase');
let PlaybackListBase = require('./PlaybackListBase');
let PlayerBase = require('./PlayerBase');

RunNotify = {
    RunStart    : 'RunStart',
    RunEnd      : 'RunEnd'
}

class RunBase extends EventEmitter {
    constructor(opts = {}) {
        super();
        this.runId                  = SAFE(opts.runId, Date.now().toString());  //
        this.roomId                 = SAFE(opts.roomId, '');                    // 房间号
        this.roomRule               = SAFE(opts.roomRule, null);                // 房间规则
        this.runNumber              = SAFE(opts.runNumber, 0);                  // 当前局数
        this.playerList             = SAFE(opts.playerList, []);                // 玩家列表
        this.circleToken            = SAFE(opts.circleToken, null);             // 令牌环
        this.playbackList           = SAFE(opts.playbackList, null);            // 回放
        this.isEnd                  = SAFE(opts.isEnd, false);                  // 是否结束

        this.destroyDelegate        = SAFE(opts.destroyDelegate, null);         // run销毁回调
    }

    // ----------------------- private -------------------------

    _destroyRun() {
        this._notify(RunNotify.RunEnd);
        if (this.destroyDelegate) {
            this.destroyDelegate();
        }
    }

    _notify(notifyName, notifyOpts = {}) {
        setImmediate(()=>{
            setImmediate(()=>{
                notifyOpts.run = this;
                this.emit(notifyName, notifyOpts);
            })
        })
    }

    // ------------------------ overwrite --------------------------

    initRun(opts = {}) {
        this.roomId = opts.roomId;
        this.roomRule = opts.roomRule;
        this.runNumber = opts.runNumber;
        
        let PlayerClass = this.getPlayerClass();
        this.playerList = opts.userList.map(user => {
            let player = new PlayerClass();
            player.user = user;
            return player;
        })

        let CircleTokenClass = this.getCircleTokenClass();
        this.circleToken = new CircleTokenClass();
        this.playerList.forEach(player => {
            this.circleToken.addUserId(player.userId);
        });

        let PlaybackListClass = this.getPlaybackListClass();
        this.playbackList = new PlaybackListClass();

        if (!opts.DEBUG) {
            this.registerEvent();
        }
    }

    /**
     * 清理对象关联，防止内存泄漏
     */
    destroy() {
        this.roomRule = null;
        this.circleToken = null;
        this.playbackList = null;
        this.unregisterEvent();
    }

    getCircleTokenClass() {
        return CircleTokenBase;
    }

    getPlaybackListClass() {
        return PlaybackListBase;
    }

    getPlayerClass() {
        return PlayerBase;
    }

    registerEvent() {

    }

    unregisterEvent() {

    }
}

module.exports = RunBase