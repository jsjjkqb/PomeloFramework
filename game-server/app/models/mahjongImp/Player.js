let SAFE = require('../../util/modelUtil').SAFE;
let sortUtil = require('../../util/sortUtil');
let Code = require('../../util/code');
let Define = require('../mahjong/Define');

let PlayerBase = require('../base/PlayerBase');
let Card = require('../mahjong/Card');
let ThreeCard = require('../mahjong/ThreeCard');
let FourCard = require('../mahjong/FourCard');
let StraightCard = require('../mahjong/StraightCard');

class Player extends PlayerBase {
    constructor(opts = {}) {
        super(opts);
        this.pengCards          = SAFE(opts.pengCards, []);
        this.gangCards          = SAFE(opts.gangCards, []);
        this.chiCards           = SAFE(opts.chiCards, []);
        this.piaoCards          = SAFE(opts.piaoCards, []);
        this.cardAssigned       = SAFE(opts.cardAssigned, null);
    }

    // ------------------------ private --------------------------

    /**
     * 
     * @param {Card|Array<Card>} cards 
     */
    _addHandCards(cards) {
        if (Array.isArray(cards)) {
            this.handCards = this.handCards.concat(cards);
        } else {
            this.handCards.push(cards);
        }
        sortUtil.sort(this.handCards);
    }

    /**
     * 
     * @param {Card} theCard 
     */
    _isContainCard(theCard) {
        return this.handCards.some(card => {
            return card.point == theCard.point;
        })
    }

    /**
     * 
     * @param {Array<Card>} cards 
     */
    _isContainCards(cards = []) {
        return cards.every(card => {
            return this._isContainCard(card);
        })
    }

