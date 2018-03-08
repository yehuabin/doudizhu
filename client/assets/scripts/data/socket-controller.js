const SockerController = function () {
    let that = {};
    let _socket = undefined;
    let _callBackMap = {};
    let _callBackIndex = 1;
   
   
    that.init = function () {
        _socket = io(defines.serverUrl);
    }

    that.login = function (unique, nickname, avatar, cb) {
       _socket.emit('login',{data:{unique:unique}});
    };
    return that;
  
};

export default SockerController;