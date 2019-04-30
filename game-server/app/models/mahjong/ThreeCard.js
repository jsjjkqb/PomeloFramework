let PairCard = require('./PairCard');

/**
 * 刻子
 * 2019-04-24
 */
class ThreeCard extends PairCard {

    initCards(theCards = []) {
        if (theCards.length != 3) {
            return null;
        }
        return super.checkCards(theCards);
    }
}

module.exports = ThreeCard