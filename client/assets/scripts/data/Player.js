var Player = function (data) {
    var posArray = [cc.v2(-580, -250), cc.v2(580, 0), cc.v2(0, 300), cc.v2(-580, 0)];
    this.nickname = data.nickname;
    this.uuid = data.uuid;
    this.score = data.score;
    this.seatNo = data.seatNo;
    this.overNo =0;
    this.prefab = cc.instantiate(data.prefab);
    this.prefab.parent = data.parent;
    this.prefab.position = posArray[data.seatNo];
    this.prefab.getChildByName("nickname").getComponent(cc.Label).string = data.nickname;
    //this.prefab.getChildByName("score").getComponent(cc.Label).string="";
}

Player.prototype.setGameInfo = function (info) {
    var scoreLabel = this.prefab.getChildByName("score").getComponent(cc.Label);
    scoreLabel.node.opacity = 255;
    scoreLabel.string = info.score;
    scoreLabel.node.runAction(cc.fadeIn(1));


    var overNoLabel = this.prefab.getChildByName("overNo").getComponent(cc.Label);
    overNoLabel.node.opacity = 255;
    if(info.overNo>0){
       
        overNoLabel.string = `第${info.overNo}家`;
        overNoLabel.node.runAction(cc.fadeIn(1));
    }
    else{
        overNoLabel.string = ``;
    }
    

    this.score = info.score;
    this.overNo = info.overNo;
}

Player.prototype.hideReady = function () {
    this.prefab.getChildByName("ready").opacity = 0;
}
Player.prototype.showReady = function () {
    this.prefab.getChildByName("ready").opacity = 255;
    this.prefab.getChildByName("overNo").opacity = 0;
}
module.exports = Player;