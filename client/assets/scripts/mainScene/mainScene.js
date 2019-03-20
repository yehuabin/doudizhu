var socket = require('../controller/socketController');
var global_const = require('../data/global_const');
global.socket = socket;
global.const = global_const;
cc.Class({
    extends: cc.Component,

    properties: {
        dialogPrefab: cc.Prefab,
        loginPrefab: cc.Prefab,
        inputRoomNoPrefab: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.document.title='文成三星';
        global.socket.init();
        // this.dialog = cc.instantiate(this.dialogPrefab);
        // this.dialog.parent = this.node;

        if(!localStorage["nickname"]){
            this.loginPrefab = cc.instantiate(this.loginPrefab);
            this.loginPrefab.parent = this.node;
        }
        else{
            global.player.nickname =localStorage["nickname"];
        } 
        global.player.uuid= global.player.nickname;
        global.socket.on(global.const.create_room, function (err, ret) {
            if (!err) {
                global.player.roomId = ret.roomId;
                global.player.seatNo = ret.seatNo;
                global.player.isCreator = ret.isCreator;
                cc.director.loadScene("gameScene");
            }
            console.log("create_room_success: " + JSON.stringify(ret));
        });


    },
    apply_join_room: function (err, data) {
        if (err) {
            
            console.log(err);
             
        }
        else {
            global.player.seatNo = data.seatNo;
            global.player.roomId = data.roomId;
            console.log("apply_join_room: " + JSON.stringify(data));
            cc.director.loadScene("gameScene");
        }

    },
    onClick: function (event, customData) {

        //console.log('custom data =  ' + customData);
        switch (customData) {
            case global.const.create_room:

                console.log(`玩家: ${global.player.nickname}  创建房间`);
                global.socket.emit(global.const.create_room, global.player);

                break;
            case global.const.apply_join_room:

            global.socket.emit(global.const.apply_join_room, { roomId:"111111", nickname: global.player.nickname,
            uuid:global.player.uuid });
            global.socket.on(global.const.apply_join_room, this.apply_join_room.bind(this));

                // this.inputRoomNo = cc.instantiate(this.inputRoomNoPrefab);
                // this.inputRoomNo.parent = this.node;
                // console.log(`玩家: ${global.player.nickname}  加入房间`);
                break;
            case "close_dialog":
                this.dialog.active = false;
                break;
            default:
                break;
        }
    },
    start() {

    },

    // update (dt) {},
});
