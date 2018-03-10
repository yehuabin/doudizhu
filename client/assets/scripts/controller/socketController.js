const socketController=function () {
    var that={};
    var _socket=undefined;
   that.init=function(){
 _socket=io(defines.serverUrl);
    console.log('--------socketController--------')
   }
    return that;
}
module.exports=socketController();