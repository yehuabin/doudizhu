var Card = require('../data/Card');
var socket = require('../controller/socketController');
var global_const = require('../data/global_const');
var posArray = [cc.p(-580, -250), cc.p(580, 0), cc.p(0, 250), cc.p(-580, 0)];

cc.Class({
    extends: cc.Component,

    properties: {
        userPrefab: cc.Prefab,
        cardPrefab: cc.Prefab,
        roomNoLable: {
            default:null,
            type:cc.Label
        },
        cardsSpriteAtlas: {
            default: null,
            type: cc.SpriteAtlas
        }
    },

    getConvertSeatNo:function(seatNo){
        var seatIndex =  seatNo - global_player.seatNo;
        if (seatIndex < 0) {
            seatIndex += 4;
        }
        return seatIndex;
    },
    // LIFE-CYCLE CALLBACKS:
    join_room: function (err, ret) {
        console.log("joinRoom " + JSON.stringify(ret));
        var user = cc.instantiate(this.userPrefab);
        user.parent = this.node;
        user.position = posArray[this.getConvertSeatNo(ret.seatNo)];
        user.getChildByName("nickname").getComponent(cc.Label).string = ret.nickname;
       
        this.playerNodes.push(user);
    },
    sync_room: function (err, ret) {
        this.roomNoLable.string="房间号:1213";
        console.log("syncRoom " + JSON.stringify(ret));

        for (let i = 0; i < ret.length; i++) {
           
            var user = cc.instantiate(this.userPrefab);
            user.parent = this.node;
            user.position = posArray[this.getConvertSeatNo(i)];
            user.getChildByName("nickname").getComponent(cc.Label).string = ret[i].nickname;
            this.playerNodes.push(user);
        }
    },
    leave_room: function (err, ret) {
        console.log("leaveRoom " + JSON.stringify(ret));
        for (let i = 0; i < this.playerNodes.length; i++) {
            const playerNode = this.playerNodes[i];
            if (playerNode.getChildByName("nickname").getComponent(cc.Label).string == ret) {
                playerNode.removeFromParent(true);
                playerNode.destroy();
                this.playerNodes.splice(i, 1);
                break;
            }
        }
    },
    start_game: function (err, cards) {
        console.log("start_game " + JSON.stringify(cards));
        for (let i = 0; i < cards.length; i++) {
            var cardPre = cc.instantiate(this.cardPrefab);
            cardPre.parent = this.node;
            this.cardList.push(new Card(cards[i].no,cards[i].shape,cardPre,this.cardsSpriteAtlas));

          
            if (i < 21) {
                cardPre.position = cc.p(-450 + i * 51, -270);
                cardPre.zIndex =2;
            }
            else {
                cardPre.position = cc.p(-450 + (i- 21) * 51 , -170);
                cardPre.zIndex =1;
            }
        }
    },
    onLoad() {
        this.startSelect = false;
        this.cardList = [];
        this.playerNodes = [];

        socket.emit(global_const.sync_room);
        socket.on(global_const.sync_room, this.sync_room.bind(this));
        socket.on(global_const.leave_room, this.leave_room.bind(this));
        socket.on(global_const.join_room, this.join_room.bind(this));
        socket.on(global_const.start_game, this.start_game.bind(this));


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
            case global_const.start_game:
                socket.emit(global_const.start_game);
                break;
            default:
                break;
        }
    },
    start() {

    },

    // update (dt) {},
});
