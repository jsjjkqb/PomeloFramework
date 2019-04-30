let SAFE = require('../../util/modelUtil').SAFE;

/**
 * 座位号管理分配
 * 2019-04-22
 */
class IndexManager {
    constructor(opts = {}) {
        this.indexArr = SAFE(opts.indexArr, []);    // 座位表
    }

    /**
     * 注册座位号
     */
    register() {
        let resultIndex = 0;
        if (this.indexArr.length == 0) {
            this.indexArr.push(0);
        } else {
            let lastIndex = this.indexArr[this.indexArr.length - 1] + 1;
            let hasIndex = false;
            // 是否有空缺座位
            for (let i = 0; i < lastIndex; i++) {
                if (this.indexArr[i] != i) {
                    hasIndex = true;
                    resultIndex = i;
                    this.indexArr.splice(i, 0, i);
                }
            }
            // 如果没有空缺座位就加到后面
            if (!hasIndex) {
                resultIndex = lastIndex;
                this.indexArr.push(resultIndex);
            }
        }
        return resultIndex;
    }

    /**
     * 注销该座位号
     * @param {Number} inIndex 
     */
    unregister(inIndex) {
        let findIndex = this.indexArr.indexOf(inIndex);
        if (findIndex >= 0) {
            this.indexArr.splice(findIndex, 1);
            return true;
        }
        return false;
    }
}

module.exports = IndexManager