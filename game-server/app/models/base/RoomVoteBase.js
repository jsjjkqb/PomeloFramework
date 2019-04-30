let SAFE = require('../../util/modelUtil').SAFE;

VoteResult = {
    NONE    : -2,   // 投票未开始
    VOTING  : -1,   // 正在投票
    VOTENO  : 0,    // 投票失败
    VOTEYES : 1,    // 投票成功
}

VoteAgree = {
    NONE    : -1,   // 未投票
    VOTENO  : 0,    // 不同意解散
    VOTEYES : 1,    // 同意解散
}

class VoteUser {
    constructor(opts = {}) {
        this.userId         = SAFE(opts.userId, '');                // 玩家ID
        this.nickName       = SAFE(opts.nickName, '');              // 昵称
        this.isOnline       = SAFE(opts.isOnline, 1);               // 在线状态
        this.isAgree        = SAFE(opts.isAgree, VoteAgree.NONE);   // 是否同意解散
        this.voteIndex      = SAFE(opts.voteIndex, -1);             // 投票顺序
    }
}

class RoomVoteBase {
    constructor(opts = {}) {
        this.userList       = SAFE(opts.userList, []);                  // 玩家投票列表
        this.voteResult     = SAFE(opts.voteResult, VoteResult.NONE);   // 投票结果
        this.isFirstVote    = SAFE(opts.isFirstVote, 0);                // 是否第一次投票
        this.indicator      = SAFE(opts.indicator, '');                 // 第一个投票玩家ID
        this.voteIndex      = SAFE(opts.voteIndex, 0);                  // 投票顺序
    }

    /**
     * 初始化玩家列表
     * @param {Array} userList 
     */
    initVote(userList) {
        this.userList = userList.map(user => {
            return new VoteUser(user);
        })
    }

    /**
     * 刷新在线状态
     * @param {String} userId 
     * @param {Boolean} isOnline 
     */
    setIsOnline(userId, isOnline) {
        for (let i = 0; i < this.userList.length; i++) {
            if (this.userList[i].userId == userId) {
                this.userList[i].isOnline = isOnline ? 1 : 0;
                break;
            }
        }
    }

    /**
     * 投票
     * @param {String} userId 
     * @param {Number} isAgree 
     */
    voteDismiss(userId, isAgree) {
        // 是否结束
        if (this.voteResult == VoteResult.VOTENO || this.voteResult.VoteResult.VOTEYES) {
            return this.getVoteResult();
        }
        // 第一次投票
        if (this.voteResult == VoteResult.NONE) {
            this.isFirstVote = 1;
            this.indicator = userId;
        } else {
            this.isFirstVote = 0;
        }
        // 刷新投票状态
        this.voteResult = VoteResult.VOTING;
        // 设置玩家状态
        let user = this.userList.find(user => {
            return user.userId == userId;
        })
        if (user) {
            user.isAgree = isAgree;
            user.voteIndex = this.voteIndex++;
        }
        return this.getVoteResult();
    }

    /**
     * 获取投票结果
     */
    getVoteResult() {
        if (this.voteResult != VoteResult.NONE) {
            // 投票顺序排序
            this.userList.sort((a, b) => {
                return a.voteIndex - b.voteIndex;
            });
            // 是否结束投票
            let yesThreshold = this.getYesThreshold();
            let noThreshold  = this.getNoThreshold();
            let yesCount     = 0;
            let noCount      = 0;
            // 计数
            this.userList.forEach(user => {
                yesCount += user.isAgree || this._offlineAsAgree(user) ? 1 : 0;
                noCount  += user.isAgree ? 0 : 1;
            });
            // 是否结束
            if (noCount >= noThreshold) {
                this.voteResult = VoteResult.VOTENO;
            } else if (yesCount >= yesThreshold) {
                this.voteResult = VoteResult.VOTEYES;
            }
        }
        // 返回投票结果
        return {
            agreeList       : this.userList.map(user => new VoteUser(user)),
            isFirstVote     : this.isFirstVote,
            indicator       : this.indicator,
            voteResult      : this.voteResult
        }
    }

    reset() {
        this.voteResult = VoteResult.NONE;
        this.indicator = '';
        this.isFirstVote = 0;
        this.userList.forEach(user => {
            user.isAgree = VoteAgree.NONE;
            user.voteIndex = -1;
        });
    }

    // -------------------------- overwrite --------------------------------

    getYesThreshold() {
        return this.userList.length;
    }

    getNoThreshold() {
        return 1;
    }

    isOfflineAsAgree() {
        return true;
    }

    // --------------------------- private --------------------------------

    /**
     * 离线且未投票，是否默认同意
     * @param {VoteUser} user 
     */
    _offlineAsAgree(user) {
        return this.isOfflineAsAgree() && user.isOnline == 0 && user.isAgree == VoteAgree.NONE;
    }
}

module.exports = RoomVoteBase