    /**
     * 
     * @param {Card} theCard 需要移除的牌
     * @param {Array<Card>} cardList 牌所在的牌组
     */
    _removeOneCard(theCard, cardList) {
        for (let i = 0; i < cardList.length; i++) {
            const card = cardList[i];
            if (card.point == theCard.point) {
                cardList.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * 
     * @param {Array<Card>} cards 需要移除的牌组
     * @param {Array<Card>} cardList 牌组所在牌组
     */
    _removeCards(cards, cardList) {
        let removeCards = [];
        cards.forEach(card => {
            if (this._removeOneCard(card, cardList)) {
                removeCards.push(card);
            }
        });
        return removeCards;
    }

    // ------------------------ method -----------------------

    /**
     * 
     * @param {Array<Card>} cards 
     */
    setHandCards(cards = []) {
        this._addHandCards(cards);
        this.originalCards = this.handCards.map(card => {
            return card.point;
        })
    }

    /**
     * 
     * @param {Card} card 
     */
    assignCard(card) {
        this._addHandCards(card);
        this.cardAssigned = card;
    }

    /**
     * 
     * @param {Card} card 
     */
    playCard(card) {
        for (let i = 0; i < this.handCards.length; i++) {
            const card = this.handCards[i];
            if (card.point == card.point) {
                this.handCards.splice(i, 1);
                this.pastCards.push(card);
                this.lastCards = [card];
                return Code.makeResult();
            }
        }
        return Code.makeResult(Code.PLAYER.NO_CARD_ERROR);
    }

    /**
     * 移除历史牌的最后一张，吃碰杠时调用
     */
    removeLastPastCard() {
        return this.pastCards.splice(this.pastCards.length - 1, 1);
    }

    /**
     * 吃：只能吃上家
     * @param {Array<Card>} cards 
     * @param {Card} lastCard 
     */
    chi(cards, lastCard) {
        // 参数出错
        if (!cards || cards.length != 3 || !lastCard) {
            return Code.makeResult(Code.PLAYER.CHI_ERROR);
        }
        // 去掉上家出的牌
        let cardList = cards.map(card => {
            return card.point != lastCard.point;
        })
        // 是否存在该牌组并移除
        if (this._isContainCards(cardList)) {
            // 是否顺子
            let tmpCards = cards.slice(0);
            let groupCard = new StraightCard();
            groupCard.initCards(tmpCards);
            if (!groupCard.cards) {
                // 不能组成顺子
                return Code.makeResult(Code.PLAYER.CHI_BUILD_ERROR);
            }
            // 移除手牌
            this._removeCards(cardList, this.handCards);
            // 添加到吃牌组
            groupCard.grabPlayer = {card: lastCard.point};
            this.chiCards.push(groupCard);
            return Code.makeResult();
        }
        return Code.makeResult(Code.PLAYER.NO_CARD_ERROR);
    }

    /**
     * 
     * @param {Array<Card>} cards 
     * @param {Card} lastCard 
     */
    peng(cards, lastCard) {
        // 参数错误
        if (!cards ||cards.length != 2 || !lastCard) {
            return Code.makeResult(Code.PLAYER.PENG_ERROR);
        }
        // 是否存在该牌组并移除
        if (this._isContainCards(cards)) {
            // 是否碰牌组
            let groupCard = new ThreeCard();
            let tmpCards = cards.slice(0);
            tmpCards.push(lastCard);
            groupCard.initCards(tmpCards);
            if (!groupCard.cards) {
                // 不能组成碰牌组
                return Code.makeResult(Code.PLAYER.PENG_BUILD_ERROR);
            }
            // 移除手牌
            this._removeCards(cards, this.handCards);
            // 添加到碰牌组
            groupCard.grabPlayer = {card: lastCard.point};
            this.pengCards.push(groupCard);
            return Code.makeResult();
        }
        return Code.makeResult(Code.PLAYER.NO_CARD_ERROR);
    }

    /**
     * 
     * @param {ArrayCard} cards 
     * @param {Card} lastCard 
     */
    gongGang(cards, lastCard) {
        // 参数错误
        if (!cards || cards.length != 3 || !lastCard) {
            return Code.makeResult(Code.PLAYER.GANG_ERROR);
        }
        // 是否存在该牌组并移除
        if (this._isContainCards(cards)) {
            // 是否杠牌组
            let groupCard = new FourCard();
            let tmpCards = cards.slice(0);
            tmpCards.push(lastCard);
            groupCard.initCards(tmpCards);
            if (!groupCard.cards) {
                // 不能组成杠牌组
                return Code.makeResult(Code.PLAYER.GANG_BUILD_ERROR);
            }
            // 移除手牌
            this._removeCards(cards, this.handCards);
            // 添加到杠牌组
            groupCard.grabPlayer = {card: lastCard.point};
            groupCard.type = Define.OPERATION.OPERATION_GONGGANG;
            this.gangCards.push(groupCard);
            return Code.makeResult();
        }
        return Code.makeResult(Code.PLAYER.NO_CARD_ERROR);
    }

    /**
     * 
     * @param {Array<Card>} cards 
     */
    mingGang(cards = []) {
        // 参数错误
        if (!cards || cards.length != 4) {
            return Code.makeResult(Code.PLAYER.GANG_ERROR);
        }
        // 普通牌
        let normalCard = cards.find(card => {
            return !card.isGhost;
        })
        // 没有普通牌，结束
        if (!normalCard) {
            return Code.makeResult(Code.PLAYER.GANG_ERROR);
        }
        // 参与明杠的碰牌组或杠牌组：先找碰牌组
        let groupCard = this.pengCards.find(groupCard => {
            return groupCard.some(card => {
                return card.point == normalCard.point;
            })
        })
        // 没有碰牌组就找杠牌组
        if (!groupCard && Define.isCanGhostPengGang) {
            groupCard = this.gangCards.find(groupCard => {
                return groupCard.some(card => {
                    return card.point == normalCard.point;
                })
            })
        }
        // 都没有，结束
        if (!groupCard) {
            return Code.makeResult(Code.PLAYER.NO_CARD_ERROR);
        }
        // 取出参与明杠的手牌：手牌有、cards有、groupCard可能有
        let tmpCards = sortUtil.sort(cards.slice(0), true);
        let cardsInHand = tmpCards.filter(card => {
            return this.handCards.some(card2 => {
                return card.point == card2.point;
            });
        })
        // 没牌，结束
        if (cardsInHand.length == 0) {
            return Code.makeResult(Code.PLAYER.NO_CARD_ERROR);
        }
        // 取牌
        let grabCard = cardsInHand[0];
        // 有多张牌，比对groupCard
        if (cardsInHand.length > 1) {
            let cardsInGroup = tmpCards.filter(card => {
                return groupCard.cards.every(card2 => {
                    return card.point != card2.point;
                })
            })
            // 不存在多张情况，值为0/1
            // 没有则取cardsInHand首张，有则
            if (cardsInGroup.length > 0) {
                grabCard = cardsInHand.find(card => {
                    return card.point == cardsInGroup[0].point;
                })
            }
            // 若没有还是取首张
            if (!grabCard) {
                grabCard = cardsInHand[0];
            }
        }
        // 是否杠牌组
        let groupCard = new FourCard();
        tmpCards = cards.slice(0);
        groupCard.initCards(tmpCards);
        if (!groupCard.cards) {
            return Code.makeResult(Code.PLAYER.GANG_BUILD_ERROR);
        }
        // 移除手牌
        this._removeOneCard(grabCard, this.handCards);
        // 添加到杠牌组
        groupCard.grabPlayer = {card: grabCard.point};
        groupCard.type = Define.OPERATION.OPERATION_MINGGANG;
        this.gangCards.push(groupCard);
        return Code.makeResult();
    }

    /**
     * 
     * @param {Array<Card>} cards 
     */
    anGang(cards = []) {
        // 参数错误
        if (!cards || cards.length != 4) {
            return Code.makeResult(Code.PLAYER.GANG_ERROR);
        }
        // 是否存在该牌组并移除
        if (this._isContainCards(cards)) {
            // 是否杠牌组
            let groupCard = new FourCard();
            let tmpCards = cards.slice(0);
            groupCard.initCards(tmpCards);
            if (!groupCard.cards) {
                // 不能组成杠牌组
                return Code.makeResult(Code.PLAYER.GANG_BUILD_ERROR);
            }
            // 移除手牌
            this._removeCards(cards, this.handCards);
            // 添加到杠牌组
            groupCard.type = Define.OPERATION.OPERATION_ANGANG;
            this.gangCards.push(groupCard);
            return Code.makeResult();
        }
        return Code.makeResult(Code.PLAYER.NO_CARD_ERROR);
    }

    isCanChi(lastCard) {

    }

    isCanPeng(lastCard) {
        
    }

    isCanGongGang(lastCard) {

    }

    isCanMingGang() {

    }

    isAnGang() {

    }
}

module.exports = Player