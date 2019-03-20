var rules = {
    //比较c1是否比c2大
    isBig: function (c1, c2) {
        var n1 = this.getAceNo(c1[0].no);
        var n2 = this.getAceNo(c2[0].no);

        //先判断是否是三星
        if (this.isSX(c1)) {
            if (!this.isSX(c2)) {
                return true;
            }
            if (n1 > n2) {
                return true;
            }
        }
        else {
            if (!this.isSX(c2)) {
                if (c1.length < 4 && c1.length != c2.length) {
                    //防止888>88>8
                    return false;
                }
                //比较都不是三星的情况
                if (c1.length == 1 && c2.length == 1 && n1 > n2) {
                    return true;
                }
                else if (c1.length == 2 && c2.length == 2 && n1 > n2) {
                    return true;
                }
                else if (c1.length == 3 && c2.length == 3 && n1 > n2) {
                    return true;
                }
                else if (c1.length == 4) {
                    if (c2.length < 4) {
                        return true;
                    }
                    else if (c2.length == 4 && n1 > n2) {
                        return true;
                    }
                }
                else {
                    if (c1.length > c2.length) {
                        return true;
                    }

                    if (c1.length == c2.length) {
                        var isT1 = this.isTHS(c1);
                        var isT2 = this.isTHS(c2);

                        if (isT1) {
                            if (!isT2) {
                                return true;
                            }
                            //同花顺比较大小
                            if (c1[c1.length-1].no > c2[c2.length-1].no) {
                                return true;
                            }
 
                        }
                        else if (!isT2 && n1 > n2) {
                            //长度一样，c2不是同花顺，且点数比c1小
                            return true;
                        }

                    }
                }


            }
        }
        return false;
    },
    getAceNo(no) {
        if (no == 1 || no == 2 || no == 14 || no == 15) {
            return no + 20;
        }
        return no;
    },
    isValid: function (cards) {
        var isValid = false;
        if (cards.length == 1) {
            return true;
        }
        else if (cards.length >= 2 && cards.length <= 4) {
            if (this.isNumberEqual(cards)) {
                isValid = true;
            }
        }
        else if (cards.length >= 5) {
            if (this.isNumberEqual(cards)) {
                isValid = true;
            }
            else {
                if (this.isTHS(cards)) {
                    isValid = true;
                }
            }
        }
        return isValid;
    },
    //是否是三星
    isSX: function (cards) {
        if (cards.length != 3) {
            return false;
        }
        for (let i = 1; i < cards.length; i++) {
            if (cards[i].no != cards[0].no || cards[i].shape != cards[0].shape) {
                return false;
            }
        }
        return true;
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
            //最后一张一定是K或者12345顺子
            if (cards[cards.length - 1].no != 13
                && cards[cards.length - 1].no != cards.length) {
                return false;
            }
            j = 1;
        }
        for (let i = j; i < cards.length - 1; i++) {

            if ((cards[i + 1].no - cards[i].no) != 1 //不差1
                || cards[i + 1].shape != cards[i].shape//花色不相等
                || cards[i + 1].no == 14 || cards[i + 1].no == 15//是大小王
            ) {
                return false;
            }
        }

        return true;
    }
};
module.exports = rules;