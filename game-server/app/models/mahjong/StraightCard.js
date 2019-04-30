let SAFE = require('../../util/modelUtil').SAFE
let sortUtil = require('../../util/sortUtil');

/**
 * 顺子
 * 2019-04-24
 */
class StraightCard {
    constructor(opts = {}) {
        this.cards = SAFE(opts.cards, null);
    }

    initCards(theCards = []) {
        if (theCards.length != 3) {
            return null;
        }
        // 不能有鬼牌
        let hasGhost = theCards.some(card => {
            return card.isGhost;
        })
        if (hasGhost) {
            return null;
        }
        // 是否同花色
        let normalCard = theCards[0];
        let isSameSuit = theCards.every(card => {
            return normalCard.suit == card.suit;
        })
        if (!isSameSuit) {
            return null;
        }
        // 是否顺子
        theCards = sortUtil.sort(theCards);
        let card1 = theCards[0];
        let card2 = theCards[1];
        let card3 = theCards[2];
        if (card1.point + 1 == card2.point && card1.point + 2 == card3.point) {
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

module.exports = StraightCard