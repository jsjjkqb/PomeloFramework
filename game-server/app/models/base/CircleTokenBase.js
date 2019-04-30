let SAFE = require('../../util/modelUtil').SAFE

/**
 * 令牌环
 * 2019-04-18
 */
class CircleTokenBase {
    constructor(opts = {}) {
        this.userIdList             = SAFE(opts.userIdList, []);            // 玩家ID列表
        this.curIndex               = SAFE(opts.curIndex, 0);               // 当前令牌环索引
    }

    /**
     * 添加玩家ID到令牌环
     * @param {String} userId 
     */
    addUserId(userId) {
        if (!this.isContainUserId(userId)) {
            this.userIdList.push(userId);
        }
    }

    /**
     * 是否已存在于令牌环
     * @param {String} userId 
     */
    isContainUserId(userId) {
        return this.userIdList.indexOf(userId) >= 0;
    }

    /**
     * 从令牌环中移除玩家ID
     * @param {String} userId 
     */
    removeUserId(userId) {
        this.userIdList = this.userIdList.filter(tmpId => {
            return tmpId != userId;
        })
        if (this.curIndex >= this.userIdList.length) {
            this.curIndex = this.curIndex % this.userIdList.length;
        }
    }

    /**
     * 设置当前令牌环主玩家ID
     * @param {String} userId 
     */
    setCurrentUserId(userId) {
        let index = this.userIdList.indexOf(userId);
        if (index < 0) {
            return null;
        }
        this.curIndex = index;
        return this.getCurrentUserId();
    }

    /**
     * 获取当前令牌环主玩家ID
     */
    getCurrentUserId() {
        if (this.curIndex >= this.userIdList.length || this.userIdList.length <= 0) {
            return null;
        }
        return this.userIdList[this.curIndex];
    }

    /**
     * 移动令牌环到下一个索引
     */
    moveToNext() {
        this.curIndex++;
        this.curIndex = this.curIndex % this.userIdList.length;
    }

    /**
     * 令牌环人数
     */
    count() {
        return this.userIdList.length;
    }
}

module.exports = CircleTokenBase;