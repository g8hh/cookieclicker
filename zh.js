//汉化杂项
var cnItems = {
    'Cursor': '游标',
    'Grandma': '老奶奶',
    'Farm': '农场',
    'Mine': '矿山',
    'Factory': '工厂',
    'Bank': '银行',
    'Temple': '寺庙',
    'Wizard tower': '精灵塔',
    'Shipment': '装船',
    'Alchemy lab': '炼金实验室',
    'Portal': '传送门',
    'Time machine': '时光机器',
    'Antimatter condenser': '反物质冷凝器',
    'Prism': '棱镜',
    'Chancemaker': '机会制造商',
    'clicked': '点击',
    'baked': '烘烤',
    'harvested': '收获',
    'mined': '开采',
    'Fractal engine': '分形引擎',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',

};

function cnItem(text) {
    //数组里面有的，返回中文
    for (var i in cnItems) {
        if (text == i) {
            return cnItems[i];
        }
    }
    //数组里面没有的，原样返回
    for (var i in cnItems) {
        if (text != i) {
            console.log("需汉化的英文Item：" + text);
            return text;
        }
    }
}



//汉化标题
var cntit = {
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    '': '',
    

};

function cntitle(text) {
    //数组里面有的，返回中文
    for (var i in cntit) {
        if (text == i) {
            return cntit[i];
        }
    }
    //数组里面没有的，原样返回
    for (var i in cntit) {
        if (text != i) {
            console.log("需汉化的英文标题：" + text);
            return text;
        }
    }
}

