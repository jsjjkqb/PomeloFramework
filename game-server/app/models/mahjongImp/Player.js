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
                break;
            }
        }
    }

    /**
     * 
     * @param {Array<Card>} cards 需要移除的牌组
     * @param {Array<Card>} cardList 牌组所在牌组
     */
    _removeCards(cards, cardList) {
        cards.forEach(card => {
            this._removeOneCard(card, cardList);
        });
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
            const tmpCard = this.handCards[i];
            if (tmpCard.point == card.point) {
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
     * 吃
     * @param {Array<Card>} cards 
     * @param {Card} lastCard 
     */
    chi(cards, lastCard) {
        // 是否存在该牌组并移除
        if (this._isContainCards(cards)) {
            // 是否顺子
            let groupCard = new StraightCard();
            let tmpCards = cards.slice(0);
            tmpCards.push(lastCard);
            groupCard.initCards(tmpCards);
            if (!groupCard.cards) {
                // 不能组成顺子
                return Code.makeResult(Code.PLAYER.CHI_BUILD_ERROR);
            }
            // 移除手牌
            this._removeCards(cards, this.handCards);
            // 添加到吃牌组
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
        // 普通牌
        let normalCard = cards.find(card => {
            return !card.isGhost;
        })
        if (!normalCard) {
            return Code.makeResult(Code.PLAYER.GANG_ERROR);
        }
        // 碰牌组
        let pengCard = this.pengCards.find(groupCard => {
            return groupCard.some(card => {
                return card.point == normalCard.point;
            })
        })
        if (!pengCard) {
            return Code.makeResult(Code.PLAYER.NO_CARD_ERROR);
        }
        // 手牌
        let isFindCard = this.handCards.some(card => {
            return card.point == normalCard.point;
        })
        let ghostCard = null;
        if (!isFindCard) {
            // 鬼牌
            ghostCard = this.handCards.find(card => {
                return card.isGhost;
            })
        }
        if(!isFindCard && !ghostCard) {
            return Code.makeResult(Code.PLAYER.NO_CARD_ERROR);
        }
        // 是否杠牌组
        let groupCard = new FourCard();
        let tmpCards = cards.slice(0);
        groupCard.initCards(tmpCards);
        if (!groupCard.cards) {
            return Code.makeResult(Code.PLAYER.GANG_BUILD_ERROR);
        }
        // 移除手牌
        if (ghostCard) {
            this._removeCards(ghostCard, this.handCards);
        } else {
            this._removeOneCard(normalCard, this.handCards);
        }
        // 添加到杠牌组
        groupCard.type = Define.OPERATION.OPERATION_MINGGANG;
        this.gangCards.push(groupCard);
        return Code.makeResult();
    }

    /**
     * 
     * @param {Array<Card>} cards 
     */
    anGang(cards) {
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
}

module.exports = Player