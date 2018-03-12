var Room = function () {
    // var roomId=""+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10);;
    this.roomId = "1314";
    this.seatNos = [[0, 0], [1, 0], [2, 0], [3, 0]];
    this.players = [];
    var maxPlayerNo = 4;
    this.isFull = function () {
        return this.players.length==maxPlayerNo;
    }
}
Room.prototype.leaveRoom = function (socket) {
    var index = this.players.map(function (e) { return e.getSocket(); }).indexOf(socket);
    var player = this.players[index];
    this.seatNos[player.seatNo][1] = 0;
    this.players.splice(index, 1);
}
Room.prototype.getPlayer = function (socket) {
    var index = this.players.map(function (e) { return e.getSocket(); }).indexOf(socket);
    return this.players[index];
}

module.exports = Room;