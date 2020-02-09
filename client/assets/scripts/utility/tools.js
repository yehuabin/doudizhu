var rules=require('./rules');
var tools={
    splice:function(array,e){
        if(!array||array.length==0||!e){
            return;
        }
        var index=array.indexOf(e);
        if(index>-1){
            array.splice(index,1);
        }
    },
    getCardText(card){
        let text="";
        switch (card.no) {
            case 1:
                text="A"
                break;
            case 11:
                text="J"
                break;
            case 12:
                text="Q"
                break;
            case 13:
                text="K"
                break;
            case 14:
                text="白"
                break;
            case 15:
                text="红"
                break;
        
            default:
            text=card.no;
                break;
        }
        return text;
    },
    getCardsText(cards){
        let text="";
        if(cards.length==3){
            text=rules.isSX(cards)?`3星${this.getCardText(cards[0])}`:`3个${this.getCardText(cards[0])}`;
        }
        else if(rules.isTHS(cards)){
            text="";
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                text+=this.getCardText(card);
            }
        }
        else{
            text=`${cards.length}个${this.getCardText(cards[0])}`;
        }
        
      return text;
    },
    getConvertSeatNo: function (seatNo) {
        var seatIndex = seatNo - global.player.seatNo;
        if (seatIndex < 0) {
            seatIndex += 4;
        }
        return seatIndex;
    },
    play(url) {
        var audio = document.createElement('audio');
        audio.src = cc.url.raw('resources/audio/' + url);
        audio.play();
    },
    play_ui_click() {
        this.play('ui_click.mp3');
    },
};
module.exports=tools;