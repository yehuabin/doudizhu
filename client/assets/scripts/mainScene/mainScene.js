var socket = require('../controller/socketController');
var global_const = require('../data/global_const');
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        socket.init();

        socket.on(global_const.create_room, function (err, ret) {
            if (!err) {
                global_player.roomId = ret.roomId;
                global_player.seatNo = ret.seatNo;
                global_player.isCreator = ret.isCreator;
                cc.director.loadScene("gameScene");
            }
            console.log("create_room_success: " + JSON.stringify(ret));
        });
        socket.on(global_const.apply_join_room, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                global_player.seatNo=data.seatNo;
                console.log("apply_join_room: " + JSON.stringify(data));
                cc.director.loadScene("gameScene");
            }
         
        });
    },
    onClick: function (event, customData) {

        //console.log('custom data =  ' + customData);
        switch (customData) {
            case global_const.create_room:
               
                console.log(`玩家: ${global_player.nickname}  创建房间`);
                socket.emit(global_const.create_room, global_player);

                break;
            case global_const.apply_join_room:
                console.log(`玩家: ${global_player.nickname}  加入房间`);
                socket.emit(global_const.apply_join_room, { roomId: "1314", nickname: global_player.nickname });
                break;

            default:
                break;
        }
    },
    start() {

    },

    // update (dt) {},
});
