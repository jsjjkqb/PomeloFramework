let SAFE = require('../../util/modelUtil').SAFE;
let sortUtil = require('../../util/sortUtil');

/**
 * 将
 * 2019-04-24
 */
class PairCard {
    constructor(opts = {}) {
        this.cards = SAFE(opts.cards, []);
    }

    initCards(theCards = []) {
        if (theCards.length != 2) {
            return null;
        }
        return this.checkCards(theCards);
    }

    /**
     * 
     * @param {Array<Card>} theCards 
     * @param {Boolean} canWithGhost 是否带鬼：不会传进来参数，只使用默认值，不同游戏可以更改默认值
     */
    checkCards(theCards = [], canWithGhost = false) {
        // 普通牌数
        let normalList = theCards.filter(card => {
            return !card.isGhost;
        })
        if (normalList.length == 0) {
            return null;
        }
        // 点数是否一样
        let normalCard = normalList[0];
        let isAllSame = normalList.every(card => {
            return card.point == normalCard.point;
        })
        if (canWithGhost && isAllSame) {
            this.cards = sortUtil.sort(theCards);
            return this;
        }
        if (!canWithGhost && normalList.length == theCards.length) {
            this.cards = theCards;
            return this;
        }
        return null;
    }

    toObject() {
        return {
            cards   : this.cards,
        }
    }
}

module.exports = PairCard