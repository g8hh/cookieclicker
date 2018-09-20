var M={};
M.parent=Game.Objects['Wizard tower'];
M.parent.minigame=M;
M.launch=function()
{
	var M=this;
	M.name=M.parent.minigameName;
	M.init=function(div)
	{
		//populate div with html and initialize values
		
		M.spells={
			'conjure baked goods':{
				name:'召唤烘焙食品',
				desc:'瞬间获得半小时生产量的饼干，不超过你拥有的饼干的15%。',
				failDesc:'触发一个15分钟的冻结，并减少你15分钟的饼干产量。',
				icon:[21,11],
				costMin:2,
				costPercent:0.4,
				win:function()
				{
					var val=Math.max(7,Math.min(Game.cookies*0.15,Game.cookiesPs*60*30));
					Game.Earn(val);
					Game.Notify('召唤烘焙食品!','你通过魔法获得 <b>'+Beautify(val)+' 饼干'+(val==1?'':'')+'</b> 从稀薄的空气中。',[21,11],6);
					Game.Popup('<div style="font-size:80%;">+'+Beautify(val)+' 饼干'+(val==1?'':'')+'!</div>',Game.mouseX,Game.mouseY);
				},
				fail:function()
				{
					var buff=Game.gainBuff('clot',60*15,0.5);
					var val=Math.min(Game.cookies*0.15,Game.cookiesPs*60*15)+13;
					val=Math.min(Game.cookies,val);
					Game.Spend(val);
					Game.Notify(buff.name,buff.desc,buff.icon,6);
					Game.Popup('<div style="font-size:80%;">反效果!<br>召唤失败! 失去了 '+Beautify(val)+' 饼干'+(val==1?'':'s')+'!</div>',Game.mouseX,Game.mouseY);
				},
			},
			'hand of fate':{
				name:'命运之手',
				desc:'召唤一个随机的黄金饼干。每个现有黄金饼干让这个法术+ 15%反效果概率。',
				failDesc:'召唤一个不走运的愤怒饼干。',
				icon:[22,11],
				costMin:10,
				costPercent:0.6,
				failFunc:function(fail)
				{
					return fail+0.15*Game.shimmerTypes['golden'].n;
				},
				win:function()
				{
					var newShimmer=new Game.shimmer('golden',{noWrath:true});
					var choices=[];
					choices.push('frenzy','multiply cookies');
					if (!Game.hasBuff('龙之飞舞')) choices.push('click frenzy');
					if (Math.random()<0.1) choices.push('cookie storm','cookie storm','blab');
					if (Game.BuildingsOwned>=10 && Math.random()<0.25) choices.push('building special');
					//if (Math.random()<0.2) choices.push('clot','cursed finger','ruin cookies');
					if (Math.random()<0.15) choices=['cookie storm drop'];
					if (Math.random()<0.0001) choices.push('free sugar lump');
					newShimmer.force=choose(choices);
					if (newShimmer.force=='cookie storm drop')
					{
						newShimmer.sizeMult=Math.random()*0.75+0.25;
					}
					Game.Popup('<div style="font-size:80%;">有前途的命运!</div>',Game.mouseX,Game.mouseY);
				},
				fail:function()
				{
					var newShimmer=new Game.shimmer('golden',{wrath:true});
					var choices=[];
					choices.push('clot','ruin cookies');
					if (Math.random()<0.1) choices.push('cursed finger','blood frenzy');
					if (Math.random()<0.003) choices.push('free sugar lump');
					if (Math.random()<0.1) choices=['blab'];
					newShimmer.force=choose(choices);
					Game.Popup('<div style="font-size:80%;">反效果!<br>险恶的命运!</div>',Game.mouseX,Game.mouseY);
				},
			},
			'stretch time':{
				name:'拉伸时间',
				desc:'所有激活的效果将延长10%的持续时间(最多延长5分钟)',
				failDesc:'所有激活的效果将缩短10%的持续时间(最多缩短5分钟)',
				icon:[23,11],
				costMin:8,
				costPercent:0.2,
				win:function()
				{
					var changed=0;
					for (var i in Game.buffs)
					{
						var me=Game.buffs[i];
						var gain=Math.min(Game.fps*60*5,me.maxTime*0.1);
						me.maxTime+=gain;
						me.time+=gain;
						changed++;
					}
					if (changed==0){Game.Popup('<div style="font-size:80%;">没有Buff来改变!</div>',Game.mouseX,Game.mouseY);return -1;}
					Game.Popup('<div style="font-size:80%;">好!Buff持续时间加长了。</div>',Game.mouseX,Game.mouseY);
				},
				fail:function()
				{
					var changed=0;
					for (var i in Game.buffs)
					{
						var me=Game.buffs[i];
						var loss=Math.min(Game.fps*60*10,me.time*0.2);
						me.time-=loss;
						me.time=Math.max(me.time,0);
						changed++;
					}
					if (changed==0){Game.Popup('<div style="font-size:80%;">没有Buff来改变!</div>',Game.mouseX,Game.mouseY);return -1;}
					Game.Popup('<div style="font-size:80%;">Backfire!<br>反效果!不好!Buff持续时间缩短了。</div>',Game.mouseX,Game.mouseY);
				},
			},
			'spontaneous edifice':{
				name:'自发大厦',
				desc:'这个咒语会选择一个，如果你有当前两倍的饼干能买得起的建筑，然后把这个建筑免费给你。被选中的建筑必须在400以下，并且不能是你建得最多的建筑(除非它是你唯一的建筑)。',
				failDesc:'失去一个随机的建筑。',
				icon:[24,11],
				costMin:20,
				costPercent:0.75,
				win:function()
				{
					var buildings=[];
					var max=0;
					var n=0;
					for (var i in Game.Objects)
					{
						if (Game.Objects[i].amount>max) max=Game.Objects[i].amount;
						if (Game.Objects[i].amount>0) n++;
					}
					for (var i in Game.Objects)
					{if ((Game.Objects[i].amount<max || n==1) && Game.Objects[i].getPrice()<=Game.cookies*2 && Game.Objects[i].amount<400) buildings.push(Game.Objects[i]);}
					if (buildings.length==0){Game.Popup('<div style="font-size:80%;">没有建筑可以改进!</div>',Game.mouseX,Game.mouseY);return -1;}
					var building=choose(buildings);
					building.buyFree(1);
					Game.Popup('<div style="font-size:80%;">一个新的 '+building.single+'<br>冲出地面。</div>',Game.mouseX,Game.mouseY);
				},
				fail:function()
				{
					if (Game.BuildingsOwned==0){Game.Popup('<div style="font-size:80%;">反效果, 但是没有建筑可以摧毁!</div>',Game.mouseX,Game.mouseY);return -1;}
					var buildings=[];
					for (var i in Game.Objects)
					{if (Game.Objects[i].amount>0) buildings.push(Game.Objects[i]);}
					var building=choose(buildings);
					building.sacrifice(1);
					Game.Popup('<div style="font-size:80%;">反效果!<br>你的一个'+building.plural+'<br>在一股烟雾中消失。</div>',Game.mouseX,Game.mouseY);
				},
			},
			'haggler\'s charm':{
				name:'砍价的魅力',
				desc:'升级的价格在1分钟内降低了2%。',
				failDesc:'升级费用在一小时内增加了2%。<q>那是什么咒语?给我钱!</q>',
				icon:[25,11],
				costMin:10,
				costPercent:0.1,
				win:function()
				{
					Game.killBuff('砍价的魅力');
					var buff=Game.gainBuff('haggler luck',60,2);
					Game.Popup('<div style="font-size:80%;">升级更便宜!</div>',Game.mouseX,Game.mouseY);
				},
				fail:function()
				{
					Game.killBuff('Haggler\'s luck');
					var buff=Game.gainBuff('haggler misery',60*60,2);
					Game.Popup('<div style="font-size:80%;">反效果!<br>升级价格变高!</div>',Game.mouseX,Game.mouseY);
				},
			},
			'summon crafty pixies':{
				name:'召唤狡猾的小妖精',
				desc:'建筑在1分钟内便宜2%。',
				failDesc:'1小时内，建筑价格上涨了2%。',
				icon:[26,11],
				costMin:10,
				costPercent:0.2,
				win:function()
				{
					Game.killBuff('肮脏的妖精');
					var buff=Game.gainBuff('pixie luck',60,2);
					Game.Popup('<div style="font-size:80%;">狡猾的小妖精!<br>建筑更便宜了!</div>',Game.mouseX,Game.mouseY);
				},
				fail:function()
				{
					Game.killBuff('狡猾的小妖精');
					var buff=Game.gainBuff('pixie misery',60*60,2);
					Game.Popup('<div style="font-size:80%;">反效果!<br>肮脏的妖精!<br>建筑价格更高!</div>',Game.mouseX,Game.mouseY);
				},
			},
			'gambler\'s fever dream':{
				name:'赌徒的狂热梦',
				desc:'以一半的魔法成本随机施法，两倍反效果的几率。',
				icon:[27,11],
				costMin:3,
				costPercent:0.05,
				win:function()
				{
					var spells=[];
					var selfCost=M.getSpellCost(M.spells['gambler\'s fever dream']);
					for (var i in M.spells)
					{if (i!='gambler\'s fever dream' && (M.magic-selfCost)>=M.getSpellCost(M.spells[i])*0.5) spells.push(M.spells[i]);}
					if (spells.length==0){Game.Popup('<div style="font-size:80%;">没有符合条件的法术!</div>',Game.mouseX,Game.mouseY);return -1;}
					var spell=choose(spells);
					var cost=M.getSpellCost(spell)*0.5;
					setTimeout(function(){
						var out=M.castSpell(spell,{cost:cost,failChanceMax:0.5,passthrough:true});
						if (!out)
						{
							M.magic+=selfCost;
							setTimeout(function(){
								Game.Popup('<div style="font-size:80%;">这太糟糕了!<br>魔法退还。</div>',Game.mouseX,Game.mouseY);
							},1500);
						}
					},1000);
					Game.Popup('<div style="font-size:80%;">释放 '+spell.name+'<br>消耗 '+Beautify(cost)+' 魔法...</div>',Game.mouseX,Game.mouseY);
				},
			},
			'resurrect abomination':{
				name:'复活可憎之物',
				desc:'如果条件满足，立即召唤皱纹虫。',
				failDesc:'使你的一只皱纹虫爆裂。',
				icon:[28,11],
				costMin:20,
				costPercent:0.1,
				win:function()
				{
					var out=Game.SpawnWrinkler();
					if (!out){Game.Popup('<div style="font-size:80%;">无法产生皱纹虫!</div>',Game.mouseX,Game.mouseY);return -1;}
					Game.Popup('<div style="font-size:80%;">起来，我的宝贝!</div>',Game.mouseX,Game.mouseY);
				},
				fail:function()
				{
					var out=Game.PopRandomWrinkler();
					if (!out){Game.Popup('<div style="font-size:80%;">反效果!<br>但没有皱纹虫受伤.</div>',Game.mouseX,Game.mouseY);return -1;}
					Game.Popup('<div style="font-size:80%;">反效果!<br>再见了, 丑陋的虫...</div>',Game.mouseX,Game.mouseY);
				},
			},
			'diminish ineptitude':{
				name:'减少无能',
				desc:'法术的反效果在接下来的5分钟内减少10次。',
				failDesc:'法术的反效果在接下来的10分钟内增加5次。',
				icon:[29,11],
				costMin:5,
				costPercent:0.2,
				win:function()
				{
					Game.killBuff('魔法无能');
					var buff=Game.gainBuff('魔法专家',5*60,10);
					Game.Popup('<div style="font-size:80%;">能力减弱了!</div>',Game.mouseX,Game.mouseY);
				},
				fail:function()
				{
					Game.killBuff('魔法专家');
					var buff=Game.gainBuff('魔法无能',10*60,5);
					Game.Popup('<div style="font-size:80%;">反效果!<br>无能放大!</div>',Game.mouseX,Game.mouseY);
				},
			},
		};
		M.spellsById=[];var n=0;
		for (var i in M.spells){M.spells[i].id=n;M.spellsById[n]=M.spells[i];n++;}
		
		
		M.computeMagicM=function()
		{
			var towers=Math.max(M.parent.amount,1);
			var lvl=Math.max(M.parent.level,1);
			M.magicM=Math.floor(4+Math.pow(towers,0.6)+Math.log((towers+(lvl-1)*10)/15+1)*15);
			//old formula :
			/*
			M.magicM=8+Math.min(M.parent.amount,M.parent.level*5)+Math.ceil(M.parent.amount/10);
			if (M.magicM>200)
			{
				//diminishing returns starting at 200, being 5% as fast by 400
				var x=M.magicM;
				var top=x-200;
				top/=200;
				var top2=top;
				top*=(1-top/2);
				if (top2>=1) top=0.5;
				top=top*0.95+top2*0.05;
				top*=200;
				x=top+200;
				M.magicM=x;
			}
			*/
			M.magic=Math.min(M.magicM,M.magic);
		}
		
		M.getFailChance=function(spell)
		{
			var failChance=0.15;
			if (Game.hasBuff('魔法专家')) failChance*=0.1;
			if (Game.hasBuff('魔法无能')) failChance*=5;
			if (spell.failFunc) failChance=spell.failFunc(failChance);
			return failChance;
		}
		
		M.castSpell=function(spell,obj)
		{
			var obj=obj||{};
			var out=0;
			var cost=0;
			var fail=false;
			if (typeof obj.cost!=='undefined') cost=obj.cost; else cost=M.getSpellCost(spell);
			if (M.magic<cost) return false;
			var failChance=M.getFailChance(spell);
			if (typeof obj.failChanceSet!=='undefined') failChance=obj.failChanceSet;
			if (typeof obj.failChanceAdd!=='undefined') failChance+=obj.failChanceAdd;
			if (typeof obj.failChanceMult!=='undefined') failChance*=obj.failChanceMult;
			if (typeof obj.failChanceMax!=='undefined') failChance=Math.max(failChance,obj.failChanceMax);
			Math.seedrandom(Game.seed+'/'+M.spellsCastTotal);
			if (!spell.fail || Math.random()<(1-failChance)) {out=spell.win();} else {fail=true;out=spell.fail();}
			Math.seedrandom();
			if (out!=-1)
			{
				if (!spell.passthrough && !obj.passthrough)
				{
					M.spellsCast++;
					M.spellsCastTotal++;
					if (M.spellsCastTotal>=9) Game.Win('圣经');
					if (M.spellsCastTotal>=99) Game.Win('我是天才');
					if (M.spellsCastTotal>=999) Game.Win('巫师就是你');
				}
				
				M.magic-=cost;
				M.magic=Math.max(0,M.magic);
				
				var rect=l('grimoireSpell'+spell.id).getBoundingClientRect();
				Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24);
				
				if (fail) PlaySound('snd/spellFail.mp3',0.75); else PlaySound('snd/spell.mp3',0.75);
				return true;
			}
			PlaySound('snd/spellFail.mp3',0.75);
			return false;
		}
		
		M.getSpellCost=function(spell)
		{
			var out=spell.costMin;
			if (spell.costPercent) out+=M.magicM*spell.costPercent;
			return Math.floor(out);
		}
		M.getSpellCostBreakdown=function(spell)
		{
			var str='';
			if (spell.costPercent) str+=Beautify(spell.costMin)+' 魔法 +'+Beautify(Math.ceil(spell.costPercent*100))+'% 魔法上限';
			else str+=Beautify(spell.costMin)+' 魔法';
			return str;
		}
		
		M.spellTooltip=function(id)
		{
			return function(){
				var me=M.spellsById[id];
				me.icon=me.icon||[28,12];
				var cost=Beautify(M.getSpellCost(me));
				var costBreakdown=M.getSpellCostBreakdown(me);
				if (cost!=costBreakdown) costBreakdown=' <small>('+costBreakdown+')</small>'; else costBreakdown='';
				var backfire=M.getFailChance(me);
				var str='<div style="padding:8px 4px;min-width:350px;">'+
				'<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div>'+
				'<div class="name">'+me.name+'</div>'+
				'<div>魔法成本 : <b style="color:#'+(cost<=M.magic?'6f6':'f66')+';">'+cost+'</b>'+costBreakdown+'</div>'+
				(me.fail?('<div><small>反效果几率 : <b style="color:#f66">'+Math.ceil(100*backfire)+'%</b></small></div>'):'')+
				'<div class="line"></div><div class="description"><b>正面效果 :</b> <span class="green">'+(me.descFunc?me.descFunc():me.desc)+'</span>'+(me.failDesc?('<div style="height:8px;"></div><b>反效果 :</b> <span class="red">'+me.failDesc+'</span>'):'')+'</div></div>';
				return str;
			};
		}
		
		var str='';
		str+='<style>'+
		'#grimoireBG{background:url(img/shadedBorders.png),url(img/BGgrimoire.jpg);background-size:100% 100%,auto;position:absolute;left:0px;right:0px;top:0px;bottom:16px;}'+
		'#grimoireContent{position:relative;box-sizing:border-box;padding:4px 24px;}'+
		'#grimoireBar{max-width:95%;margin:4px auto;height:16px;}'+
		'#grimoireBarFull{transform:scale(1,2);transform-origin:50% 0;height:50%;}'+
		'#grimoireBarText{transform:scale(1,0.8);width:100%;position:absolute;left:0px;top:0px;text-align:center;color:#fff;text-shadow:-1px 1px #000,0px 0px 4px #000,0px 0px 6px #000;margin-top:2px;}'+
		'#grimoireSpells{text-align:center;width:100%;padding:8px;box-sizing:border-box;}'+
		'.grimoireIcon{pointer-events:none;margin:2px 6px 0px 6px;width:48px;height:48px;opacity:0.8;position:relative;}'+
		'.grimoirePrice{pointer-events:none;}'+
		'.grimoireSpell{box-shadow:4px 4px 4px #000;cursor:pointer;position:relative;color:#f33;opacity:0.8;text-shadow:0px 0px 4px #000,0px 0px 6px #000;font-weight:bold;font-size:12px;display:inline-block;width:60px;height:74px;background:url(img/spellBG.png);}'+
		'.grimoireSpell.ready{color:rgba(255,255,255,0.8);opacity:1;}'+
		'.grimoireSpell.ready:hover{color:#fff;}'+
		'.grimoireSpell:hover{box-shadow:6px 6px 6px 2px #000;z-index:1000000001;top:-1px;}'+
		'.grimoireSpell:active{top:1px;}'+
		'.grimoireSpell.ready .grimoireIcon{opacity:1;}'+
		'.grimoireSpell:hover{background-position:0px -74px;} .grimoireSpell:active{background-position:0px 74px;}'+
		'.grimoireSpell:nth-child(4n+1){background-position:-60px 0px;} .grimoireSpell:nth-child(4n+1):hover{background-position:-60px -74px;} .grimoireSpell:nth-child(4n+1):active{background-position:-60px 74px;}'+
		'.grimoireSpell:nth-child(4n+2){background-position:-120px 0px;} .grimoireSpell:nth-child(4n+2):hover{background-position:-120px -74px;} .grimoireSpell:nth-child(4n+2):active{background-position:-120px 74px;}'+
		'.grimoireSpell:nth-child(4n+3){background-position:-180px 0px;} .grimoireSpell:nth-child(4n+3):hover{background-position:-180px -74px;} .grimoireSpell:nth-child(4n+3):active{background-position:-180px 74px;}'+
		
		'.grimoireSpell:hover .grimoireIcon{top:-1px;}'+
		'.grimoireSpell.ready:hover .grimoireIcon{animation-name:bounce;animation-iteration-count:infinite;animation-duration:0.8s;}'+
		'.noFancy .grimoireSpell.ready:hover .grimoireIcon{animation:none;}'+
		
		'#grimoireInfo{text-align:center;font-size:11px;margin-top:12px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000;}'+
		'</style>';
		str+='<div id="grimoireBG"></div>';
		str+='<div id="grimoireContent">';
			str+='<div id="grimoireSpells">';//did you know adding class="shadowFilter" to this cancels the "z-index:1000000001" that displays the selected spell above the tooltip? stacking orders are silly https://philipwalton.com/articles/what-no-one-told-you-about-z-index/
			for (var i in M.spells)
			{
				var me=M.spells[i];
				var icon=me.icon||[28,12];
				str+='<div class="grimoireSpell titleFont" id="grimoireSpell'+me.id+'" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.spellTooltip('+me.id+')','this')+'><div class="usesIcon shadowFilter grimoireIcon" style="background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div><div class="grimoirePrice" id="grimoirePrice'+me.id+'">-</div></div>';
			}
			str+='</div>';
			var icon=[29,14];
			str+='<div id="grimoireBar" class="smallFramed meterContainer"><div '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.refillTooltip','this')+' id="grimoireLumpRefill" class="usesIcon shadowFilter lumpRefill" style="left:-40px;top:-17px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div><div id="grimoireBarFull" class="meter filling"></div><div id="grimoireBarText" class="titleFont"></div><div '+Game.getTooltip('<div style="padding:8px;width:300px;font-size:11px;text-align:center;">这是你的魔法仪。释放每个法术都需要魔法。<div class="line"></div>您的最大魔法量取决于您的<b>精灵塔</b>的数量, 以及它们的等级。<div class="line"></div>随着时间的推移，魔法会被重新填满。你的魔法仪越低，它的填充速度就越慢。</div>')+' style="position:absolute;left:0px;top:0px;right:0px;bottom:0px;"></div></div>';
			str+='<div id="grimoireInfo"></div>';
		str+='</div>';
		div.innerHTML=str;
		M.magicBarL=l('grimoireBar');
		M.magicBarFullL=l('grimoireBarFull');
		M.magicBarTextL=l('grimoireBarText');
		M.lumpRefill=l('grimoireLumpRefill');
		M.infoL=l('grimoireInfo');
		for (var i in M.spells)
		{
			var me=M.spells[i];
			AddEvent(l('grimoireSpell'+me.id),'click',function(spell){return function(){PlaySound('snd/tick.mp3');M.castSpell(spell);}}(me));
		}
		
		M.refillTooltip=function(){
			return '<div style="padding:8px;width:300px;font-size:11px;text-align:center;">点击来填充 <b>100 单位</b> 的魔法仪，花费 <span class="price lump">1 糖块</span>.'+
				(Game.canRefillLump()?'<br><small>(每 '+Game.sayTime((Game.getLumpRefillMax()/1000)*Game.fps,-1)+'可以重填一次)</small>':('<br><small class="red">(在 '+Game.sayTime((Game.getLumpRefillRemaining()/1000+1)*Game.fps,-1)+'后可重新使用)</small>'))+
			'</div>';
		};
		AddEvent(M.lumpRefill,'click',function(){
			if (M.magic<M.magicM)
			{Game.refillLump(1,function(){
				M.magic+=100;
				M.magic=Math.min(M.magic,M.magicM);
				PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
			});}
		});
		
		M.computeMagicM();
		M.magic=M.magicM;
		M.spellsCast=0;
		M.spellsCastTotal=0;
		
		//M.parent.switchMinigame(1);
	}
	M.save=function()
	{
		//output cannot use ",", ";" or "|"
		var str=''+
		parseFloat(M.magic)+' '+
		parseInt(Math.floor(M.spellsCast))+' '+
		parseInt(Math.floor(M.spellsCastTotal))+
		' '+parseInt(M.parent.onMinigame?'1':'0')
		;
		return str;
	}
	M.load=function(str)
	{
		//interpret str; called after .init
		//note : not actually called in the Game's load; see "minigameSave" in main.js
		if (!str) return false;
		var i=0;
		var spl=str.split(' ');
		M.computeMagicM();
		M.magic=parseFloat(spl[i++]||M.magicM);
		M.spellsCast=parseInt(spl[i++]||0);
		M.spellsCastTotal=parseInt(spl[i++]||0);
		var on=parseInt(spl[i++]||0);if (on && Game.ascensionMode!=1) M.parent.switchMinigame(1);
	}
	M.reset=function()
	{
		M.computeMagicM();
		M.magic=M.magicM;
		M.spellsCast=0;
	}
	M.logic=function()
	{
		//run each frame
		if (Game.T%5==0) {M.computeMagicM();}
		M.magicPS=Math.max(0.002,Math.pow(M.magic/Math.max(M.magicM,100),0.5))*0.002;
		M.magic+=M.magicPS;
		M.magic=Math.min(M.magic,M.magicM);
		if (Game.T%5==0)
		{
			for (var i in M.spells)
			{
				var me=M.spells[i];
				var cost=M.getSpellCost(me);
				l('grimoirePrice'+me.id).innerHTML=Beautify(cost);
				if (M.magic<cost) l('grimoireSpell'+me.id).className='grimoireSpell titleFont';
				else l('grimoireSpell'+me.id).className='grimoireSpell titleFont ready';
			}
		}
	}
	M.draw=function()
	{
		//run each draw frame
		M.magicBarTextL.innerHTML=Math.min(Math.floor(M.magicM),Beautify(M.magic))+'/'+Beautify(Math.floor(M.magicM))+(M.magic<M.magicM?(' (+'+Beautify((M.magicPS||0)*Game.fps,2)+'/s)'):'');
		M.magicBarFullL.style.width=((M.magic/M.magicM)*100)+'%';
		M.magicBarL.style.width=(M.magicM*3)+'px';
		M.infoL.innerHTML='施放法术 : '+Beautify(M.spellsCast)+' (总共 : '+Beautify(M.spellsCastTotal)+')';
	}
	M.init(l('rowSpecial'+M.parent.id));
}
var M=0;