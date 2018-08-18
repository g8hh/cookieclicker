var M={};
M.parent=Game.Objects['Temple'];
M.parent.minigame=M;
M.launch=function()
{
	var M=this;
	M.name=M.parent.minigameName;
	M.init=function(div)
	{
		//populate div with html and initialize values
				
		M.gods={
			'asceticism':{
				name:'霍罗波，禁欲之魂',
				icon:[21,18],
				desc1:'<span class="green">+15% 基础饼干秒产量。</span>',
				desc2:'<span class="green">+10% 基础饼干秒产量。</span>',
				desc3:'<span class="green">+5% 基础饼干秒产量。</span>',
				descAfter:'<span class="red">如果一个黄金饼干被点击，这个灵魂就会从槽上下来，所有的灵魂交换次数都会被用完。</span>',
				quote:'不朽的一生专注于内在自我，远离物质财富的干扰。',
			},
			'decadence':{
				name:'沃米萨斯，堕落之魂',
				icon:[22,18],
				desc1:'<span class="green">金色和愤怒饼干效果持续时间 +7%,</span> <span class="red">但是建筑的生产效率 -7% 饼干每秒产量。</span>',
				desc2:'<span class="green">金色和愤怒饼干效果持续时间 +5%,</span> <span class="red">但是建筑的生产效率 -5% 饼干每秒产量。</span>',
				desc3:'<span class="green">金色和愤怒饼干效果持续时间 +2%,</span> <span class="red">但是建筑的生产效率 -2% 饼干每秒产量。</span>',
				quote:'这种卑鄙的灵魂沉溺于贪得无厌，对稳定工作的价值不屑一顾。',
			},
			'ruin':{
				name:'哥萨莫克，毁灭之魂',
				icon:[23,18],
				descBefore:'<span class="green">出售建筑物时触发一个增益效果，效果取决于出售的建筑数量。</span>',
				desc1:'<span class="green">在出售建筑后的10秒钟的时间里，出售的每一幢建筑都能增加1%的点击量。</span>',
				desc2:'<span class="green">在出售建筑后的10秒钟的时间里，出售的每一幢建筑都能增加0.5%的点击量。</span>',
				desc3:'<span class="green">在出售建筑后的10秒钟的时间里，出售的每一幢建筑都能增加0.25%的点击量。</span>',
				quote:'自然灾害的化身。一种难以理解的动机驱使着这种灵魂所造成的破坏。',
			},
			'ages':{
				name:'赛克琉斯, 时光之魂',
				icon:[24,18],
				activeDescFunc:function()
				{
					var godLvl=Game.hasGod('ages');
					var mult=1;
					if (godLvl==1) mult*=0.15*Math.sin((Date.now()/1000/(60*60*3))*Math.PI*2);
					else if (godLvl==2) mult*=0.15*Math.sin((Date.now()/1000/(60*60*12))*Math.PI*2);
					else if (godLvl==3) mult*=0.15*Math.sin((Date.now()/1000/(60*60*24))*Math.PI*2);
					return '当前奖励 : '+(mult<0?'-':'+')+Beautify(Math.abs(mult)*100,2)+'%.';
				},
				descBefore:'随着时间的推移，饼干每秒产量的奖励在<span class="green">+15%</span>到<span class="red">-15%</span>之间波动。',
				desc1:'效果周期为 3 小时。',
				desc2:'效果周期为 12 小时。',
				desc3:'效果周期为 24 小时。',
				quote:'这个灵魂知道你将要做的每一件事，并且喜欢给出严厉的评价。',
			},
			'seasons':{
				name:'塞雷布拉克，节日之魂',
				icon:[25,18],
				descBefore:'<span class="green">一些节日效果得到了加强。</span>',
				desc1:'<span class="green">大幅提升。</span> <span class="red">切换季节的价格是 100%。</span>',
				desc2:'<span class="green">中等提升。</span> <span class="red">切换季节的价格是 50%。</span>',
				desc3:'<span class="green">小幅提升。</span> <span class="red">切换季节的价格是 25%。</span>',
				quote:'这是快乐的假期和后悔星期一早晨的灵魂。',
			},
			'creation':{
				name:'多杰斯，创造之魂',
				icon:[26,18],
				desc1:'<span class="green">建筑成本降低 7% ,</span> <span class="red">但是天堂芯片的效果降低 30% 。</span>',
				desc2:'<span class="green">建筑成本降低 5% ,</span> <span class="red">但是天堂芯片的效果降低 20% 。</span>',
				desc3:'<span class="green">建筑成本降低 2% ,</span> <span class="red">但是天堂芯片的效果降低 10% 。</span>',
				quote:'在很久以前，所有存在和永远存在的事物都是由这种灵魂神秘的卷须书写的。',
			},
			'labor':{
				name:'穆里达尔，劳动之魂',
				icon:[27,18],
				desc1:'<span class="green">点击效果增加 15% ,</span> <span class="red">但是建筑产量减少 3% 。</span>',
				desc2:'<span class="green">点击效果增加 10% ,</span> <span class="red">但是建筑产量减少 2% 。</span>',
				desc3:'<span class="green">点击效果增加 5% ,</span> <span class="red">但是建筑产量减少 1% 。</span>',
				quote:'经过一天的辛勤工作，这种灵魂享受着美味的奶酪。',
			},
			'industry':{
				name:'杰瑞米，工业之魂',
				icon:[28,18],
				desc1:'<span class="green">建筑多生产 10% 的饼干,</span> <span class="red">但是黄金饼干和愤怒饼干却少了 10% 。</span>',
				desc2:'<span class="green">建筑多生产 6% 的饼干,</span> <span class="red">但是黄金饼干和愤怒饼干却少了 6% 。</span>',
				desc3:'<span class="green">建筑多生产 3% 的饼干,</span> <span class="red">但是黄金饼干和愤怒饼干却少了 3% 。</span>',
				quote:'虽然这种灵魂有很多遗憾，但帮助你们通过不断的工业化来统治世界并不是其中之一。',
			},
			'mother':{
				name:'莫卡西姆，母亲之魂',
				icon:[29,18],
				desc1:'<span class="green">牛奶效果增加 10%,</span> <span class="red">但是黄金饼干和愤怒饼干却少了15%</span>',
				desc2:'<span class="green">牛奶效果增加 5%,</span> <span class="red">但是黄金饼干和愤怒饼干却少了10%</span>',
				desc3:'<span class="green">牛奶效果增加 3%,</span> <span class="red">但是黄金饼干和愤怒饼干却少了5%</span>',
				quote:'一种关怀的灵魂，据说是无限地包容着自己。',
			},
			'scorn':{
				name:'斯克鲁伊亚，轻蔑之魂',
				icon:[21,19],
				descBefore:'<span class="red">所有的黄金饼干都是愤怒饼干，有更大的机会产生负面影响。</span>',
				desc1:'<span class="green">皱纹虫出现加速 150%，并再多消化15%的饼干。</span>',
				desc2:'<span class="green">皱纹虫出现加速 100%，并再多消化10%的饼干。</span>',
				desc3:'<span class="green">皱纹虫出现加速 50%，并再多消化5%的饼干。</span>',
				quote:'这种灵魂喜欢刺死野兽，看着他们局促不安，但却不喜欢自己的家人。',
			},
			'order':{
				name:'瑞吉德尔, 秩序之魂',
				icon:[22,19],
				activeDescFunc:function()
				{
					if (Game.BuildingsOwned%10==0) return '拥有建筑 : '+Beautify(Game.BuildingsOwned)+'.<br>效果已激活。';
					else return '拥有建筑 : '+Beautify(Game.BuildingsOwned)+'.<br>效果未激活。';
				},
				desc1:'<span class="green">糖块成熟时间提前1小时。</span>',
				desc2:'<span class="green">糖块成熟时间提前40分钟。</span>',
				desc3:'<span class="green">糖块成熟时间提前20分钟。</span>',
				descAfter:'<span class="red">只有当建筑物的总数量以0结尾时，效果才会激活。</span>',
				quote:'你会发现，如果你能以整洁的数字和恰当的纳税申报单来激励这种灵魂，生活就会变得更加甜蜜。',
			},
		};
		M.godsById=[];var n=0;
		for (var i in M.gods){M.gods[i].id=n;M.gods[i].slot=-1;M.godsById[n]=M.gods[i];n++;}
		
		
		M.slot=[];
		M.slot[0]=-1;//diamond socket
		M.slot[1]=-1;//ruby socket
		M.slot[2]=-1;//jade socket
		
		M.slotNames=[
			'钻石','红宝石','玉石'
		];
		
		M.swaps=3;//swaps left
		M.swapT=Date.now();//the last time we swapped
		
		M.lastSwapT=0;//frames since last swap
		
		M.godTooltip=function(id)
		{
			return function(){
				var me=M.godsById[id];
				me.icon=me.icon||[0,0];
				var str='<div style="padding:8px 4px;min-width:350px;">'+
				'<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div>'+
				'<div class="name">'+me.name+'</div>'+
				'<div class="line"></div><div class="description"><div style="margin:6px 0px;font-weight:bold;">效果 :</div>'+
					(me.descBefore?('<div class="templeEffect">'+me.descBefore+'</div>'):'')+
					(me.desc1?('<div class="templeEffect templeEffect1"><div class="usesIcon shadowFilter templeGem templeGem1"></div>'+me.desc1+'</div>'):'')+
					(me.desc2?('<div class="templeEffect templeEffect2"><div class="usesIcon shadowFilter templeGem templeGem2"></div>'+me.desc2+'</div>'):'')+
					(me.desc3?('<div class="templeEffect templeEffect3"><div class="usesIcon shadowFilter templeGem templeGem3"></div>'+me.desc3+'</div>'):'')+
					(me.descAfter?('<div class="templeEffect">'+me.descAfter+'</div>'):'')+
					(me.quote?('<q>'+me.quote+'</q>'):'')+
				'</div></div>';
				return str;
			};
		}
		
		M.slotTooltip=function(id)
		{
			return function(){
				if (M.slot[id]!=-1)
				{
					var me=M.godsById[M.slot[id]];
					me.icon=me.icon||[0,0];
				}
				var str='<div style="padding:8px 4px;min-width:350px;">'+
				(M.slot[id]!=-1?(
					'<div class="name templeEffect" style="margin-bottom:12px;"><div class="usesIcon shadowFilter templeGem templeGem'+(parseInt(id)+1)+'"></div>'+M.slotNames[id]+' slot</div>'+
					'<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div>'+
					'<div class="name">'+me.name+'</div>'+
					'<div class="line"></div><div class="description"><div style="margin:6px 0px;font-weight:bold;">效果 :</div>'+
						(me.activeDescFunc?('<div class="templeEffect templeEffectOn" style="padding:8px 4px;text-align:center;">'+me.activeDescFunc()+'</div>'):'')+
						(me.descBefore?('<div class="templeEffect">'+me.descBefore+'</div>'):'')+
						(me.desc1?('<div class="templeEffect templeEffect1'+(me.slot==0?' templeEffectOn':'')+'"><div class="usesIcon shadowFilter templeGem templeGem1"></div>'+me.desc1+'</div>'):'')+
						(me.desc2?('<div class="templeEffect templeEffect2'+(me.slot==1?' templeEffectOn':'')+'"><div class="usesIcon shadowFilter templeGem templeGem2"></div>'+me.desc2+'</div>'):'')+
						(me.desc3?('<div class="templeEffect templeEffect3'+(me.slot==2?' templeEffectOn':'')+'"><div class="usesIcon shadowFilter templeGem templeGem3"></div>'+me.desc3+'</div>'):'')+
						(me.descAfter?('<div class="templeEffect">'+me.descAfter+'</div>'):'')+
						(me.quote?('<q>'+me.quote+'</q>'):'')+
					'</div>'
				):
				('<div class="name templeEffect"><div class="usesIcon shadowFilter templeGem templeGem'+(parseInt(id)+1)+'"></div>'+M.slotNames[id]+' 插槽 (空)</div><div class="line"></div><div class="description">'+
				((M.slotHovered==id && M.dragging)?'释放 <b>'+M.dragging.name+'</b> 来将它分配到这个插槽。':'拖动一个灵魂到这个插槽上来分配它。')+
				'</div>')
				)+
				'</div>';
				return str;
			};
		}
		
		M.useSwap=function(n)
		{
			M.swapT=Date.now();
			M.swaps-=n;
			if (M.swaps<0) M.swaps=0;
		}
		
		M.slotGod=function(god,slot)
		{
			if (slot==god.slot) return false;
			if (slot!=-1 && M.slot[slot]!=-1)
			{
				M.godsById[M.slot[slot]].slot=god.slot;//swap
				M.slot[god.slot]=M.slot[slot];
			}
			else if (god.slot!=-1) M.slot[god.slot]=-1;
			if (slot!=-1) M.slot[slot]=god.id;
			god.slot=slot;
			Game.recalculateGains=true;
		}
		
		M.dragging=false;
		M.dragGod=function(what)
		{
			M.dragging=what;
			var div=l('templeGod'+what.id);
			var box=div.getBoundingClientRect();
			var box2=l('templeDrag').getBoundingClientRect();
			div.className='ready templeGod titleFont templeDragged';
			l('templeDrag').appendChild(div);
			var x=box.left-box2.left;
			var y=box.top-box2.top;
			div.style.transform='translate('+(x)+'px,'+(y)+'px)';
			l('templeGodPlaceholder'+M.dragging.id).style.display='inline-block';
			PlaySound('snd/tick.mp3');
		}
		M.dropGod=function()
		{
			if (!M.dragging) return;
			var div=l('templeGod'+M.dragging.id);
			div.className='ready templeGod titleFont';
			div.style.transform='none';
			if (M.slotHovered!=-1 && (M.swaps==0 || M.dragging.slot==M.slotHovered))//dropping on a slot but no swaps left, or slot is the same as the original
			{
				if (M.dragging.slot!=-1) l('templeSlot'+M.dragging.slot).appendChild(div);
				else l('templeGodPlaceholder'+(M.dragging.id)).parentNode.insertBefore(div,l('templeGodPlaceholder'+(M.dragging.id)));
				PlaySound('snd/sell1.mp3',0.75);
			}
			else if (M.slotHovered!=-1)//dropping on a slot
			{
				M.useSwap(1);
				M.lastSwapT=0;
				
				var prev=M.slot[M.slotHovered];//id of the god already in the slot
				if (prev!=-1)
				{
					prev=M.godsById[prev];
					var prevDiv=l('templeGod'+prev.id);
					if (M.dragging.slot!=-1)//swap with god's previous slot
					{
						l('templeSlot'+M.dragging.slot).appendChild(prevDiv);
					}
					else//swap back to roster
					{
						var other=l('templeGodPlaceholder'+(prev.id));
						other.parentNode.insertBefore(prevDiv,other);
					}
				}
				l('templeSlot'+M.slotHovered).appendChild(div);
				M.slotGod(M.dragging,M.slotHovered);
				
				PlaySound('snd/tick.mp3');
				PlaySound('snd/spirit.mp3',0.5);
				
				var rect=div.getBoundingClientRect();
				Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24);
			}
			else//dropping back to roster
			{
				var other=l('templeGodPlaceholder'+(M.dragging.id));
				other.parentNode.insertBefore(div,other);
				other.style.display='none';
				M.slotGod(M.dragging,-1);
				PlaySound('snd/sell1.mp3',0.75);
			}
			M.dragging=false;
		}
		
		M.slotHovered=-1;
		M.hoverSlot=function(what)
		{
			M.slotHovered=what;
			if (M.dragging)
			{
				if (M.slotHovered==-1) l('templeGodPlaceholder'+M.dragging.id).style.display='inline-block';
				else l('templeGodPlaceholder'+M.dragging.id).style.display='none';
				PlaySound('snd/clickb'+Math.floor(Math.random()*7+1)+'.mp3',0.75);
			}
		}
		
		//external
		Game.hasGod=function(what)
		{
			var god=M.gods[what];
			for (var i=0;i<3;i++)
			{
				if (M.slot[i]==god.id) return (i+1);
			}
			return false;
		}
		Game.forceUnslotGod=function(god)
		{
			var god=M.gods[god];
			if (god.slot==-1) return false;
			var div=l('templeGod'+god.id);
			var other=l('templeGodPlaceholder'+(god.id));
			other.parentNode.insertBefore(div,other);
			other.style.display='none';
			M.slotGod(god,-1);
			return true;
		}
		Game.useSwap=M.useSwap;
		
		
		var str='';
		str+='<style>'+
		'#templeBG{background:url(img/shadedBorders.png),url(img/BGpantheon.jpg);background-size:100% 100%,auto;position:absolute;left:0px;right:0px;top:0px;bottom:16px;}'+
		'#templeContent{position:relative;box-sizing:border-box;padding:4px 24px;text-align:center;}'+
		'#templeGods{text-align:center;width:100%;padding:8px;box-sizing:border-box;}'+
		'.templeIcon{pointer-events:none;margin:12px 6px 0px 6px;width:48px;height:48px;opacity:0.8;position:relative;}'+
		'.templeSlot .templeIcon{margin:2px 6px 0px 6px;}'+
		'.templeGod{box-shadow:4px 4px 4px #000;cursor:pointer;position:relative;color:#f33;opacity:0.8;text-shadow:0px 0px 4px #000,0px 0px 6px #000;font-weight:bold;font-size:12px;display:inline-block;width:60px;height:74px;background:url(img/spellBG.png);}'+
		'.templeGod.ready{color:rgba(255,255,255,0.8);opacity:1;}'+
		'.templeGod.ready:hover{color:#fff;}'+
		'.templeGod:hover,.templeDragged{box-shadow:6px 6px 6px 2px #000;z-index:1000000001;top:-1px;}'+
		'.templeGod:active{top:1px;}'+
		'.templeGod.ready .templeIcon{opacity:1;}'+
		'.templeGod:hover{background-position:0px -74px;} .templeGod:active{background-position:0px 74px;}'+
		'.templeGod1{background-position:-60px 0px;} .templeGod1:hover{background-position:-60px -74px;} .templeGod1:active{background-position:-60px 74px;}'+
		'.templeGod2{background-position:-120px 0px;} .templeGod2:hover{background-position:-120px -74px;} .templeGod2:active{background-position:-120px 74px;}'+
		'.templeGod3{background-position:-180px 0px;} .templeGod3:hover{background-position:-180px -74px;} .templeGod3:active{background-position:-180px 74px;}'+
		
		'.templeGod:hover .templeIcon{top:-1px;}'+
		'.templeGod.ready:hover .templeIcon{animation-name:bounce;animation-iteration-count:infinite;animation-duration:0.8s;}'+
		'.noFancy .templeGod.ready:hover .templeIcon{animation:none;}'+
		
		'.templeGem{z-index:100;width:24px;height:24px;}'+
		'.templeEffect{font-weight:bold;font-size:11px;position:relative;margin:0px -12px;padding:4px;padding-left:28px;}'+
		'.description .templeEffect{border-top:1px solid rgba(255,255,255,0.15);background:linear-gradient(to top,rgba(255,255,255,0.1),rgba(255,255,255,0));}'+
		'.templeEffect .templeGem{position:absolute;left:0px;top:0px;}'+
		'.templeEffectOn{text-shadow:0px 0px 6px rgba(255,255,255,0.75);color:#fff;}'+
		'.templeGod .templeGem{position:absolute;left:18px;bottom:8px;pointer-events:none;}'+
		'.templeGem1{background-position:-1104px -720px;}'+
		'.templeGem2{background-position:-1128px -720px;}'+
		'.templeGem3{background-position:-1104px -744px;}'+
		
		'.templeSlot .templeGod,.templeSlot .templeGod:hover,.templeSlot .templeGod:active{background:none;}'+
		
		'.templeSlotDrag{position:absolute;left:0px;top:0px;right:0px;bottom:0px;background:#999;opacity:0;cursor:pointer;}'+
		
		'#templeDrag{position:absolute;left:0px;top:0px;z-index:1000000000000;}'+
		'.templeGod{transition:transform 0.1s;}'+
		'#templeDrag .templeGod{position:absolute;left:0px;top:0px;}'+
		'.templeDragged{pointer-events:none;}'+
		
		'.templeGodPlaceholder{background:red;opacity:0;display:none;width:60px;height:74px;}'+
		
		'#templeSlots{margin:4px auto;text-align:center;}'+
		'#templeSlot0{top:-4px;}'+
		'#templeSlot1{top:0px;}'+
		'#templeSlot2{top:4px;}'+
		
		'#templeInfo{position:relative;display:inline-block;margin:8px auto 0px auto;padding:8px 16px;padding-left:32px;text-align:center;font-size:11px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000;background:rgba(0,0,0,0.75);border-radius:16px;}'+
		'</style>';
		str+='<div id="templeBG"></div>';
		str+='<div id="templeContent">';
			str+='<div id="templeDrag"></div>';
			str+='<div id="templeSlots">';
			for (var i in M.slot)
			{
				var me=M.slot[i];
				str+='<div class="ready templeGod templeGod'+(i%4)+' templeSlot titleFont" id="templeSlot'+i+'" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.slotTooltip('+i+')','this')+'><div class="usesIcon shadowFilter templeGem templeGem'+(parseInt(i)+1)+'"></div></div>';
			}
			str+='</div>';
			str+='<div id="templeInfo"><div '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.refillTooltip','this')+' id="templeLumpRefill" class="usesIcon shadowFilter lumpRefill" style="left:-6px;top:-10px;background-position:'+(-29*48)+'px '+(-14*48)+'px;"></div><div id="templeSwaps" '+Game.getTooltip('<div style="padding:8px;width:350px;font-size:11px;text-align:center;">每次你将一个灵魂放至插槽, 你就会使用一个灵魂交换次数。<div class="line"></div>如果你还剩2个次数, 下一个将在1小时后补充。<br>如果你还剩1个次数, 下一个将在4小时后补充。<br>如果你还剩0个次数, 下一个将在16小时后补充。<div class="line"></div>将灵魂移出插槽不消耗次数。</div>')+'>-</div></div>';
			str+='<div id="templeGods">';
			for (var i in M.gods)
			{
				var me=M.gods[i];
				var icon=me.icon||[0,0];
				str+='<div class="ready templeGod templeGod'+(me.id%4)+' titleFont" id="templeGod'+me.id+'" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.godTooltip('+me.id+')','this')+'><div class="usesIcon shadowFilter templeIcon" style="background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div><div class="templeSlotDrag" id="templeGodDrag'+me.id+'"></div></div>';
				str+='<div class="templeGodPlaceholder" id="templeGodPlaceholder'+me.id+'"></div>';
			}//<div class="usesIcon shadowFilter templeGem templeGem'+(me.id%3+1)+'"></div>
			str+='</div>';
		str+='</div>';
		div.innerHTML=str;
		M.swapsL=l('templeSwaps');
		M.lumpRefill=l('templeLumpRefill');
		
		for (var i in M.gods)
		{
			var me=M.gods[i];
			AddEvent(l('templeGodDrag'+me.id),'mousedown',function(what){return function(){M.dragGod(what);}}(me));
			AddEvent(l('templeGodDrag'+me.id),'mouseup',function(what){return function(){M.dropGod(what);}}(me));
		}
		for (var i in M.slot)
		{
			var me=M.slot[i];
			AddEvent(l('templeSlot'+i),'mouseover',function(what){return function(){M.hoverSlot(what);}}(i));
			AddEvent(l('templeSlot'+i),'mouseout',function(what){return function(){M.hoverSlot(-1);}}(i));
		}
		
		AddEvent(document,'mouseup',M.dropGod);
		
		
		M.refillTooltip=function(){
			return '<div style="padding:8px;width:300px;font-size:11px;text-align:center;">点击来花费 <span class="price lump">1 糖块</span>充满灵魂交换次数。'+
				(Game.canRefillLump()?'<br><small>(每 '+Game.sayTime((Game.getLumpRefillMax()/1000)*Game.fps,-1)+'可以做一次)</small>':('<br><small class="red">(usable again in '+Game.sayTime((Game.getLumpRefillRemaining()/1000+1)*Game.fps,-1)+')</small>'))+
			'</div>';
		};
		AddEvent(M.lumpRefill,'click',function(){
			if (M.swaps<3)
			{Game.refillLump(1,function(){
				M.swaps=3;
				M.swapT=Date.now();
				PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
			});}
		});
		
		//M.parent.switchMinigame(1);
	}
	M.save=function()
	{
		//output cannot use ",", ";" or "|"
		var str='';
		for (var i in M.slot)
		{str+=parseFloat(M.slot[i])+'/';}
		str=str.slice(0,-1);
		str+=' '+parseFloat(M.swaps)+' '+parseFloat(M.swapT);
		str+=' '+parseInt(M.parent.onMinigame?'1':'0');
		return str;
	}
	M.load=function(str)
	{
		//interpret str; called after .init
		//note : not actually called in the Game's load; see "minigameSave" in main.js
		if (!str) return false;
		var i=0;
		var spl=str.split(' ');
			var bit=spl[i++].split('/')||[];
			for (var ii in M.slot)
			{
				if (parseFloat(bit[ii])!=-1)
				{
					var god=M.godsById[parseFloat(bit[ii])];
					M.slotGod(god,ii);
					l('templeSlot'+god.slot).appendChild(l('templeGod'+god.id));
				}
			}
		M.swaps=parseFloat(spl[i++]||3);
		M.swapT=parseFloat(spl[i++]||Date.now());
		var on=parseInt(spl[i++]||0);if (on && Game.ascensionMode!=1) M.parent.switchMinigame(1);
	}
	M.reset=function()
	{
		M.swaps=3;
		M.swapT=Date.now();
		for (var i in M.slot) {M.slot[i]=-1;}
		for (var i in M.gods)
		{
			var me=M.gods[i];
			me.slot=-1;
			var other=l('templeGodPlaceholder'+(me.id));
			other.parentNode.insertBefore(l('templeGod'+me.id),other);
			other.style.display='none';
		}
	}
	M.logic=function()
	{
		//run each frame
		var t=1000*60*60;
		if (M.swaps==0) t=1000*60*60*16;
		else if (M.swaps==1) t=1000*60*60*4;
		var t2=M.swapT+t-Date.now();
		if (t2<=0 && M.swaps<3) {M.swaps++;M.swapT=Date.now();}
		M.lastSwapT++;
	}
	M.draw=function()
	{
		//run each draw frame
		if (M.dragging)
		{
			var box=l('templeDrag').getBoundingClientRect();
			var x=Game.mouseX-box.left-60/2;
			var y=Game.mouseY-box.top;
			if (M.slotHovered!=-1)//snap to slots
			{
				var box2=l('templeSlot'+M.slotHovered).getBoundingClientRect();
				x=box2.left-box.left;
				y=box2.top-box.top;
			}
			l('templeGod'+M.dragging.id).style.transform='translate('+(x)+'px,'+(y)+'px)';
		}
		var t=1000*60*60;
		if (M.swaps==0) t=1000*60*60*16;
		else if (M.swaps==1) t=1000*60*60*4;
		var t2=M.swapT+t-Date.now();
		M.swapsL.innerHTML='灵魂交换次数 : <span class="titleFont" style="color:'+(M.swaps>0?'#fff':'#c00')+';">'+M.swaps+'/'+(3)+'</span>'+((M.swaps<3)?' (下一个在 '+Game.sayTime((t2/1000+1)*Game.fps,-1)+')':'');
	}
	M.init(l('rowSpecial'+M.parent.id));
}
var M=0;