let SAFE = require('../../util/modelUtil').SAFE

DisplayNameList = ['1筒', '2筒', '3筒', '4筒', '5筒', '6筒', '7筒', '8筒', '9筒', '1条', '2条', '3条', '4条', '5条', '6条', '7条', '8条', '9条', '1万', '2万', '3万', '4万', '5万', '6万', '7万', '8万', '9万', '东', '南', '西', '北', '中', '发', '白'];

/**
 * 牌
 * 2019-04-23
 */
class Card {
    constructor(opts = {}) {
        this.point      = SAFE(opts.point, -1);     // 牌点数0-33
        this.rank       = SAFE(opts.rank, -1);      // 牌数字0-9
        this.suit       = SAFE(opts.suit, -1);      // 牌花色0-3：筒、条、万、字
        this.display    = SAFE(opts.display, '');   // 显示名
        this.isGhost    = SAFE(opts.isGhost, 0);    // 是否鬼牌
        this.isGang     = SAFE(opts.isGang, 0);     // 是否单张可杠，黄石麻将中字牌红中发财出即相当于杠
        if (this.point != -1) {
            this.rank   = this.point % 9;
            this.suit   = Math.floor(this.point / 9);
            this.display= DisplayNameList[this.point];
        }
    }
    
    /**
     * 初始化牌
     * @param {Number} point 
     * @param {Array<Number>} ghostList 
     * @param {Array<Number>} gangList 
     */
    initPoint(point, ghostList = [], gangList = []) {
        this.point      = point;
        this.rank       = this.point % 9;
        this.suit       = Math.floor(this.point / 9);
        this.display    = DisplayNameList[this.point];
        this.isGhost    = ghostList.indexOf(this.point) >= 0 ? 1 : 0;
        this.isGang     = gangList.indexOf(this.point) >= 0 ? 1 : 0;
    }

    /**
     * 创建牌
     * @param {Number} point 
     * @param {Array<Number>} ghostList 
     * @param {Array<Number>} gangList 
     */
    static CreateCardWithPoint(point = 0, ghostList = [], gangList = []) {
        let card = new Card();
        card.initPoint(point, ghostList, gangList);
        return card;
    }

    /**
     * 创建牌组
     * @param {Array<Number>} pointList
     * @param {Array<Number>} ghostList 
     * @param {Array<Number>} gangList 
     */
    static CreateCardWithPointList(pointList = [], ghostList = [], gangList = []) {
        let cardList = [];
        pointList.forEach(point => {
            let card = new Card();
            card.initPoint(point, ghostList, gangList);
            cardList.push(card);
        });
        return cardList;
    }

    static CreateCardWithDisplay(display = '1筒', ghostList = [], gangList = []) {
        let point = DisplayNameList.indexOf(display);
        if (point < 0) {
            return null;
        }
        return this.CreateCardWithPoint(point, ghostList, gangList);
    }

    static CreateCardWithDisplayList(displayList = [], ghostList = [], gangList = []) {
        let cardList = [];
        displayList.forEach(display => {
            let card = this.CreateCardWithDisplay(display, ghostList, gangList);
            cardList.push(card);
        });
        return cardList;
    }
}

module.exports = Card