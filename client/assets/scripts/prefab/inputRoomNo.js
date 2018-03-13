cc.Class({
    extends: cc.Component,

    properties: {
        roomNoLabel: [cc.Label],
        tipLabel: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:
    onClick: function (event, customData) {
        switch (customData) {
            case "close":
                this.node.destroy();
                break;
            case "clear":
                this.roomNos = "";
                break;
            case "back":
                if (this.roomNos.length > 0) {
                    this.roomNos = this.roomNos.substring(0, this.roomNos.length - 1);
                }

                break;
            default:
                if (this.roomNos.length < this.roomNoLabel.length) {
                    this.roomNos += customData;
                }
                break;
        }
        for (let i = 0; i < this.roomNoLabel.length; i++) {
            if (this.roomNos[i]) {
                this.roomNoLabel[i].string = this.roomNos[i];
            }
            else {
                this.roomNoLabel[i].string = "";
            }

        }

        if (this.roomNos.length == this.roomNoLabel.length) {
            global.socket.emit(global.const.apply_join_room, { roomId: this.roomNos, nickname: global.player.nickname });
        }
    },
    apply_join_room: function (err, data) {
        if (err) {
            for (let i = 0; i < this.roomNoLabel.length; i++) {
                this.roomNoLabel[i].string = "";
            }
            console.log(err);
            this.tipLabel.node.opacity = 255;
            this.tipLabel.string = err;
            this.roomNos = "";
            this.tipLabel.node.runAction(cc.fadeOut(2));
        }
        else {
            global.player.seatNo = data.seatNo;
            global.player.roomId = data.roomId;
            console.log("apply_join_room: " + JSON.stringify(data));
            cc.director.loadScene("gameScene");
        }

    },
    onLoad() {
        this.roomNos = "";
        global.socket.on(global.const.apply_join_room, this.apply_join_room.bind(this));
    },

    start() {

    },

    // update (dt) {},
});
