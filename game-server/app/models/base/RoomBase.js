let EventEmitter = require('events').EventEmitter;

let SAFE = require('../../util/modelUtil').SAFE;
let IndexManager = require('./IndexManager');
let RoomRuleBase = require('./RoomRuleBase');
let RoomVoteBase = require('./RoomVoteBase');
let RunBase      = require('./RunBase');
let UserBase     = require('./UserBase');
let Timer        = require('./ServerTimerBase');
let Code         = require('../../util/code');

RoomNotify = {
    UserEnter       : 'UserEnter',
    UserExit        : 'UserExit',
    UserOnline      : 'UserOnline',
    UserOffline     : 'UserOffline',
    UserReady       : 'UserReady',
    SendChatMsg     : 'SendChatMsg',
    VoteDismiss     : 'VoteDismiss',
    RoomDismiss     : 'RoomDismiss',
    VoteTimeout     : 'VoteTimeout',
    RoomEnd         : 'RoomEnd',
    ForceDismiss    : 'ForceDismiss',
}

class RoomBase extends EventEmitter {
    constructor(opts = {}) {
        super();
        this.roomId             = SAFE(opts.roomId);
        this.roomCreator        = SAFE(opts.roomCreator, '');
        this.isProxy            = SAFE(opts.isProxy, 0);
        this.isMatch            = SAFE(opts.isMatch, 0);

        this.uuid               = SAFE(opts.uuid, '');
        this.playbackList       = SAFE(opts.playbackList, []);
        this.runNumber       = SAFE(opts.runNumber, 0);
        this.run                = SAFE(opts.run, null);
        this.userList           = SAFE(opts.userList, []);

        this.indexManager       = SAFE(opts.indexManager, new IndexManager());
        this.roomRule           = SAFE(opts.roomRule, null);
        this.roomVote           = SAFE(opts.roomVote, null);

        this.preUseTimer        = SAFE(opts.preUseTimer, null);
        this.preStartTimer      = SAFE(opts.preStartTimer, null);
        this.hostLeaveTimer     = SAFE(opts.hostLeaveTimer, null);
        this.guestLeaveTimerMap = SAFE(opts.guestLeaveTimerMap, new Map());
        this.allLeaveTimer      = SAFE(opts.allLeaveTimer, null);
        this.voteTimer          = SAFE(opts.voteTimer, null);
        this.matchTimer         = SAFE(opts.matchTimer, null);

        this.preUseDuration     = SAFE(opts.preUseDuration, 60 * 15);           // 房间号未使用前时长，超时解散房间
        this.preStartDuration   = SAFE(opts.preStartDuration, 60 * 60);         // 房间未开局前时长，超时解散房间
        this.hostLeaveDuration  = SAFE(opts.hostLeaveDuration, 60 * 3);         // 房间未开局，房主离线时长，超时解散房间
        this.guestLeaveDuration = SAFE(opts.guestLeaveDuration, 60 * 2);        // 房间未开局，玩家离线时长，超时退出房间
        this.allLeaveDuration   = SAFE(opts.allLeaveDuration, 60 * 60 * 6);     // 所有人离线时长，超时解散房间
        this.voteDuration       = SAFE(opts.voteDuration, 60 * 3);              // 投票时长，超时解散房间
        this.matchDuration      = SAFE(opts.matchDuration, 15);                 // 匹配开局时长，超时移除玩家并通知添加机器人

        this.matchDelegate      = SAFE(opts.matchDelegate, null);               // 匹配开局超时通知机器人
    }

    // ----------------------- overwrite method --------------------------

    getUserClass() {
        return UserBase;
    }

    getRunClass() {
        return RunBase;
    }

    getRoomRuleClass() {
        return RoomRuleBase;
    }

    getRoomVoteClass() {
        return RoomVoteBase;
    }

    /**
     * 是否可以开局
     */
    canStartRun() {
        return false;
    }

    /**
     * 是否可以结束房间
     */
    canEndRoom() {
        return this.runNumber >= this.roomRule.maxRunCount;
    }

    /**
     * 注册监听事件
     */
    registerEvent() {

    }

    /**
     * 取消注册监听事件
     */
    unregisterEvent() {

    }

