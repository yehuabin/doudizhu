const defines  = {};
defines.serverUrl = 'http://127.0.0.1:3000';

defines.gameConfig = {
    createRoomConfig: '/config/create-room-config',
    testConfig: '/config/test'
};

// export default defines;
window.defines = defines;
window.global_player={ userid: "yhb", nickname: "yhb" + Math.floor(Math.random() * 100) };