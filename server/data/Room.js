var Room = function () {
    // var roomId=""+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10);;
    this.roomId = "111111";
    this.seatNos = [[0, 0], [1, 0], [2, 0], [3, 0]];
    this.players = [];
    this.state="wait";//playing,over
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
    this.state="playing";
}
Room.prototype.getPlayer = function (socket) {
    var index = this.players.map(function (e) { return e.getSocket(); }).indexOf(socket);
    return this.players[index];
}
Room.prototype.isAllReady = function () {
    if(this.players.length!=this.maxPlayerNo){
        return false;
    }
    var ready=true;
    for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i];
        if(player.state!="ready"){
            ready=false;
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

module.exports = Room;