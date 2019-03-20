var tools = {
    splice: function (array, e) {
        if (!array || array.length == 0 || !e) {
            return;
        }
        var index = array.indexOf(e);
        if (index > -1) {
            array.splice(index, 1);
        }
    },
    shuffle(cardList) {
        let randomCardList = [];
        while (cardList.length > 0) {
            var index = Math.floor((Math.random() * cardList.length));
            randomCardList.push(cardList[index]);
            cardList.splice(index, 1);
        }
        return randomCardList;
    }
};
module.exports = tools;