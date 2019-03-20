var rules = require('../utility/rules');
var global_const = require('../data/global_const');
var Room = function () {
    // var roomId=""+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10);;
    this.roomId = "111111";
    this.seatNos = [[0, 0], [1, 0], [2, 0], [3, 0]];
    this.players = [];
    this.overNo = 0;
    this.gameOver = false;
    this.deskTurn = null;
    this.turn = {};
    this.state = "wait";//playing,over
    this.maxPlayerNo = 4;
    this.isFull = function () {
        return this.players.length == this.maxPlayerNo;
    }
}
Room.prototype.leaveRoom = function (socket) {
    var index = this.players.map(function (e) { return e.getSocket(); }).indexOf(socket);
    var player = this.players[index];
    this.seatNos[player.seatNo][1] = 0;
    this.players.splice(index, 1);
}
Room.prototype.playing = function () {
    this.state = "playing";
}
Room.prototype.setTurn = function (seatNo, isWin, preCards) {
    this.turn = {
        seatNo: seatNo,//出牌座位号
        isWin: isWin,//是否是大出牌
        preCards: preCards//上家出的牌
    };
}
Room.prototype.init = function () {
    this.overNo = 0;
    this.deskTurn = null;
    this.turn = {};
    for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i];
        player.init();
    }
}
Room.prototype.getPlayer = function (socket) {
    var index = this.players.map(function (e) { return e.getSocket(); }).indexOf(socket);
    return this.players[index];
}
Room.prototype.getPlayerGameInfo = function () {
    var result = [];
    for (let i = 0; i < this.players.length; i++) {
        const p = this.players[i];
        result.push({
            seatNo: p.seatNo,
            score: p.score,
            overNo: p.overNo,
            uuid: p.uuid,
            nickname: p.nickname
        });

    }
    return result;
}
Room.prototype.isAllReady = function () {
    if (this.players.length != this.maxPlayerNo) {
        return false;
    }
    var ready = true;
    for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i];
        if (player.state != "ready") {
            ready = false;
            break;
        }
    }
    return ready;
}
Room.prototype.addPlayer = function (player) {
    if (this.players.length == 0) {
        this.players.push(player);
    }
    else {
        var index = 0;
        for (let i = this.players.length; i > 0; i--) {
            if (player.seatNo > this.players[i - 1].seatNo) {
                index = i;
                break;
            }
        }
        this.players.splice(index, 0, player);
       // console.log(JSON.stringify(this.players));
    }
}