    /**
     * 开局
     */
    startOneRun(opts = {}) {
        // 取消离线倒计时、重置玩家准备状态
        this.userList.forEach(user => {
            user.isReady = 0;
            if (user.userId == this.roomCreator) {
                this.setHostLeaveTimer(false);
            } else {
                this.setGuestLeaveTimer(user.userId, false);
            }
        })
        // 取消开局倒计时
        this.setPreStartTimer(false);
        this.setMatchTimer(false);
        // 第一局创建投票通道
        if (this.runNumber == 0) {
            this._setRoomVote(this.userList);
        }
        // 创建Run
        opts.roomId = this.roomId;
        opts.roomRule = this.roomRule;
        opts.runNumber = this.runNumber;
        opts.userList = this.userList;
        let RunClass = this.getRunClass();
        this.run = new RunClass();
        this.run.initRun(opts);
        this.run.destroyDelegate = this._destroyRun.bind(this);
    }

    /**
     * 匹配房超时未开局处理
     */
    handleMatchTimeout() {
        // 将没有准备的玩家移除，通知机器人
        let robotCount = 0;
        this.userList.forEach(user => {
            if (user.isReady == 0) {
                robotCount++;
                this.setUserExit(user.userId);
            }
        })
        let length = this.userList.length;
        if (robotCount == 0) {
            robotCount = this.roomRule.maxUserCount - length;
        }
        if (robotCount > 0) {
            if (this.matchDelegate) {
                this.matchDelegate({robotCount: robotCount, roomId: this.roomId});
            } else {
                this._destroyRoom(RoomNotify.ForceDismiss, '匹配错误');
            }
        } else {
            this.startOneRun();
        }
    }

    // ----------------------- private method ------------------------

    /**
     * 创房规则
     * @param {Object} opts 
     */
    _setRoomRule(opts = {}) {
        let RoomRuleClass = this.getRoomRuleClass();
        this.roomRule = new RoomRuleClass(opts);
    }

    /**
     * 房间玩家
     * @param {Array<UserBase>} userList 
     */
    __setUserList(userList = []) {
        let UserClass = this.getUserClass();
        this.userList = userList.map(user => {
            return new UserClass(user);
        })
    }

    /**
     * 房间投票管理
     * @param {Array<UserBase>} userList 
     */
    _setRoomVote(userList = []) {
        let RoomVoteClass = this.getRoomVoteClass();
        this.roomVote = new RoomVoteClass();
        this.roomVote.initVote(userList);
    }

    /**
     * 根据玩家座位排序
     */
    _sortUserList() {
        this.userList.sort((a, b) => {
            return a.inIndex - b.inIndex;
        });
    }

    /**
     * 获取玩家
     * @param {String} userId 
     */
    _getUserById(userId) {
        return this.userList.find(user => {
            return user.userId == userId;
        })
    }

    _destroyRoom(notifyName, reason = null) {

    }

    _destroyRun() {

    }

    _resetRoomVote() {
        this.roomVote.reset();
    }

    _checkStartRun() {
        if (this.canStartRun()) {
            this.startOneRun();
        }
    }

    _notify(notifyName, notifyOpts = {}) {
        setImmediate(()=>{
            setImmediate(()=>{
                notifyOpts.room = this;
                this.emit(notifyName, notifyOpts);
            })
        })
    }

    // ----------------------- public method ------------------------

    get runId() {
        return this.run ? this.run.runId : null;
    }

    /**
     * 初始化房间
     * @param {String} roomId 
     * @param {String} roomCreator 
     * @param {Object} roomRuleOpts 
     * @param {Number} isProxy 
     * @param {Number} isMatch 
     */
    initRoom(roomId, roomCreator, roomRuleOpts = {}, isProxy = 0, isMatch = 0) {
        this.roomId         = roomId;
        this.roomCreator    = roomCreator;
        this.isProxy        = isProxy;
        this.isMatch        = isMatch;
        this.uuid           = roomId + '_' + Date.now();
        this._setRoomRule(roomRuleOpts);
        if (!roomRuleOpts.DEBUG) {
            this.registerEvent();
        }
        this.setPreUseTimer(true);
        if (this.isMatch) {
            this.setMatchTimer(true);
        }
    }

    /**
     * 重启恢复房间，在roomKeeper中调用
     * 为了解散正常，redis中只保存打完过一局的房间
     * @param {Object} opts 取自于redis中保存的房间数据
     */
    resumeRoom(opts = {}) {
        this.roomId         = roomId;
        this.roomCreator    = roomCreator;
        this.isProxy        = isProxy;
        this.isMatch        = isMatch;
        this.uuid           = opts.uuid;
        this.runNumber   = opts.runNumber;
        this._setRoomRule(roomRuleOpts);
        this.__setUserList(opts.userList);
        this._setRoomVote(opts.userList);
        this.setAllLeaveTimer(true);
    }

