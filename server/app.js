const socket = require('socket.io');
var global_const = require('./data/global_const');
var Room = require('./data/Room');
var Player = require('./data/Player');
var Card = require('./data/Card');
var tools = require('./utility/tools');
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
        var player = new Player(user.nickname, socket);
        player.isCreator = true;

        room.addPlayer(player);
        roomList.push(room);
        socket.roomId = room.roomId;
        socket.nickname = user.nickname;
        var ret = {
            roomId: room.roomId,
            nickname: user.nickname,
            seatNo: player.seatNo,
            isCreator: player.isCreator
        };

        socket.emit(global_const.create_room, null, ret);
    });

    socket.on(global_const.apply_join_room, function (joinRoomData) {
        var room = getPlayerRoom(joinRoomData.roomId);
        var err = null;
        var ret = {};
        if (!room) {
            err = "房间不存在：" + joinRoomData.roomId;
        }
        else if (room.isFull()) {
            err = "房间已经满了";
        }
        else {
            var player = new Player(joinRoomData.nickname, socket);

            for (let i = 0; i < room.seatNos.length; i++) {

                if (room.seatNos[i][1] == 0) {
                    room.seatNos[i][1] = 1;
                    player.seatNo = room.seatNos[i][0];
                    break;
                }
            }
            ret.roomId = room.roomId;
            ret.nickname = player.nickname;
            ret.seatNo = player.seatNo;
            ret.player = player;
            room.addPlayer(player);
            socket.roomId = room.roomId;
            socket.nickname = joinRoomData.nickname;

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
         var player= room.getPlayer(socket);
         player.ready();

        room.players.forEach(p => {
            p.getSocket().emit(global_const.ready_game, null, player);
        });
        //全都准备好就进行发牌
        if(room.isAllReady()){
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
    
            //var startNo=Math.floor(Math.random()*room.players.length);
            var startNo=0;
            room.setTurn(startNo,true);
            console.log(`start_game ` + room.players[0].cards.length + JSON.stringify(room.players[0].cards));
            // socket.emit(global_const.start_game,null,room.players[0].cards);
            room.players.forEach(player => {
                player.getSocket().emit(global_const.start_game, null, {startNo:startNo,cards:player.cards});
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

        console.log(`start_game ` + room.players[0].cards.length + JSON.stringify(room.players[0].cards));
        // socket.emit(global_const.start_game,null,room.players[0].cards);
        room.players.forEach(player => {
            player.getSocket().emit(global_const.start_game, null, player.cards);
        });
    });
    socket.on(global_const.push_card, function (turn) {
        var room = getPlayerRoom();
        console.log(`push_card:` + socket.nickname);
        var player= room.getPlayer(socket);

        if(player.seatNo!=turn.seatNo){
            console.log(`push_card:还没轮到你出牌`);
            socket.emit(global_const.push_card,"还没轮到你出牌");
            return;
        }
        if(!turn.cards||turn.cards.length==0){
            socket.emit(global_const.push_card,"请选择你要出的牌");
            return;
        }
        if(turn.pass){
            //todo:不出 直接跳到下家
            return;
        }
        //todo:turn.score 计算打出的牌带了多少分数

        //把牌从用户手里去掉
        player.pushCard(turn.cards);

        //出牌顺序交给下家
        turn.seatNo=(turn.seatNo+1)%4;
        room.players.forEach(p => {
            p.getSocket().emit(global_const.push_card, null, turn);
        });

    });
    socket.on('disconnect', function () {
        var room = getPlayerRoom();
        if (room) {

            room.leaveRoom(socket);
            if (room.players.length == 0) {
                tools.splice(roomList, room);
            }
            else {
                room.players.forEach(player => {
                    player.getSocket().emit(global_const.leave_room, null, socket.nickname);
                });
            }
        }

        tools.splice(playerList, socket);
        console.log(` disconnect  players : ${playerList.length} , rooms : ${roomList.length}`);

    });

});
console.log('listen on 3000');