const socketController = function () {
    var that = {};
    var _socket = undefined;
    that.init = function () {
        _socket = io(defines.serverUrl);
    };
    that.on=function(event,data){
        _socket.on(event,data);
    };
    that.emit=function(event,data){
        _socket.emit(event,data);
    }

    return that;
}
module.exports = socketController();