var Player=function(nickname,socket){
    this.nickname=nickname;
    this.isCreator=false;
    var socket=socket;
    this.seatNo=0; 
    this.getSocket=function () {
        return socket;
    }
 }
 module.exports=Player;