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
localStorage["uuid"]=Math.floor(Math.random() * 100) + Math.floor(Math.random() * 100) + "";
window.global.player = { uuid: Math.floor(Math.random() * 100) + Math.floor(Math.random() * 100) + "", nickname: "玩家" + Math.floor(Math.random() * 100) };
