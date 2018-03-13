var global_const = require('./global_const');
var Card=function(no,shape){
    this.shape=shape;
    this.no=no;
   
 }
 Card.prototype.getCompareNo=function(){
     
    var index=global_const.card_shapes.indexOf(this.shape);
    return index+this.no*10;
 };
 Card.prototype.equal=function(other){
    return this.shape==other.shape&&this.no==other.shape;
 };
 module.exports=Card;