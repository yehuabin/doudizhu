var card = require('../data/card');
var socket = require('./controller/socketController');
var socketEvent = require('../data/socketEvent');

cc.Class({
    extends: cc.Component,

    properties: {
        userPrefab: cc.Prefab,
        cardPrefab: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:
    syncRoom: function (err, ret) {
        console.log("sync_room " + JSON.stringify(ret));
        var posArray = [cc.p(-580, -250), cc.p(580, 0), cc.p(0, 250), cc.p(-580, 0)];
        for (let i = 0; i < ret.length; i++) {
            var user = cc.instantiate(this.userPrefab);
            user.parent = this.node;
            user.position = posArray[ret[i].seatNo];
            user.getChildByName("nickname").getComponent(cc.Label).string = ret[i].nickname;

        }
    },
    onLoad() {
        this.startSelect = false;
        this.cardList = [];
     
        socket.emit(socketEvent.sync_room);
        socket.on(socketEvent.sync_room, this.syncRoom.bind(this));


        // for (let i = 0; i < 20; i++) {
        //     var cardPre = cc.instantiate(this.cardPrefab);
        //     cardPre.parent = this.node;
        //     cardPre.position = cc.p(-450 + i * 51, -170);

        // }
        // for (let i = 0; i < 21; i++) {
        //     var cardPre = cc.instantiate(this.cardPrefab);
        //     cardPre.parent = this.node;
        //     cardPre.position = cc.p(-450 + i * 51, -270);
        //     this.cardList.push(card(cardPre));
        // }

    },

    onClick: function (event, eventData) {
        switch (eventData) {
            case "push":
                var selectedCards = this.cardList.filter(function (card) {
                    if (card.getSelected()) {
                        return card;
                    }
                });
                for (let i = 0; i < selectedCards.length; i++) {
                    const card = selectedCards[i];
                    if (card.getSelected()) {
                        var moveTo = cc.moveTo(0.1, cc.p(-450 + i * 51, 0));
                        card.preFab.runAction(moveTo);
                        card.pushCard();
                    }
                }

                break;

            default:
                break;
        }
    },
    start() {

    },

    // update (dt) {},
});
