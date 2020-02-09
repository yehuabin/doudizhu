// const MESSAGES = ['对家要不要的起', '要不起', '直接压死别给套', '放他走', '快出牌脑子转快点', '让我来', '和你搭伙一世痛苦', '关公面前耍大刀',
//     '炸弹不炸带回家啊', '全小炸，炸不动', '没炸弹', '这把我带你飞', '要不要加分数', '有分就加，我来吃', '手抖了，不好意思', '你是真会玩', '出单张', '出对子', '出三个'];
var MESSAGES = {};
MESSAGES['什么牌型那'] = 'M_Speak17.mp3';
MESSAGES['破牌'] = 'M_Speak12.mp3';
MESSAGES['我帮你瞄着'] = 'M_Speak18.mp3';
MESSAGES['全大'] = 'M_Speak16.mp3';
MESSAGES['让他打吧'] = 'M_Speak28.mp3';
MESSAGES['人等睡着了'] = 'M_Speak1.mp3';
MESSAGES['快打快打'] = 'M_Speak4.mp3';
MESSAGES['看大字报?'] = 'M_Speak3.mp3';
MESSAGES['没吃不倒霉'] = 'M_Speak6.mp3';
MESSAGES['关公面前舞大刀'] = 'M_Speak25.mp3';
MESSAGES['双拖双'] = 'M_Speak13.mp3';
MESSAGES['打三个'] = 'M_Speak14.mp3';
MESSAGES['全散'] = 'M_Speak15.mp3';
MESSAGES['炸弹带回家'] = 'M_Speak7.mp3';
MESSAGES['没炸弹啊'] = 'M_Speak8.mp3';
MESSAGES['定点！别慌'] = 'M_Speak9.mp3';
MESSAGES['你凶西'] = 'M_Speak33.mp3';
MESSAGES['对家，没料？'] = 'M_Speak11.mp3';
MESSAGES['一世痛苦'] = 'M_Speak19.mp3';
MESSAGES['扔砖头'] = 'M_Speak22.mp3';
MESSAGES['逃哪里去'] = 'M_Speak35.mp3';
MESSAGES['牌像中石油'] = 'M_Speak20.mp3';
MESSAGES['南斯拉夫'] = 'M_Speak21.mp3';
MESSAGES['形势看透西'] = 'M_Speak31.mp3';
MESSAGES['哈哈！偷机'] = 'M_Speak26.mp3';
MESSAGES['自打错了没怨'] = 'M_Speak32.mp3';
var tools = require('../utility/tools');

cc.Class({
    extends: cc.Component,

    properties: {
        hide_bg: cc.Node,
        content: cc.Node,
        talk_select: cc.Node,
        box: cc.Node,
        talk0Prefab: cc.Prefab,
        talk1Prefab: cc.Prefab,
    },
    onMessage(e) {
        let msg = global.player;
        msg.msg = e.getComponent(cc.Label).string;
        global.socket.emit(global.const.player_talk, msg);
    },
    player_talk(err, data) {

        let length = data.msg.length;
        if (length <= 3) {
            length = 3.5;
        }
        else if (length==4) {
            length=4.5;
        }

        let seatNo = tools.getConvertSeatNo(data.seatNo);

        tools.play('talk/'+MESSAGES[data.msg]);
        if (data.seatNo == global.player.seatNo) {
            this.talk_select.active = false;
        }
        let node = null;
        switch (seatNo) {
            case 0:
                node = this.talk0;
                break;
            case 1:
                node = this.talk1;
                break;
            case 2:
                node = this.talk2;
                break;
            case 3:
                node = this.talk3;
                break;
        }
        node.stopAllActions();
        node.getChildByName("message").getComponent(cc.Label).string = data.msg;
        node.width = 30 * length;
        node.opacity = 255;

        node.runAction(cc.sequence(cc.show(), cc.delayTime(2), cc.hide()));
    },

    // LIFE-CYCLE CALLBACKS:
    hide() {
        this.talk_select.active = false;
    },
    stop(e) {
        e.stopPropagation();
    },
    onLoad() {
        // this.hide_bg.on(cc.Node.EventType.TOUCH_START,this.hide,this);
        // this.talk_select.on(cc.Node.EventType.TOUCH_START,this.stop,this);



        let i = 0;
        for (var item in MESSAGES) {
            const msg = item;
            var node = new cc.Node("node");
            node.anchorX = 0;
            node.anchorY = 0;
            node.width = 200;
            node.height = 40;
            var btn = node.addComponent(cc.Button);
            var label = btn.addComponent(cc.Label);

            label.name = "msg";
            label.string = msg;
            label.fontSize = 25;
            node.position = cc.v2(-100, -50 - (50 * i));
            node.on("click", this.onMessage, this);
            this.content.addChild(node)
            i++;

        }

        this.content.height = i * 50
        this.talk0 = cc.instantiate(this.talk0Prefab);
        this.talk2 = cc.instantiate(this.talk0Prefab);
        this.talk3 = cc.instantiate(this.talk0Prefab);
        this.talk1 = cc.instantiate(this.talk1Prefab);
        this.talk0.opacity = 0;
        this.talk1.opacity = 0;
        this.talk2.opacity = 0;
        this.talk3.opacity = 0;
        this.talk0.parent = this.box;
        this.talk1.parent = this.box;
        this.talk2.parent = this.box;
        this.talk3.parent = this.box;

        this.talk0.position = cc.v2(-960, -50);
        this.talk1.position = cc.v2(120, 120);
        this.talk2.position = cc.v2(-380, 380);
        this.talk3.position = cc.v2(-960, 120);

        global.socket.on(global.const.player_talk, this.player_talk.bind(this));
    },
    onClick(event, eventData) {
        switch (eventData) {
            case "talk":
                this.talk_select.active = !this.talk_select.active;
                event.stopPropagation();
                break;

            default:
                break;
        }
    },
    start() {

    },

    // update (dt) {},
});
