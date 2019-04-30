let PairCard = require('./PairCard');

/**
 * 四张：杠
 * 2019-04-24
 */
class FourCard extends PairCard {

    initCards(theCards = []) {
        if (theCards.length != 4) {
            return null;
        }
        return this.checkCards(theCards);
    }
}

module.exports = FourCard