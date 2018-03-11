var socket = require('./controller/socketController');
var socketEvent = require('../data/socketEvent');
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        socket.init();

        socket.on(socketEvent.create_room, function (err, ret) {
            if (!err) {
                global_player.roomId = ret.roomId;
                global_player.seatNo = ret.seatNo;
                global_player.isCreator = ret.isCreator;
                cc.director.loadScene("gameScene");
            }
            console.log("create_room_success: " + JSON.stringify(ret));
        });
        socket.on(socketEvent.join_room, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {

            }
            console.log("join_room_success: " + JSON.stringify(data));
            cc.director.loadScene("gameScene");
        });
    },
    onClick: function (event, customData) {

        //console.log('custom data =  ' + customData);
        switch (customData) {
            case socketEvent.create_room:
               
                console.log(`玩家: ${global_player.nickname}  创建房间`);
                socket.emit(socketEvent.create_room, global_player);

                break;
            case socketEvent.join_room:
                console.log(`玩家: ${global_player.nickname}  加入房间`);
                socket.emit(socketEvent.join_room, { roomId: "1314", nickname: global_player.nickname });
                break;

            default:
                break;
        }
    },
    start() {

    },

    // update (dt) {},
});
