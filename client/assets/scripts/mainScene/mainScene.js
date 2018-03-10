var socket=require('./controller/socketController');
       

cc.Class({
    extends: cc.Component,

    properties: {
      
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        socket.init();
       
    },
    onClick:function(event, customData) {
        //console.log('custom data =  ' + customData);
        switch (customData) {
            case 'create_room':
              cc.director.loadScene("gameScene");
                break;
            case 'sendMsg':
              
                //  global.socket.login(global.tianba.playerData.nickName);
                break;

            default:
                break;
        }
    },
    start() {

    },

    // update (dt) {},
});