    /**
     * 刷新玩家在线状态
     * @param {String} userId 
     * @param {Boolean} isOnline 
     */
    setUserOnline(userId, isOnline) {
        let user = this._getUserById(userId);
        if (!user) {
            // 玩家不存在
            return Code.makeResult(Code.ROOM.NO_USER);
        }
        user.setIsOnline(isOnline);
        // 推送
        this._notify(isOnline ? RoomNotify.UserOnline : RoomNotify.UserOffline, {userId: userId});
        // 刷新投票玩家在线状态
        this.roomVote.setIsOnline(userId, isOnline);
        // 刷新倒计时
        if (this.runNumber <= 0) {
            // 未开局的倒计时
            if (userId == this.roomCreator) {
                this.setHostLeaveTimer(isOnline);
            } else {
                this.setGuestLeaveTimer(isOnline);
            }
        }
        // 如果所有玩家离线，则开启倒计时
        let isAllLeave = this.userList.every(user => {
            return user.isOnline;
        })
        this.setAllLeaveTimer(isAllLeave);
        return Code.makeResult();
    }

    /**
     * 玩家加入房间
     * @param {UserBase} userOpts 
     */
    setUserEnter(userOpts = {}) {
        let user = this._getUserById(userOpts.userId);
        // 如果玩家已在房间，则刷新在线状态
        if (user) {
            this.setUserOnline(user.userId, true);
            // 刷新IP
            user.ipAddress = userOpts.ipAddress;
        } else {
            // 如果玩家不在房间，是否满人，是否已开局
            if (this.userList.length >= this.roomRule.maxUserCount) {
                return Code.makeResult(Code.ROOM.ENOUGH_PLAYER);
            }
            if (this.runNumber > 0) {
                return Code.makeResult(Code.ROOM.HAD_BEGIN);
            }
            // 加入房间
            let UserClass = this.getUserClass();
            user = new UserClass(userOpts);
            this.userList.push(user);
            user.isRoomCreator = this.roomCreator == user.userId ? 1 : 0;
            // 注册座位号
            user.inIndex = this.indexManager.register();
            // 座位排序
            this._sortUserList();
            // 第一位玩家加入，取消使用倒计时，设置开局倒计时
            if (this.userList.length == 1) {
                this.setPreUseTimer(false);
                this.setPreStartTimer(true);
            }
            // 停止所有玩家离线倒计时
            this.setAllLeaveTimer(false);
            // 推送
            this._notify(RoomNotify.UserEnter);
        }
        return Code.makeResult();
    }

    setUserExit(userId) {
        // 游戏已开始，不能退出
        if (this.runNumber > 0) {
            return Code.makeResult(Code.ROOM.HAD_BEGIN);
        }
        let delUser = null;
        this.userList = this.userList.filter(user => {
            if (user.userId == userId) {
                delUser = user;
                return false;
            }
            return true;
        })
        if (delUser) {
            // 注销座位号
            this.indexManager.unregister(delUser.inIndex);
            this._notify(RoomNotify.UserExit, {userId: userId});
            // 如果非代理房的房主离开，则解散房间
            if (userId == this.roomCreator && !this.isProxy) {
                this._destroyRoom(RoomNotify.ForceDismiss);
            } else {
                // 是否可以开局：有些游戏不一定需要满人
                this._checkStartRun();
            }
        }
        return Code.makeResult();
    }

    /**
     * 玩家准备就绪
     * @param {String} userId 
     * @param {Number} isReady 
     */
    setUserReady(userId, isReady) {
        let user = this._getUserById(userId);
        if (user) {
            // 是否已开局
            if (this.run) {
                return Code.makeResult(Code.ROOM.HAD_BEGIN);
            }
            // 刷新玩家状态
            user.isReady = isReady;
            // 推送
            this._notify(RoomNotify.UserReady, {
                userId  : userId,
                isReady : isReady
            });
            // 是否可以开局
            this._checkStartRun();
            return Code.makeResult();
        }
        return Code.makeResult(Code.ROOM.NO_USER);
    }

    /**
     * 聊天
     * @param {Object} msg {userId, chatMsg, type, audioLength}
     */
    sendChatMsg(msg) {
        let user = this.setHostLeaveTimer._getUserById(msg.userId);
        if (user) {
            // 转发
            this._notify(RoomNotify.SendChatMsg, {chatMsg: msg});
            return Code.makeResult();
        }
        return Code.makeResult(Code.ROOM.NO_USER);
    }

