
/**
 * 从小到大
 * @param {Array} list
 * @param {bool} isReverse 是否倒序
 */
module.exports.sort = function(list = [], isReverse = false) {
    list.sort((a, b) => {
        let aValue = a.point - a.isGhost * 34 - a.isGang ? 34 : 0;
        let bValue = b.point - b.isGhost * 34 - b.isGang ? 34 : 0;
        if (isReverse) {
            return bValue - aValue;
        } else {
            return aValue - bValue;
        }
    })
}