var rules = {
    isValid: function (cards) {
        var isValid = false;
        if(cards.length==1){
            return true;
        }
        else if(cards.length>=2&&cards.length<=4){
            if (this.isNumberEqual(cards)) {
                isValid = true;
            }
        }
      else if(cards.length>=5){
          if(this.isNumberEqual(cards)){
              isValid=true;
          }
          else{
              if(this.isTHS(cards)){
                  isValid=true;
              }
          }
      }
      return isValid;
    },
    isNumberEqual: function (cards) {
        for (let i = 1; i < cards.length; i++) {
            if (cards[i].no != cards[0].no) {
                return false;
            }
        }
        return true;
    },
    isTHS: function (cards) {
        if (cards.length < 5) {
            return false;
        }
        let j = 0;
        if (cards[0].no == 1) {
            //第一张是A
            //最后一张一定是K
            if (cards[cards.length - 1].no != 13
                || cards[cards.length - 1].shape != cards[0].shape
            ) {
                return false;
            }
            j = 1;
        }
        for (let i = j; i < cards.length - 1; i++) {

            if ((cards[i + 1].no - cards[i].no) != 1 //是否差1
                && cards[i + 1].shape == cards[i].shape//花色相等
                && cards[i + 1].no != 14 && cards[i + 1].no != 15//不是大小王
            ) {
                return false;
            }
        }

        return true;
    }
};
module.exports = rules;