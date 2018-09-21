var M={};
M.parent=Game.Objects['Farm'];
M.parent.minigame=M;
M.launch=function()
{
	var M=this;
	M.name=M.parent.minigameName;
	M.init=function(div)
	{
		//populate div with html and initialize values
		
		/*
			plants age from 0 to 100
			at one point in its lifespan, the plant becomes mature
			plants have 4 life stages once planted : bud, sprout, bloom, mature
			a plant may age faster by having a higher .ageTick
			if a plant has .ageTickR, a random number between 0 and that amount is added to .ageTick
			a plant may mature faster by having a lower .mature
			a plant's effects depend on how mature it is
			a plant can only reproduce when mature
		*/
		M.plants={
			'bakerWheat':{
				name:'面包师的小麦',
				icon:0,
				cost:1,
				costM:30,
				ageTick:7,
				ageTickR:2,
				mature:35,
				children:['bakerWheat','thumbcorn','cronerice','bakeberry','clover','goldenClover','chocoroot','tidygrass'],
				effsStr:'<div class="green">&bull; +1% 饼干产量</div>',
				q:'一种多产的作物，其坚韧的谷物用来做糕点用的面粉。',
				onHarvest:function(x,y,age)
				{
					if (age>=this.mature) M.dropUpgrade('Wheat slims',0.001);
				},
			},
			'thumbcorn':{
				name:'手指玉米',
				icon:1,
				cost:5,
				costM:100,
				ageTick:6,
				ageTickR:2,
				mature:20,
				children:['bakerWheat','thumbcorn','cronerice','gildmillet','glovemorel'],
				effsStr:'<div class="green">&bull; +2% 每次点击的饼干</div>',
				q:'一种形状奇特的变种玉米。从一颗种子中长出的的果实数量通常只有个位数。',
			},
			'cronerice':{
				name:'老妪稻谷',
				icon:2,
				cost:15,
				costM:250,
				ageTick:0.4,
				ageTickR:0.7,
				mature:55,
				children:['thumbcorn','gildmillet','elderwort','wardlichen'],
				effsStr:'<div class="green">&bull; +3% 老奶奶饼干产量</div>',
				q:'这作物带皱纹的茎不仅不像稻谷，甚至和它一点关系都没有；它看起来就像垂柳。',
			},
			'gildmillet':{
				name:'黄金小米',
				icon:3,
				cost:15,
				costM:1500,
				ageTick:2,
				ageTickR:1.5,
				mature:40,
				children:['clover','goldenClover','shimmerlily'],
				effsStr:'<div class="green">&bull; +1% 黄金饼干获得</div><div class="green">&bull; +0.1% 黄金饼干效果持续时间</div>',
				q:'一种古代的主要作物，以其金色的光泽而闻名。曾被用来为古代的国王和王后烤生日蛋糕。',
			},
			'clover':{
				name:'普通三叶草',
				icon:4,
				cost:25,
				costM:77777,
				ageTick:1,
				ageTickR:1.5,
				mature:35,
				children:['goldenClover','greenRot','shimmerlily'],
				effsStr:'<div class="green">&bull; +1% 黄金饼干出现频率</div>',
				q:'<i>三叶草</i>, 一种相当普通的三叶草，有生产四片叶子的倾向。 有些人认为这种情况很幸运。',
			},
			'goldenClover':{
				name:'金色三叶草',
				icon:5,
				cost:125,
				costM:777777777777,
				ageTick:4,
				ageTickR:12,
				mature:50,
				children:[],
				effsStr:'<div class="green">&bull; +3% 黄金饼干出现频率</div>',
				q:'通常的三叶草的变种，其叶绿素交换为纯有机金。 可悲的是短暂的，这种草药是一个进化的死胡同 - 但至少它看起来很漂亮。',
			},
			'shimmerlily':{
				name:'微光百合',
				icon:6,
				cost:60,
				costM:777777,
				ageTick:5,
				ageTickR:6,
				mature:70,
				children:['elderwort','whiskerbloom','chimerose','cheapcap'],
				effsStr:'<div class="green">&bull; +1% 黄金饼干获得</div><div class="green">&bull; +1% 黄金饼干出现频率</div><div class="green">&bull; +1% 随机掉落</div>',
				q:'这些小花在黎明时很容易找到，因为在水滴中折射的阳光会引起人们对纯白色花瓣的注意。',
			},
			'elderwort':{
				name:'老麦汁',
				icon:7,
				cost:60*3,
				costM:100000000,
				ageTick:0.3,
				ageTickR:0.5,
				mature:90,
				immortal:1,
				noContam:true,
				detailsStr:'Immortal',
				children:['everdaisy','ichorpuff','shriekbulb'],
				effsStr:'<div class="green">&bull; +1%愤怒饼干获得</div><div class="green">&bull; +1% 愤怒饼干出现频率</div><div class="green">&bull; +1% 老奶奶每秒饼干产量</div><div class="green">&bull; 不朽</div><div class="gray">&bull; 周围植物（3x3）的年龄增长3％</div>',
				q:'一种非常古老，久已遗忘的亚种或诺贝尔威斯，散发出一种奇怪的，令人兴奋的气味。 有一些传闻证据表明，这些没有经过分子老化。',
				onHarvest:function(x,y,age)
				{
					if (age>=this.mature) M.dropUpgrade('Elderwort biscuits',0.01);
				},
			},
			'bakeberry':{
				name:'Bakeberry',
				icon:8,
				cost:45,
				costM:100000000,
				ageTick:1,
				ageTickR:1,
				mature:50,
				children:['queenbeet'],
				effsStr:'<div class="green">&bull; +1% 饼干每秒产量</div><div class="green">&bull; harvest when mature for +30 minutes of CpS (max. 3% of bank)</div>',
				q:'A favorite among cooks, this large berry has a crunchy brown exterior and a creamy red center. Excellent in pies or chicken stews.',
				onHarvest:function(x,y,age)
				{
					if (age>=this.mature)
					{
						var moni=Math.min(Game.cookies*0.03,Game.cookiesPs*60*30);
						if (moni!=0)
						{
							Game.Earn(moni);
							Game.Popup('(Bakeberry)<br>+'+Beautify(moni)+' cookies!',Game.mouseX,Game.mouseY);
						}
						M.dropUpgrade('Bakeberry cookies',0.015);
					}
				},
			},
			'chocoroot':{
				name:'Chocoroot',
				icon:9,
				cost:15,
				costM:100000,
				ageTick:4,
				ageTickR:0,
				mature:25,
				detailsStr:'Predictable growth',
				children:['whiteChocoroot','drowsyfern','queenbeet'],
				effsStr:'<div class="green">&bull; +1% 饼干每秒产量</div><div class="green">&bull; 成熟时收获了3分钟的饼干秒出了（最高不超过3%的银行产量）</div><div class="green">&bull; 可预见的增长</div>',
				q:'一种涂有粘稠甜味物质的汤姆荆棘。 未知的遗传祖先。 孩子们经常从田里采摘这些作为零食。',
				onHarvest:function(x,y,age)
				{
					if (age>=this.mature)
					{
						var moni=Math.min(Game.cookies*0.03,Game.cookiesPs*60*3);
						if (moni!=0)
						{
							Game.Earn(moni);
							Game.Popup('(Chocoroot)<br>+'+Beautify(moni)+' cookies!',Game.mouseX,Game.mouseY);
						}
					}
				},
			},
			'whiteChocoroot':{
				name:'White chocoroot',
				icon:10,
				cost:15,
				costM:100000,
				ageTick:4,
				ageTickR:0,
				mature:25,
				detailsStr:'Predictable growth',
				children:['whiskerbloom','tidygrass'],
				effsStr:'<div class="green">&bull; +1% golden cookie gains</div><div class="green">&bull; harvest when mature for +3 minutes of CpS (max. 3% of bank)</div><div class="green">&bull; predictable growth</div>',
				q:'A pale, even sweeter variant of the chocoroot. Often impedes travelers with its twisty branches.',
				onHarvest:function(x,y,age)
				{
					if (age>=this.mature)
					{
						var moni=Math.min(Game.cookies*0.03,Game.cookiesPs*60*3);
						if (moni!=0)
						{
							Game.Earn(moni);
							Game.Popup('(White chocoroot)<br>+'+Beautify(moni)+' cookies!',Game.mouseX,Game.mouseY);
						}
					}
				},
			},
			
			'whiteMildew':{
				name:'White mildew',
				fungus:true,
				icon:26,
				cost:20,
				costM:9999,
				ageTick:8,
				ageTickR:12,
				mature:70,
				detailsStr:'Spreads easily',
				children:['brownMold','whiteChocoroot','wardlichen','greenRot'],
				effsStr:'<div class="green">&bull; +1% 饼干每秒产量</div><div class="gray">&bull; 可以像棕色霉菌一样传播</div>',
				q:'一种常见的腐烂物，寄生在阴凉的土地上。生长在乳脂状的小胶囊里。闻起来很香，但很快就会枯萎。',
			},
			'brownMold':{
				name:'Brown mold',
				fungus:true,
				icon:27,
				cost:20,
				costM:9999,
				ageTick:8,
				ageTickR:12,
				mature:70,
				detailsStr:'Spreads easily',
				children:['whiteMildew','chocoroot','keenmoss','wrinklegill'],
				effsStr:'<div class="red">&bull; -1% 饼干每秒产量</div><div class="gray">&bull; may spread as white mildew</div>',
				q:'A common rot that infests shady plots of earth. Grows in odd reddish clumps. Smells bitter, but thankfully wilts quickly.',
			},
			
			'meddleweed':{
				name:'Meddleweed',
				weed:true,
				icon:29,
				cost:1,
				costM:10,
				ageTick:10,
				ageTickR:6,
				mature:50,
				contam:0.05,
				detailsStr:'Grows in empty tiles, spreads easily',
				children:['meddleweed','brownMold','crumbspore'],
				effsStr:'<div class="red">&bull; useless</div><div class="red">&bull; may overtake nearby plants</div><div class="gray">&bull; may sometimes drop spores when uprooted</div>',
				q:'The sign of a neglected farmland, this annoying weed spawns from unused dirt and may sometimes spread to other plants, killing them in the process.',
				onKill:function(x,y,age)
				{
					if (Math.random()<0.2*(age/100)) M.plot[y][x]=[M.plants[choose(['brownMold','crumbspore'])].id+1,0];
				},
			},
			
			'whiskerbloom':{
				name:'Whiskerbloom',
				icon:11,
				cost:20,
				costM:1000000,
				ageTick:2,
				ageTickR:2,
				mature:60,
				children:['chimerose','nursetulip'],
				effsStr:'<div class="green">&bull; +0.2% effects from milk</div>',
				q:'Squeezing the translucent pods makes them excrete a milky liquid, while producing a faint squeak akin to a cat\'s meow.',
			},
			'chimerose':{
				name:'Chimerose',
				icon:12,
				cost:15,
				costM:242424,
				ageTick:1,
				ageTickR:1.5,
				mature:30,
				children:['chimerose'],
				effsStr:'<div class="green">&bull; +1% reindeer gains</div><div class="green">&bull; +1% reindeer frequency</div>',
				q:'Originating in the greener flanks of polar mountains, this beautiful flower with golden accents is fragrant enough to make any room feel a little bit more festive.',
			},
			'nursetulip':{
				name:'Nursetulip',
				icon:13,
				cost:40,
				costM:1000000000,
				ageTick:0.5,
				ageTickR:2,
				mature:60,
				children:[],
				effsStr:'<div class="green">&bull; surrounding plants (3x3) are 20% more efficient</div><div class="red">&bull; -2% 饼干每秒产量</div>',
				q:'This flower grows an intricate root network that distributes nutrients throughout the surrounding soil. The reason for this seemingly altruistic behavior is still unknown.',
			},
			'drowsyfern':{
				name:'Drowsyfern',
				icon:14,
				cost:90,
				costM:100000,
				ageTick:0.05,
				ageTickR:0.1,
				mature:30,
				children:[],
				effsStr:'<div class="green">&bull; +3% 饼干每秒产量</div><div class="red">&bull; -5% cookies per click</div><div class="red">&bull; -10% golden cookie frequency</div>',
				q:'Traditionally used to brew a tea that guarantees a good night of sleep.',
				onHarvest:function(x,y,age)
				{
					if (age>=this.mature) M.dropUpgrade('Fern tea',0.01);
				},
			},
			'wardlichen':{
				name:'Wardlichen',
				icon:15,
				cost:10,
				costM:10000,
				ageTick:5,
				ageTickR:4,
				mature:65,
				children:['wardlichen'],
				effsStr:'<div class="gray">&bull; 2% less wrath cookies</div><div class="gray">&bull; wrinklers spawn 15% slower</div>',
				q:'The metallic stench that emanates from this organism has been known to keep insects and slugs away.',
			},
			'keenmoss':{
				name:'Keenmoss',
				icon:16,
				cost:50,
				costM:1000000,
				ageTick:4,
				ageTickR:5,
				mature:65,
				children:['drowsyfern','wardlichen','keenmoss'],
				effsStr:'<div class="green">&bull; +3% random drops</div>',
				q:'Fuzzy to the touch and of a vibrant green. In plant symbolism, keenmoss is associated with good luck for finding lost objects.',
			},
			'queenbeet':{
				name:'Queenbeet',
				icon:17,
				cost:60*1.5,
				costM:1000000000,
				ageTick:1,
				ageTickR:0.4,
				mature:80,
				noContam:true,
				children:['duketater','queenbeetLump','shriekbulb'],
				effsStr:'<div class="green">&bull; +0.3% golden cookie effect duration</div><div class="red">&bull; -2% 饼干每秒产量</div><div class="green">&bull; harvest when mature for +1 hour of CpS (max. 6% of bank)</div>',
				q:'A delicious taproot used to prepare high-grade white sugar. Entire countries once went to war over these.',
				onHarvest:function(x,y,age)
				{
					if (age>=this.mature)
					{
						var moni=Math.min(Game.cookies*0.06,Game.cookiesPs*60*60);
						if (moni!=0)
						{
							Game.Earn(moni);
							Game.Popup('(Queenbeet)<br>+'+Beautify(moni)+' cookies!',Game.mouseX,Game.mouseY);
						}
					}
				},
			},
			'queenbeetLump':{
				name:'Juicy queenbeet',
				icon:18,
				plantable:false,
				cost:60*2,
				costM:1000000000000,
				ageTick:0.04,
				ageTickR:0.08,
				mature:85,
				noContam:true,
				children:[],
				effsStr:'<div class="red">&bull; -10% 饼干每秒产量</div><div class="red">&bull; surrounding plants (3x3) are 20% less efficient</div><div class="green">&bull; harvest when mature for a sugar lump</div>',
				q:'A delicious taproot used to prepare high-grade white sugar. Entire countries once went to war over these.<br>It looks like this one has grown especially sweeter and juicier from growing in close proximity to other queenbeets.',
				onHarvest:function(x,y,age)
				{
					if (age>=this.mature)
					{
						Game.gainLumps(1);
						popup='(Juicy queenbeet)<br>Sweet!<div style="font-size:65%;">Found 1 sugar lump!</div>';
					}
				},
			},
			'duketater':{
				name:'Duketater',
				icon:19,
				cost:60*8,
				costM:1000000000000,
				ageTick:0.4,
				ageTickR:0.1,
				mature:95,
				noContam:true,
				children:['shriekbulb'],
				effsStr:'<div class="green">&bull; harvest when mature for +2 hours of CpS (max. 8% of bank)</div>',
				q:'A rare, rich-tasting tuber fit for a whole meal, as long as its strict harvesting schedule is respected. Its starch has fascinating baking properties.',
				onHarvest:function(x,y,age)
				{
					if (age>=this.mature)
					{
						var moni=Math.min(Game.cookies*0.08,Game.cookiesPs*60*60*2);
						if (moni!=0)
						{
							Game.Earn(moni);
							Game.Popup('(Duketater)<br>+'+Beautify(moni)+' cookies!',Game.mouseX,Game.mouseY);
						}
						M.dropUpgrade('Duketater cookies',0.005);
					}
				},
			},
			'crumbspore':{
				name:'Crumbspore',
				fungus:true,
				icon:20,
				cost:10,
				costM:999,
				ageTick:3,
				ageTickR:3,
				mature:65,
				contam:0.03,
				noContam:true,
				detailsStr:'Spreads easily',
				children:['crumbspore','glovemorel','cheapcap','doughshroom','wrinklegill','ichorpuff'],
				effsStr:'<div class="green">&bull; explodes into up to 1 minute of CpS at the end of its lifecycle (max. 1% of bank)</div><div class="red">&bull; may overtake nearby plants</div>',
				q:'An archaic mold that spreads its spores to the surrounding dirt through simple pod explosion.',
				onDie:function(x,y)
				{
					var moni=Math.min(Game.cookies*0.01,Game.cookiesPs*60)*Math.random();
					if (moni!=0)
					{
						Game.Earn(moni);
						Game.Popup('(Crumbspore)<br>+'+Beautify(moni)+' cookies!',Game.mouseX,Game.mouseY);
					}
				},
			},
			'doughshroom':{
				name:'Doughshroom',
				fungus:true,
				icon:24,
				cost:100,
				costM:100000000,
				ageTick:1,
				ageTickR:2,
				mature:85,
				contam:0.03,
				noContam:true,
				detailsStr:'Spreads easily',
				children:['crumbspore','doughshroom','foolBolete','shriekbulb'],
				effsStr:'<div class="green">&bull; explodes into up to 5 minutes of CpS at the end of its lifecycle (max. 3% of bank)</div><div class="red">&bull; may overtake nearby plants</div>',
				q:'Jammed full of warm spores; some forest walkers often describe the smell as similar to passing by a bakery.',
				onDie:function(x,y)
				{
					var moni=Math.min(Game.cookies*0.03,Game.cookiesPs*60*5)*Math.random();
					if (moni!=0)
					{
						Game.Earn(moni);
						Game.Popup('(Doughshroom)<br>+'+Beautify(moni)+' cookies!',Game.mouseX,Game.mouseY);
					}
				},
			},
			'glovemorel':{
				name:'Glovemorel',
				fungus:true,
				icon:21,
				cost:30,
				costM:10000,
				ageTick:3,
				ageTickR:18,
				mature:80,
				children:[],
				effsStr:'<div class="green">&bull; +4% cookies per click</div><div class="green">&bull; +1% cursor CpS</div><div class="red">&bull; -1% 饼干每秒产量</div>',
				q:'Touching its waxy skin reveals that the interior is hollow and uncomfortably squishy.',
			},
			'cheapcap':{
				name:'Cheapcap',
				fungus:true,
				icon:22,
				cost:40,
				costM:100000,
				ageTick:6,
				ageTickR:16,
				mature:40,
				children:[],
				effsStr:'<div class="green">&bull; buildings and upgrades are 0.2% cheaper</div><div class="red">&bull; cannot handle cold climates; 15% chance to die when frozen</div>',
				q:'Small, tough, and good in omelettes. Some historians propose that the heads of dried cheapcaps were once used as currency in some bronze age societies.',
			},
			'foolBolete':{
				name:'Fool\'s bolete',
				fungus:true,
				icon:23,
				cost:15,
				costM:10000,
				ageTick:5,
				ageTickR:25,
				mature:50,
				children:[],
				effsStr:'<div class="green">&bull; +2% golden cookie frequency</div><div class="red">&bull; -5% golden cookie gains</div><div class="red">&bull; -2% golden cookie duration</div><div class="red">&bull; -2% golden cookie effect duration</div>',
				q:'Named for its ability to fool mushroom pickers. The fool\'s bolete is not actually poisonous, it\'s just extremely bland.',
			},
			'wrinklegill':{
				name:'Wrinklegill',
				fungus:true,
				icon:25,
				cost:20,
				costM:1000000,
				ageTick:1,
				ageTickR:3,
				mature:65,
				children:['elderwort','shriekbulb'],
				effsStr:'<div class="gray">&bull; wrinklers spawn 2% faster</div><div class="gray">&bull; wrinklers eat 1% more</div>',
				q:'This mushroom\'s odor resembles that of a well-done steak, and is said to whet the appetite - making one\'s stomach start gurgling within seconds.',
			},
			'greenRot':{
				name:'Green rot',
				fungus:true,
				icon:28,
				cost:60,
				costM:1000000,
				ageTick:12,
				ageTickR:13,
				mature:65,
				children:['keenmoss','foolBolete'],
				effsStr:'<div class="green">&bull; +0.5% golden cookie duration</div><div class="green">&bull; +1% golden cookie frequency</div><div class="green">&bull; +1% random drops</div>',
				q:'This short-lived mold is also known as "emerald pebbles", and is considered by some as a pseudo-gem that symbolizes good fortune.',
				onHarvest:function(x,y,age)
				{
					if (age>=this.mature) M.dropUpgrade('Green yeast digestives',0.005);
				},
			},
			'shriekbulb':{
				name:'Shriekbulb',
				icon:30,
				cost:60,
				costM:4444444444444,
				ageTick:3,
				ageTickR:1,
				mature:60,
				noContam:true,
				detailsStr:'The unfortunate result of some plant combinations',
				children:['shriekbulb'],
				effsStr:'<div class="red">&bull; -2% 饼干每秒产量</div><div class="red">&bull; surrounding plants (3x3) are 5% less efficient</div>',
				q:'A nasty vegetable with a dreadful quirk : its flesh resonates with a high-pitched howl whenever it is hit at the right angle by sunlight, moonlight, or even a slight breeze.',
			},
			'tidygrass':{
				name:'Tidygrass',
				icon:31,
				cost:90,
				costM:100000000000000,
				ageTick:0.5,
				ageTickR:0,
				mature:40,
				children:['everdaisy'],
				effsStr:'<div class="green">&bull; surrounding tiles (5x5) develop no weeds or fungus</div>',
				q:'The molecules this grass emits are a natural weedkiller. Its stems grow following a predictable pattern, making it an interesting -if expensive- choice for a lawn grass.',
			},
			'everdaisy':{
				name:'Everdaisy',
				icon:32,
				cost:180,
				costM:100000000000000000000,
				ageTick:0.3,
				ageTickR:0,
				mature:75,
				noContam:true,
				immortal:1,
				detailsStr:'Immortal',
				children:[],
				effsStr:'<div class="green">&bull; surrounding tiles (3x3) develop no weeds or fungus</div><div class="green">&bull; immortal</div>',
				q:'While promoted by some as a superfood owing to its association with longevity and intriguing geometry, this elusive flower is actually mildly toxic.',
			},
			'ichorpuff':{
				name:'Ichorpuff',
				fungus:true,
				icon:33,
				cost:120,
				costM:987654321,
				ageTick:1,
				ageTickR:1.5,
				mature:35,
				children:[],
				effsStr:'<div class="green">&bull; surrounding plants (3x3) age half as fast</div><div class="red">&bull; surrounding plants (3x3) are half as efficient</div>',
				q:'This puffball mushroom contains sugary spores, but it never seems to mature to bursting on its own. Surrounding plants under its influence have a very slow metabolism, reducing their effects but lengthening their lifespan.',
				onHarvest:function(x,y,age)
				{
					if (age>=this.mature) M.dropUpgrade('Ichor syrup',0.005);
				},
			},
		};
		M.plantsById=[];var n=0;
		for (var i in M.plants)
		{
			M.plants[i].unlocked=0;
			M.plants[i].id=n;
			M.plants[i].key=i;
			M.plants[i].matureBase=M.plants[i].mature;
			M.plantsById[n]=M.plants[i];
			if (typeof M.plants[i].plantable==='undefined') {M.plants[i].plantable=true;}
			n++;
		}
		M.plantsN=M.plantsById.length;
		M.plantsUnlockedN=0;
		M.getUnlockedN=function()
		{
			M.plantsUnlockedN=0;
			for (var i in M.plants){if (M.plants[i].unlocked) M.plantsUnlockedN++;}
			if (M.plantsUnlockedN>=M.plantsN)
			{
				Game.Win('Keeper of the conservatory');
				l('gardenTool-3').classList.remove('locked');
			}
			else l('gardenTool-3').classList.add('locked');
			
			return M.plantsUnlockedN;
		}
		
		M.dropUpgrade=function(upgrade,rate)
		{
			if (!Game.Has(upgrade) && Math.random()<=rate*Game.dropRateMult()*(Game.HasAchiev('Seedless to nay')?1.05:1))
			{
				Game.Unlock(upgrade);
			}
		}
		
		M.computeMatures=function()
		{
			var mult=1;
			if (Game.HasAchiev('Seedless to nay')) mult=0.95;
			for (var i in M.plants)
			{
				M.plants[i].mature=M.plants[i].matureBase*mult;
			}
		}
		
		M.plantContam={};
		for (var i in M.plants)
		{
			if (M.plants[i].contam) M.plantContam[M.plants[i].key]=M.plants[i].contam;
		}
		
		M.getMuts=function(neighs,neighsM)
		{
			//get possible mutations given a list of neighbors
			//note : neighs stands for neighbors, not horsey noises
			var muts=[];
			
			if (neighsM['bakerWheat']>=2) muts.push(['bakerWheat',0.2],['thumbcorn',0.05],['bakeberry',0.001]);
			if (neighsM['bakerWheat']>=1 && neighsM['thumbcorn']>=1) muts.push(['cronerice',0.01]);
				if (neighsM['thumbcorn']>=2) muts.push(['thumbcorn',0.1],['bakerWheat',0.05]);
			if (neighsM['cronerice']>=1 && neighsM['thumbcorn']>=1) muts.push(['gildmillet',0.03]);
				if (neighsM['cronerice']>=2) muts.push(['thumbcorn',0.02]);
			if (neighsM['bakerWheat']>=1 && neighsM['gildmillet']>=1) muts.push(['clover',0.03],['goldenClover',0.0007]);
			if (neighsM['clover']>=1 && neighsM['gildmillet']>=1) muts.push(['shimmerlily',0.02]);
				if (neighsM['clover']>=2 && neighs['clover']<5) muts.push(['clover',0.007],['goldenClover',0.0001]);
				if (neighsM['clover']>=4) muts.push(['goldenClover',0.0007]);
			if (neighsM['shimmerlily']>=1 && neighsM['cronerice']>=1) muts.push(['elderwort',0.01]);
				if (neighsM['wrinklegill']>=1 && neighsM['cronerice']>=1) muts.push(['elderwort',0.002]);
			if (neighsM['bakerWheat']>=1 && neighs['brownMold']>=1) muts.push(['chocoroot',0.1]);
			if (neighsM['chocoroot']>=1 && neighs['whiteMildew']>=1) muts.push(['whiteChocoroot',0.1]);
			if (neighsM['whiteMildew']>=1 && neighs['brownMold']<=1) muts.push(['brownMold',0.5]);
			if (neighsM['brownMold']>=1 && neighs['whiteMildew']<=1) muts.push(['whiteMildew',0.5]);
			if (neighsM['meddleweed']>=1 && neighs['meddleweed']<=3) muts.push(['meddleweed',0.15]);
			
			if (neighsM['shimmerlily']>=1 && neighsM['whiteChocoroot']>=1) muts.push(['whiskerbloom',0.01]);
			if (neighsM['shimmerlily']>=1 && neighsM['whiskerbloom']>=1) muts.push(['chimerose',0.05]);
				if (neighsM['chimerose']>=2) muts.push(['chimerose',0.005]);
			if (neighsM['whiskerbloom']>=2) muts.push(['nursetulip',0.05]);
			if (neighsM['chocoroot']>=1 && neighsM['keenmoss']>=1) muts.push(['drowsyfern',0.005]);
			if ((neighsM['cronerice']>=1 && neighsM['keenmoss']>=1) || (neighsM['cronerice']>=1 && neighsM['whiteMildew']>=1)) muts.push(['wardlichen',0.005]);
				if (neighsM['wardlichen']>=1 && neighs['wardlichen']<2) muts.push(['wardlichen',0.05]);
			if (neighsM['greenRot']>=1 && neighsM['brownMold']>=1) muts.push(['keenmoss',0.1]);
				if (neighsM['keenmoss']>=1 && neighs['keenmoss']<2) muts.push(['keenmoss',0.05]);
			if (neighsM['chocoroot']>=1 && neighsM['bakeberry']>=1) muts.push(['queenbeet',0.01]);
				if (neighsM['queenbeet']>=8) muts.push(['queenbeetLump',0.001]);
			if (neighsM['queenbeet']>=2) muts.push(['duketater',0.001]);
			
				if (neighsM['crumbspore']>=1 && neighs['crumbspore']<=1) muts.push(['crumbspore',0.07]);
			if (neighsM['crumbspore']>=1 && neighsM['thumbcorn']>=1) muts.push(['glovemorel',0.02]);
			if (neighsM['crumbspore']>=1 && neighsM['shimmerlily']>=1) muts.push(['cheapcap',0.04]);
			if (neighsM['doughshroom']>=1 && neighsM['greenRot']>=1) muts.push(['foolBolete',0.04]);
			if (neighsM['crumbspore']>=2) muts.push(['doughshroom',0.005]);
				if (neighsM['doughshroom']>=1 && neighs['doughshroom']<=1) muts.push(['doughshroom',0.07]);
				if (neighsM['doughshroom']>=2) muts.push(['crumbspore',0.005]);
			if (neighsM['crumbspore']>=1 && neighsM['brownMold']>=1) muts.push(['wrinklegill',0.06]);
			if (neighsM['whiteMildew']>=1 && neighsM['clover']>=1) muts.push(['greenRot',0.05]);
			
			if (neighsM['wrinklegill']>=1 && neighsM['elderwort']>=1) muts.push(['shriekbulb',0.001]);
			if (neighsM['elderwort']>=5) muts.push(['shriekbulb',0.001]);
			if (neighs['duketater']>=3) muts.push(['shriekbulb',0.005]);
			if (neighs['doughshroom']>=4) muts.push(['shriekbulb',0.002]);
			if (neighsM['queenbeet']>=5) muts.push(['shriekbulb',0.001]);
				if (neighs['shriekbulb']>=1 && neighs['shriekbulb']<2) muts.push(['shriekbulb',0.005]);
			
			if (neighsM['bakerWheat']>=1 && neighsM['whiteChocoroot']>=1) muts.push(['tidygrass',0.002]);
			if (neighsM['tidygrass']>=3 && neighsM['elderwort']>=3) muts.push(['everdaisy',0.002]);
			if (neighsM['elderwort']>=1 && neighsM['crumbspore']>=1) muts.push(['ichorpuff',0.002]);
			
			return muts;
		}
		
		M.computeBoostPlot=function()
		{
			//some plants apply effects to surrounding tiles
			//this function computes those effects by creating a grid in which those effects stack
			for (var y=0;y<6;y++)
			{
				for (var x=0;x<6;x++)
				{
					//age mult, power mult, weed mult
					M.plotBoost[y][x]=[1,1,1];
				}
			}
			
			var effectOn=function(X,Y,s,mult)
			{
				for (var y=Math.max(0,Y-s);y<Math.min(6,Y+s+1);y++)
				{
					for (var x=Math.max(0,X-s);x<Math.min(6,X+s+1);x++)
					{
						if (X==x && Y==y) {}
						else
						{
							for (var i=0;i<mult.length;i++)
							{
								M.plotBoost[y][x][i]*=mult[i];
							}
						}
					}
				}
			}
			for (var y=0;y<6;y++)
			{
				for (var x=0;x<6;x++)
				{
					var tile=M.plot[y][x];
					if (tile[0]>0)
					{
						var me=M.plantsById[tile[0]-1];
						var name=me.key;
						var stage=0;
						if (tile[1]>=me.mature) stage=4;
						else if (tile[1]>=me.mature*0.666) stage=3;
						else if (tile[1]>=me.mature*0.333) stage=2;
						else stage=1;
						
						var soilMult=M.soilsById[M.soil].effMult;
						var mult=soilMult;
						
						if (stage==1) mult*=0.1;
						else if (stage==2) mult*=0.25;
						else if (stage==3) mult*=0.5;
						else mult*=1;
						
						//age mult, power mult, weed mult
						/*if (name=='elderwort') effectOn(x,y,1,[1+0.03*mult,1,1]);
						else if (name=='queenbeetLump') effectOn(x,y,1,[1,1-0.2*mult,1]);
						else if (name=='nursetulip') effectOn(x,y,1,[1,1+0.2*mult,1]);
						else if (name=='shriekbulb') effectOn(x,y,1,[1,1-0.05*mult,1]);
						else if (name=='tidygrass') effectOn(x,y,2,[1,1,0]);
						else if (name=='everdaisy') effectOn(x,y,1,[1,1,0]);
						else if (name=='ichorpuff') effectOn(x,y,1,[1-0.5*mult,1-0.5*mult,1]);*/
						
						var ageMult=1;
						var powerMult=1;
						var weedMult=1;
						var range=0;
						
						if (name=='elderwort') {ageMult=1.03;range=1;}
						else if (name=='queenbeetLump') {powerMult=0.8;range=1;}
						else if (name=='nursetulip') {powerMult=1.2;range=1;}
						else if (name=='shriekbulb') {powerMult=0.95;range=1;}
						else if (name=='tidygrass') {weedMult=0;range=2;}
						else if (name=='everdaisy') {weedMult=0;range=1;}
						else if (name=='ichorpuff') {ageMult=0.5;powerMult=0.5;range=1;}
						
						//by god i hope these are right
						if (ageMult>=1) ageMult=(ageMult-1)*mult+1; else if (mult>=1) ageMult=1/((1/ageMult)*mult); else ageMult=1-(1-ageMult)*mult;
						if (powerMult>=1) powerMult=(powerMult-1)*mult+1; else if (mult>=1) powerMult=1/((1/powerMult)*mult); else powerMult=1-(1-powerMult)*mult;
						
						if (range>0) effectOn(x,y,range,[ageMult,powerMult,weedMult]);
					}
				}
			}
		}
		
		M.computeEffs=function()
		{
			M.toCompute=false;
			var effs={
				cps:1,
				click:1,
				cursorCps:1,
				grandmaCps:1,
				goldenCookieGain:1,
				goldenCookieFreq:1,
				goldenCookieDur:1,
				goldenCookieEffDur:1,
				wrathCookieGain:1,
				wrathCookieFreq:1,
				wrathCookieDur:1,
				wrathCookieEffDur:1,
				reindeerGain:1,
				reindeerFreq:1,
				reindeerDur:1,
				itemDrops:1,
				milk:1,
				wrinklerSpawn:1,
				wrinklerEat:1,
				upgradeCost:1,
				buildingCost:1,
			};
			
			if (!M.freeze)
			{
				var soilMult=M.soilsById[M.soil].effMult;
				
				for (var y=0;y<6;y++)
				{
					for (var x=0;x<6;x++)
					{
						var tile=M.plot[y][x];
						if (tile[0]>0)
						{
							var me=M.plantsById[tile[0]-1];
							var name=me.key;
							var stage=0;
							if (tile[1]>=me.mature) stage=4;
							else if (tile[1]>=me.mature*0.666) stage=3;
							else if (tile[1]>=me.mature*0.333) stage=2;
							else stage=1;
							
							var mult=soilMult;
							
							if (stage==1) mult*=0.1;
							else if (stage==2) mult*=0.25;
							else if (stage==3) mult*=0.5;
							else mult*=1;
							
							mult*=M.plotBoost[y][x][1];
							
							if (name=='bakerWheat') effs.cps+=0.01*mult;
							else if (name=='thumbcorn') effs.click+=0.02*mult;
							else if (name=='cronerice') effs.grandmaCps+=0.03*mult;
							else if (name=='gildmillet') {effs.goldenCookieGain+=0.01*mult;effs.goldenCookieEffDur+=0.001*mult;}
							else if (name=='clover') effs.goldenCookieFreq+=0.01*mult;
							else if (name=='goldenClover') effs.goldenCookieFreq+=0.03*mult;
							else if (name=='shimmerlily') {effs.goldenCookieGain+=0.01*mult;effs.goldenCookieFreq+=0.01*mult;effs.itemDrops+=0.01*mult;}
							else if (name=='elderwort') {effs.wrathCookieGain+=0.01*mult;effs.wrathCookieFreq+=0.01*mult;effs.grandmaCps+=0.01*mult;}
							else if (name=='bakeberry') effs.cps+=0.01*mult;
							else if (name=='chocoroot') effs.cps+=0.01*mult;
							else if (name=='whiteChocoroot') effs.goldenCookieGain+=0.01*mult;
							
							else if (name=='whiteMildew') effs.cps+=0.01*mult;
							else if (name=='brownMold') effs.cps*=1-0.01*mult;
							
							else if (name=='meddleweed') {}
							
							else if (name=='whiskerbloom') effs.milk+=0.002*mult;
							else if (name=='chimerose') {effs.reindeerGain+=0.01*mult;effs.reindeerFreq+=0.01*mult;}
							
							else if (name=='nursetulip') {effs.cps*=1-0.02*mult;}
							else if (name=='drowsyfern') {effs.cps+=0.03*mult;effs.click*=1-0.05*mult;effs.goldenCookieFreq*=1-0.1*mult;}
							else if (name=='wardlichen') {effs.wrinklerSpawn*=1-0.15*mult;effs.wrathCookieFreq*=1-0.02*mult;}
							else if (name=='keenmoss') {effs.itemDrops+=0.03*mult;}
							else if (name=='queenbeet') {effs.goldenCookieEffDur+=0.003*mult;effs.cps*=1-0.02*mult;}
							else if (name=='queenbeetLump') {effs.cps*=1-0.1*mult;}
							else if (name=='glovemorel') {effs.click+=0.04*mult;effs.cursorCps+=0.01*mult;effs.cps*=1-0.01*mult;}
							else if (name=='cheapcap') {effs.upgradeCost*=1-0.002*mult;effs.buildingCost*=1-0.002*mult;}
							else if (name=='foolBolete') {effs.goldenCookieFreq+=0.02*mult;effs.goldenCookieGain*=1-0.05*mult;effs.goldenCookieDur*=1-0.02*mult;effs.goldenCookieEffDur*=1-0.02*mult;}
							else if (name=='wrinklegill') {effs.wrinklerSpawn+=0.02*mult;effs.wrinklerEat+=0.01*mult;}
							else if (name=='greenRot') {effs.goldenCookieDur+=0.005*mult;effs.goldenCookieFreq+=0.01*mult;effs.itemDrops+=0.01*mult;}
							else if (name=='shriekbulb') {effs.cps*=1-0.02*mult;}
						}
					}
				}
			}
			M.effs=effs;
			Game.recalculateGains=1;
		}
		
		
		M.soils={
			'dirt':{
				name:'泥土',
				icon:0,
				tick:5,
				effMult:1,
				weedMult:1,
				req:0,
				effsStr:'<div class="gray">&bull; 一个周期有 <b>5 分钟</b></div>',
				q:'简单而平常的泥土，你可以在自然环境中随便挖到。',
			},
			'fertilizer':{
				name:'肥料',
				icon:1,
				tick:3,
				effMult:0.75,
				weedMult:1.2,
				req:50,
				effsStr:'<div class="gray">&bull; 一个周期有 <b>3 分钟</b></div><div class="red">&bull; 作物效果 <b>-25%</b></div><div class="red">&bull; 杂草出现概率增加 <b>20%</b></div>',
				q:'有新鲜肥料的有益健康的土壤。植物长得快但效果低。',
			},
			'clay':{
				name:'黏土',
				icon:2,
				tick:15,
				effMult:1.25,
				weedMult:1,
				req:100,
				effsStr:'<div class="gray">&bull; 一个周期有 <b>15 分钟</b></div><div class="green">&bull; 作物效果 <b>+25%</b></div>',
				q:'土壤肥沃，保水性能好。植物生长缓慢但效果更高。',
			},
			'pebbles':{
				name:'Pebbles',
				icon:3,
				tick:5,
				effMult:0.25,
				weedMult:0.1,
				req:200,
				effsStr:'<div class="gray">&bull; 一个周期有 <b>5 分钟</b></div><div class="red">&bull; 作物效果 <b>-75%</b></div><div class="green">&bull; 作物死亡时有<b>35% 概率</b>自动收获种子</div><div class="green">&bull; 杂草出现概率减少 <b>10 倍</b></div>',
				q:'由小岩石紧密堆积而成的干燥土壤。对植物健康没有多大帮助，但任何从庄稼上掉下来的东西都很容易找回。<br>如果你是那些只想寻找新种子而不必过多照料花园的农民之一，那很有用。',
			},
			'woodchips':{
				name:'Wood chips',
				icon:4,
				tick:5,
				effMult:0.25,
				weedMult:0.1,
				req:300,
				effsStr:'<div class="gray">&bull; 一个周期有 <b>5 分钟</b></div><div class="red">&bull; 作物效果 <b>-75%</b></div><div class="green">&bull; 植物发育与变异变为 <b>3 倍以上</b></div><div class="green">&bull; 杂草出现概率减少 <b>10 倍</b></div>',
				q:'由树皮和木屑制成的土壤。有助于幼芽生长，而不是成熟植物。',
			},
		};
		M.soilsById=[];var n=0;for (var i in M.soils){M.soils[i].id=n;M.soils[i].key=i;M.soilsById[n]=M.soils[i];n++;}
		
		
		M.tools={
			'info':{
				name:'花园信息',
				icon:3,
				desc:'-',
				descFunc:function()
				{
					var str='';
					if (M.freeze) str='你的花园冻住了，不会产生任何效果。';
					else
					{
						var effs={
							cps:{n:'饼干每秒产量'},
							click:{n:'饼干/点击'},
							cursorCps:{n:'cursor CpS'},
							grandmaCps:{n:'grandma CpS'},
							goldenCookieGain:{n:'golden cookie gains'},
							goldenCookieFreq:{n:'golden cookie frequency'},
							goldenCookieDur:{n:'golden cookie duration'},
							goldenCookieEffDur:{n:'golden cookie effect duration'},
							wrathCookieGain:{n:'wrath cookie gains'},
							wrathCookieFreq:{n:'wrath cookie frequency'},
							wrathCookieDur:{n:'wrath cookie duration'},
							wrathCookieEffDur:{n:'wrath cookie effect duration'},
							reindeerGain:{n:'reindeer gains'},
							reindeerFreq:{n:'reindeer cookie frequency'},
							reindeerDur:{n:'reindeer cookie duration'},
							itemDrops:{n:'random drops'},
							milk:{n:'milk effects'},
							wrinklerSpawn:{n:'wrinkler spawn rate'},
							wrinklerEat:{n:'wrinkler appetite'},
							upgradeCost:{n:'upgrade costs',rev:true},
							buildingCost:{n:'building costs',rev:true},
						};
						
						var effStr='';
						for (var i in M.effs)
						{
							if (M.effs[i]!=1 && effs[i])
							{
								var amount=(M.effs[i]-1)*100;
								effStr+='<div style="font-size:10px;margin-left:64px;"><b>&bull; '+effs[i].n+' :</b> <span class="'+((amount*(effs[i].rev?-1:1))>0?'green':'red')+'">'+(amount>0?'+':'-')+Beautify(Math.abs(M.effs[i]-1)*100,2)+'%</span></div>';
							}
						}
						if (effStr=='') effStr='<div style="font-size:10px;margin-left:64px;"><b>None.</b></div>';
						str+='<div>你所有的植物的联合作用 :</div>'+effStr;
					}
					str+='<div class="line"></div>';
					str+='<img src="img/gardenTip.png" style="float:right;margin:0px 0px 8px 8px;"/><small style="line-height:100%;">&bull; 你可以通过把种子种在一起来使它们杂交；新的作物会在相邻的空土地上生长。<br>&bull; 通过收获成熟作物来解锁新种子。<br>&bull; 你转生后，你的花园作物会重置，但是你将保留所有已解锁的种子。<br>&bull; 游戏关闭后，花园没有效果，作物也不会生长。</small>';
					return str;
				},
				func:function(){},
			},
			'harvestAll':{
				name:'收获所有',
				icon:0,
				descFunc:function(){return '马上收获花园里的所有作物。<div class="line"></div>'+((Game.keys[16] && Game.keys[17])?'<b>你正在按着 shift+ctrl.</b> 只会收获成熟的、死亡的作物。':'Shift+ctrl+单击 来只收获成熟的、死亡的作物。');},
				func:function(){
					PlaySound('snd/toneTick.mp3');
					/*if (M.freeze){return false;}*/
					if (Game.keys[16] && Game.keys[17]) M.harvestAll(0,1,1);//ctrl & shift, harvest only mature non-immortal plants
					else M.harvestAll();
				},
			},
			'freeze':{
				name:'冰冻',
				icon:1,
				descFunc:function()
				{
					return '低温保护你的花园。<br>作物将不再生长，发育及死亡；它们也将不会提供加成。<br>土壤无法改变。<div class="line"></div>使用这功能将有效地暂停你的花园。<div class="line"></div>';//<span class="red">'+((M.nextFreeze>Date.now())?'You will be able to freeze your garden again in '+Game.sayTime((M.nextFreeze-Date.now())/1000*30+30,-1)+'.':'After unfreezing your garden, you must wait 10 minutes to freeze it again.')+'</span>
				},
				func:function(){
					//if (!M.freeze && M.nextFreeze>Date.now()) return false;
					PlaySound('snd/toneTick.mp3');
					M.freeze=(M.freeze?0:1);
					if (M.freeze)
					{
						M.computeEffs();
						PlaySound('snd/freezeGarden.mp3');
						this.classList.add('on');
						l('gardenContent').classList.add('gardenFrozen');
						
						
						for (var y=0;y<6;y++)
						{
							for (var x=0;x<6;x++)
							{
								var tile=M.plot[y][x];
								if (tile[0]>0)
								{
									var me=M.plantsById[tile[0]-1];
									var age=tile[1];
									if (me.key=='cheapcap' && Math.random()<0.15)
									{
										M.plot[y][x]=[0,0];
										if (me.onKill) me.onKill(x,y,age);
										M.toRebuild=true;
									}
								}
							}
						}
					}
					else
					{
						//M.nextFreeze=Date.now()+(Game.Has('Turbo-charged soil')?1:(1000*60*10));
						M.computeEffs();
						this.classList.remove('on');
						l('gardenContent').classList.remove('gardenFrozen');
					}
				},
				isOn:function(){if (M.freeze){l('gardenContent').classList.add('gardenFrozen');}else{l('gardenContent').classList.remove('gardenFrozen');}return M.freeze;},
			},
			'convert':{
				name:'Sacrifice garden',
				icon:2,
				desc:'A swarm of sugar hornets comes down on your garden, <span class="red">destroying every plant as well as every seed you\'ve unlocked</span> - leaving only a Baker\'s wheat seed.<br>In exchange, they will grant you <span class="green"><b>10</b> sugar lumps</span>.<br>This action is only available with a complete seed log.',
				func:function(){PlaySound('snd/toneTick.mp3');M.askConvert();},
				isDisplayed:function(){if (M.plantsUnlockedN>=M.plantsN) return true; else return false;},
			},
		};
		M.toolsById=[];var n=0;for (var i in M.tools){M.tools[i].id=n;M.tools[i].key=i;M.toolsById[n]=M.tools[i];n++;}

		
		M.plot=[];
		for (var y=0;y<6;y++)
		{
			M.plot[y]=[];
			for (var x=0;x<6;x++)
			{
				M.plot[y][x]=[0,0];
			}
		}
		M.plotBoost=[];
		for (var y=0;y<6;y++)
		{
			M.plotBoost[y]=[];
			for (var x=0;x<6;x++)
			{
				//age mult, power mult, weed mult
				M.plotBoost[y][x]=[1,1,1];
			}
		}
		
		M.tileSize=40;
		
		M.seedSelected=-1;
		
		M.soil=0;
		M.nextSoil=0;//timestamp for when soil will be ready to change again
		
		M.stepT=1;//in seconds
		M.nextStep=0;//timestamp for next step tick
		
		M.harvests=0;
		M.harvestsTotal=0;
		
		M.loopsMult=1;
		
		M.toRebuild=false;
		M.toCompute=false;
		
		M.freeze=0;
		M.nextFreeze=0;//timestamp for when we can freeze again; unused, but still stored
		
		M.getCost=function(me)
		{
			if (Game.Has('涡轮增压土壤')) return 0;
			return Math.max(me.costM,Game.cookiesPs*me.cost*60)*(Game.HasAchiev('Seedless to nay')?0.95:1);
		}
		
		M.getPlantDesc=function(me)
		{
			var children='';
			if (me.children.length>0)
			{
				children+='<div class="shadowFilter" style="display:inline-block;">';
				for (var i in me.children)
				{
					if (!M.plants[me.children[i]]) console.log('No plant named '+me.children[i]);
					else
					{
						var it=M.plants[me.children[i]];
						if (it.unlocked) children+='<div class="gardenSeedTiny" style="background-position:'+(-0*48)+'px '+(-it.icon*48)+'px;"></div>';
						else children+='<div class="gardenSeedTiny" style="background-image:url(img/icons.png?v='+Game.version+');background-position:'+(-0*48)+'px '+(-7*48)+'px;opacity:0.35;"></div>';
					}
				}
				children+='</div>';
			}
			
			return '<div class="description">'+
						(!me.immortal?('<div style="margin:6px 0px;font-size:11px;"><b>平均寿命 :</b> '+Game.sayTime(((100/(me.ageTick+me.ageTickR/2))*M.stepT)*30,-1)+' <small>('+Beautify(Math.ceil((100/((me.ageTick+me.ageTickR/2)))*(1)))+' 周期)</small></div>'):'')+
						'<div style="margin:6px 0px;font-size:11px;"><b>平均成熟时间 :</b> '+Game.sayTime(((100/((me.ageTick+me.ageTickR/2)))*(me.mature/100)*M.stepT)*30,-1)+' <small>('+Beautify(Math.ceil((100/((me.ageTick+me.ageTickR/2)))*(me.mature/100)))+' 周期)</small></div>'+
						(me.weed?'<div style="margin:6px 0px;font-size:11px;"><b>是杂草</b></div>':'')+
						(me.fungus?'<div style="margin:6px 0px;font-size:11px;"><b>是一种真菌</b></div>':'')+
						(me.detailsStr?('<div style="margin:6px 0px;font-size:11px;"><b>详情 :</b> '+me.detailsStr+'</div>'):'')+
						(children!=''?('<div style="margin:6px 0px;font-size:11px;"><b>可能的变异 :</b> '+children+'</div>'):'')+
						'<div class="line"></div>'+
						'<div style="margin:6px 0px;"><b>效果 :</b></div>'+
						'<div style="font-size:11px;font-weight:bold;">'+me.effsStr+'</div>'+
						(me.q?('<q>'+me.q+'</q>'):'')+
					'</div>';
		}
		M.canPlant=function(me)
		{
			if (Game.cookies>=M.getCost(me)) return true; else return false;
		}
		
		M.cursor=1;
		M.hideCursor=function()
		{
			M.cursor=0;
		}
		M.showCursor=function()
		{
			M.cursor=1;
		}
		
		M.soilTooltip=function(id)
		{
			return function(){
				var me=M.soilsById[id];
				var str='<div style="padding:8px 4px;min-width:350px;">'+
					(M.parent.amount<me.req?(
						'<div style="text-align:center;">这种土壤需要 '+me.req+' 个农场解锁。</div>'
					):('<div class="icon" style="background:url(img/gardenPlants.png?v='+Game.version+');float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-me.icon*48)+'px '+(-34*48)+'px;"></div>'+
					'<div><div class="name">'+me.name+'</div><div><small>'+((M.soil==me.id)?'你的种植区正在使用这种土壤。':(M.nextSoil>Date.now())?'你将在 '+Game.sayTime((M.nextSoil-Date.now())/1000*30+30,-1)+'后才能再次改变土壤.':'单击此处来为你的整片种植区使用这种土壤。')+'</small></div></div>'+
					'<div class="line"></div>'+
					'<div class="description">'+
						'<div style="margin:6px 0px;"><b>效果 :</b></div>'+
						'<div style="font-size:11px;font-weight:bold;">'+me.effsStr+'</div>'+
						(me.q?('<q>'+me.q+'</q>'):'')+
					'</div>'))+
				'</div>';
				return str;
			};
		}
		M.seedTooltip=function(id)
		{
			return function(){
				var me=M.plantsById[id];
				var str='<div style="padding:8px 4px;min-width:400px;">'+
					'<div class="icon" style="background:url(img/gardenPlants.png?v='+Game.version+');float:left;margin-left:-24px;margin-top:-4px;background-position:'+(-0*48)+'px '+(-me.icon*48)+'px;"></div>'+
					'<div class="icon" style="background:url(img/gardenPlants.png?v='+Game.version+');float:left;margin-left:-24px;margin-top:-28px;background-position:'+(-4*48)+'px '+(-me.icon*48)+'px;"></div>'+
					'<div style="background:url(img/turnInto.png);width:20px;height:22px;position:absolute;left:28px;top:24px;z-index:1000;"></div>'+
					(me.plantable?('<div style="float:right;text-align:right;width:100px;"><small>种植成本:</small><br><span class="price'+(M.canPlant(me)?'':' disabled')+'">'+Beautify(Math.round(shortenNumber(M.getCost(me))))+'</span><br><small>'+Game.sayTime(me.cost*60*30,-1)+' 的饼干每秒生产量,<br>最少  '+Beautify(me.costM)+' 饼干</small></div>'):'')+
					'<div style="width:300px;"><div class="name">'+me.name+' 种子</div><div><small>'+(me.plantable?'单击此处来选择这颗种子去种植。':'<span class="red">无法种植这棵种子。</span>')+'<br>Shift+ctrl+单击来收获所有这类型的成熟作物。</small></div></div>'+
					'<div class="line"></div>'+
					M.getPlantDesc(me)+
				'</div>';
				return str;
			};
		}
		M.toolTooltip=function(id)
		{
			return function(){
				var me=M.toolsById[id];
				var icon=[me.icon,35];
				var str='<div style="padding:8px 4px;min-width:350px;">'+
					'<div class="icon" style="background:url(img/gardenPlants.png?v='+Game.version+');float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+
					'<div><div class="name">'+me.name+'</div></div>'+
					'<div class="line"></div>'+
					'<div class="description">'+
						(me.descFunc?me.descFunc():me.desc)+
					'</div>'+
				'</div>';
				return str;
			};
		}
		M.tileTooltip=function(x,y)
		{
			return function(){
				var tile=M.plot[y][x];
				if (tile[0]==0)
				{
					var me=(M.seedSelected>=0)?M.plantsById[M.seedSelected]:0;
					var str='<div style="padding:8px 4px;min-width:350px;text-align:center;">'+
						'<div class="name">一片空土地</div>'+'<div class="line"></div><div class="description">'+
							'这片土地是空的。<br>拿一颗种子，在这里种点什么！'+
							(me?'<div class="line"></div>点击这里种植 <b>'+me.name+'</b> 并花费 <span class="price'+(M.canPlant(me)?'':' disabled')+'">'+Beautify(Math.round(M.getCost(me)))+'</span>.<br><small>(按住Shift-单击去批量种植.)</small>':'')+
							(M.plotBoost[y][x]!=[1,1,1]?('<small>'+
								(M.plotBoost[y][x][0]!=1?'<br>Aging multiplier : '+Beautify(M.plotBoost[y][x][0]*100)+'%':'')+
								(M.plotBoost[y][x][1]!=1?'<br>Effect multiplier : '+Beautify(M.plotBoost[y][x][1]*100)+'%':'')+
								(M.plotBoost[y][x][2]!=1?'<br>Weeds/fungus repellent : '+Beautify(100-M.plotBoost[y][x][2]*100)+'%':'')+
								'</small>'
							):'')+
						'</div>'+
					'</div>';
					return str;
				}
				else
				{
					var me=M.plantsById[tile[0]-1];
					var stage=0;
					if (tile[1]>=me.mature) stage=4;
					else if (tile[1]>=me.mature*0.666) stage=3;
					else if (tile[1]>=me.mature*0.333) stage=2;
					else stage=1;
					var icon=[stage,me.icon];
					var str='<div style="padding:8px 4px;min-width:350px;">'+
						'<div class="icon" style="background:url(img/gardenPlants.png?v='+Game.version+');float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+
						'<div class="name">'+me.name+'</div><div><small>这个作物在这里生长。</small></div>'+
						'<div class="line"></div>'+
						'<div style="text-align:center;">'+
							'<div style="display:inline-block;position:relative;box-shadow:0px 0px 0px 1px #000,0px 0px 0px 1px rgba(255,255,255,0.5) inset,0px -2px 2px 0px rgba(255,255,255,0.5) inset;width:256px;height:6px;background:linear-gradient(to right,#fff 0%,#0f9 '+me.mature+'%,#3c0 '+(me.mature+0.1)+'%,#960 100%)">'+
								'<div class="gardenGrowthIndicator" style="left:'+Math.floor((tile[1]/100)*256)+'px;"></div>'+
								'<div style="background:url(img/gardenPlants.png?v='+Game.version+');background-position:'+(-1*48)+'px '+(-icon[1]*48)+'px;position:absolute;left:'+(0-24)+'px;top:-32px;transform:scale(0.5,0.5);width:48px;height:48px;"></div>'+
								'<div style="background:url(img/gardenPlants.png?v='+Game.version+');background-position:'+(-2*48)+'px '+(-icon[1]*48)+'px;position:absolute;left:'+((((me.mature*0.333)/100)*256)-24)+'px;top:-32px;transform:scale(0.5,0.5);width:48px;height:48px;"></div>'+
								'<div style="background:url(img/gardenPlants.png?v='+Game.version+');background-position:'+(-3*48)+'px '+(-icon[1]*48)+'px;position:absolute;left:'+((((me.mature*0.666)/100)*256)-24)+'px;top:-32px;transform:scale(0.5,0.5);width:48px;height:48px;"></div>'+
								'<div style="background:url(img/gardenPlants.png?v='+Game.version+');background-position:'+(-4*48)+'px '+(-icon[1]*48)+'px;position:absolute;left:'+((((me.mature)/100)*256)-24)+'px;top:-32px;transform:scale(0.5,0.5);width:48px;height:48px;"></div>'+
							'</div><br>'+
							'<b>阶段 :</b> '+['发芽','长芽','开花','成熟'][stage-1]+'<br>'+
							'<small>'+(stage==1?'作物效果 : 10%':stage==2?'作物效果 : 25%':stage==3?'作物效果 : 50%':'作物效果 : 100%; 可能会繁殖，在收获时留下种子')+'</small>'+
							'<br><small>'+(
								stage<4?(
									'大约在 '+Game.sayTime(((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((me.mature-tile[1])/100)*M.stepT)*30,-1)+' ('+Beautify(Math.ceil((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((me.mature-tile[1])/100)))+' 周期'+(Math.ceil((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((me.mature-tile[1])/100))==1?'':'')+')后成熟'
								):(
									!me.immortal?(
										'大约在 '+Game.sayTime(((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((100-tile[1])/100)*M.stepT)*30,-1)+' ('+Beautify(Math.ceil((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((100-tile[1])/100)))+' 周期'+(Math.ceil((100/(M.plotBoost[y][x][0]*(me.ageTick+me.ageTickR/2)))*((100-tile[1])/100))==1?'':'')+')后腐烂'
									):
										'不会腐烂'
								)
							)+'</small>'+
							//'<small><br>'+M.plotBoost[y][x]+'</small>'+
							(M.plotBoost[y][x]!=[1,1,1]?('<small>'+
								(M.plotBoost[y][x][0]!=1?'<br>老化乘数 : '+Beautify(M.plotBoost[y][x][0]*100)+'%':'')+
								(M.plotBoost[y][x][1]!=1?'<br>效果乘数 : '+Beautify(M.plotBoost[y][x][1]*100)+'%':'')+
								(M.plotBoost[y][x][2]!=1?'<br>杂草/真菌剂 : '+Beautify(100-M.plotBoost[y][x][2]*100)+'%':'')+
								'</small>'
							):'')+
						'</div>'+
						'<div class="line"></div>'+
						//'<div style="text-align:center;">Click to harvest'+(M.seedSelected>=0?', planting <b>'+M.plantsById[M.seedSelected].name+'</b><br>for <span class="price'+(M.canPlant(me)?'':' disabled')+'">'+Beautify(Math.round(M.getCost(M.plantsById[M.seedSelected])))+'</span> in its place':'')+'.</div>'+
						'<div style="text-align:center;">单击来 '+(stage==4?'收获':'挖出')+'.</div>'+
						'<div class="line"></div>'+
						M.getPlantDesc(me)+
					'</div>';
					return str;
				}
			};
		}
		
		M.refillTooltip=function(){
			return '<div style="padding:8px;width:300px;font-size:11px;text-align:center;">Click to refill your soil timer and trigger <b>1</b> plant growth tick with <b>x3</b> spread and mutation rate for <span class="price lump">1 sugar lump</span>.'+
				(Game.canRefillLump()?'<br><small>(can be done once every '+Game.sayTime((Game.getLumpRefillMax()/1000)*Game.fps,-1)+')</small>':('<br><small class="red">(usable again in '+Game.sayTime((Game.getLumpRefillRemaining()/1000+1)*Game.fps,-1)+')</small>'))+
			'</div>';
		};
		
		M.buildPanel=function()
		{
			if (!l('gardenSeeds')) return false;
			var str='';
			for (var i in M.plants)
			{
				var me=M.plants[i];
				var icon=[0,me.icon];
				str+='<div id="gardenSeed-'+me.id+'" class="gardenSeed'+(M.seedSelected==me.id?' on':'')+' locked" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.seedTooltip('+me.id+')','this')+'>';
					str+='<div id="gardenSeedIcon-'+me.id+'" class="gardenSeedIcon shadowFilter" style="background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>';
				str+='</div>';
			}
			l('gardenSeeds').innerHTML=str;
			
			for (var i in M.plants)
			{
				var me=M.plants[i];
				me.l=l('gardenSeed-'+me.id);
				AddEvent(me.l,'click',function(me){return function()
				{
					if (/* !M.freeze && */Game.keys[16] && Game.keys[17])//shift & ctrl
					{
						//harvest all mature of type
						M.harvestAll(me,1);
						return false;
					}
					if (!me.plantable && !Game.sesame) return false;
					if (M.seedSelected==me.id){M.seedSelected=-1;}
					else {M.seedSelected=me.id;PlaySound('snd/toneTick.mp3');}
					for (var i in M.plants)
					{
						var it=M.plants[i];
						if (it.id==M.seedSelected){it.l.classList.add('on');}
						else {it.l.classList.remove('on');}
					}
				}}(me));
				AddEvent(me.l,'mouseover',M.hideCursor);
				AddEvent(me.l,'mouseout',M.showCursor);
				if (me.unlocked) me.l.classList.remove('locked');
			}
			
			var str='';
			for (var i in M.tools)
			{
				var me=M.tools[i];
				var icon=[me.icon,35];
				str+='<div id="gardenTool-'+me.id+'" style="margin:8px;" class="gardenSeed'+((me.isOn && me.isOn())?' on':'')+''+((!me.isDisplayed || me.isDisplayed())?'':' locked')+'" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.toolTooltip('+me.id+')','this')+'>';
					str+='<div id="gardenToolIcon-'+me.id+'" class="gardenSeedIcon shadowFilter" style="background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>';
				str+='</div>';
			}
			l('gardenTools').innerHTML=str;
			
			for (var i in M.tools)
			{
				var me=M.tools[i];
				AddEvent(l('gardenTool-'+me.id),'click',me.func);
				AddEvent(l('gardenTool-'+me.id),'mouseover',M.hideCursor);
				AddEvent(l('gardenTool-'+me.id),'mouseout',M.showCursor);
			}

			var str='';
			for (var i in M.soils)
			{
				var me=M.soils[i];
				var icon=[me.icon,34];
				str+='<div id="gardenSoil-'+me.id+'" class="gardenSeed gardenSoil disabled'+(M.soil==me.id?' on':'')+'" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.soilTooltip('+me.id+')','this')+'>';
					str+='<div id="gardenSoilIcon-'+me.id+'" class="gardenSeedIcon shadowFilter" style="background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>';
				str+='</div>';
			}
			l('gardenSoils').innerHTML=str;
			
			for (var i in M.soils)
			{
				var me=M.soils[i];
				AddEvent(l('gardenSoil-'+me.id),'click',function(me){return function(){
					if (M.freeze || M.soil==me.id || M.nextSoil>Date.now() || M.parent.amount<me.req){return false;}
					PlaySound('snd/toneTick.mp3');
					M.nextSoil=Date.now()+(Game.Has('涡轮增压土壤')?1:(1000*60*10));
					M.toCompute=true;M.soil=me.id;M.computeStepT();
					for (var i in M.soils){var it=M.soils[i];if (it.id==M.soil){l('gardenSoil-'+it.id).classList.add('on');}else{l('gardenSoil-'+it.id).classList.remove('on');}}
				}}(me));
				AddEvent(l('gardenSoil-'+me.id),'mouseover',M.hideCursor);
				AddEvent(l('gardenSoil-'+me.id),'mouseout',M.showCursor);
			}
			
			M.cursorL=l('gardenCursor');
		}
		M.buildPlot=function()
		{
			M.toRebuild=false;
			if (!l('gardenPlot')) return false;
			if (!l('gardenTile-0-0'))
			{
				var str='';
				for (var y=0;y<6;y++)
				{
					for (var x=0;x<6;x++)
					{
						str+='<div id="gardenTile-'+x+'-'+y+'" class="gardenTile" style="left:'+(x*M.tileSize)+'px;top:'+(y*M.tileSize)+'px;display:none;" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.tileTooltip('+x+','+y+')','this')+'>';
							str+='<div id="gardenTileIcon-'+x+'-'+y+'" class="gardenTileIcon" style="display:none;"></div>';
						str+='</div>';
					}
				}
				l('gardenPlot').innerHTML=str;
				
				for (var y=0;y<6;y++)
				{
					for (var x=0;x<6;x++)
					{
						AddEvent(l('gardenTile-'+x+'-'+y),'click',function(x,y){return function()
						{
							M.clickTile(x,y);
						}}(x,y));
					}
				}
			}
			var plants=0;
			for (var y=0;y<6;y++)
			{
				for (var x=0;x<6;x++)
				{
					var tile=M.plot[y][x];
					var tileL=l('gardenTile-'+x+'-'+y);
					var iconL=l('gardenTileIcon-'+x+'-'+y);
					var me=0;
					if (tile[0]>0)
					{
						plants++;
						me=M.plantsById[tile[0]-1];
						var stage=0;
						if (tile[1]>=me.mature) stage=4;
						else if (tile[1]>=me.mature*0.666) stage=3;
						else if (tile[1]>=me.mature*0.333) stage=2;
						else stage=1;
						var dying=((tile[1]+Math.ceil(me.ageTick+me.ageTickR))>=100?1:0);
						var icon=[stage,me.icon];
						iconL.style.opacity=(dying?0.5:1);
						iconL.style.backgroundPosition=(-icon[0]*48)+'px '+(-icon[1]*48)+'px';
						iconL.style.display='block';
						//iconL.innerHTML=M.plotBoost[y][x];
					}
					else iconL.style.display='none';
					if (M.isTileUnlocked(x,y)) tileL.style.display='block';
					else tileL.style.display='none';
				}
			}
			if (plants>=6*6) Game.Win('In the garden of Eden (baby)');
		}
		
		M.clickTile=function(x,y)
		{
			//if (M.freeze) return false;
			var outcome=M.useTool(M.seedSelected,x,y);
			M.toCompute=true;
			if (outcome && !Game.keys[16])//shift
			{
				M.seedSelected=-1;
				for (var i in M.plants)
				{
					var it=M.plants[i];
					if (it.id==M.seedSelected) {l('gardenSeed-'+it.id).classList.add('on');}
					else {l('gardenSeed-'+it.id).classList.remove('on');}
				}
			}
			//PlaySound('snd/tick.mp3');
		}
		
		M.useTool=function(what,x,y)
		{
			var harvested=M.harvest(x,y,1);
			if (harvested)
			{
				Game.SparkleAt(Game.mouseX,Game.mouseY);
				PlaySound('snd/harvest'+choose(['1','2','3'])+'.mp3',1,0.2);
			}
			else
			{
				if (what>=0 && M.canPlant(M.plantsById[what]))
				{
					M.plot[y][x]=[what+1,0];
					M.toRebuild=true;
					Game.Spend(M.getCost(M.plantsById[what]));
					Game.SparkleAt(Game.mouseX,Game.mouseY);
					PlaySound('snd/tillb'+choose(['1','2','3'])+'.mp3',1,0.2);
					return true;
				}
			}
			return false;
		}
		
		M.getTile=function(x,y)
		{
			if (x<0 || x>5 || y<0 || y>5 || !M.isTileUnlocked(x,y)) return [0,0];
			return M.plot[y][x];
		}
		
		M.plotLimits=[
			[2,2,4,4],
			[2,2,5,4],
			[2,2,5,5],
			[1,2,5,5],
			[1,1,5,5],
			[1,1,6,5],
			[1,1,6,6],
			[0,1,6,6],
			[0,0,6,6],
		];
		M.isTileUnlocked=function(x,y)
		{
			var level=M.parent.level;
			level=Math.max(1,Math.min(M.plotLimits.length,level))-1;
			var limits=M.plotLimits[level];
			if (x>=limits[0] && x<limits[2] && y>=limits[1] && y<limits[3]) return true; else return false;
		}
		
		M.computeStepT=function()
		{
			if (Game.Has('涡轮增压土壤')) M.stepT=1;
			else M.stepT=M.soilsById[M.soil].tick*60;
		}
		
		M.convertTimes=0;
		M.askConvert=function()
		{
			if (M.plantsUnlockedN<M.plantsN) return false;
			Game.Prompt('<h3>Sacrifice garden</h3><div class="block">Do you REALLY want to sacrifice your garden to the sugar hornets?<br><small>You will be left with an empty plot and only the Baker\'s wheat seed unlocked.<br>In return, you will gain <b>10 sugar lumps</b>.</small></div>',[['Yes!','Game.ClosePrompt();Game.ObjectsById['+M.parent.id+'].minigame.convert();'],'No']);
		}
		M.convert=function()
		{
			if (M.plantsUnlockedN<M.plantsN) return false;
			M.harvestAll();
			for (var i in M.plants){M.lockSeed(M.plants[i]);}
			M.unlockSeed(M.plants['bakerWheat']);
			
			Game.gainLumps(10);
			Game.Notify('Sacrifice!','You\'ve sacrificed your garden to the sugar hornets, destroying your crops and your knowledge of seeds.<br>In the remains, you find <b>10 sugar lumps</b>.',[29,14],12);
			
			Game.Win('Seedless to nay');
			M.convertTimes++;
			M.computeMatures();
			PlaySound('snd/spellFail.mp3',0.75);
		}
		
		M.harvestAll=function(type,mature,mortal)
		{
			var harvested=0;
			for (var i=0;i<2;i++)//we do it twice to take care of whatever spawns on kill
			{
				for (var y=0;y<6;y++)
				{
					for (var x=0;x<6;x++)
					{
						if (M.plot[y][x][0]>=1)
						{
							var doIt=true;
							var tile=M.plot[y][x];
							var me=M.plantsById[tile[0]-1];
							if (type && me!=type) doIt=false;
							if (mortal && me.immortal) doIt=false;
							if (mature && tile[1]<me.mature) doIt=false;
							
							if (doIt) harvested+=M.harvest(x,y)?1:0;
						}
					}
				}
			}
			if (harvested>0) setTimeout(function(){PlaySound('snd/harvest1.mp3',1,0.2);},50);
			if (harvested>2) setTimeout(function(){PlaySound('snd/harvest2.mp3',1,0.2);},150);
			if (harvested>6) setTimeout(function(){PlaySound('snd/harvest3.mp3',1,0.2);},250);
		}
		M.harvest=function(x,y,manual)
		{
			var tile=M.plot[y][x];
			if (tile[0]>=1)
			{
				M.toCompute=true;
				var me=M.plantsById[tile[0]-1];
				var age=tile[1];
				if (me.onHarvest) me.onHarvest(x,y,age);
				if (tile[1]>=me.mature)
				{
					if (M.unlockSeed(me)) Game.Popup('('+me.name+')<br>Unlocked '+me.name+' seed.',Game.mouseX,Game.mouseY);
					M.harvests++;
					M.harvestsTotal++;
					if (M.harvestsTotal>=100) Game.Win('Botany enthusiast');
					if (M.harvestsTotal>=1000) Game.Win('Green, aching thumb');
				}
				
				M.plot[y][x]=[0,0];
				if (me.onKill) me.onKill(x,y,age);
				M.toRebuild=true;
				return true;
			}
			return false;
		}
		
		M.unlockSeed=function(me)
		{
			if (me.unlocked) return false;
			me.unlocked=1;
			if (me.l) me.l.classList.remove('locked');
			M.getUnlockedN();
			return true;
		}
		M.lockSeed=function(me)
		{
			if (me.locked) return false;
			me.unlocked=0;
			if (me.l) me.l.classList.add('locked');
			M.getUnlockedN();
			return true;
		}
		
		var str='';
		str+='<style>'+
		'#gardenBG{background:url(img/shadedBorders.png),url(img/BGgarden.jpg);background-size:100% 100%,auto;position:absolute;left:0px;right:0px;top:0px;bottom:16px;}'+
		'#gardenContent{position:relative;box-sizing:border-box;padding:4px 24px;height:'+(6*M.tileSize+16+48+48)+'px;}'+
		'.gardenFrozen{box-shadow:0px 0px 16px rgba(255,255,255,1) inset,0px 0px 48px 24px rgba(200,255,225,0.5) inset;}'+
		'#gardenPanel{text-align:center;margin:0px;padding:0px;position:absolute;left:4px;top:4px;bottom:4px;right:65%;overflow-y:auto;overflow-x:hidden;box-shadow:8px 0px 8px rgba(0,0,0,0.5);}'+
		'#gardenSeeds{}'+
		'#gardenField{text-align:center;position:absolute;right:0px;top:0px;bottom:0px;overflow-x:auto;overflow:hidden;}'+//width:65%;
		'#gardenPlot{position:relative;margin:8px auto;}'+
		'.gardenTile{cursor:pointer;width:'+M.tileSize+'px;height:'+M.tileSize+'px;position:absolute;}'+
		//'.gardenTile:before{transform:translate(0,0);pointer-events:none;content:\'\';display:block;position:absolute;left:0px;top:0px;right:0px;bottom:0px;margin:6px;border-radius:12px;background:rgba(0,0,0,0.1);box-shadow:0px 0px 4px rgba(255,255,255,0.2),-4px 4px 4px 2px rgba(0,0,0,0.2) inset;}'+
		//'.gardenTile:hover:before{margin:2px;animation:wobble 0.5s;}'+
		'.gardenTile:before{transform:translate(0,0);opacity:0.65;transition:opacity 0.2s;pointer-events:none;content:\'\';display:block;position:absolute;left:0px;top:0px;right:0px;bottom:0px;margin:0px;background:url(img/gardenPlots.png);}'+
			'.gardenTile:nth-child(4n+1):before{background-position:40px 0px;}'+
			'.gardenTile:nth-child(4n+2):before{background-position:80px 0px;}'+
			'.gardenTile:nth-child(4n+3):before{background-position:120px 0px;}'+
			'.gardenTile:hover:before{opacity:1;animation:wobble 0.5s;}'+
			'.noFancy .gardenTile:hover:before{opacity:1;animation:none;}'+
		'.gardenTileIcon{transform:translate(0,0);pointer-events:none;transform-origin:50% 40px;width:48px;height:48px;position:absolute;left:-'+((48-M.tileSize)/2)+'px;top:-'+((48-M.tileSize)/2+8)+'px;background:url(img/gardenPlants.png?v='+Game.version+');}'+
			'.gardenTile:hover .gardenTileIcon{animation:pucker 0.3s;}'+
			'.noFancy .gardenTile:hover .gardenTileIcon{animation:none;}'+
		'#gardenDrag{pointer-events:none;position:absolute;left:0px;top:0px;right:0px;bottom:0px;overflow:hidden;z-index:1000000001;}'+
		'#gardenCursor{transition:transform 0.1s;display:none;pointer-events:none;width:48px;height:48px;position:absolute;background:url(img/gardenPlants.png?v='+Game.version+');}'+
		'.gardenSeed{cursor:pointer;display:inline-block;width:40px;height:40px;position:relative;}'+
		'.gardenSeed.locked{display:none;}'+
		'.gardenSeedIcon{pointer-events:none;transform:translate(0,0);display:inline-block;position:absolute;left:-4px;top:-4px;width:48px;height:48px;background:url(img/gardenPlants.png?v='+Game.version+');}'+
			'.gardenSeed:hover .gardenSeedIcon{animation:bounce 0.8s;z-index:1000000001;}'+
			'.gardenSeed:active .gardenSeedIcon{animation:pucker 0.2s;}'+
			'.noFancy .gardenSeed:hover .gardenSeedIcon,.noFancy .gardenSeed:active .gardenSeedIcon{animation:none;}'+
		'.gardenPanelLabel{font-size:12px;width:100%;padding:2px;margin-top:4px;margin-bottom:-4px;}'+'.gardenSeedTiny{transform:scale(0.5,0.5);margin:-20px -16px;display:inline-block;width:48px;height:48px;background:url(img/gardenPlants.png?v='+Game.version+');}'+
		'.gardenSeed.on:before{pointer-events:none;content:\'\';display:block;position:absolute;left:0px;top:0px;right:0px;bottom:0px;margin:-2px;border-radius:12px;transform:rotate(45deg);background:rgba(0,0,0,0.2);box-shadow:0px 0px 8px rgba(255,255,255,0.75);}'+
		
		'.gardenGrowthIndicator{background:#000;box-shadow:0px 0px 0px 1px #fff,0px 0px 0px 2px #000,2px 2px 2px 2px rgba(0,0,0,0.5);position:absolute;top:0px;width:1px;height:6px;z-index:100;}'+
		'.noFancy .gardenGrowthIndicator{background:#fff;border:1px solid #000;margin-top:-1px;margin-left:-1px;}'+
		
		'#gardenSoils{}'+
		'.gardenSoil.disabled{filter:brightness(10%);}'+
		'.noFilters .gardenSoil.disabled{opacity:0.2;}'+
		
		'#gardenInfo{position:relative;display:inline-block;margin:8px auto 0px auto;padding:8px 16px;padding-left:32px;text-align:left;font-size:11px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000;background:rgba(0,0,0,0.75);border-radius:16px;}'+
		
		'</style>';
		str+='<div id="gardenBG"></div>';
		str+='<div id="gardenContent">';
		str+='<div id="gardenDrag"><div id="gardenCursor" class="shadowFilter"></div></div>';
			
			str+='<div id="gardenPanel" class="framed">';
				str+='<div class="title gardenPanelLabel">工具</div><div class="line"></div>';
				str+='<div id="gardenTools"></div>';
				str+='<div id="gardenSeedsUnlocked" class="title gardenPanelLabel">Seeds</div><div class="line"></div>';
				str+='<div id="gardenSeeds"></div>';
			str+='</div>';
			str+='<div id="gardenField">';
				str+='<div style="pointer-events:none;opacity:0.75;position:absolute;left:0px;right:0px;top:8px;" id="gardenPlotSize"></div>';
				str+='<div id="gardenPlot" class="shadowFilter" style="width:'+(6*M.tileSize)+'px;height:'+(6*M.tileSize)+'px;"></div>';
				str+='<div style="margin-top:0px;" id="gardenSoils"></div>';
				str+='<div id="gardenInfo">';
					str+='<div '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.refillTooltip','this')+' id="gardenLumpRefill" class="usesIcon shadowFilter lumpRefill" style="display:none;left:-8px;top:-6px;background-position:'+(-29*48)+'px '+(-14*48)+'px;"></div>';
					str+='<div id="gardenNextTick">Initializing...</div>';
					str+='<div id="gardenStats"></div>';
				str+='</div>';
			str+='</div>';
			
		str+='</div>';
		div.innerHTML=str;
		M.buildPlot();
		M.buildPanel();
		
		M.lumpRefill=l('gardenLumpRefill');
		AddEvent(M.lumpRefill,'click',function(){
			Game.refillLump(1,function(){
				M.loopsMult=3;
				M.nextSoil=Date.now();
				//M.nextFreeze=Date.now();
				M.nextStep=Date.now();
				PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
			});
		});
		AddEvent(l('gardenSeedsUnlocked'),'click',function()
		{
			if (Game.sesame)
			{
				if (Game.keys[16] && Game.keys[17])//ctrl & shift, fill garden with random plants
				{
					for (var y=0;y<6;y++)
					{
						for (var x=0;x<6;x++)
						{
							M.plot[y][x]=[choose(M.plantsById).id+1,Math.floor(Math.random()*100)];
						}
					}
					M.toRebuild=true;
					M.toCompute=true;
				}
				else//unlock/lock all seeds
				{
					var locked=0;
					for (var i in M.plants)
					{
						if (!M.plants[i].unlocked) locked++;
					}
					if (locked>0){for (var i in M.plants){M.unlockSeed(M.plants[i]);}}
					else{for (var i in M.plants){M.lockSeed(M.plants[i]);}}
					M.unlockSeed(M.plants['bakerWheat']);
				}
			}
		});
		
		M.reset();
		
		//M.parent.switchMinigame(1);
	}
	M.onResize=function()
	{
		var width=l('gardenContent').offsetWidth;
		var panelW=Math.min(Math.max(width*0.40,320),width-6*M.tileSize)-8;
		var fieldW=Math.max(Math.min(width*0.60,width-panelW),6*M.tileSize)-8;
		l('gardenField').style.width=fieldW+'px';
		l('gardenPanel').style.width=panelW+'px';
	}
	M.onLevel=function(level)
	{
		M.buildPlot();
	}
	M.onRuinTheFun=function()
	{
		for (var i in M.plants){M.unlockSeed(M.plants[i]);}
	}
	M.save=function()
	{
		//output cannot use ",", ";" or "|"
		var str=''+
		parseFloat(M.nextStep)+':'+
		parseInt(M.soil)+':'+
		parseFloat(M.nextSoil)+':'+
		parseInt(M.freeze)+':'+
		parseInt(M.harvests)+':'+
		parseInt(M.harvestsTotal)+':'+
		parseInt(M.parent.onMinigame?'1':'0')+':'+
		parseFloat(M.convertTimes)+':'+
		parseFloat(M.nextFreeze)+':'+
		' ';
		for (var i in M.plants)
		{
			str+=''+(M.plants[i].unlocked?'1':'0');
		}
		str+=' ';
		for (var y=0;y<6;y++)
		{
			for (var x=0;x<6;x++)
			{
				str+=parseInt(M.plot[y][x][0])+':'+parseInt(M.plot[y][x][1])+':';
			}
		}
		return str;
	}
	M.load=function(str)
	{
		//interpret str; called after .init
		//note : not actually called in the Game's load; see "minigameSave" in main.js
		if (!str) return false;
		var i=0;
		var spl=str.split(' ');
		var spl2=spl[i++].split(':');
		var i2=0;
		M.nextStep=parseFloat(spl2[i2++]||M.nextStep);
		M.soil=parseInt(spl2[i2++]||M.soil);
		M.nextSoil=parseFloat(spl2[i2++]||M.nextSoil);
		M.freeze=parseInt(spl2[i2++]||M.freeze)?1:0;
		M.harvests=parseInt(spl2[i2++]||0);
		M.harvestsTotal=parseInt(spl2[i2++]||0);
		var on=parseInt(spl2[i2++]||0);if (on && Game.ascensionMode!=1) M.parent.switchMinigame(1);
		M.convertTimes=parseFloat(spl2[i2++]||M.convertTimes);
		M.nextFreeze=parseFloat(spl2[i2++]||M.nextFreeze);
		var seeds=spl[i++]||'';
		if (seeds)
		{
			var n=0;
			for (var ii in M.plants)
			{
				if (seeds.charAt(n)=='1') M.plants[ii].unlocked=1; else M.plants[ii].unlocked=0;
				n++;
			}
		}
		M.plants['bakerWheat'].unlocked=1;
		
		var plot=spl[i++]||0;
		if (plot)
		{
			plot=plot.split(':');
			var n=0;
			for (var y=0;y<6;y++)
			{
				for (var x=0;x<6;x++)
				{
					M.plot[y][x]=[parseInt(plot[n]),parseInt(plot[n+1])];
					n+=2;
				}
			}
		}
		
		M.getUnlockedN();
		M.computeStepT();
		
		M.buildPlot();
		M.buildPanel();
		
		M.computeBoostPlot();
		M.toCompute=true;
	}
	M.reset=function(hard)
	{
		M.soil=0;
		if (M.seedSelected>-1) M.plantsById[M.seedSelected].l.classList.remove('on');
		M.seedSelected=-1;
		
		M.nextStep=Date.now();
		M.nextSoil=Date.now();
		M.nextFreeze=Date.now();
		for (var y=0;y<6;y++)
		{
			for (var x=0;x<6;x++)
			{
				M.plot[y][x]=[0,0];
			}
		}
		
		M.harvests=0;
		if (hard)
		{
			M.convertTimes=0;
			M.harvestsTotal=0;
			for (var i in M.plants)
			{
				M.plants[i].unlocked=0;
			}
		}
		
		M.plants['bakerWheat'].unlocked=1;
		
		M.loopsMult=1;
		
		M.getUnlockedN();
		M.computeStepT();
		
		M.computeMatures();
		
		M.buildPlot();
		M.buildPanel();
		M.toCompute=true;
		
		setTimeout(function(M){return function(){M.onResize();}}(M),10);
	}
	M.logic=function()
	{
		//run each frame
		var now=Date.now();
		
		if (!M.freeze)
		{
			M.nextStep=Math.min(M.nextStep,now+(M.stepT)*1000);
			if (now>=M.nextStep)
			{
				M.computeStepT();
				M.nextStep=now+M.stepT*1000;
				
				M.computeBoostPlot();
				M.computeMatures();
				
				var weedMult=M.soilsById[M.soil].weedMult;
				
				var loops=1;
				if (M.soilsById[M.soil].key=='woodchips') loops=3;
				loops*=M.loopsMult;
				M.loopsMult=1;
			
				for (var y=0;y<6;y++)
				{
					for (var x=0;x<6;x++)
					{
						if (M.isTileUnlocked(x,y))
						{
							var tile=M.plot[y][x];
							var me=M.plantsById[tile[0]-1];
							if (tile[0]>0)
							{
								//age
								tile[1]+=randomFloor((me.ageTick+me.ageTickR*Math.random())*M.plotBoost[y][x][0]);
								tile[1]=Math.max(tile[1],0);
								if (me.immortal) tile[1]=Math.min(me.mature+1,tile[1]);
								else if (tile[1]>=100)
								{
									//die of old age
									M.plot[y][x]=[0,0];
									if (me.onDie) me.onDie(x,y);
									if (M.soilsById[M.soil].key=='pebbles' && Math.random()<0.35)
									{
										if (M.unlockSeed(me)) Game.Popup('Unlocked '+me.name+' seed.',Game.mouseX,Game.mouseY);
									}
								}
								else if (!me.noContam)
								{
									//other plant contamination
									//only occurs in cardinal directions
									//immortal plants and plants with noContam are immune
									
									var list=[];
									for (var i in M.plantContam)
									{
										if (Math.random()<M.plantContam[i] && (!M.plants[i].weed || Math.random()<weedMult)) list.push(i);
									}
									var contam=choose(list);

									if (contam && me.key!=contam)
									{
										if ((!M.plants[contam].weed && !M.plants[contam].fungus) || Math.random()<M.plotBoost[y][x][2])
										{
											var any=0;
											var neighs={};//all surrounding plants
											var neighsM={};//all surrounding mature plants
											for (var i in M.plants){neighs[i]=0;}
											for (var i in M.plants){neighsM[i]=0;}
											var neigh=M.getTile(x,y-1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x,y+1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x-1,y);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x+1,y);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											
											if (neighsM[contam]>=1) M.plot[y][x]=[M.plants[contam].id+1,0];
										}
									}
								}
							}
							else
							{
								//plant spreading and mutation
								//happens on all 8 tiles around this one
								for (var loop=0;loop<loops;loop++)
								{
									var any=0;
									var neighs={};//all surrounding plants
									var neighsM={};//all surrounding mature plants
									for (var i in M.plants){neighs[i]=0;}
									for (var i in M.plants){neighsM[i]=0;}
									var neigh=M.getTile(x,y-1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x,y+1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x-1,y);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x+1,y);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x-1,y-1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x-1,y+1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x+1,y-1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									var neigh=M.getTile(x+1,y+1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
									if (any>0)
									{
										var muts=M.getMuts(neighs,neighsM);
										
										var list=[];
										for (var ii=0;ii<muts.length;ii++)
										{
											if (Math.random()<muts[ii][1] && (!M.plants[muts[ii][0]].weed || Math.random()<weedMult) && ((!M.plants[muts[ii][0]].weed && !M.plants[muts[ii][0]].fungus) || Math.random()<M.plotBoost[y][x][2])) list.push(muts[ii][0]);
										}
										if (list.length>0) M.plot[y][x]=[M.plants[choose(list)].id+1,0];
									}
									else if (loop==0)
									{
										//weeds in empty tiles (no other plants must be nearby)
										var chance=0.002*weedMult*M.plotBoost[y][x][2];
										if (Math.random()<chance) M.plot[y][x]=[M.plants['meddleweed'].id+1,0];
									}
								}
							}
						}
					}
				}
				M.toRebuild=true;
				M.toCompute=true;
			}
		}
		if (M.toRebuild) M.buildPlot();
		if (M.toCompute) M.computeEffs();
		
		if (Game.keys[27])//esc
		{
			if (M.seedSelected>-1) M.plantsById[M.seedSelected].l.classList.remove('on');
			M.seedSelected=-1;
		}
	}
	M.draw=function()
	{
		//run each draw frame
		
		if (M.cursorL)
		{
			if (!M.cursor || M.seedSelected<0)
			{
				M.cursorL.style.display='none';
			}
			else
			{
				var box=l('gardenDrag').getBoundingClientRect();
				var x=Game.mouseX-box.left-24;
				var y=Game.mouseY-box.top;
				var seed=M.plantsById[M.seedSelected];
				var icon=[0,seed.icon];
				M.cursorL.style.transform='translate('+(x)+'px,'+(y)+'px)';
				M.cursorL.style.backgroundPosition=(-icon[0]*48)+'px '+(-icon[1]*48)+'px';
				M.cursorL.style.display='block';
			}
		}
		if (Game.drawT%10==0)
		{
			M.lumpRefill.style.display='block';
			if (M.freeze) l('gardenNextTick').innerHTML='花园冻住了。解冻来恢复。';
			else l('gardenNextTick').innerHTML='下一周期在 '+Game.sayTime((M.nextStep-Date.now())/1000*30+30,-1)+'';
			l('gardenStats').innerHTML='已收获成熟作物 : '+Beautify(M.harvests)+' (总共 : '+Beautify(M.harvestsTotal)+')';
			if (M.parent.level<M.plotLimits.length) l('gardenPlotSize').innerHTML='<small>种植区尺寸 : '+Math.max(1,Math.min(M.plotLimits.length,M.parent.level))+'/'+M.plotLimits.length+'<br>(随农场等级升级<糖块升级>)</small>';
			else l('gardenPlotSize').innerHTML='';
			l('gardenSeedsUnlocked').innerHTML='种子<small> ('+M.plantsUnlockedN+'/'+M.plantsN+')</small>';
			for (var i in M.soils)
			{
				var me=M.soils[i];
				if (M.parent.amount<me.req) l('gardenSoil-'+me.id).classList.add('disabled');
				else l('gardenSoil-'+me.id).classList.remove('disabled');
			}
		}
	}
	M.init(l('rowSpecial'+M.parent.id));
}
var M=0;