let CircleTokenBase = require('../base/CircleTokenBase');
let Define = require('./Define');

class CircleTokenMJBase extends CircleTokenBase {
    constructor(opts = {}) {
        super(opts);

        this.operationUserIdList    = SAFE(opts.operationUserIdList, []);   // 可操作玩家ID列表
        this.opIndex                = SAFE(opts.opIndex, 0);                // 当前操作玩家索引
        this.opUserId               = SAFE(opts.opUserId, null);            // 当前操作玩家ID
        
        this.operationMap           = new Map();                            // 操作列表<operation, order>
        this.operationMap.set(Define.OPERATION.OPERATION_PASS,          Define.OPERATION.OPERATION_PASS)        // 过
        this.operationMap.set(Define.OPERATION.OPERATION_CHI,           Define.OPERATION.OPERATION_CHI)         // 吃
        this.operationMap.set(Define.OPERATION.OPERATION_PENG,          Define.OPERATION.OPERATION_PENG)        // 碰
        this.operationMap.set(Define.OPERATION.OPERATION_GONGGANG,      Define.OPERATION.OPERATION_GONGGANG)    // 公杠
        this.operationMap.set(Define.OPERATION.OPERATION_MINGGANG,      Define.OPERATION.OPERATION_MINGGANG)    // 明杠
        this.operationMap.set(Define.OPERATION.OPERATION_ANGANG,        Define.OPERATION.OPERATION_ANGANG)      // 暗杠
        this.operationMap.set(Define.OPERATION.OPERATION_CHIHU,         Define.OPERATION.OPERATION_CHIHU)       // 吃胡
        this.operationMap.set(Define.OPERATION.OPERATION_HU,            Define.OPERATION.OPERATION_HU)          // 自摸胡
        this.operationMap.set(Define.OPERATION.OPERATION_QIANGGANGHU,   Define.OPERATION.OPERATION_QIANGGANGHU) // 抢杠胡
        // 黄石麻将
        this.operationMap.set(Define.OPERATION.OPERATION_FENGGANG,      Define.OPERATION.OPERATION_FENGGANG)    // 红中发财杠
        this.operationMap.set(Define.OPERATION.OPERATION_GHOSTGANG,     Define.OPERATION.OPERATION_GHOSTGANG)   // 癞子杠
        // 从化麻将
        this.operationMap.set(Define.OPERATION.OPERATION_GHOSTPENG,     Define.OPERATION.OPERATION_GHOSTPENG)   // 带鬼碰
        this.operationMap.set(Define.OPERATION.OPERATION_GHOSTGANG,     Define.OPERATION.OPERATION_GHOSTGANG)   // 带鬼杠
    }

    /**
     * 添加操作
     * @param {String} userId 
     * @param {Number} operationList 
     */
    addOpUserId(userId, operationList) {
        let index = this.userIdList.indexOf(userId);
        let betaIndex = (index + this.userIdList.length - this.curIndex) % this.userIdList.length;
        operationList.forEach(operation => {
            let order = this.operationMap.get(operation);
            this.operationUserIdList.push({
                userId      : userId,
                operation   : operation,
                betaIndex   : betaIndex,
                order       : order
            })
        });
        // 排序：操作有先后顺序，玩家也有先后顺序
        this.operationUserIdList.sort((operationA, operationB) => {
            let aIndex = operationA.order * 100 - operationA.betaIndex
            let bIndex = operationB.order * 100 - operationB.betaIndex
            return bIndex - aIndex;
        });
        this.opIndex = 0;
    }

    /**
     * 获取当前操作玩家ID
     */
    getCurrentOpUserId() {
        if (this.opIndex >= this.operationUserIdList.length || this.operationUserIdList.length <= 0) {
            return null;
        }
        return this.operationUserIdList[this.opIndex].userId;
    }

    /**
     * 获取当前操作玩家操作列表
     */
    getCurrentOperationList() {
        let result = [];
        let curUserId = this.getCurrentOpUserId();
        for (let i = this.opIndex; i < this.operationUserIdList.length; i++) {
            const operation = this.operationUserIdList[i];
            if (operation.userId != curUserId) {
                break;
            }
            result.push(operation);
        }
        return result;
    }

    /**
     * 移动操作到下一位
     */
    moveToNextOp() {
        // 已经是最后一个操作了
        if (this.opIndex == this.operationUserIdList.length - 1) {
            return false;
        }
        let curUserId = this.getCurrentOpUserId();
        for (let i = this.opIndex; i < this.operationUserIdList.length; i++) {
            const operation = this.operationUserIdList[i];
            if (operation.userId == curUserId) {
                continue;
            }
            this.opIndex = i;
            break;
        }
        return true;
    }

    /**
     * 用户“过”
     * @param {String} userId 
     */
    passOperation(userId) {
        // 是否是该玩家操作
        if (this.getCurrentOpUserId() != userId) {
            return false;
        }
        // 移动操作索引
        let isSuccess = this.moveToNextOp();
        if (!isSuccess) {
            this.operationUserIdList = [];
            this.opIndex = 0;
        }
        return true;
    }

    /**
     * 做完这个操作后中断后续操作并清除操作列表
     * @param {String} userId 
     * @param {Number} operation 
     */
    doOperationBreak(userId, operation) {
        // 是否是该玩家操作
        if (this.getCurrentOpUserId() != userId) {
            return false;
        }
        // 是否有该操作
        let findOperation = false;
        for (let i = this.opIndex; i < this.operationUserIdList.length; i++) {
            const op = this.operationUserIdList[i];
            if (op.operation == operation && op.userId == userId) {
                findOperation = true;
                break;
            }
        }
        // 找不到该操作
        if (!findOperation) {
            return false;
        }
        // 令牌环索引到该玩家
        for (let i = 0; i < this.userIdList.length; i++) {
            if (this.userIdList[i] == userId) {
                this.curIndex = i;
                this.curUserId = this.getCurrentUserId();
            }
        }
        // 清除
        this.operationUserIdList = [];
        this.opIndex = 0;
        return true;
    }

    /**
     * 做完这个操作后继续后续操作
     * @param {String} userId 
     * @param {Number} operation 
     */
    doOperationContinue(userId, operation) {
        // 是否是该玩家操作
        if (this.getCurrentOpUserId() != userId) {
            return false;
        }
        // 是否有该操作
        let findOperation = false;
        for (let i = this.opIndex; i < this.operationUserIdList.length; i++) {
            const op = this.operationUserIdList[i];
            if (op.operation == operation && op.userId == userId) {
                findOperation = true;
                break;
            }
        }
        // 找不到该操作
        if (!findOperation) {
            return false;
        }
        let isSuccess = this.moveToNextOp();
        if (!isSuccess) {
            this.operationUserIdList = [];
            this.opIndex = 0;
        }
        return true;
    }
}

module.exports = CircleTokenMJBase