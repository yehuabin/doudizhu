var Room = function () {
    // var roomId=""+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10);;
    this.roomId = "111111";
    this.seatNos = [[0, 0], [1, 0], [2, 0], [3, 0]];
    this.players = [];
    this.overNo = 0;
    this.gameOver=false;
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
            overNo:p.overNo,
            uuid:p.uuid,
            nickname:p.nickname
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
        console.log(JSON.stringify(this.players));
    }
}

Room.prototype.getNextPushNo = function (no) {
    var nextNo=-1;
    for (var i = 1; i <= 3; i++) {
         nextNo = (no + i) % 4;
         if(this.players[nextNo].overNo==0){
             return nextNo;
         }
    }
    console.log("err:没有找到下家出牌的玩家");
    return nextNo;
}

module.exports = Room;