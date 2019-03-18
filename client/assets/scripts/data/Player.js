var Player = function (data) {
    var posArray = [cc.v2(-580, -250), cc.v2(580, 0), cc.v2(0, 300), cc.v2(-580, 0)];
    this.nickname = data.nickname;
    this.uuid = data.uuid;
    this.score = data.score;
    this.seatNo = data.seatNo;
    this.prefab = cc.instantiate(data.prefab);
    this.prefab.parent = data.parent;
    this.prefab.position = posArray[data.seatNo];
    this.prefab.getChildByName("nickname").getComponent(cc.Label).string = data.nickname;
    //this.prefab.getChildByName("score").getComponent(cc.Label).string="";
}

Player.prototype.setScore = function (score) {
    var scoreLabel = this.prefab.getChildByName("score").getComponent(cc.Label);
    scoreLabel.node.opacity = 255;
    scoreLabel.string = score;
    scoreLabel.node.runAction(cc.fadeIn(1));

    this.score = score;
}
Player.prototype.hideReady = function () {
    this.prefab.getChildByName("ready").opacity = 0;
}
Player.prototype.showReady = function () {
    this.prefab.getChildByName("ready").opacity = 255;
}
module.exports = Player;