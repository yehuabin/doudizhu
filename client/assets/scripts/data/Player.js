var Player = function (data) {
    var posArray = [cc.v2(-580, -155), cc.v2(580, 10), cc.v2(0, 300), cc.v2(-580, 10)];
    this.nickname = data.nickname;
    this.uuid = data.uuid;
    this.score = data.score;
    this.seatNo = data.seatNo;
    this.overNo = 0;
    this.prefab = cc.instantiate(data.prefab);
    this.prefab.parent = data.parent;
    this.prefab.position = posArray[data.seatNo];
    // if (data.seatNo == 0) {
    //     this.prefab.active = false;
    // }
    this.prefab.getChildByName("nickname").getComponent(cc.Label).string = data.nickname;
    // var avatar = this.prefab.getChildByName("avatar").getComponent(cc.Sprite);


    // cc.loader.loadRes(global.player.avatar, cc.SpriteFrame, function (err, spriteFrame) {
    //     avatar.spriteFrame = spriteFrame;
    // });
    this.prefab.zIndex = 0;
    //this.prefab.getChildByName("score").getComponent(cc.Label).string="";
}

Player.prototype.setGameInfo = function (info) {
    var scoreLabel = this.prefab.getChildByName("score").getComponent(cc.Label);
    scoreLabel.node.opacity = 255;
    scoreLabel.string = info.score;
    scoreLabel.node.runAction(cc.fadeIn(1));
    this.score = info.score;
    if (info.overNo) {
        var overNoSprite = this.prefab.getChildByName("overNo").getComponent(cc.Sprite);
        cc.loader.loadRes("ui/overNo_" + info.overNo, cc.SpriteFrame, function (err, spriteFrame) {
            overNoSprite.spriteFrame = spriteFrame;
        });
    }
    this.overNo = info.overNo;
}
Player.prototype.init = function () {
    var scoreLabel = this.prefab.getChildByName("score").getComponent(cc.Label);
    scoreLabel.node.opacity = 255;
    scoreLabel.string = 0;
    scoreLabel.node.runAction(cc.fadeIn(1));
    this.score = 0;
    var overNoSprite = this.prefab.getChildByName("overNo").getComponent(cc.Sprite);
    overNoSprite.spriteFrame = null;

    this.overNo = 0;
}

Player.prototype.hideReady = function () {
    this.prefab.getChildByName("ready").opacity = 0;
}
Player.prototype.showReady = function () {
    this.prefab.getChildByName("ready").opacity = 255;
}
module.exports = Player;