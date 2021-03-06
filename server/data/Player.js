var Player = function (data) {
    this.nickname = data.nickname;
    this.uuid = data.uuid;
    this.isCreator = false;
    var socket = data.socket;
    this.overNo=0;
    this.winScore=0;
    this.winDB=0;
    this.score=0;
    this.isOffLine=false;
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
    this.setSocket = function () {
        return socket;
    }
}
Player.prototype.ready=function () {
    this.state="ready";
}
Player.prototype.offLine=function () {
    this.isOffLine=true;
}
Player.prototype.onLine=function (socket) {
    this.setSocket(socket);
    this.isOffLine=false;
}
Player.prototype.init=function () {
    this.overNo=0;
    this.score=0;
    this.state="wait_ready";
    this.cards = [];
}
Player.prototype.isPushOver=function () {
    return this.cards.length==0;
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