    /**
     * 设置位置信息/IP
     * @param {String} userId 
     * @param {Object} location 位置信息：经纬度
     * @param {String} ipAddress IP
     */
    setLocation(userId, location, ipAddress = null) {
        let user = this.setHostLeaveTimer._getUserById(userId);
        if (user) {
            let lct = {latitude: 0, longtitude: 0};
            if (location.latitude) {
                lct.latitude = location.latitude;
            }
            if (location.longtitude) {
                lct.longtitude = location.longtitude;
            }
            user.location = lct;
            if (ipAddress) {
                user.ipAddress = ipAddress;
            }
            return Code.makeResult();
        }
        return Code.makeResult(Code.ROOM.NO_USER);
    }

    /**
     * 获取位置距离信息
     */
    getFraudInfo() {

    }

    /**
     * 投票解散
     * @param {String} userId 
     * @param {Number} isAgree 是否同意解散
     */
    voteDismiss(userId, isAgree) {
        let user = this._getUserById(userId);
        if (user) {
            let voteResult = this.roomVote.voteDismiss(userId, isAgree);
            // 开启定时器
            if (voteResult.isFirstVote) {
                this.setVoteTimer(true);
            }
            // 投票剩余时间
            voteResult.restTime = this.getRestTimeById(this.voteTimer);
            // 推送
            this._notify(RoomNotify.VoteDismiss, {voteResult: voteResult});
            // 取消定时器、是否解散房间
            if (voteResult.voteResult != -1) {
                this.setVoteTimer(false);
                if (voteResult.voteResult == 1) {
                    // 解散房间
                    this._destroyRoom(RoomNotify.RoomDismiss);
                } else {
                    // 不解散，重置投票
                    this._resetRoomVote();
                }
            }
            return Code.makeResult();
        }
        return Code.makeResult(Code.ROOM.NO_USER);
    }

    // ----------------------- timer method -------------------------

    setPreUseTimer(isEnable) {
        Timer.stopTimer(this.preUseTimer);
        if (isEnable) {
            let timerId = this.createTimerId('preUseTimer');
            this.preUseTimer = Timer.StartTimer((id, msg)=>{
                this._destroyRoom(RoomNotify.ForceDismiss, '房间超时未使用');
            }, this.preUseDuration, {id: timerId});
        }
    }

    setPreStartTimer(isEnable) {
        Timer.StopTimer(this.preStartTimer);
        if (isEnable) {
            let timerId = this.createTimerId('preStartTimer');
            this.preStartTimer = Timer.StartTimer((id, msg)=>{
                this._destroyRoom(RoomNotify.ForceDismiss, '房间超时未开局');
            }, this.preStartDuration, {id: timerId});
        }
    }

    setHostLeaveTimer(isEnable) {
        Timer.StopTimer(this.hostLeaveTimer);
        if (isEnable) {
            let timerId = this.createTimerId('hostLeaveTimer');
            this.hostLeaveTimer = Timer.StartTimer((id, msg)=>{
                this._destroyRoom(RoomNotify.ForceDismiss, '房主离线超时解散');
            }, this.hostLeaveDuration, {id: timerId});
        }
    }

    setGuestLeaveTimer(userId, isEnable) {
        Timer.StopTimer(this.guestLeaveTimerMap[userId]);
        if (isEnable) {
            let timerId = this.createTimerId('guestLeaveTimer' + userId);
            let timer = Timer.StartTimer((id, msg)=>{
                this.setUserExit(msg);
            }, this.guestLeaveDuration, {id: timerId, msg: userId});
            this.guestLeaveTimerMap.set(userId, timer);
        }
    }

    setAllLeaveTimer(isEnable) {
        Timer.StopTimer(this.allLeaveTimer);
        if (isEnable) {
            let timerId = this.createTimerId('allLeaveTimer');
            this.allLeaveTimer = Timer.StartTimer((id, msg)=>{
                this._destroyRoom(RoomNotify.ForceDismiss, '房间超时未活动');
            }, this.allLeaveDuration, {id: timerId});
        }
    }

    setVoteTimer(isEnable) {
        Timer.StopTimer(this.voteTimer);
        if (isEnable) {
            let timerId = this.createTimerId('voteTimer');
            this.voteTimer = Timer.StartTimer((id, msg)=>{
                this._destroyRoom(RoomNotify.VoteTimeout, '投票超时解散');
            }, this.voteDuration, {id: timerId});
        }
    }

    setMatchTimer(isEnable) {
        Timer.StopTimer(this.matchTimer);
        if (isEnable) {
            let timerId = this.createTimerId('matchTimer');
            this.matchTimer = Timer.StartTimer((id, msg)=>{
                this.handleMatchTimeout();
            }, this.matchDuration, {id: timerId});
        }
    }

    createTimerId(tag) {
        return this.roomId + tag + Date.now();
    }

    getRestTimeById(timerId) {
        return Timer.GetRestTime(timerId);
    }
}

module.exports = RoomBase