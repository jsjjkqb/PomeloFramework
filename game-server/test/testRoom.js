let Room = require('../app/models/base/RoomBase')

describe('Room', function() {
    it('notify', function() {
        let room = new Room();
        room._notify(RoomNotify.UserExit)
        let cardArray = [];
        let cardList = cardArray.slice(0, 2);
        console.log(cardList)
    })
})