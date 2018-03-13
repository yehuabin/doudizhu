
cc.Class({
    extends: cc.Component,

    properties: {
        msgLabel:cc.Label
    },

    onLoad() {
        this.node.active = false;
    },

    start() {

    },
    show:function(msg){
        this.msgLabel.string=msg;
        this.node.active = true;
    },
    onClick: function (event, customData) {

        //console.log('custom data =  ' + customData);
        switch (customData) {
            case "close_dialog":
                this.node.active = false;
                break;
            default:
                break;
        }
    }
    // update (dt) {},
});
