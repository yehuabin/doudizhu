var global_const = require('./global_const');
var Card = function (no, shape, cardPrefab, cardsSpriteAtlas) {
    this.shape = shape;
    this.no = no;
    this.preFab = cardPrefab;
    this.cardsSpriteAtlas = cardsSpriteAtlas;
    var _selected = false;
    var _isPushed = false;

    this.setNo();
    this.setShape();
    this.getSelected = function () {
        return _selected;
    }
    this.pushCard = function () {
        _isPushed = true;
    };

    cardPrefab.on('mousedown', function (event) {
        if (_isPushed) {
            return;
        }
        var pos = event.target.position;
        _selected = !_selected;
        if (_selected) {
            var moveTo = cc.moveTo(0.1, cc.p(pos.x, pos.y + 20));
            event.target.runAction(moveTo);
        }
        else {
            var moveTo = cc.moveTo(0.1, cc.p(pos.x, pos.y - 20));
            event.target.runAction(moveTo);
        }
    }.bind(this));

}
Card.prototype.setShape = function () {
    var shape_big_sprite = this.preFab.getChildByName("shape_big").getComponent(cc.Sprite)
    if (this.no == 14 || this.no == 15) {
        this.preFab.getChildByName("shape_small").active = false;
        shape_big_sprite.spriteFrame = this.cardsSpriteAtlas.getSpriteFrame("GameCard-card_tag_" + (this.no - 10));
    }

    else {
        var shape;
        switch (this.shape) {
            case global_const.card_shapes[0]:
                shape = "GameCard-card_tag_2";
                break;
            case global_const.card_shapes[1]:
                shape = "GameCard-card_tag_0";
                break;
            case global_const.card_shapes[2]:
                shape = "GameCard-card_tag_1";
                break;
            default:
                shape = "GameCard-card_tag_3";
                break;
        }
        this.preFab.getChildByName("shape_small").getComponent(cc.Sprite).spriteFrame = this.cardsSpriteAtlas.getSpriteFrame(shape);
        shape_big_sprite.spriteFrame = this.cardsSpriteAtlas.getSpriteFrame(shape);
    }
}
Card.prototype.setNo = function () {
    var no_node = this.preFab.getChildByName("no");
    var image = "GameCard-card_";
    if (this.no == 14) {
        image = "GameCard-card_wangtag_1";
        no_node.getComponent(cc.Sprite).node.setPositionY(0);
    }
    else if (this.no == 15) {
        image = "GameCard-card_wangtag_2";
        no_node.getComponent(cc.Sprite).node.setPositionY(0);
    }
    else {
        if (this.shape == global_const.card_shapes[0] || this.shape == global_const.card_shapes[1]) {
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