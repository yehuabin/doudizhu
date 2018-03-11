const card = function (cardPrefab) {
    var that = {};
    that.preFab = cardPrefab;
    var _selected = false;
    var _isPushed=false;
   
    that.getSelected=function(){
       return _selected;
    }
    that.pushCard=function(){
        _isPushed=true;
     }
    cardPrefab.on('mousedown', function (event) {
        if(_isPushed){
            return;
        }
        var pos = event.target.position;
         _selected = ! _selected;
        if (_selected) {
            var moveTo = cc.moveTo(0.1, cc.p(pos.x, pos.y + 20));
            event.target.runAction(moveTo);
        }
        else {
            var moveTo = cc.moveTo(0.1, cc.p(pos.x, pos.y - 20));
            event.target.runAction(moveTo);
        }
    }.bind(this));
     
    return that;
};
module.exports = card;