var Card = require('../data/Card');

var posArray = [cc.p(-580, -250), cc.p(580, 0), cc.p(0, 300), cc.p(-580, 0)];

cc.Class({
    extends: cc.Component,

    properties: {
        userPrefab: cc.Prefab,
        cardPrefab: cc.Prefab,
        readyBtn: cc.Button,
        optBtns: cc.Node,
        pushCardsNode:cc.Node,
        roomNoLabel: {
            default: null,
            type: cc.Label
        },
        cardsSpriteAtlas: {
            default: null,
            type: cc.SpriteAtlas
        }
    },

    getConvertSeatNo: function (seatNo) {
        var seatIndex = seatNo - global.player.seatNo;
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
        this.roomNoLabel.string = "房间号:" + global.player.roomId;
        console.log("syncRoom " + JSON.stringify(ret));

        for (let i = 0; i < ret.length; i++) {

            var user = cc.instantiate(this.userPrefab);
            user.parent = this.node;
            user.position = posArray[this.getConvertSeatNo(i)];
            user.getChildByName("nickname").getComponent(cc.Label).string = ret[i].nickname;
            if (ret[i].state == "ready") {
                user.getChildByName("ready").opacity = 255;
            }
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
    getPlayerNode: function (nickname) {
        for (let i = 0; i < this.playerNodes.length; i++) {
            const playerNode = this.playerNodes[i];
            if (playerNode.getChildByName("nickname").getComponent(cc.Label).string == nickname) {
                return playerNode;
            }
        }
    },
    start_game: function (err, ret) {
        console.log("start_game " + JSON.stringify(ret));
        var cards = ret.cards;
        for (let i = 0; i < this.playerNodes.length; i++) {
            this.playerNodes[i].getChildByName("ready").opacity = 0;
        }
        if (ret.startNo == global.player.seatNo) {
            this.optBtns.active = true;
        }

        for (let i = 0; i < cards.length; i++) {
            var cardPre = cc.instantiate(this.cardPrefab);
            cardPre.parent = this.node;
            this.cardList.push(new Card(cards[i].no, cards[i].shape, cardPre, this.cardsSpriteAtlas));
            if (i < 21) {
                cardPre.position = cc.p(-450 + i * 51, -270);
                cardPre.zIndex = 2;
            }
            else {
                cardPre.position = cc.p(-450 + (i - 21) * 51, -170);
                cardPre.zIndex = 1;
            }
        }
    },
    ready_game: function (err, readyPlayer) {
        console.log(`ready_game : ${readyPlayer.nickname}`);
        var playerNode = this.getPlayerNode(readyPlayer.nickname);
        playerNode.getChildByName("ready").opacity = 255;
    },
    push_card: function (err, turn) {
        console.log(`push_card : ${JSON.stringify(turn)}`);
        if (turn.seatNo == global.player.seatNo) {
            this.optBtns.active = true;
        }

        //自己不需要该效果
        for (let i = 0; i < turn.cards.length; i++) {

            var cardPre = cc.instantiate(this.cardPrefab);
            cardPre.parent = this.node;
            var card = new Card(turn.cards[i].no, turn.cards[i].shape, cardPre, this.cardsSpriteAtlas);
            cardPre.position = cc.p(-485 + i * 51, 100);
        }
    },
    onLoad() {
        for (let index = 0; index < 10; index++) {
            var cardPre = cc.instantiate(this.cardPrefab);
            cardPre.parent = this.pushCardsNode;
            var card = new Card(1, "红桃", cardPre, this.cardsSpriteAtlas);
            var c=this.pushCardsNode.getNodeToParentTransform();
            var n=this.pushCardsNode.convertToNodeSpace ( cc.p(c.tx, c.ty) )
            cardPre.position = cc.p(n.x, n.y);
        }


        this.optBtns.active = false;
        this.startSelect = false;
        this.cardList = [];
        this.playerNodes = [];

        global.socket.emit(global.const.sync_room);
        global.socket.on(global.const.sync_room, this.sync_room.bind(this));
        global.socket.on(global.const.leave_room, this.leave_room.bind(this));
        global.socket.on(global.const.join_room, this.join_room.bind(this));
        global.socket.on(global.const.start_game, this.start_game.bind(this));
        global.socket.on(global.const.ready_game, this.ready_game.bind(this));
        global.socket.on(global.const.push_card, this.push_card.bind(this));
    },

    onClick: function (event, eventData) {
        switch (eventData) {
            case "push":
                this.optBtns.active = false;
                var turn={};
                turn.seatNo=global.player.seatNo;
                turn.cards=[];
                var selectedCards = this.cardList.filter(function (card) {
                    if (card.getSelected()) {
                        turn.cards.push({no:card.no,shape:card.shape});
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
               
                global.socket.emit(global.const.push_card,turn);
                break;
            case global.const.ready_game:
                this.readyBtn.node.active = false;
                global.socket.emit(global.const.ready_game);
                //global.socket.emit(global.const.start_game);
                break;
            default:
                break;
        }
    },
    start() {

    },

    // update (dt) {},
});
