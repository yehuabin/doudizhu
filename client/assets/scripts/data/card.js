var global_const = require('./global_const');
var Card = function (no, shape, cardPrefab, cardsSpriteAtlas) {
    this.shape = shape;
    this.no = no;
    this.prefab = cardPrefab;
    this.isPush=false;
    this.cardsSpriteAtlas = cardsSpriteAtlas;
    var _selected = false;
    var _isPushed = false;
    var selectedBgNode= this.prefab.getChildByName("selectedBg");

    this.setNo();
    this.setShape();
    this.getSelect = function () {
        return _selected;
    }
    this.select = function () {
        selectedBgNode.opacity =255;
         _selected=true;
    }
    this.unSelect = function () {
        selectedBgNode.opacity = 0;
         _selected=false;
    }
    this.pushCard = function () {
        _isPushed = true;
    };
    var callback = function (event) {
        if (_isPushed) {
            return;
        }
        var pos = event.target.position;
        _selected = !_selected;
        if (_selected) {
            var moveTo = cc.moveTo(0.1, cc.v2(pos.x, pos.y + 20));
            event.target.runAction(moveTo);
        }
        else {
            var moveTo = cc.moveTo(0.1, cc.v2(pos.x, pos.y - 20));
            event.target.runAction(moveTo);
        }
    };
    // cardPrefab.on('touchstart',callback.bind(this));

}
Card.prototype.setShape = function () {
    var shape_big_sprite = this.prefab.getChildByName("shape_big").getComponent(cc.Sprite)
    if (this.no == 14 || this.no == 15) {
        this.prefab.getChildByName("shape_small").active = false;
        shape_big_sprite.spriteFrame = this.cardsSpriteAtlas.getSpriteFrame("GameCard-card_tag_" + (this.no - 10));
    }

    else {
        var shape;
        switch (this.shape) {
            case global_const.card_shapes[0]:
                shape = "GameCard-card_tag_2";
                break;
            case global_const.card_shapes[1]:
                shape = "GameCard-card_tag_1";
                break;
            case global_const.card_shapes[2]:
                shape = "GameCard-card_tag_0";
                break;
            default:
                shape = "GameCard-card_tag_3";
                break;
        }
        this.prefab.getChildByName("shape_small").getComponent(cc.Sprite).spriteFrame = this.cardsSpriteAtlas.getSpriteFrame(shape);
        shape_big_sprite.spriteFrame = this.cardsSpriteAtlas.getSpriteFrame(shape);
    }
}
Card.prototype.setNo = function () {
    var no_node = this.prefab.getChildByName("no");
    var image = "GameCard-card_";
    if (this.no == 14) {
        image = "GameCard-card_wangtag_1";
        no_node.getComponent(cc.Sprite).node.y=0;
    }
    else if (this.no == 15) {
        image = "GameCard-card_wangtag_2";
        no_node.getComponent(cc.Sprite).node.y=0;
    }
    else {
        if (this.shape == global_const.card_shapes[0] || this.shape == global_const.card_shapes[2]) {
            image += "red_0";
        }
        else {
            image += "black_0";
        }
        if (this.no < 10) {
            image += this.no;
        }
        else if (this.no == 10) {
            image += "A";
        }
        else if (this.no == 11) {
            image += "B";
        }
        else if (this.no == 12) {
            image += "C";
        }
        else if (this.no == 13) {
            image += "D";
        }
    }
    no_node.getComponent(cc.Sprite).spriteFrame = this.cardsSpriteAtlas.getSpriteFrame(image);


};
module.exports = Card;