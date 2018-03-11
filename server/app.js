const socket = require('socket.io');
var socketEvent = require('./data/socketEvent');
var Room = require('./data/Room');
var Player = require('./data/Player');
var roomList = [];
const app = socket('3000', { wsEngine: 'ws' });

app.on('connection', function (socket) {
         console.log(`---start  `);
    //     socket.on("login",function(user){
    //         console.log("login success");
    //         console.log("----"+user);
    //     })

    // return;

    socket.on(socketEvent.create_room, function (user) {
        console.log(`create_room ${JSON.stringify(user)}`);
        var room = new Room();
        var player = new Player(user.nickname, socket);
        player.isCreator = true;

        room.players.push(player);
        roomList.push(room);
        socket.roomId = room.roomId;
        socket.nickname = user.nickname;
        var ret = {
            roomId: room.roomId,
            nickname: user.nickname,
            seatNo: player.seatNo,
            isCreator: player.isCreator
        };

        socket.emit(socketEvent.create_room, null, ret);
    });

    socket.on(socketEvent.join_room, function (joinRoomData) {
        var room = getPlayerRoom(joinRoomData.roomId);
        var err = null;
        var ret = {};
        if (!room) {
            err = "房间不存在：" + joinRoomData.roomId;
        }
        else {
            var player = new Player(joinRoomData.nickname, socket);

            player.seatNo = room.players.length;
            ret.nickname = player.nickname;
            ret.seatNo = player.seatNo;
            ret.player = player;
            room.players.push(player);
            socket.roomId = room.roomId;
            socket.nickname = joinRoomData.nickname;

        }
        console.log(`join_room ${JSON.stringify(joinRoomData)}`);

        socket.emit(socketEvent.join_room, err, ret);
    });


    socket.on(socketEvent.sync_room, function () {
        var room = getPlayerRoom();
        
        console.log(`sync_room:`+room.roomId + socket.nickname);
        room.players.forEach(player => {
            player.getSocket().emit(socketEvent.sync_room, null, room.players);
        });
        // socket.emit(socketEvent.sync_room, null,room.players );
    });

    var getPlayerRoom = function (roomId) {
        roomId = roomId || socket.roomId;
        if (!roomId) {
            return null;
        }
        return  roomList.find(function (r) {
            return r.roomId == roomId;
        });
    }

    socket.on('disconnect', function () {
        var room = getPlayerRoom();
        if (room) {
           
            var index = room.players.map(function (e) { return e.getSocket(); }).indexOf(socket);
            room.players.splice(index,1);

            room.players.forEach(player => {
                player.getSocket().emit(socketEvent.sync_room, null, room.players);
            });
        }
        console.log(`------end `);
    });

});
console.log('listen on 3000');