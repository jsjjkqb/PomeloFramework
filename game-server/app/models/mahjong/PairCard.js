let SAFE = require('../../util/modelUtil').SAFE;
let sortUtil = require('../../util/sortUtil');
let Define = require('./Define');

/**
 * 将
 * 2019-04-24
 */
class PairCard {
    constructor(opts = {}) {
        this.cards = SAFE(opts.cards, null);
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
     */
    checkCards(theCards = []) {
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
        // 鬼牌可变任意牌
        if (Define.isCanGhostPengGang && isAllSame) {
            this.cards = sortUtil.sort(theCards);
            return this;
        }
        // 无鬼时，普通牌需一致
        if (!Define.isCanGhostPengGang && normalList.length == theCards.length) {
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