Room.prototype.getNextPushNo = function (no) {
    var nextNo = -1;
    for (var i = 1; i <= 3; i++) {
        nextNo = (no + i) % this.maxPlayerNo;
        if (this.players[nextNo].overNo == 0) {
            return nextNo;
        }
    }
    console.log("err:没有找到下家出牌的玩家");
    return nextNo;
}
Room.prototype.getFriendNo = function (no) {
    return (no + 2) % this.maxPlayerNo;
}
Room.prototype.getFriend = function (no) {
    let friNo=this.getFriendNo(no);
    let friend=null;
    this.players.forEach(p => {
       if(p.seatNo==friNo){
           friend=p;
       }
    });
    return friend;
}
Room.prototype.getPlayerBySeatNo = function (no) {
     let player=null;
    this.players.forEach(p => {
       if(p.seatNo==no){
        player=p;
       }
    });
    return player;
}
Room.prototype.isGameOver = function () {
    var isOver = false;

    if (this.overNo < 2) {
        //只逃走一个玩家继续玩
        return isOver;
    }
    var p1 = [];
    var p2 = [];

    for (let i = 0; i < this.maxPlayerNo; i++) {
        const p = this.players[i];
        if (p.overNo >= 0) {
            if (i % 2 == 0) {
                p1.push(p);
            }
            else {
                p2.push(p);
            }
        }
    }

    if (p1.length == this.maxPlayerNo / 2 || p2.length == this.maxPlayerNo / 2) {
        isOver = true;//扣了就结束
    }
    else {
        var s1 = 0;
        var s2 = 0;
        for (let i = 0; i < p1.length; i++) {
            s1 += p1[i].score;
        }
        for (let i = 0; i < p2.length; i++) {
            s2 += p2[i].score;
        }
        if (p1.length > 0 && p2.length > 0 &&
            (s1 > 150 || s2 > 150)) {
            isOver = true;//两边都有人逃出，赢分了就结束
        }
    }
    return isOver;
}
Room.prototype.pushCard = function (turn, socket) {
    var room = this;

    //console.log(`push_card:${JSON.stringify(turn)} ` + socket.nickname);
    var player = room.getPlayer(socket);
    var nextNo = -1;

    if (turn.pass) {

        var isLastNo = false;
        var bigSeatNo = room.deskTurn.seatNo;

        for (var i = 1; i < this.maxPlayerNo; i++) {
            nextNo = (turn.seatNo + i) % this.maxPlayerNo;
            if (nextNo == bigSeatNo) {
                //最后一位不出
                isLastNo = true;
                break;
            }
            if (this.players[nextNo].overNo == 0) {
                //不是最后一位
                break;
            }
        }

        //如果是最后一位不出，把分数给大的玩家
        if (isLastNo) {
            room.players[bigSeatNo].score += room.deskTurn.score;
            room.deskTurn.score = 0;

            if (room.players[bigSeatNo].isPushOver()) {
                // room.overNo++;
                // room.players[bigSeatNo].overNo = room.overNo;
                //判断游戏是否结束


                //接风给对家
                nextNo = room.getFriendNo(bigSeatNo);
                turn.isJiefeng = true;
                room.deskTurn.isJiefeng = true;
                //逃出去就可以看到对家的牌
                let go_player= this.getPlayerBySeatNo(bigSeatNo);
                go_player.getSocket().emit(global_const.watch_fri,null,this.getPlayerBySeatNo(nextNo).cards)
            }

            // if(room.players[nextNo].cards.length==0){
            //     //当前玩家出完，下家接风
            // }
        }

        //todo:不出 直接跳到下家

    }
    else {
        nextNo = room.getNextPushNo(turn.seatNo);
        // if (player.seatNo != turn.seatNo) {
        //     console.log(`push_card:还没轮到你出牌`);
        //     socket.emit(global_const.push_card, "还没轮到你出牌");
        //     return;
        // }
        if (!turn.cards || turn.cards.length == 0) {
            socket.emit(global_const.push_card, global_const.not_select_card);
            return;
        }

        let score = rules.getSumScore(turn.cards);//当前用户手中打出的牌
        if (!room.deskTurn) {
            room.deskTurn = { score: 0 };
        }

        room.deskTurn.score += score;
        room.deskTurn.nickname = turn.nickname;
        room.deskTurn.uuid = turn.uuid;
        room.deskTurn.seatNo = turn.seatNo;
        room.deskTurn.cards = turn.cards;
        //把牌从用户手里去掉
        player.pushCard(turn.cards);
        if (player.isPushOver()) {
            room.overNo++;
            player.overNo = room.overNo;
        }

        //倒数第二家逃出就直接给分

        //判断游戏是否结束
    }
    //todo:turn.score 计算打出的牌带了多少分数
    //出牌顺序交给下家
    turn.seatNo = nextNo;
    turn.deskTurn = room.deskTurn;
    turn.gameInfo = room.getPlayerGameInfo();
    // console.log(`push_card_over ${JSON.stringify(turn)}`);

    if (room.isGameOver()) {
        room.init();
        room.players.forEach(p => {
            p.getSocket().emit(global_const.game_over, null, turn);
        });
    }
    else {
        room.players.forEach(p => {
            p.getSocket().emit(global_const.push_card, null, turn);
        });
    }



}

module.exports = Room;