import global from '../global'

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        global.socket.init();

    },
    buttonClick(event, customData) {
        console.log('custom data =  ' + customData);
        switch (customData) {
            case 'wxlogin':
                global.socket.login(global.tianba.playerData.nickName);
                break;

            default:
                break;
        }
    },
    start() {

    },

    // update (dt) {},
});
