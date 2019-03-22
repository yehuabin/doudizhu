'use strict';

var defines = {};
defines.serverUrl = 'http://m.5imyh.com:3000';
//defines.serverUrl = 'http://17.178.217.41:3000';

defines.gameConfig = {
    createRoomConfig: '/config/create-room-config',
    testConfig: '/config/test'
};

// export default defines;
window.defines = defines;
window.global = {};
function guid() {
    function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

window.global.player = { uuid: guid()+ Math.floor(Math.random() * 100) + "", nickname: "玩家" + Math.floor(Math.random() * 100) };
