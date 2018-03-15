'use strict';

var defines = {};
//defines.serverUrl = 'http://127.0.0.1:3000';
defines.serverUrl = 'http://17.178.217.41:3000';

defines.gameConfig = {
    createRoomConfig: '/config/create-room-config',
    testConfig: '/config/test'
};

// export default defines;
window.defines = defines;
window.global = {};
window.global.player = { uuid: Math.floor(Math.random() * 100) + Math.floor(Math.random() * 100) + "", nickname: "yhb" + Math.floor(Math.random() * 100) };