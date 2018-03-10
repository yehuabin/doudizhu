var card = require('../data/card');

cc.Class({
    extends: cc.Component,

    properties: {
        userPrefab: cc.Prefab,
        cardPrefab: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.startSelect = false;
        this.cardList = [];
        var posArray = [cc.p(-580, -250), cc.p(580, 0), cc.p(0, 250), cc.p(-580, 0)]
        for (let i = 0; i < 4; i++) {
            var user = cc.instantiate(this.userPrefab);
            user.parent = this.node;
            user.position = posArray[i];
            user.getChildByName("nickname").getComponent(cc.Label).string = "user" + i;
        }

        for (let i = 0; i < 20; i++) {
            var cardPre = cc.instantiate(this.cardPrefab);
            cardPre.parent = this.node;
            cardPre.position = cc.p(-450 + i * 51, -170);

        }
        for (let i = 0; i < 21; i++) {
            var cardPre = cc.instantiate(this.cardPrefab);

            cardPre.parent = this.node;
            cardPre.position = cc.p(-450 + i * 51, -270);

            this.cardList.push(card(cardPre));



        }

    },

    onClick: function (event, eventData) {
        switch (eventData) {
            case "play":
                for (let i = 0; i < this.cardList.length; i++) {
                    const element = this.cardList[i];
                    if (element.getSelected()) {
                        var moveTo = cc.moveTo(0.1, cc.p(-450+ i * 51 , 0));
                        element.preFab.runAction(moveTo);
                    }
                }

                break;

            default:
                break;
        }
    },
    start() {

    },

    // update (dt) {},
});
