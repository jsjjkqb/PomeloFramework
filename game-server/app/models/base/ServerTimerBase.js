let SAFE = require('../../util/modelUtil').SAFE;
let timerLogger = require('pomelo-logger').getLogger('timer', __filename);

class TimerData {
    constructor(opts = {}) {
        this.id             = SAFE(opts.id, Date.now());
        this.cb             = SAFE(opts.cb, ()=>{});
        this.msg            = SAFE(opts.msg, '');
        this.duration       = SAFE(opts.duration, 0);
        this.isRepeat       = SAFE(opts.isRepeat, 0);
        this.startDate      = SAFE(opts.startDate, Date.now());
    }
}

let mInstance = null;

/**
 * 倒计时管理
 * 2019-04-23
 */
class ServerTimerBase {
    constructor() {
        this.timerMap = {};
    }

    static Instance() {
        if (mInstance == null) {
            mInstance = new ServerTimerBase();
        }
        return mInstance;
    }

    static StartTimer(cb, duration, opts, isRepeat = 0) {
        this.Instance().startTimer(cb, duration, opts, isRepeat);
    }

    static StopTimer(id) {
        this.Instance().stopTimer(id);
    }

    static GetRestTime(id) {
        this.Instance().getRestTime(id);
    }

    startTimer(cb, duration, opts, isRepeat = false) {
        let data = {
            id          : opts.id,
            msg         : opts.msg,
            cb          : cb,
            duration    : duration,
            isRepeat    : isRepeat ? 1 : 0
        }
        let timer = new TimerData(data);
        this.timerMap[timer.id] = timer;
        timerLogger.info('倒计时开始', timer.id, timer.msg);
        return timer.id;
    }

    stopTimer(id) {
        if (this.timerMap[id]) {
            delete this.timerMap[id];
        }
        timerLogger.info('倒计时取消', id);
    }

    nextTick() {
        let now = Date.now();
        for (const id in this.timerMap) {
            if (this.timerMap.hasOwnProperty(id)) {
                const timer = this.timerMap[id];
                if (now - timer.startDate >= timer.duration * 1000) {
                    // 时间到
                    timer.cb(timer.id, timer.msg);
                    // 是否重复
                    if (timer.isRepeat) {
                        timer.startDate = now;
                    } else {
                        delete this.timerMap[id];
                    }
                    timerLogger.info('倒计时触发', timer.id, timer.msg);
                }
            }
        }
    }

    getRestTime(id) {
        let restTime = 0;
        if (this.timerMap[id]) {
            const timer = this.timerMap[id];
            let now = Date.now();
            let delta = Math.floor((now - timer.startDate) / 1000);
            restTime = timer.duration - delta;
        }
        return restTime;
    }
}

module.exports = ServerTimerBase