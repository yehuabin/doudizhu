const MESSAGES = ['对家要不要的起', '要不起','直接压死别给套',  '快出牌脑子转快点', '让我来', '和你搭伙一世痛苦', '关公面前耍大刀',
'炸弹不炸带回家啊','全小炸，炸不动','没炸弹啊','这把我带飞','要不要加分数','有分就加，我来吃', '手抖了，不好意思', '吹个风给我', '放心有风吹', '吹个西北风', '你牌打的真棒',  '出单张', '出对子', '出三个'];
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
        console.log('onMessage');
        
        let msg = global.player;
        msg.msg = e.getComponent(cc.Label).string;
        global.socket.emit(global.const.player_talk, msg);
    },
    player_talk(err, data) {
       
        let length = data.msg.length;
        if (length <= 3) {
            length = 3.5;
        }

        let seatNo = tools.getConvertSeatNo(data.seatNo);
       
        
        if(data.seatNo==global.player.seatNo){
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

        node.runAction( cc.sequence(cc.show(),cc.delayTime(2), cc.hide()));
    },

    // LIFE-CYCLE CALLBACKS:
    hide(){
        this.talk_select.active=false;
    },
    stop(e){
       e.stopPropagation();
    },
    onLoad() {
        this.hide_bg.on(cc.Node.EventType.MOUSE_DOWN,this.hide,this);
        this.talk_select.on(cc.Node.EventType.MOUSE_DOWN,this.stop,this);
    
        for (let i = 0; i < MESSAGES.length; i++) {
            const msg = MESSAGES[i];
            var node = new cc.Node("node");
            node.anchorX = 0;
            node.anchorY = 0;
            node.width = 200;
            node.height = 40;
            var btn = node.addComponent(cc.Button);
            // var label = node.addComponent(cc.Label);
            var label = btn.addComponent(cc.Label);

            label.name = "msg";
            label.string = msg;
            label.fontSize = 25;
            node.position = cc.v2(-100, -50 - (50 * i));
            node.on("click", this.onMessage, this);
            this.content.addChild(node)
            // this.content.addChild(btn)
        }
        this.content.height=MESSAGES.length*50
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

        this.talk0.position = cc.v2(-960,-50);
        this.talk1.position = cc.v2(120, 120);
        this.talk2.position = cc.v2(-380, 380);
        this.talk3.position = cc.v2(-960, 120);

        global.socket.on(global.const.player_talk, this.player_talk.bind(this));
    },
    onClick(event, eventData){
        switch (eventData) {
            case "talk":
                this.talk_select.active=!this.talk_select.active;
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
