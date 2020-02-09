var rules = require('../utility/rules');
var global_const = require('../data/global_const');
let ROOM_NO=100000;
var Room = function () {
    ROOM_NO++;
    // var roomId=""+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10);;
    
    this.roomId =ROOM_NO;
    //this.roomId = "111111";
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
Room.prototype.isPlaying = function () {
    return this.state == "playing";
}
Room.prototype.offLine = function (socket) {
    var index = this.players.map(function (e) { return e.getSocket(); }).indexOf(socket);
    var player = this.players[index];
    player.offLine();
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
    this.state = "wait";
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
// Room.prototype.getPlayerByUUID = function (uuid) {
//     var index = this.players.map(function (e) { return e.uuid; }).indexOf(uuid);
//     return this.players[index];
// }
// Room.prototype.reConnection = function (socket) {
//     var index = this.players.map(function (e) { return e.uuid; }).indexOf(socket.uuid);
//     return this.players[index].onLine(socket);
// }
Room.prototype.getPlayerGameInfo = function () {
    var result = [];
    for (let i = 0; i < this.players.length; i++) {
        const p = this.players[i];
        result.push({
            seatNo: p.seatNo,
            score: p.score,
            overNo: p.overNo,
            winScore: p.winScore,
            winDB: p.winDB,
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
        if (this.players[nextNo].cards.length> 0) {
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
    let friNo = this.getFriendNo(no);
    let friend = null;
    this.players.forEach(p => {
        if (p.seatNo == friNo) {
            friend = p;
        }
    });
    return friend;
}
Room.prototype.getPlayerBySeatNo = function (no) {
    let player = null;
    this.players.forEach(p => {
        if (p.seatNo == no) {
            player = p;
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
   
    if ((this.players[0].overNo>0&&this.players[2].overNo>0) || 
    (this.players[1].overNo>0&&this.players[3].overNo>0) ) {
        isOver = true;//两家都逃出了就结束
    }
    else {

        let s1 = 0;
        let s2 = 0;
        let no1Seat = 0;
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            if (player.overNo == 1) {
                //找到第一名的人
                no1Seat = i;
                break;
            }
        }
        //第一名玩家分数加上对家分数
        s1 = this.players[no1Seat].score + this.players[(no1Seat + 2) % 4].score;

        for (let i = 1; i < 4;) {
            let index = (no1Seat + i) % 4;
            if (this.players[index].overNo > 0) {
                s2 += this.players[index].score;
            }
            i = i + 2;
        }

        if (s1 > 150 || s2 > 150) {
            isOver = true;
        }
    }
    return isOver;
}
Room.prototype.pushCard = function (turn, socket) {
    var room = this;
    let curOverNo=0;

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
            curOverNo=room.overNo;//提示逃走是第几家

             //逃出去就可以看到对家的牌
             let go_player = this.getPlayerBySeatNo(turn.seatNo);
             go_player.getSocket().emit(global_const.watch_fri, null, this.getFriend(turn.seatNo).cards)
        }

        //倒数第二家逃出就直接给分

        //判断游戏是否结束
    }
    //todo:turn.score 计算打出的牌带了多少分数
    //出牌顺序交给下家
    turn.preSeatNo = turn.seatNo;
    turn.seatNo = nextNo;
    turn.deskTurn = room.deskTurn;
    turn.deskTurn.overNo =curOverNo;
    turn.gameInfo = room.getPlayerGameInfo();
    // console.log(`push_card_over ${JSON.stringify(turn)}`);


    if (room.isGameOver()) {
        turn.isGameOver = true;
        room.init();
    }

    room.players.forEach(p => {
        p.getSocket().emit(global_const.push_card, null, turn);
    });
}

module.exports = Room;