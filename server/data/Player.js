var Player = function (nickname, socket) {
    this.nickname = nickname;
    this.isCreator = false;
    var socket = socket;
    this.overNo=-1;
    this.score=0;
    this.seatNo = 0;
    this.state="wait_ready";//wait_ready,ready,playing,over,offline
    this.cards = [];
    this.addCard = function (card) {
        if (this.cards.length == 0) {
            this.cards.push(card);
        }
        else {
            var index = 0;
            for (let i = this.cards.length; i > 0; i--) {
                if (card.getCompareNo() > this.cards[i-1].getCompareNo()) {
                    index = i;
                    break;
                }

            }

            this.cards.splice(index, 0, card);
        }
    }
    this.getSocket = function () {
        return socket;
    }
}
Player.prototype.ready=function () {
    this.state="ready";
}
Player.prototype.pushCard=function (pushCards) {
    for (let i = 0; i < pushCards.length; i++) {
        const pushCard = pushCards[i];
        for (let j = 0; j < this.cards.length; j++) {
            const card = this.cards[j];
            if(card.equal(pushCard)){
                this.cards.splice(j,1);
                break;
            }
        }
    }
}
module.exports = Player;