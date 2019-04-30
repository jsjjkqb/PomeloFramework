let SAFE = require('../../util/modelUtil').SAFE

let Card = require('./Card');
let sortUtil = require('../../util/sortUtil');

/**
 * 牌桌
 * 2019-04-23
 */
class Deck {
    constructor(opts = {}) {
        this.cardArray      = SAFE(opts.cardArray, []);     // 牌组
        this.assignIndex    = SAFE(opts.assignIndex, 0);    // 发牌位置
        this.assignLastIndex= SAFE(opts.assignLastIndex, 0);// 杠牌取牌位置
        this.ghostList      = SAFE(opts.ghostList, []);     // 鬼牌组
        this.gangList       = SAFE(opts.gangList, []);      // 单张可杠牌组
        this.remainCount    = SAFE(opts.remainCount, 0);    // 剩余牌数
    }

    initDeck(mjCount = 34, gangList = []) {
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < mjCount; i++) {
                let card = new Card();
                card.initPoint(i, [], gangList);
                this.cardArray.push(card);
            }       
        }
        this.remainCount = mjCount * 4;
        this.assignLastIndex = this.remainCount - 1;
    }

    /**
     * 洗牌
     */
    shuffle() {
        let length = this.cardArray.length;
        for (let i = 0; i < length; i++) {
            const card = this.cardArray[i];
            let randomIndex = this._getRandom() % length;
            const randomCard = this.cardArray[randomIndex];
            this.cardArray[i] = randomCard;
            this.cardArray[randomIndex] = card;
        }
    }

    /**
     * 对鬼牌进行重新洗牌
     */
    shuffleGhost() {
        // 剩余鬼牌置于53-80间
        if (this.ghostList.length <= 0) {
            return;
        }
        let ghostIndexList = this.cardArray.filter(card => {
            return this.ghostList.indexOf(card.point) >= 0;
        })
        for (let i = 0; i < ghostIndexList.length; i++) {
            const index = ghostIndexList[i];
            const card = this.cardArray[index];
            card.isGhost = 1;
            let randomIndex = this._getRandom() % 27 + 53;
            const randomCard = this.cardArray[randomIndex];
            this.cardArray[index] = randomCard;
            this.cardArray[randomIndex] = card;
        }
    }

    /**
     * 发单张牌
     */
    assginOneCard() {
        let cardList = this.assignCards(1);
        if (cardList.length > 0) {
            return cardList[0];
        }
        return null;
    }

    /**
     * 发多张牌
     * @param {Number} assignCount 
     */
    assignCards(assignCount = 13) {
        if (assignCount < 1) {
            return [];
        }
        // 选取
        let cardList = this.cardArray.slice(this.assignIndex, this.assignIndex + assignCount);
        // 取牌位置移动
        this.assignIndex += assignCount;
        // 剩余牌数
        this.remainCount -= assignCount;
        // 牌组排序
        sortUtil.sort(cardList);
        // 返回
        return cardList;
    }

    /**
     * 杠发牌
     */
    assignLastOneCard() {
        let cardList = this.assignCards(1);
        if (cardList.length > 0) {
            return cardList[0];
        }
        return null;
    }

    /**
     * 杠发多张牌
     * @param {Number} assignCount 
     */
    assignLastCards(assignCount = 1) {
        if (assignCount < 1 || this.assignLastIndex < this.assignIndex) {
            return [];
        }
        // 选取
        let cardList = this.cardArray.slice(this.assignLastIndex - assignCount, this.assignLastIndex);
        // 杠牌取牌位置移动
        this.assignLastIndex -= assignCount;
        // 剩余牌数
        this.remainCount -= assignCount;
        // 牌组排序
        sortUtil.sort(cardList);
        // 返回
        return cardList;
    }

    /**
     * 发特定牌，然后补全
     * 将特定牌组互换位置到取牌位置处，优先取牌
     * @param {Array} specialCards 牌组Array<String>/Array<Number>
     * @param {Number} assignCount 
     */
    assignSpecialCards(specialCards = [], assignCount = 13) {
        if (specialCards.length <= 0) {
            return this.assignCards(assignCount);
        }
        if (typeof specialCards[0] == 'number') {
            specialCards = specialCards.map(card => {
                return DisplayNameList[card];
            })
        }
        let count = 0;
        for (let i = this.assignIndex; i < this.cardArray.length; i++) {
            const card = this.cardArray[i];
            let index = specialCards.indexOf(card.display);
            if (index < 0) {
                continue;
            }
            let pCard = this.cardArray[this.assignIndex + count];
            this.cardArray[this.assignIndex + count] = card;
            this.cardArray[i] = pCard;
            count++;
            specialCards.splice(index, 1);
            if (specialCards.length <= 0) {
                break;
            }
        }
        return this.assignCards(assignCount);
    }

    /**
     * 没牌了
     * @return {Boolean}
     */
    hasNoCard() {
        return this.assignIndex >= this.assignLastIndex || this.remainCount <= 0;
    }

    setGhostList(ghostList = []) {
        this.ghostList = ghostList;
    }

    _getRandom() {
        return Math.floor(Math.random() * 1000);
    }
}

module.exports = Deck