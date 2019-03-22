cc.Class({
    extends: cc.Component,

    properties: {
        userNameEdit: cc.EditBox
    },

    // LIFE-CYCLE CALLBACKS:
    onClick: function (event, customData) {
        switch (customData) {
            case "save":
                if (this.userNameEdit.string) {
                    global.player.nickname = this.userNameEdit.string;
                   
                    localStorage["nickname"]=this.userNameEdit.string;
                    this.node.destroy();
                }
                break;

        }

    },

    onLoad() {

    },

    start() {

    },

    // update (dt) {},
});
