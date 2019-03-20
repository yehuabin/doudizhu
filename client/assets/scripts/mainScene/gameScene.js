var Card = require('../data/Card');
var Player = require('../data/Player');
var tools = require('../utility/tools');
var rules = require('../utility/rules');



cc.Class({
    extends: cc.Component,

    properties: {
        userPrefab: cc.Prefab,
        cardPrefab: cc.Prefab,
        readyBtn: cc.Button,
        pushBtn: cc.Node,
        passBtn: cc.Node,
        cardMask: cc.Node,
        messageLabel: cc.Label,
        scrollMsgLabel: cc.Label,
        deskLabel: cc.Label,
        pushTipLabel: cc.Label,
        timerNode: cc.Node,
        pushCardsContainer: cc.Node,
        dialogPrefab: cc.Prefab,
        roomNoLabel: {
            default: null,
            type: cc.Label
        },
        cardsSpriteAtlas: {
            default: null,
            type: cc.SpriteAtlas
        }
    },
    selectCard(touch) {
        var lastIndex = this.cardList.length - 1;

        for (var i = lastIndex; i >= 0; i--) {
            if (touch.y > 180 && i < 21) {
                continue;
            }
            if (touch.y < 180 && i > 21) {
                continue;
            }
            var card = this.cardList[i];
            var box = card.prefab.getBoundingBox();
            if (box.contains(touch)) {
                card.select();
                return card;
            }
        }
    },
    moveCard() {
        for (var i in this.cardList) {
            var card = this.cardList[i];
            if (card.getSelect()) {
                card.unSelect();
                if (card.isPush) {
                    card.isPush = false;
                    card.prefab.y -= 20;
                }
                else {
                    card.isPush = true;
                    card.prefab.y += 20;
                }

            }
        }

    },
    showMessage: function (msg) {
        this.messageLabel.node.opacity = 255;
        this.messageLabel.string = msg;
        this.messageLabel.node.runAction(cc.fadeOut(2));
    },
    getConvertSeatNo: function (seatNo) {
        var seatIndex = seatNo - global.player.seatNo;
        if (seatIndex < 0) {
            seatIndex += 4;
        }
        return seatIndex;
    },
    getPlayerNode: function (uuid) {
        for (let i = 0; i < this.playerNodes.length; i++) {
            const playerNode = this.playerNodes[i];
            if (playerNode.uuid == uuid) {
                return playerNode;
            }
        }
    },
    init: function () {

        for (let i = 0; i < this.playerNodes.length; i++) {
            const playerNode = this.playerNodes[i];
            playerNode.setGameInfo({ score: 0, overNo: 0 });
        }
        //桌上牌清空
        this.pushCardsContainer.removeAllChildren();
        this.pushTipLabel.string = "";
        this.scrollMsgLabel.string = "";
        this.deskLabel.string = "";
        this.cardMask.removeAllChildren();
    },
    showGameInfo: function (turn) {
        for (let i = 0; i < this.playerNodes.length; i++) {
            const player = this.playerNodes[i];
            for (let j = 0; j < turn.gameInfo.length; j++) {
                const gameInfo = turn.gameInfo[j];
                if (this.getConvertSeatNo(gameInfo.seatNo) == player.seatNo) {
                    if(player.score!=gameInfo.score){
                        this.scrollMsgLabel.string+=`${gameInfo.nickname} 吃${gameInfo.score-player.score}分\n`;
                    }
                    player.setGameInfo(turn.gameInfo[j]);
                    
                }
            }

        }
    },
    displayTimer: function (seatNo) {
        if (seatNo == global.player.seatNo) {
            this.timerNode.active = false;
        }
        else {
            this.timerNode.active = true;
            var convertSeatNo = this.getConvertSeatNo(seatNo);
            var pos = [90, 0, -90];
            this.timerNode.rotation = pos[convertSeatNo - 1];
        }
    },
    // LIFE-CYCLE CALLBACKS:
    join_room: function (err, data) {
        if (err) {
            console.log(err);
            this.showMessage(err);
            return;
        }
        console.log("joinRoom " + JSON.stringify(data));
        // var user = cc.instantiate(this.userPrefab);
        // user.parent = this.node;
        // user.position = posArray[this.getConvertSeatNo(data.seatNo)];
        // user.getChildByName("nickname").getComponent(cc.Label).string = data.nickname;

        this.playerNodes.push(new Player({
            nickname: data.nickname,
            uuid: data.uuid,
            score: 0,
            seatNo: this.getConvertSeatNo(data.seatNo),
            prefab: this.userPrefab,
            parent: this.node
        }));
    },
    sync_room: function (err, data) {
        if (err) {
            console.log(err);
            this.showMessage(err);
            return;
        }
        this.roomNoLabel.string = "房间号:" + global.player.roomId;
        console.log("syncRoom " + JSON.stringify(data));

        for (let i = 0; i < data.length; i++) {

            // var user = cc.instantiate(this.userPrefab);
            // user.parent = this.node;
            // user.position = posArray[this.getConvertSeatNo(i)];
            // user.getChildByName("nickname").getComponent(cc.Label).string = data[i].nickname;
            // if (data[i].state == "ready") {
            //     user.getChildByName("ready").opacity = 255;
            // }
            var p = new Player({
                nickname: data[i].nickname,
                uuid: data[i].uuid,
                score: 0,
                seatNo: this.getConvertSeatNo(i),
                prefab: this.userPrefab,
                parent: this.node
            });
            p.showReady();
            this.playerNodes.push(p);
        }
    },
    leave_room: function (err, data) {
        console.log("leaveRoom ");
        let playerNode = this.getPlayerNode(data.uuid);
        playerNode.prefab.removeFromParent(true);
        playerNode.prefab.destroy();
        this.playerNodes.splice(this.playerNodes.indexOf(playerNode), 1);
    },

    start_game: function (err, data) {
        if (err) {
            console.log(err);
            this.showMessage(err);
            return;
        }
        this.init();
        console.log("start_game " );
        var cards = data.cards;
        let gameInfo=data.gameInfo;
        for (let i = 0; i < this.playerNodes.length; i++) {
            this.playerNodes[i].hideReady();
        }
        if (data.startNo == global.player.seatNo) {
            this.pushBtn.active = true;
            this.passBtn.active = false;
        }
        else {
            this.pushTipLabel.string = gameInfo[data.startNo].nickname + " 先出牌";
        }
        this.scrollMsgLabel.string+=`${gameInfo[0].nickname} 、 ${gameInfo[2].nickname} 一家\n`;
        this.scrollMsgLabel.string+=`${gameInfo[1].nickname} 、 ${gameInfo[3].nickname} 一家\n`;
        //this.displayTimer(data.startNo);
        for (let i = 0; i < cards.length; i++) {
            var cardPre = cc.instantiate(this.cardPrefab);
            cardPre.parent = this.cardMask;
            this.cardList.push(new Card(cards[i].no, cards[i].shape, cardPre, this.cardsSpriteAtlas));
            if (i < 21) {
                cardPre.position = cc.v2(180 + i * 51, 80);
                cardPre.zIndex = 2;
            }
            else {
                cardPre.position = cc.v2(180 + (i - 21) * 51, 180);
                cardPre.zIndex = 1;
            }
        }
    },

    ready_game: function (err, readyPlayer) {
        if (err) {
            console.log(err);
            this.showMessage(err);
            return;
        }
        console.log(`ready_game : ${readyPlayer.nickname}`);
        var playerNode = this.getPlayerNode(readyPlayer.uuid);
        playerNode.showReady();
    },
    watch_fri: function (err, cards) {
        if (err) {
            console.log(err);
            this.showMessage(err);
            return;
        }
        console.log('watch_fri');
        for (let i = 0; i < cards.length; i++) {
            var cardPre = cc.instantiate(this.cardPrefab);
            cardPre.parent = this.cardMask;
            this.cardList.push(new Card(cards[i].no, cards[i].shape, cardPre, this.cardsSpriteAtlas));
            if (i < 21) {
                cardPre.position = cc.v2(180 + i * 51, 80);
                cardPre.zIndex = 2;
            }
            else {
                cardPre.position = cc.v2(180 + (i - 21) * 51, 180);
                cardPre.zIndex = 1;
            }
        }
    },
    game_over: function (err, data) {
        if (err) {
            console.log(err);
            this.showMessage(err);
            return;
        }
        let msg = "";
        for (let i = 0; i < data.gameInfo.length; i++) {
            let player = data.gameInfo[i];
            let overTxt=player.overNo>0?`第${player.overNo}家`:"未打完";
            msg += `${player.nickname} ${overTxt} 得分：${player.score}\n`
        }
        this.scrollMsgLabel.string=msg;
        this.readyBtn.node.active = true;
        console.log(`game_over `);
    },
    push_card: function (err, turn) {
        if (err) {
            console.log(err);
            this.showMessage(err);
            return;
        }
        
        this.deskTurn = turn.deskTurn;
        let curPlayer=turn.gameInfo[global.player.seatNo];//当前界面用户
        let turnPlayer=turn.gameInfo[turn.seatNo];//出牌用户
        // console.log(`push_card : ${JSON.stringify(turn)}`);


        if (turn.deskTurn) {
            //滚动提示
            if (turn.pass) {
                this.scrollMsgLabel.string += `${turn.nickname}：不出\n`;
            }
            else{
                this.scrollMsgLabel.string += `${turn.deskTurn.nickname}：${tools.getCardsText(turn.deskTurn.cards)}\n`;
            }

            if (turn.isJiefeng) {
                this.pushTipLabel.string = `${turnPlayer.nickname} 接风`;
                
                let goPlayer=turn.gameInfo[(turn.seatNo+2)%4];
                this.scrollMsgLabel.string += `${goPlayer.nickname} 第${goPlayer.overNo}家，${turnPlayer.nickname} 接风\n`;
            }
            else {
                if (turn.seatNo == global.player.seatNo) {
                    let nickname = (turn.deskTurn.seatNo + 2) % 4 == global.player.seatNo ? "对家" : turn.deskTurn.nickname;
                    let msg = turn.deskTurn.seatNo == global.player.seatNo ? "" : `${nickname} 出的牌`;
                    this.pushTipLabel.string = msg;
                }
                else {
                    this.pushTipLabel.string = `等待 ${turnPlayer.nickname} 出牌`;
                }
            }

            if(turn.deskTurn.score>0){
                if (this.deskLabel.string != turn.deskTurn.score) {
                    this.deskLabel.string = `${turn.deskTurn.score}`;
                    this.deskLabel.node.opacity = 0;
                    this.deskLabel.node.runAction(cc.fadeIn(1));
                }
            }
            else{
                this.deskLabel.string="";
            }
        }
        if (turn.seatNo == global.player.seatNo) {
            this.pushBtn.active = true;
            if (!turn.isJiefeng && (!turn.deskTurn || turn.deskTurn.seatNo != global.player.seatNo)) {
                //不是接风且(桌上没有牌或者桌上的牌不是自己出的)，就显示不出按钮
                this.passBtn.active = true;
            }
        }
        this.showGameInfo(turn);
        // this.displayTimer(turn.seatNo);
        if (turn.pass) {
            return;
        }
        var preNo = (turn.seatNo - 1 + 4) % 4;
        if (preNo == global.player.seatNo) {
            return;
        }

        this.pushCardsContainer.removeAllChildren();
        //自己不需要该效果
        for (let i = 0; i < turn.cards.length; i++) {
            var cardPre = cc.instantiate(this.cardPrefab);
            cardPre.position = cc.v2(50 * i, 0);
            cardPre.parent = this.pushCardsContainer;
            new Card(turn.cards[i].no, turn.cards[i].shape, cardPre, this.cardsSpriteAtlas);

        }

        
        if(curPlayer.overNo>0){
            //已经逃走处于观看模式
            let friNo=(curPlayer.seatNo + 2) % 4 ;
            //判断是否是对家出的牌
            if(friNo==turn.deskTurn.seatNo){
                for (let i = 0; i < turn.deskTurn.cards.length; i++) {
                    const deskCard = turn.deskTurn.cards[i];
                    for (let j = 0; j < this.cardList.length; j++) {
                        const handCard = this.cardList[j];
                        if(handCard.no==deskCard.no&&handCard.shape==deskCard.shape){
                            handCard.prefab.destroy();
                            this.cardList.splice(j,1);
                            break;
                        }
                    }
                }
            }

        }

    },
    onLoad() {
        global.player.uuid= global.player.nickname;
        this.timerNode.active = false;
        this.passBtn.active = false;
        this.pushBtn.active = false;
        this.startSelect = false;
        this.cardList = [];
        this.playerNodes = [];
        this.pushTipLabel.string = "";
        this.dialog = cc.instantiate(this.dialogPrefab);
        this.dialog.parent = this.node;

        global.socket.emit(global.const.sync_room);
        //todo:
        this.readyBtn.node.active = false;
        global.socket.emit(global.const.ready_game);

        global.socket.on(global.const.sync_room, this.sync_room.bind(this));
        global.socket.on(global.const.leave_room, this.leave_room.bind(this));
        global.socket.on(global.const.join_room, this.join_room.bind(this));
        global.socket.on(global.const.start_game, this.start_game.bind(this));
        global.socket.on(global.const.ready_game, this.ready_game.bind(this));
        global.socket.on(global.const.game_over, this.game_over.bind(this));
        global.socket.on(global.const.push_card, this.push_card.bind(this));
        global.socket.on(global.const.game_over, this.game_over.bind(this));
        global.socket.on(global.const.watch_fri, this.watch_fri.bind(this));




        this.cardMask.on('touchstart', function (event) {
            this.selectCard(event.getLocation());
        }.bind(this));
        this.cardMask.on('touchmove', function (event) {
            this.selectCard(event.getLocation());
        }.bind(this));
        this.cardMask.on('touchend', function (event) {
            this.moveCard();
        }.bind(this));
    },

    onClick: function (event, eventData) {

        switch (eventData) {
            case "push":
            case "pass":
                var turn = {};
                turn.seatNo = global.player.seatNo;
                turn.nickname = global.player.nickname;
                turn.uuid = global.player.uuid;
                turn.cards = [];
                if (eventData != "pass") {
                    var selectedCards = this.cardList.filter(function (card) {
                        if (card.isPush) {
                            turn.cards.push({ no: card.no, shape: card.shape });
                            return card;
                        }
                    });
                    if (selectedCards.length == 0) {
                        //没有选择任何一张牌
                        this.showMessage(global.const.not_select_card);
                        return;
                    }

                    if (!rules.isValid(selectedCards)) {
                        //出牌不符合规则
                        this.showMessage(global.const.not_match_rule);
                        return;
                    }

                    //出牌前先跟桌上的牌比较大小
                    if (this.deskTurn && this.passBtn.active) {
                        if (!rules.isBig(selectedCards, this.deskTurn.cards)) {
                            this.showMessage(global.const.not_big_rule);
                            return;
                        }
                    }

                    this.pushCardsContainer.removeAllChildren();
                    for (let i = 0; i < selectedCards.length; i++) {
                        const card = selectedCards[i];
                        tools.splice(this.cardList, card);
                        card.prefab.position = cc.v2(50 * i, 0);
                        card.prefab.zIndex = 1;
                        card.prefab.parent = this.pushCardsContainer;

                        // if (card.getSelect()) {
                        //     var moveTo = cc.moveTo(0.1, cc.v2(-450 + i * 51, 0));
                        //     card.prefab.runAction(moveTo);
                        //     card.pushCard();
                        // }
                    }
                    //整理手中的牌
                    // console.log(`剩余牌数量： ${this.cardList.length}`);
                    for (let i = 0; i < this.cardList.length; i++) {
                        var cardPre = this.cardList[i].prefab;
                        // console.log(i + " : " + this.cardList[i].shape + " " + this.cardList[i].no);
                        let moveTo;
                        if (i < 21) {
                            cardPre.zIndex = i + 1;
                            moveTo = cc.moveTo(0.1, cc.v2(180 + i * 51, 80));
                        }
                        else {
                            moveTo = cc.moveTo(0.1, cc.v2(180 + (i - 21) * 51, 180));
                            cardPre.zIndex = 0
                        }
                        cardPre.runAction(moveTo);
                    }

                }
                else {
                    turn.pass = true;
                }
                this.pushBtn.active = false;
                this.passBtn.active = false;
                global.socket.emit(global.const.push_card, turn);
                break;
            case global.const.ready_game:
                this.readyBtn.node.active = false;
                global.socket.emit(global.const.ready_game);
                break;
            case "back":

                // cc.director.loadScene("mainScene");
                break;
            default:
                break;
        }
    }


});
