const socket = require('socket.io');
var global_const = require('./data/global_const');
var Room = require('./data/Room');
var Player = require('./data/Player');
var Card = require('./data/Card');
var tools = require('./utility/tools');
var rules = require('./utility/rules');
var roomList = [];
var playerList = [];
const app = socket('3000', { wsEngine: 'ws' });

app.on('connection', function (socket) {
    playerList.push(socket);
    
    console.log(` connection players : ${playerList.length} , rooms : ${roomList.length}`);
    //     socket.on("login",function(user){
    //         console.log("login success");
    //         console.log("----"+user);
    //     })

    // return;

    socket.on(global_const.create_room, function (user) {
        console.log(`create_room ${JSON.stringify(user)}`);
        var room = new Room();
        room.seatNos[0][1] = 1;
        var player = new Player({
            nickname: user.nickname,
            socket: socket,
            uuid: user.uuid
        });
        player.isCreator = true;

        room.addPlayer(player);
        for (let i = 0; i < roomList.length; i++) {
            const r = roomList[i];
            if(r.roomId==room.roomId){
                return;
            }
        }
        roomList.push(room);
        socket.roomId = room.roomId;
        socket.uuid = user.uuid;
        socket.nickname = user.nickname;
        var ret = {
            roomId: room.roomId,
            nickname: user.nickname,
            uuid: user.uuid,
            seatNo: player.seatNo,
            isCreator: player.isCreator
        };

        socket.emit(global_const.create_room, null, ret);
    });

    socket.on(global_const.apply_join_room, function (joinRoomData) {
        var room = getPlayerRoom(joinRoomData.roomId);
        var err = null;
        let reConnectionPlayerIndex=room.players.map(function (e) { return e.uuid; }).indexOf(joinRoomData.uuid);
        var ret = {};
        if (!room) {
            err = "房间不存在：" + joinRoomData.roomId;
        }
        // else if(reConnectionPlayerIndex>-1){

        //     let reConnectionPlayer=room.players[reConnectionPlayerIndex];
        //     //断线重连
        //     socket.roomId = room.roomId;
        //     socket.nickname = joinRoomData.nickname;
        //     socket.uuid = joinRoomData.uuid;
        //     reConnectionPlayer.onLine(socket);
        //     socket.emit(global_const.apply_join_room, err, {roomId:room.roomId,seatNo:reConnectionPlayer.seatNo});
        //     return;

        // }
        else if (room.isFull()) {
            err = "房间已经满了";
        }
        else {
            var player = new Player({ nickname: joinRoomData.nickname, uuid: joinRoomData.uuid, socket: socket });
            for (let i = 0; i < room.players.length; i++) {
                const p = room.players[i];
                if(p.nickname==joinRoomData.nickname){
                    return;
                }
            }
            for (let i = 0; i < room.seatNos.length; i++) {

                if (room.seatNos[i][1] == 0) {
                    room.seatNos[i][1] = 1;
                    player.seatNo = room.seatNos[i][0];
                    break;
                }
            }
            ret.roomId = room.roomId;
            ret.nickname = player.nickname;
            ret.uuid = player.uuid;
            ret.seatNo = player.seatNo;
            ret.player = player;
            room.addPlayer(player);
            socket.roomId = room.roomId;
            socket.nickname = joinRoomData.nickname;
            socket.uuid = joinRoomData.uuid;

        }
        console.log(`apply_join_room ${JSON.stringify(joinRoomData)}`);

        socket.emit(global_const.apply_join_room, err, ret);
    });


    socket.on(global_const.sync_room, function () {
        var room = getPlayerRoom();
        console.log(`sync_room:` + socket.nickname);
        socket.emit(global_const.sync_room, null, room.players);

        room.players.forEach(player => {
            if (player.getSocket() == socket) {
                return;
            }
            player.getSocket().emit(global_const.join_room, null, room.getPlayer(socket));
        });

    });
    socket.on(global_const.ready_game, function () {
        var room = getPlayerRoom();
        console.log(`ready_game:` + socket.nickname);
        var player = room.getPlayer(socket);
        player.ready();

        room.players.forEach(p => {
            p.getSocket().emit(global_const.ready_game, null, player);
        });
        //全都准备好就进行发牌
        if (room.isAllReady()) {
            room.playing();

            var cardList = [];
            for (let k = 0; k < 3; k++) {
                for (let i = 0; i < 15; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (i >= 13) {
                            if (j > 0) {
                                break;
                            }
                            else {
                                cardList.push(new Card(global_const.card_nos[i], ""));
                            }
                        }
                        else {
                            cardList.push(new Card(global_const.card_nos[i], global_const.card_shapes[j]));
                        }
                    }
                }
            }

            var randomCardList = [];
            // while (cardList.length > 0) {
            //     var index = Math.floor((Math.random() * cardList.length));
            //     randomCardList.push(cardList[index]);
            //     cardList.splice(index, 1);
            // }
            // var randomCardList2 = [];
            // while (randomCardList.length > 0) {
            //     var index = Math.floor((Math.random() * randomCardList.length));
            //     randomCardList2.push(randomCardList[index]);
            //     randomCardList.splice(index, 1);
            // }
            // randomCardList=randomCardList2;
            randomCardList=tools.shuffle(cardList);
            randomCardList=tools.shuffle(randomCardList);
            randomCardList=tools.shuffle(randomCardList);
            randomCardList=tools.shuffle(randomCardList);
            randomCardList=tools.shuffle(randomCardList);
            randomCardList=tools.shuffle(randomCardList);
            var count = randomCardList.length;
            while (count > 0) {
                let i = count % room.maxPlayerNo;
                room.players[i].addCard(randomCardList[0]);
                randomCardList.splice(0, 1);
                count--;

            }

            //第一个人随机出牌
            //var startNo=Math.floor(Math.random()*room.players.length);
            var startNo = 0;
            room.setTurn(startNo, true);
            // socket.emit(global_const.start_game,null,room.players[0].cards);
            room.players.forEach(player => {
                player.getSocket().emit(global_const.start_game, null, { startNo: startNo, cards: player.cards,gameInfo:room.getPlayerGameInfo() });
            });
        }
    });

    var getPlayerRoom = function (roomId) {
        roomId = roomId || socket.roomId;
        if (!roomId) {
            return null;
        }
        return roomList.find(function (r) {
            return r.roomId == roomId;
        });
    }

    socket.on(global_const.start_game, function () {
        var room = getPlayerRoom();
        var cardList = [];
        for (let k = 0; k < 3; k++) {
            for (let i = 0; i < 15; i++) {
                for (let j = 0; j < 4; j++) {
                    if (i >= 13) {
                        if (j > 0) {
                            break;
                        }
                        else {
                            cardList.push(new Card(global_const.card_nos[i], ""));
                        }
                    }
                    else {
                        cardList.push(new Card(global_const.card_nos[i], global_const.card_shapes[j]));
                    }
                }
            }
        }

        var randomCardList = [];
        while (cardList.length > 0) {
            var index = Math.floor((Math.random() * cardList.length));
            randomCardList.push(cardList[index]);
            cardList.splice(index, 1);
        }

        var count = randomCardList.length;
        while (count > 0) {
            let i = count % 4;
            room.players[i].addCard(randomCardList[0]);
            randomCardList.splice(0, 1);
            count--;

        }

        //console.log(`start_game cards.length:` + room.players[0].cards.length );
        // socket.emit(global_const.start_game,null,room.players[0].cards);
        room.players.forEach(player => {
            player.getSocket().emit(global_const.start_game, null, player.cards);
        });
    });

    socket.on(global_const.push_card, function (turn) {
        var room = getPlayerRoom();
        room.pushCard(turn,socket);
    });

    socket.on('disconnect', function () {
        var room = getPlayerRoom();
        if (room) {

            if(room.isPlaying){
                //如果房间已经开始游戏，就将该用户设置为离线
                room.offLine(socket);
            }
            else{
                room.leaveRoom(socket);
                if (room.players.length == 0) {
                    tools.splice(roomList, room);
                }
                else {
                    room.players.forEach(player => {
                        player.getSocket().emit(global_const.leave_room, null, { nickname: socket.nickname, uuid: socket.uuid });
                    });
                }
            }

        }

        tools.splice(playerList, socket);
        console.log(` disconnect  players : ${playerList.length} , rooms : ${roomList.length}`);
    });

});
console.log('listen on 3000');