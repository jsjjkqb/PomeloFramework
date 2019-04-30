
/**
 * 数据转换
 * 2019-04-24
 */
module.exports = {

    /**
     * 
     * @param {*} cardList Card|Array<Card>
     */
    convertCardToInt(cardList, isReturnArray = false) {
        if (!cardList) {
            return [];
        }
        if (Array.isArray(cardList)) {
            return cardList.map(card => {
                return card ? card.point : null;
            })
        } else {
            return isReturnArray ? [cardList.point] : cardList.point;
        }
    }
}