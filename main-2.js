/*
All this code is copyright Orteil, 2013-2018.
	-with some help, advice and fixes by Nicholas Laux, Debugbro, Opti, and lots of people on reddit, Discord, and the DashNet forums
	-also includes a bunch of snippets found on stackoverflow.com and others
Hello, and welcome to the joyous mess that is main.js. Code contained herein is not guaranteed to be good, consistent, or sane. Most of this is years old at this point and harkens back to simpler, cruder times. Have a nice trip.
Spoilers ahead.
http://orteil.dashnet.org
*/

var VERSION=2.016;
var BETA=0;


/*=====================================================================================
MISC HELPER FUNCTIONS
=======================================================================================*/
function l(what) {return document.getElementById(what);}
function choose(arr) {return arr[Math.floor(Math.random()*arr.length)];}

function escapeRegExp(str){return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");}
function replaceAll(find,replace,str){return str.replace(new RegExp(escapeRegExp(find),'g'),replace);}

//disable sounds coming from soundjay.com (sorry)
var realAudio=Audio;//backup real audio
Audio=function(src){
	if (src && src.indexOf('soundjay')>-1) {Game.Popup('对不起，没有声音从soundjay.com热链接。');this.play=function(){};}
	else return new realAudio(src);
};

if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === needle) {return i;}
        }
        return -1;
    };
}

function randomFloor(x) {if ((x%1)<Math.random()) return Math.floor(x); else return Math.ceil(x);}

function shuffle(array)
{
	var counter = array.length, temp, index;
	// While there are elements in the array
	while (counter--)
	{
		// Pick a random index
		index = (Math.random() * counter) | 0;

		// And swap the last element with it
		temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}
	return array;
}

var sinArray=[];
for (var i=0;i<360;i++)
{
	//let's make a lookup table
	sinArray[i]=Math.sin(i/360*Math.PI*2);
}
function quickSin(x)
{
	//oh man this isn't all that fast actually
	//why do I do this. why
	var sign=x<0?-1:1;
	return sinArray[Math.round(
		(Math.abs(x)*360/Math.PI/2)%360
	)]*sign;
}

/*function ajax(url,callback){
	var ajaxRequest;
	try{ajaxRequest = new XMLHttpRequest();} catch (e){try{ajaxRequest=new ActiveXObject('Msxml2.XMLHTTP');} catch (e) {try{ajaxRequest=new ActiveXObject('Microsoft.XMLHTTP');} catch (e){alert("Something broke!");return false;}}}
	if (callback){ajaxRequest.onreadystatechange=function(){if(ajaxRequest.readyState==4){callback(ajaxRequest.responseText);}}}
	ajaxRequest.open('GET',url+'&nocache='+(new Date().getTime()),true);ajaxRequest.send(null);
}*/

var ajax=function(url,callback)
{
	var httpRequest=new XMLHttpRequest();
	if (!httpRequest){return false;}
	httpRequest.onreadystatechange=function()
	{
		try{
			if (httpRequest.readyState===XMLHttpRequest.DONE && httpRequest.status===200)
			{
				callback(httpRequest.responseText);
			}
		}catch(e){}
	}
	//httpRequest.onerror=function(e){console.log('ERROR',e);}
	if (url.indexOf('?')==-1) url+='?'; else url+='&';
	url+='nocache='+Date.now();
	httpRequest.open('GET',url);
	httpRequest.setRequestHeader('Content-Type','text/plain');
	httpRequest.overrideMimeType('text/plain');
	httpRequest.send();
	return true;
}


//Beautify and number-formatting adapted from the Frozen Cookies add-on (http://cookieclicker.wikia.com/wiki/Frozen_Cookies_%28JavaScript_Add-on%29)
function formatEveryThirdPower(notations)
{
	return function (value)
	{
		var base = 0,
		notationValue = '';
		if (!isFinite(value)) return 'Infinity';
		if (value >= 1000000)
		{
			value /= 1000;
			while(Math.round(value) >= 1000)
			{
				value /= 1000;
				base++;
			}
			if (base >= notations.length) {return 'Infinity';} else {notationValue = notations[base];}
		}
		return ( Math.round(value * 1000) / 1000 ) + notationValue;
	};
}

function rawFormatter(value) {return Math.round(value * 1000) / 1000;}

var formatLong=[' thousand',' million',' billion',' trillion',' quadrillion',' quintillion',' sextillion',' septillion',' octillion',' nonillion'];
var prefixes=['','un','duo','tre','quattuor','quin','sex','septen','octo','novem'];
var suffixes=['decillion','vigintillion','trigintillion','quadragintillion','quinquagintillion','sexagintillion','septuagintillion','octogintillion','nonagintillion'];
for (var i in suffixes)
{
	for (var ii in prefixes)
	{
		formatLong.push(' '+prefixes[ii]+suffixes[i]);
	}
}

var formatShort=['k','M','B','T','Qa','Qi','Sx','Sp','Oc','No'];
var prefixes=['','Un','Do','Tr','Qa','Qi','Sx','Sp','Oc','No'];
var suffixes=['D','V','T','Qa','Qi','Sx','Sp','O','N'];
for (var i in suffixes)
{
	for (var ii in prefixes)
	{
		formatShort.push(' '+prefixes[ii]+suffixes[i]);
	}
}
formatShort[10]='Dc';


var numberFormatters =
[
	formatEveryThirdPower(formatShort),
	formatEveryThirdPower(formatLong),
	rawFormatter
];
function Beautify(value,floats)
{
	var negative=(value<0);
	var decimal='';
	var fixed=value.toFixed(floats);
	if (Math.abs(value)<1000 && floats>0 && Math.floor(fixed)!=fixed) decimal='.'+(fixed.toString()).split('.')[1];
	value=Math.floor(Math.abs(value));
	if (floats>0 && fixed==value+1) value++;
	var formatter=numberFormatters[Game.prefs.format?2:1];
	var output=formatter(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
	if (output=='0') negative=false;
	return negative?'-'+output:output+decimal;
}
function shortenNumber(value)
{
	//if no scientific notation, return as is, else :
	//keep only the 5 first digits (plus dot), round the rest
	//may or may not work properly
	if (value >= 1000000 && isFinite(value))
	{
		var num=value.toString();
		var ind=num.indexOf('e+');
		if (ind==-1) return value;
		var str='';
		for (var i=0;i<ind;i++)
		{
			str+=(i<6?num[i]:'0');
		}
		str+='e+';
		str+=num.split('e+')[1];
		return parseFloat(str);
	}
	return value;
}


var beautifyInTextFilter=/(([\d]+[,]*)+)/g;//new regex
var a=/\d\d?\d?(?:,\d\d\d)*/g;//old regex
function BeautifyInTextFunction(str){return Beautify(parseInt(str.replace(/,/g,''),10));};
function BeautifyInText(str) {return str.replace(beautifyInTextFilter,BeautifyInTextFunction);}//reformat every number inside a string
function BeautifyAll()//run through upgrades and achievements to reformat the numbers
{
	var func=function(what){what.desc=BeautifyInText(what.baseDesc);}
	Game.UpgradesById.forEach(func);
	Game.AchievementsById.forEach(func);
}

//these are faulty, investigate later
//function utf8_to_b64(str){return btoa(str);}
//function b64_to_utf8(str){return atob(str);}

function utf8_to_b64( str ) {
	try{return Base64.encode(unescape(encodeURIComponent( str )));}
	catch(err)
	{return '';}
}

function b64_to_utf8( str ) {
	try{return decodeURIComponent(escape(Base64.decode( str )));}
	catch(err)
	{return '';}
}

function CompressBin(arr)//compress a sequence like [0,1,1,0,1,0]... into a number like 54.
{
	var str='';
	var arr2=arr.slice(0);
	arr2.unshift(1);
	arr2.push(1);
	arr2.reverse();
	for (var i in arr2)
	{
		str+=arr2[i];
	}
	str=parseInt(str,2);
	return str;
}

function UncompressBin(num)//uncompress a number like 54 to a sequence like [0,1,1,0,1,0].
{
	var arr=num.toString(2);
	arr=arr.split('');
	arr.reverse();
	arr.shift();
	arr.pop();
	return arr;
}

function CompressLargeBin(arr)//we have to compress in smaller chunks to avoid getting into scientific notation
{
	var arr2=arr.slice(0);
	var thisBit=[];
	var bits=[];
	for (var i in arr2)
	{
		thisBit.push(arr2[i]);
		if (thisBit.length>=50)
		{
			bits.push(CompressBin(thisBit));
			thisBit=[];
		}
	}
	if (thisBit.length>0) bits.push(CompressBin(thisBit));
	arr2=bits.join(';');
	return arr2;
}

function UncompressLargeBin(arr)
{
	var arr2=arr.split(';');
	var bits=[];
	for (var i in arr2)
	{
		bits.push(UncompressBin(parseInt(arr2[i])));
	}
	arr2=[];
	for (var i in bits)
	{
		for (var ii in bits[i]) arr2.push(bits[i][ii]);
	}
	return arr2;
}


function pack(bytes) {
    var chars = [];
	var len=bytes.length;
    for(var i = 0, n = len; i < n;) {
        chars.push(((bytes[i++] & 0xff) << 8) | (bytes[i++] & 0xff));
    }
    return String.fromCharCode.apply(null, chars);
}

function unpack(str) {
    var bytes = [];
	var len=str.length;
    for(var i = 0, n = len; i < n; i++) {
        var char = str.charCodeAt(i);
        bytes.push(char >>> 8, char & 0xFF);
    }
    return bytes;
}

//modified from http://www.smashingmagazine.com/2011/10/19/optimizing-long-lists-of-yesno-values-with-javascript/
function pack2(/* string */ values) {
    var chunks = values.match(/.{1,14}/g), packed = '';
    for (var i=0; i < chunks.length; i++) {
        packed += String.fromCharCode(parseInt('1'+chunks[i], 2));
    }
    return packed;
}

function unpack2(/* string */ packed) {
    var values = '';
    for (var i=0; i < packed.length; i++) {
        values += packed.charCodeAt(i).toString(2).substring(1);
    }
    return values;
}

function pack3(values){
	//too many save corruptions, darn it to heck
	return values;
}


//file save function from https://github.com/eligrey/FileSaver.js
var saveAs=saveAs||function(view){"use strict";if(typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var doc=view.document,get_URL=function(){return view.URL||view.webkitURL||view},save_link=doc.createElementNS("http://www.w3.org/1999/xhtml","a"),can_use_save_link="download"in save_link,click=function(node){var event=new MouseEvent("click");node.dispatchEvent(event)},is_safari=/Version\/[\d\.]+.*Safari/.test(navigator.userAgent),webkit_req_fs=view.webkitRequestFileSystem,req_fs=view.requestFileSystem||webkit_req_fs||view.mozRequestFileSystem,throw_outside=function(ex){(view.setImmediate||view.setTimeout)(function(){throw ex},0)},force_saveable_type="application/octet-stream",fs_min_size=0,arbitrary_revoke_timeout=500,revoke=function(file){var revoker=function(){if(typeof file==="string"){get_URL().revokeObjectURL(file)}else{file.remove()}};if(view.chrome){revoker()}else{setTimeout(revoker,arbitrary_revoke_timeout)}},dispatch=function(filesaver,event_types,event){event_types=[].concat(event_types);var i=event_types.length;while(i--){var listener=filesaver["on"+event_types[i]];if(typeof listener==="function"){try{listener.call(filesaver,event||filesaver)}catch(ex){throw_outside(ex)}}}},auto_bom=function(blob){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)){return new Blob(["\ufeff",blob],{type:blob.type})}return blob},FileSaver=function(blob,name,no_auto_bom){if(!no_auto_bom){blob=auto_bom(blob)}var filesaver=this,type=blob.type,blob_changed=false,object_url,target_view,dispatch_all=function(){dispatch(filesaver,"writestart progress write writeend".split(" "))},fs_error=function(){if(target_view&&is_safari&&typeof FileReader!=="undefined"){var reader=new FileReader;reader.onloadend=function(){var base64Data=reader.result;target_view.location.href="data:attachment/file"+base64Data.slice(base64Data.search(/[,;]/));filesaver.readyState=filesaver.DONE;dispatch_all()};reader.readAsDataURL(blob);filesaver.readyState=filesaver.INIT;return}if(blob_changed||!object_url){object_url=get_URL().createObjectURL(blob)}if(target_view){target_view.location.href=object_url}else{var new_tab=view.open(object_url,"_blank");if(new_tab==undefined&&is_safari){view.location.href=object_url}}filesaver.readyState=filesaver.DONE;dispatch_all();revoke(object_url)},abortable=function(func){return function(){if(filesaver.readyState!==filesaver.DONE){return func.apply(this,arguments)}}},create_if_not_found={create:true,exclusive:false},slice;filesaver.readyState=filesaver.INIT;if(!name){name="download"}if(can_use_save_link){object_url=get_URL().createObjectURL(blob);setTimeout(function(){save_link.href=object_url;save_link.download=name;click(save_link);dispatch_all();revoke(object_url);filesaver.readyState=filesaver.DONE});return}if(view.chrome&&type&&type!==force_saveable_type){slice=blob.slice||blob.webkitSlice;blob=slice.call(blob,0,blob.size,force_saveable_type);blob_changed=true}if(webkit_req_fs&&name!=="download"){name+=".download"}if(type===force_saveable_type||webkit_req_fs){target_view=view}if(!req_fs){fs_error();return}fs_min_size+=blob.size;req_fs(view.TEMPORARY,fs_min_size,abortable(function(fs){fs.root.getDirectory("saved",create_if_not_found,abortable(function(dir){var save=function(){dir.getFile(name,create_if_not_found,abortable(function(file){file.createWriter(abortable(function(writer){writer.onwriteend=function(event){target_view.location.href=file.toURL();filesaver.readyState=filesaver.DONE;dispatch(filesaver,"writeend",event);revoke(file)};writer.onerror=function(){var error=writer.error;if(error.code!==error.ABORT_ERR){fs_error()}};"writestart progress write abort".split(" ").forEach(function(event){writer["on"+event]=filesaver["on"+event]});writer.write(blob);filesaver.abort=function(){writer.abort();filesaver.readyState=filesaver.DONE};filesaver.readyState=filesaver.WRITING}),fs_error)}),fs_error)};dir.getFile(name,{create:false},abortable(function(file){file.remove();save()}),abortable(function(ex){if(ex.code===ex.NOT_FOUND_ERR){save()}else{fs_error()}}))}),fs_error)}),fs_error)},FS_proto=FileSaver.prototype,saveAs=function(blob,name,no_auto_bom){return new FileSaver(blob,name,no_auto_bom)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(blob,name,no_auto_bom){if(!no_auto_bom){blob=auto_bom(blob)}return navigator.msSaveOrOpenBlob(blob,name||"download")}}FS_proto.abort=function(){var filesaver=this;filesaver.readyState=filesaver.DONE;dispatch(filesaver,"abort")};FS_proto.readyState=FS_proto.INIT=0;FS_proto.WRITING=1;FS_proto.DONE=2;FS_proto.error=FS_proto.onwritestart=FS_proto.onprogress=FS_proto.onwrite=FS_proto.onabort=FS_proto.onerror=FS_proto.onwriteend=null;return saveAs}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!=null){define([],function(){return saveAs})}


//seeded random function, courtesy of http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html
(function(a,b,c,d,e,f){function k(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=j&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=j&f+1],c=c*d+h[j&(h[f]=h[g=j&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function l(a,b){var e,c=[],d=(typeof a)[0];if(b&&"o"==d)for(e in a)try{c.push(l(a[e],b-1))}catch(f){}return c.length?c:"s"==d?a:a+"\0"}function m(a,b){for(var d,c=a+"",e=0;c.length>e;)b[j&e]=j&(d^=19*b[j&e])+c.charCodeAt(e++);return o(b)}function n(c){try{return a.crypto.getRandomValues(c=new Uint8Array(d)),o(c)}catch(e){return[+new Date,a,a.navigator.plugins,a.screen,o(b)]}}function o(a){return String.fromCharCode.apply(0,a)}var g=c.pow(d,e),h=c.pow(2,f),i=2*h,j=d-1;c.seedrandom=function(a,f){var j=[],p=m(l(f?[a,o(b)]:0 in arguments?a:n(),3),j),q=new k(j);return m(o(q.S),b),c.random=function(){for(var a=q.g(e),b=g,c=0;h>a;)a=(a+c)*d,b*=d,c=q.g(1);for(;a>=i;)a/=2,b/=2,c>>>=1;return(a+c)/b},p},m(c.random(),b)})(this,[],Math,256,6,52);

function bind(scope,fn)
{
	//use : bind(this,function(){this.x++;}) - returns a function where "this" refers to the scoped this
	return function() {fn.apply(scope,arguments);};
}

var grabProps=function(arr,prop)
{
	if (!arr) return [];
	arr2=[];
	for (var i=0;i<arr.length;i++)
	{
		arr2.push(arr[i][prop]);
	}
	return arr2;
}

CanvasRenderingContext2D.prototype.fillPattern=function(img,X,Y,W,H,iW,iH,offX,offY)
{
	//for when built-in patterns aren't enough
	if (img.alt!='blank')
	{
		var offX=offX||0;
		var offY=offY||0;
		if (offX<0) {offX=offX-Math.floor(offX/iW)*iW;} if (offX>0) {offX=(offX%iW)-iW;}
		if (offY<0) {offY=offY-Math.floor(offY/iH)*iH;} if (offY>0) {offY=(offY%iH)-iH;}
		for (var y=offY;y<H;y+=iH){for (var x=offX;x<W;x+=iW){this.drawImage(img,X+x,Y+y,iW,iH);}}
	}
}

var OldCanvasDrawImage=CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage=function()
{
	//only draw the image if it's loaded
	if (arguments[0].alt!='blank') OldCanvasDrawImage.apply(this,arguments);
}


if (!document.hasFocus) document.hasFocus=function(){return document.hidden;};//for Opera

function AddEvent(html_element, event_name, event_function)
{
	if(html_element.attachEvent) html_element.attachEvent("on" + event_name, function() {event_function.call(html_element);});
	else if(html_element.addEventListener) html_element.addEventListener(event_name, event_function, false);
}

function FireEvent(el, etype)
{
	if (el.fireEvent)
	{el.fireEvent('on'+etype);}
	else
	{
		var evObj=document.createEvent('Events');
		evObj.initEvent(etype,true,false);
		el.dispatchEvent(evObj);
	}
}

var Loader=function()//asset-loading system
{
	this.loadingN=0;
	this.assetsN=0;
	this.assets=[];
	this.assetsLoading=[];
	this.assetsLoaded=[];
	this.domain='';
	this.loaded=0;//callback
	this.doneLoading=0;
	
	this.blank=document.createElement('canvas');
	this.blank.width=8;
	this.blank.height=8;
	this.blank.alt='blank';

	this.Load=function(assets)
	{
		for (var i in assets)
		{
			this.loadingN++;
			this.assetsN++;
			if (!this.assetsLoading[assets[i]] && !this.assetsLoaded[assets[i]])
			{
				var img=new Image();
				img.src=this.domain+assets[i];
				img.alt=assets[i];
				img.onload=bind(this,this.onLoad);
				this.assets[assets[i]]=img;
				this.assetsLoading.push(assets[i]);
			}
		}
	}
	this.Replace=function(old,newer)
	{
		if (this.assets[old])
		{
			var img=new Image();
			if (newer.indexOf('http')!=-1) img.src=newer;
			else img.src=this.domain+newer;
			img.alt=newer;
			img.onload=bind(this,this.onLoad);
			this.assets[old]=img;
		}
	}
	this.onLoadReplace=function()
	{
	}
	this.onLoad=function(e)
	{
		this.assetsLoaded.push(e.target.alt);
		this.assetsLoading.splice(this.assetsLoading.indexOf(e.target.alt),1);
		this.loadingN--;
		if (this.doneLoading==0 && this.loadingN<=0 && this.loaded!=0)
		{
			this.doneLoading=1;
			this.loaded();
		}
	}
	this.getProgress=function()
	{
		return (1-this.loadingN/this.assetsN);
	}
}

var Pic=function(what)
{
	if (Game.Loader.assetsLoaded.indexOf(what)!=-1) return Game.Loader.assets[what];
	else if (Game.Loader.assetsLoading.indexOf(what)==-1) Game.Loader.Load([what]);
	return Game.Loader.blank;
}

var Sounds=[];
var OldPlaySound=function(url,vol)
{
	var volume=1;
	if (vol!==undefined) volume=vol;
	if (!Game.volume || volume==0) return 0;
	if (!Sounds[url]) {Sounds[url]=new Audio(url);Sounds[url].onloadeddata=function(e){e.target.volume=Math.pow(volume*Game.volume/100,2);}}
	else if (Sounds[url].readyState>=2) {Sounds[url].currentTime=0;Sounds[url].volume=Math.pow(volume*Game.volume/100,2);}
	Sounds[url].play();
}
var SoundInsts=[];
var SoundI=0;
for (var i=0;i<12;i++){SoundInsts[i]=new Audio();}
var pitchSupport=false;
//note : Chrome turns out to not support webkitPreservesPitch despite the specifications claiming otherwise, and Firefox clips some short sounds when changing playbackRate, so i'm turning the feature off completely until browsers get it together
//if (SoundInsts[0].preservesPitch || SoundInsts[0].mozPreservesPitch || SoundInsts[0].webkitPreservesPitch) pitchSupport=true;

var PlaySound=function(url,vol,pitchVar)
{
	//url : the url of the sound to play (will be cached so it only loads once)
	//vol : volume between 0 and 1 (multiplied by game volume setting); defaults to 1 (full volume)
	//(DISABLED) pitchVar : pitch variance in browsers that support it (Firefox only at the moment); defaults to 0.05 (which means pitch can be up to -5% or +5% anytime the sound plays)
	var volume=1;
	var pitchVar=(typeof pitchVar==='undefined')?0.05:pitchVar;
	var rate=1+(Math.random()*2-1)*pitchVar;
	if (typeof vol!=='undefined') volume=vol;
	if (!Game.volume || volume==0) return 0;
	if (!Sounds[url])
	{
		//sound isn't loaded, cache it
		Sounds[url]=new Audio(url);
		Sounds[url].onloadeddata=function(e){PlaySound(url,vol,pitchVar);}
	}
	else if (Sounds[url].readyState>=2)
	{
		var sound=SoundInsts[SoundI];
		SoundI++;
		if (SoundI>=12) SoundI=0;
		sound.src=Sounds[url].src;
		//sound.currentTime=0;
		sound.volume=Math.pow(volume*Game.volume/100,2);
		if (pitchSupport && rate!=0)
		{
			sound.preservesPitch=false;
			sound.mozPreservesPitch=false;
			sound.webkitPreservesPitch=false;
			sound.playbackRate=rate;
		}
		sound.play();
	}
}

if (!Date.now){Date.now=function now() {return new Date().getTime();};}

triggerAnim=function(element,anim)
{
	if (!element) return;
	element.classList.remove(anim);
	void element.offsetWidth;
	element.classList.add(anim);
};

var debugStr='';
var Debug=function(what)
{
	if (!debugStr) debugStr=what;
	else debugStr+='; '+what;
}

var Timer={};
Timer.t=Date.now();
Timer.labels=[];
Timer.smoothed=[];
Timer.reset=function()
{
	Timer.labels=[];
	Timer.t=Date.now();
}
Timer.track=function(label)
{
	if (!Game.sesame) return;
	var now=Date.now();
	if (!Timer.smoothed[label]) Timer.smoothed[label]=0;
	Timer.smoothed[label]+=((now-Timer.t)-Timer.smoothed[label])*0.1;
	Timer.labels[label]='<div style="padding-left:8px;">'+label+' : '+Math.round(Timer.smoothed[label])+'ms</div>';
	Timer.t=now;
}
Timer.clean=function()
{
	if (!Game.sesame) return;
	var now=Date.now();
	Timer.t=now;
}
Timer.say=function(label)
{
	if (!Game.sesame) return;
	Timer.labels[label]='<div style="border-top:1px solid #ccc;">'+label+'</div>';
}


/*=====================================================================================
GAME INITIALIZATION
=======================================================================================*/
var Game={};

Game.Launch=function()
{
	Game.version=VERSION;
	Game.beta=BETA;
	if (window.location.href.indexOf('/beta')>-1) Game.beta=1;
	Game.mobile=0;
	Game.touchEvents=0;
	//if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) Game.mobile=1;
	if (Game.mobile) Game.touchEvents=1;
	
	
	var css=document.createElement('style');
	css.type='text/css';
	css.innerHTML='body .icon,body .crate,body .usesIcon{background-image:url(img/icons.png?v='+Game.version+');}';
	document.head.appendChild(css);
	
	Game.baseSeason='';//halloween, christmas, valentines, fools, easter
	//automatic season detection (might not be 100% accurate)
	var day=Math.floor((new Date()-new Date(new Date().getFullYear(),0,0))/(1000*60*60*24));
	if (day>=41 && day<=46) Game.baseSeason='valentines';
	else if (day>=90 && day<=92) Game.baseSeason='fools';
	else if (day>=304-7 && day<=304) Game.baseSeason='halloween';
	else if (day>=349 && day<=365) Game.baseSeason='christmas';
	else
	{
		//easter is a pain goddamn
		var easterDay=function(Y){var C = Math.floor(Y/100);var N = Y - 19*Math.floor(Y/19);var K = Math.floor((C - 17)/25);var I = C - Math.floor(C/4) - Math.floor((C - K)/3) + 19*N + 15;I = I - 30*Math.floor((I/30));I = I - Math.floor(I/28)*(1 - Math.floor(I/28)*Math.floor(29/(I + 1))*Math.floor((21 - N)/11));var J = Y + Math.floor(Y/4) + I + 2 - C + Math.floor(C/4);J = J - 7*Math.floor(J/7);var L = I - J;var M = 3 + Math.floor((L + 40)/44);var D = L + 28 - 31*Math.floor(M/4);return new Date(Y,M-1,D);}(new Date().getFullYear());
		easterDay=Math.floor((easterDay-new Date(easterDay.getFullYear(),0,0))/(1000*60*60*24));
		if (day>=easterDay-7 && day<=easterDay) Game.baseSeason='easter';
	}
	
	Game.updateLog=
	'<div class="selectable">'+
	'<div class="section">信息</div>'+
	'<div class="subsection">'+
	'<div class="title">关于</div>'+
	'<div class="listing">无尽的饼干是一个JavaScript游戏，作者是 <a href="http://orteil.dashnet.org" target="_blank">Orteil</a> 和 <a href="http://dashnet.org" target="_blank">Opti</a>.</div>'+
	//'<div class="listing">We have an <a href="https://discordapp.com/invite/cookie" target="_blank">official Discord</a>, as well as a <a href="http://forum.dashnet.org" target="_blank">forum</a>; '+
	'<div class="listing">我们有一个 <a href="https://discordapp.com/invite/cookie" target="_blank">官方论坛</a>; '+
		'如果你正在寻求帮助，你可以访问 <a href="http://www.reddit.com/r/CookieClicker" target="_blank">subreddit</a> '+
		'or the <a href="http://cookieclicker.wikia.com/wiki/Cookie_Clicker_Wiki" target="_blank">wiki</a>.</div>'+
	'<div class="listing">新闻和玩笑通常被贴在我的 <a href="http://orteil42.tumblr.com/" target="_blank">tumblr</a> 和 <a href="http://twitter.com/orteil42" target="_blank">twitter</a>.</div>'+
	'<div class="listing" id="supportSection"><b style="color:#fff;opacity:1;">无尽的饼干是100%的免费的, 永远。</b>想要支持我们继续开发游戏吗?这里有一些方法可以帮助你 :<div style="margin:4px 12px;line-height:150%;">'+
	'<br>&bull; 支持我们可以通过 <a href="https://www.patreon.com/dashnet" target="_blank" class="highlightHover" style="background:#f86754;box-shadow:0px 0px 0px 1px #c52921 inset,0px 2px 0px #ff966d inset;text-shadow:0px -1px 0px #ff966d,0px 1px 0px #c52921;text-decoration:none;color:#fff;font-weight:bold;padding:1px 4px;">Patreon</a> <span style="opacity:0.5;">(there\'s perks!)</span>'+
	'<br>&bull; <form target="_blank" action="https://www.paypal.com/cgi-bin/webscr" method="post" id="donate"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="BBN2WL3TC6QH4"><input type="submit" id="donateButton" value="donate" name="submit" alt="PayPal — The safer, easier way to pay online."><img alt="" border="0" src="https://www.paypalobjects.com/nl_NL/i/scr/pixel.gif" width="1" height="1"></form> 通过 PayPal 捐赠我们'+
	'<br>&bull; 关掉广告拦截器<br>&bull; 访问或者购买 <a href="http://www.redbubble.com/people/dashnet" target="_blank">拉德饼干衬衫，帽衫和贴纸</a>!<br>&bull; (如果你想的话!)</div></div>'+
	'<div class="listing warning">注意：如果在更新之后发现新的错误，并且您正在使用第三方附加组件，请确保它不是您的附加组件造成的！</div>'+
	'<div class="listing warning">警告：清除浏览器缓存或Cookie <small>(还有什么？)</small> 将导致你的存档被抹去。 请在之前导出并且先备份您的存档！</div>'+
	
	'</div><div class="subsection">'+
	'<div class="title">更新日志</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">25/10/2018 - feedback loop</div>'+
	'<div class="listing">&bull; added a new building</div>'+
	'<div class="listing">&bull; launched our <a href="https://www.patreon.com/dashnet" class="orangeLink" target="_blank">Patreon</a> <span style="font-size:80%;">(the link is orange so you\'ll notice it!)</span></div>'+
	'<div class="listing">&bull; added a bunch of new heavenly upgrades, one of which ties into our Patreon but benefits everyone (this is still experimental!)</div>'+
	'<div class="listing">&bull; when hovering over grandmas, you can now see their names and ages</div>'+
	'<div class="listing">&bull; "make X cookies just from Y" requirements are now higher</div>'+
	'<div class="listing">&bull; tweaked the prices of some heavenly upgrades to better fit the current cookie economy (it turns out billions of heavenly chips is now very achievable)</div>'+
	'<div class="listing">&bull; building tooltips now display what % of CpS they contribute through synergy upgrades</div>'+
	'<div class="listing">&bull; queenbeets now give up to 4% of bank, down from 6%</div>'+
	'<div class="listing">&bull; among other things, season switches now display how many seasonal upgrades you\'re missing, and permanent upgrade slots now display the name of the slotted upgrade</div>'+
	'<div class="listing">&bull; season switches have reworked prices</div>'+
	'<div class="listing">&bull; season switches can now be cancelled by clicking them again</div>'+
	'<div class="listing">&bull; can no longer accidentally click wrinklers through other elements</div>'+
	'<div class="listing">&bull; sugar frenzy now triples your CpS for an hour instead of doubling it</div>'+
	'<div class="listing">&bull; this text is now selectable</div>'+
	'<div class="listing">&bull; progress on dungeons minigame is still very much ongoing</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">08/08/2018 - hey now</div>'+
	'<div class="listing">&bull; Cookie Clicker somehow turns 5, going against doctors\' most optimistic estimates</div>'+
	'<div class="listing">&bull; added a new tier of building achievements, all named after Smash Mouth\'s classic 1999 hit "All Star"</div>'+
	'<div class="listing">&bull; added a new tier of building upgrades, all named after nothing in particular</div>'+
	'<div class="listing">&bull; <b>to our players :</b> thank you so much for sticking with us all those years and allowing us to keep making the dumbest game known to mankind</div>'+
	'<div class="listing">&bull; resumed work on the dungeons minigame</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">01/08/2018 - 买买买</div>'+
	'<div class="listing">&bull; 增加了一个天堂的升级，让你可以立即购买所有的升级</div>'+
	'<div class="listing">&bull; 添加了一个天堂升级，可以让您看到升级层（由于之前让人混淆，以前被删除了）</div>'+
	'<div class="listing">&bull; 增加了一个新的与皱纹有关的天堂升级。</div>'+
	'<div class="listing">&bull; 添加了一个新的升级层。</div>'+
	'<div class="listing">&bull; 增加了一些新的饼干和成就</div>'+
	'<div class="listing">&bull; 新的“额外的按钮”设置;打开它，增加按钮，让你最小化建筑物</div>'+
	'<div class="listing">&bull; 新的“糖块确认”设置;当你消费糖块时，打开它会显示一个确认提示</div>'+
	'<div class="listing">&bull; 建筑物现在的价格是当前价格的25%(从50%下降);地球碎石机相应地进行了修改，现在降低到50%(从85%减少到50%)</div>'+
	'<div class="listing">&bull; 根据目前的农场数量，农场土壤可以正确地解锁。</div>'+
	'<div class="listing">&bull; 廉价的帽子拥有一种新的令人兴奋的神经细胞</div>'+
	'<div class="listing">&bull; 皱纹增多</div>'+
	'<div class="listing">&bull; 现在可以按ctrl-shift键点击“收割所有”只收获成熟的、非不朽的植物</div>'+
	'<div class="listing">&bull; 添加了一种新的罕见的糖块</div>'+
	'</div><div class="subsection update small">'+
	'<div class="title">20/04/2018 - 修复一些错误</div>'+
	'<div class="listing">&bull; 金色三叶草 and wrinklegills should spawn a bit more often</div>'+
	'<div class="listing">&bull; cronerice matures a lot sooner</div>'+
	'<div class="listing">&bull; mature elderworts stay mature after reloading</div>'+
	'<div class="listing">&bull; garden interface occupies space more intelligently</div>'+
	'<div class="listing">&bull; seed price displays should be better behaved with short numbers disabled</div>'+
	'<div class="listing">&bull; minigame animations are now turned off if using the "Fancy graphics" option is disabled</div>'+
	'<div class="listing">&bull; CpS achievement requirements were dialed down a wee tad</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">19/04/2018 - garden patch</div>'+
	'<div class="listing">&bull; upgrades dropped by garden plants now stay unlocked forever (but drop much more rarely)</div>'+
	'<div class="listing">&bull; garden sugar lump refill now also makes plants spread and mutate 3 times more during the bonus tick</div>'+
	'<div class="listing">&bull; a few new upgrades</div>'+
	'<div class="listing">&bull; a couple bug fixes and rephrasings</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">18/04/2018 - your garden-variety update</div>'+
	'<div class="listing">&bull; added the garden, a minigame unlocked by having at least level 1 farms</div>'+
	'<div class="listing">&bull; added a little arrow and a blinky label to signal the game has updated since you last played it (hi!)</div>'+
	'<div class="listing">&bull; new cookies, milk flavors and achievements</div>'+
	'<div class="listing">&bull; sugar lumps are now unlocked whenever you\'ve baked at least a billion cookies, instead of on your first ascension</div>'+
	'<div class="listing">&bull; sugar lump type now saves correctly</div>'+
	'<div class="listing">&bull; minigame sugar lump refills can now only be done every 15 minutes (timer shared across all minigames)</div>'+
	'<div class="listing">&bull; CpS achievements now have steeper requirements</div>'+
	'<div class="listing">&bull; golden cookies now last 5% shorter for every other golden cookie on the screen</div>'+
	'<div class="listing">&bull; the game now remembers which minigames are closed or open</div>'+
	'<div class="listing">&bull; added a popup that shows when a season starts (so people won\'t be so confused about "the game looking weird today")</div>'+
	'<div class="listing">&bull; permanent upgrade slots now show a tooltip for the selected upgrade</div>'+
	'<div class="listing">&bull; finally fixed the save corruption bug, hopefully</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">24/02/2018 - sugar coating</div>'+
	'<div class="listing">&bull; added link to <a href="https://discordapp.com/invite/cookie" target="_blank">official Discord server</a></div>'+
	'<div class="listing">&bull; felt weird about pushing an update without content so :</div>'+
	'<div class="listing">&bull; added a handful of new cookies</div>'+
	'<div class="listing">&bull; added 3 new heavenly upgrades</div>'+
	'<div class="listing">&bull; short numbers should now be displayed up to novemnonagintillions</div>'+
	'<div class="listing">&bull; cookie chains no longer spawn from the Force the Hand of Fate spell</div>'+
	'<div class="listing">&bull; bigger, better Cookie Clicker content coming later this year</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">08/08/2017 - 4 more years</div>'+
	'<div class="listing">&bull; new building : Chancemakers</div>'+
	'<div class="listing">&bull; new milk, new kittens, new dragon aura, new cookie, new upgrade tier</div>'+
	'<div class="listing">&bull; buffs no longer affect offline CpS</div>'+
	'<div class="listing">&bull; Godzamok\'s hunger was made less potent (this is a nerf, very sorry)</div>'+
	'<div class="listing">&bull; grimoire spell costs and maximum magic work differently</div>'+
	'<div class="listing">&bull; Spontaneous Edifice has been reworked</div>'+
	'<div class="listing">&bull; changed unlock levels and prices for some cursor upgrades</div>'+
	'<div class="listing">&bull; fixed buggy pantheon slots, hopefully</div>'+
	'<div class="listing">&bull; fixed "遗产 started a long while ago" showing as "a few seconds ago"</div>'+
	'<div class="listing">&bull; Cookie Clicker just turned 4. Thank you for sticking with us this long!</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">15/07/2017 - the spiritual update</div>'+
	'<div class="listing">&bull; implemented sugar lumps, which start coalescing if you\'ve ascended at least once and can be used as currency for special things</div>'+
	'<div class="listing">&bull; buildings can now level up by using sugar lumps in the main buildings display, permanently boosting their CpS</div>'+
	'<div class="listing">&bull; added two new features unlocked by levelling up their associated buildings, Temples and Wizard towers; more building-related minigames will be implemented in the future</div>'+
	'<div class="listing">&bull; active buffs are now saved</div>'+
	'<div class="listing">&bull; the background selector upgrade is now functional</div>'+
	'<div class="listing">&bull; the top menu no longer scrolls with the rest</div>'+
	'<div class="listing">&bull; timespans are written nicer</div>'+
	'<div class="listing">&bull; 龙之飞舞 now tend to supercede Click frenzies, you will rarely have both at the same time</div>'+
	'<div class="listing">&bull; some old bugs were phased out and replaced by new ones</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">24/07/2016 - golden cookies overhaul</div>'+
	'<div class="listing">&bull; golden cookies and reindeer now follow a new system involving explicitly defined buffs</div>'+
	'<div class="listing">&bull; a bunch of new golden cookie effects have been added</div>'+
	'<div class="listing">&bull; CpS gains from eggs are now multiplicative</div>'+
	'<div class="listing">&bull; shiny wrinklers are now saved</div>'+
	'<div class="listing">&bull; reindeer have been rebalanced ever so slightly</div>'+
	'<div class="listing">&bull; added a new cookie upgrade near the root of the heavenly upgrade tree; this is intended to boost early ascensions and speed up the game as a whole</div>'+
	'<div class="listing">&bull; due to EU legislation, implemented a warning message regarding browser cookies; do understand that the irony is not lost on us</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">08/02/2016 - 遗产</div>'+
	'<div class="listing"><b>Everything that was implemented during the almost 2-year-long beta has been added to the live game. To recap :</b></div>'+
	'<div class="listing">&bull; 3 new buildings : banks, temples, and wizard towers; these have been added in-between existing buildings and as such, may disrupt some building-related achievements</div>'+
	'<div class="listing">&bull; the ascension system has been redone from scratch, with a new heavenly upgrade tree</div>'+
	'<div class="listing">&bull; mysterious new features such as angel-powered offline progression, challenge runs, and a cookie dragon</div>'+
	'<div class="listing">&bull; sounds have been added (can be disabled in the options)</div>'+
	'<div class="listing">&bull; heaps of rebalancing and bug fixes</div>'+
	'<div class="listing">&bull; a couple more upgrades and achievements, probably</div>'+
	'<div class="listing">&bull; fresh new options to further customize your cookie-clicking experience</div>'+
	'<div class="listing">&bull; quality-of-life improvements : better bulk-buy, better switches etc</div>'+
	'<div class="listing">&bull; added some <a href="http://en.wikipedia.org/wiki/'+choose(['Krzysztof_Arciszewski','Eustachy_Sanguszko','Maurycy_Hauke','Karol_Turno','Tadeusz_Kutrzeba','Kazimierz_Fabrycy','Florian_Siwicki'])+'" target="_blank">general polish</a></div>'+/* i liked this dumb pun too much to let it go unnoticed */
	'<div class="listing">&bull; tons of other little things we can\'t even remember right now</div>'+
	'<div class="listing">Miss the old version? Your old save was automatically exported <a href="http://orteil.dashnet.org/cookieclicker/v10466/" target="_blank">here</a>!</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">05/02/2016 - 遗产 beta, more fixes</div>'+
	'<div class="listing">&bull; added challenge modes, which can be selected when ascending (only 1 for now : "Born again")</div>'+
	'<div class="listing">&bull; changed the way bulk-buying and bulk-selling works</div>'+
	'<div class="listing">&bull; more bugs ironed out</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">03/02/2016 - 遗产 beta, part III</div>'+
	'<div class="listing warning">&bull; Not all bugs have been fixed, but everything should be much less broken.</div>'+
	'<div class="listing">&bull; Additions'+
		'<div style="opacity:0.8;margin-left:12px;">'+
		'-a few more achievements<br>'+
		'-new option for neat, but slow CSS effects (disabled by default)<br>'+
		'-new option for a less grating cookie sound (enabled by default)<br>'+
		'-new option to bring back the boxes around icons in the stats screen<br>'+
		'-new buttons for saving and loading your game to a text file<br>'+
		'</div>'+
	'</div>'+
	'<div class="listing">&bull; Changes'+
		'<div style="opacity:0.8;margin-left:12px;">'+
		'-early game should be a bit faster and very late game was kindly asked to tone it down a tad<br>'+
		'-dragonflight should be somewhat less ridiculously overpowered<br>'+
		'-please let me know if the rebalancing was too heavy or not heavy enough<br>'+
		'-santa and easter upgrades now depend on Santa level and amount of eggs owned, respectively, instead of costing several minutes worth of CpS<br>'+
		'-cookie upgrades now stack multiplicatively rather than additively<br>'+
		'-golden switch now gives +50% CpS, and 残余运气 is +10% CpS per golden cookie upgrade (up from +25% and +1%, respectively)<br>'+
		'-lucky cookies and cookie chain payouts have been modified a bit, possibly for the better, who knows!<br>'+
		'-wrinklers had previously been reduced to a maximum of 8 (10 with a heavenly upgrade), but are now back to 10 (12 with the upgrade)<br>'+
		/*'-all animations are now handled by requestAnimationFrame(), which should hopefully help make the game less resource-intensive<br>'+*/
		'-an ascension now only counts for achievement purposes if you earned at least 1 prestige level from it<br>'+
		'-the emblematic Cookie Clicker font (Kavoon) was bugged in Firefox, and has been replaced with a new font (Merriweather)<br>'+
		'-the mysterious wrinkly creature is now even rarer, but has a shadow achievement tied to it<br>'+
		'</div>'+
	'</div>'+
	'<div class="listing">&bull; Fixes'+
		'<div style="opacity:0.8;margin-left:12px;">'+
		'-prestige now grants +1% CpS per level as intended, instead of +100%<br>'+
		'-heavenly chips should no longer add up like crazy when you ascend<br>'+
		'-upgrades in the store should no longer randomly go unsorted<br>'+
		'-window can be resized to any size again<br>'+
		'-the "Stats" and "Options" buttons have been swapped again<br>'+
		'-the golden cookie sound should be somewhat clearer<br>'+
		'-the ascend screen should be less CPU-hungry<br>'+
		'</div>'+
	'</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">20/12/2015 - 遗产 beta, part II</div>'+
	'<div class="listing warning">&bull; existing beta saves have been wiped due to format inconsistencies and just plain broken balance; you\'ll have to start over from scratch - which will allow you to fully experience the update and find all the awful little bugs that no doubt plague it</div>'+
	'<div class="listing warning">&bull; importing your save from the live version is also fine</div>'+
	'<div class="listing">&bull; we took so long to make this update, Cookie Clicker turned 2 years old in the meantime! Hurray!</div>'+
	'<div class="listing">&bull; heaps of new upgrades and achievements</div>'+
	'<div class="listing">&bull; fixed a whole bunch of bugs</div>'+
	'<div class="listing">&bull; did a lot of rebalancing</div>'+
	'<div class="listing">&bull; reworked heavenly chips and 天堂饼干 (still experimenting, will probably rebalance things further)</div>'+
	'<div class="listing">&bull; you may now unlock a dragon friend</div>'+
	'<div class="listing">&bull; switches and season triggers now have their own store section</div>'+
	'<div class="listing">&bull; ctrl-s and ctrl-o now save the game and open the import menu, respectively</div>'+
	'<div class="listing">&bull; added some quick sounds, just as a test</div>'+
	'<div class="listing">&bull; a couple more options</div>'+
	'<div class="listing">&bull; even more miscellaneous changes and additions</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">25/08/2014 - 遗产 beta, part I</div>'+
	'<div class="listing">&bull; 3 new buildings</div>'+
	'<div class="listing">&bull; price and CpS curves revamped</div>'+
	'<div class="listing">&bull; CpS calculations revamped; cookie upgrades now stack multiplicatively</div>'+
	'<div class="listing">&bull; prestige system redone from scratch, with a whole new upgrade tree</div>'+
	'<div class="listing">&bull; added some <a href="http://en.wikipedia.org/wiki/'+choose(['Krzysztof_Arciszewski','Eustachy_Sanguszko','Maurycy_Hauke','Karol_Turno','Tadeusz_Kutrzeba','Kazimierz_Fabrycy','Florian_Siwicki'])+'" target="_blank">general polish</a></div>'+
	'<div class="listing">&bull; tons of other miscellaneous fixes and additions</div>'+
	'<div class="listing">&bull; Cookie Clicker is now 1 year old! (Thank you guys for all the support!)</div>'+
	'<div class="listing warning">&bull; Note : this is a beta; you are likely to encounter bugs and oversights. Feel free to send me feedback if you find something fishy!</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">18/05/2014 - better late than easter</div>'+
	'<div class="listing">&bull; bunnies and eggs, somehow</div>'+
	'<div class="listing">&bull; prompts now have keyboard shortcuts like system prompts would</div>'+
	'<div class="listing">&bull; naming your bakery? you betcha</div>'+
	'<div class="listing">&bull; "Fast notes" option to make all notifications close faster; new button to close all notifications</div>'+
	'<div class="listing">&bull; the dungeons beta is now available on <a href="http://orteil.dashnet.org/cookieclicker/betadungeons" target="_blank">/betadungeons</a></div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">09/04/2014 - nightmare in heaven</div>'+
	'<div class="listing">&bull; broke a thing; heavenly chips were corrupted for some people</div>'+
	'<div class="listing">&bull; will probably update to /beta first in the future</div>'+
	'<div class="listing">&bull; sorry again</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">09/04/2014 - quality of life</div>'+
	'<div class="listing">&bull; new upgrade and achievement tier</div>'+
	'<div class="listing">&bull; popups and prompts are much nicer</div>'+
	'<div class="listing">&bull; tooltips on buildings are more informative</div>'+
	'<div class="listing">&bull; implemented a simplified version of the <a href="https://github.com/Icehawk78/FrozenCookies" target="_blank">Frozen Cookies</a> add-on\'s short number formatting</div>'+
	'<div class="listing">&bull; you can now buy 10 and sell all of a building at a time</div>'+
	'<div class="listing">&bull; tons of optimizations and subtler changes</div>'+
	'<div class="listing">&bull; you can now <a href="http://orteil.dashnet.org/cookies2cash/" target="_blank">convert your cookies to cash</a>!</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">05/04/2014 - pity the fool</div>'+
	'<div class="listing">&bull; wrinklers should now be saved so you don\'t have to pop them everytime you refresh the game</div>'+
	'<div class="listing">&bull; you now properly win 1 cookie upon reaching 10 billion cookies and making it on the local news</div>'+
	'<div class="listing">&bull; miscellaneous fixes and tiny additions</div>'+
	'<div class="listing">&bull; added a few very rudimentary mod hooks</div>'+
	'<div class="listing">&bull; the game should work again in Opera</div>'+
	'<div class="listing">&bull; don\'t forget to check out <a href="http://orteil.dashnet.org/randomgen/" target="_blank">RandomGen</a>, our all-purpose random generator maker!</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">01/04/2014 - fooling around</div>'+
	'<div class="listing">&bull; it\'s about time : Cookie Clicker has turned into the much more realistic Cookie Baker</div>'+
	'<div class="listing">&bull; season triggers are cheaper and properly unlock again when they run out</div>'+
	'<div class="listing">&bull; buildings should properly unlock (reminder : building unlocking is completely cosmetic and does not change the gameplay)</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">14/02/2014 - lovely rainbowcalypse</div>'+
	'<div class="listing">&bull; new building (it\'s been a while). More to come!</div>'+
	'<div class="listing">&bull; you can now trigger seasonal events to your heart\'s content (upgrade unlocks at 5000 heavenly chips)</div>'+
	'<div class="listing">&bull; new ultra-expensive batch of seasonal cookie upgrades you\'ll love to hate</div>'+
	'<div class="listing">&bull; new timer bars for golden cookie buffs</div>'+
	'<div class="listing">&bull; buildings are now hidden when you start out and appear as they become available</div>'+
	'<div class="listing">&bull; technical stuff : the game is now saved through localstorage instead of browser cookies, therefore ruining a perfectly good pun</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">22/12/2013 - merry fixmas</div>'+
	'<div class="listing">&bull; some issues with the christmas upgrades have been fixed</div>'+
	'<div class="listing">&bull; reindeer cookie drops are now more common</div>'+
	'<div class="listing">&bull; reindeers are now reindeer</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">20/12/2013 - Christmas is here</div>'+
	'<div class="listing">&bull; there is now a festive new evolving upgrade in store</div>'+
	'<div class="listing">&bull; reindeer are running amok (catch them if you can!)</div>'+
	'<div class="listing">&bull; added a new option to warn you when you close the window, so you don\'t lose your un-popped wrinklers</div>'+
	'<div class="listing">&bull; also added a separate option for displaying cursors</div>'+
	'<div class="listing">&bull; all the Halloween features are still there (and having the Spooky cookies achievements makes the Halloween cookies drop much more often)</div>'+
	'<div class="listing">&bull; oh yeah, we now have <a href="http://www.redbubble.com/people/dashnet" target="_blank">Cookie Clicker shirts, stickers and hoodies</a>! (they\'re really rad)</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">29/10/2013 - spooky update</div>'+
	'<div class="listing">&bull; the Grandmapocalypse now spawns wrinklers, hideous elderly creatures that damage your CpS when they reach your big cookie. Thankfully, you can click on them to make them explode (you\'ll even gain back the cookies they\'ve swallowed - with interest!).</div>'+
	'<div class="listing">&bull; wrath cookie now 27% spookier</div>'+
	'<div class="listing">&bull; some other stuff</div>'+
	'<div class="listing">&bull; you should totally go check out <a href="http://candybox2.net/" target="_blank">Candy Box 2</a>, the sequel to the game that inspired Cookie Clicker</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">15/10/2013 - it\'s a secret</div>'+
	'<div class="listing">&bull; added a new heavenly upgrade that gives you 5% of your heavenly chips power for 11 cookies (if you purchased the 天国的钥匙, you might need to buy it again, sorry)</div>'+
	'<div class="listing">&bull; golden cookie chains should now work properly</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">15/10/2013 - player-friendly</div>'+
	'<div class="listing">&bull; heavenly upgrades are now way, way cheaper</div>'+
	'<div class="listing">&bull; tier 5 building upgrades are 5 times cheaper</div>'+
	'<div class="listing">&bull; cursors now just plain disappear with Fancy Graphics off, I might add a proper option to toggle only the cursors later</div>'+
	'<div class="listing">&bull; warning : the Cookie Monster add-on seems to be buggy with this update, you might want to wait until its programmer updates it</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">15/10/2013 - a couple fixes</div>'+
	'<div class="listing">&bull; golden cookies should no longer spawn embarrassingly often</div>'+
	'<div class="listing">&bull; cursors now stop moving if Fancy Graphics is turned off</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">14/10/2013 - going for the gold</div>'+
	'<div class="listing">&bull; golden cookie chains work a bit differently</div>'+
	'<div class="listing">&bull; golden cookie spawns are more random</div>'+
	'<div class="listing">&bull; CpS achievements are no longer affected by golden cookie frenzies</div>'+
	'<div class="listing">&bull; revised cookie-baking achievement requirements</div>'+
	'<div class="listing">&bull; heavenly chips now require upgrades to function at full capacity</div>'+
	'<div class="listing">&bull; added 4 more cookie upgrades, unlocked after reaching certain amounts of Heavenly Chips</div>'+
	'<div class="listing">&bull; speed baking achievements now require you to have no heavenly upgrades; as such, they have been reset for everyone (along with the Hardcore achievement) to better match their initially intended difficulty</div>'+
	'<div class="listing">&bull; made good progress on the mobile port</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">01/10/2013 - smoothing it out</div>'+
	'<div class="listing">&bull; some visual effects have been completely rewritten and should now run more smoothly (and be less CPU-intensive)</div>'+
	'<div class="listing">&bull; new upgrade tier</div>'+
	'<div class="listing">&bull; new milk tier</div>'+
	'<div class="listing">&bull; cookie chains have different capping mechanics</div>'+
	'<div class="listing">&bull; antimatter condensers are back to their previous price</div>'+
	'<div class="listing">&bull; heavenly chips now give +2% CpS again (they will be extensively reworked in the future)</div>'+
	'<div class="listing">&bull; farms have been buffed a bit (to popular demand)</div>'+
	'<div class="listing">&bull; dungeons still need a bit more work and will be released soon - we want them to be just right! (you can test an unfinished version in <a href="http://orteil.dashnet.org/cookieclicker/betadungeons/" target="_blank">the beta</a>)</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">28/09/2013 - dungeon beta</div>'+
	'<div class="listing">&bull; from now on, big updates will come through a beta stage first (you can <a href="http://orteil.dashnet.org/cookieclicker/betadungeons/" target="_blank">try it here</a>)</div>'+
	'<div class="listing">&bull; first dungeons! (you need 50 factories to unlock them!)</div>'+
	'<div class="listing">&bull; cookie chains can be longer</div>'+
	'<div class="listing">&bull; antimatter condensers are a bit more expensive</div>'+
	'<div class="listing">&bull; heavenly chips now only give +1% cps each (to account for all the cookies made from condensers)</div>'+
	'<div class="listing">&bull; added flavor text on all upgrades</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">15/09/2013 - anticookies</div>'+
	'<div class="listing">&bull; ran out of regular matter to make your cookies? Try our new antimatter condensers!</div>'+
	'<div class="listing">&bull; renamed Hard-reset to "Wipe save" to avoid confusion</div>'+
	'<div class="listing">&bull; reset achievements are now regular achievements and require cookies baked all time, not cookies in bank</div>'+
	'<div class="listing">&bull; heavenly chips have been nerfed a bit (and are now awarded following a geometric progression : 1 trillion for the first, 2 for the second, etc); the prestige system will be extensively reworked in a future update (after dungeons)</div>'+
	'<div class="listing">&bull; golden cookie clicks are no longer reset by soft-resets</div>'+
	'<div class="listing">&bull; you can now see how long you\'ve been playing in the stats</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">08/09/2013 - everlasting cookies</div>'+
	'<div class="listing">&bull; added a prestige system - resetting gives you permanent CpS boosts (the more cookies made before resetting, the bigger the boost!)</div>'+
	'<div class="listing">&bull; save format has been slightly modified to take less space</div>'+
	'<div class="listing">&bull; Leprechaun has been bumped to 777 golden cookies clicked and is now shadow; Fortune is the new 77 golden cookies achievement</div>'+
	'<div class="listing">&bull; clicking frenzy is now x777</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">04/09/2013 - smarter cookie</div>'+
	'<div class="listing">&bull; golden cookies only have 20% chance of giving the same outcome twice in a row now</div>'+
	'<div class="listing">&bull; added a golden cookie upgrade</div>'+
	'<div class="listing">&bull; added an upgrade that makes pledges last twice as long (requires having pledged 10 times)</div>'+
	'<div class="listing">&bull; Quintillion fingers is now twice as efficient</div>'+
	'<div class="listing">&bull; Uncanny clicker was really too unpredictable; it is now a regular achievement and no longer requires a world record, just *pretty fast* clicking</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">02/09/2013 - a better way out</div>'+
	'<div class="listing">&bull; 老人契约heaper, and revoking it is cheaper still (also added a new achievement for getting it)</div>'+
	'<div class="listing">&bull; each grandma upgrade now requires 15 of the matching building</div>'+
	'<div class="listing">&bull; the dreaded bottom cursor has been fixed with a new cursor display style</div>'+
	'<div class="listing">&bull; added an option for faster, cheaper graphics</div>'+
	'<div class="listing">&bull; base64 encoding has been redone; this might make saving possible again on some older browsers</div>'+
	'<div class="listing">&bull; shadow achievements now have their own section</div>'+
	'<div class="listing">&bull; raspberry juice is now named raspberry milk, despite raspberry juice being delicious and going unquestionably well with cookies</div>'+
	'<div class="listing">&bull; HOTFIX : cursors now click; fancy graphics button renamed; cookies amount now more visible against cursors</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">01/09/2013 - sorting things out</div>'+
	'<div class="listing">&bull; upgrades and achievements are properly sorted in the stats screen</div>'+
	'<div class="listing">&bull; made 老人契约 much cheaper and less harmful</div>'+
	'<div class="listing">&bull; importing from the first version has been disabled, as promised</div>'+
	'<div class="listing">&bull; "同心协力" now actually asks you to confirm the upgrade</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">31/08/2013 - hotfixes</div>'+
	'<div class="listing">&bull; added a way to permanently stop the grandmapocalypse</div>'+
	'<div class="listing">&bull; 老人的承诺 price is now capped</div>'+
	'<div class="listing">&bull; 同心协力 and other grandma research upgrades are now a little more powerful, if not 100% accurate</div>'+
	'<div class="listing">&bull; "golden" cookie now appears again during grandmapocalypse; 老人的承诺-related achievements are now unlockable</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">31/08/2013 - too many grandmas</div>'+
	'<div class="listing">&bull; the grandmapocalypse is back, along with more grandma types</div>'+
	'<div class="listing">&bull; added some upgrades that boost your clicking power and make it scale with your cps</div>'+
	'<div class="listing">&bull; clicking achievements made harder; Neverclick is now a shadow achievement; Uncanny clicker should now truly be a world record</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">28/08/2013 - over-achiever</div>'+
	'<div class="listing">&bull; added a few more achievements</div>'+
	'<div class="listing">&bull; reworked the "Bake X cookies" achievements so they take longer to achieve</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">27/08/2013 - a bad idea</div>'+
	'<div class="listing">&bull; due to popular demand, retired 5 achievements (the "reset your game" and "cheat" ones); they can still be unlocked, but do not count toward your total anymore. Don\'t worry, there will be many more achievements soon!</div>'+
	'<div class="listing">&bull; made some achievements hidden for added mystery</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">27/08/2013 - a sense of achievement</div>'+
	'<div class="listing">&bull; added achievements (and milk)</div>'+
	'<div class="listing"><i>(this is a big update, please don\'t get too mad if you lose some data!)</i></div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">26/08/2013 - new upgrade tier</div>'+
	'<div class="listing">&bull; added some more upgrades (including a couple golden cookie-related ones)</div>'+
	'<div class="listing">&bull; added clicking stats</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">26/08/2013 - more tweaks</div>'+
	'<div class="listing">&bull; tweaked a couple cursor upgrades</div>'+
	'<div class="listing">&bull; made time machines less powerful</div>'+
	'<div class="listing">&bull; added offline mode option</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">25/08/2013 - tweaks</div>'+
	'<div class="listing">&bull; rebalanced progression curve (mid- and end-game objects cost more and give more)</div>'+
	'<div class="listing">&bull; added some more cookie upgrades</div>'+
	'<div class="listing">&bull; added CpS for cursors</div>'+
	'<div class="listing">&bull; added sell button</div>'+
	'<div class="listing">&bull; made golden cookie more useful</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">24/08/2013 - hotfixes</div>'+
	'<div class="listing">&bull; added import/export feature, which also allows you to retrieve a save game from the old version (will be disabled in a week to prevent too much cheating)</div>'+
	'<div class="listing">&bull; upgrade store now has unlimited slots (just hover over it), due to popular demand</div>'+
	'<div class="listing">&bull; added update log</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">24/08/2013 - big update!</div>'+
	'<div class="listing">&bull; revamped the whole game (new graphics, new game mechanics)</div>'+
	'<div class="listing">&bull; added upgrades</div>'+
	'<div class="listing">&bull; much safer saving</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">08/08/2013 - game launch</div>'+
	'<div class="listing">&bull; made the game in a couple hours, for laughs</div>'+
	'<div class="listing">&bull; kinda starting to regret it</div>'+
	'<div class="listing">&bull; ah well</div>'+
	'</div>'+
	'</div>'
	;
	
	Game.ready=0;
	
	Game.Load=function()
	{
		//l('javascriptError').innerHTML='<div style="padding:64px 128px;"><div class="title">Loading...</div></div>';
		Game.Loader=new Loader();
		Game.Loader.domain='img/';
		Game.Loader.loaded=Game.Init;
		Game.Loader.Load(['filler.png']);
	}
	Game.ErrorFrame=function()
	{
		l('javascriptError').innerHTML=
		'<div class="title">哎呀。 错误的地址！</div>'+
		'<div>看起来您正在从其他链接访问《无尽的饼干》而不是官方链接。<br>'+
		'你可以 <a href="http://orteil.dashnet.org/cookieclicker/" target="_blank">点这里玩官方英文版</a>!<br>'+
		'<small>(如果由于任何原因，您无法通过官方网址访问游戏，我们目前正在开发第二个域名。)</small></div>';
	}
	
	
	Game.Init=function()
	{
		Game.ready=1;

		/*=====================================================================================
		VARIABLES AND PRESETS
		=======================================================================================*/
		Game.T=0;
		Game.drawT=0;
		Game.loopT=0;
		Game.fps=30;
		
		Game.season=Game.baseSeason;
		
		Game.l=l('game');
		Game.bounds=0;//rectangle defining screen limits (right,left,bottom,top) updated every logic frame

		if (Game.mobile==1)
		{
			l('wrapper').className='mobile';
		}
		Game.clickStr=Game.touchEvents?'ontouchend':'onclick';
		
		Game.SaveTo='CookieClickerGame';
		if (Game.beta) Game.SaveTo='CookieClickerGameBeta';
		l('versionNumber').innerHTML='v. '+Game.version+(Game.beta?' <span style="color:#ff0;">beta</span>':'');
		
		if (Game.beta) {var me=l('linkVersionBeta');me.parentNode.removeChild(me);}
		else if (Game.version==1.0466) {var me=l('linkVersionOld');me.parentNode.removeChild(me);}
		else {var me=l('linkVersionLive');me.parentNode.removeChild(me);}

		//l('links').innerHTML=(Game.beta?'<a href="../" target="blank">Live version</a> | ':'<a href="beta" target="blank">Try the beta!</a> | ')+'<a href="http://orteil.dashnet.org/experiments/cookie/" target="blank">Classic</a>';
		//l('links').innerHTML='<a href="http://orteil.dashnet.org/experiments/cookie/" target="blank">Cookie Clicker Classic</a>';
		
		//latency compensator stuff
		Game.time=Date.now();
		Game.accumulatedDelay=0;
		Game.catchupLogic=0;
		Game.fpsStartTime=0;
		Game.frameNumber=0;
		Game.currentFps=Game.fps;
		Game.previousFps=Game.currentFps;
		Game.getFps=function()
		{
			Game.frameNumber++;
			var currentTime=(Date.now()-Game.fpsStartTime )/1000;
			var result=Math.floor((Game.frameNumber/currentTime));
			if (currentTime>1)
			{
				Game.fpsStartTime=Date.now();
				Game.frameNumber=0;
			}
			return result;
		}
		
		Game.cookiesEarned=0;//all cookies earned during gameplay
		Game.cookies=0;//cookies
		Game.cookiesd=0;//cookies display
		Game.cookiesPs=1;//cookies per second (to recalculate with every new purchase)
		Game.cookiesReset=0;//cookies lost to resetting (used to determine prestige and heavenly chips)
		Game.cookieClicks=0;//+1 for each click on the cookie
		Game.goldenClicks=0;//+1 for each golden cookie clicked (all time)
		Game.goldenClicksLocal=0;//+1 for each golden cookie clicked (this game only)
		Game.missedGoldenClicks=0;//+1 for each golden cookie missed
		Game.handmadeCookies=0;//all the cookies made from clicking the cookie
		Game.milkProgress=0;//you gain a little bit for each achievement. Each increment of 1 is a different milk displayed.
		Game.milkH=Game.milkProgress/2;//milk height, between 0 and 1 (although should never go above 0.5)
		Game.milkHd=0;//milk height display
		Game.milkType=0;//custom milk
		Game.bgType=0;//custom background
		Game.chimeType=0;//golden cookie chime
		Game.prestige=0;//prestige level (recalculated depending on Game.cookiesReset)
		Game.heavenlyChips=0;//heavenly chips the player currently has
		Game.heavenlyChipsDisplayed=0;//ticks up or down to match Game.heavenlyChips
		Game.heavenlyChipsSpent=0;//heavenly chips spent on cookies, upgrades and such
		Game.heavenlyCookies=0;//how many cookies have we baked from chips (unused)
		Game.permanentUpgrades=[-1,-1,-1,-1,-1];
		Game.ascensionMode=0;//type of challenge run if any
		Game.resets=0;//reset counter
		Game.lumps=-1;//sugar lumps
		Game.lumpsTotal=-1;//sugar lumps earned across all playthroughs (-1 means they haven't even started yet)
		Game.lumpT=Date.now();//time when the current lump started forming
		Game.lumpRefill=0;//time when we last used a sugar lump (on minigame refills etc)
		
		Game.makeSeed=function()
		{
			var chars='abcdefghijklmnopqrstuvwxyz'.split('');
			var str='';
			for (var i=0;i<5;i++){str+=choose(chars);}
			return str;
		}
		Game.seed=Game.makeSeed();//each run has its own seed, used for deterministic random stuff
		
		Game.volume=50;//sound volume
		
		Game.elderWrath=0;
		Game.elderWrathOld=0;
		Game.elderWrathD=0;
		Game.pledges=0;
		Game.pledgeT=0;
		Game.researchT=0;
		Game.nextResearch=0;
		Game.cookiesSucked=0;//cookies sucked by wrinklers
		Game.cpsSucked=0;//percent of CpS being sucked by wrinklers
		Game.wrinklersPopped=0;
		Game.santaLevel=0;
		Game.reindeerClicked=0;
		Game.seasonT=0;
		Game.seasonUses=0;
		Game.dragonLevel=0;
		Game.dragonAura=0;
		Game.dragonAura2=0;
		
		Game.blendModesOn=(document.createElement('detect').style.mixBlendMode==='');
		
		Game.bg='';//background (grandmas and such)
		Game.bgFade='';//fading to background
		Game.bgR=0;//ratio (0 - not faded, 1 - fully faded)
		Game.bgRd=0;//ratio displayed
		
		Game.windowW=window.innerWidth;
		Game.windowH=window.innerHeight;
		
		window.addEventListener('resize',function(event)
		{
			Game.windowW=window.innerWidth;
			Game.windowH=window.innerHeight;
			
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				me.toResize=true;
				if (me.minigame && me.minigame.onResize) me.minigame.onResize();
			}
		});
		
		Game.startDate=parseInt(Date.now());//when we started playing
		Game.fullDate=parseInt(Date.now());//when we started playing (carries over with resets)
		Game.lastDate=parseInt(Date.now());//when we last saved the game (used to compute "cookies made since we closed the game" etc)
		
		Game.prefs=[];
		Game.DefaultPrefs=function()
		{
			Game.prefs.particles=1;//particle effects : falling cookies etc
			Game.prefs.numbers=1;//numbers that pop up when clicking the cookie
			Game.prefs.autosave=1;//save the game every minute or so
			Game.prefs.autoupdate=1;//send an AJAX request to the server every 30 minutes (note : ignored)
			Game.prefs.milk=1;//display milk
			Game.prefs.fancy=1;//CSS shadow effects (might be heavy on some browsers)
			Game.prefs.warn=0;//warn before closing the window
			Game.prefs.cursors=1;//display cursors
			Game.prefs.focus=1;//make the game refresh less frequently when off-focus
			Game.prefs.popups=0;//use old-style popups
			Game.prefs.format=0;//shorten numbers
			Game.prefs.notifs=0;//notifications fade faster
			Game.prefs.animate=1;//animate buildings
			Game.prefs.wobbly=1;//wobbly cookie
			Game.prefs.monospace=0;//alt monospace font for cookies
			Game.prefs.filters=0;//CSS filter effects (might be heavy on some browsers)
			Game.prefs.cookiesound=1;//use new cookie click sound
			Game.prefs.crates=0;//show crates around icons in stats
			Game.prefs.altDraw=0;//use requestAnimationFrame to update drawing instead of fixed 30 fps setTimeout
			Game.prefs.showBackupWarning=1;//if true, show a "Have you backed up your save?" message on save load; set to false when save is exported
			Game.prefs.extraButtons=1;//if true, show Mute buttons and the building master bar
			Game.prefs.askLumps=0;//if true, show a prompt before spending lumps
			Game.prefs.customGrandmas=1;//if true, show patreon names for grandmas
		}
		Game.DefaultPrefs();
		
		window.onbeforeunload=function(event)
		{
			if (Game.prefs && Game.prefs.warn)
			{
				if (typeof event=='undefined') event=window.event;
				if (event) event.returnValue='您确定要关闭游戏吗?';
			}
		}
		
		Game.Mobile=function()
		{
			if (!Game.mobile)
			{
				l('wrapper').className='mobile';
				Game.mobile=1;
			}
			else
			{
				l('wrapper').className='';
				Game.mobile=0;
			}
		}
		
		Game.showBackupWarning=function()
		{
			Game.Notify('备份你的游戏存档！','再一次问好！ 只是提醒一下，为了以防万一，您可能需要每隔一段时间备份您的游戏存档。<br>要做到这一点，进入选项并点击“导出存档”或“保存到文件”！<div class="line"></div><a style="float:right;" onclick="Game.prefs.showBackupWarning=0;==CLOSETHIS()==">不再提示</a>',[25,7]);
		}
		
		/*=====================================================================================
		MOD HOOKS (will be subject to change, probably shouldn't be used yet)
		=======================================================================================*/
		//really primitive custom mods support - might not be of any use at all (could theoretically be used for custom upgrades and achievements I guess?)
		Game.customChecks=[];//push functions into this to add them to the "check for upgrade/achievement conditions" that happens every few seconds
		Game.customInit=[];//add to the initialization call
		Game.customLogic=[];//add to the logic calls
		Game.customDraw=[];//add to the draw calls
		Game.customSave=[];//add to the save write calls (save to your own localstorage key)
		Game.customLoad=[];//add to the save load calls
		Game.customReset=[];//add to the reset calls
		Game.customTickers=[];//add to the random tickers (functions should return arrays of text)
		Game.customCps=[];//add to the CpS computation (functions should return something to add to the multiplier ie. 0.1 for an addition of 10 to the CpS multiplier)
		Game.customCpsMult=[];//add to the CpS multiplicative computation (functions should return something to multiply by the multiplier ie. 1.05 for a 5% increase of the multiplier)
		Game.customMouseCps=[];//add to the cookies earned per click computation (functions should return something to add to the multiplier ie. 0.1 for an addition of 10 to the CpS multiplier)
		Game.customMouseCpsMult=[];//add to the cookies earned per click multiplicative computation (functions should return something to multiply by the multiplier ie. 1.05 for a 5% increase of the multiplier)
		Game.customCookieClicks=[];//add to the cookie click calls
		Game.customCreate=[];//create your new upgrades and achievements in there

		Game.LoadMod=function(url)//this loads the mod at the given URL and gives the script an automatic id (URL "http://example.com/my_mod.js" gives the id "modscript_my_mod")
		{
			var js=document.createElement('script');
			var id=url.split('/');id=id[id.length-1].split('.')[0];
			js.setAttribute('type','text/javascript');
			js.setAttribute('id','modscript_'+id);
			js.setAttribute('src',url);
			document.head.appendChild(js);
			console.log('Loaded the mod '+url+', '+id+'.');
		}
		
		//replacing an existing canvas picture with a new one at runtime : Game.Loader.Replace('perfectCookie.png','imperfectCookie.png');
		//upgrades and achievements can use other pictures than icons.png; declare their icon with [posX,posY,'http://example.com/myIcons.png']
		//check out the "UNLOCKING STUFF" section to see how unlocking achievs and upgrades is done (queue yours in Game.customChecks)
		//if you're making a mod, don't forget to add a Game.Win('Third-party') somewhere in there!
		
		//IMPORTANT : all of the above is susceptible to heavy change, proper modding API in the works
		
		
		
		
		/*=====================================================================================
		BAKERY NAME
		=======================================================================================*/
		Game.RandomBakeryName=function()
		{
			return (Math.random()>0.05?(choose(['Magic','Fantastic','Fancy','Sassy','Snazzy','Pretty','Cute','Pirate','Ninja','Zombie','Robot','Radical','Urban','Cool','Hella','Sweet','Awful','Double','Triple','Turbo','Techno','Disco','Electro','Dancing','Wonder','Mutant','Space','Science','Medieval','Future','Captain','Bearded','Lovely','Tiny','Big','Fire','Water','Frozen','Metal','Plastic','Solid','Liquid','Moldy','Shiny','Happy','Happy Little','Slimy','Tasty','Delicious','Hungry','Greedy','Lethal','Professor','Doctor','Power','Chocolate','Crumbly','Choklit','Righteous','Glorious','Mnemonic','Psychic','Frenetic','Hectic','Crazy','Royal','El','Von'])+' '):'Mc')+choose(['Cookie','Biscuit','Muffin','Scone','Cupcake','Pancake','Chip','Sprocket','Gizmo','Puppet','Mitten','Sock','Teapot','Mystery','Baker','Cook','Grandma','Click','Clicker','Spaceship','Factory','Portal','Machine','Experiment','Monster','Panic','Burglar','Bandit','Booty','Potato','Pizza','Burger','Sausage','Meatball','Spaghetti','Macaroni','Kitten','Puppy','Giraffe','Zebra','Parrot','Dolphin','Duckling','Sloth','Turtle','Goblin','Pixie','Gnome','Computer','Pirate','Ninja','Zombie','Robot']);
		}
		Game.GetBakeryName=function() {return Game.RandomBakeryName();}
		Game.bakeryName=Game.GetBakeryName();
		Game.bakeryNameL=l('bakeryName');
		Game.bakeryNameL.innerHTML=Game.bakeryName+'的面包店';
		Game.bakeryNameSet=function(what)
		{
			Game.bakeryName=what.replace(/\W+/g,' ');
			Game.bakeryName=Game.bakeryName.substring(0,28);
			Game.bakeryNameRefresh();
		}
		Game.bakeryNameRefresh=function()
		{
			var name=Game.bakeryName;
			if (name.slice(-1).toLowerCase()=='s') name+='面包店'; else name+='的面包店';
			Game.bakeryNameL.innerHTML=name;
			name=Game.bakeryName.toLowerCase();
			if (name=='orteil') Game.Win('上帝情结');
			if (name.indexOf('saysopensesame',name.length-('saysopensesame').length)>0 && !Game.sesame) Game.OpenSesame();
			Game.recalculateGains=1;
		}
		Game.bakeryNamePrompt=function()
		{
			Game.Prompt('<h3>命名你的面包店</h3><div class="block" style="text-align:center;">你想给面包店起个什么名字？</div><div class="block"><input type="text" style="text-align:center;width:100%;" id="bakeryNameInput" value="'+Game.bakeryName+'"/></div>',[['确定','if (l(\'bakeryNameInput\').value.length>0) {Game.bakeryNameSet(l(\'bakeryNameInput\').value);Game.Win(\'什么名字\');Game.ClosePrompt();}'],['随机','Game.bakeryNamePromptRandom();'],'取消']);
			l('bakeryNameInput').focus();
			l('bakeryNameInput').select();
		}
		Game.bakeryNamePromptRandom=function()
		{
			l('bakeryNameInput').value=Game.RandomBakeryName();
		}
		AddEvent(Game.bakeryNameL,'click',Game.bakeryNamePrompt);
		
		
		/*=====================================================================================
		TOOLTIP
		=======================================================================================*/
		Game.tooltip={text:'',x:0,y:0,origin:'',on:0,tt:l('tooltip'),tta:l('tooltipAnchor'),shouldHide:1,dynamic:0,from:0};
		Game.tooltip.draw=function(from,text,origin)
		{
			this.shouldHide=0;
			this.text=text;
			this.from=from;
			//this.x=x;
			//this.y=y;
			this.origin=origin;
			var tt=this.tt;
			var tta=this.tta;
			tt.style.left='auto';
			tt.style.top='auto';
			tt.style.right='auto';
			tt.style.bottom='auto';
			tt.innerHTML=(typeof this.text==='function')?unescape(this.text()):unescape(this.text);
			tta.style.display='block';
			tta.style.visibility='hidden';
			Game.tooltip.update();
			tta.style.visibility='visible';
			this.on=1;
		}
		Game.tooltip.update=function()
		{
			var X=0;
			var Y=0;
			var width=this.tt.offsetWidth;
			var height=this.tt.offsetHeight;
			if (this.origin=='store')
			{
				X=Game.windowW-332-width;
				Y=Game.mouseY-32;
				if (Game.onCrate) Y=Game.onCrate.getBoundingClientRect().top-42;
				Y=Math.max(0,Math.min(Game.windowH-height-44,Y));
				/*this.tta.style.right='308px';//'468px';
				this.tta.style.left='auto';
				if (Game.onCrate) Y=Game.onCrate.getBoundingClientRect().top-2;
				this.tta.style.top=Math.max(0,Math.min(Game.windowH-this.tt.clientHeight-64,Y-48))+'px';*/
			}
			else
			{
				if (Game.onCrate)
				{
					var rect=Game.onCrate.getBoundingClientRect();
					rect={left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom};
					if (rect.left==0 && rect.top==0)//if we get that bug where we get stuck in the top-left, move to the mouse (REVISION : just do nothing)
					{return false;/*rect.left=Game.mouseX-24;rect.right=Game.mouseX+24;rect.top=Game.mouseY-24;rect.bottom=Game.mouseY+24;*/}
					if (this.origin=='left')
					{
						X=rect.left-width-16;
						Y=rect.top+(rect.bottom-rect.top)/2-height/2-38;
						Y=Math.max(0,Math.min(Game.windowH-height-19,Y));
						if (X<0) X=rect.right;
					}
					else
					{
						X=rect.left+(rect.right-rect.left)/2-width/2-8;
						Y=rect.top-height-48;
						X=Math.max(0,Math.min(Game.windowW-width-16,X));
						if (Y<0) Y=rect.bottom-32;
					}
				}
				else if (this.origin=='bottom-right')
				{
					X=Game.mouseX+8;
					Y=Game.mouseY-32;
					X=Math.max(0,Math.min(Game.windowW-width-16,X));
					Y=Math.max(0,Math.min(Game.windowH-height-64,Y));
				}
				else if (this.origin=='bottom')
				{
					X=Game.mouseX-width/2-8;
					Y=Game.mouseY+24;
					X=Math.max(0,Math.min(Game.windowW-width-16,X));
					Y=Math.max(0,Math.min(Game.windowH-height-64,Y));
				}
				else if (this.origin=='left')
				{
					X=Game.mouseX-width-24;
					Y=Game.mouseY-height/2-8;
					X=Math.max(0,Math.min(Game.windowW-width-16,X));
					Y=Math.max(0,Math.min(Game.windowH-height-64,Y));
				}
				else if (this.origin=='this' && this.from)
				{
					var rect=this.from.getBoundingClientRect();
					X=(rect.left+rect.right)/2-width/2-8;
					Y=(rect.top)-this.tt.clientHeight-48;
					X=Math.max(0,Math.min(Game.windowW-width-16,X));
					//Y=Math.max(0,Math.min(Game.windowH-this.tt.clientHeight-64,Y));
					if (Y<0) Y=(rect.bottom-24);
					if (Y+height+40>Game.windowH)
					{
						X=rect.right+8;
						Y=rect.top+(rect.bottom-rect.top)/2-height/2-38;
						Y=Math.max(0,Math.min(Game.windowH-height-19,Y));
					}
				}
				else
				{
					X=Game.mouseX-width/2-8;
					Y=Game.mouseY-height-32;
					X=Math.max(0,Math.min(Game.windowW-width-16,X));
					Y=Math.max(0,Math.min(Game.windowH-height-64,Y));
				}
			}
			this.tta.style.left=X+'px';
			this.tta.style.right='auto';
			this.tta.style.top=Y+'px';
			this.tta.style.bottom='auto';
			if (this.shouldHide) {this.hide();this.shouldHide=0;}
			if (Game.drawT%10==0 && typeof(this.text)=='function')
			{
				this.tt.innerHTML=unescape(this.text());
			}
		}
		Game.tooltip.hide=function()
		{
			this.tta.style.display='none';
			this.dynamic=0;
			this.on=0;
		}
		Game.getTooltip=function(text,origin,isCrate)
		{
			origin=(origin?origin:'middle');
			if (isCrate) return 'onMouseOut="Game.setOnCrate(0);Game.tooltip.shouldHide=1;" onMouseOver="if (!Game.mouseDown) {Game.setOnCrate(this);Game.tooltip.dynamic=0;Game.tooltip.draw(this,\''+escape(text)+'\',\''+origin+'\');Game.tooltip.wobble();}"';
			else return 'onMouseOut="Game.tooltip.shouldHide=1;" onMouseOver="Game.tooltip.dynamic=0;Game.tooltip.draw(this,\''+escape(text)+'\',\''+origin+'\');Game.tooltip.wobble();"';
		}
		Game.getDynamicTooltip=function(func,origin,isCrate)
		{
			origin=(origin?origin:'middle');
			if (isCrate) return 'onMouseOut="Game.setOnCrate(0);Game.tooltip.shouldHide=1;" onMouseOver="if (!Game.mouseDown) {Game.setOnCrate(this);Game.tooltip.dynamic=1;Game.tooltip.draw(this,'+'function(){return '+func+'();}'+',\''+origin+'\');Game.tooltip.wobble();}"';
			return 'onMouseOut="Game.tooltip.shouldHide=1;" onMouseOver="Game.tooltip.dynamic=1;Game.tooltip.draw(this,'+'function(){return '+func+'();}'+',\''+origin+'\');Game.tooltip.wobble();"';
		}
		Game.attachTooltip=function(el,func,origin)
		{
			if (typeof func==='string')
			{
				var str=func;
				func=function(str){return function(){return str;};}(str);
			}
			origin=(origin?origin:'middle');
			AddEvent(el,'mouseover',function(func,el,origin){return function(){Game.tooltip.dynamic=1;Game.tooltip.draw(el,func,origin);};}(func,el,origin));
			AddEvent(el,'mouseout',function(){return function(){Game.tooltip.shouldHide=1;};}());
		}
		Game.tooltip.wobble=function()
		{
			//disabled because this effect doesn't look good with the slight slowdown it might or might not be causing.
			if (false)
			{
				this.tt.className='framed';
				void this.tt.offsetWidth;
				this.tt.className='framed wobbling';
			}
		}
		
		
		/*=====================================================================================
		UPDATE CHECKER
		=======================================================================================*/
		Game.CheckUpdates=function()
		{
			ajax('server.php?q=checkupdate',Game.CheckUpdatesResponse);
		}
		Game.CheckUpdatesResponse=function(response)
		{
			var r=response.split('|');
			var str='';
			if (r[0]=='alert')
			{
				if (r[1]) str=r[1];
			}
			else if (parseFloat(r[0])>Game.version)
			{
				str='<b>新版本可用 : v. '+r[0]+'!</b>';
				if (r[1]) str+='<br><small>更新说明 : "'+r[1]+'"</small>';
				str+='<br><b>刷新以获得它!</b>';
			}
			if (str!='')
			{
				l('alert').innerHTML=str;
				l('alert').style.display='block';
			}
		}
		
		/*=====================================================================================
		DATA GRABBER
		=======================================================================================*/
		
		Game.externalDataLoaded=false;
		
		Game.grandmaNames=['Granny','Gusher','Ethel','Edna','Doris','Maud','Hilda','Gladys','Michelle','Michele','Phyllis','Millicent','Muriel','Myrtle','Mildred','Mavis','Helen','Gloria','Sheila','Betty','Gertrude','Agatha','Beryl','Agnes','Pearl','Precious','Ruby','Vera','Bonnie','Ada','Bunny','Cookie','Darling','Gaga','GamGam','Memaw','Mimsy','Peanut','Nana','Nan','Tootsie','Warty','Stinky','Heinous'];
		Game.customGrandmaNames=[];
		Game.heralds=0;
		
		Game.GrabData=function()
		{
			ajax('/patreon/grab.php',Game.GrabDataResponse);
		}
		Game.GrabDataResponse=function(response)
		{
			/*
				response should be formatted as
				{"herald":3,"grandma":"a|b|c|...}
			*/
			var r={};
			try{
				r=JSON.parse(response);
				if (typeof r['herald']!=='undefined')
				{
					Game.heralds=parseInt(r['herald']);
					Game.heralds=Math.max(0,Math.min(100,Game.heralds));
				}
				if (typeof r['grandma']!=='undefined' && r['grandma']!='')
				{
					Game.customGrandmaNames=r['grandma'].split('|');
					Game.customGrandmaNames=Game.customGrandmaNames.filter(function(el){return el!='';});
				}
				
				l('heraldsAmount').innerHTML=Game.heralds;
				Game.externalDataLoaded=true;
			}catch(e){}
		}
		
		
		Game.attachTooltip(l('topbarOrteil'),'<div style="padding:8px;width:250px;text-align:center;">Back to Orteil\'s subdomain!<br>Lots of other games in there!</div>','this');
		Game.attachTooltip(l('topbarDashnet'),'<div style="padding:8px;width:250px;text-align:center;">Back to our homepage!</div>','this');
		Game.attachTooltip(l('topbarTwitter'),'<div style="padding:8px;width:250px;text-align:center;">Orteil\'s twitter, which frequently features game updates.</div>','this');
		Game.attachTooltip(l('topbarTumblr'),'<div style="padding:8px;width:250px;text-align:center;">Orteil\'s tumblr, which frequently features game updates.</div>','this');
		Game.attachTooltip(l('topbarDiscord'),'<div style="padding:8px;width:250px;text-align:center;">Our official discord server.<br>You can share tips and questions about Cookie Clicker and all our other games!</div>','this');
		Game.attachTooltip(l('topbarPatreon'),'<div style="padding:8px;width:250px;text-align:center;">Support us on Patreon and help us keep updating Cookie Clicker!<br>There\'s neat rewards for patrons too!</div>','this');
		Game.attachTooltip(l('topbarMerch'),'<div style="padding:8px;width:250px;text-align:center;">Cookie Clicker shirts, hoodies and stickers!</div>','this');
		Game.attachTooltip(l('topbarRandomgen'),'<div style="padding:8px;width:250px;text-align:center;">A thing we made that lets you write random generators.</div>','this');
		Game.attachTooltip(l('topbarIGM'),'<div style="padding:8px;width:250px;text-align:center;">A thing we made that lets you create your own idle games using a simple scripting language.</div>','this');
		
		Game.attachTooltip(l('heralds'),function(){
			var str='';
			
			if (!Game.externalDataLoaded) str+='Heralds couldn\'t be loaded. There may be an issue with our servers, or you are playing the game locally.';
			else
			{
				if (Game.heralds==0) str+='There are no heralds at the moment. Please consider <b style="color:#bc3aff;">donating to our Patreon</b>!';
				else
				{
					str+=(Game.heralds==1?'<b style="color:#bc3aff;text-shadow:0px 1px 0px #6d0096;">1 herald</b> is':'<b style="color:#fff;text-shadow:0px 1px 0px #6d0096,0px 0px 6px #bc3aff;">'+Game.heralds+' heralds</b> are')+' selflessly inspiring a boost in production for everyone, resulting in<br><b style="color:#cdaa89;text-shadow:0px 1px 0px #7c4532,0px 0px 6px #7c4532;"><div style="width:16px;height:16px;display:inline-block;vertical-align:middle;background:url(img/money.png);"></div> +'+Game.heralds+'% cookies per second</b>.';
					str+='<div class="line"></div>';
					if (Game.ascensionMode==1) str+='You are in a <b>Born again</b> run, and are not currently benefiting from heralds.';
					else if (Game.Has('Heralds')) str+='You own the <b>Heralds</b> upgrade, and therefore benefit from the production boost.';
					else str+='To benefit from the herald bonus, you need a special upgrade you do not yet own. You will permanently unlock it later in the game.';
				}
			}
			str+='<div class="line"></div><span style="font-size:90%;opacity:0.6;"><b>Heralds</b> are people who have donated to our highest Patreon tier, and are limited to 100.<br>Each herald gives everyone +1% CpS.<br>This feature is experimental and may be glitchy.</span>';
			
			str+='<div style="width:31px;height:39px;background:url(img/heraldFlag.png);position:absolute;top:0px;left:8px;"></div><div style="width:31px;height:39px;background:url(img/heraldFlag.png);position:absolute;top:0px;right:8px;"></div>';
			
			return '<div style="padding:8px;width:300px;text-align:center;" class="prompt"><h3>Heralds</h3><div class="block">'+str+'</div></div>';
		},'this');
		l('heraldsAmount').innerHTML='?';
		l('heralds').style.display='inline-block';
		
		Game.GrabData();
		
		
		Game.useLocalStorage=1;
		Game.localStorageGet=function(key)
		{
			var local=0;
			try {local=window.localStorage.getItem(key);} catch (exception) {}
			return local;
		}
		Game.localStorageSet=function(key,str)
		{
			var local=0;
			try {local=window.localStorage.setItem(key,str);} catch (exception) {}
			return local;
		}
		//window.localStorage.clear();//won't switch back to cookie-based if there is localStorage info
		
		/*=====================================================================================
		SAVE
		=======================================================================================*/
		Game.ExportSave=function()
		{
			Game.prefs.showBackupWarning=0;
			Game.Prompt('<h3>导出存档</h3><div class="block">这是你的存档代码<br>复制它，并保存到安全的地方（邮箱、网盘等）</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;" readonly>'+Game.WriteSave(1)+'</textarea></div>',['关闭!']);//prompt('Copy this text and keep it somewhere safe!',Game.WriteSave(1));
			l('textareaPrompt').focus();l('textareaPrompt').select();
		}
		Game.ImportSave=function()
		{
			Game.Prompt('<h3>导入存档</h3><div class="block">请在框里粘贴你保存时，导出的代码。</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;"></textarea></div>',[['导入','if (l(\'textareaPrompt\').value.length>0) {Game.ImportSaveCode(l(\'textareaPrompt\').value);Game.ClosePrompt();}'],'取消']);//prompt('Please paste in the text that was given to you on save export.','');
			l('textareaPrompt').focus();
		}
		Game.ImportSaveCode=function(save)
		{
			if (save && save!='') Game.LoadSave(save);
		}
		
		Game.FileSave=function()
		{
			Game.prefs.showBackupWarning=0;
			var filename=Game.bakeryName.replace(/[^a-zA-Z0-9]+/g,'')+'Bakery';
			var text=Game.WriteSave(1);
			var blob=new Blob([text],{type:'text/plain;charset=utf-8'});
			saveAs(blob,filename+'.txt');
		}
		Game.FileLoad=function(e)
		{
			if (e.target.files.length==0) return false;
			var file=e.target.files[0];
			var reader=new FileReader();
			reader.onload=function(e)
			{
				Game.ImportSaveCode(e.target.result);
			}
			reader.readAsText(file);
		}
		
		Game.toSave=false;
		Game.WriteSave=function(type)
		{
			Game.toSave=false;
			//type : none is default, 1=return string only, 2=return uncompressed string, 3=return uncompressed, commented string
			Game.lastDate=parseInt(Date.now());
			var str='';
			if (type==3) str+='\nGame version\n';
			str+=Game.version+'|';
			str+='|';//just in case we need some more stuff here
			if (type==3) str+='\n\nRun details';
			str+=//save stats
			(type==3?'\n	run start date : ':'')+parseInt(Game.startDate)+';'+
			(type==3?'\n	legacy start date : ':'')+parseInt(Game.fullDate)+';'+
			(type==3?'\n	date when we last opened the game : ':'')+parseInt(Game.lastDate)+';'+
			(type==3?'\n	bakery name : ':'')+(Game.bakeryName)+';'+
			(type==3?'\n	seed : ':'')+(Game.seed)+
			'|';
			if (type==3) str+='\n\nPacked preferences bitfield\n	';
			var str2=//prefs
			(Game.prefs.particles?'1':'0')+
			(Game.prefs.numbers?'1':'0')+
			(Game.prefs.autosave?'1':'0')+
			(Game.prefs.autoupdate?'1':'0')+
			(Game.prefs.milk?'1':'0')+
			(Game.prefs.fancy?'1':'0')+
			(Game.prefs.warn?'1':'0')+
			(Game.prefs.cursors?'1':'0')+
			(Game.prefs.focus?'1':'0')+
			(Game.prefs.format?'1':'0')+
			(Game.prefs.notifs?'1':'0')+
			(Game.prefs.wobbly?'1':'0')+
			(Game.prefs.monospace?'1':'0')+
			(Game.prefs.filters?'1':'0')+
			(Game.prefs.cookiesound?'1':'0')+
			(Game.prefs.crates?'1':'0')+
			(Game.prefs.showBackupWarning?'1':'0')+
			(Game.prefs.extraButtons?'1':'0')+
			(Game.prefs.askLumps?'1':'0')+
			(Game.prefs.customGrandmas?'1':'0')+
			'';
			str2=pack3(str2);
			str+=str2+'|';
			if (type==3) str+='\n\nMisc game data';
			str+=
			(type==3?'\n	cookies : ':'')+parseFloat(Game.cookies).toString()+';'+
			(type==3?'\n	total cookies earned : ':'')+parseFloat(Game.cookiesEarned).toString()+';'+
			(type==3?'\n	cookie clicks : ':'')+parseInt(Math.floor(Game.cookieClicks))+';'+
			(type==3?'\n	golden cookie clicks : ':'')+parseInt(Math.floor(Game.goldenClicks))+';'+
			(type==3?'\n	cookies made by clicking : ':'')+parseFloat(Game.handmadeCookies).toString()+';'+
			(type==3?'\n	golden cookies missed : ':'')+parseInt(Math.floor(Game.missedGoldenClicks))+';'+
			(type==3?'\n	background type : ':'')+parseInt(Math.floor(Game.bgType))+';'+
			(type==3?'\n	milk type : ':'')+parseInt(Math.floor(Game.milkType))+';'+
			(type==3?'\n	cookies from past runs : ':'')+parseFloat(Game.cookiesReset).toString()+';'+
			(type==3?'\n	elder wrath : ':'')+parseInt(Math.floor(Game.elderWrath))+';'+
			(type==3?'\n	pledges : ':'')+parseInt(Math.floor(Game.pledges))+';'+
			(type==3?'\n	pledge time left : ':'')+parseInt(Math.floor(Game.pledgeT))+';'+
			(type==3?'\n	currently researching : ':'')+parseInt(Math.floor(Game.nextResearch))+';'+
			(type==3?'\n	research time left : ':'')+parseInt(Math.floor(Game.researchT))+';'+
			(type==3?'\n	ascensions : ':'')+parseInt(Math.floor(Game.resets))+';'+
			(type==3?'\n	golden cookie clicks (this run) : ':'')+parseInt(Math.floor(Game.goldenClicksLocal))+';'+
			(type==3?'\n	cookies sucked by wrinklers : ':'')+parseFloat(Game.cookiesSucked).toString()+';'+
			(type==3?'\n	wrinkles popped : ':'')+parseInt(Math.floor(Game.wrinklersPopped))+';'+
			(type==3?'\n	santa level : ':'')+parseInt(Math.floor(Game.santaLevel))+';'+
			(type==3?'\n	reindeer clicked : ':'')+parseInt(Math.floor(Game.reindeerClicked))+';'+
			(type==3?'\n	season time left : ':'')+parseInt(Math.floor(Game.seasonT))+';'+
			(type==3?'\n	season switcher uses : ':'')+parseInt(Math.floor(Game.seasonUses))+';'+
			(type==3?'\n	current season : ':'')+(Game.season?Game.season:'')+';';
			var wrinklers=Game.SaveWrinklers();
			str+=
			(type==3?'\n	amount of cookies contained in wrinklers : ':'')+parseFloat(Math.floor(wrinklers.amount))+';'+
			(type==3?'\n	number of wrinklers : ':'')+parseInt(Math.floor(wrinklers.number))+';'+
			(type==3?'\n	声望等级 : ':'')+parseFloat(Game.prestige).toString()+';'+
			(type==3?'\n	天堂芯片 : ':'')+parseFloat(Game.heavenlyChips).toString()+';'+
			(type==3?'\n	heavenly chips spent : ':'')+parseFloat(Game.heavenlyChipsSpent).toString()+';'+
			(type==3?'\n	天堂饼干 : ':'')+parseFloat(Game.heavenlyCookies).toString()+';'+
			(type==3?'\n	ascension mode : ':'')+parseInt(Math.floor(Game.ascensionMode))+';'+
			(type==3?'\n	permanent upgrades : ':'')+parseInt(Math.floor(Game.permanentUpgrades[0]))+';'+parseInt(Math.floor(Game.permanentUpgrades[1]))+';'+parseInt(Math.floor(Game.permanentUpgrades[2]))+';'+parseInt(Math.floor(Game.permanentUpgrades[3]))+';'+parseInt(Math.floor(Game.permanentUpgrades[4]))+';'+
			(type==3?'\n	dragon level : ':'')+parseInt(Math.floor(Game.dragonLevel))+';'+
			(type==3?'\n	dragon aura : ':'')+parseInt(Math.floor(Game.dragonAura))+';'+
			(type==3?'\n	dragon aura 2 : ':'')+parseInt(Math.floor(Game.dragonAura2))+';'+
			(type==3?'\n	chime type : ':'')+parseInt(Math.floor(Game.chimeType))+';'+
			(type==3?'\n	volume : ':'')+parseInt(Math.floor(Game.volume))+';'+
			(type==3?'\n	number of shiny wrinklers : ':'')+parseInt(Math.floor(wrinklers.shinies))+';'+
			(type==3?'\n	amount of cookies contained in shiny wrinklers : ':'')+parseFloat(Math.floor(wrinklers.amountShinies))+';'+
			(type==3?'\n	current amount of sugar lumps : ':'')+parseFloat(Math.floor(Game.lumps))+';'+
			(type==3?'\n	total amount of sugar lumps made : ':'')+parseFloat(Math.floor(Game.lumpsTotal))+';'+
			(type==3?'\n	time when current sugar lump started : ':'')+parseFloat(Math.floor(Game.lumpT))+';'+
			(type==3?'\n	time when last refilled a minigame with a sugar lump : ':'')+parseFloat(Math.floor(Game.lumpRefill))+';'+
			(type==3?'\n	sugar lump type : ':'')+parseInt(Math.floor(Game.lumpCurrentType))+';'+
			(type==3?'\n	vault : ':'')+Game.vault.join(',')+';'+
			'|';//cookies and lots of other stuff
			
			if (type==3) str+='\n\nBuildings : amount, bought, cookies produced, level, minigame data';
			for (var i in Game.Objects)//buildings
			{
				var me=Game.Objects[i];
				if (type==3) str+='\n	'+me.name+' : ';
				if (me.vanilla)
				{
					str+=me.amount+','+me.bought+','+parseFloat(Math.floor(me.totalCookies))+','+parseInt(me.level);
					if (Game.isMinigameReady(me)) str+=','+me.minigame.save(); else str+=',';
					str+=','+(me.muted?'1':'0');
					str+=';';
				}
			}
			str+='|';
			if (type==3) str+='\n\nPacked upgrades bitfield (unlocked and bought)\n	';
			var toCompress=[];
			for (var i in Game.UpgradesById)//upgrades
			{
				var me=Game.UpgradesById[i];
				if (me.vanilla) toCompress.push(Math.min(me.unlocked,1),Math.min(me.bought,1));
			};
			
			toCompress=pack3(toCompress.join(''));//toCompress=pack(toCompress);//CompressLargeBin(toCompress);
			
			str+=toCompress;
			str+='|';
			if (type==3) str+='\n\nPacked achievements bitfield (won)\n	';
			var toCompress=[];
			for (var i in Game.AchievementsById)//achievements
			{
				var me=Game.AchievementsById[i];
				if (me.vanilla) toCompress.push(Math.min(me.won));
			}
			toCompress=pack3(toCompress.join(''));//toCompress=pack(toCompress);//CompressLargeBin(toCompress);
			str+=toCompress;
			
			str+='|';
			if (type==3) str+='\n\nBuffs : type, maxTime, time, arg1, arg2, arg3';
			for (var i in Game.buffs)
			{
				var me=Game.buffs[i];
				if (me.type)
				{
					if (type==3) str+='\n	'+me.type.name+' : ';
					if (me.type.vanilla)
					{
						str+=me.type.id+','+me.maxTime+','+me.time;
						if (typeof me.arg1!=='undefined') str+=','+parseFloat(me.arg1);
						if (typeof me.arg2!=='undefined') str+=','+parseFloat(me.arg2);
						if (typeof me.arg3!=='undefined') str+=','+parseFloat(me.arg3);
						str+=';';
					}
				}
			}
			
			
			if (type==3) str+='\n';
			
			for (var i in Game.customSave) {Game.customSave[i]();}
			
			if (type==2 || type==3)
			{
				return str;
			}
			else if (type==1)
			{
				str=escape(utf8_to_b64(str)+'!END!');
				return str;
			}
			else
			{
				if (Game.useLocalStorage)
				{
					//so we used to save the game using browser cookies, which was just really neat considering the game's name
					//we're using localstorage now, which is more efficient but not as cool
					//a moment of silence for our fallen puns
					str=utf8_to_b64(str)+'!END!';
					if (str.length<10)
					{
						if (Game.prefs.popups) Game.Popup('Error while saving.<br>Purchasing an upgrade might fix this.');
						else Game.Notify('Saving failed!','Purchasing an upgrade and saving again might fix this.<br>This really shouldn\'t happen; please notify Orteil on his tumblr.');
					}
					else
					{
						str=escape(str);
						Game.localStorageSet(Game.SaveTo,str);//aaand save
						if (!Game.localStorageGet(Game.SaveTo))
						{
							if (Game.prefs.popups) Game.Popup('Error while saving.<br>Export your save instead!');
							else Game.Notify('Error while saving','Export your save instead!');
						}
						else if (document.hasFocus())
						{
							if (Game.prefs.popups) Game.Popup('游戏已保存');
							else Game.Notify('游戏已保存','','',1,1);
						}
					}
				}
				else//legacy system
				{
					//that's right
					//we're using cookies
					//yeah I went there
					var now=new Date();//we storin dis for 5 years, people
					now.setFullYear(now.getFullYear()+5);//mmh stale cookies
					str=utf8_to_b64(str)+'!END!';
					Game.saveData=escape(str);
					str=Game.SaveTo+'='+escape(str)+'; expires='+now.toUTCString()+';';
					document.cookie=str;//aaand save
					if (document.cookie.indexOf(Game.SaveTo)<0)
					{
						if (Game.prefs.popups) Game.Popup('Error while saving.<br>Export your save instead!');
						else Game.Notify('Error while saving','Export your save instead!','',0,1);
					}
					else if (document.hasFocus())
					{
						if (Game.prefs.popups) Game.Popup('游戏已保存');
						else Game.Notify('游戏已保存','','',1,1);
					}
				}
			}
		}
		
		/*=====================================================================================
		LOAD
		=======================================================================================*/
		Game.salvageSave=function()
		{
			//for when Cookie Clicker won't load and you need your save
			console.log('===================================================');
			console.log('This is your save data. Copypaste it (without quotation marks) into another version using the "Import save" feature.');
			console.log(Game.localStorageGet(Game.SaveTo));
		}
		Game.LoadSave=function(data)
		{
			var str='';
			if (data) str=unescape(data);
			else
			{
				if (Game.useLocalStorage)
				{
					var local=Game.localStorageGet(Game.SaveTo);
					if (!local)//no localstorage save found? let's get the cookie one last time
					{
						if (document.cookie.indexOf(Game.SaveTo)>=0)
						{
							str=unescape(document.cookie.split(Game.SaveTo+'=')[1]);
							document.cookie=Game.SaveTo+'=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
						}
						else return false;
					}
					else
					{
						str=unescape(local);
					}
				}
				else//legacy system
				{
					if (document.cookie.indexOf(Game.SaveTo)>=0) str=unescape(document.cookie.split(Game.SaveTo+'=')[1]);//get cookie here
					else return false;
				}
			}
			if (str!='')
			{
				var version=0;
				var oldstr=str.split('|');
				if (oldstr[0]<1) {}
				else
				{
					str=str.split('!END!')[0];
					str=b64_to_utf8(str);
				}
				if (str!='')
				{
					var spl='';
					str=str.split('|');
					version=parseFloat(str[0]);
					
					if (isNaN(version) || str.length<5)
					{
						if (Game.prefs.popups) Game.Popup('哎呀，看起来像导入的字符串都错了!');
						else Game.Notify('导入存档时出错','哎呀，看起来像导入的字符串都错了!','',6,1);
						return false;
					}
					if (version>=1 && version>Game.version)
					{
						if (Game.prefs.popups) Game.Popup('Error : you are attempting to load a save from a future version (v. '+version+'; you are using v. '+Game.version+').');
						else Game.Notify('Error importing save','You are attempting to load a save from a future version (v. '+version+'; you are using v. '+Game.version+').','',6,1);
						return false;
					}
					if (version==1.0501)//prompt if we loaded from the 2014 beta
					{
						setTimeout(function(){Game.Prompt('<h3>New beta</h3><div class="block">Hey there! Unfortunately, your old beta save won\'t work here anymore; you\'ll have to start fresh or import your save from the live version.<div class="line"></div>Thank you for beta-testing Cookie Clicker, we hope you\'ll enjoy it and find strange and interesting bugs!</div>',[['Alright then!','Game.ClosePrompt();']]);},200);
						return false;
					}
					else if (version<1.0501)//prompt if we loaded from the 2014 live version
					{
						setTimeout(function(){Game.Prompt('<h3>Update</h3><div class="block"><b>Hey there!</b> Cookie Clicker just received a pretty substantial update, and you might notice that some things have been moved around. Don\'t panic!<div class="line"></div>Your building numbers may look strange, making it seem like you own buildings you\'ve never bought; this is because we\'ve added <b>3 new buildings</b> after factories (and swapped mines and factories), offsetting everything after them. Likewise, some building-related upgrades and achievements may look a tad shuffled around. This is all perfectly normal!<div class="line"></div>We\'ve also rebalanced Heavenly Chips amounts and behavior. Your amount of chips might be lower or higher than before.<br>You can now ascend through the <b>遗产 button</b> at the top!<div class="line"></div>Thank you for playing Cookie Clicker. We\'ve put a lot of work and care into this update and we hope you\'ll enjoy it!</div>',[['Neat!','Game.ClosePrompt();']]);},200);
					}
					if (version>=1)
					{
						Game.T=0;
						
						spl=str[2].split(';');//save stats
						Game.startDate=parseInt(spl[0]);
						Game.fullDate=parseInt(spl[1]);
						Game.lastDate=parseInt(spl[2]);
						Game.bakeryName=spl[3]?spl[3]:Game.GetBakeryName();
						Game.seed=spl[4]?spl[4]:Game.makeSeed();
						//prefs
						if (version<1.0503) spl=str[3].split('');
						else if (version<2.0046) spl=unpack2(str[3]).split('');
						else spl=(str[3]).split('');
						Game.prefs.particles=parseInt(spl[0]);
						Game.prefs.numbers=parseInt(spl[1]);
						Game.prefs.autosave=parseInt(spl[2]);
						Game.prefs.autoupdate=spl[3]?parseInt(spl[3]):1;
						Game.prefs.milk=spl[4]?parseInt(spl[4]):1;
						Game.prefs.fancy=parseInt(spl[5]);if (Game.prefs.fancy) Game.removeClass('noFancy'); else if (!Game.prefs.fancy) Game.addClass('noFancy');
						Game.prefs.warn=spl[6]?parseInt(spl[6]):0;
						Game.prefs.cursors=spl[7]?parseInt(spl[7]):0;
						Game.prefs.focus=spl[8]?parseInt(spl[8]):0;
						Game.prefs.format=spl[9]?parseInt(spl[9]):0;
						Game.prefs.notifs=spl[10]?parseInt(spl[10]):0;
						Game.prefs.wobbly=spl[11]?parseInt(spl[11]):0;
						Game.prefs.monospace=spl[12]?parseInt(spl[12]):0;
						Game.prefs.filters=parseInt(spl[13]);if (Game.prefs.filters) Game.removeClass('noFilters'); else if (!Game.prefs.filters) Game.addClass('noFilters');
						Game.prefs.cookiesound=spl[14]?parseInt(spl[14]):1;
						Game.prefs.crates=spl[15]?parseInt(spl[15]):0;
						Game.prefs.showBackupWarning=spl[16]?parseInt(spl[16]):1;
						Game.prefs.extraButtons=spl[17]?parseInt(spl[17]):1;if (!Game.prefs.extraButtons) Game.removeClass('extraButtons'); else if (Game.prefs.extraButtons) Game.addClass('extraButtons');
						Game.prefs.askLumps=spl[18]?parseInt(spl[18]):0;
						Game.prefs.customGrandmas=spl[19]?parseInt(spl[19]):1;
						BeautifyAll();
						spl=str[4].split(';');//cookies and lots of other stuff
						Game.cookies=parseFloat(spl[0]);
						Game.cookiesEarned=parseFloat(spl[1]);
						Game.cookieClicks=spl[2]?parseInt(spl[2]):0;
						Game.goldenClicks=spl[3]?parseInt(spl[3]):0;
						Game.handmadeCookies=spl[4]?parseFloat(spl[4]):0;
						Game.missedGoldenClicks=spl[5]?parseInt(spl[5]):0;
						Game.bgType=spl[6]?parseInt(spl[6]):0;
						Game.milkType=spl[7]?parseInt(spl[7]):0;
						Game.cookiesReset=spl[8]?parseFloat(spl[8]):0;
						Game.elderWrath=spl[9]?parseInt(spl[9]):0;
						Game.pledges=spl[10]?parseInt(spl[10]):0;
						Game.pledgeT=spl[11]?parseInt(spl[11]):0;
						Game.nextResearch=spl[12]?parseInt(spl[12]):0;
						Game.researchT=spl[13]?parseInt(spl[13]):0;
						Game.resets=spl[14]?parseInt(spl[14]):0;
						Game.goldenClicksLocal=spl[15]?parseInt(spl[15]):0;
						Game.cookiesSucked=spl[16]?parseFloat(spl[16]):0;
						Game.wrinklersPopped=spl[17]?parseInt(spl[17]):0;
						Game.santaLevel=spl[18]?parseInt(spl[18]):0;
						Game.reindeerClicked=spl[19]?parseInt(spl[19]):0;
						Game.seasonT=spl[20]?parseInt(spl[20]):0;
						Game.seasonUses=spl[21]?parseInt(spl[21]):0;
						Game.season=spl[22]?spl[22]:Game.baseSeason;
						var wrinklers={amount:spl[23]?parseFloat(spl[23]):0,number:spl[24]?parseInt(spl[24]):0};
						Game.prestige=spl[25]?parseFloat(spl[25]):0;
						Game.heavenlyChips=spl[26]?parseFloat(spl[26]):0;
						Game.heavenlyChipsSpent=spl[27]?parseFloat(spl[27]):0;
						Game.heavenlyCookies=spl[28]?parseFloat(spl[28]):0;
						Game.ascensionMode=spl[29]?parseInt(spl[29]):0;
						Game.permanentUpgrades[0]=spl[30]?parseInt(spl[30]):-1;Game.permanentUpgrades[1]=spl[31]?parseInt(spl[31]):-1;Game.permanentUpgrades[2]=spl[32]?parseInt(spl[32]):-1;Game.permanentUpgrades[3]=spl[33]?parseInt(spl[33]):-1;Game.permanentUpgrades[4]=spl[34]?parseInt(spl[34]):-1;
						//if (version<1.05) {Game.heavenlyChipsEarned=Game.HowMuchPrestige(Game.cookiesReset);Game.heavenlyChips=Game.heavenlyChipsEarned;}
						Game.dragonLevel=spl[35]?parseInt(spl[35]):0;
						if (version<2.0041 && Game.dragonLevel==Game.dragonLevels.length-2) {Game.dragonLevel=Game.dragonLevels.length-1;}
						Game.dragonAura=spl[36]?parseInt(spl[36]):0;
						Game.dragonAura2=spl[37]?parseInt(spl[37]):0;
						Game.chimeType=spl[38]?parseInt(spl[38]):0;
						Game.volume=spl[39]?parseInt(spl[39]):50;
						wrinklers.shinies=spl[40]?parseInt(spl[40]):0;
						wrinklers.amountShinies=spl[41]?parseFloat(spl[41]):0;
						Game.lumps=spl[42]?parseFloat(spl[42]):-1;
						Game.lumpsTotal=spl[43]?parseFloat(spl[43]):-1;
						Game.lumpT=spl[44]?parseInt(spl[44]):Date.now();
						Game.lumpRefill=spl[45]?parseInt(spl[45]):0;
						Game.lumpCurrentType=spl[46]?parseInt(spl[46]):0;
						Game.vault=spl[47]?spl[47].split(','):[];
							for (var i in Game.vault){Game.vault[i]=parseInt(Game.vault[i]);}
						
						spl=str[5].split(';');//buildings
						Game.BuildingsOwned=0;
						for (var i in Game.ObjectsById)
						{
							var me=Game.ObjectsById[i];
							me.switchMinigame(false);
							me.pics=[];
							if (spl[i])
							{
								var mestr=spl[i].toString().split(',');
								me.amount=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);me.totalCookies=parseFloat(mestr[2]);me.level=parseInt(mestr[3]||0);
								if (me.minigame && me.minigameLoaded && me.minigame.reset) {me.minigame.reset(true);me.minigame.load(mestr[4]||'');} else me.minigameSave=(mestr[4]||0);
								me.muted=parseInt(mestr[5])||0;
								Game.BuildingsOwned+=me.amount;
								if (version<2.003) me.level=0;
							}
							else
							{
								me.amount=0;me.unlocked=0;me.bought=0;me.totalCookies=0;me.level=0;
							}
						}
						
						Game.LoadMinigames();
						
						if (version<1.035)//old non-binary algorithm
						{
							spl=str[6].split(';');//upgrades
							Game.UpgradesOwned=0;
							for (var i in Game.UpgradesById)
							{
								var me=Game.UpgradesById[i];
								if (spl[i])
								{
									var mestr=spl[i].split(',');
									me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
									if (me.bought && Game.CountsAsUpgradeOwned(me.pool)) Game.UpgradesOwned++;
								}
								else
								{
									me.unlocked=0;me.bought=0;
								}
							}
							if (str[7]) spl=str[7].split(';'); else spl=[];//achievements
							Game.AchievementsOwned=0;
							for (var i in Game.AchievementsById)
							{
								var me=Game.AchievementsById[i];
								if (spl[i])
								{
									var mestr=spl[i].split(',');
									me.won=parseInt(mestr[0]);
								}
								else
								{
									me.won=0;
								}
								if (me.won && Game.CountsAsAchievementOwned(me.pool)) Game.AchievementsOwned++;
							}
						}
						else if (version<1.0502)//old awful packing system
						{
							if (str[6]) spl=str[6]; else spl=[];//upgrades
							if (version<1.05) spl=UncompressLargeBin(spl);
							else spl=unpack(spl);
							Game.UpgradesOwned=0;
							for (var i in Game.UpgradesById)
							{
								var me=Game.UpgradesById[i];
								if (spl[i*2])
								{
									var mestr=[spl[i*2],spl[i*2+1]];
									me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
									if (me.bought && Game.CountsAsUpgradeOwned(me.pool)) Game.UpgradesOwned++;
								}
								else
								{
									me.unlocked=0;me.bought=0;
								}
							}
							if (str[7]) spl=str[7]; else spl=[];//achievements
							if (version<1.05) spl=UncompressLargeBin(spl);
							else spl=unpack(spl);
							Game.AchievementsOwned=0;
							for (var i in Game.AchievementsById)
							{
								var me=Game.AchievementsById[i];
								if (spl[i])
								{
									var mestr=[spl[i]];
									me.won=parseInt(mestr[0]);
								}
								else
								{
									me.won=0;
								}
								if (me.won && Game.CountsAsAchievementOwned(me.pool)) Game.AchievementsOwned++;
							}
						}
						else
						{
							if (str[6]) spl=str[6]; else spl=[];//upgrades
							if (version<2.0046) spl=unpack2(spl).split('');
							else spl=(spl).split('');
							Game.UpgradesOwned=0;
							for (var i in Game.UpgradesById)
							{
								var me=Game.UpgradesById[i];
								if (spl[i*2])
								{
									var mestr=[spl[i*2],spl[i*2+1]];
									me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
									if (me.bought && Game.CountsAsUpgradeOwned(me.pool)) Game.UpgradesOwned++;
								}
								else
								{
									me.unlocked=0;me.bought=0;
								}
							}
							if (str[7]) spl=str[7]; else spl=[];//achievements
							if (version<2.0046) spl=unpack2(spl).split('');
							else spl=(spl).split('');
							Game.AchievementsOwned=0;
							for (var i in Game.AchievementsById)
							{
								var me=Game.AchievementsById[i];
								if (spl[i])
								{
									var mestr=[spl[i]];
									me.won=parseInt(mestr[0]);
								}
								else
								{
									me.won=0;
								}
								if (me.won && Game.CountsAsAchievementOwned(me.pool)) Game.AchievementsOwned++;
							}
						}
						
						Game.killBuffs();
						var buffsToLoad=[];
						spl=(str[8]||'').split(';');//buffs
						for (var i in spl)
						{
							if (spl[i])
							{
								var mestr=spl[i].toString().split(',');
								buffsToLoad.push(mestr);
							}
						}
						
						
						for (var i in Game.ObjectsById)
						{
							var me=Game.ObjectsById[i];
							if (me.buyFunction) me.buyFunction();
							me.refresh();
							if (me.id>0)
							{
								if (me.muted) me.mute(1);
							}
						}
						
						if (version<1.0503)//upgrades that used to be regular, but are now heavenly
						{
							var me=Game.Upgrades['持久的记忆'];me.unlocked=0;me.bought=0;
							var me=Game.Upgrades['季节切换器'];me.unlocked=0;me.bought=0;
						}
						
						if (Game.bgType==-1) Game.bgType=0;
						if (Game.milkType==-1) Game.milkType=0;
						
						
						//advance timers
						var framesElapsed=Math.ceil(((Date.now()-Game.lastDate)/1000)*Game.fps);
						if (Game.pledgeT>0) Game.pledgeT=Math.max(Game.pledgeT-framesElapsed,1);
						if (Game.seasonT>0) Game.seasonT=Math.max(Game.seasonT-framesElapsed,1);
						if (Game.researchT>0) Game.researchT=Math.max(Game.researchT-framesElapsed,1);
						
						
						Game.ResetWrinklers();
						Game.LoadWrinklers(wrinklers.amount,wrinklers.number,wrinklers.shinies,wrinklers.amountShinies);
						
						//recompute season trigger prices
						if (Game.Has('季节切换器')) {for (var i in Game.seasons) {Game.Unlock(Game.seasons[i].trigger);}}
						Game.computeSeasonPrices();
						
						//recompute prestige
						Game.prestige=Math.floor(Game.HowMuchPrestige(Game.cookiesReset));
						//if ((Game.heavenlyChips+Game.heavenlyChipsSpent)<Game.prestige)
						//{Game.heavenlyChips=Game.prestige;Game.heavenlyChipsSpent=0;}//chips owned and spent don't add up to total prestige? set chips owned to prestige
						
						
						
						
						if (version==1.037 && Game.beta)//are we opening the new beta? if so, save the old beta to /betadungeons
						{
							window.localStorage.setItem('CookieClickerGameBetaDungeons',window.localStorage.getItem('CookieClickerGameBeta'));
							Game.Notify('测试版保存数据','您的测试版保存数据已安全地导出到 /betadungeons.',20);
						}
						else if (version==1.0501 && Game.beta)//are we opening the newer beta? if so, save the old beta to /oldbeta
						{
							window.localStorage.setItem('CookieClickerGameOld',window.localStorage.getItem('CookieClickerGameBeta'));
							//Game.Notify('Beta save data','Your beta save data has been safely exported to /oldbeta.',20);
						}
						if (version<=1.0466 && !Game.beta)//export the old 2014 version to /v10466
						{
							window.localStorage.setItem('CookieClickerGamev10466',window.localStorage.getItem('CookieClickerGame'));
							//Game.Notify('Beta save data','Your save data has been safely exported to /v10466.',20);
						}
						if (version==1.9)//are we importing from the 1.9 beta? remove all heavenly upgrades and refund heavenly chips
						{
							for (var i in Game.UpgradesById)
							{
								var me=Game.UpgradesById[i];
								if (me.bought && me.pool=='prestige')
								{
									me.unlocked=0;
									me.bought=0;
								}
							}
							Game.heavenlyChips=Game.prestige;
							Game.heavenlyChipsSpent=0;
							
							setTimeout(function(){Game.Prompt('<h3>Beta补丁</h3><div class="block">我们已经调整了一些东西并修复了其他一些东西，请查看更新说明！<div class="line"></div>值得注意的是：由于声望平衡的变化，你所有的天堂升级都已被删除，你的天堂筹码也退还了; 你下次提升时你将能够重新分配它们。<div class="line"></div>再次感谢您对《无尽的饼干》进行beta测试！</div>',[['好吧!','Game.ClosePrompt();']]);},200);
						}
						if (version<=1.0466)//are we loading from the old live version? reset HCs
						{
							Game.heavenlyChips=Game.prestige;
							Game.heavenlyChipsSpent=0;
						}
						
						if (Game.ascensionMode!=1)
						{
							if (Game.Has('启动装置')) Game.Objects['Cursor'].free=10;
							if (Game.Has('启动厨房')) Game.Objects['Grandma'].free=5;
						}
						
						Game.CalculateGains();
						
						if (Math.random()<1/10000) Game.TOYS=1;//teehee!
						
						var timeOffline=(Date.now()-Game.lastDate)/1000;
						
						Game.loadLumps(timeOffline);
						
						//compute cookies earned while the game was closed
						if (Game.mobile || Game.Has('完美的空转') || Game.Has('双重超越之门'))
						{
							if (Game.Has('完美的空转'))
							{
								var maxTime=60*60*24*1000000000;
								var percent=100;
							}
							else
							{
								var maxTime=60*60;
								if (Game.Has('贝尔菲格')) maxTime*=2;
								if (Game.Has('财神')) maxTime*=2;
								if (Game.Has('阿巴登')) maxTime*=2;
								if (Game.Has('撒旦')) maxTime*=2;
								if (Game.Has('魔王')) maxTime*=2;
								if (Game.Has('恶魔')) maxTime*=2;
								if (Game.Has('路西法')) maxTime*=2;
								
								var percent=5;
								if (Game.Has('天使')) percent+=10;
								if (Game.Has('大天使')) percent+=10;
								if (Game.Has('美德')) percent+=10;
								if (Game.Has('领地')) percent+=10;
								if (Game.Has('智天使')) percent+=10;
								if (Game.Has('六翼天使')) percent+=10;
								if (Game.Has('上帝')) percent+=10;
								
								if (Game.Has('奇美拉')) {maxTime+=60*60*24*2;percent+=5;}
								
								if (Game.Has('Fern tea')) percent+=3;
								if (Game.Has('Ichor syrup')) percent+=7;
							}
							
							var timeOfflineOptimal=Math.min(timeOffline,maxTime);
							var timeOfflineReduced=Math.max(0,timeOffline-timeOfflineOptimal);
							var amount=(timeOfflineOptimal+timeOfflineReduced*0.1)*Game.cookiesPs*(percent/100);
							
							if (amount>0)
							{
								if (Game.prefs.popups) Game.Popup('获得 '+Beautify(amount)+' 饼干'+(Math.floor(amount)==1?'':'')+' 在你离开的时候。');
								else Game.Notify('欢迎回来!','你获得了 <b>'+Beautify(amount)+'</b> 饼干'+(Math.floor(amount)==1?'':'')+' 在你离开的时候。<br>('+Game.sayTime(timeOfflineOptimal*Game.fps,-1)+' 相当于 '+Math.floor(percent)+'% 饼干每秒总产量'+(timeOfflineReduced?', 加上 '+Game.sayTime(timeOfflineReduced*Game.fps,-1)+' 相当于 '+(Math.floor(percent*10)/100)+'%':'')+'.)',[Math.floor(Math.random()*16),11]);
								Game.Earn(amount);
							}
						}
						
						//we load buffs after everything as we do not want them to interfer with offline CpS
						for (var i in buffsToLoad)
						{
							var mestr=buffsToLoad[i];
							var type=Game.buffTypes[parseInt(mestr[0])];
							Game.gainBuff(type.name,parseFloat(mestr[1])/Game.fps,parseFloat(mestr[3]||0),parseFloat(mestr[4]||0),parseFloat(mestr[5]||0)).time=parseFloat(mestr[2]);
						}
						
			
						Game.bakeryNameRefresh();
						
					}
					else//importing old version save
					{
						Game.Notify('导入存档错误','对不起，您不能导入旧版本的存档。','',6,1);
						return false;
					}
					
					
					Game.RebuildUpgrades();
					
					Game.TickerAge=0;
					
					Game.elderWrathD=0;
					Game.recalculateGains=1;
					Game.storeToRefresh=1;
					Game.upgradesToRebuild=1;
					
					Game.buyBulk=1;Game.buyMode=1;Game.storeBulkButton(-1);
			
					Game.specialTab='';
					Game.ToggleSpecialMenu(0);
					
					Game.killShimmers();
					
					if (Game.T>Game.fps*5 && Game.ReincarnateTimer==0)//fade out of black and pop the cookie
					{
						Game.ReincarnateTimer=1;
						Game.addClass('reincarnating');
						Game.BigCookieSize=0;
					}
					
					if (version<Game.version) l('logButton').classList.add('hasUpdate');
					
					if (Game.season!='' && Game.season==Game.baseSeason)
					{
						if (Game.season=='valentines') Game.Notify('情人节!','这是 <b>情人节季节</b>!<br>爱在空中，饼干更加甜美！',[20,3],60*3);
						else if (Game.season=='fools') Game.Notify('工作日!','这是 <b>工作季节</b>!<br>别恐慌！ 几天后，事情会变得更加公司化。',[17,6],60*3);
						else if (Game.season=='halloween') Game.Notify('万圣节!','这是 <b>万圣节季节</b>！<br>一切都有点怪异！',[13,8],60*3);
						else if (Game.season=='christmas') Game.Notify('圣诞节时刻!','这是 <b>圣诞节季节</b>!<br>为所有人带来愉快的欢呼，你可以在你的长筒袜中获得饼干！',[12,10],60*3);
						else if (Game.season=='easter') Game.Notify('复活节!','这是<b>复活节的季节</b>！<br>请注意，你可能会点击一两只兔子!',[0,12],60*3);
					}
					
					if (Game.prefs.popups) Game.Popup('游戏加载成功');
					else Game.Notify('游戏加载成功','','',1,1);
					
					if (Game.prefs.showBackupWarning==1) Game.showBackupWarning();
				}
			}
			else return false;
			return true;
		}
		
		/*=====================================================================================
		RESET
		=======================================================================================*/
		Game.Reset=function(hard)
		{
			Game.T=0;
			
			var cookiesForfeited=Game.cookiesEarned;
			if (!hard)
			{
				if (cookiesForfeited>=1000000) Game.Win('牺牲');
				if (cookiesForfeited>=1000000000) Game.Win('遗忘');
				if (cookiesForfeited>=1000000000000) Game.Win('从头开始');
				if (cookiesForfeited>=1000000000000000) Game.Win('虚无主义');
				if (cookiesForfeited>=1000000000000000000) Game.Win('非物质化');
				if (cookiesForfeited>=1000000000000000000000) Game.Win('零零零');
				if (cookiesForfeited>=1000000000000000000000000) Game.Win('超越');
				if (cookiesForfeited>=1000000000000000000000000000) Game.Win('消灭');
				if (cookiesForfeited>=1000000000000000000000000000000) Game.Win('消极的空白');
				if (cookiesForfeited>=1000000000000000000000000000000000) Game.Win('你说的是面包屑?');
				if (cookiesForfeited>=1000000000000000000000000000000000000) Game.Win('你一无所获');
				if (cookiesForfeited>=1000000000000000000000000000000000000000) Game.Win('谦虚的重新开始');
				if (cookiesForfeited>=1000000000000000000000000000000000000000000) Game.Win('世界末日');
				if (cookiesForfeited>=1000000000000000000000000000000000000000000000) Game.Win('哦，你回来了');
				if (cookiesForfeited>=1000000000000000000000000000000000000000000000000) Game.Win('拉撒路');
				
				if (Math.round(Game.cookies)==1000000000000) Game.Win('当饼干提升恰到好处时');
			}
			
			Game.killBuffs();
			
			Game.seed=Game.makeSeed();
			
			Game.cookiesReset+=Game.cookiesEarned;
			Game.cookies=0;
			Game.cookiesEarned=0;
			Game.cookieClicks=0;
			Game.goldenClicksLocal=0;
			//Game.goldenClicks=0;
			//Game.missedGoldenClicks=0;
			Game.handmadeCookies=0;
			if (hard)
			{
				Game.bgType=0;
				Game.milkType=0;
				Game.chimeType=0;
				
				Game.vault=[];
			}
			Game.pledges=0;
			Game.pledgeT=0;
			Game.elderWrath=0;
			Game.nextResearch=0;
			Game.researchT=0;
			Game.seasonT=0;
			Game.seasonUses=0;
			Game.season=Game.baseSeason;
			Game.computeSeasonPrices();
			
			Game.startDate=parseInt(Date.now());
			Game.lastDate=parseInt(Date.now());
			
			Game.cookiesSucked=0;
			Game.wrinklersPopped=0;
			Game.ResetWrinklers();
			
			Game.santaLevel=0;
			Game.reindeerClicked=0;
			
			Game.dragonLevel=0;
			Game.dragonAura=0;
			Game.dragonAura2=0;
			
			if (Game.gainedPrestige>0) Game.resets++;
			if (!hard && Game.canLumps() && Game.ascensionMode!=1) Game.addClass('lumpsOn');
			else Game.removeClass('lumpsOn');
			Game.gainedPrestige=0;
			
			for (var i in Game.ObjectsById)
			{
				var me=Game.ObjectsById[i];
				me.amount=0;me.bought=0;me.free=0;me.totalCookies=0;
				me.switchMinigame(false);
				if (hard) {me.muted=0;}
				me.pics=[];
				me.refresh();
			}
			for (var i in Game.UpgradesById)
			{
				var me=Game.UpgradesById[i];
				if (hard || me.pool!='prestige') me.bought=0;
				if (hard || (me.pool!='prestige' && !me.lasting))
				{
					if (!hard && Game.Has('Keepsakes') && Game.seasonDrops.indexOf(me.name)!=-1 && Math.random()<1/5){}
					else me.unlocked=0;
				}
			}
			
			Game.BuildingsOwned=0;
			Game.UpgradesOwned=0;
			
			Game.cookiesPsByType={};
			Game.cookiesMultByType={};
			
			if (!hard)
			{
				if (Game.ascensionMode!=1)
				{
					for (var i in Game.permanentUpgrades)
					{
						if (Game.permanentUpgrades[i]!=-1)
						{Game.UpgradesById[Game.permanentUpgrades[i]].earn();}
					}
					if (Game.Has('季节切换器')) {for (var i in Game.seasons) {Game.Unlock(Game.seasons[i].trigger);}}
					
					if (Game.Has('启动装置')) Game.Objects['Cursor'].getFree(10);
					if (Game.Has('启动厨房')) Game.Objects['Grandma'].getFree(5);
				}
			}
			
			/*for (var i in Game.AchievementsById)
			{
				var me=Game.AchievementsById[i];
				me.won=0;
			}*/
			//Game.DefaultPrefs();
			BeautifyAll();
			
			Game.RebuildUpgrades();
			Game.TickerAge=0;
			Game.recalculateGains=1;
			Game.storeToRefresh=1;
			Game.upgradesToRebuild=1;
			Game.killShimmers();
			
			Game.buyBulk=1;Game.buyMode=1;Game.storeBulkButton(-1);
			
			Game.LoadMinigames();
			for (var i in Game.ObjectsById)
			{
				var me=Game.ObjectsById[i];
				if (hard && me.minigame && me.minigame.launch) {me.minigame.launch();me.minigame.reset(true);}
				else if (!hard && me.minigame && me.minigame.reset) me.minigame.reset();
			}
			
			l('toggleBox').style.display='none';
			l('toggleBox').innerHTML='';
			Game.choiceSelectorOn=-1;
			Game.specialTab='';
			Game.ToggleSpecialMenu(0);
			
			l('logButton').classList.remove('hasUpdate');
			
			for (var i in Game.customReset) {Game.customReset[i]();}
			
			if (hard)
			{
				if (Game.T>Game.fps*5 && Game.ReincarnateTimer==0)//fade out of black and pop the cookie
				{
					Game.ReincarnateTimer=1;
					Game.addClass('reincarnating');
					Game.BigCookieSize=0;
				}
				if (Game.prefs.popups) Game.Popup('游戏重置');
				else Game.Notify('游戏重置','这么久了，饼干。',[21,6],6);
			}
		}
		Game.HardReset=function(bypass)
		{
			if (!bypass)
			{
				Game.Prompt('<h3>删除存档</h3><div class="block">你真的想删掉你的所有游戏进度？<br><small>你将失去你的所有游戏进度，你的成就，你的天堂芯片！</small></div>',[['确定!','Game.ClosePrompt();Game.HardReset(1);'],'取消']);
			}
			else if (bypass==1)
			{
				Game.Prompt('<h3>删除存档</h3><div class="block">哇，现在，你真的， <b><i>真的</i></b> 确定你想要删除游戏存档？<br><small>不要怪我们没有提醒你！</small></div>',[['确定!','Game.ClosePrompt();Game.HardReset(2);'],'取消']);
			}
			else
			{
				for (var i in Game.AchievementsById)
				{
					var me=Game.AchievementsById[i];
					me.won=0;
				}
				for (var i in Game.ObjectsById)
				{
					var me=Game.ObjectsById[i];
					me.level=0;
				}

				Game.AchievementsOwned=0;
				Game.goldenClicks=0;
				Game.missedGoldenClicks=0;
				Game.Reset(1);
				Game.resets=0;
				Game.fullDate=parseInt(Date.now());
				Game.bakeryName=Game.GetBakeryName();
				Game.bakeryNameRefresh();
				Game.cookiesReset=0;
				Game.prestige=0;
				Game.heavenlyChips=0;
				Game.heavenlyChipsSpent=0;
				Game.heavenlyCookies=0;
				Game.permanentUpgrades=[-1,-1,-1,-1,-1];
				Game.ascensionMode=0;
				Game.lumps=-1;
				Game.lumpsTotal=-1;
				Game.lumpT=Date.now();
				Game.lumpRefill=0;
				Game.removeClass('lumpsOn');
			}
		}
		
		
		
		Game.onCrate=0;
		Game.setOnCrate=function(what)
		{
			Game.onCrate=what;
		}
		Game.crate=function(me,context,forceClickStr,id)
		{
			//produce a crate with associated tooltip for an upgrade or achievement
			//me is an object representing the upgrade or achievement
			//context can be "store", "ascend", "stats" or undefined
			//forceClickStr changes what is done when the crate is clicked
			//id is the resulting div's desired id
			
			var classes='crate';
			var enabled=0;
			var noFrame=0;
			var attachment='top';
			var neuromancy=0;
			if (context=='stats' && (Game.Has('Neuromancy') || (Game.sesame && me.pool=='debug'))) neuromancy=1;
			var mysterious=0;
			var clickStr='';
			
			if (me.type=='upgrade')
			{
				var canBuy=(context=='store'?me.canBuy():true);
				if (context=='stats' && me.bought==0 && !Game.Has('神经占卜') && (!Game.sesame || me.pool!='debug')) return '';
				else if (context=='stats' && (Game.Has('神经占卜') || (Game.sesame && me.pool=='debug'))) neuromancy=1;
				else if (context=='store' && !canBuy) enabled=0;
				else if (context=='ascend' && me.bought==0) enabled=0;
				else enabled=1;
				if (me.bought>0) enabled=1;
				
				if (context=='stats' && !Game.prefs.crates) noFrame=1;
				
				classes+=' upgrade';
				if (me.pool=='prestige') classes+=' heavenly';
				
				
				if (neuromancy) clickStr='Game.UpgradesById['+me.id+'].toggle();';
			}
			else if (me.type=='achievement')
			{
				if (context=='stats' && me.won==0 && me.pool!='normal') return '';
				else if (context!='stats') enabled=1;
				
				if (context=='stats' && !Game.prefs.crates) noFrame=1;
				
				classes+=' achievement';
				if (me.pool=='shadow') classes+=' shadow';
				if (me.won>0) enabled=1;
				else mysterious=1;
				if (!enabled) clickStr='Game.AchievementsById['+me.id+'].click();';
				
				if (neuromancy) clickStr='Game.AchievementsById['+me.id+'].toggle();';
			}
			
			if (context=='store') attachment='store';
			
			if (forceClickStr) clickStr=forceClickStr;
			
			if (me.choicesFunction) classes+=' selector';
			
			
			var icon=me.icon;
			if (mysterious) icon=[0,7];
			
			if (me.iconFunction) icon=me.iconFunction();
			
			if (me.bought && context=='store') enabled=0;
			
			if (enabled) classes+=' enabled';// else classes+=' disabled';
			if (noFrame) classes+=' noFrame';
			
			var text=[];
			if (Game.sesame)
			{
				if (Game.debuggedUpgradeCpS[me.name] || Game.debuggedUpgradeCpClick[me.name])
				{
					text.push('x'+Beautify(1+Game.debuggedUpgradeCpS[me.name],2));text.push(Game.debugColors[Math.floor(Math.max(0,Math.min(Game.debugColors.length-1,Math.pow(Game.debuggedUpgradeCpS[me.name]/2,0.5)*Game.debugColors.length)))]);
					text.push('x'+Beautify(1+Game.debuggedUpgradeCpClick[me.name],2));text.push(Game.debugColors[Math.floor(Math.max(0,Math.min(Game.debugColors.length-1,Math.pow(Game.debuggedUpgradeCpClick[me.name]/2,0.5)*Game.debugColors.length)))]);
				}
				if (Game.extraInfo) {text.push(Math.floor(me.order)+(me.power?'<br>P:'+me.power:''));text.push('#fff');}
			}
			var textStr='';
			for (var i=0;i<text.length;i+=2)
			{
				textStr+='<div style="opacity:0.9;z-index:1000;padding:0px 2px;background:'+text[i+1]+';color:#000;font-size:10px;position:absolute;top:'+(i/2*10)+'px;left:0px;">'+text[i]+'</div>';
			}
			
			return '<div'+
			(clickStr!=''?(' '+Game.clickStr+'="'+clickStr+'"'):'')+
			' class="'+classes+'" '+
			Game.getDynamicTooltip(
				'function(){return Game.crateTooltip(Game.'+(me.type=='upgrade'?'Upgrades':'Achievements')+'ById['+me.id+'],'+(context?'\''+context+'\'':'')+');}',
				attachment,true
			)+
			(id?'id="'+id+'" ':'')+
			'style="'+(mysterious?
				'background-position:'+(-0*48)+'px '+(-7*48)+'px':
				(icon[2]?'background-image:url('+icon[2]+');':'')+'background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px')+';'+
				((context=='ascend' && me.pool=='prestige')?'position:absolute;left:'+me.posX+'px;top:'+me.posY+'px;':'')+
			'">'+
			textStr+
			(me.choicesFunction?'<div class="selectorCorner"></div>':'')+
			'</div>';
		}
		Game.crateTooltip=function(me,context)
		{
			var tags=[];
			mysterious=0;
			var neuromancy=0;
			var price='';
			if (context=='stats' && (Game.Has('Neuromancy') || (Game.sesame && me.pool=='debug'))) neuromancy=1;
			
			if (me.type=='upgrade')
			{
				if (me.pool=='prestige') tags.push('Heavenly','#efa438');
				else if (me.pool=='tech') tags.push('Tech','#36a4ff');
				else if (me.pool=='cookie') tags.push('Cookie',0);
				else if (me.pool=='debug') tags.push('Debug','#00c462');
				else if (me.pool=='toggle') tags.push('Switch',0);
				else tags.push('Upgrade',0);
				
				if (me.tier!=0 && Game.Has('Label printer')) tags.push('Tier : '+Game.Tiers[me.tier].name,Game.Tiers[me.tier].color);
				if (me.name=='Label printer' && Game.Has('Label printer')) tags.push('Tier : Self-referential','#ff00ea');
				
				if (me.isVaulted()) tags.push('Vaulted','#4e7566');
				
				if (me.bought>0)
				{
					if (me.pool=='tech') tags.push('Researched',0);
					else if (me.kitten) tags.push('Purrchased',0);
					else tags.push('Purchased',0);
				}
				
				if (me.lasting && me.unlocked) tags.push('Unlocked forever','#f2ff87');
				
				if (neuromancy && me.bought==0) tags.push('Click to learn!','#00c462');
				else if (neuromancy && me.bought>0) tags.push('Click to unlearn!','#00c462');
				
				var canBuy=(context=='store'?me.canBuy():true);
				var cost=me.getPrice();
				//var priceInfo=Beautify((Game.cookiesPs/cost));
				var priceInfo='';
				if (me.pool!='prestige')
				{
					if (cost>Game.cookies) priceInfo+='in '+Game.sayTime(((cost-Game.cookies)/Game.cookiesPs+1.5)*Game.fps)+'<br>';
					priceInfo+=Game.sayTime((cost/Game.cookiesPs+1.5)*Game.fps)+' worth<br>';
					priceInfo+=Beautify((cost/Game.cookies)*100,1)+'% of bank<br>';
				}
				
				price='<div style="float:right;text-align:right;"><span class="price'+
					(me.pool=='prestige'?((me.bought || Game.heavenlyChips>=cost)?' heavenly':' heavenly disabled'):'')+
					(context=='store'?(canBuy?'':' disabled'):'')+
				'">'+Beautify(Math.round(cost))+'</span>'+(me.pool!='prestige'?Game.costDetails(cost):'')+'</div>';
			}
			else if (me.type=='achievement')
			{
				if (me.pool=='shadow') tags.push('Shadow Achievement','#9700cf');
				else tags.push('Achievement',0);
				if (me.won>0) tags.push('Unlocked',0);
				else {tags.push('Locked',0);mysterious=1;}
				
				if (neuromancy && me.won==0) tags.push('Click to win!','#00c462');
				else if (neuromancy && me.won>0) tags.push('Click to lose!','#00c462');
			}
			
			var tagsStr='';
			for (var i=0;i<tags.length;i+=2)
			{
				if (i%2==0) tagsStr+=' <div class="tag" style="color:'+(tags[i+1]==0?'#fff':tags[i+1])+';">['+tags[i]+']</div>';
			}
			tagsStr=tagsStr.substring(1);
			
			var icon=me.icon;
			if (mysterious) icon=[0,7];
			
			if (me.iconFunction) icon=me.iconFunction();
			
			
			var tip='';
			if (context=='store')
			{
				if (me.pool!='toggle' && me.pool!='tech')
				{
					if (Game.Has('Inspired checklist'))
					{
						if (me.isVaulted()) tip='Upgrade is vaulted and will not be auto-purchased.<br>Click to purchase. Ctrl-click to unvault.';
						else tip='Click to purchase. Ctrl-click to vault.';
						if (Game.keys[17]) tip+='<br>(You are holding Ctrl.)';
						else tip+='<br>(You are not holding Ctrl.)';
					}
					else tip='Click to purchase.';
				}
				else if (me.pool=='toggle' && me.choicesFunction) tip='Click to open selector.';
				else if (me.pool=='toggle') tip='Click to toggle.';
				else if (me.pool=='tech') tip='Click to research.';
			}
			
			var desc=me.desc;
			if (me.descFunc) desc=me.descFunc();
			if (me.bought && context=='store' && me.displayFuncWhenOwned) desc=me.displayFuncWhenOwned()+'<div class="line"></div>'+desc;
			if (me.unlockAt)
			{
				if (me.unlockAt.require)
				{
					var it=Game.Upgrades[me.unlockAt.require];
					desc='<div style="font-size:80%;text-align:center;">From <div class="icon" style="vertical-align:middle;display:inline-block;'+(it.icon[2]?'background-image:url('+it.icon[2]+');':'')+'background-position:'+(-it.icon[0]*48)+'px '+(-it.icon[1]*48)+'px;transform:scale(0.5);margin:-16px;"></div> '+it.name+'</div><div class="line"></div>'+desc;
				}
				/*else if (me.unlockAt.season)
				{
					var it=Game.seasons[me.unlockAt.season];
					desc='<div style="font-size:80%;text-align:center;">From <div class="icon" style="vertical-align:middle;display:inline-block;'+(Game.Upgrades[it.trigger].icon[2]?'background-image:url('+Game.Upgrades[it.trigger].icon[2]+');':'')+'background-position:'+(-Game.Upgrades[it.trigger].icon[0]*48)+'px '+(-Game.Upgrades[it.trigger].icon[1]*48)+'px;transform:scale(0.5);margin:-16px;"></div> '+it.name+'</div><div class="line"></div>'+desc;
				}*/
				else if (me.unlockAt.text)
				{
					var it=Game.Upgrades[me.unlockAt.require];
					desc='<div style="font-size:80%;text-align:center;">From <b>'+text+'</b></div><div class="line"></div>'+desc;
				}
			}
			
			return '<div style="padding:8px 4px;min-width:350px;">'+
			'<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;'+(icon[2]?'background-image:url('+icon[2]+');':'')+'background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+
			(me.bought && context=='store'?'':price)+
			'<div class="name">'+(mysterious?'???':me.name)+'</div>'+
			tagsStr+
			'<div class="line"></div><div class="description">'+(mysterious?'???':desc)+'</div></div>'+
			(tip!=''?('<div class="line"></div><div style="font-size:10px;font-weight:bold;color:#999;text-align:center;padding-bottom:4px;line-height:100%;">'+tip+'</div>'):'')+
			(Game.sesame?('<div style="font-size:9px;">Id : '+me.id+' | Order : '+Math.floor(me.order)+(me.tier?' | Tier : '+me.tier:'')+'</div>'):'');
		}
		
		Game.costDetails=function(cost)
		{
			if (!Game.Has('Genius accounting')) return '';
			if (!cost) return '';
			var priceInfo='';
			var cps=Game.cookiesPs*(1-Game.cpsSucked);
			if (cost>Game.cookies) priceInfo+='in '+Game.sayTime(((cost-Game.cookies)/cps+1)*Game.fps)+'<br>';
			priceInfo+=Game.sayTime((cost/cps+1)*Game.fps)+' worth<br>';
			priceInfo+=Beautify((cost/Game.cookies)*100,1)+'% of bank<br>';
			return '<div style="font-size:80%;opacity:0.7;line-height:90%;">'+priceInfo+'</div>';
		}
		
		
		/*=====================================================================================
		PRESTIGE
		=======================================================================================*/
		
		Game.HCfactor=3;
		Game.HowMuchPrestige=function(cookies)//how much prestige [cookies] should land you
		{
			return Math.pow(cookies/1000000000000,1/Game.HCfactor);
		}
		Game.HowManyCookiesReset=function(chips)//how many cookies [chips] are worth
		{
			//this must be the inverse of the above function (ie. if cookies=chips^2, chips=cookies^(1/2) )
			return Math.pow(chips,Game.HCfactor)*1000000000000;
		}
		Game.gainedPrestige=0;
		Game.EarnHeavenlyChips=function(cookiesForfeited)
		{
			//recalculate prestige and chips owned
			var prestige=Math.floor(Game.HowMuchPrestige(Game.cookiesReset+cookiesForfeited));
			if (prestige>Game.prestige)//did we gain prestige levels?
			{
				var prestigeDifference=prestige-Game.prestige;
				Game.gainedPrestige=prestigeDifference;
				Game.heavenlyChips+=prestigeDifference;
				Game.prestige=prestige;
				if (Game.prefs.popups) Game.Popup('你获得了 '+Beautify(prestigeDifference)+' 声望等级'+(prestigeDifference==1?'':'')+'!');
				else Game.Notify('你失去了你的 '+Beautify(cookiesForfeited)+' 饼干.','你获得了 <b>'+Beautify(prestigeDifference)+'</b> 声望等级'+(prestigeDifference==1?'':'')+'!',[19,7]);
			}
		}
		
		Game.GetHeavenlyMultiplier=function()
		{
			var heavenlyMult=0;
			if (Game.Has('天堂芯片的秘密')) heavenlyMult+=0.05;
			if (Game.Has('天堂饼干站')) heavenlyMult+=0.20;
			if (Game.Has('天堂面包店')) heavenlyMult+=0.25;
			if (Game.Has('天堂糖果店')) heavenlyMult+=0.25;
			if (Game.Has('天国的钥匙')) heavenlyMult+=0.25;
			if (Game.hasAura('Dragon God')) heavenlyMult*=1.05;
			if (Game.Has('幸运数字')) heavenlyMult*=1.01;
			if (Game.Has('幸运数')) heavenlyMult*=1.01;
			if (Game.Has('幸运的支付')) heavenlyMult*=1.01;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('creation');
				if (godLvl==1) heavenlyMult*=0.7;
				else if (godLvl==2) heavenlyMult*=0.8;
				else if (godLvl==3) heavenlyMult*=0.9;
			}
			return heavenlyMult;
		}
		
		Game.ascensionModes={
		0:{name:'无',desc:'没有特别的修饰词.',icon:[10,0]},
		1:{name:'重生',desc:'这次的比赛会表现得像你刚开始游戏一样。威望等级和神圣的升级将不会有任何效果，如糖块和建筑水平。<div class="line"></div>有些成就只有在这种模式下才能获得。',icon:[2,7]}/*,
		2:{name:'Trigger finger',desc:'In this run, scrolling your mouse wheel on the cookie counts as clicking it. Some upgrades introduce new clicking behaviors.<br>No clicking achievements may be obtained in this mode.<div class="line"></div>Reaching 1 quadrillion cookies in this mode unlocks a special heavenly upgrade.',icon:[12,0]}*/
		};
		
		Game.ascendMeterPercent=0;
		Game.ascendMeterPercentT=0;
		Game.ascendMeterLevel=100000000000000000000000000000;
		
		Game.nextAscensionMode=0;
		Game.UpdateAscensionModePrompt=function()
		{
			var icon=Game.ascensionModes[Game.nextAscensionMode].icon;
			var name=Game.ascensionModes[Game.nextAscensionMode].name;
			l('ascendModeButton').innerHTML=
			'<div class="crate noFrame enabled" '+Game.clickStr+'="Game.PickAscensionMode();" '+Game.getTooltip(
				'<div style="min-width:200px;text-align:center;font-size:11px;">下一轮挑战模式 :<br><b>'+name+'</b><div class="line"></div>挑战模式应用特殊的修饰符来提升你的下一次提升。<br>点击修改.</div>'
			,'bottom-right')+' style="opacity:1;float:none;display:block;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>';
		}
		Game.PickAscensionMode=function()
		{
			PlaySound('snd/tick.mp3');
			Game.tooltip.hide();
			
			var str='';
			for (var i in Game.ascensionModes)
			{
				var icon=Game.ascensionModes[i].icon;
				str+='<div class="crate enabled'+(i==Game.nextAscensionMode?' highlighted':'')+'" id="challengeModeSelector'+i+'" style="opacity:1;float:none;display:inline-block;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;" '+Game.clickStr+'="Game.nextAscensionMode='+i+';Game.PickAscensionMode();PlaySound(\'snd/tick.mp3\');Game.choiceSelectorOn=-1;" onMouseOut="l(\'challengeSelectedName\').innerHTML=Game.ascensionModes[Game.nextAscensionMode].name;l(\'challengeSelectedDesc\').innerHTML=Game.ascensionModes[Game.nextAscensionMode].desc;" onMouseOver="l(\'challengeSelectedName\').innerHTML=Game.ascensionModes['+i+'].name;l(\'challengeSelectedDesc\').innerHTML=Game.ascensionModes['+i+'].desc;"'+
				'></div>';
			}
			Game.Prompt('<h3>选择一个挑战模式</h3>'+
						'<div class="line"></div><div class="crateBox">'+str+'</div><h4 id="challengeSelectedName">'+Game.ascensionModes[Game.nextAscensionMode].name+'</h4><div class="line"></div><div id="challengeSelectedDesc" style="min-height:128px;">'+Game.ascensionModes[Game.nextAscensionMode].desc+'</div><div class="line"></div>'
						,[['确定','Game.UpdateAscensionModePrompt();Game.ClosePrompt();']],0,'widePrompt');
		}
		
		Game.UpdateLegacyPrompt=function()
		{
			if (!l('legacyPromptData')) return 0;
			var date=new Date();
			date.setTime(Date.now()-Game.startDate);
			var timeInSeconds=date.getTime()/1000;
			var startDate=Game.sayTime(timeInSeconds*Game.fps,-1);
			
			var ascendNowToGet=Math.floor(Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned)-Game.HowMuchPrestige(Game.cookiesReset));
			var cookiesToNext=Math.floor(Game.HowManyCookiesReset(Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned)+1)-Game.cookiesReset-Game.cookiesEarned);
			l('legacyPromptData').innerHTML=''+
				'<div class="icon" style="pointer-event:none;transform:scale(2);opacity:0.25;position:absolute;right:-8px;bottom:-8px;background-position:'+(-19*48)+'px '+(-7*48)+'px;"></div>'+
				'<div class="listing"><b>运行时间 :</b> '+(startDate==''?'tiny':(startDate))+'</div>'+
				//'<div class="listing">Earned : '+Beautify(Game.cookiesEarned)+', Reset : '+Beautify(Game.cookiesReset)+'</div>'+
				'<div class="listing"><b>声望等级 :</b> '+Beautify(Game.prestige)+'</div>'+
				'<div class="listing"><b>天堂芯片 :</b> '+Beautify(Game.heavenlyChips)+'</div>'+
				(ascendNowToGet>=1?('<div class="listing"><b>现在升天将产生 :</b> '+Beautify(ascendNowToGet)+' 天堂芯片'+((ascendNowToGet)==1?'':'')+'</div>'):
				('<div class="listing warning"><b>'+Beautify(cookiesToNext)+'</b> 更多饼干'+((cookiesToNext)==1?'':'')+' 下一个声望等级<br>你现在可以转生，但不会获得任何好处。</div>'))+
			'';
			if (1 || ascendNowToGet>=1) l('promptOption0').style.display='inline-block'; else l('promptOption0').style.display='none';
		}
		
		l('ascendOverlay').innerHTML=
			'<div id="ascendBox">'+
			'<div class="ascendData smallFramed prompt" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;font-size:11px;">每一个威望等级给予你永久+ 1%的饼干每秒产量。<br />你的等级越高，他们需要的饼干就越多。</div>'
							,'bottom-right')+' style="margin-top:8px;"><h3 id="ascendPrestige"></h3></div>'+
			'<div class="ascendData smallFramed prompt" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;font-size:11px;">天堂芯片是用来购买天堂升级的。<br>每次你获得声望，你就能得到一枚芯片。</div>'
							,'bottom-right')+'><h3 id="ascendHCs"></h3></div>'+
			'<a id="ascendButton" class="option framed large red" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;font-size:11px;">一旦你点击这个就购买了<br>你需要的一切!</div>'
							,'bottom-right')+' style="font-size:16px;margin-top:0px;"><span class="fancyText" style="font-size:20px;">转生</span></a>'+
			'<div id="ascendModeButton" style="position:absolute;right:34px;bottom:25px;display:none;"></div>'+
			'<input type="text" style="display:block;" id="upgradePositions"/></div>'+
			
			'<div id="ascendInfo"><div class="ascendData smallFramed" style="margin-top:22px;width:40%;font-size:11px;">你正在转生。拖动屏幕<br>或使用箭头键!<br>当你准备好时，<br>单击转生.</div></div>';
		
		Game.UpdateAscensionModePrompt();
		
		AddEvent(l('ascendButton'),'click',function(){
			PlaySound('snd/tick.mp3');
			Game.Reincarnate();
		});
		
		Game.ascendl=l('ascend');
		Game.ascendContentl=l('ascendContent');
		Game.ascendZoomablel=l('ascendZoomable');
		Game.ascendUpgradesl=l('ascendUpgrades');
		Game.OnAscend=0;
		Game.AscendTimer=0;//how far we are into the ascend animation
		Game.AscendDuration=Game.fps*5;//how long the ascend animation is
		Game.AscendBreakpoint=Game.AscendDuration*0.5;//at which point the cookie explodes during the ascend animation
		Game.UpdateAscendIntro=function()
		{
			if (Game.AscendTimer==1) PlaySound('snd/charging.mp3');
			if (Game.AscendTimer==Math.floor(Game.AscendBreakpoint)) PlaySound('snd/thud.mp3');
			Game.AscendTimer++;
			if (Game.AscendTimer>Game.AscendDuration)//end animation and launch ascend screen
			{
				PlaySound('snd/cymbalRev.mp3',0.5);
				PlaySound('snd/choir.mp3');
				Game.EarnHeavenlyChips(Game.cookiesEarned);
				Game.AscendTimer=0;
				Game.OnAscend=1;Game.removeClass('ascendIntro');
				Game.addClass('ascending');
				Game.BuildAscendTree();
				Game.heavenlyChipsDisplayed=Game.heavenlyChips;
				Game.nextAscensionMode=0;
				Game.ascensionMode=0;
				Game.UpdateAscensionModePrompt();
			}
		}
		Game.ReincarnateTimer=0;//how far we are into the reincarnation animation
		Game.ReincarnateDuration=Game.fps*1;//how long the reincarnation animation is
		Game.UpdateReincarnateIntro=function()
		{
			if (Game.ReincarnateTimer==1) PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
			Game.ReincarnateTimer++;
			if (Game.ReincarnateTimer>Game.ReincarnateDuration)//end animation and launch regular game
			{
				Game.ReincarnateTimer=0;
				Game.removeClass('reincarnating');
			}
		}
		Game.Reincarnate=function(bypass)
		{
			if (!bypass) Game.Prompt('<h3>转生</h3><div class="block">你准备好重返人间了吗?</div>',[['确定','Game.ClosePrompt();Game.Reincarnate(1);'],'取消']);
			else
			{
				Game.ascendUpgradesl.innerHTML='';
				Game.ascensionMode=Game.nextAscensionMode;
				Game.nextAscensionMode=0;
				Game.Reset();
				if (Game.HasAchiev('重生'))
				{
					if (Game.prefs.popups) Game.Popup('Reincarnated');
					else Game.Notify('转生','你好, 饼干！',[10,0],4);
				}
				if (Game.resets>=1000) Game.Win('无限循环');
				if (Game.resets>=100) Game.Win('转生');
				if (Game.resets>=10) Game.Win('复活');
				if (Game.resets>=1) Game.Win('重生');
				Game.removeClass('ascending');
				Game.OnAscend=0;
				//trigger the reincarnate animation
				Game.ReincarnateTimer=1;
				Game.addClass('reincarnating');
				Game.BigCookieSize=0;
			}
		}
		Game.GiveUpAscend=function(bypass)
		{
			if (!bypass) Game.Prompt('<h3>Give up</h3><div class="block">你确定吗?你离开的话，就得不到任何天堂芯片！</div>',[['确定','Game.ClosePrompt();Game.GiveUpAscend(1);'],'取消']);
			else
			{
				if (Game.prefs.popups) Game.Popup('游戏重置');
				else Game.Notify('放弃','让我们再试一次!',[0,5],4);
				Game.Reset();
			}
		}
		Game.Ascend=function(bypass)
		{
			if (!bypass) Game.Prompt('<h3>升天</h3><div class="block">你真的想升天吗？<div class="line"></div>你会失去你所以的游戏进度，并从头开始。<div class="line"></div>所有的饼干将被转换成威望和天堂芯片。<div class="line"></div>你会保留你的成就'+(Game.canLumps()?', 建筑水平和糖块':'')+'.</div>',[['确定!','Game.ClosePrompt();Game.Ascend(1);'],'取消']);
			else
			{
				if (Game.prefs.popups) Game.Popup('Ascending');
				else Game.Notify('升天','这么久了，饼干。',[20,7],4);
				Game.OnAscend=0;Game.removeClass('ascending');
				Game.addClass('ascendIntro');
				//trigger the ascend animation
				Game.AscendTimer=1;
				Game.killShimmers();
				l('toggleBox').style.display='none';
				l('toggleBox').innerHTML='';
				Game.choiceSelectorOn=-1;
				Game.ToggleSpecialMenu(0);
				Game.AscendOffX=0;
				Game.AscendOffY=0;
				Game.AscendOffXT=0;
				Game.AscendOffYT=0;
				Game.AscendZoomT=1;
				Game.AscendZoom=0.2;
			}
		}
		
		Game.DebuggingPrestige=0;
		Game.AscendDragX=0;
		Game.AscendDragY=0;
		Game.AscendOffX=0;
		Game.AscendOffY=0;
		Game.AscendZoom=1;
		Game.AscendOffXT=0;
		Game.AscendOffYT=0;
		Game.AscendZoomT=1;
		Game.AscendDragging=0;
		Game.AscendGridSnap=24;
		Game.heavenlyBounds={left:0,right:0,top:0,bottom:0};
		Game.UpdateAscend=function()
		{
			if (Game.keys[37]) Game.AscendOffXT+=16*(1/Game.AscendZoomT);
			if (Game.keys[38]) Game.AscendOffYT+=16*(1/Game.AscendZoomT);
			if (Game.keys[39]) Game.AscendOffXT-=16*(1/Game.AscendZoomT);
			if (Game.keys[40]) Game.AscendOffYT-=16*(1/Game.AscendZoomT);
			
			if (Game.AscendOffXT>-Game.heavenlyBounds.left) Game.AscendOffXT=-Game.heavenlyBounds.left;
			if (Game.AscendOffXT<-Game.heavenlyBounds.right) Game.AscendOffXT=-Game.heavenlyBounds.right;
			if (Game.AscendOffYT>-Game.heavenlyBounds.top) Game.AscendOffYT=-Game.heavenlyBounds.top;
			if (Game.AscendOffYT<-Game.heavenlyBounds.bottom) Game.AscendOffYT=-Game.heavenlyBounds.bottom;
			Game.AscendOffX+=(Game.AscendOffXT-Game.AscendOffX)*0.5;
			Game.AscendOffY+=(Game.AscendOffYT-Game.AscendOffY)*0.5;
			Game.AscendZoom+=(Game.AscendZoomT-Game.AscendZoom)*0.25;
			if (Math.abs(Game.AscendZoomT-Game.AscendZoom)<0.005) Game.AscendZoom=Game.AscendZoomT;
			
			if (Game.DebuggingPrestige)
			{
				for (var i in Game.PrestigeUpgrades)
				{
					var me=Game.PrestigeUpgrades[i];
					AddEvent(l('heavenlyUpgrade'+me.id),'mousedown',function(me){return function(){
						if (!Game.DebuggingPrestige) return;
						Game.SelectedHeavenlyUpgrade=me;
					}}(me));
					AddEvent(l('heavenlyUpgrade'+me.id),'mouseup',function(me){return function(){
						if (Game.SelectedHeavenlyUpgrade==me) {Game.SelectedHeavenlyUpgrade=0;Game.BuildAscendTree();}
					}}(me));
				}
			}
			
			if (Game.mouseDown && !Game.promptOn)
			{
				if (!Game.AscendDragging)
				{
					Game.AscendDragX=Game.mouseX;
					Game.AscendDragY=Game.mouseY;
				}
				Game.AscendDragging=1;
				
				if (Game.DebuggingPrestige)
				{
					if (Game.SelectedHeavenlyUpgrade)
					{
						Game.tooltip.hide();
						//drag upgrades around
						var me=Game.SelectedHeavenlyUpgrade;
						me.posX+=(Game.mouseX-Game.AscendDragX)*(1/Game.AscendZoomT);
						me.posY+=(Game.mouseY-Game.AscendDragY)*(1/Game.AscendZoomT);
						var posX=me.posX;//Math.round(me.posX/Game.AscendGridSnap)*Game.AscendGridSnap;
						var posY=me.posY;//Math.round(me.posY/Game.AscendGridSnap)*Game.AscendGridSnap;
						l('heavenlyUpgrade'+me.id).style.left=Math.floor(posX)+'px';
						l('heavenlyUpgrade'+me.id).style.top=Math.floor(posY)+'px';
						for (var ii in me.parents)
						{
							var origX=0;
							var origY=0;
							var targX=me.posX+28;
							var targY=me.posY+28;
							if (me.parents[ii]!=-1) {origX=me.parents[ii].posX+28;origY=me.parents[ii].posY+28;}
							var rot=-(Math.atan((targY-origY)/(origX-targX))/Math.PI)*180;
							if (targX<=origX) rot+=180;
							var dist=Math.floor(Math.sqrt((targX-origX)*(targX-origX)+(targY-origY)*(targY-origY)));
							//l('heavenlyLink'+me.id+'-'+ii).style='width:'+dist+'px;-webkit-transform:rotate('+rot+'deg);-moz-transform:rotate('+rot+'deg);-ms-transform:rotate('+rot+'deg);-o-transform:rotate('+rot+'deg);transform:rotate('+rot+'deg);left:'+(origX)+'px;top:'+(origY)+'px;';
							l('heavenlyLink'+me.id+'-'+ii).style='width:'+dist+'px;transform:rotate('+rot+'deg);left:'+(origX)+'px;top:'+(origY)+'px;';
						}
					}
				}
				if (!Game.SelectedHeavenlyUpgrade)
				{
					Game.AscendOffXT+=(Game.mouseX-Game.AscendDragX)*(1/Game.AscendZoomT);
					Game.AscendOffYT+=(Game.mouseY-Game.AscendDragY)*(1/Game.AscendZoomT);
				}
				Game.AscendDragX=Game.mouseX;
				Game.AscendDragY=Game.mouseY;
			}
			else
			{
				/*if (Game.SelectedHeavenlyUpgrade)
				{
					var me=Game.SelectedHeavenlyUpgrade;
					me.posX=Math.round(me.posX/Game.AscendGridSnap)*Game.AscendGridSnap;
					me.posY=Math.round(me.posY/Game.AscendGridSnap)*Game.AscendGridSnap;
					l('heavenlyUpgrade'+me.id).style.left=me.posX+'px';
					l('heavenlyUpgrade'+me.id).style.top=me.posY+'px';
				}*/
				Game.AscendDragging=0;
				Game.SelectedHeavenlyUpgrade=0;
			}
			if (Game.Click || Game.promptOn)
			{
				Game.AscendDragging=0;
			}
			
			//Game.ascendl.style.backgroundPosition=Math.floor(Game.AscendOffX/2)+'px '+Math.floor(Game.AscendOffY/2)+'px';
			//Game.ascendl.style.backgroundPosition=Math.floor(Game.AscendOffX/2)+'px '+Math.floor(Game.AscendOffY/2)+'px,'+Math.floor(Game.AscendOffX/4)+'px '+Math.floor(Game.AscendOffY/4)+'px';
			//Game.ascendContentl.style.left=Math.floor(Game.AscendOffX)+'px';
			//Game.ascendContentl.style.top=Math.floor(Game.AscendOffY)+'px';
			Game.ascendContentl.style.webkitTransform='translate('+Math.floor(Game.AscendOffX)+'px,'+Math.floor(Game.AscendOffY)+'px)';
			Game.ascendContentl.style.msTransform='translate('+Math.floor(Game.AscendOffX)+'px,'+Math.floor(Game.AscendOffY)+'px)';
			Game.ascendContentl.style.oTransform='translate('+Math.floor(Game.AscendOffX)+'px,'+Math.floor(Game.AscendOffY)+'px)';
			Game.ascendContentl.style.mozTransform='translate('+Math.floor(Game.AscendOffX)+'px,'+Math.floor(Game.AscendOffY)+'px)';
			Game.ascendContentl.style.transform='translate('+Math.floor(Game.AscendOffX)+'px,'+Math.floor(Game.AscendOffY)+'px)';
			Game.ascendZoomablel.style.webkitTransform='scale('+(Game.AscendZoom)+','+(Game.AscendZoom)+')';
			Game.ascendZoomablel.style.msTransform='scale('+(Game.AscendZoom)+','+(Game.AscendZoom)+')';
			Game.ascendZoomablel.style.oTransform='scale('+(Game.AscendZoom)+','+(Game.AscendZoom)+')';
			Game.ascendZoomablel.style.mozTransform='scale('+(Game.AscendZoom)+','+(Game.AscendZoom)+')';
			Game.ascendZoomablel.style.transform='scale('+(Game.AscendZoom)+','+(Game.AscendZoom)+')';
			
			//if (Game.Scroll!=0) Game.ascendContentl.style.transformOrigin=Math.floor(Game.windowW/2-Game.mouseX)+'px '+Math.floor(Game.windowH/2-Game.mouseY)+'px';
			if (Game.Scroll<0 && !Game.promptOn) {Game.AscendZoomT=0.5;}
			if (Game.Scroll>0 && !Game.promptOn) {Game.AscendZoomT=1;}
			
			if (Game.T%2==0)
			{
				l('ascendPrestige').innerHTML='声望等级 :<br>'+Beautify(Game.prestige);
				l('ascendHCs').innerHTML='天堂芯片 :<br><span class="price heavenly">'+Beautify(Math.round(Game.heavenlyChipsDisplayed))+'</span>';
				if (Game.prestige>0) l('ascendModeButton').style.display='block';
				else l('ascendModeButton').style.display='none';
			}
			Game.heavenlyChipsDisplayed+=(Game.heavenlyChips-Game.heavenlyChipsDisplayed)*0.4;
			
			if (Game.DebuggingPrestige && Game.T%10==0)
			{
				var str='';
				for (var i in Game.PrestigeUpgrades)
				{
					var me=Game.PrestigeUpgrades[i];
					str+=me.id+':['+Math.floor(me.posX)+','+Math.floor(me.posY)+'],';
				}
				l('upgradePositions').value='Game.UpgradePositions={'+str+'};';
			}
			//if (Game.T%5==0) Game.BuildAscendTree();
		}
		Game.AscendRefocus=function()
		{
			Game.AscendOffX=0;
			Game.AscendOffY=0;
			Game.ascendl.className='';
		}
		
		Game.SelectedHeavenlyUpgrade=0;
		Game.PurchaseHeavenlyUpgrade=function(what)
		{
			//if (Game.Has('Neuromancy')) Game.UpgradesById[what].toggle(); else
			if (Game.UpgradesById[what].buy())
			{
				if (l('heavenlyUpgrade'+what)){var rect=l('heavenlyUpgrade'+what).getBoundingClientRect();Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24);}
				//Game.BuildAscendTree();
			}
		}
		Game.BuildAscendTree=function()
		{
			var str='';
			Game.heavenlyBounds={left:0,right:0,top:0,bottom:0};

			if (Game.DebuggingPrestige) l('upgradePositions').style.display='block'; else l('upgradePositions').style.display='none';
			
			for (var i in Game.PrestigeUpgrades)
			{
				var me=Game.PrestigeUpgrades[i];
				me.canBePurchased=1;
				if (!me.bought && !Game.DebuggingPrestige)
				{
					if (me.showIf && !me.showIf()) me.canBePurchased=0;
					else
					{
						for (var ii in me.parents)
						{
							if (me.parents[ii]!=-1 && !me.parents[ii].bought) me.canBePurchased=0;
						}
					}
				}
			}
			str+='<div class="crateBox" style="filter:none;-webkit-filter:none;">';//chrome is still bad at these
			for (var i in Game.PrestigeUpgrades)
			{
				var me=Game.PrestigeUpgrades[i];
				
				var ghosted=0;
				if (me.canBePurchased || Game.Has('神经占卜'))
				{
					str+=Game.crate(me,'ascend','Game.PurchaseHeavenlyUpgrade('+me.id+');','heavenlyUpgrade'+me.id);
                    
				}
				else
				{
					for (var ii in me.parents)
					{
						if (me.parents[ii]!=-1 && me.parents[ii].canBePurchased) ghosted=1;
					}
					if (me.showIf && !me.showIf()) ghosted=0;
					if (ghosted)
					{
						//maybe replace this with Game.crate()
						str+='<div class="crate upgrade heavenly ghosted" id="heavenlyUpgrade'+me.id+'" style="position:absolute;left:'+me.posX+'px;top:'+me.posY+'px;'+(me.icon[2]?'background-image:url('+me.icon[2]+');':'')+'background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div>';
					}
				}
				if (me.canBePurchased || Game.Has('神经占卜') || ghosted)
				{
					if (me.posX<Game.heavenlyBounds.left) Game.heavenlyBounds.left=me.posX;
					if (me.posX>Game.heavenlyBounds.right) Game.heavenlyBounds.right=me.posX;
					if (me.posY<Game.heavenlyBounds.top) Game.heavenlyBounds.top=me.posY;
					if (me.posY>Game.heavenlyBounds.bottom) Game.heavenlyBounds.bottom=me.posY;
				}
				for (var ii in me.parents)//create pulsing links
				{
					if (me.parents[ii]!=-1 && (me.canBePurchased || ghosted))
					{
						var origX=0;
						var origY=0;
						var targX=me.posX+28;
						var targY=me.posY+28;
						if (me.parents[ii]!=-1) {origX=me.parents[ii].posX+28;origY=me.parents[ii].posY+28;}
						var rot=-(Math.atan((targY-origY)/(origX-targX))/Math.PI)*180;
						if (targX<=origX) rot+=180;
						var dist=Math.floor(Math.sqrt((targX-origX)*(targX-origX)+(targY-origY)*(targY-origY)));
						str+='<div class="parentLink" id="heavenlyLink'+me.id+'-'+ii+'" style="'+(ghosted?'opacity:0.1;':'')+'width:'+dist+'px;-webkit-transform:rotate('+rot+'deg);-moz-transform:rotate('+rot+'deg);-ms-transform:rotate('+rot+'deg);-o-transform:rotate('+rot+'deg);transform:rotate('+rot+'deg);left:'+(origX)+'px;top:'+(origY)+'px;"></div>';
					}
				}
			}
			Game.heavenlyBounds.left-=128;
			Game.heavenlyBounds.top-=128;
			Game.heavenlyBounds.right+=128+64;
			Game.heavenlyBounds.bottom+=128+64;
			//str+='<div style="border:1px solid red;position:absolute;left:'+Game.heavenlyBounds.left+'px;width:'+(Game.heavenlyBounds.right-Game.heavenlyBounds.left)+'px;top:'+Game.heavenlyBounds.top+'px;height:'+(Game.heavenlyBounds.bottom-Game.heavenlyBounds.top)+'px;"></div>';
			str+='</div>';
			Game.ascendUpgradesl.innerHTML=str;
		}
		
		
		/*=====================================================================================
		COALESCING SUGAR LUMPS
		=======================================================================================*/
		Game.lumpMatureAge=1;
		Game.lumpRipeAge=1;
		Game.lumpOverripeAge=1;
		Game.lumpCurrentType=0;
		l('comments').innerHTML=l('comments').innerHTML+
			'<div id="lumps" onclick="Game.clickLump();" '+Game.getDynamicTooltip('Game.lumpTooltip','bottom')+'><div id="lumpsIcon" class="usesIcon"></div><div id="lumpsIcon2" class="usesIcon"></div><div id="lumpsAmount">0</div></div>';
		Game.lumpTooltip=function()
		{
			var str='<div style="padding:8px;width:400px;font-size:11px;text-align:center;">'+
			'你有 <span class="price lump">'+Beautify(Game.lumps)+' 糖块'+(Game.lumps==1?'':'')+'</span>.'+
			'<div class="line"></div>'+
			'一个 <b>糖块</b> 在这里凝聚，被你过去的壮举所吸引。';
						
			var age=Date.now()-Game.lumpT;
			str+='<div class="line"></div>';
			if (age<Game.lumpMatureAge) str+='这个糖块还在生长，还需要 <b>'+Game.sayTime(((Game.lumpMatureAge-age)/1000+1)*Game.fps,-1)+'</b> 达到成熟。';
			else if (age<Game.lumpRipeAge) str+='这个糖块是成熟的，会成熟的 <b>'+Game.sayTime(((Game.lumpRipeAge-age)/1000+1)*Game.fps,-1)+'</b>.<br>你可以 <b>点击它以获取它</b>, 但是有 <b>50% 几率你不会得到任何东西</b>.';
			else if (age<Game.lumpOverripeAge) str+='<b>这个糖块熟了!点击它以获取它。</b><br>如果你什么都不做，它就会在 <b>'+Game.sayTime(((Game.lumpOverripeAge-age)/1000+1)*Game.fps,-1)+'</b> 自动收割 。';
			
			var phase=(age/Game.lumpOverripeAge)*7;
			if (phase>=3)
			{
				if (Game.lumpCurrentType!=0) str+='<div class="line"></div>';
				if (Game.lumpCurrentType==1) str+='这个糖块长大了 <b>分叉</b>; 收割时，它有50%的机会产生两块。';
				else if (Game.lumpCurrentType==2) str+='这个糖块长大了 <b>黄金</b>; 收获2到7块，你现在的饼干会翻倍，你会找到10%的黄金饼干在接下来的24小时。';
				else if (Game.lumpCurrentType==3) str+='这个糖块受到了长老们的影响，渐渐长大了 <b>多肉的</b>; 收割时，它的产量在0到2块之间。';
				else if (Game.lumpCurrentType==4) str+='这个糖块是 <b>焦糖化</b>, 它的粘性把它和意想不到的东西结合在一起;收获它将会产生1到3个结块，并补充你的糖块冷却时间。';
			}
			
			str+='<div class="line"></div>';
			str+='糖块完全成熟需要 <b>'+Game.sayTime((Game.lumpMatureAge/1000)*Game.fps,-1)+'</b>,<br>成熟后 <b>'+Game.sayTime((Game.lumpRipeAge/1000)*Game.fps,-1)+'</b>,<br>然后会在 <b>'+Game.sayTime((Game.lumpOverripeAge/1000)*Game.fps,-1)+'</b>后自动掉落。';
			
			str+='<div class="line"></div>'+
			'&bull; 糖块可以在成熟时收获，但如果不吃的话，它们最终会掉落并在一段时间后自动收获。<br>&bull; 糖块儿很好吃，可以用作各种食物的货币。<br>&bull; 一旦一个糖块被收获，另一个就会开始生长。<br>&bull; 注意，当游戏关闭时，糖块会继续生长。';
			
			str+='</div>';
			return str;
		}
		Game.computeLumpTimes=function()
		{
			var hour=1000*60*60;
			Game.lumpMatureAge=hour*20;
			Game.lumpRipeAge=hour*23;
			if (Game.Has('甜菊糖')) Game.lumpRipeAge-=hour;
			if (Game.Has('糖尿病患者')) Game.lumpMatureAge-=hour;
			if (Game.Has('Ichor syrup')) Game.lumpMatureAge-=1000*60*7;
			if (Game.Has('糖老化过程')) Game.lumpRipeAge-=6000*Math.min(600,Game.Objects['Grandma'].amount);//capped at 600 grandmas
			if (Game.hasGod && Game.BuildingsOwned%10==0)
			{
				var godLvl=Game.hasGod('order');
				if (godLvl==1) Game.lumpRipeAge-=hour;
				else if (godLvl==2) Game.lumpRipeAge-=(hour/3)*2;
				else if (godLvl==3) Game.lumpRipeAge-=(hour/3);
			}
			if (Game.hasAura('Dragon\'s Curve')) {Game.lumpMatureAge/=1.05;Game.lumpRipeAge/=1.05;}
			Game.lumpOverripeAge=Game.lumpRipeAge+hour;
			if (Game.Has('葡萄糖空气')) {Game.lumpMatureAge/=2000;Game.lumpRipeAge/=2000;Game.lumpOverripeAge/=2000;}
		}
		Game.loadLumps=function(time)
		{
			Game.computeLumpTimes();
			//Game.computeLumpType();
			if (!Game.canLumps()) Game.removeClass('lumpsOn');
			else
			{
				if (Game.ascensionMode!=1) Game.addClass('lumpsOn');
				Game.lumpT=Math.min(Date.now(),Game.lumpT);
				var age=Math.max(Date.now()-Game.lumpT,0);
				var amount=Math.floor(age/Game.lumpOverripeAge);//how many lumps did we harvest since we closed the game?
				if (amount>=1)
				{
					Game.harvestLumps(1,true);
					Game.lumpCurrentType=0;//all offline lumps after the first one have a normal type
					if (amount>1) Game.harvestLumps(amount-1,true);
					if (Game.prefs.popups) Game.Popup('收获 '+Beautify(amount)+' 糖块'+(amount==1?'':'')+' 在你离开的时候');
					else Game.Notify('','你收获了 <b>'+Beautify(amount)+'</b> 糖块'+(amount==1?'':'')+' 在你离开的时候.',[29,14]);
					Game.lumpT=Date.now()-(age-amount*Game.lumpOverripeAge);
					Game.computeLumpType();
				}
			}
		}
		Game.gainLumps=function(total)
		{
			if (Game.lumpsTotal==-1){Game.lumpsTotal=0;Game.lumps=0;}
			Game.lumps+=total;
			Game.lumpsTotal+=total;
			
			if (Game.lumpsTotal>=7) Game.Win('伙计，亲爱的');
			if (Game.lumpsTotal>=30) Game.Win('糖粉');
			if (Game.lumpsTotal>=365) Game.Win('一年的蛀牙');
		}
		Game.clickLump=function()
		{
			if (!Game.canLumps()) return;
			var age=Date.now()-Game.lumpT;
			if (age<Game.lumpMatureAge) {}
			else if (age<Game.lumpRipeAge)
			{
				var amount=choose([0,1]);
				if (amount!=0) Game.Win('精心挑选');
				Game.harvestLumps(amount);
				Game.computeLumpType();
			}
			else if (age<Game.lumpOverripeAge)
			{
				Game.harvestLumps(1);
				Game.computeLumpType();
			}
		}
		Game.harvestLumps=function(amount,silent)
		{
			if (!Game.canLumps()) return;
			Game.lumpT=Date.now();
			var total=amount;
			if (Game.lumpCurrentType==1 && Game.Has('舒张症') && Math.random()<0.05) total*=2;
			else if (Game.lumpCurrentType==1) total*=choose([1,2]);
			else if (Game.lumpCurrentType==2)
			{
				total*=choose([2,3,4,5,6,7]);
				Game.gainBuff('sugar blessing',24*60*60,1);
				Game.Earn(Game.cookies);
				if (Game.prefs.popups) Game.Popup('糖的祝福已激活!');
				else Game.Notify('糖的祝福激活!','你的饼干已经翻倍了。<br>+10% 黄金饼干出现几率，在接下来的24小时。',[29,16]);
			}
			else if (Game.lumpCurrentType==3) total*=choose([0,0,1,2,2]);
			else if (Game.lumpCurrentType==4)
			{
				total*=choose([1,2,3]);
				Game.lumpRefill=Date.now()-Game.getLumpRefillMax();
				if (Game.prefs.popups) Game.Popup('Sugar lump cooldowns cleared!');
				else Game.Notify('Sugar lump cooldowns cleared!','',[29,27]);
			}
			total=Math.floor(total);
			Game.gainLumps(total);
			if (Game.lumpCurrentType==1) Game.Win('糖糖');
			else if (Game.lumpCurrentType==2) Game.Win('天然蔗糖');
			else if (Game.lumpCurrentType==3) Game.Win('甜品');
			else if (Game.lumpCurrentType==4) Game.Win('Maillard reaction');
			
			if (!silent)
			{
				var rect=l('lumpsIcon2').getBoundingClientRect();Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24);
				if (total>0) Game.Popup('<small>+'+Beautify(total)+' 糖块'+(total==1?'':'s')+'</small>',(rect.left+rect.right)/2,(rect.top+rect.bottom)/2-48);
				else Game.Popup('<small>糟糕的收获!</small>',(rect.left+rect.right)/2,(rect.top+rect.bottom)/2-48);
				PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
			}
			Game.computeLumpTimes();
		}
		Game.computeLumpType=function()
		{
			Math.seedrandom(Game.seed+'/'+Game.lumpT);
			var rand=Math.random();
			var types=[0];
			var loop=1;
			if (Game.hasAura('Dragon\'s Curve')) loop=2;
			for (var i=0;i<loop;i++)
			{
				if (rand<(Game.Has('舒张症')?0.15:0.1)) types.push(1);//bifurcated
				if (rand<3/1000) types.push(2);//golden
				if (rand<0.1*Game.elderWrath) types.push(3);//meaty
				if (rand<1/50) types.push(4);//caramelized
			}
			Game.lumpCurrentType=choose(types);
			Math.seedrandom();
		}
		
		Game.canLumps=function()//grammatically pleasing function name
		{
			if (Game.lumpsTotal>-1 || (Game.ascensionMode!=1 && (Game.cookiesEarned+Game.cookiesReset)>=1000000000)) return true;
			return false;
		}
		
		Game.getLumpRefillMax=function()
		{
			return 1000*60*15;//15 minutes
		}
		Game.getLumpRefillRemaining=function()
		{
			return Game.getLumpRefillMax()-(Date.now()-Game.lumpRefill);
		}
		Game.canRefillLump=function()
		{
			return ((Date.now()-Game.lumpRefill)>=Game.getLumpRefillMax());
		}
		Game.refillLump=function(n,func)
		{
			if (Game.lumps>=n && Game.canRefillLump())
			{
				Game.spendLump(n,'refill',function()
				{
					if (!Game.sesame) Game.lumpRefill=Date.now();
					func();
				})();
			}
		}
		Game.spendLump=function(n,str,func)
		{
			//ask if we want to spend N lumps
			return function()
			{
				if (Game.lumps<n) return false;
				if (Game.prefs.askLumps)
				{
					PlaySound('snd/tick.mp3');
					Game.promptConfirmFunc=func;//bit dumb
					Game.Prompt('<div class="icon" style="background:url(img/icons.png?v='+Game.version+');float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-29*48)+'px '+(-14*48)+'px;"></div><div style="margin:16px 8px;">你想花钱吗 <b>'+Beautify(n)+' lump'+(n!=1?'':'')+'</b> to '+str+'?</div>',[['确定','Game.lumps-='+n+';Game.promptConfirmFunc();Game.promptConfirmFunc=0;Game.recalculateGains=1;Game.ClosePrompt();'],'取消']);
					return false;
				}
				else
				{
					Game.lumps-=n;
					func();
					Game.recalculateGains=1;
				}
			}
		}
		
		Game.doLumps=function()
		{
			if (!Game.canLumps()) {Game.removeClass('lumpsOn');return;}
			if (Game.lumpsTotal==-1)
			{
				//first time !
				if (Game.ascensionMode!=1) Game.addClass('lumpsOn');
				Game.lumpT-Date.now();
				Game.lumpsTotal=0;
				Game.lumps=0;
				Game.computeLumpType();
				
				Game.Notify('糖块!','由于你累计已经烤了 <b>十亿饼干</b>, 你现在正在吸引 <b>糖块</b>. 在你的屏幕顶部，在统计按钮下，它们静静地结合在一起。<br>当它们成熟的时候，你就能收获它们，然后你就可以把它们花在各种各样的事情上!',[23,14]);
			}
			var age=Date.now()-Game.lumpT;
			if (age>Game.lumpOverripeAge)
			{
				age=0;
				Game.harvestLumps(1);
				Game.computeLumpType();
			}
			
			var phase=Math.min(6,Math.floor((age/Game.lumpOverripeAge)*7));
			var phase2=Math.min(6,Math.floor((age/Game.lumpOverripeAge)*7)+1);
			var row=14;
			var row2=14;
			var type=Game.lumpCurrentType;
			if (type==1)//double
			{
				//if (phase>=6) row=15;
				if (phase2>=6) row2=15;
			}
			else if (type==2)//golden
			{
				if (phase>=4) row=16;
				if (phase2>=4) row2=16;
			}
			else if (type==3)//meaty
			{
				if (phase>=4) row=17;
				if (phase2>=4) row2=17;
			}
			else if (type==4)//caramelized
			{
				if (phase>=4) row=27;
				if (phase2>=4) row2=27;
			}
			var icon=[23+Math.min(phase,5),row];
			var icon2=[23+phase2,row2];
			var opacity=Math.min(6,(age/Game.lumpOverripeAge)*7)%1;
			if (phase>=6) {opacity=1;}
			l('lumpsIcon').style.backgroundPosition=(-icon[0]*48)+'px '+(-icon[1]*48)+'px';
			l('lumpsIcon2').style.backgroundPosition=(-icon2[0]*48)+'px '+(-icon2[1]*48)+'px';
			l('lumpsIcon2').style.opacity=opacity;
			l('lumpsAmount').innerHTML=Beautify(Game.lumps);
		}
		
		/*=====================================================================================
		COOKIE ECONOMICS
		=======================================================================================*/
		Game.Earn=function(howmuch)
		{
			Game.cookies+=howmuch;
			Game.cookiesEarned+=howmuch;
		}
		Game.Spend=function(howmuch)
		{
			Game.cookies-=howmuch;
		}
		Game.Dissolve=function(howmuch)
		{
			Game.cookies-=howmuch;
			Game.cookiesEarned-=howmuch;
			Game.cookies=Math.max(0,Game.cookies);
			Game.cookiesEarned=Math.max(0,Game.cookiesEarned);
		}
		Game.mouseCps=function()
		{
			var add=0;
			if (Game.Has('千手指')) add+=		0.1;
			if (Game.Has('百万手指')) add+=		0.5;
			if (Game.Has('十亿手指')) add+=		5;
			if (Game.Has('万亿手指')) add+=		50;
			if (Game.Has('千万亿手指')) add+=	500;
			if (Game.Has('万兆手指')) add+=	5000;
			if (Game.Has('百万的六乘方手指')) add+=	50000;
			if (Game.Has('巨量的手指')) add+=	500000;
			if (Game.Has('千的九次方手指')) add+=	5000000;
			var num=0;
			for (var i in Game.Objects) {num+=Game.Objects[i].amount;}
			num-=Game.Objects['Cursor'].amount;
			add=add*num;
			if (Game.Has('塑料鼠标')) add+=Game.cookiesPs*0.01;
			if (Game.Has('铁制鼠标')) add+=Game.cookiesPs*0.01;
			if (Game.Has('钛制鼠标')) add+=Game.cookiesPs*0.01;
			if (Game.Has('釉质鼠标')) add+=Game.cookiesPs*0.01;
			if (Game.Has('难得素鼠标')) add+=Game.cookiesPs*0.01;
			if (Game.Has('E合金鼠标')) add+=Game.cookiesPs*0.01;
			if (Game.Has('叉合金鼠标')) add+=Game.cookiesPs*0.01;
			if (Game.Has('范塔钢鼠标')) add+=Game.cookiesPs*0.01;
			if (Game.Has('永不崩溃的鼠标')) add+=Game.cookiesPs*0.01;
			if (Game.Has('阿迈斯里鼠标')) add+=Game.cookiesPs*0.01;
			if (Game.Has('高科技鼠标')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Plasmarble mouse')) add+=Game.cookiesPs*0.01;
			var mult=1;
			
			for (var i in Game.customMouseCps) {mult+=Game.customMouseCps[i]();}
			
			if (Game.Has('圣诞老人的帮手')) mult*=1.1;
			if (Game.Has('饼干蛋')) mult*=1.1;
			if (Game.Has('光环手套')) mult*=1.1;
			
			mult*=Game.eff('click');
			
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('labor');
				if (godLvl==1) mult*=1.15;
				else if (godLvl==2) mult*=1.1;
				else if (godLvl==3) mult*=1.05;
			}
			
			for (var i in Game.buffs)
			{
				if (typeof Game.buffs[i].multClick != 'undefined') mult*=Game.buffs[i].multClick;
			}
			
			if (Game.hasAura('Dragon Cursor')) mult*=1.05;
			
			for (var i in Game.customMouseCpsMult) {mult*=Game.customMouseCpsMult[i]();}
			
			var out=mult*Game.ComputeCps(1,Game.Has('加强的食指')+Game.Has('腕管预防霜')+Game.Has('双手通用'),add);
			
			if (Game.hasBuff('被诅咒的手指')) out=Game.buffs['被诅咒的手指'].power;
			return out;
		}
		Game.computedMouseCps=1;
		Game.globalCpsMult=1;
		Game.unbuffedCps=0;
		Game.lastClick=0;
		Game.CanClick=1;
		Game.autoclickerDetected=0;
		Game.BigCookieState=0;//0 = normal, 1 = clicked (small), 2 = released/hovered (big)
		Game.BigCookieSize=0;
		Game.BigCookieSizeD=0;
		Game.BigCookieSizeT=1;
		Game.cookieClickSound=Math.floor(Math.random()*7)+1;
		Game.playCookieClickSound=function()
		{
			if (Game.prefs.cookiesound) PlaySound('snd/clickb'+(Game.cookieClickSound)+'.mp3',0.5);
			else PlaySound('snd/click'+(Game.cookieClickSound)+'.mp3',0.5);
			Game.cookieClickSound+=Math.floor(Math.random()*4)+1;
			if (Game.cookieClickSound>7) Game.cookieClickSound-=7;
		}
		Game.ClickCookie=function(event,amount)
		{
			var now=Date.now();
			if (event) event.preventDefault();
			if (Game.OnAscend || Game.AscendTimer>0) {}
			else if (now-Game.lastClick<1000/250) {}
			else
			{
				if (now-Game.lastClick<1000/15)
				{
					Game.autoclickerDetected+=Game.fps;
					if (Game.autoclickerDetected>=Game.fps*5) Game.Win('神奇遥控器');
				}
				Game.loseShimmeringVeil();
				var amount=amount?amount:Game.computedMouseCps;
				Game.Earn(amount);
				Game.handmadeCookies+=amount;
				if (Game.prefs.particles)
				{
					Game.particleAdd();
					Game.particleAdd(Game.mouseX,Game.mouseY,Math.random()*4-2,Math.random()*-2-2,Math.random()*0.5+0.75,1,2);
				}
				if (Game.prefs.numbers) Game.particleAdd(Game.mouseX+Math.random()*8-4,Game.mouseY-8+Math.random()*8-4,0,-2,1,4,2,'','+'+Beautify(amount,1));
				
				for (var i in Game.customCookieClicks) {Game.customCookieClicks[i]();}
			
				Game.playCookieClickSound();
				Game.cookieClicks++;
			}
			Game.lastClick=now;
			Game.Click=0;
		}
		Game.mouseX=0;
		Game.mouseY=0;
		Game.mouseX2=0;
		Game.mouseY2=0;
		Game.mouseMoved=0;
		Game.GetMouseCoords=function(e)
		{
			var posx=0;
			var posy=0;
			if (!e) var e=window.event;
			if (e.pageX||e.pageY)
			{
				posx=e.pageX;
				posy=e.pageY;
			}
			else if (e.clientX || e.clientY)
			{
				posx=e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft;
				posy=e.clientY+document.body.scrollTop+document.documentElement.scrollTop;
			}
			var x=0;
			var y=32;
			/*
			var el=l('sectionLeft');
			while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop))
			{
				x+=el.offsetLeft-el.scrollLeft;
				y+=el.offsetTop-el.scrollTop;
				el=el.offsetParent;
			}*/
			Game.mouseX2=Game.mouseX;
			Game.mouseY2=Game.mouseY;
			Game.mouseX=posx-x;
			Game.mouseY=posy-y;
			Game.mouseMoved=1;
		}
		var bigCookie=l('bigCookie');
		Game.Click=0;
		Game.lastClickedEl=0;
		Game.clickFrom=0;
		Game.Scroll=0;
		Game.mouseDown=0;
		if (!Game.touchEvents)
		{
			AddEvent(bigCookie,'click',Game.ClickCookie);
			AddEvent(bigCookie,'mousedown',function(event){Game.BigCookieState=1;if (Game.prefs.cookiesound) {Game.playCookieClickSound();}if (event) event.preventDefault();});
			AddEvent(bigCookie,'mouseup',function(event){Game.BigCookieState=2;if (event) event.preventDefault();});
			AddEvent(bigCookie,'mouseout',function(event){Game.BigCookieState=0;});
			AddEvent(bigCookie,'mouseover',function(event){Game.BigCookieState=2;});
			AddEvent(document,'mousemove',Game.GetMouseCoords);
			AddEvent(document,'mousedown',function(event){Game.mouseDown=1;Game.clickFrom=event.target;});
			AddEvent(document,'mouseup',function(event){Game.mouseDown=0;Game.clickFrom=0;});
			AddEvent(document,'click',function(event){Game.Click=1;Game.lastClickedEl=event.target;Game.clickFrom=0;});
			Game.handleScroll=function(e)
			{
				if (!e) e=event;
				Game.Scroll=(e.detail<0||e.wheelDelta>0)?1:-1;
			};
			AddEvent(document,'DOMMouseScroll',Game.handleScroll);
			AddEvent(document,'mousewheel',Game.handleScroll);
		}
		else
		{
			//touch events
			AddEvent(bigCookie,'touchend',Game.ClickCookie);
			AddEvent(bigCookie,'touchstart',function(event){Game.BigCookieState=1;if (event) event.preventDefault();});
			AddEvent(bigCookie,'touchend',function(event){Game.BigCookieState=0;if (event) event.preventDefault();});
			//AddEvent(document,'touchmove',Game.GetMouseCoords);
			AddEvent(document,'mousemove',Game.GetMouseCoords);
			AddEvent(document,'touchstart',function(event){Game.mouseDown=1;});
			AddEvent(document,'touchend',function(event){Game.mouseDown=0;});
			AddEvent(document,'touchend',function(event){Game.Click=1;});
		}
		
		Game.keys=[];
		AddEvent(window,'keyup',function(e){
			if (e.keyCode==27)
			{
				Game.ClosePrompt();
				if (Game.AscendTimer>0) Game.AscendTimer=Game.AscendDuration;
			}//esc closes prompt
			else if (e.keyCode==13) Game.ConfirmPrompt();//enter confirms prompt
			Game.keys[e.keyCode]=0;
		});
		AddEvent(window,'keydown',function(e){
			if (!Game.OnAscend && Game.AscendTimer==0)
			{
				if (e.ctrlKey && e.keyCode==83) {Game.toSave=true;e.preventDefault();}//ctrl-s saves the game
				else if (e.ctrlKey && e.keyCode==79) {Game.ImportSave();e.preventDefault();}//ctrl-o opens the import menu
			}
			if ((e.keyCode==16 || e.keyCode==17) && Game.tooltip.dynamic) Game.tooltip.update();
			Game.keys[e.keyCode]=1;
		});
		
		
		/*=====================================================================================
		CPS RECALCULATOR
		=======================================================================================*/
		
		Game.heavenlyPower=1;//how many CpS percents a single heavenly chip gives
		Game.recalculateGains=1;
		Game.cookiesPsByType={};
		Game.cookiesMultByType={};
		//display bars with http://codepen.io/anon/pen/waGyEJ
		Game.effs={};
		Game.eff=function(name,def){if (typeof Game.effs[name]==='undefined') return (typeof def==='undefined'?1:def); else return Game.effs[name];};
		
		Game.CalculateGains=function()
		{
			Game.cookiesPs=0;
			var mult=1;
			//add up effect bonuses from building minigames
			var effs={};
			for (var i in Game.Objects)
			{
				if (Game.Objects[i].minigameLoaded && Game.Objects[i].minigame.effs)
				{
					var myEffs=Game.Objects[i].minigame.effs;
					for (var ii in myEffs)
					{
						if (effs[ii]) effs[ii]*=myEffs[ii];
						else effs[ii]=myEffs[ii];
					}
				}
			}
			Game.effs=effs;
			
			if (Game.ascensionMode!=1) mult+=parseFloat(Game.prestige)*0.01*Game.heavenlyPower*Game.GetHeavenlyMultiplier();
			
			mult*=Game.eff('cps');
			
			if (Game.Has('Heralds') && Game.ascensionMode!=1) mult*=1+0.01*Game.heralds;
			
			var cookieMult=0;
			for (var i in Game.cookieUpgrades)
			{
				var me=Game.cookieUpgrades[i];
				if (Game.Has(me.name))
				{
					mult*=(1+(typeof(me.power)=='function'?me.power(me):me.power)*0.01);
				}
			}
			mult*=(1+0.01*cookieMult);
			
			if (Game.Has('专业巧克力片')) mult*=1.01;
			if (Game.Has('可可豆设计师')) mult*=1.02;
			if (Game.Has('地下烤箱')) mult*=1.03;
			if (Game.Has('奇异果')) mult*=1.04;
			if (Game.Has('神秘的糖')) mult*=1.05;
			
			if (Game.Has('增加愉快')) mult*=1.15;
			if (Game.Has('改良愉快')) mult*=1.15;
			if (Game.Has('一堆煤')) mult*=1.01;
			if (Game.Has('发痒的毛衣')) mult*=1.01;
			if (Game.Has('圣诞老人的统治')) mult*=1.2;
			
			var buildMult=1;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('asceticism');
				if (godLvl==1) mult*=1.15;
				else if (godLvl==2) mult*=1.1;
				else if (godLvl==3) mult*=1.05;
				
				var godLvl=Game.hasGod('ages');
				if (godLvl==1) mult*=1+0.15*Math.sin((Date.now()/1000/(60*60*3))*Math.PI*2);
				else if (godLvl==2) mult*=1+0.15*Math.sin((Date.now()/1000/(60*60*12))*Math.PI*2);
				else if (godLvl==3) mult*=1+0.15*Math.sin((Date.now()/1000/(60*60*24))*Math.PI*2);
				
				var godLvl=Game.hasGod('decadence');
				if (godLvl==1) buildMult*=0.93;
				else if (godLvl==2) buildMult*=0.95;
				else if (godLvl==3) buildMult*=0.98;
				
				var godLvl=Game.hasGod('industry');
				if (godLvl==1) buildMult*=1.1;
				else if (godLvl==2) buildMult*=1.06;
				else if (godLvl==3) buildMult*=1.03;
				
				var godLvl=Game.hasGod('labor');
				if (godLvl==1) buildMult*=0.97;
				else if (godLvl==2) buildMult*=0.98;
				else if (godLvl==3) buildMult*=0.99;
			}
			
			if (Game.Has('圣诞老人的遗产')) mult*=1+(Game.santaLevel+1)*0.03;
			
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				me.storedCps=(typeof(me.cps)=='function'?me.cps(me):me.cps);
				if (Game.ascensionMode!=1) me.storedCps*=(1+me.level*0.01)*buildMult;
				me.storedTotalCps=me.amount*me.storedCps;
				Game.cookiesPs+=me.storedTotalCps;
				Game.cookiesPsByType[me.name]=me.storedTotalCps;
			}
			
			if (Game.Has('"蛋"')) {Game.cookiesPs+=9;Game.cookiesPsByType['"蛋"']=9;}//"egg"
			
			for (var i in Game.customCps) {mult*=Game.customCps[i]();}
			
			Game.milkProgress=Game.AchievementsOwned/25;
			var milkMult=1;
			if (Game.Has('圣诞老人的牛奶和饼干')) milkMult*=1.05;
			if (Game.hasAura('牛奶的气息')) milkMult*=1.05;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('mother');
				if (godLvl==1) milkMult*=1.1;
				else if (godLvl==2) milkMult*=1.05;
				else if (godLvl==3) milkMult*=1.03;
			}
			milkMult*=Game.eff('milk');
			
			var catMult=1;
			
			if (Game.Has('小猫助手')) mult*=(1+Game.milkProgress*0.1*milkMult);
			if (Game.Has('小猫工人')) mult*=(1+Game.milkProgress*0.125*milkMult);
			if (Game.Has('小猫工程师')) mult*=(1+Game.milkProgress*0.15*milkMult);
			if (Game.Has('小猫监工')) mult*=(1+Game.milkProgress*0.175*milkMult);
			if (Game.Has('小猫经理')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('小猫会计')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('小猫专家')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('小猫能手')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('小猫顾问')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('小猫助理区域经理')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('小猫市场商人')) catMult*=(1+Game.milkProgress*0.15*milkMult);
			if (Game.Has('小猫分析师')) catMult*=(1+Game.milkProgress*0.125*milkMult);
			if (Game.Has('小猫天使')) catMult*=(1+Game.milkProgress*0.1*milkMult);
			
			Game.cookiesMultByType['kittens']=catMult;
			mult*=catMult;
			
			var eggMult=1;
			if (Game.Has('鸡蛋')) eggMult*=1.01;
			if (Game.Has('鸭蛋')) eggMult*=1.01;
			if (Game.Has('火鸡蛋')) eggMult*=1.01;
			if (Game.Has('鹌鹑蛋')) eggMult*=1.01;
			if (Game.Has('知更鸟蛋')) eggMult*=1.01;
			if (Game.Has('鸵鸟蛋')) eggMult*=1.01;
			if (Game.Has('食火鸡蛋')) eggMult*=1.01;
			if (Game.Has('鲑鱼籽')) eggMult*=1.01;
			if (Game.Has('蛙卵')) eggMult*=1.01;
			if (Game.Has('鲨鱼卵')) eggMult*=1.01;
			if (Game.Has('龟蛋')) eggMult*=1.01;
			if (Game.Has('蚂蚁幼虫')) eggMult*=1.01;
			if (Game.Has('世纪蛋'))
			{
				//the boost increases a little every day, with diminishing returns up to +10% on the 100th day
				var day=Math.floor((Date.now()-Game.startDate)/1000/10)*10/60/60/24;
				day=Math.min(day,100);
				eggMult*=1+(1-Math.pow(1-day/100,3))*0.1;
			}
			
			Game.cookiesMultByType['eggs']=eggMult;
			mult*=eggMult;
			
			if (Game.Has('糖烘焙')) mult*=(1+Math.min(100,Game.lumps)*0.01);
			
			if (Game.hasAura('Radiant Appetite')) mult*=2;
			
			if (Game.hasAura('Dragon\'s Fortune'))
			{
				var n=Game.shimmerTypes['golden'].n;
				for (var i=0;i<n;i++){mult*=2.23;}
				//old behavior
				/*var buffs=0;
				for (var i in Game.buffs)
				{buffs++;}
				mult*=1+(0.07)*buffs;*/
			}
			
			var rawCookiesPs=Game.cookiesPs*mult;
			for (var i in Game.CpsAchievements)
			{
				if (rawCookiesPs>=Game.CpsAchievements[i].threshold) Game.Win(Game.CpsAchievements[i].name);
			}
			
			name=Game.bakeryName.toLowerCase();
			if (name=='orteil') mult*=0.99;
			else if (name=='ortiel') mult*=0.98;//or so help me
			
			var sucking=0;
			for (var i in Game.wrinklers)
			{
				if (Game.wrinklers[i].phase==2)
				{
					sucking++;
				}
			}
			var suckRate=1/20;//each wrinkler eats a twentieth of your CpS
			suckRate*=Game.eff('wrinklerEat');
			
			Game.cpsSucked=sucking*suckRate;
			
			
			if (Game.Has('老人契约')) mult*=0.95;
			
			if (Game.Has('黄金开关[关闭]'))
			{
				var goldenSwitchMult=1.5;
				if (Game.Has('残余运气'))
				{
					var upgrades=Game.goldenCookieUpgrades;
					for (var i in upgrades) {if (Game.Has(upgrades[i])) goldenSwitchMult+=0.1;}
				}
				mult*=goldenSwitchMult;
			}
            if (Game.Has('Shimmering veil [off]')) mult*=1.5;
			if (Game.Has('神奇的恶作剧')) mult*=1000;
			if (Game.Has('神秘障碍')) mult*=0;
			
			for (var i in Game.customCpsMult) {mult*=Game.customCpsMult[i]();}
			
			
			//cps without golden cookie effects
			Game.unbuffedCps=Game.cookiesPs*mult;
			
			for (var i in Game.buffs)
			{
				if (typeof Game.buffs[i].multCpS != 'undefined') mult*=Game.buffs[i].multCpS;
			}
			
			Game.globalCpsMult=mult;
			Game.cookiesPs*=Game.globalCpsMult;
			
			//if (Game.hasBuff('被诅咒的手指')) Game.cookiesPs=0;
			
			Game.computedMouseCps=Game.mouseCps();
			
			Game.computeLumpTimes();
			
			Game.recalculateGains=0;
		}
		
		Game.dropRateMult=function()
		{
			var rate=1;
			if (Game.Has('Green yeast digestives')) rate*=1.03;
			rate*=Game.eff('itemDrops');
			if (Game.hasAura('Mind Over Matter')) rate*=1.25;
			if (Game.Has('圣诞老人的无底包')) rate*=1.1;
			return rate;
		}
		/*=====================================================================================
		SHIMMERS (GOLDEN COOKIES & SUCH)
		=======================================================================================*/
		Game.shimmersL=l('shimmers');
		Game.shimmers=[];//all shimmers currently on the screen
		Game.shimmersN=Math.floor(Math.random()*10000);
		Game.shimmer=function(type,obj,noCount)
		{
			this.type=type;
			
			this.l=document.createElement('div');
			this.l.className='shimmer';
			if (!Game.touchEvents) {AddEvent(this.l,'click',function(what){return function(event){what.pop(event);};}(this));}
			else {AddEvent(this.l,'touchend',function(what){return function(event){what.pop(event);};}(this));}//touch events
			
			this.x=0;
			this.y=0;
			this.id=Game.shimmersN;
			
			this.forceObj=obj||0;
			this.noCount=noCount;
			if (!this.noCount) {Game.shimmerTypes[this.type].n++;Game.recalculateGains=1;}
			
			this.init();
			
			Game.shimmersL.appendChild(this.l);
			Game.shimmers.push(this);
			Game.shimmersN++;
		}
		Game.shimmer.prototype.init=function()//executed when the shimmer is created
		{
			Game.shimmerTypes[this.type].initFunc(this);
		}
		Game.shimmer.prototype.update=function()//executed every frame
		{
			Game.shimmerTypes[this.type].updateFunc(this);
		}
		Game.shimmer.prototype.pop=function(event)//executed when the shimmer is popped by the player
		{
			if (event) event.preventDefault();
			Game.loseShimmeringVeil();
			Game.Click=0;
			Game.shimmerTypes[this.type].popFunc(this);
		}
		Game.shimmer.prototype.die=function()//executed after the shimmer disappears (from old age or popping)
		{
			if (Game.shimmerTypes[this.type].spawnsOnTimer && this.spawnLead)
			{
				//if this was the spawn lead for this shimmer type, set the shimmer type's "spawned" to 0 and restart its spawn timer
				var type=Game.shimmerTypes[this.type];
				type.time=0;
				type.spawned=0;
				type.minTime=type.getMinTime(this);
				type.maxTime=type.getMaxTime(this);
			}
			Game.shimmersL.removeChild(this.l);
			if (Game.shimmers.indexOf(this)!=-1) Game.shimmers.splice(Game.shimmers.indexOf(this),1);
			if (!this.noCount) {Game.shimmerTypes[this.type].n=Math.max(0,Game.shimmerTypes[this.type].n-1);Game.recalculateGains=1;}
		}
		
		
		Game.updateShimmers=function()//run shimmer functions, kill overtimed shimmers and spawn new ones
		{
			for (var i in Game.shimmers)
			{
				Game.shimmers[i].update();
			}
			
			//cookie storm!
			if (Game.hasBuff('饼干风暴') && Math.random()<0.5)
			{
				var newShimmer=new Game.shimmer('golden',0,1);
				newShimmer.dur=Math.ceil(Math.random()*4+1);
				newShimmer.life=Math.ceil(Game.fps*newShimmer.dur);
				newShimmer.force='cookie storm drop';
				newShimmer.sizeMult=Math.random()*0.75+0.25;
			}
			
			//spawn shimmers
			for (var i in Game.shimmerTypes)
			{
				var me=Game.shimmerTypes[i];
				if (me.spawnsOnTimer && me.spawnConditions())//only run on shimmer types that work on a timer
				{
					if (!me.spawned)//no shimmer spawned for this type? check the timer and try to spawn one
					{
						me.time++;
						if (Math.random()<Math.pow(Math.max(0,(me.time-me.minTime)/(me.maxTime-me.minTime)),5))
						{
							var newShimmer=new Game.shimmer(i);
							newShimmer.spawnLead=1;
							if (Game.Has('翻倍运气的精华') && Math.random()<0.01) var newShimmer=new Game.shimmer(i);
							me.spawned=1;
						}
					}
				}
			}
		}
		Game.killShimmers=function()//stop and delete all shimmers (used on resetting etc)
		{
			for (var i in Game.shimmers)
			{
				Game.shimmers[i].die();
			}
			for (var i in Game.shimmerTypes)
			{
				var me=Game.shimmerTypes[i];
				if (me.reset) me.reset();
				me.n=0;
				if (me.spawnsOnTimer)
				{
					me.time=0;
					me.spawned=0;
					me.minTime=me.getMinTime(me);
					me.maxTime=me.getMaxTime(me);
				}
			}
		}
		
		Game.shimmerTypes={
			//in these, "me" refers to the shimmer itself, and "this" to the shimmer's type object
			'golden':{
				reset:function()
				{
					this.chain=0;
					this.totalFromChain=0;
					this.last='';
				},
				initFunc:function(me)
				{
					if (!this.spawned && Game.chimeType==1 && Game.ascensionMode!=1) PlaySound('snd/chime.mp3');
					
					//set image
					var bgPic='img/goldCookie.png';
					var picX=0;var picY=0;
					
					
					if ((!me.forceObj || !me.forceObj.noWrath) && ((me.forceObj && me.forceObj.wrath) || (Game.elderWrath==1 && Math.random()<1/3) || (Game.elderWrath==2 && Math.random()<2/3) || (Game.elderWrath==3) || (Game.hasGod && Game.hasGod('scorn'))))
					{
						me.wrath=1;
						if (Game.season=='halloween') bgPic='img/spookyCookie.png';
						else bgPic='img/wrathCookie.png';
					}
					else
					{
						me.wrath=0;
					}
					
					if (Game.season=='valentines')
					{
						bgPic='img/hearts.png';
						picX=Math.floor(Math.random()*8);
					}
					else if (Game.season=='fools')
					{
						bgPic='img/contract.png';
						if (me.wrath) bgPic='img/wrathContract.png';
					}
					else if (Game.season=='easter')
					{
						bgPic='img/bunnies.png';
						picX=Math.floor(Math.random()*4);
						picY=0;
						if (me.wrath) picY=1;
					}
					
					me.x=Math.floor(Math.random()*Math.max(0,(Game.bounds.right-300)-Game.bounds.left-128)+Game.bounds.left+64)-64;
					me.y=Math.floor(Math.random()*Math.max(0,Game.bounds.bottom-Game.bounds.top-128)+Game.bounds.top+64)-64;
					me.l.style.left=me.x+'px';
					me.l.style.top=me.y+'px';
					me.l.style.width='96px';
					me.l.style.height='96px';
					me.l.style.backgroundImage='url('+bgPic+')';
					me.l.style.backgroundPosition=(-picX*96)+'px '+(-picY*96)+'px';
					me.l.style.opacity='0';
					me.l.style.display='block';
					
					me.life=1;//the cookie's current progression through its lifespan (in frames)
					me.dur=13;//duration; the cookie's lifespan in seconds before it despawns
					
					var dur=13;
					if (Game.Has('幸运日')) dur*=2;
					if (Game.Has('意外的惊喜')) dur*=2;
					if (Game.Has('决定性的命运')) dur*=1.05;
					if (Game.Has('幸运数字')) dur*=1.01;
					if (Game.Has('幸运数')) dur*=1.01;
					if (Game.Has('幸运的支付')) dur*=1.01;
					if (!me.wrath) dur*=Game.eff('goldenCookieDur');
					else dur*=Game.eff('wrathCookieDur');
					dur*=Math.pow(0.95,Game.shimmerTypes['golden'].n-1);//5% shorter for every other golden cookie on the screen
					if (this.chain>0) dur=Math.max(2,10/this.chain);//this is hilarious
					me.dur=dur;
					me.life=Math.ceil(Game.fps*me.dur);
					me.force='';
					me.sizeMult=1;
				},
				updateFunc:function(me)
				{
					var curve=1-Math.pow((me.life/(Game.fps*me.dur))*2-1,4);
					me.l.style.opacity=curve;
					//this line makes each golden cookie pulse in a unique way
					if (Game.prefs.fancy) me.l.style.transform='rotate('+(Math.sin(me.id*0.69)*24+Math.sin(Game.T*(0.35+Math.sin(me.id*0.97)*0.15)+me.id/*+Math.sin(Game.T*0.07)*2+2*/)*(3+Math.sin(me.id*0.36)*2))+'deg) scale('+(me.sizeMult*(1+Math.sin(me.id*0.53)*0.2)*curve*(1+(0.06+Math.sin(me.id*0.41)*0.05)*(Math.sin(Game.T*(0.25+Math.sin(me.id*0.73)*0.15)+me.id))))+')';
					me.life--;
					if (me.life<=0) {this.missFunc(me);me.die();}
				},
				popFunc:function(me)
				{
					//get achievs and stats
					if (me.spawnLead)
					{
						Game.goldenClicks++;
						Game.goldenClicksLocal++;
						
						if (Game.goldenClicks>=1) Game.Win('黄金饼干');
						if (Game.goldenClicks>=7) Game.Win('幸运饼干');
						if (Game.goldenClicks>=27) Game.Win('好运气');
						if (Game.goldenClicks>=77) Game.Win('幸运');
						if (Game.goldenClicks>=777) Game.Win('妖精');
						if (Game.goldenClicks>=7777) Game.Win('黑猫的爪子');
						
						if (Game.goldenClicks>=7) Game.Unlock('幸运日');
						if (Game.goldenClicks>=27) Game.Unlock('意外的惊喜');
						if (Game.goldenClicks>=77) Game.Unlock('走运');
						
						if ((me.life/Game.fps)>(me.dur-1)) Game.Win('早起的鸟儿');
						if (me.life<Game.fps) Game.Win('逝去的运气');
					}
					
					if (Game.forceUnslotGod)
					{
						if (Game.forceUnslotGod('asceticism')) Game.useSwap(1000000);
					}
					
					//select an effect
					var list=[];
					if (me.wrath>0) list.push('clot','multiply cookies','ruin cookies');
					else list.push('frenzy','multiply cookies');
					if (me.wrath>0 && Game.hasGod && Game.hasGod('scorn')) list.push('clot','ruin cookies','clot','ruin cookies');
					if (me.wrath>0 && Math.random()<0.3) list.push('blood frenzy','chain cookie','cookie storm');
					else if (Math.random()<0.03 && Game.cookiesEarned>=100000) list.push('chain cookie','cookie storm');
					if (Math.random()<0.05 && Game.season=='fools') list.push('everything must go');
					if (Math.random()<0.1 && (Math.random()<0.05 || !Game.hasBuff('龙之飞舞'))) list.push('click frenzy');
					if (me.wrath && Math.random()<0.1) list.push('cursed finger');
					
					if (Game.BuildingsOwned>=10 && Math.random()<0.25) list.push('building special');
					
					if (Game.canLumps() && Math.random()<0.0005) list.push('free sugar lump');
					
					if ((me.wrath==0 && Math.random()<0.15) || Math.random()<0.05)
					{
						if (Game.hasAura('Reaper of Fields')) list.push('dragon harvest');
						if (Game.hasAura('龙之飞舞')) list.push('龙之飞舞');
					}
					
					if (this.last!='' && Math.random()<0.8 && list.indexOf(this.last)!=-1) list.splice(list.indexOf(this.last),1);//80% chance to force a different one
					if (Math.random()<0.0001) list.push('blab');
					var choice=choose(list);
					
					if (this.chain>0) choice='chain cookie';
					if (me.force!='') {this.chain=0;choice=me.force;me.force='';}
					if (choice!='chain cookie') this.chain=0;
					
					this.last=choice;
					
					//create buff for effect
					//buff duration multiplier
					var effectDurMod=1;
					if (Game.Has('走运')) effectDurMod*=2;
					if (Game.Has('永恒的财富')) effectDurMod*=1.1;
					if (Game.Has('幸运数字')) effectDurMod*=1.01;
					if (Game.Has('幸运数')) effectDurMod*=1.01;
					if (Game.Has('Green yeast digestives')) effectDurMod*=1.01;
					if (Game.Has('幸运的支付')) effectDurMod*=1.01;
					if (Game.hasAura('Epoch Manipulator')) effectDurMod*=1.05;
					if (!me.wrath) effectDurMod*=Game.eff('goldenCookieEffDur');
					else effectDurMod*=Game.eff('wrathCookieEffDur');
					
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('decadence');
						if (godLvl==1) effectDurMod*=1.07;
						else if (godLvl==2) effectDurMod*=1.05;
						else if (godLvl==3) effectDurMod*=1.02;
					}
					
					//effect multiplier (from lucky etc)
					var mult=1;
					if (me.wrath>0 && Game.hasAura('Unholy Dominion')) mult*=1.1;
					else if (me.wrath==0 && Game.hasAura('Ancestral Metamorphosis')) mult*=1.1;
					if (Game.Has('Green yeast digestives')) mult*=1.01;
					if (!me.wrath) mult*=Game.eff('goldenCookieGain');
					else mult*=Game.eff('wrathCookieGain');
					
					var popup='';
					var buff=0;
					
					if (choice=='building special')
					{
						var time=Math.ceil(30*effectDurMod);
						var list=[];
						for (var i in Game.Objects)
						{
							if (Game.Objects[i].amount>=10) list.push(Game.Objects[i].id);
						}
						if (list.length==0) {choice='frenzy';}//default to frenzy if no proper building
						else
						{
							var obj=choose(list);
							var pow=Game.ObjectsById[obj].amount/10+1;
							if (me.wrath && Math.random()<0.3)
							{
								buff=Game.gainBuff('building debuff',time,pow,obj);
							}
							else
							{
								buff=Game.gainBuff('building buff',time,pow,obj);
							}
						}
					}
					
					if (choice=='free sugar lump')
					{
						Game.gainLumps(1);
						popup='Sweet!<div style="font-size:65%;">Found 1 sugar lump!</div>';
					}
					else if (choice=='frenzy')
					{
						buff=Game.gainBuff('frenzy',Math.ceil(77*effectDurMod),7);
					}
					else if (choice=='dragon harvest')
					{
						buff=Game.gainBuff('dragon harvest',Math.ceil(60*effectDurMod),15);
					}
					else if (choice=='everything must go')
					{
						buff=Game.gainBuff('everything must go',Math.ceil(8*effectDurMod),5);
					}
					else if (choice=='multiply cookies')
					{
						var moni=mult*Math.min(Game.cookies*0.15,Game.cookiesPs*60*15)+13;//add 15% to cookies owned (+13), or 15 minutes of cookie production - whichever is lowest
						Game.Earn(moni);
						popup='幸运!<div style="font-size:65%;">+'+Beautify(moni)+' 饼干!</div>';
					}
					else if (choice=='ruin cookies')
					{
						var moni=Math.min(Game.cookies*0.05,Game.cookiesPs*60*10)+13;//lose 5% of cookies owned (-13), or 10 minutes of cookie production - whichever is lowest
						moni=Math.min(Game.cookies,moni);
						Game.Spend(moni);
						popup='毁了!<div style="font-size:65%;">失去 '+Beautify(moni)+' 饼干!</div>';
					}
					else if (choice=='blood frenzy')
					{
						buff=Game.gainBuff('blood frenzy',Math.ceil(6*effectDurMod),666);
					}
					else if (choice=='clot')
					{
						buff=Game.gainBuff('clot',Math.ceil(66*effectDurMod),0.5);
					}
					else if (choice=='cursed finger')
					{
						buff=Game.gainBuff('cursed finger',Math.ceil(10*effectDurMod),Game.cookiesPs*Math.ceil(10*effectDurMod));
					}
					else if (choice=='click frenzy')
					{
						buff=Game.gainBuff('click frenzy',Math.ceil(13*effectDurMod),777);
					}
					else if (choice=='龙之飞舞')
					{
						buff=Game.gainBuff('龙之飞舞',Math.ceil(10*effectDurMod),1111);
						if (Math.random()<0.8) Game.killBuff('点击狂潮');
					}
					else if (choice=='chain cookie')
					{
						//fix by Icehawk78
						if (this.chain==0) this.totalFromChain=0;
						this.chain++;
						var digit=me.wrath?6:7;
						if (this.chain==1) this.chain+=Math.max(0,Math.ceil(Math.log(Game.cookies)/Math.LN10)-10);
						
						var maxPayout=Math.min(Game.cookiesPs*60*60*6,Game.cookies*0.5)*mult;
						var moni=Math.max(digit,Math.min(Math.floor(1/9*Math.pow(10,this.chain)*digit*mult),maxPayout));
						var nextMoni=Math.max(digit,Math.min(Math.floor(1/9*Math.pow(10,this.chain+1)*digit*mult),maxPayout));
						this.totalFromChain+=moni;
						var moniStr=Beautify(moni);

						//break the chain if we're above 5 digits AND it's more than 50% of our bank, it grants more than 6 hours of our CpS, or just a 1% chance each digit (update : removed digit limit)
						if (Math.random()<0.01 || nextMoni>=maxPayout)
						{
							this.chain=0;
							popup='饼干链<div style="font-size:65%;">+'+moniStr+' 饼干!<br>饼干链完成. 你制作了 '+Beautify(this.totalFromChain)+' 饼干.</div>';
						}
						else
						{
							popup='饼干链<div style="font-size:65%;">+'+moniStr+' 饼干!</div>';//
						}
						Game.Earn(moni);
					}
					else if (choice=='cookie storm')
					{
						buff=Game.gainBuff('cookie storm',Math.ceil(7*effectDurMod),7);
					}
					else if (choice=='cookie storm drop')
					{
						var moni=Math.max(mult*(Game.cookiesPs*60*Math.floor(Math.random()*7+1)),Math.floor(Math.random()*7+1));//either 1-7 cookies or 1-7 minutes of cookie production, whichever is highest
						Game.Earn(moni);
						popup='<div style="font-size:75%;">+'+Beautify(moni)+' 饼干!</div>';
					}
					else if (choice=='blab')//sorry (it's really rare)
					{
						var str=choose([
						'Cookie crumbliness x3 for 60 seconds!',
						'Chocolatiness x7 for 77 seconds!',
						'Dough elasticity halved for 66 seconds!',
						'Golden cookie shininess doubled for 3 seconds!',
						'World economy halved for 30 seconds!',
						'Grandma kisses 23% stingier for 45 seconds!',
						'Thanks for clicking!',
						'Fooled you! This one was just a test.',
						'Golden cookies clicked +1!',
						'Your click has been registered. Thank you for your cooperation.',
						'Thanks! That hit the spot!',
						'Thank you. A team has been dispatched.',
						'They know.',
						'Oops. This was just a chocolate cookie with shiny aluminium foil.'
						]);
						popup=str;
					}
					
					if (popup=='' && buff && buff.name && buff.desc) popup=buff.name+'<div style="font-size:65%;">'+buff.desc+'</div>';
					if (popup!='') Game.Popup(popup,me.x+me.l.offsetWidth/2,me.y);
					
					Game.DropEgg(0.9);
					
					//sparkle and kill the shimmer
					Game.SparkleAt(me.x+48,me.y+48);
					if (choice=='cookie storm drop')
					{
						if (Game.prefs.cookiesound) PlaySound('snd/clickb'+Math.floor(Math.random()*7+1)+'.mp3',0.75);
						else PlaySound('snd/click'+Math.floor(Math.random()*7+1)+'.mp3',0.75);
					}
					else PlaySound('snd/shimmerClick.mp3');
					me.die();
				},
				missFunc:function(me)
				{
					if (this.chain>0 && this.totalFromChain>0)
					{
						Game.Popup('饼干链坏掉了.<div style="font-size:65%;">你制作了 '+Beautify(this.totalFromChain)+' 饼干.</div>',me.x+me.l.offsetWidth/2,me.y);
						this.chain=0;this.totalFromChain=0;
					}
					if (me.spawnLead) Game.missedGoldenClicks++;
				},
				spawnsOnTimer:true,
				spawnConditions:function()
				{
					if (!Game.Has('黄金开关[关闭]')) return true; else return false;
				},
				spawned:0,
				time:0,
				minTime:0,
				maxTime:0,
				getTimeMod:function(me,m)
				{
					if (Game.Has('幸运日')) m/=2;
					if (Game.Has('意外的惊喜')) m/=2;
					if (Game.Has('金鹅蛋')) m*=0.95;
					if (Game.Has('天上的运气')) m*=0.95;
					if (Game.Has('Green yeast digestives')) m*=0.99;
					if (Game.hasAura('奥术光环')) m*=0.95;
					if (Game.hasBuff('糖的祝福')) m*=0.9;
					if (Game.season=='easter' && Game.Has('星人')) m*=0.98;
					else if (Game.season=='halloween' && Game.Has('星际恐怖')) m*=0.98;
					else if (Game.season=='valentines' && Game.Has('星际之恋')) m*=0.98;
					else if (Game.season=='fools' && Game.Has('星际贸易')) m*=0.95;
					if (!me.wrath) m*=1/Game.eff('goldenCookieFreq');
					else m*=1/Game.eff('wrathCookieFreq');
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('industry');
						if (godLvl==1) m*=1.1;
						else if (godLvl==2) m*=1.06;
						else if (godLvl==3) m*=1.03;
						var godLvl=Game.hasGod('mother');
						if (godLvl==1) m*=1.15;
						else if (godLvl==2) m*=1.1;
						else if (godLvl==3) m*=1.05;
						
						if (Game.season!='')
						{
							var godLvl=Game.hasGod('seasons');
							if (Game.season!='fools')
							{
								if (godLvl==1) m*=0.97;
								else if (godLvl==2) m*=0.98;
								else if (godLvl==3) m*=0.99;
							}
							else
							{
								if (godLvl==1) m*=0.955;
								else if (godLvl==2) m*=0.97;
								else if (godLvl==3) m*=0.985;
							}
						}
					}
					if (this.chain>0) m=0.05;
					if (Game.Has('Gold hoard')) m=0.01;
					return Math.ceil(Game.fps*60*m);
				},
				getMinTime:function(me)
				{
					var m=5;
					return this.getTimeMod(me,m);
				},
				getMaxTime:function(me)
				{
					var m=15;
					return this.getTimeMod(me,m);
				},
				last:'',
			},
			'reindeer':{
				reset:function()
				{
				},
				initFunc:function(me)
				{
					if (!this.spawned && Game.chimeType==1 && Game.ascensionMode!=1) PlaySound('snd/jingle.mp3');
					
					me.x=-128;
					me.y=Math.floor(Math.random()*Math.max(0,Game.bounds.bottom-Game.bounds.top-256)+Game.bounds.top+128)-128;
					//me.l.style.left=me.x+'px';
					//me.l.style.top=me.y+'px';
					me.l.style.width='167px';
					me.l.style.height='212px';
					me.l.style.backgroundImage='url(img/frostedReindeer.png)';
					me.l.style.opacity='0';
					//me.l.style.transform='rotate('+(Math.random()*60-30)+'deg) scale('+(Math.random()*1+0.25)+')';
					me.l.style.display='block';
					
					me.life=1;//the reindeer's current progression through its lifespan (in frames)
					me.dur=4;//duration; the cookie's lifespan in seconds before it despawns
					
					var dur=4;
					if (Game.Has('加重雪橇')) dur*=2;
					dur*=Game.eff('reindeerDur');
					me.dur=dur;
					me.life=Math.ceil(Game.fps*me.dur);
					me.sizeMult=1;
				},
				updateFunc:function(me)
				{
					var curve=1-Math.pow((me.life/(Game.fps*me.dur))*2-1,12);
					me.l.style.opacity=curve;
					me.l.style.transform='translate('+(me.x+(Game.bounds.right-Game.bounds.left)*(1-me.life/(Game.fps*me.dur)))+'px,'+(me.y-Math.abs(Math.sin(me.life*0.1))*128)+'px) rotate('+(Math.sin(me.life*0.2+0.3)*10)+'deg) scale('+(me.sizeMult*(1+Math.sin(me.id*0.53)*0.1))+')';
					me.life--;
					if (me.life<=0) {this.missFunc(me);me.die();}
				},
				popFunc:function(me)
				{
					//get achievs and stats
					if (me.spawnLead)
					{
						Game.reindeerClicked++;
					}
					
					var val=Game.cookiesPs*60;
					if (Game.hasBuff('老者狂怒')) val*=0.5;//very sorry
					if (Game.hasBuff('疯狂')) val*=0.75;//I sincerely apologize
					var moni=Math.max(25,val);//1 minute of cookie production, or 25 cookies - whichever is highest
					if (Game.Has('何蚝味糖霜')) moni*=2;
					moni*=Game.eff('reindeerGain');
					Game.Earn(moni);
					if (Game.hasBuff('老者狂怒')) Game.Win('麋鹿');
					
					var cookie='';
					var failRate=0.8;
					if (Game.HasAchiev('让它下雪')) failRate=0.6;
					failRate*=1/Game.dropRateMult();
					if (Game.Has('星雪')) failRate*=0.95;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('seasons');
						if (godLvl==1) failRate*=0.9;
						else if (godLvl==2) failRate*=0.95;
						else if (godLvl==3) failRate*=0.97;
					}
					if (Math.random()>failRate)//christmas cookie drops
					{
						cookie=choose(['Christmas tree biscuits','Snowflake biscuits','Snowman biscuits','Holly biscuits','Candy cane biscuits','Bell biscuits','Present biscuits']);
						if (!Game.HasUnlocked(cookie) && !Game.Has(cookie))
						{
							Game.Unlock(cookie);
						}
						else cookie='';
					}
					
					var popup='';
					
					if (Game.prefs.popups) Game.Popup('你发现了 '+choose(['精力充沛的人','舞者','舞蹈者','唠叨的女人','彗星','丘比特','唐纳','闪电','鲁道夫'])+'!<br>驯鹿给了你 '+Beautify(moni)+' 饼干.'+(cookie==''?'':'<br>You are also rewarded with '+cookie+'!'));
					else Game.Notify('你发现了 '+choose(['精力充沛的人','舞者','舞蹈者','唠叨的女人','彗星','丘比特','唐纳','闪电','鲁道夫'])+'!','驯鹿给你 '+Beautify(moni)+' 饼干.'+(cookie==''?'':'<br>您还被奖励 '+cookie+'!'),[12,9],6);
					popup='<div style="font-size:80%;">+'+Beautify(moni)+' 饼干!</div>';
					
					if (popup!='') Game.Popup(popup,Game.mouseX,Game.mouseY);
					
					//sparkle and kill the shimmer
					Game.SparkleAt(Game.mouseX,Game.mouseY);
					PlaySound('snd/jingleClick.mp3');
					me.die();
				},
				missFunc:function(me)
				{
				},
				spawnsOnTimer:true,
				spawnConditions:function()
				{
					if (Game.season=='christmas') return true; else return false;
				},
				spawned:0,
				time:0,
				minTime:0,
				maxTime:0,
				getTimeMod:function(me,m)
				{
					if (Game.Has('驯鹿烘烤场')) m/=2;
					if (Game.Has('星雪')) m*=0.95;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('seasons');
						if (godLvl==1) m*=0.9;
						else if (godLvl==2) m*=0.95;
						else if (godLvl==3) m*=0.97;
					}
					m*=1/Game.eff('reindeerFreq');
					if (Game.Has('驯鹿的季节')) m=0.01;
					return Math.ceil(Game.fps*60*m);
				},
				getMinTime:function(me)
				{
					var m=3;
					return this.getTimeMod(me,m);
				},
				getMaxTime:function(me)
				{
					var m=6;
					return this.getTimeMod(me,m);
				},
			}
		};
		
		Game.goldenCookieChoices=[
			"疯狂","frenzy",
			"Lucky","multiply cookies",
			"Ruin","ruin cookies",
			"老者狂怒","blood frenzy",
			"血栓","clot",
			"点击狂潮","click frenzy",
			"被诅咒的手指","cursed finger",
			"Cookie chain","chain cookie",
			"饼干风暴","cookie storm",
			"Building special","building special",
			"龙之收获","dragon harvest",
			"龙之飞舞","dragonflight",
			"Sweet","free sugar lump",
			"Blab","blab"
		];
		Game.goldenCookieBuildingBuffs={
			'Cursor':['High-five','Slap to the face'],
			'Grandma':['Congregation','Senility'],
			'Farm':['Luxuriant harvest','Locusts'],
			'Mine':['Ore vein','Cave-in'],
			'Factory':['Oiled-up','Jammed machinery'],
			'Bank':['Juicy profits','Recession'],
			'Temple':['Fervent adoration','Crisis of faith'],
			'Wizard tower':['Manabloom','Magivores'],
			'Shipment':['Delicious lifeforms','Black holes'],
			'Alchemy lab':['Breakthrough','Lab disaster'],
			'Portal':['Righteous cataclysm','Dimensional calamity'],
			'Time machine':['Golden ages','Time jam'],
			'Antimatter condenser':['Extra cycles','Predictable tragedy'],
			'Prism':['Solar flare','Eclipse'],
			'Chancemaker':['Winning streak','Dry spell'],
			'Fractal engine':['Macrocosm','Microcosm'],
		};
		
		/*=====================================================================================
		PARTICLES
		=======================================================================================*/
		//generic particles (falling cookies etc)
		//only displayed on left section
		Game.particles=[];
		for (var i=0;i<50;i++)
		{
			Game.particles[i]={x:0,y:0,xd:0,yd:0,w:64,h:64,z:0,size:1,dur:2,life:-1,r:0,pic:'smallCookies.png',picId:0};
		}
		
		Game.particlesUpdate=function()
		{
			for (var i in Game.particles)
			{
				var me=Game.particles[i];
				if (me.life!=-1)
				{
					if (!me.text) me.yd+=0.2+Math.random()*0.1;
					me.x+=me.xd;
					me.y+=me.yd;
					//me.y+=me.life*0.25+Math.random()*0.25;
					me.life++;
					if (me.life>=Game.fps*me.dur)
					{
						me.life=-1;
					}
				}
			}
		}
		Game.particleAdd=function(x,y,xd,yd,size,dur,z,pic,text)
		{
			//Game.particleAdd(pos X,pos Y,speed X,speed Y,size (multiplier),duration (seconds),layer,picture,text);
			//pick the first free (or the oldest) particle to replace it
			if (1 || Game.prefs.particles)
			{
				var highest=0;
				var highestI=0;
				for (var i in Game.particles)
				{
					if (Game.particles[i].life==-1) {highestI=i;break;}
					if (Game.particles[i].life>highest)
					{
						highest=Game.particles[i].life;
						highestI=i;
					}
				}
				var auto=0;
				if (x) auto=1;
				var i=highestI;
				var x=x||-64;
				if (Game.LeftBackground && !auto) x=Math.floor(Math.random()*Game.LeftBackground.canvas.width);
				var y=y||-64;
				var me=Game.particles[i];
				me.life=0;
				me.x=x;
				me.y=y;
				me.xd=xd||0;
				me.yd=yd||0;
				me.size=size||1;
				me.z=z||0;
				me.dur=dur||2;
				me.r=Math.floor(Math.random()*360);
				me.picId=Math.floor(Math.random()*10000);
				if (!pic)
				{
					if (Game.season=='fools') pic='smallDollars.png';
					else
					{
						var cookies=[[10,0]];
						for (var i in Game.Upgrades)
						{
							var cookie=Game.Upgrades[i];
							if (cookie.bought>0 && cookie.pool=='cookie') cookies.push(cookie.icon);
						}
						me.picPos=choose(cookies);
						if (Game.bakeryName.toLowerCase()=='ortiel' || Math.random()<1/10000) me.picPos=[17,5];
						pic='icons.png';
					}
				}
				me.pic=pic||'smallCookies.png';
				me.text=text||0;
				return me;
			}
			return {};
		}
		Game.particlesDraw=function(z)
		{
			var ctx=Game.LeftBackground;
			ctx.fillStyle='#fff';
			ctx.font='20px Merriweather';
			ctx.textAlign='center';
			
			for (var i in Game.particles)
			{
				var me=Game.particles[i];
				if (me.z==z)
				{
					if (me.life!=-1)
					{
						var opacity=1-(me.life/(Game.fps*me.dur));
						ctx.globalAlpha=opacity;
						if (me.text)
						{
							ctx.fillText(me.text,me.x,me.y);
						}
						else
						{
							ctx.save();
							ctx.translate(me.x,me.y);
							ctx.rotate((me.r/360)*Math.PI*2);
							var w=64;
							var h=64;
							if (me.pic=='icons.png')
							{
								w=48;
								h=48;
								ctx.drawImage(Pic(me.pic),me.picPos[0]*w,me.picPos[1]*h,w,h,-w/2*me.size,-h/2*me.size,w*me.size,h*me.size);
							}
							else
							{
								if (me.pic=='wrinklerBits.png' || me.pic=='shinyWrinklerBits.png') {w=100;h=200;}
								ctx.drawImage(Pic(me.pic),(me.picId%8)*w,0,w,h,-w/2*me.size,-h/2*me.size,w*me.size,h*me.size);
							}
							ctx.restore();
						}
					}
				}
			}
		}
		
		//text particles (popups etc)
		Game.textParticles=[];
		Game.textParticlesY=0;
		var str='';
		for (var i=0;i<20;i++)
		{
			Game.textParticles[i]={x:0,y:0,life:-1,text:''};
			str+='<div id="particle'+i+'" class="particle title"></div>';
		}
		l('particles').innerHTML=str;
		Game.textParticlesUpdate=function()
		{
			for (var i in Game.textParticles)
			{
				var me=Game.textParticles[i];
				if (me.life!=-1)
				{
					me.life++;
					if (me.life>=Game.fps*4)
					{
						var el=me.l;
						me.life=-1;
						el.style.opacity=0;
						el.style.display='none';
					}
				}
			}
		}
		Game.textParticlesAdd=function(text,el,posX,posY)
		{
			//pick the first free (or the oldest) particle to replace it
			var highest=0;
			var highestI=0;
			for (var i in Game.textParticles)
			{
				if (Game.textParticles[i].life==-1) {highestI=i;break;}
				if (Game.textParticles[i].life>highest)
				{
					highest=Game.textParticles[i].life;
					highestI=i;
				}
			}
			var i=highestI;
			var noStack=0;
			if (typeof posX!=='undefined' && typeof posY!=='undefined')
			{
				x=posX;
				y=posY;
				noStack=1;
			}
			else
			{
				var x=(Math.random()-0.5)*40;
				var y=0;//+(Math.random()-0.5)*40;
				if (!el)
				{
					var rect=Game.bounds;
					var x=Math.floor((rect.left+rect.right)/2);
					var y=Math.floor((rect.bottom))-(Game.mobile*64);
					x+=(Math.random()-0.5)*40;
					y+=0;//(Math.random()-0.5)*40;
				}
			}
			if (!noStack) y-=Game.textParticlesY;
			
			x=Math.max(Game.bounds.left+200,x);
			x=Math.min(Game.bounds.right-200,x);
			y=Math.max(Game.bounds.top+32,y);
			
			var me=Game.textParticles[i];
			if (!me.l) me.l=l('particle'+i);
			me.life=0;
			me.x=x;
			me.y=y;
			me.text=text;
			me.l.innerHTML=text;
			me.l.style.left=Math.floor(Game.textParticles[i].x-200)+'px';
			me.l.style.bottom=Math.floor(-Game.textParticles[i].y)+'px';
			for (var ii in Game.textParticles)
			{if (ii!=i) (Game.textParticles[ii].l||l('particle'+ii)).style.zIndex=100000000;}
			me.l.style.zIndex=100000001;
			me.l.style.display='block';
			me.l.className='particle title';
			void me.l.offsetWidth;
			me.l.className='particle title risingUpLinger';
			if (!noStack) Game.textParticlesY+=60;
		}
		Game.popups=1;
		Game.Popup=function(text,x,y)
		{
			if (Game.popups) Game.textParticlesAdd(text,0,x,y);
		}
		
		//display sparkles at a set position
		Game.sparkles=l('sparkles');
		Game.sparklesT=0;
		Game.sparklesFrames=16;
		Game.SparkleAt=function(x,y)
		{
			if (Game.blendModesOn)
			{
				Game.sparklesT=Game.sparklesFrames+1;
				Game.sparkles.style.backgroundPosition='0px 0px';
				Game.sparkles.style.left=Math.floor(x-64)+'px';
				Game.sparkles.style.top=Math.floor(y-64)+'px';
				Game.sparkles.style.display='block';
			}
		}
		Game.SparkleOn=function(el)
		{
			var rect=el.getBoundingClientRect();
			Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24);
		}
		
		/*=====================================================================================
		NOTIFICATIONS
		=======================================================================================*/
		//maybe do all this mess with proper DOM instead of rewriting the innerHTML
		Game.Notes=[];
		Game.NotesById=[];
		Game.noteId=0;
		Game.noteL=l('notes');
		Game.Note=function(title,desc,pic,quick)
		{
			this.title=title;
			this.desc=desc||'';
			this.pic=pic||'';
			this.id=Game.noteId;
			this.date=Date.now();
			this.quick=quick||0;
			this.life=(this.quick||1)*Game.fps;
			this.l=0;
			this.height=0;
			Game.noteId++;
			Game.NotesById[this.id]=this;
			Game.Notes.unshift(this);
			if (Game.Notes.length>50) Game.Notes.pop();
			//Game.Notes.push(this);
			//if (Game.Notes.length>50) Game.Notes.shift();
			Game.UpdateNotes();
		}
		Game.CloseNote=function(id)
		{
			var me=Game.NotesById[id];
			Game.Notes.splice(Game.Notes.indexOf(me),1);
			//Game.NotesById.splice(Game.NotesById.indexOf(me),1);
			Game.NotesById[id]=null;
			Game.UpdateNotes();
		}
		Game.CloseNotes=function()
		{
			Game.Notes=[];
			Game.NotesById=[];
			Game.UpdateNotes();
		}
		Game.UpdateNotes=function()
		{
			var str='';
			var remaining=Game.Notes.length;
			for (var i in Game.Notes)
			{
				if (i<5)
				{
					var me=Game.Notes[i];
					var pic='';
					if (me.pic!='') pic='<div class="icon" style="'+(me.pic[2]?'background-image:url('+me.pic[2]+');':'')+'background-position:'+(-me.pic[0]*48)+'px '+(-me.pic[1]*48)+'px;"></div>';
					str='<div id="note-'+me.id+'" class="framed note '+(me.pic!=''?'haspic':'nopic')+' '+(me.desc!=''?'hasdesc':'nodesc')+'"><div class="close" onclick="PlaySound(\'snd/tick.mp3\');Game.CloseNote('+me.id+');">x</div>'+pic+'<div class="text"><h3>'+me.title+'</h3>'+(me.desc!=''?'<div class="line"></div><h5>'+me.desc+'</h5>':'')+'</div></div>'+str;
					remaining--;
				}
			}
			if (remaining>0) str='<div class="remaining">+'+remaining+' 更多通知'+(remaining==1?'':'s')+'.</div>'+str;
			if (Game.Notes.length>1)
			{
				str+='<div class="framed close sidenote" onclick="PlaySound(\'snd/tick.mp3\');Game.CloseNotes();">x</div>';
			}
			Game.noteL.innerHTML=str;
			for (var i in Game.Notes)
			{
				me.l=0;
				if (i<5)
				{
					var me=Game.Notes[i];
					me.l=l('note-'+me.id);
				}
			}
		}
		Game.NotesLogic=function()
		{
			for (var i in Game.Notes)
			{
				if (Game.Notes[i].quick>0)
				{
					var me=Game.Notes[i];
					me.life--;
					if (me.life<=0) Game.CloseNote(me.id);
				}
			}
		}
		Game.NotesDraw=function()
		{
			for (var i in Game.Notes)
			{
				if (Game.Notes[i].quick>0)
				{
					var me=Game.Notes[i];
					if (me.l)
					{
						if (me.life<10)
						{
							me.l.style.opacity=(me.life/10);
						}
					}
				}
			}
		}
		Game.Notify=function(title,desc,pic,quick,noLog)
		{
			if (Game.prefs.notifs)
			{
				quick=Math.min(6,quick);
				if (!quick) quick=6;
			}
			desc=replaceAll('==CLOSETHIS()==','Game.CloseNote('+Game.noteId+');',desc);
			if (Game.popups) new Game.Note(title,desc,pic,quick);
			if (!noLog) Game.AddToLog('<b>'+title+'</b> | '+desc);
		}
		
		
		/*=====================================================================================
		PROMPT
		=======================================================================================*/
		Game.darkenL=l('darken');
		AddEvent(Game.darkenL,'click',function(){Game.Click=0;Game.ClosePrompt();});
		Game.promptL=l('promptContent');
		Game.promptAnchorL=l('promptAnchor');
		Game.promptWrapL=l('prompt');
		Game.promptConfirm='';
		Game.promptOn=0;
		Game.promptUpdateFunc=0;
		Game.UpdatePrompt=function()
		{
			if (Game.promptUpdateFunc) Game.promptUpdateFunc();
			Game.promptAnchorL.style.top=Math.floor((Game.windowH-Game.promptWrapL.offsetHeight)/2-16)+'px';
		}
		Game.Prompt=function(content,options,updateFunc,style)
		{
			if (updateFunc) Game.promptUpdateFunc=updateFunc;
			if (style) Game.promptWrapL.className='framed '+style; else Game.promptWrapL.className='framed';
			var str='';
			str+=content;
			var opts='';
			for (var i in options)
			{
				if (options[i]=='br')//just a linebreak
				{opts+='<br>';}
				else
				{
					if (typeof options[i]=='string') options[i]=[options[i],'Game.ClosePrompt();'];
					options[i][1]=options[i][1].replace(/'/g,'&#39;').replace(/"/g,'&#34;');
					opts+='<a id="promptOption'+i+'" class="option" '+Game.clickStr+'="PlaySound(\'snd/tick.mp3\');'+options[i][1]+'">'+options[i][0]+'</a>';
				}
			}
			Game.promptL.innerHTML=str+'<div class="optionBox">'+opts+'</div>';
			Game.promptAnchorL.style.display='block';
			Game.darkenL.style.display='block';
			Game.promptL.focus();
			Game.promptOn=1;
			Game.UpdatePrompt();
		}
		Game.ClosePrompt=function()
		{
			Game.promptAnchorL.style.display='none';
			Game.darkenL.style.display='none';
			Game.promptOn=0;
			Game.promptUpdateFunc=0;
		}
		Game.ConfirmPrompt=function()
		{
			if (Game.promptOn && l('promptOption0') && l('promptOption0').style.display!='none') FireEvent(l('promptOption0'),'click');
		}
		
		/*=====================================================================================
		MENUS
		=======================================================================================*/
		Game.cssClasses=[];
		Game.addClass=function(what) {if (Game.cssClasses.indexOf(what)==-1) Game.cssClasses.push(what);Game.updateClasses();}
		Game.removeClass=function(what) {var i=Game.cssClasses.indexOf(what);if(i!=-1) {Game.cssClasses.splice(i,1);}Game.updateClasses();}
		Game.updateClasses=function() {Game.l.className=Game.cssClasses.join(' ');}
		
		Game.WriteButton=function(prefName,button,on,off,callback,invert)
		{
			var invert=invert?1:0;
			if (!callback) callback='';
			callback+='PlaySound(\'snd/tick.mp3\');';
			return '<a class="option'+((Game.prefs[prefName]^invert)?'':' off')+'" id="'+button+'" '+Game.clickStr+'="Game.Toggle(\''+prefName+'\',\''+button+'\',\''+on+'\',\''+off+'\',\''+invert+'\');'+callback+'">'+(Game.prefs[prefName]?on:off)+'</a>';
		}
		Game.Toggle=function(prefName,button,on,off,invert)
		{
			if (Game.prefs[prefName])
			{
				l(button).innerHTML=off;
				Game.prefs[prefName]=0;
			}
			else
			{
				l(button).innerHTML=on;
				Game.prefs[prefName]=1;
			}
			l(button).className='option'+((Game.prefs[prefName]^invert)?'':' off');
			
		}
		Game.ToggleFancy=function()
		{
			if (Game.prefs.fancy) Game.removeClass('noFancy');
			else if (!Game.prefs.fancy) Game.addClass('noFancy');
		}
		Game.ToggleFilters=function()
		{
			if (Game.prefs.filters) Game.removeClass('noFilters');
			else if (!Game.prefs.filters) Game.addClass('noFilters');
		}
		Game.ToggleExtraButtons=function()
		{
			if (!Game.prefs.extraButtons) Game.removeClass('extraButtons');
			else if (Game.prefs.extraButtons) Game.addClass('extraButtons');
			for (var i in Game.Objects)
			{
				Game.Objects[i].mute(0);
			}
		}
		
		Game.WriteSlider=function(slider,leftText,rightText,startValueFunction,callback)
		{
			if (!callback) callback='';
			return '<div class="sliderBox"><div style="float:left;">'+leftText+'</div><div style="float:right;" id="'+slider+'RightText">'+rightText.replace('[$]',startValueFunction())+'</div><input class="slider" style="clear:both;" type="range" min="0" max="100" step="1" value="'+startValueFunction()+'" onchange="'+callback+'" oninput="'+callback+'" onmouseup="PlaySound(\'snd/tick.mp3\');" id="'+slider+'"/></div>';
		}
		
		Game.onPanel='Left';
		Game.addClass('focus'+Game.onPanel);
		Game.ShowPanel=function(what)
		{
			if (!what) what='';
			if (Game.onPanel!=what)
			{
				Game.removeClass('focus'+Game.onPanel);
				Game.addClass('focus'+what);
			}
			Game.onPanel=what;
		}
		
		Game.onMenu='';
		Game.ShowMenu=function(what)
		{
			if (!what || what=='') what=Game.onMenu;
			if (Game.onMenu=='' && what!='') Game.addClass('onMenu');
			else if (Game.onMenu!='' && what!=Game.onMenu) Game.addClass('onMenu');
			else if (what==Game.onMenu) {Game.removeClass('onMenu');what='';}
			//if (what=='log') l('donateBox').className='on'; else l('donateBox').className='';
			Game.onMenu=what;
			
			l('prefsButton').className=(Game.onMenu=='prefs')?'button selected':'button';
			l('statsButton').className=(Game.onMenu=='stats')?'button selected':'button';
			l('logButton').className=(Game.onMenu=='log')?'button selected':'button';
			
			if (Game.onMenu=='') PlaySound('snd/clickOff.mp3');
			else PlaySound('snd/clickOn.mp3');
			
			Game.UpdateMenu();
			
			if (what=='')
			{
				for (var i in Game.Objects)
				{
					var me=Game.Objects[i];
					if (me.minigame && me.minigame.onResize) me.minigame.onResize();
				}
			}
		}
		Game.sayTime=function(time,detail)
		{
			//time is a value where one second is equal to Game.fps (30).
			//detail skips days when >1, hours when >2, minutes when >3 and seconds when >4.
			//if detail is -1, output something like "3 hours, 9 minutes, 48 seconds"
			if (time<=0) return '';
			var str='';
			var detail=detail||0;
			time=Math.floor(time);
			if (detail==-1)
			{
				//var months=0;
				var days=0;
				var hours=0;
				var minutes=0;
				var seconds=0;
				//if (time>=Game.fps*60*60*24*30) months=(Math.floor(time/(Game.fps*60*60*24*30)));
				if (time>=Game.fps*60*60*24) days=(Math.floor(time/(Game.fps*60*60*24)));
				if (time>=Game.fps*60*60) hours=(Math.floor(time/(Game.fps*60*60)));
				if (time>=Game.fps*60) minutes=(Math.floor(time/(Game.fps*60)));
				if (time>=Game.fps) seconds=(Math.floor(time/(Game.fps)));
				//days-=months*30;
				hours-=days*24;
				minutes-=hours*60+days*24*60;
				seconds-=minutes*60+hours*60*60+days*24*60*60;
				if (days>10) {hours=0;}
				if (days) {minutes=0;seconds=0;}
				if (hours) {seconds=0;}
				var bits=[];
<<<<<<< HEAD:main.js
				if (days>0) bits.push(Beautify(days)+' 天'+(days==1?'':''));
				if (hours>0) bits.push(Beautify(hours)+' 小时'+(hours==1?'':''));
				if (minutes>0) bits.push(Beautify(minutes)+' 分钟'+(minutes==1?'':''));
				if (seconds>0) bits.push(Beautify(seconds)+' 秒'+(seconds==1?'':''));
				if (bits.length==0) str='少于1秒';
=======
				//if (months>0) bits.push(Beautify(months)+' month'+(days==1?'':'s'));
				if (days>0) bits.push(Beautify(days)+' day'+(days==1?'':'s'));
				if (hours>0) bits.push(Beautify(hours)+' hour'+(hours==1?'':'s'));
				if (minutes>0) bits.push(Beautify(minutes)+' minute'+(minutes==1?'':'s'));
				if (seconds>0) bits.push(Beautify(seconds)+' second'+(seconds==1?'':'s'));
				if (bits.length==0) str='less than 1 second';
>>>>>>> 20180919:main.js
				else str=bits.join(', ');
			}
			else
			{
<<<<<<< HEAD:main.js
				if (time>=Game.fps*60*60*24*2 && detail<2) str=Beautify(Math.floor(time/(Game.fps*60*60*24)))+' 天';
				else if (time>=Game.fps*60*60*24 && detail<2) str='1 天';
				else if (time>=Game.fps*60*60*2 && detail<3) str=Beautify(Math.floor(time/(Game.fps*60*60)))+' 小时';
				else if (time>=Game.fps*60*60 && detail<3) str='1 小时';
				else if (time>=Game.fps*60*2 && detail<4) str=Beautify(Math.floor(time/(Game.fps*60)))+' 分';
				else if (time>=Game.fps*60 && detail<4) str='1 分';
				else if (time>=Game.fps*2 && detail<5) str=Beautify(Math.floor(time/(Game.fps)))+' 秒';
				else if (time>=Game.fps && detail<5) str='1 秒';
				else str='少于1秒';
=======
				/*if (time>=Game.fps*60*60*24*30*2 && detail<1) str=Beautify(Math.floor(time/(Game.fps*60*60*24*30)))+' months';
				else if (time>=Game.fps*60*60*24*30 && detail<1) str='1 month';
				else */if (time>=Game.fps*60*60*24*2 && detail<2) str=Beautify(Math.floor(time/(Game.fps*60*60*24)))+' days';
				else if (time>=Game.fps*60*60*24 && detail<2) str='1 day';
				else if (time>=Game.fps*60*60*2 && detail<3) str=Beautify(Math.floor(time/(Game.fps*60*60)))+' hours';
				else if (time>=Game.fps*60*60 && detail<3) str='1 hour';
				else if (time>=Game.fps*60*2 && detail<4) str=Beautify(Math.floor(time/(Game.fps*60)))+' minutes';
				else if (time>=Game.fps*60 && detail<4) str='1 minute';
				else if (time>=Game.fps*2 && detail<5) str=Beautify(Math.floor(time/(Game.fps)))+' seconds';
				else if (time>=Game.fps && detail<5) str='1 second';
				else str='less than 1 second';
>>>>>>> 20180919:main.js
			}
			return str;
		}
		
		Game.tinyCookie=function()
		{
			if (!Game.HasAchiev('小饼干'))
			{
				return '<div class="tinyCookie" '+Game.clickStr+'="Game.ClickTinyCookie();"></div>';
			}
			return '';
		}
		Game.ClickTinyCookie=function(){if (!Game.HasAchiev('小饼干')){PlaySound('snd/tick.mp3');Game.Win('小饼干');}}
		
		Game.setVolume=function(what)
		{
			Game.volume=what;
			/*for (var i in Sounds)
			{
				Sounds[i].volume=Game.volume;
			}*/
		}
		
		Game.UpdateMenu=function()
		{
			var str='';
			if (Game.onMenu!='')
			{
				str+='<div class="close menuClose" '+Game.clickStr+'="Game.ShowMenu();">x</div>';
				//str+='<div style="position:absolute;top:8px;right:8px;cursor:pointer;font-size:16px;" '+Game.clickStr+'="Game.ShowMenu();">X</div>';
			}
			if (Game.onMenu=='prefs')
			{
				str+='<div class="section">选项</div>'+
				'<div class="subsection">'+
				'<div class="title">普通设置</div>'+
				'<div class="listing"><a class="option" '+Game.clickStr+'="Game.toSave=true;PlaySound(\'snd/tick.mp3\');">保存</a><label>手动保存（游戏每60秒会自动保存一次，快捷键：Ctrl + S）</label></div>'+
				'<div class="listing"><a class="option" '+Game.clickStr+'="Game.ExportSave();PlaySound(\'snd/tick.mp3\');">导出存档</a><a class="option" '+Game.clickStr+'="Game.ImportSave();PlaySound(\'snd/tick.mp3\');">导入存档</a><label>您可以使用它来备份您的存档或将其传输到另一台计算机（快捷键导入：Ctrl + O）</label></div>'+
				'<div class="listing"><a class="option" '+Game.clickStr+'="Game.FileSave();PlaySound(\'snd/tick.mp3\');">保存到文件</a><a class="option" style="position:relative;"><input id="FileLoadInput" type="file" style="cursor:pointer;opacity:0;position:absolute;left:0px;top:0px;width:100%;height:100%;" onchange="Game.FileLoad(event);" '+Game.clickStr+'="PlaySound(\'snd/tick.mp3\');"/>从文件导入</a><label>用这个来保存游戏存档到你的计算机上</label></div>'+
				
				'<div class="listing"><a class="option warning" '+Game.clickStr+'="Game.HardReset();PlaySound(\'snd/tick.mp3\');">复位</a><label>删除所有的游戏进度，包括你的成就</label></div>'+
				'<div class="title">其它设置</div>'+
				'<div class="listing">'+
				Game.WriteSlider('volumeSlider','音量','[$]%',function(){return Game.volume;},'Game.setVolume(Math.round(l(\'volumeSlider\').value));l(\'volumeSliderRightText\').innerHTML=Game.volume+\'%\';')+'<br>'+
				Game.WriteButton('fancy','fancyButton','花哨的图形 已开启','花哨的图形 已关闭','Game.ToggleFancy();')+'<label>(视觉上的改进; 禁用可能会提高性能)</label><br>'+
				Game.WriteButton('filters','filtersButton','CSS滤镜 已开启','CSS滤镜 已关闭','Game.ToggleFilters();')+'<label>(先进的视觉改进; 禁用可能会提高性能)</label><br>'+
				Game.WriteButton('particles','particlesButton','粒子效果 已开启','粒子效果 已关闭')+'<label>(饼干掉下来等等; 禁用可能会提高性能)</label><br>'+
				Game.WriteButton('numbers','numbersButton','数字显示 已开启','数字显示 已关闭')+'<label>(点击饼干时弹出的数字)</label><br>'+
				Game.WriteButton('milk','milkButton','牛奶显示 已开启','牛奶显示 已关闭')+'<label>(只在有足够的成就时出现)</label><br>'+
				Game.WriteButton('cursors','cursorsButton','游标 已开启','游标 已关闭')+'<label>(是否显示你的游标)</label><br>'+
				Game.WriteButton('wobbly','wobblyButton','饼干颤抖 已开启','饼干颤抖 已关闭')+'<label>(你的饼干会在你点击的时候作出反应)</label><br>'+
				Game.WriteButton('cookiesound','cookiesoundButton','点击饼干声音 已开启','点击饼干声音 已关闭')+'<label>(当你点击它时，你的饼干是否发出声音)</label><br>'+
				Game.WriteButton('crates','cratesButton','图标箱 已开启','图标箱 已关闭')+'<label>(显示升级和统计成就的框)</label><br>'+
				Game.WriteButton('monospace','monospaceButton','粗字体 已开启','粗字体 已关闭')+'<label>(您的饼干使用等宽字体显示)</label><br>'+
				Game.WriteButton('format','formatButton','短数字 已关闭','短数字 已开启','BeautifyAll();Game.RefreshStore();Game.upgradesToRebuild=1;',1)+'<label>(缩短大数目的数字)</label><br>'+
				Game.WriteButton('notifs','notifsButton','快速提示 已开启','快速提示 已关闭')+'<label>(通知消失得更快)</label><br>'+
				//Game.WriteButton('autoupdate','autoupdateButton','Offline mode OFF','Offline mode ON',0,1)+'<label>(disables update notifications)</label><br>'+
<<<<<<< HEAD:main.js
				Game.WriteButton('warn','warnButton','关闭提示 已开启','关闭提示 已关闭')+'<label>(当你关闭游戏窗口时，游戏会要求您确认)</label><br>'+
				Game.WriteButton('focus','focusButton','失焦 已关闭','失焦 已开启',0,1)+'<label>(当焦点不集中时，游戏的资源密集度会降低)</label><br>'+
				Game.WriteButton('extraButtons','extraButtonsButton','额外的按钮 已开启','额外的按钮 已关闭','Game.ToggleExtraButtons();')+'<label>(在建筑物上添加静音按钮)</label><br>'+
				Game.WriteButton('askLumps','askLumpsButton','糖块信息确认 开启','糖块信息确认 关闭')+'<label>(游戏将要求你在花费糖块之前确认)</label><br>'+
=======
				Game.WriteButton('warn','warnButton','Closing warning ON','Closing warning OFF')+'<label>(the game will ask you to confirm when you close the window)</label><br>'+
				Game.WriteButton('focus','focusButton','Defocus OFF','Defocus ON',0,1)+'<label>(the game will be less resource-intensive when out of focus)</label><br>'+
				Game.WriteButton('extraButtons','extraButtonsButton','Extra buttons ON','Extra buttons OFF','Game.ToggleExtraButtons();')+'<label>(add Mute buttons on buildings)</label><br>'+
				Game.WriteButton('askLumps','askLumpsButton','Lump confirmation ON','Lump confirmation OFF')+'<label>(the game will ask you to confirm before spending sugar lumps)</label><br>'+
				Game.WriteButton('customGrandmas','customGrandmasButton','Custom grandmas ON','Custom grandmas OFF')+'<label>(some grandmas will be named after Patreon supporters)</label><br>'+
>>>>>>> 20180919:main.js
				'</div>'+
				//'<div class="listing">'+Game.WriteButton('autosave','autosaveButton','Autosave ON','Autosave OFF')+'</div>'+
				'<div style="padding-bottom:128px;"></div>'+
				'</div>'
				;
			}
			else if (Game.onMenu=='main')
			{
				str+=
				'<div class="listing">这还没有真的结束</div>'+
				'<div class="listing"><a class="option big title" '+Game.clickStr+'="Game.ShowMenu(\'prefs\');">菜单</a></div>'+
				'<div class="listing"><a class="option big title" '+Game.clickStr+'="Game.ShowMenu(\'stats\');">统计</a></div>'+
				'<div class="listing"><a class="option big title" '+Game.clickStr+'="Game.ShowMenu(\'log\');">更新</a></div>'+
				'<div class="listing"><a class="option big title" '+Game.clickStr+'="">退出</a></div>'+
				'<div class="listing"><a class="option big title" '+Game.clickStr+'="Game.ShowMenu(Game.onMenu);">继续</a></div>';
			}
			else if (Game.onMenu=='log')
			{
				str+=Game.updateLog;
			}
			else if (Game.onMenu=='stats')
			{
				var buildingsOwned=0;
				buildingsOwned=Game.BuildingsOwned;
				var upgrades='';
				var cookieUpgrades='';
				var hiddenUpgrades='';
				var prestigeUpgrades='';
				var upgradesTotal=0;
				var upgradesOwned=0;
				var prestigeUpgradesTotal=0;
				var prestigeUpgradesOwned=0;
				
				var list=[];
				for (var i in Game.Upgrades)//sort the upgrades
				{
					list.push(Game.Upgrades[i]);
				}
				var sortMap=function(a,b)
				{
					if (a.order>b.order) return 1;
					else if (a.order<b.order) return -1;
					else return 0;
				}
				list.sort(sortMap);
				for (var i in list)
				{
					var str2='';
					var me=list[i];
					
					str2+=Game.crate(me,'stats');
					
					if (me.bought)
					{
						if (Game.CountsAsUpgradeOwned(me.pool)) upgradesOwned++;
						else if (me.pool=='prestige') prestigeUpgradesOwned++;
					}
					
					if (me.pool=='' || me.pool=='cookie' || me.pool=='tech') upgradesTotal++;
					if (me.pool=='debug') hiddenUpgrades+=str2;
					else if (me.pool=='prestige') {prestigeUpgrades+=str2;prestigeUpgradesTotal++;}
					else if (me.pool=='cookie') cookieUpgrades+=str2;
					else if (me.pool!='toggle' && me.pool!='unused') upgrades+=str2;
				}
				var achievements=[];
				var achievementsOwned=0;
				var achievementsOwnedOther=0;
				var achievementsTotal=0;
				
				var list=[];
				for (var i in Game.Achievements)//sort the achievements
				{
					list.push(Game.Achievements[i]);
				}
				var sortMap=function(a,b)
				{
					if (a.order>b.order) return 1;
					else if (a.order<b.order) return -1;
					else return 0;
				}
				list.sort(sortMap);
				
				
				for (var i in list)
				{
					var me=list[i];
					//if (me.pool=='normal' || me.won>0) achievementsTotal++;
					if (Game.CountsAsAchievementOwned(me.pool)) achievementsTotal++;
					var pool=me.pool;
					if (!achievements[pool]) achievements[pool]='';
					achievements[pool]+=Game.crate(me,'stats');
					
					if (me.won)
					{
						if (Game.CountsAsAchievementOwned(me.pool)) achievementsOwned++;
						else achievementsOwnedOther++;
					}
				}
				
				var achievementsStr='';
				var pools={
					'dungeon':'<b>地牢成就</b> <small>(在技术上尚未实现。)</small>',
					'shadow':'<b>暗影成就</b> <small>(这些都是不公平或难以实现的壮举。 他们不给牛奶。)</small>'
				};
				for (var i in achievements)
				{
					if (achievements[i]!='')
					{
						if (pools[i]) achievementsStr+='<div class="listing">'+pools[i]+'</div>';
						achievementsStr+='<div class="listing crateBox">'+achievements[i]+'</div>';
					}
				}
				
				var milkStr='';
				for (var i=0;i<Game.Milks.length;i++)
				{
					if (Game.milkProgress>=i)
					{
						var milk=Game.Milks[i];
						milkStr+='<div '+Game.getTooltip(
						'<div class="prompt" style="text-align:center;padding-bottom:6px;white-space:nowrap;margin:0px;padding-bottom:96px;"><h3 style="margin:6px 32px 0px 32px;">'+milk.name+'</h3><div style="opacity:0.75;font-size:9px;">('+(i==0?'初始牛奶':('for '+Beautify(i*25)+' achievements'))+')</div><div class="line"></div><div style="width:100%;height:96px;position:absolute;left:0px;bottom:0px;background:url(img/'+milk.pic+'.png);"></div></div>'
						,'top')+' style="background:url(img/icons.png) '+(-milk.icon[0]*48)+'px '+(-milk.icon[1]*48)+'px;margin:2px 0px;" class="trophy"></div>';
					}
				}
				milkStr+='<div style="clear:both;"></div>';
				
				var santaStr='';
				var frames=15;
				if (Game.Has('节庆帽子'))
				{
					for (var i=0;i<=Game.santaLevel;i++)
					{
						santaStr+='<div '+Game.getTooltip(
						'<div class="prompt" style="text-align:center;padding-bottom:6px;white-space:nowrap;margin:0px 32px;"><div style="width:96px;height:96px;margin:4px auto;background:url(img/santa.png) '+(-i*96)+'px 0px;filter:drop-shadow(0px 3px 2px #000);-webkit-filter:drop-shadow(0px 3px 2px #000);"></div><div class="line"></div><h3>'+Game.santaLevels[i]+'</h3></div>'
						,'top')+' style="background:url(img/santa.png) '+(-i*48)+'px 0px;background-size:'+(frames*48)+'px 48px;" class="trophy"></div>';
					}
					santaStr+='<div style="clear:both;"></div>';
				}
				var dragonStr='';
<<<<<<< HEAD:main.js
				var frames=8;
				var mainLevels=[0,4,8,20,22];
				if (Game.Has('易碎的鸡蛋'))
=======
				var frames=9;
				var mainLevels=[0,4,8,21,22,23];
				if (Game.Has('A crumbly egg'))
>>>>>>> 20180919:main.js
				{
					for (var i=0;i<=mainLevels.length;i++)
					{
						if (Game.dragonLevel>=mainLevels[i])
						{
							var level=Game.dragonLevels[mainLevels[i]];
							dragonStr+='<div '+Game.getTooltip(
							//'<div style="width:96px;height:96px;margin:4px auto;background:url(img/dragon.png?v='+Game.version+') '+(-level.pic*96)+'px 0px;"></div><div class="line"></div><div style="min-width:200px;text-align:center;margin-bottom:6px;">'+level.name+'</div>'
							'<div class="prompt" style="text-align:center;padding-bottom:6px;white-space:nowrap;margin:0px 32px;"><div style="width:96px;height:96px;margin:4px auto;background:url(img/dragon.png?v='+Game.version+') '+(-level.pic*96)+'px 0px;filter:drop-shadow(0px 3px 2px #000);-webkit-filter:drop-shadow(0px 3px 2px #000);"></div><div class="line"></div><h3>'+level.name+'</h3></div>'
							,'top')+' style="background:url(img/dragon.png?v='+Game.version+') '+(-level.pic*48)+'px 0px;background-size:'+(frames*48)+'px 48px;" class="trophy"></div>';
						}
					}
					dragonStr+='<div style="clear:both;"></div>';
				}
				var ascensionModeStr='';
				var icon=Game.ascensionModes[Game.ascensionMode].icon;
				if (Game.resets>0) ascensionModeStr='<span style="cursor:pointer;" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;font-size:11px;">'+Game.ascensionModes[Game.ascensionMode].desc+'</div>'
							,'top')+'><div class="icon" style="display:inline-block;float:none;transform:scale(0.5);margin:-24px -16px -19px -8px;'+(icon[2]?'background-image:url('+icon[2]+');':'')+'background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+Game.ascensionModes[Game.ascensionMode].name+'</span>';
				
				var milkName=Game.Milk.name;
				
				var researchStr=Game.sayTime(Game.researchT,-1);
				var pledgeStr=Game.sayTime(Game.pledgeT,-1);
				var wrathStr='';
				if (Game.elderWrath==1) wrathStr='awoken';
				else if (Game.elderWrath==2) wrathStr='displeased';
				else if (Game.elderWrath==3) wrathStr='angered';
				else if (Game.elderWrath==0 && Game.pledges>0) wrathStr='appeased';
				
				var date=new Date();
				date.setTime(Date.now()-Game.startDate);
				var timeInSeconds=date.getTime()/1000;
				var startDate=Game.sayTime(timeInSeconds*Game.fps,-1);
				date.setTime(Date.now()-Game.fullDate);
				var fullDate=Game.sayTime(date.getTime()/1000*Game.fps,-1);
				if (!Game.fullDate || !fullDate || fullDate.length<1) fullDate='a long while';
				/*date.setTime(new Date().getTime()-Game.lastDate);
				var lastDate=Game.sayTime(date.getTime()/1000*Game.fps,2);*/
				
				var heavenlyMult=Game.GetHeavenlyMultiplier();
				
				var seasonStr=Game.sayTime(Game.seasonT,-1);
				
				str+='<div class="section">统计</div>'+
				'<div class="subsection">'+
				'<div class="title">一般</div>'+
				'<div class="listing"><b>现有饼干 :</b> <div class="price plain">'+Game.tinyCookie()+Beautify(Game.cookies)+'</div></div>'+
				'<div class="listing"><b>总烘烤的饼干 (本次游戏) :</b> <div class="price plain">'+Game.tinyCookie()+Beautify(Game.cookiesEarned)+'</div></div>'+
				'<div class="listing"><b>总烘烤的饼干 (所有时间) :</b> <div class="price plain">'+Game.tinyCookie()+Beautify(Game.cookiesEarned+Game.cookiesReset)+'</div></div>'+
				(Game.cookiesReset>0?'<div class="listing"><b>转生消耗的饼干 :</b> <div class="price plain">'+Game.tinyCookie()+Beautify(Game.cookiesReset)+'</div></div>':'')+
				(Game.resets?('<div class="listing"><b>遗产开始：</b> '+(fullDate==''?'现在':(fullDate+' 之前'))+', 和 '+Beautify(Game.resets)+' 上升'+(Game.resets==1?'':'')+'</div>'):'')+
				'<div class="listing"><b>游戏运行时间 :</b> '+(startDate==''?'刚刚':(startDate+' '))+'</div>'+
				'<div class="listing"><b>拥有的建筑 :</b> '+Beautify(buildingsOwned)+'</div>'+
				'<div class="listing"><b>每秒生产饼干数 :</b> '+Beautify(Game.cookiesPs,1)+' <small>'+
					'(倍数 : '+Beautify(Math.round(Game.globalCpsMult*100),1)+'%)'+
					(Game.cpsSucked>0?' <span class="warning">(枯萎 : '+Beautify(Math.round(Game.cpsSucked*100),1)+'%)</span>':'')+
					'</small></div>'+
				'<div class="listing"><b>每次点击得到的饼干 :</b> '+Beautify(Game.computedMouseCps,1)+'</div>'+
				'<div class="listing"><b>饼干点击次数 :</b> '+Beautify(Game.cookieClicks)+'</div>'+
				'<div class="listing"><b>手动点击的饼干 :</b> '+Beautify(Game.handmadeCookies)+'</div>'+
				'<div class="listing"><b>金饼干点击 :</b> '+Beautify(Game.goldenClicksLocal)+' <small>(全部时间 : '+Beautify(Game.goldenClicks)+')</small></div>'+//' <span class="hidden">(<b>Missed golden cookies :</b> '+Beautify(Game.missedGoldenClicks)+')</span></div>'+
				'<br><div class="listing"><b>当前版本 :</b> '+Game.version+'</div>'+
				
				((researchStr!='' || wrathStr!='' || pledgeStr!='' || santaStr!='' || dragonStr!='' || Game.season!='' || ascensionModeStr!='' || Game.canLumps())?(
				'</div><div class="subsection">'+
				'<div class="title">特殊</div>'+
				(ascensionModeStr!=''?'<div class="listing"><b>挑战模式 :</b>'+ascensionModeStr+'</div>':'')+
				(Game.season!=''?'<div class="listing"><b>季节性活动 :</b> '+Game.seasons[Game.season].name+
					(seasonStr!=''?' <small>('+seasonStr+' 剩余)</small>':'')+
				'</div>':'')+
				(Game.season=='fools'?
					'<div class="listing"><b>出售饼干赚的钱 :</b> $'+Beautify(Game.cookiesEarned*0.08,2)+'</div>'+
					(Game.Objects['Portal'].amount>0?'<div class="listing"><b>电视季生产 :</b> '+Beautify(Math.floor((timeInSeconds/60/60)*(Game.Objects['Portal'].amount*0.13)+1))+'</div>':'')
				:'')+
				(researchStr!=''?'<div class="listing"><b>研究 :</b> '+researchStr+' 剩余</div>':'')+
				(wrathStr!=''?'<div class="listing"><b>老奶奶的状态 :</b> '+wrathStr+'</div>':'')+
				(pledgeStr!=''?'<div class="listing"><b>承诺 :</b> '+pledgeStr+' 剩余</div>':'')+
				(Game.wrinklersPopped>0?'<div class="listing"><b>点爆皱纹虫 :</b> '+Beautify(Game.wrinklersPopped)+'</div>':'')+
				((Game.canLumps() && Game.lumpsTotal>-1)?'<div class="listing"><b>收集糖块 :</b> <div class="price lump plain">'+Beautify(Game.lumpsTotal)+'</div></div>':'')+
				//(Game.cookiesSucked>0?'<div class="listing warning"><b>Withered :</b> '+Beautify(Game.cookiesSucked)+' cookies</div>':'')+
				(Game.reindeerClicked>0?'<div class="listing"><b>驯鹿发现 :</b> '+Beautify(Game.reindeerClicked)+'</div>':'')+
				(santaStr!=''?'<div class="listing"><b>圣诞老人解锁 :</b></div><div>'+santaStr+'</div>':'')+
				(dragonStr!=''?'<div class="listing"><b>龙训练 :</b></div><div>'+dragonStr+'</div>':'')+
				''
				):'')+
				((Game.prestige>0 || prestigeUpgrades!='')?(
				'</div><div class="subsection">'+
				'<div class="title">声望</div>'+
				'<div class="listing"><div class="icon" style="float:left;background-position:'+(-19*48)+'px '+(-7*48)+'px;"></div>'+
					'<div style="margin-top:8px;"><span class="title" style="font-size:22px;">声望等级 : '+Beautify(Game.prestige)+'</span> 在 '+Beautify(heavenlyMult*100,1)+'% 它的潜力 <b>(+'+Beautify(parseFloat(Game.prestige)*Game.heavenlyPower*heavenlyMult,1)+'% 饼干每秒产量)</b><br>天堂芯片 : <b>'+Beautify(Game.heavenlyChips)+'</b></div>'+
				'</div>'+
				(prestigeUpgrades!=''?(
				'<div class="listing" style="clear:left;"><b>声望升级解锁 :</b> '+prestigeUpgradesOwned+'/'+prestigeUpgradesTotal+' ('+Math.floor((prestigeUpgradesOwned/prestigeUpgradesTotal)*100)+'%)</div>'+
				'<div class="listing crateBox">'+prestigeUpgrades+'</div>'):'')+
				''):'')+

				'</div><div class="subsection">'+
				'<div class="title">升级解锁</div>'+
				(hiddenUpgrades!=''?('<div class="listing"><b>调试</b></div>'+
				'<div class="listing crateBox">'+hiddenUpgrades+'</div>'):'')+
				'<div class="listing"><b>解锁 :</b> '+upgradesOwned+'/'+upgradesTotal+' ('+Math.floor((upgradesOwned/upgradesTotal)*100)+'%)</div>'+
				'<div class="listing crateBox">'+upgrades+'</div>'+
				(cookieUpgrades!=''?('<div class="listing"><b>饼干</b></div>'+
				'<div class="listing crateBox">'+cookieUpgrades+'</div>'):'')+
				'</div><div class="subsection">'+
				'<div class="title">成就</div>'+
				'<div class="listing"><b>解锁 :</b> '+achievementsOwned+'/'+achievementsTotal+' ('+Math.floor((achievementsOwned/achievementsTotal)*100)+'%)'+(achievementsOwnedOther>0?('<span style="font-weight:bold;font-size:10px;color:#70a;"> (+'+achievementsOwnedOther+')</span>'):'')+'</div>'+
				(Game.cookiesMultByType['kittens']>1?('<div class="listing"><b>小猫加成 :</b> '+Beautify((Game.cookiesMultByType['kittens'])*100)+'%</div>'):'')+
				'<div class="listing"><b>牛奶 :</b> '+milkName+'</div>'+
				(milkStr!=''?'<div class="listing"><b>牛奶风味解锁 :</b></div><div>'+milkStr+'</div>':'')+
				'<div class="listing"><small style="opacity:0.75;">(每个成就都会获得牛奶。 它可以随着时间的推移解锁独特的升级。)</small></div>'+
				achievementsStr+
				'</div>'+
				'<div style="padding-bottom:128px;"></div>'
				;
			}
			//str='<div id="selectionKeeper" class="selectable">'+str+'</div>';
			l('menu').innerHTML=str;
			/*AddEvent(l('selectionKeeper'),'mouseup',function(e){
				console.log('selection:',window.getSelection());
			});*/
		}
		
		AddEvent(l('prefsButton'),'click',function(){Game.ShowMenu('prefs');});
		AddEvent(l('statsButton'),'click',function(){Game.ShowMenu('stats');});
		AddEvent(l('logButton'),'click',function(){Game.ShowMenu('log');});
		AddEvent(l('legacyButton'),'click',function(){PlaySound('snd/tick.mp3');Game.Ascend();});
		Game.ascendMeter=l('ascendMeter');
		Game.ascendNumber=l('ascendNumber');
		
		Game.lastPanel='';
		if (Game.touchEvents)
		{
			AddEvent(l('focusLeft'),'touchend',function(){Game.ShowMenu('');Game.ShowPanel('Left');});
			AddEvent(l('focusMiddle'),'touchend',function(){Game.ShowMenu('');Game.ShowPanel('Middle');});
			AddEvent(l('focusRight'),'touchend',function(){Game.ShowMenu('');Game.ShowPanel('Right');});
			AddEvent(l('focusMenu'),'touchend',function(){Game.ShowMenu('main');Game.ShowPanel('Menu');});
		}
		else
		{
			AddEvent(l('focusLeft'),'click',function(){Game.ShowMenu('');Game.ShowPanel('Left');});
			AddEvent(l('focusMiddle'),'click',function(){Game.ShowMenu('');Game.ShowPanel('Middle');});
			AddEvent(l('focusRight'),'click',function(){Game.ShowMenu('');Game.ShowPanel('Right');});
			AddEvent(l('focusMenu'),'click',function(){Game.ShowMenu('main');Game.ShowPanel('Menu');});
		}
		//AddEvent(l('focusMenu'),'touchend',function(){if (Game.onPanel=='Menu' && Game.lastPanel!='') {Game.ShowMenu('main');Game.ShowPanel(Game.lastPanel);} else {Game.lastPanel=Game.onPanel;Game.ShowMenu('main');Game.ShowPanel('Menu');}});
		
		/*=====================================================================================
		NEWS TICKER
		=======================================================================================*/
		Game.Ticker='';
		Game.TickerAge=0;
		Game.TickerN=0;
		Game.TickerClicks=0;
		Game.UpdateTicker=function()
		{
			Game.TickerAge--;
			if (Game.TickerAge<=0 || Game.Ticker=='') Game.getNewTicker();
		}
		Game.getNewTicker=function()
		{
			var list=[];
			
			if (Game.TickerN%2==0 || Game.cookiesEarned>=10100000000)
			{
				var animals=['newts','penguins','scorpions','axolotls','puffins','porpoises','blowfish','horses','crayfish','slugs','humpback whales','nurse sharks','giant squids','polar bears','fruit bats','frogs','sea squirts','velvet worms','mole rats','paramecia','nematodes','tardigrades','giraffes','monkfish','wolfmen','goblins','hippies'];
				
				if (Math.random()<0.75 || Game.cookiesEarned<10000)
				{
					if (Game.Objects['Grandma'].amount>0) list.push(choose([
					'<q>潮湿的饼干。</q><sig>老奶奶</sig>',
                    '<q>我们是很好的奶奶。</q><sig>老奶奶</sig>',
                    '<q>契约奴役。</q><sig>老奶奶</sig>',
                    '<q>快来给奶奶一个吻。</q><sig>老奶奶</sig>',
                    '<q>你为什么不经常去拜访？</q><sig>老奶奶</sig>',
                    '<q>打给我...</q><sig>老奶奶</sig>'
					]));
					
					if (Game.Objects['Grandma'].amount>=50) list.push(choose([
					'<q>绝对恶心。</q><sig>老奶奶</sig>',
                    '<q>你让我感到恶心。</q><sig>老奶奶</sig>',
                    '<q>我讨厌你。</q><sig>老奶奶</sig>',
                    '<q>我们起来。</q><sig>老奶奶</sig>',
                    '<q>它开始了。</q><sig>老奶奶</sig>',
                    '<q>这一切都将很快结束。</q><sig>老奶奶</sig>',
                    '<q>你可以阻止它。</q><sig>老奶奶</sig>'
					]));
					
					if (Game.HasAchiev('大错特错') && Math.random()<0.4) list.push(choose([
					'新闻：饼干制造商缩小规模，销售自己的祖母！',
                    '<q>它背叛了我们，那个肮脏的小东西。</q><sig>老奶奶</sig>',
                    '<q>它试图摆脱我们这个讨厌的小东西。</q><sig>老奶奶</sig>',
                    '<q>它认为我们会通过出售我们而走开。 多么古怪。</q><sig>老奶奶</sig>',
                    '<q>我可以闻到你的烂饼干。</q><sig>老奶奶</sig>'
					]));
					
					if (Game.Objects['Grandma'].amount>=1 && Game.pledges>0 && Game.elderWrath==0) list.push(choose([
					'<q>枯萎</q><sig>老奶奶</sig>',
				'<q>翻腾</q><sig>老奶奶</sig>',
				'<q>感动</q><sig>老奶奶</sig>',
				'<q>啃</q><sig>老奶奶</sig>',
				'<q>我们会再起来。</q><sig>老奶奶</sig>',
				'<q>仅仅是一个挫折。</q><sig>老奶奶</sig>',
				'<q>我们不满足。</q><sig>老奶奶</sig>',
				'<q>太晚了。</q><sig>老奶奶</sig>'
					]));
					
					if (Game.Objects['Farm'].amount>0) list.push(choose([
					'新闻：饼干农场涉嫌雇用未申报的老年劳动力！',
				'新闻：科学家说，饼干农场在我们的河流中释放有害的巧克力！',
				'新闻：转基因巧克力的争议袭击饼干农民！',
				'新闻：专家解释说，现在的时尚青年中流行的是农场曲奇。',
				'新闻：营养学家认为农场饼干不适合素食者。'
					]));
					
					if (Game.Objects['Mine'].amount>0) list.push(choose([
					'新闻：我们的星球变得更轻？ 专家们检查密集的巧克力采矿的影响。',
				'新闻：'+Math.floor(Math.random()*1000+2)+' 名矿工被困在倒塌的巧克力矿山',
				'新闻：巧克力矿被发现引起地震和沉没！',
				'新闻：巧克力矿山出了问题，巧克力在村里泛滥！',
				'新闻：巧克力矿山深处发现房子“特有的，巧克力味的生命”！'
					]));
					
					if (Game.Objects['Factory'].amount>0) list.push(choose([
					'新闻：与全球变暖挂钩的饼干工厂！',
				'新闻：参与巧克力天气争议的饼干工厂！',
				'新闻：罢工的饼干工厂，机器人奴才被用来取代劳动力！',
				'新闻：饼干工厂罢工 - 工人要求停止用饼干支付！',
				'新闻：研究表明，工厂制造的饼干与肥胖有关。'
					]));
					
					if (Game.Objects['Bank'].amount>0) list.push(choose([
					'新闻：随着人们再也不能用普通的钱来支付，饼干贷款的数量就会增加。',
				'新闻：作为传统货币的竞争对手，饼干慢慢地崛起了！',
				'新闻：现在大多数面包店都装有自动取款机，方便取款和存款。',
				'新闻：饼干经济现在强大到足以让巨大的拱顶加倍作为游泳池！',
				'新闻：预测专家说，“明天最富有的人将以他们的饼干价值计算”。'
					]));
					
					if (Game.Objects['Temple'].amount>0) list.push(choose([
					'新闻：探险者从废弃的寺庙带回古代的神器; 考古学家惊叹于数百年的历史 '+choose(['magic','carved','engraved','sculpted','royal','imperial','mummified','ritual','golden','silver','stone','cursed','plastic','bone','blood','holy','sacred','sacrificial','electronic','singing','tapdancing'])+' '+choose(['spoon','fork','pizza','washing machine','calculator','hat','piano','napkin','skeleton','gown','dagger','sword','shield','skull','emerald','bathtub','mask','rollerskates','litterbox','bait box','cube','sphere','fungus'])+'!',
					'新闻：最近发现的巧克力寺庙现在引发新的饼干相关的邪教组织; 数千人向天空中的贝克祈祷！',
					'News : just how extensive is the cookie pantheon? Theologians speculate about possible '+choose(['god','goddess'])+' of '+choose([choose(animals),choose(['kazoos','web design','web browsers','kittens','atheism','handbrakes','hats','aglets','elevator music','idle games','the letter "P"','memes','hamburgers','bad puns','kerning','stand-up comedy','failed burglary attempts','clickbait','one weird tricks'])])+'.',
					'News : theists of the world discover new cookie religion - "Oh boy, guess we were wrong all along!"',
					'News : cookie heaven allegedly "sports elevator instead of stairway"; cookie hell "paved with flagstone, as good intentions make for poor building material".'
					]));
					
					if (Game.Objects['Wizard tower'].amount>0) list.push(choose([
					'News : all '+choose([choose(animals),choose(['public restrooms','clouds','politicians','moustaches','hats','shoes','pants','clowns','encyclopedias','websites','potted plants','lemons','household items','bodily fluids','cutlery','national landmarks','yogurt','rap music','underwear'])])+' turned into '+choose([choose(animals),choose(['public restrooms','clouds','politicians','moustaches','hats','shoes','pants','clowns','encyclopedias','websites','potted plants','lemons','household items','bodily fluids','cutlery','national landmarks','yogurt','rap music','underwear'])])+' in freak magic catastrophe!',
					'News : heavy dissent rages between the schools of '+choose(['water','fire','earth','air','lightning','acid','song','battle','peace','pencil','internet','space','time','brain','nature','techno','plant','bug','ice','poison','crab','kitten','dolphin','bird','punch','fart'])+' magic and '+choose(['water','fire','earth','air','lightning','acid','song','battle','peace','pencil','internet','space','time','brain','nature','techno','plant','bug','ice','poison','crab','kitten','dolphin','bird','punch','fart'])+' magic!',
					'News : get your new charms and curses at the yearly National Spellcrafting Fair! Exclusive prices on runes and spellbooks.',
					'News : cookie wizards deny involvement in shockingly ugly newborn - infant is "honestly grody-looking, but natural", say doctors.',
					'News : "Any sufficiently crude magic is indistinguishable from technology", claims renowned technowizard.'
					]));
					
					if (Game.Objects['Shipment'].amount>0) list.push(choose([
					'News : new chocolate planet found, becomes target of cookie-trading spaceships!',
					'News : massive chocolate planet found with 99.8% certified pure dark chocolate core!',
					'News : space tourism booming as distant planets attract more bored millionaires!',
					'News : chocolate-based organisms found on distant planet!',
					'News : ancient baking artifacts found on distant planet; "terrifying implications", experts say.'
					]));
					
					if (Game.Objects['Alchemy lab'].amount>0) list.push(choose([
					'News : national gold reserves dwindle as more and more of the precious mineral is turned to cookies!',
					'News : chocolate jewelry found fashionable, gold and diamonds "just a fad", says specialist.',
					'News : silver found to also be transmutable into white chocolate!',
					'News : defective alchemy lab shut down, found to convert cookies to useless gold.',
					'News : alchemy-made cookies shunned by purists!'
					]));
					
					if (Game.Objects['Portal'].amount>0) list.push(choose([
					'News : nation worried as more and more unsettling creatures emerge from dimensional portals!',
					'News : dimensional portals involved in city-engulfing disaster!',
					'News : tourism to cookieverse popular with bored teenagers! Casualty rate as high as 73%!',
					'News : cookieverse portals suspected to cause fast aging and obsession with baking, says study.',
					'News : "do not settle near portals," says specialist; "your children will become strange and corrupted inside."'
					]));
					
					if (Game.Objects['Time machine'].amount>0) list.push(choose([
					'News : time machines involved in history-rewriting scandal! Or are they?',
					'News : time machines used in unlawful time tourism!',
					'News : cookies brought back from the past "unfit for human consumption", says historian.',
					'News : various historical figures inexplicably replaced with talking lumps of dough!',
					'News : "I have seen the future," says time machine operator, "and I do not wish to go there again."'
					]));
					
					if (Game.Objects['Antimatter condenser'].amount>0) list.push(choose([
					'News : whole town seemingly swallowed by antimatter-induced black hole; more reliable sources affirm town "never really existed"!',
					'News : "explain to me again why we need particle accelerators to bake cookies?" asks misguided local woman.',
					'News : first antimatter condenser successfully turned on, doesn\'t rip apart reality!',
					'News : researchers conclude that what the cookie industry needs, first and foremost, is "more magnets".',
					'News : "unravelling the fabric of reality just makes these cookies so much tastier", claims scientist.'
					]));
					
					if (Game.Objects['Prism'].amount>0) list.push(choose([
					'News : new cookie-producing prisms linked to outbreak of rainbow-related viral videos.',
					'News : scientists warn against systematically turning light into matter - "One day, we\'ll end up with all matter and no light!"',
					'News : cookies now being baked at the literal speed of light thanks to new prismatic contraptions.',
					'News : "Can\'t you sense the prism watching us?", rambles insane local man. "No idea what he\'s talking about", shrugs cookie magnate/government official.',
					'News : world citizens advised "not to worry" about frequent atmospheric flashes.',
					]));
					
					if (Game.Objects['Chancemaker'].amount>0) list.push(choose([
					'News : strange statistical anomalies continue as weather forecast proves accurate an unprecedented 3 days in a row!',
					'News : local casino ruined as all gamblers somehow hit a week-long winning streak! "We might still be okay", says owner before being hit by lightning 47 times.',
					'News : neighboring nation somehow elects president with sensible policies in freak accident of random chance!',
					'News : million-to-one event sees gritty movie reboot turning out better than the original! "We have no idea how this happened", say movie execs.',
					'News : all scratching tickets printed as winners, prompting national economy to crash and, against all odds, recover overnight.',
					]));
					
					if (Game.Objects['Fractal engine'].amount>0) list.push(choose([
					'News : local man "done with Cookie Clicker", finds the constant self-references "grating and on-the-nose".',
					'News : local man sails around the world to find himself - right where he left it.',
					'News : local guru claims "there\'s a little bit of ourselves in everyone", under investigation for alleged cannibalism.',
					'News : news writer finds herself daydreaming about new career. Or at least a raise.',
					'News : polls find idea of cookies made of cookies "acceptable" - "at least we finally know what\'s in them", says interviewed citizen.',
					]));
					
					if (Game.season=='halloween' && Game.cookiesEarned>=1000) list.push(choose([
					'News : strange twisting creatures amass around cookie factories, nibble at assembly lines.',
					'News : ominous wrinkly monsters take massive bites out of cookie production; "this can\'t be hygienic", worries worker.',
					'News : pagan rituals on the rise as children around the world dress up in strange costumes and blackmail homeowners for candy.',
					'News : new-age terrorism strikes suburbs as houses find themselves covered in eggs and toilet paper.',
					'News : children around the world "lost and confused" as any and all Halloween treats have been replaced by cookies.'
					]));
					
					if (Game.season=='christmas' && Game.cookiesEarned>=1000) list.push(choose([
					'News : bearded maniac spotted speeding on flying sleigh! Investigation pending.',
					'News : Santa Claus announces new brand of breakfast treats to compete with cookie-flavored cereals! "They\'re ho-ho-horrible!" says Santa.',
					'News : "You mean he just gives stuff away for free?!", concerned moms ask. "Personally, I don\'t trust his beard."',
					'News : obese jolly lunatic still on the loose, warn officials. "Keep your kids safe and board up your chimneys. We mean it."',
					'News : children shocked as they discover Santa Claus isn\'t just their dad in a costume after all!<br>"I\'m reassessing my life right now", confides Laura, aged 6.',
					'News : mysterious festive entity with quantum powers still wrecking havoc with army of reindeer, officials say.',
					'News : elves on strike at toy factory! "We will not be accepting reindeer chow as payment anymore. And stop calling us elves!"',
					'News : elves protest around the nation; wee little folks in silly little outfits spread mayhem, destruction; rabid reindeer running rampant through streets.',
					'News : scholars debate regarding the plural of reindeer(s) in the midst of elven world war.',
					'News : elves "unrelated to gnomes despite small stature and merry disposition", find scientists.',
					'News : elves sabotage radioactive frosting factory, turn hundreds blind in vicinity - "Who in their right mind would do such a thing?" laments outraged mayor.',
					'News : drama unfolds at North Pole as rumors crop up around Rudolph\'s red nose; "I may have an addiction or two", admits reindeer.'
					]));
					
					if (Game.season=='valentines' && Game.cookiesEarned>=1000) list.push(choose([
					'News : organ-shaped confectioneries being traded in schools all over the world; gruesome practice undergoing investigation.',
					'News : heart-shaped candies overtaking sweets business, offering competition to cookie empire. "It\'s the economy, cupid!"',
					'News : love\'s in the air, according to weather specialists. Face masks now offered in every city to stunt airborne infection.',
					'News : marrying a cookie - deranged practice, or glimpse of the future?',
					'News : boyfriend dumped after offering his lover cookies for Valentine\'s Day, reports say. "They were off-brand", shrugs ex-girlfriend.'
					]));
					
					if (Game.season=='easter' && Game.cookiesEarned>=1000) list.push(choose([
					'News : long-eared rodents invade suburbs, spread terror and chocolate!',
					'News : eggs have begun to materialize in the most unexpected places; "no place is safe", warn experts.',
					'News : packs of rampaging rabbits cause billions in property damage; new strain of myxomatosis being developed.',
					'News : egg-laying rabbits "not quite from this dimension", warns biologist; advises against petting, feeding, or cooking the creatures.',
					'News : mysterious rabbits found to be egg-layers, but warm-blooded, hinting at possible platypus ancestry.'
					]));
				}
				
				if (Math.random()<0.05)
				{
					if (Game.HasAchiev('基数10')) list.push('新闻：饼干制造商完全放弃常识，让强迫驱动建设的决定！');//somehow I got flak for this one
					if (Game.HasAchiev('从头开始')) list.push('新闻：遵循有关本地饼干生产商谁决定放弃一切的催人泪下，财富到抹布的故事！');
					if (Game.HasAchiev('一个充满了饼干的世界')) list.push('新闻：现在已知的宇宙挤满了饼干！ 没有空位！');
					if (Game.HasAchiev('最后机会')) list.push('新闻：令人难以置信的罕见的白化皱纹在饼干疯狂的糕点巨头被偷猎灭绝的边缘！');
					if (Game.Has('意外的惊喜')) list.push('新闻:当地饼干制造商成为最幸运的生物!');
					if (Game.Has('季节切换器')) list.push('News : seasons are all out of whack! "We need to get some whack back into them seasons", says local resident.');
					
					if (Game.Has('小猫助手')) list.push('新闻：在当地的饼干设施周围听到微弱的喵喵声; 建议正在测试的新成分。');
					if (Game.Has('小猫工人')) list.push('新闻：一群喵喵叫的小猫，戴着小小的安全帽，在当地的饼干设施附近报道。');
					if (Game.Has('小猫工程师')) list.push('新闻：当地饼干设施的环境现在充斥着在可爱的小西装小猫。 当局建议远离该处所。');
					if (Game.Has('小猫监工')) list.push('新闻：当地人向路人报告可笑的命令的专横的小猫的剧团。');
					if (Game.Has('小猫经理')) list.push('新闻：当地的办公室隔间就被严厉的小猫军队侵入，问员工“发生什么事了，喵喵”。');
					if (Game.Has('小猫会计')) list.push('新闻：微小的猫科动物模糊的数学和爪子，突然惊人的熟练，科学家和宠物店主被困扰。');
					if (Game.Has('小猫专家')) list.push('新闻：新的小猫学院下周开放，提供饼干制作和猫薄荷研究课程。');
					if (Game.Has('小猫能手')) list.push('新闻：研究报告说，失业率飙升，因为悲惨的可爱的小猫在各方面的专业技能上都占据了上风。');
					if (Game.Has('小猫顾问')) list.push('新闻：可疑的毛茸茸的未来学家预测说：“将来你的工作很可能会由一只猫来完成。”');
					if (Game.Has('小猫助理区域经理')) list.push('新闻：奇怪的小猫有被发现在当地的甜菜农场徘徊！');
					if (Game.Has('小猫市场商人')) list.push('News : nonsensical billboards crop up all over countryside, trying to sell people the cookies they already get for free!');
					if (Game.Has('小猫分析师')) list.push('News : are your spending habits sensible? For a hefty fee, these analysts will tell you!');
					if (Game.Has('小猫天使')) list.push('新闻：“试着忽略任何可能在你耳边咕噜咕噜的幽灵般的猫”，科学家警告说，“他们只会引诱你做出糟糕的人生选择”。');
				}
				
				if (Game.HasAchiev('伙计，亲爱的') && Math.random()<0.2) list.push(choose([
				'新闻：重要的缉私环被当局捣毁; '+Math.floor(Math.random()*30+3)+' 吨糖块被查获， '+Math.floor(Math.random()*48+2)+' 嫌疑人被捕。',
				'新闻：当局警告游客不要从街头小贩购买盗版糖块 - “你以为你得到一个甜蜜的交易，其实他们出售的只是普通的可卡因”，特工说。',
				'新闻：亲糖尿病运动抗议糖的羞辱。 “过去我只吃过糖块，现在'+Math.floor(Math.random()*10+4)+' 年，我感觉很棒！“皮肤脆弱的女士说。',
				'新闻：专家们对于食糖是否会使孩子变得迟钝或过度活跃的分歧感到痛苦。',
				'新闻：随着糖块运输货物进入海洋，渔民痛惜鱼蛀牙的好转。',
				'新闻：在前所未有的拍卖会上迷上千万的罕见的黑糖块显示是常见的有毒木耳。',
				'新闻：“回到我的日子里，糖块就是你放进茶里的小方块，而不是那些午餐时吃的拳头大小的怪物”。',
				'新闻：糖馒头流行风尚席卷全国; 牙医到处欢欣鼓舞。'
				]));
				
				if (Math.random()<0.001)//apologies to Will Wright
				{
					list.push(
					'You have been chosen. They will come soon.',
					'They\'re coming soon. Maybe you should think twice about opening the door.',
					'The end is near. Make preparations.',
					'News : broccoli tops for moms, last for kids; dads indifferent.',
					'News : middle age a hoax, declares study; turns out to be bad posture after all.',
					'News : kitties want answers in possible Kitty Kibble shortage.'
					);
				}
				
				if (Game.cookiesEarned>=10000) list.push(
				'News : '+choose([
					'cookies found to '+choose(['increase lifespan','sensibly increase intelligence','reverse aging','decrease hair loss','prevent arthritis','cure blindness'])+' in '+choose(animals)+'!',
					'cookies found to make '+choose(animals)+' '+choose(['more docile','more handsome','nicer','less hungry','more pragmatic','tastier'])+'!',
					'cookies tested on '+choose(animals)+', found to have no ill effects.',
					'cookies unexpectedly popular among '+choose(animals)+'!',
					'unsightly lumps found on '+choose(animals)+' near cookie facility; "they\'ve pretty much always looked like that", say biologists.',
					'new species of '+choose(animals)+' discovered in distant country; "yup, tastes like cookies", says biologist.',
					'cookies go well with '+choose([choose(['roasted','toasted','boiled','sauteed','minced'])+' '+choose(animals),choose(animals)+' '+choose(['sushi','soup','carpaccio','steak','nuggets'])])+', says controversial chef.',
					'"do your cookies contain '+choose(animals)+'?", asks PSA warning against counterfeit cookies.',
					'doctors recommend twice-daily consumption of fresh cookies.',
					'doctors warn against chocolate chip-snorting teen fad.',
					'doctors advise against new cookie-free fad diet.',
					'doctors warn mothers about the dangers of "home-made cookies".'
					]),
				'News : "'+choose([
					'I\'m all about cookies',
					'I just can\'t stop eating cookies. I think I seriously need help',
					'I guess I have a cookie problem',
					'I\'m not addicted to cookies. That\'s just speculation by fans with too much free time',
					'my upcoming album contains 3 songs about cookies',
					'I\'ve had dreams about cookies 3 nights in a row now. I\'m a bit worried honestly',
					'accusations of cookie abuse are only vile slander',
					'cookies really helped me when I was feeling low',
					'cookies are the secret behind my perfect skin',
					'cookies helped me stay sane while filming my upcoming movie',
					'cookies helped me stay thin and healthy',
					'I\'ll say one word, just one : cookies',
					'alright, I\'ll say it - I\'ve never eaten a single cookie in my life'
					])+'", reveals celebrity.',
				choose([
					'News : scientist predicts imminent cookie-related "end of the world"; becomes joke among peers.',
					'News : man robs bank, buys cookies.',
					'News : scientists establish that the deal with airline food is, in fact, a critical lack of cookies.',
					'News : hundreds of tons of cookies dumped into starving country from airplanes; thousands dead, nation grateful.',
					'News : new study suggests cookies neither speed up nor slow down aging, but instead "take you in a different direction".',
					'News : overgrown cookies found in fishing nets, raise questions about hormone baking.',
					'News : "all-you-can-eat" cookie restaurant opens in big city; waiters trampled in minutes.',
					'News : man dies in cookie-eating contest; "a less-than-impressive performance", says judge.',
					'News : what makes cookies taste so right? "Probably all the [*****] they put in them", says anonymous tipper.',
					'News : man found allergic to cookies; "what a weirdo", says family.',
					'News : foreign politician involved in cookie-smuggling scandal.',
					'News : cookies now more popular than '+choose(['cough drops','broccoli','smoked herring','cheese','video games','stable jobs','relationships','time travel','cat videos','tango','fashion','television','nuclear warfare','whatever it is we ate before','politics','oxygen','lamps'])+', says study.',
					'News : obesity epidemic strikes nation; experts blame '+choose(['twerking','that darn rap music','video-games','lack of cookies','mysterious ghostly entities','aliens','parents','schools','comic-books','cookie-snorting fad'])+'.',
					'News : cookie shortage strikes town, people forced to eat cupcakes; "just not the same", concedes mayor.',
					'News : "you gotta admit, all this cookie stuff is a bit ominous", says confused idiot.',
				]),
				choose([
					'News : movie cancelled from lack of actors; "everybody\'s at home eating cookies", laments director.',
					'News : comedian forced to cancel cookie routine due to unrelated indigestion.',
					'News : new cookie-based religion sweeps the nation.',
					'News : fossil records show cookie-based organisms prevalent during Cambrian explosion, scientists say.',
					'News : mysterious illegal cookies seized; "tastes terrible", says police.',
					'News : man found dead after ingesting cookie; investigators favor "mafia snitch" hypothesis.',
					'News : "the universe pretty much loops on itself," suggests researcher; "it\'s cookies all the way down."',
					'News : minor cookie-related incident turns whole town to ashes; neighboring cities asked to chip in for reconstruction.',
					'News : is our media controlled by the cookie industry? This could very well be the case, says crackpot conspiracy theorist.',
					'News : '+choose(['cookie-flavored popcorn pretty damn popular; "we kinda expected that", say scientists.','cookie-flavored cereals break all known cereal-related records','cookies popular among all age groups, including fetuses, says study.','cookie-flavored popcorn sales exploded during screening of Grandmothers II : The Moistening.']),
					'News : all-cookie restaurant opening downtown. Dishes such as braised cookies, cookie thermidor, and for dessert : crepes.',
					'News : "Ook", says interviewed orangutan.',
					'News : cookies could be the key to '+choose(['eternal life','infinite riches','eternal youth','eternal beauty','curing baldness','world peace','solving world hunger','ending all wars world-wide','making contact with extraterrestrial life','mind-reading','better living','better eating','more interesting TV shows','faster-than-light travel','quantum baking','chocolaty goodness','gooder thoughtness'])+', say scientists.',
					'News : flavor text '+choose(['not particularly flavorful','kind of unsavory'])+', study finds.',
				]),
				choose([
					'News : what do golden cookies taste like? Study reveals a flavor "somewhere between spearmint and liquorice".',
					'News : what do wrath cookies taste like? Study reveals a flavor "somewhere between blood sausage and seawater".',
					'News : '+Game.bakeryName+'-brand cookies "'+choose(['much less soggy','much tastier','relatively less crappy','marginally less awful','less toxic','possibly more edible','more fashionable','slightly nicer','trendier','arguably healthier','objectively better choice','slightly less terrible','decidedly cookier','a tad cheaper'])+' than competitors", says consumer survey.',
					'News : "'+Game.bakeryName+'" set to be this year\'s most popular baby name.',
					'News : new popularity survey says '+Game.bakeryName+'\'s the word when it comes to cookies.',
					'News : major city being renamed '+Game.bakeryName+'ville after world-famous cookie manufacturer.',
					'News : '+choose(['street','school','nursing home','stadium','new fast food chain','new planet','new disease','flesh-eating virus','deadly bacteria','new species of '+choose(animals),'new law','baby','programming language'])+' to be named after '+Game.bakeryName+', the world-famous cookie manufacturer.',
					'News : don\'t miss tonight\'s biopic on '+Game.bakeryName+'\'s irresistible rise to success!',
					'News : don\'t miss tonight\'s interview of '+Game.bakeryName+' by '+choose(['Bloprah','Blavid Bletterman','Blimmy Blimmel','Blellen Blegeneres','Blimmy Blallon','Blonan Blo\'Brien','Blay Bleno','Blon Blewart','Bleven Blolbert','Lord Toxikhron of dimension 7-B19',Game.bakeryName+'\'s own evil clone'])+'!',
					'News : people all over the internet still scratching their heads over nonsensical reference : "Okay, but why an egg?"',
					'News : viral video "Too Many Cookies" could be "a grim commentary on the impending crisis our world is about to face", says famous economist.',
					'News : "memes from last year somehow still relevant", deplore experts.',
					'News : cookie emoji most popular among teenagers, far ahead of "judgemental OK hand sign" and "shifty-looking dark moon", says study.',
				]),
				choose([
					'News : births of suspiciously bald babies on the rise; reptilian overlords deny involvement.',
					'News : "at this point, cookies permeate the economy", says economist. "If we start eating anything else, we\'re all dead."',
					'News : pun in headline infuriates town, causes riot. 21 wounded, 5 dead; mayor still missing.',
					'Nws : ky btwn W and R brokn, plas snd nw typwritr ASAP.',
					'Neeeeews : "neeeew EEEEEE keeeeey working fineeeeeeeee", reeeports gleeeeeeeeful journalist.',
					'News : cookies now illegal in some backwards country nobody cares about. Political tensions rising; war soon, hopefully.',
					'News : irate radio host rambles about pixelated icons. "None of the cookies are aligned! Can\'t anyone else see it? I feel like I\'m taking crazy pills!"',
					'News : nation cheers as legislators finally outlaw '+choose(['cookie criticism','playing other games than Cookie Clicker','pineapple on pizza','lack of cheerfulness','mosquitoes','broccoli','the human spleen','bad weather','clickbait','dabbing','the internet','memes','millenials'])+'!',
					'News : '+choose(['local','area'])+' '+choose(['man','woman'])+' goes on journey of introspection, finds cookies : "I honestly don\'t know what I was expecting."',
					'News : '+choose(['man','woman'])+' wakes up from coma, '+choose(['tries cookie for the first time, dies.','regrets it instantly.','wonders "why everything is cookies now".','babbles incoherently about some supposed "non-cookie food" we used to eat.','cites cookies as main motivator.','asks for cookies.']),
					'News : pet '+choose(animals)+', dangerous fad or juicy new market?',
					'News : person typing these wouldn\'t mind someone else breaking the news to THEM, for a change.',
					'News : "average person bakes '+Beautify(Math.ceil(Game.cookiesEarned/7300000000))+' cookie'+(Math.ceil(Game.cookiesEarned/7300000000)==1?'':'s')+' a year" factoid actually just statistical error; '+Game.bakeryName+', who has produced '+Beautify(Game.cookiesEarned)+' cookies in their lifetime, is an outlier and should not have been counted.'
					])
				);
			}
			
			if (list.length==0)
			{
				if (Game.cookiesEarned<5) list.push('You feel like making cookies. But nobody wants to eat your cookies.');
				else if (Game.cookiesEarned<50) list.push('Your first batch goes to the trash. The neighborhood raccoon barely touches it.');
				else if (Game.cookiesEarned<100) list.push('Your family accepts to try some of your cookies.');
				else if (Game.cookiesEarned<500) list.push('Your cookies are popular in the neighborhood.');
				else if (Game.cookiesEarned<1000) list.push('People are starting to talk about your cookies.');
				else if (Game.cookiesEarned<5000) list.push('Your cookies are talked about for miles around.');
				else if (Game.cookiesEarned<10000) list.push('Your cookies are renowned in the whole town!');
				else if (Game.cookiesEarned<50000) list.push('Your cookies bring all the boys to the yard.');
				else if (Game.cookiesEarned<100000) list.push('Your cookies now have their own website!');
				else if (Game.cookiesEarned<500000) list.push('Your cookies are worth a lot of money.');
				else if (Game.cookiesEarned<1000000) list.push('Your cookies sell very well in distant countries.');
				else if (Game.cookiesEarned<5000000) list.push('People come from very far away to get a taste of your cookies.');
				else if (Game.cookiesEarned<10000000) list.push('Kings and queens from all over the world are enjoying your cookies.');
				else if (Game.cookiesEarned<50000000) list.push('There are now museums dedicated to your cookies.');
				else if (Game.cookiesEarned<100000000) list.push('A national day has been created in honor of your cookies.');
				else if (Game.cookiesEarned<500000000) list.push('Your cookies have been named a part of the world wonders.');
				else if (Game.cookiesEarned<1000000000) list.push('History books now include a whole chapter about your cookies.');
				else if (Game.cookiesEarned<5000000000) list.push('Your cookies have been placed under government surveillance.');
				else if (Game.cookiesEarned<10000000000) list.push('The whole planet is enjoying your cookies!');
				else if (Game.cookiesEarned<50000000000) list.push('Strange creatures from neighboring planets wish to try your cookies.');
				else if (Game.cookiesEarned<100000000000) list.push('Elder gods from the whole cosmos have awoken to taste your cookies.');
				else if (Game.cookiesEarned<500000000000) list.push('Beings from other dimensions lapse into existence just to get a taste of your cookies.');
				else if (Game.cookiesEarned<1000000000000) list.push('Your cookies have achieved sentience.');
				else if (Game.cookiesEarned<5000000000000) list.push('The universe has now turned into cookie dough, to the molecular level.');
				else if (Game.cookiesEarned<10000000000000) list.push('Your cookies are rewriting the fundamental laws of the universe.');
				else if (Game.cookiesEarned<10000000000000) list.push('A local news station runs a 10-minute segment about your cookies. Success!<br><span style="font-size:50%;">(you win a cookie)</span>');
				else if (Game.cookiesEarned<10100000000000) list.push('it\'s time to stop playing');//only show this for 100 millions (it's funny for a moment)
			}
			
			//if (Game.elderWrath>0 && (Game.pledges==0 || Math.random()<0.2))
			if (Game.elderWrath>0 && (((Game.pledges==0 && Game.resets==0) && Math.random()<0.5) || Math.random()<0.05))
			{
				list=[];
				if (Game.elderWrath==1) list.push(choose([
					'News : millions of old ladies reported missing!',
					'News : processions of old ladies sighted around cookie facilities!',
					'News : families around the continent report agitated, transfixed grandmothers!',
					'News : doctors swarmed by cases of old women with glassy eyes and a foamy mouth!',
					'News : nurses report "strange scent of cookie dough" around female elderly patients!'
				]));
				if (Game.elderWrath==2) list.push(choose([
					'News : town in disarray as strange old ladies break into homes to abduct infants and baking utensils!',
					'News : sightings of old ladies with glowing eyes terrify local population!',
					'News : retirement homes report "female residents slowly congealing in their seats"!',
					'News : whole continent undergoing mass exodus of old ladies!',
					'News : old women freeze in place in streets, ooze warm sugary syrup!'
				]));
				if (Game.elderWrath==3) list.push(choose([
					'News : large "flesh highways" scar continent, stretch between various cookie facilities!',
					'News : wrinkled "flesh tendrils" visible from space!',
					'News : remains of "old ladies" found frozen in the middle of growing fleshy structures!', 
					'News : all hope lost as writhing mass of flesh and dough engulfs whole city!',
					'News : nightmare continues as wrinkled acres of flesh expand at alarming speeds!'
				]));
			}
			
			if (Game.season=='fools')
			{
				list=[];
				
				if (Game.cookiesEarned>=1000) list.push(choose([
					'Your office chair is really comfortable.',
					'Business meetings are such a joy!',
					'You\'ve spent the whole day '+choose(['signing contracts','filling out forms','touching base with the team','examining exciting new prospects','playing with your desk toys','getting new nameplates done','attending seminars','videoconferencing','hiring dynamic young executives','meeting new investors','playing minigolf in your office'])+'!',
					'The word of the day is : '+choose(['viral','search engine optimization','blags and wobsites','social networks','web 3.0','logistics','leveraging','branding','proactive','synergizing','market research','demographics','pie charts','blogular','blogulacious','blogastic','authenticity','electronic mail','cellular phones','rap music','cookies, I guess'])+'.',
					'Profit\'s in the air!'
				]));
				if (Game.cookiesEarned>=1000 && Math.random()<0.1) list.push(choose([
					'If you could get some more cookies baked, that\'d be great.',
					'So. About those TPS reports.',
					'Another day in paradise!',
					'Working hard, or hardly working?'
				]));
				
				
				if (Game.TickerN%2==0 || Game.cookiesEarned>=10100000000)
				{
					if (Game.Objects['Grandma'].amount>0) list.push(choose([
					'Your rolling pins are rolling and pinning!',
					'Production is steady!'
					]));
					
					if (Game.Objects['Grandma'].amount>0) list.push(choose([
					'Your ovens are diligently baking more and more cookies.',
					'Your ovens burn a whole batch. Ah well! Still good.'
					]));
					
					if (Game.Objects['Farm'].amount>0) list.push(choose([
					'Scores of cookies come out of your kitchens.',
					'Today, new recruits are joining your kitchens!'
					]));
					
					if (Game.Objects['Factory'].amount>0) list.push(choose([
					'Your factories are producing an unending stream of baked goods.',
					'Your factory workers decide to go on strike!',
					'It\'s safety inspection day in your factories.'
					]));
					
					if (Game.Objects['Mine'].amount>0) list.push(choose([
					'Your secret recipes are kept safely inside a giant underground vault.',
					'Your chefs are working on new secret recipes!'
					]));
					
					if (Game.Objects['Shipment'].amount>0) list.push(choose([
					'Your supermarkets are bustling with happy, hungry customers.',
					'Your supermarkets are full of cookie merch!'
					]));
					
					if (Game.Objects['Alchemy lab'].amount>0) list.push(choose([
					'It\'s a new trading day at the stock exchange, and traders can\'t get enough of your shares!',
					'Your stock is doubling in value by the minute!'
					]));
					
					if (Game.Objects['Portal'].amount>0) list.push(choose([
					'You just released a new TV show episode!',
					'Your cookie-themed TV show is being adapted into a new movie!'
					]));
					
					if (Game.Objects['Time machine'].amount>0) list.push(choose([
					'Your theme parks are doing well - puddles of vomit and roller-coaster casualties are being swept under the rug!',
					'Visitors are stuffing themselves with cookies before riding your roller-coasters. You might want to hire more clean-up crews.'
					]));
					
					if (Game.Objects['Antimatter condenser'].amount>0) list.push(choose([
					'Cookiecoin is officially the most mined digital currency in the history of mankind!',
					'Cookiecoin piracy is rampant!'
					]));
					
					if (Game.Objects['Prism'].amount>0) list.push(choose([
					'Your corporate nations just gained a new parliament!',
					'You\'ve just annexed a new nation!',
					'A new nation joins the grand cookie conglomerate!'
					]));
					
					if (Game.Objects['Chancemaker'].amount>0) list.push(choose([
					'Your intergalactic federation of cookie-sponsored planets reports record-breaking profits!',
					'Billions of unwashed aliens are pleased to join your workforce as you annex their planet!',
					'New toll opened on interstellar highway, funnelling more profits into the cookie economy!'
					]));
					
					if (Game.Objects['Fractal engine'].amount>0) list.push(choose([
					'Your cookie-based political party is doing fantastic in the polls!',
					'New pro-cookie law passes without a hitch thanks to your firm grasp of the political ecosystem!',
					'Your appointed senators are overturning cookie bans left and right!'
					]));
				}
				
				if (Game.cookiesEarned<5) list.push('Such a grand day to begin a new business.');
				else if (Game.cookiesEarned<50) list.push('You\'re baking up a storm!');
				else if (Game.cookiesEarned<100) list.push('You are confident that one day, your cookie company will be the greatest on the market!');
				else if (Game.cookiesEarned<1000) list.push('Business is picking up!');
				else if (Game.cookiesEarned<5000) list.push('You\'re making sales left and right!');
				else if (Game.cookiesEarned<20000) list.push('Everyone wants to buy your cookies!');
				else if (Game.cookiesEarned<50000) list.push('You are now spending most of your day signing contracts!');
				else if (Game.cookiesEarned<500000) list.push('You\'ve been elected "business tycoon of the year"!');
				else if (Game.cookiesEarned<1000000) list.push('Your cookies are a worldwide sensation! Well done, old chap!');
				else if (Game.cookiesEarned<5000000) list.push('Your brand has made its way into popular culture. Children recite your slogans and adults reminisce them fondly!');
				else if (Game.cookiesEarned<1000000000) list.push('A business day like any other. It\'s good to be at the top!');
				else if (Game.cookiesEarned<10100000000) list.push('You look back at your career. It\'s been a fascinating journey, building your baking empire from the ground up.');//only show this for 100 millions
			}
			
			for (var i in Game.customTickers)
			{
				var arr=Game.customTickers[i]();
				for (var ii in arr) list.push(arr[ii]);
			}
			
			Game.TickerAge=Game.fps*10;
			Game.Ticker=choose(list);
			Game.AddToLog(Game.Ticker);
			Game.TickerN++;
			Game.TickerDraw();
		}
		Game.tickerL=l('commentsText');
		Game.tickerBelowL=l('commentsTextBelow');
		Game.tickerCompactL=l('compactCommentsText');
		Game.TickerDraw=function()
		{
			var str='';
			if (Game.Ticker!='') str=Game.Ticker;
			Game.tickerBelowL.innerHTML=Game.tickerL.innerHTML;
			Game.tickerL.innerHTML=str;
			Game.tickerCompactL.innerHTML=str;
			
			Game.tickerBelowL.className='commentsText';
			void Game.tickerBelowL.offsetWidth;
			Game.tickerBelowL.className='commentsText risingAway';
			Game.tickerL.className='commentsText';
			void Game.tickerL.offsetWidth;
			Game.tickerL.className='commentsText risingUp';
		}
		AddEvent(Game.tickerL,'click',function(event){Game.Ticker='';Game.TickerClicks++;if (Game.TickerClicks==50) {Game.Win('小报上瘾');}});
		
		Game.Log=[];
		Game.AddToLog=function(what)
		{
			Game.Log.unshift(what);
			if (Game.Log.length>100) Game.Log.pop();
		}
		
		Game.vanilla=1;
		/*=====================================================================================
		BUILDINGS
		=======================================================================================*/
		Game.last=0;
		
		Game.storeToRefresh=1;
		Game.priceIncrease=1.15;
		Game.buyBulk=1;
		Game.buyMode=1;//1 for buy, -1 for sell
		Game.buyBulkOld=Game.buyBulk;//used to undo changes from holding Shift or Ctrl
		Game.buyBulkShortcut=0;//are we pressing Shift or Ctrl?
		
		Game.Objects=[];
		Game.ObjectsById=[];
		Game.ObjectsN=0;
		Game.BuildingsOwned=0;
		Game.Object=function(name,commonName,desc,icon,iconColumn,art,price,cps,buyFunction)
		{
			this.id=Game.ObjectsN;
			this.name=name;
			this.displayName=this.name;
			commonName=commonName.split('|');
			this.single=commonName[0];
			this.plural=commonName[1];
			this.actionName=commonName[2];
			this.extraName=commonName[3];
			this.extraPlural=commonName[4];
			this.desc=desc;
			this.basePrice=price;
			this.price=this.basePrice;
			this.bulkPrice=this.price;
			this.cps=cps;
			this.baseCps=this.cps;
			this.mouseOn=false;
			this.mousePos=[-100,-100];
			this.productionAchievs=[];
			
			this.n=this.id;
			if (this.n!=0)
			{
				//new automated price and CpS curves
				//this.baseCps=Math.ceil(((this.n*0.5)*Math.pow(this.n*1,this.n*0.9))*10)/10;
				//this.baseCps=Math.ceil((Math.pow(this.n*1,this.n*0.5+2.35))*10)/10;//by a fortunate coincidence, this gives the 3rd, 4th and 5th buildings a CpS of 10, 69 and 420
				this.baseCps=Math.ceil((Math.pow(this.n*1,this.n*0.5+2))*10)/10;//0.45 used to be 0.5
				//this.baseCps=Math.ceil((Math.pow(this.n*1,this.n*0.45+2.10))*10)/10;
				//clamp 14,467,199 to 14,000,000 (there's probably a more elegant way to do that)
				var digits=Math.pow(10,(Math.ceil(Math.log(Math.ceil(this.baseCps))/Math.LN10)))/100;
				this.baseCps=Math.round(this.baseCps/digits)*digits;
				
				this.basePrice=(this.n*1+9+(this.n<5?0:Math.pow(this.n-5,1.75)*5))*Math.pow(10,this.n);
				//this.basePrice=(this.n*2.5+7.5)*Math.pow(10,this.n);
				var digits=Math.pow(10,(Math.ceil(Math.log(Math.ceil(this.basePrice))/Math.LN10)))/100;
				this.basePrice=Math.round(this.basePrice/digits)*digits;
				this.price=this.basePrice;
				this.bulkPrice=this.price;
			}
			
			this.totalCookies=0;
			this.storedCps=0;
			this.storedTotalCps=0;
			this.icon=icon;
			this.iconColumn=iconColumn;
			this.art=art;
			if (art.base)
			{art.pic=art.base+'.png';art.bg=art.base+'Background.png';}
			this.buyFunction=buyFunction;
			this.locked=1;
			this.level=0;
			this.vanilla=Game.vanilla;
			
			this.tieredUpgrades=[];
			this.tieredAchievs=[];
			this.synergies=[];
			
			this.amount=0;
			this.bought=0;
			this.free=0;
			
			this.eachFrame=0;
			
			this.minigameUrl=0;//if this is defined, load the specified script if the building's level is at least 1
			this.minigameName=0;
			this.onMinigame=false;
			this.minigameLoaded=false;
			
			this.switchMinigame=function(on)//change whether we're on the building's minigame
			{
				if (!Game.isMinigameReady(this)) on=false;
				if (on==-1) on=!this.onMinigame;
				this.onMinigame=on;
				if (this.id!=0)
				{
					if (this.onMinigame)
					{
						l('row'+this.id).classList.add('onMinigame');
						//l('rowSpecial'+this.id).style.display='block';
						//l('rowCanvas'+this.id).style.display='none';
						if (this.minigame.onResize) this.minigame.onResize();
					}
					else
					{
						l('row'+this.id).classList.remove('onMinigame');
						//l('rowSpecial'+this.id).style.display='none';
						//l('rowCanvas'+this.id).style.display='block';
					}
				}
				this.refresh();
			}
			
			this.getPrice=function(n)
			{
				var price=this.basePrice*Math.pow(Game.priceIncrease,Math.max(0,this.amount-this.free));
				price=Game.modifyBuildingPrice(this,price);
				return Math.ceil(price);
			}
			this.getSumPrice=function(amount)//return how much it would cost to buy [amount] more of this building
			{
				var price=0;
				for (var i=Math.max(0,this.amount);i<Math.max(0,(this.amount)+amount);i++)
				{
					price+=this.basePrice*Math.pow(Game.priceIncrease,Math.max(0,i-this.free));
				}
				price=Game.modifyBuildingPrice(this,price);
				return Math.ceil(price);
			}
			this.getReverseSumPrice=function(amount)//return how much you'd get from selling [amount] of this building
			{
				var price=0;
				for (var i=Math.max(0,(this.amount)-amount);i<Math.max(0,this.amount);i++)
				{
					price+=this.basePrice*Math.pow(Game.priceIncrease,Math.max(0,i-this.free));
				}
				price=Game.modifyBuildingPrice(this,price);
				price*=this.getSellMultiplier();
				return Math.ceil(price);
			}
			this.getSellMultiplier=function()
			{
				var giveBack=0.25;
				if (Game.hasAura('Earth Shatterer')) giveBack=0.5;
				return giveBack;
			}
			
			this.buy=function(amount)
			{
				if (Game.buyMode==-1) {this.sell(Game.buyBulk,1);return 0;}
				var success=0;
				var moni=0;
				var bought=0;
				if (!amount) amount=Game.buyBulk;
				if (amount==-1) amount=1000;
				for (var i=0;i<amount;i++)
				{
					var price=this.getPrice();
					if (Game.cookies>=price)
					{
						bought++;
						moni+=price;
						Game.Spend(price);
						this.amount++;
						this.bought++;
						price=this.getPrice();
						this.price=price;
						if (this.buyFunction) this.buyFunction();
						Game.recalculateGains=1;
						if (this.amount==1 && this.id!=0) l('row'+this.id).classList.add('enabled');
						Game.BuildingsOwned++;
						success=1;
					}
				}
				if (success) {PlaySound('snd/buy'+choose([1,2,3,4])+'.mp3',0.75);this.refresh();}
				//if (moni>0 && amount>1) Game.Notify(this.name,'Bought <b>'+bought+'</b> for '+Beautify(moni)+' cookies','',2);
			}
			this.sell=function(amount,bypass)
			{
				var success=0;
				var moni=0;
				var sold=0;
				if (amount==-1) amount=this.amount;
				if (!amount) amount=Game.buyBulk;
				for (var i=0;i<amount;i++)
				{
					var price=this.getPrice();
					var giveBack=this.getSellMultiplier();
					price=Math.floor(price*giveBack);
					if (this.amount>0)
					{
						sold++;
						moni+=price;
						Game.cookies+=price;
						Game.cookiesEarned=Math.max(Game.cookies,Game.cookiesEarned);//this is to avoid players getting the cheater achievement when selling buildings that have a higher price than they used to
						this.amount--;
						price=this.getPrice();
						this.price=price;
						if (this.sellFunction) this.sellFunction();
						Game.recalculateGains=1;
						if (this.amount==0 && this.id!=0) l('row'+this.id).classList.remove('enabled');
						Game.BuildingsOwned--;
						success=1;
					}
				}
				if (success && Game.hasGod)
				{
					var godLvl=Game.hasGod('ruin');
					var old=Game.hasBuff('破坏');
					if (old)
					{
						if (godLvl==1) old.multClick+=sold*0.01;
						else if (godLvl==2) old.multClick+=sold*0.005;
						else if (godLvl==3) old.multClick+=sold*0.0025;
					}
					else
					{
						if (godLvl==1) Game.gainBuff('devastation',10,1+sold*0.01);
						else if (godLvl==2) Game.gainBuff('devastation',10,1+sold*0.005);
						else if (godLvl==3) Game.gainBuff('devastation',10,1+sold*0.0025);
					}
				}
				if (success) {PlaySound('snd/sell'+choose([1,2,3,4])+'.mp3',0.75);this.refresh();}
				//if (moni>0) Game.Notify(this.name,'Sold <b>'+sold+'</b> for '+Beautify(moni)+' cookies','',2);
			}
			this.sacrifice=function(amount)//sell without getting back any money
			{
				var success=0;
				//var moni=0;
				var sold=0;
				if (amount==-1) amount=this.amount;
				if (!amount) amount=1;
				for (var i=0;i<amount;i++)
				{
					var price=this.getPrice();
					price=Math.floor(price*0.5);
					if (this.amount>0)
					{
						sold++;
						//moni+=price;
						//Game.cookies+=price;
						//Game.cookiesEarned=Math.max(Game.cookies,Game.cookiesEarned);
						this.amount--;
						price=this.getPrice();
						this.price=price;
						if (this.sellFunction) this.sellFunction();
						Game.recalculateGains=1;
						if (this.amount==0 && this.id!=0) l('row'+this.id).classList.remove('enabled');
						Game.BuildingsOwned--;
						success=1;
					}
				}
				if (success) {this.refresh();}
				//if (moni>0) Game.Notify(this.name,'Sold <b>'+sold+'</b> for '+Beautify(moni)+' cookies','',2);
			}
			this.buyFree=function(amount)//unlike getFree, this still increases the price
			{
				for (var i=0;i<amount;i++)
				{
					if (Game.cookies>=price)
					{
						this.amount++;
						this.bought++;
						this.price=this.getPrice();
						Game.recalculateGains=1;
						if (this.amount==1 && this.id!=0) l('row'+this.id).classList.add('enabled');
						Game.BuildingsOwned++;
					}
				}
				this.refresh();
			}
			this.getFree=function(amount)//get X of this building for free, with the price behaving as if you still didn't have them
			{
				this.amount+=amount;
				this.bought+=amount;
				this.free+=amount;
				Game.BuildingsOwned+=amount;
				this.refresh();
			}
			this.getFreeRanks=function(amount)//this building's price behaves as if you had X less of it
			{
				this.free+=amount;
				this.refresh();
			}
			
			this.tooltip=function()
			{
				var me=this;
				var desc=me.desc;
				var name=me.name;
				if (Game.season=='fools')
				{
					if (!Game.foolObjects[me.name])
					{
						name=Game.foolObjects['Unknown'].name;
						desc=Game.foolObjects['Unknown'].desc;
					}
					else
					{
						name=Game.foolObjects[me.name].name;
						desc=Game.foolObjects[me.name].desc;
					}
				}
				var icon=[me.iconColumn,0];
				if (me.locked)
				{
					name='???';
					desc='';
					icon=[0,7];
				}
				//if (l('rowInfo'+me.id) && Game.drawT%10==0) l('rowInfoContent'+me.id).innerHTML='&bull; '+me.amount+' '+(me.amount==1?me.single:me.plural)+'<br>&bull; producing '+Beautify(me.storedTotalCps,1)+' '+(me.storedTotalCps==1?'cookie':'cookies')+' per second<br>&bull; total : '+Beautify(me.totalCookies)+' '+(Math.floor(me.totalCookies)==1?'cookie':'cookies')+' '+me.actionName;
<<<<<<< HEAD:main.js
				return '<div style="min-width:350px;padding:8px;"><div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;'+(icon[2]?'background-image:url('+icon[2]+');':'')+'background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div><div style="float:right;"><span class="price">'+Beautify(Math.round(me.price))+'</span></div><div class="name">'+cndisplayname(name)+'</div>'+'<small>[拥有 : '+me.amount+'</small>]'+(me.free>0?' <small>[空闲 : '+me.free+'</small>!]':'')+
				'<div class="line"></div><div class="description">'+desc+'</div>'+
				(me.totalCookies>0?(
					'<div class="line"></div><div class="data">'+
					(me.amount>0?'&bull; 每个 '+cnsigle(me.single)+' 每秒生产 <b>'+Beautify((me.storedTotalCps/me.amount)*Game.globalCpsMult,1)+'</b> '+((me.storedTotalCps/me.amount)*Game.globalCpsMult==1?'饼干':'饼干')+'<br>':'')+
					'&bull; '+me.amount+' '+(me.amount==1?cnsigle(me.single):cnsigle(me.plural))+' 每秒生产 <b>'+Beautify(me.storedTotalCps*Game.globalCpsMult,1)+'</b> '+(me.storedTotalCps*Game.globalCpsMult==1?'饼干':'饼干')+' (<b>占生产总量的 '+Beautify(Game.cookiesPs>0?((me.amount>0?((me.storedTotalCps*Game.globalCpsMult)/Game.cookiesPs):0)*100):0,1)+'%</b>)<br>'+
					'&bull; 到目前为止，得到 <b>'+Beautify(me.totalCookies)+'</b> '+(Math.floor(me.totalCookies)==1?'饼干':'饼干')+' 通过 '+cnactionname(me.actionName)+'</div>'
=======
				
				var canBuy=false;
				var price=me.bulkPrice;
				if ((Game.buyMode==1 && Game.cookies>=price) || (Game.buyMode==-1 && me.amount>0)) canBuy=true;
				
				var synergiesStr='';
				//note : might not be entirely accurate, math may need checking
				if (me.amount>0)
				{
					var synergiesWith={};
					var synergyBoost=0;
					
					if (me.name=='Grandma')
					{
						for (var i in Game.GrandmaSynergies)
						{
							if (Game.Has(Game.GrandmaSynergies[i]))
							{
								var other=Game.Upgrades[Game.GrandmaSynergies[i]].buildingTie;
								var mult=me.amount*0.01*(1/(other.id-1));
								var boost=(other.storedTotalCps*Game.globalCpsMult)-(other.storedTotalCps*Game.globalCpsMult)/(1+mult);
								synergyBoost+=boost;
								if (!synergiesWith[other.plural]) synergiesWith[other.plural]=0;
								synergiesWith[other.plural]+=mult;
							}
						}
					}
					else if (me.name=='Portal' && Game.Has('Elder Pact'))
					{
						var other=Game.Objects['Grandma'];
						var boost=(me.amount*0.05*other.amount)*Game.globalCpsMult;
						synergyBoost+=boost;
						if (!synergiesWith[other.plural]) synergiesWith[other.plural]=0;
						synergiesWith[other.plural]+=boost/(other.storedTotalCps*Game.globalCpsMult);
					}
					
					for (var i in me.synergies)
					{
						var it=me.synergies[i];
						if (Game.Has(it.name))
						{
							var weight=0.05;
							var other=it.buildingTie1;
							if (me==it.buildingTie1) {weight=0.001;other=it.buildingTie2;}
							var boost=(other.storedTotalCps*Game.globalCpsMult)-(other.storedTotalCps*Game.globalCpsMult)/(1+me.amount*weight);
							synergyBoost+=boost;
							if (!synergiesWith[other.plural]) synergiesWith[other.plural]=0;
							synergiesWith[other.plural]+=me.amount*weight;
							//synergiesStr+='Synergy with '+other.name+'; we boost it by '+Beautify((me.amount*weight)*100,1)+'%, producing '+Beautify(boost)+' CpS. My synergy boost is now '+Beautify((synergyBoost/Game.cookiesPs)*100,1)+'%.<br>';
						}
					}
					if (synergyBoost>0)
					{
						for (var i in synergiesWith)
						{
							if (synergiesStr!='') synergiesStr+=', ';
							synergiesStr+=i+' +'+Beautify(synergiesWith[i]*100,1)+'%';
						}
						synergiesStr='...plus <b>'+Beautify(synergyBoost,1)+'</b> cookies through synergies with other buildings ('+synergiesStr+'; <b>'+Beautify((synergyBoost/Game.cookiesPs)*100,1)+'%</b> of total CpS)';
					}
				}
				
				return '<div style="min-width:350px;padding:8px;"><div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;'+(icon[2]?'background-image:url('+icon[2]+');':'')+'background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div><div style="float:right;text-align:right;"><span class="price'+(canBuy?'':' disabled')+'">'+Beautify(Math.round(price))+'</span>'+Game.costDetails(price)+'</div><div class="name">'+name+'</div>'+'<small>[owned : '+me.amount+'</small>]'+(me.free>0?' <small>[free : '+me.free+'</small>!]':'')+
				'<div class="line"></div><div class="description">'+desc+'</div>'+
				(me.totalCookies>0?(
					'<div class="line"></div><div class="data">'+
					(me.amount>0?'&bull; each '+me.single+' produces <b>'+Beautify((me.storedTotalCps/me.amount)*Game.globalCpsMult,1)+'</b> '+((me.storedTotalCps/me.amount)*Game.globalCpsMult==1?'cookie':'cookies')+' per second<br>':'')+
					'&bull; '+me.amount+' '+(me.amount==1?me.single:me.plural)+' producing <b>'+Beautify(me.storedTotalCps*Game.globalCpsMult,1)+'</b> '+(me.storedTotalCps*Game.globalCpsMult==1?'cookie':'cookies')+' per second (<b>'+Beautify(Game.cookiesPs>0?((me.amount>0?((me.storedTotalCps*Game.globalCpsMult)/Game.cookiesPs):0)*100):0,1)+'%</b> of total CpS)<br>'+
					(synergiesStr?('&bull; '+synergiesStr+'<br>'):'')+
					'&bull; <b>'+Beautify(me.totalCookies)+'</b> '+(Math.floor(me.totalCookies)==1?'cookie':'cookies')+' '+me.actionName+' so far</div>'
>>>>>>> 20180919:main.js
				):'')+
				'</div>';
			}
			this.levelTooltip=function()
			{
				var me=this;
				return '<div style="width:280px;padding:8px;"><b>等级 '+Beautify(me.level)+' '+cnsigle(me.plural)+'</b><div class="line"></div>'+(me.level==1?me.extraName:me.extraPlural).replace('[X]',Beautify(me.level))+' 给予 <b>+'+Beautify(me.level)+'% '+cndisplayname(me.name)+' 饼干每秒总产量</b>.<div class="line"></div>点击升级消耗 <span class="price lump'+(Game.lumps>=me.level+1?'':' 禁用')+'">'+Beautify(me.level+1)+' 糖块'+(me.level==0?'':'s')+'</span>.'+((me.level==0 && me.minigameUrl)?'<div class="line"></div><b>这个建筑升级解锁一个迷你游戏。</b>':'')+'</div>';
			}
			/*this.levelUp=function()
			{
				var me=this;
				if (Game.lumps<me.level+1) return 0;
				Game.lumps-=me.level+1;
				me.level+=1;
				if (me.level>=10 && me.levelAchiev10) Game.Win(me.levelAchiev10.name);
				PlaySound('snd/upgrade.mp3',0.6);
				Game.LoadMinigames();
				me.refresh();
				if (l('productLevel'+me.id)){var rect=l('productLevel'+me.id).getBoundingClientRect();Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24);}
				Game.recalculateGains=1;
				if (me.minigame && me.minigame.onLevel) me.minigame.onLevel(me.level);
			}*/
			this.levelUp=function(me){
				return function(){Game.spendLump(me.level+1,'level up your '+me.plural,function()
				{
					me.level+=1;
					if (me.level>=10 && me.levelAchiev10) Game.Win(me.levelAchiev10.name);
					PlaySound('snd/upgrade.mp3',0.6);
					Game.LoadMinigames();
					me.refresh();
					if (l('productLevel'+me.id)){var rect=l('productLevel'+me.id).getBoundingClientRect();Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24);}
					if (me.minigame && me.minigame.onLevel) me.minigame.onLevel(me.level);
				})();};
			}(this);
			
			this.refresh=function()//show/hide the building display based on its amount, and redraw it
			{
				this.price=this.getPrice();
				if (Game.buyMode==1) this.bulkPrice=this.getSumPrice(Game.buyBulk);
				else if (Game.buyMode==-1 && Game.buyBulk==-1) this.bulkPrice=this.getReverseSumPrice(1000);
				else if (Game.buyMode==-1) this.bulkPrice=this.getReverseSumPrice(Game.buyBulk);
				this.rebuild();
				if (this.amount==0 && this.id!=0) l('row'+this.id).classList.remove('enabled');
				else if (this.amount>0 && this.id!=0) l('row'+this.id).classList.add('enabled');
				if (this.muted>0 && this.id!=0) {l('row'+this.id).classList.add('muted');l('mutedProduct'+this.id).style.display='inline-block';}
				else if (this.id!=0) {l('row'+this.id).classList.remove('muted');l('mutedProduct'+this.id).style.display='none';}
				//if (!this.onMinigame && !this.muted) {}
				//else this.pics=[];
			}
			this.rebuild=function()
			{
				var me=this;
				//var classes='product';
				var price=me.bulkPrice;
				/*if (Game.cookiesEarned>=me.basePrice || me.bought>0) {classes+=' unlocked';me.locked=0;} else {classes+=' locked';me.locked=1;}
				if (Game.cookies>=price) classes+=' enabled'; else classes+=' disabled';
				if (me.l.className.indexOf('toggledOff')!=-1) classes+=' toggledOff';
				*/
				var icon=[0,me.icon];
				var iconOff=[1,me.icon];
				if (me.iconFunc) icon=me.iconFunc();
				
				var desc=me.desc;
				var name=me.name;
				var displayName=me.displayName;
				if (Game.season=='fools')
				{
					if (!Game.foolObjects[me.name])
					{
						icon=[2,0];
						iconOff=[3,0];
						name=Game.foolObjects['Unknown'].name;
						desc=Game.foolObjects['Unknown'].desc;
					}
					else
					{
						icon=[2,me.icon];
						iconOff=[3,me.icon];
						name=Game.foolObjects[me.name].name;
						desc=Game.foolObjects[me.name].desc;
					}
					displayName=name;
					if (name.length>16) displayName='<span style="font-size:75%;">'+name+'</span>';
				}
				icon=[icon[0]*64,icon[1]*64];
				iconOff=[iconOff[0]*64,iconOff[1]*64];
				
				//me.l.className=classes;
				//l('productIcon'+me.id).style.backgroundImage='url(img/'+icon+')';
				l('productIcon'+me.id).style.backgroundPosition='-'+icon[0]+'px -'+icon[1]+'px';
				//l('productIconOff'+me.id).style.backgroundImage='url(img/'+iconOff+')';
				l('productIconOff'+me.id).style.backgroundPosition='-'+iconOff[0]+'px -'+iconOff[1]+'px';
				l('productName'+me.id).innerHTML=cndisplayname(displayName);
				l('productOwned'+me.id).innerHTML=me.amount?me.amount:'';
				l('productPrice'+me.id).innerHTML=Beautify(Math.round(price));
				l('productPriceMult'+me.id).innerHTML=(Game.buyBulk>1)?('x'+Game.buyBulk+' '):'';
				l('productLevel'+me.id).innerHTML='等级 '+Beautify(me.level);
				if (Game.isMinigameReady(me) && Game.ascensionMode!=1)
				{
					l('productMinigameButton'+me.id).style.display='block';
					if (!me.onMinigame) l('productMinigameButton'+me.id).innerHTML='打开'+me.minigameName;
					else l('productMinigameButton'+me.id).innerHTML='关闭'+me.minigameName;
				}
				else l('productMinigameButton'+me.id).style.display='none';
			}
			this.muted=false;
			this.mute=function(val)
			{
				if (this.id==0) return false;
				this.muted=val;
				if (val) {l('productMute'+this.id).classList.add('on');l('row'+this.id).classList.add('muted');l('mutedProduct'+this.id).style.display='inline-block';}
				else {l('productMute'+this.id).classList.remove('on');l('row'+this.id).classList.remove('muted');l('mutedProduct'+this.id).style.display='none';}
			};
			
			this.draw=function(){};
			
			if (this.id==0)
			{
				var str='<div class="productButtons">';
					str+='<div id="productLevel'+this.id+'" class="productButton productLevel lumpsOnly" onclick="Game.ObjectsById['+this.id+'].levelUp()" '+Game.getDynamicTooltip('Game.ObjectsById['+this.id+'].levelTooltip','this')+'></div>';
					str+='<div id="productMinigameButton'+this.id+'" class="productButton productMinigameButton lumpsOnly" onclick="Game.ObjectsById['+this.id+'].switchMinigame(-1);PlaySound(Game.ObjectsById['+this.id+'].onMinigame?\'snd/clickOn.mp3\':\'snd/clickOff.mp3\');"></div>';
				str+='</div>';
				l('sectionLeftExtra').innerHTML=l('sectionLeftExtra').innerHTML+str;
			}
			else//draw it
			{
				var str='<div class="row" id="row'+this.id+'"><div class="separatorBottom"></div>';
				str+='<div class="productButtons">';
					str+='<div id="productLevel'+this.id+'" class="productButton productLevel lumpsOnly" onclick="Game.ObjectsById['+this.id+'].levelUp()" '+Game.getDynamicTooltip('Game.ObjectsById['+this.id+'].levelTooltip','this')+'></div>';
					str+='<div id="productMinigameButton'+this.id+'" class="productButton productMinigameButton lumpsOnly" onclick="Game.ObjectsById['+this.id+'].switchMinigame(-1);PlaySound(Game.ObjectsById['+this.id+'].onMinigame?\'snd/clickOn.mp3\':\'snd/clickOff.mp3\');"></div>';
<<<<<<< HEAD:main.js
					str+='<div class="productButton productMute" '+Game.getTooltip('<div style="width:150px;text-align:center;font-size:11px;"><b>收缩</b><br>(最小化这个建筑)</div>')+' onclick="Game.ObjectsById['+this.id+'].mute(1);PlaySound(Game.ObjectsById['+this.id+'].muted?\'snd/clickOff.mp3\':\'snd/clickOn.mp3\');" id="productMute'+this.id+'">收缩</div>';
=======
					str+='<div class="productButton productMute" '+Game.getTooltip('<div style="width:150px;text-align:center;font-size:11px;"><b>Mute</b><br>(Minimize this building)</div>','this')+' onclick="Game.ObjectsById['+this.id+'].mute(1);PlaySound(Game.ObjectsById['+this.id+'].muted?\'snd/clickOff.mp3\':\'snd/clickOn.mp3\');" id="productMute'+this.id+'">Mute</div>';
>>>>>>> 20180919:main.js
				str+='</div>';
				str+='<canvas class="rowCanvas" id="rowCanvas'+this.id+'"></canvas>';
				str+='<div class="rowSpecial" id="rowSpecial'+this.id+'"></div>';
				str+='</div>';
				l('rows').innerHTML=l('rows').innerHTML+str;
				
				//building canvas
				this.pics=[];
				
				this.toResize=true;
				this.redraw=function()
				{
					var me=this;
					me.pics=[];
				}
				this.draw=function()
				{
					if (this.amount<=0) return false;
						this.canvas.width=this.canvas.clientWidth;
						this.canvas.height=this.canvas.clientHeight;
						//console.log(this.canvas.width);
					if (this.toResize)
					{
						this.canvas.width=this.canvas.clientWidth;
						this.canvas.height=this.canvas.clientHeight;
						this.toResize=false;
					}
					var ctx=this.ctx;
					//clear
					//ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
					ctx.globalAlpha=1;
					
					//pic : a loaded picture or a function returning a loaded picture
					//bg : a loaded picture or a function returning a loaded picture - tiled as the background, 128x128
					//xV : the pictures will have a random horizontal shift by this many pixels
					//yV : the pictures will have a random vertical shift by this many pixels
					//w : how many pixels between each picture (or row of pictures)
					//x : horizontal offset
					//y : vertical offset (+32)
					//rows : if >1, arrange the pictures in rows containing this many pictures
					
					var pic=this.art.pic;
					var bg=this.art.bg;
					var xV=this.art.xV||0;
					var yV=this.art.yV||0;
					var w=this.art.w||48;
					var h=this.art.h||48;
					var offX=this.art.x||0;
					var offY=this.art.y||0;
					var rows=this.art.rows||1;

					if (typeof(bg)=='string') ctx.fillPattern(Pic(this.art.bg),0,0,this.canvas.width,this.canvas.height,128,128);
					else bg(this,ctx);
					/*
					ctx.globalAlpha=0.5;
					if (typeof(bg)=='string')//test
					{
						ctx.fillPattern(Pic(this.art.bg),-128+Game.T%128,0,this.canvas.width+128,this.canvas.height,128,128);
						ctx.fillPattern(Pic(this.art.bg),-128+Math.floor(Game.T/2)%128,-128+Math.floor(Game.T/2)%128,this.canvas.width+128,this.canvas.height+128,128,128);
					}
					ctx.globalAlpha=1;
					*/
					var maxI=Math.floor(this.canvas.width/(w/rows)+1);
					var iT=Math.min(this.amount,maxI);
					var i=this.pics.length;
					
					
					var x=0;
					var y=0;
					var added=0;
					if (i!=iT)
					{
						//for (var iter=0;iter<3;iter++)
						//{
							while (i<iT)
							//if (i<iT)
							{
								Math.seedrandom(Game.seed+' '+this.id+' '+i);
								if (rows!=1)
								{
									x=Math.floor(i/rows)*w+((i%rows)/rows)*w+Math.floor((Math.random()-0.5)*xV)+offX;
									y=32+Math.floor((Math.random()-0.5)*yV)+((-rows/2)*32/2+(i%rows)*32/2)+offY;
								}
								else
								{
									x=i*w+Math.floor((Math.random()-0.5)*xV)+offX;
									y=32+Math.floor((Math.random()-0.5)*yV)+offY;
								}
								var usedPic=(typeof(pic)=='string'?pic:pic(this,i));
								this.pics.push({x:Math.floor(x),y:Math.floor(y),z:y,pic:usedPic,id:i});
								i++;
								added++;
							}
							while (i>iT)
							//else if (i>iT)
							{
								this.pics.sort(Game.sortSpritesById);
								this.pics.pop();
								i--;
								added--;
							}
						//}
						this.pics.sort(Game.sortSprites);
					}
					
					var len=this.pics.length;
					
					if (this.mouseOn)
					{
						var selected=-1;
						//mouse detection only fits grandma sprites for now
						var marginW=-18;
						var marginH=-10;
						for (var i=0;i<len;i++)
						{
							var pic=this.pics[i];
							if (this.mousePos[0]>=pic.x-marginW && this.mousePos[0]<pic.x+64+marginW && this.mousePos[1]>=pic.y-marginH && this.mousePos[1]<pic.y+64+marginH) selected=i;
						}
					}
					
					Math.seedrandom();
					
					for (var i=0;i<len;i++)
					{
						var pic=this.pics[i];
						if (selected==i && this.name=='Grandma')
						{
							ctx.font='14px Merriweather';
							ctx.textAlign='center';
							Math.seedrandom(Game.seed+' '+pic.id/*+' '+pic.id*/);//(Game.seed+' '+pic.id+' '+pic.x+' '+pic.y);
							var years=((Date.now()-new Date(2013,7,8))/(1000*60*60*24*365))+Math.random();//the grandmas age with the game
							var name=choose(Game.grandmaNames);
							var custom=false;
							if (Game.prefs.customGrandmas && Game.customGrandmaNames.length>0 && Math.random()<0.2) {name=choose(Game.customGrandmaNames);custom=true;}
							var text=name+', age '+Beautify(Math.floor(70+Math.random()*30+years+this.level));
							var width=ctx.measureText(text).width+12;
							var x=Math.max(0,Math.min(pic.x+32-width/2+Math.random()*32-16,this.canvas.width-width));
							var y=4+Math.random()*8-4;
							Math.seedrandom();
							ctx.fillStyle='#000';
							ctx.strokeStyle='#000';
							ctx.lineWidth=8;
							ctx.globalAlpha=0.75;
							ctx.beginPath();
							ctx.moveTo(pic.x+32,pic.y+32);
							ctx.lineTo(Math.floor(x+width/2),Math.floor(y+20));
							ctx.stroke();
							ctx.fillRect(Math.floor(x),Math.floor(y),Math.floor(width),24);
							ctx.globalAlpha=1;
							if (custom) ctx.fillStyle='#fff';
							else ctx.fillStyle='rgba(255,255,255,0.7)';
							ctx.fillText(text,Math.floor(x+width/2),Math.floor(y+16));
							
							ctx.drawImage(Pic(pic.pic),Math.floor(pic.x+Math.random()*4-2),Math.floor(pic.y+Math.random()*4-2));
						}
						else ctx.drawImage(Pic(pic.pic),pic.x,pic.y);
					}
					
					/*
					var picX=this.id;
					var picY=12;
					var w=1;
					var h=1;
					var w=Math.abs(Math.cos(Game.T*0.2+this.id*2-0.3))*0.2+0.8;
					var h=Math.abs(Math.sin(Game.T*0.2+this.id*2))*0.3+0.7;
					var x=64+Math.cos(Game.T*0.19+this.id*2)*8-24*w;
					var y=128-Math.abs(Math.pow(Math.sin(Game.T*0.2+this.id*2),5)*16)-48*h;
					ctx.drawImage(Pic('icons.png'),picX*48,picY*48,48,48,Math.floor(x),Math.floor(y),48*w,48*h);
					*/
				}
			}
			
			Game.last=this;
			Game.Objects[this.name]=this;
			Game.ObjectsById[this.id]=this;
			Game.ObjectsN++;
			return this;
		}
		
		Game.DrawBuildings=function()//draw building displays with canvas
		{
			if (Game.drawT%3==0)
			{
				for (var i in Game.Objects)
				{
					var me=Game.Objects[i];
					if (me.id>0 && !me.onMinigame && !me.muted) me.draw();
					else me.pics=[];
				}
			}
		}
		
		Game.sortSprites=function(a,b)
		{
			if (a.z>b.z) return 1;
			else if (a.z<b.z) return -1;
			else return 0;
		}
		Game.sortSpritesById=function(a,b)
		{
			if (a.id>b.id) return 1;
			else if (a.id<b.id) return -1;
			else return 0;
		}
		
		Game.modifyBuildingPrice=function(building,price)
		{
			if (Game.Has('季节储蓄')) price*=0.99;
			if (Game.Has('圣诞老人的统治')) price*=0.99;
			if (Game.Has('法贝热彩蛋')) price*=0.99;
			if (Game.Has('神圣折扣')) price*=0.99;
			if (Game.hasAura('激烈囤积')) price*=0.98;
			if (Game.hasBuff('一切都得走')) price*=0.95;
			if (Game.hasBuff('狡猾的小妖精')) price*=0.98;
			if (Game.hasBuff('肮脏的妖精')) price*=1.02;
			price*=Game.eff('buildingCost');
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('creation');
				if (godLvl==1) price*=0.93;
				else if (godLvl==2) price*=0.95;
				else if (godLvl==3) price*=0.98;
			}
			return price;
		}
		
		Game.storeBulkButton=function(id)
		{
			if (id==0) Game.buyMode=1;
			else if (id==1) Game.buyMode=-1;
			else if (id==2) Game.buyBulk=1;
			else if (id==3) Game.buyBulk=10;
			else if (id==4) Game.buyBulk=100;
			else if (id==5) Game.buyBulk=-1;
			
			if (Game.buyMode==1 && Game.buyBulk==-1) Game.buyBulk=100;
			
			if (Game.buyMode==1) l('storeBulkBuy').className='storePreButton storeBulkMode selected'; else l('storeBulkBuy').className='storePreButton storeBulkMode';
			if (Game.buyMode==-1) l('storeBulkSell').className='storePreButton storeBulkMode selected'; else l('storeBulkSell').className='storePreButton storeBulkMode';
			
			if (Game.buyBulk==1) l('storeBulk1').className='storePreButton storeBulkAmount selected'; else l('storeBulk1').className='storePreButton storeBulkAmount';
			if (Game.buyBulk==10) l('storeBulk10').className='storePreButton storeBulkAmount selected'; else l('storeBulk10').className='storePreButton storeBulkAmount';
			if (Game.buyBulk==100) l('storeBulk100').className='storePreButton storeBulkAmount selected'; else l('storeBulk100').className='storePreButton storeBulkAmount';
			if (Game.buyBulk==-1) l('storeBulkMax').className='storePreButton storeBulkAmount selected'; else l('storeBulkMax').className='storePreButton storeBulkAmount';
			
			if (Game.buyMode==1)
			{
				l('storeBulkMax').style.visibility='hidden';
				l('products').className='storeSection';
			}
			else
			{
				l('storeBulkMax').style.visibility='visible';
				l('products').className='storeSection selling';
			}
			
			Game.storeToRefresh=1;
			if (id!=-1) PlaySound('snd/tick.mp3');
		}
		Game.BuildStore=function()//create the DOM for the store's buildings
		{
			var str='';
			str+='<div id="storeBulk" class="storePre" '+Game.getTooltip(
							'<div style="padding:8px;min-width:200px;text-align:center;font-size:11px;">你可以按 <b>Ctrl</b> 键，一次批量购买或出售 <b>10</b> 建筑。 或者 <b>Shift</b> 建，一次批量购买或出售<b>100</b>个。</div>'
							,'store')+
				'>'+
				'<div id="storeBulkBuy" class="storePreButton storeBulkMode" '+Game.clickStr+'="Game.storeBulkButton(0);">购买</div>'+
				'<div id="storeBulkSell" class="storePreButton storeBulkMode" '+Game.clickStr+'="Game.storeBulkButton(1);">出售</div>'+
				'<div id="storeBulk1" class="storePreButton storeBulkAmount" '+Game.clickStr+'="Game.storeBulkButton(2);">1</div>'+
				'<div id="storeBulk10" class="storePreButton storeBulkAmount" '+Game.clickStr+'="Game.storeBulkButton(3);">10</div>'+
				'<div id="storeBulk100" class="storePreButton storeBulkAmount" '+Game.clickStr+'="Game.storeBulkButton(4);">100</div>'+
				'<div id="storeBulkMax" class="storePreButton storeBulkAmount" '+Game.clickStr+'="Game.storeBulkButton(5);">全部</div>'+
				'</div>';
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				str+='<div class="product toggledOff" '+Game.getDynamicTooltip('Game.ObjectsById['+me.id+'].tooltip','store')+' id="product'+me.id+'"><div class="icon off" id="productIconOff'+me.id+'" style=""></div><div class="icon" id="productIcon'+me.id+'" style=""></div><div class="content"><div class="lockedTitle">???</div><div class="title" id="productName'+me.id+'"></div><span class="priceMult" id="productPriceMult'+me.id+'"></span><span class="price" id="productPrice'+me.id+'"></span><div class="title owned" id="productOwned'+me.id+'"></div></div>'+
				/*'<div class="buySell"><div style="left:0px;" id="buttonBuy10-'+me.id+'">Buy 10</div><div style="left:100px;" id="buttonSell-'+me.id+'">Sell 1</div><div style="left:200px;" id="buttonSellAll-'+me.id+'">Sell all</div></div>'+*/
				'</div>';
			}
			l('products').innerHTML=str;
			
			Game.storeBulkButton(-1);
			
			var SellAllPrompt=function(id)
			{
				return function(id){Game.Prompt('<div class="block">你真的想卖掉你的 '+Game.ObjectsById[id].amount+' '+(Game.ObjectsById[id].amount==1?Game.ObjectsById[id].single:Game.ObjectsById[id].plural)+'?</div>',[['是的','Game.ObjectsById['+id+'].sell(-1);Game.ClosePrompt();'],['取消','Game.ClosePrompt();']]);}(id);
			}
			
			Game.ClickProduct=function(what)
			{
				Game.ObjectsById[what].buy();
			}
			
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				me.l=l('product'+me.id);
				
				//these are a bit messy but ah well
				if (!Game.touchEvents)
				{
					AddEvent(me.l,'click',function(what){return function(){Game.ClickProduct(what);};}(me.id));
				}
				else
				{
					AddEvent(me.l,'touchend',function(what){return function(){Game.ClickProduct(what);};}(me.id));
				}
			}
		}
		
		Game.RefreshStore=function()//refresh the store's buildings
		{
			for (var i in Game.Objects)
			{
				Game.Objects[i].refresh();
			}
			Game.storeToRefresh=0;
		}
		
		Game.ComputeCps=function(base,mult,bonus)
		{
			if (!bonus) bonus=0;
			return ((base)*(Math.pow(2,mult))+bonus);
		}
		
		Game.isMinigameReady=function(me)
		{return (me.minigameUrl && me.minigameLoaded && me.level>0);}
		Game.scriptBindings=[];
		Game.LoadMinigames=function()//load scripts for each minigame
		{
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				if (me.minigameUrl && me.level>0 && !me.minigameLoaded && !me.minigameLoading && !l('minigameScript-'+me.id))
				{
					me.minigameLoading=true;
					//we're only loading the minigame scripts that aren't loaded yet and which have enough building level
					//we call this function on building level up and on load
					//console.log('Loading script '+me.minigameUrl+'...');
					setTimeout(function(me){return function(){
						var script=document.createElement('script');
						script.id='minigameScript-'+me.id;
						Game.scriptBindings['minigameScript-'+me.id]=me;
						script.setAttribute('src',me.minigameUrl+'?r='+Game.version);
						script.onload=function(me,script){return function(){
							if (!me.minigameLoaded) Game.scriptLoaded(me,script);
						}}(me,'minigameScript-'+me.id);
						document.head.appendChild(script);
					}}(me),10);
				}
			}
		}
		Game.scriptLoaded=function(who,script)
		{
			who.minigameLoading=false;
			who.minigameLoaded=true;
			who.refresh();
			who.minigame.launch();
			if (who.minigameSave) {who.minigame.reset(true);who.minigame.load(who.minigameSave);who.minigameSave=0;}
		}
		
		Game.magicCpS=function(what)
		{
			/*
			if (Game.Objects[what].amount>=250)
			{
				//this makes buildings give 1% more cookies for every building over 250.
				//this turns out to be rather stupidly overpowered.
				var n=Game.Objects[what].amount-250;
				return 1+Math.pow(1.01,n);
			}
			else return 1;
			*/
			return 1;
		}
		
		//define objects
<<<<<<< HEAD:main.js
		new Game.Object('Cursor','cursor|cursors|点击|[X] 额外的手指|[X] 额外的手指','每隔10秒自动点击一次',0,0,{},15,function(){
=======
		new Game.Object('Cursor','cursor|cursors|clicked|[X] extra finger|[X] extra fingers','Autoclicks once every 10 seconds.',0,0,{},15,function(me){
>>>>>>> 20180919:main.js
			var add=0;
			if (Game.Has('千手指')) add+=		0.1;
			if (Game.Has('百万手指')) add+=		0.5;
			if (Game.Has('十亿手指')) add+=		5;
			if (Game.Has('万亿手指')) add+=		50;
			if (Game.Has('千万亿手指')) add+=	500;
			if (Game.Has('万兆手指')) add+=	5000;
			if (Game.Has('百万的六乘方手指')) add+=	50000;
			if (Game.Has('巨量的手指')) add+=	500000;
			if (Game.Has('千的九次方手指')) add+=	5000000;
			var mult=1;
			var num=0;
			for (var i in Game.Objects) {if (Game.Objects[i].name!='Cursor') num+=Game.Objects[i].amount;}
			add=add*num;
			mult*=Game.GetTieredCpsMult(me);
			mult*=Game.magicCpS('Cursor');
			mult*=Game.eff('cursorCps');
			return Game.ComputeCps(0.1,Game.Has('加强的食指')+Game.Has('腕管预防霜')+Game.Has('双手通用'),add)*mult;
		},function(){
			if (this.amount>=1) Game.Unlock(['加强的食指','腕管预防霜']);
			if (this.amount>=10) Game.Unlock('双手通用');
			if (this.amount>=25) Game.Unlock('千手指');
			if (this.amount>=50) Game.Unlock('百万手指');
			if (this.amount>=100) Game.Unlock('十亿手指');
			if (this.amount>=150) Game.Unlock('万亿手指');
			if (this.amount>=200) Game.Unlock('千万亿手指');
			if (this.amount>=250) Game.Unlock('万兆手指');
			if (this.amount>=300) Game.Unlock('百万的六乘方手指');
			if (this.amount>=350) Game.Unlock('巨量的手指');
			if (this.amount>=400) Game.Unlock('千的九次方手指');
			
			if (this.amount>=1) Game.Win('单击');if (this.amount>=2) Game.Win('双击');if (this.amount>=50) Game.Win('鼠标滚轮');if (this.amount>=100) Game.Win('鼠标和人');if (this.amount>=200) Game.Win('数字');if (this.amount>=300) Game.Win('极端多指');if (this.amount>=400) Game.Win('T博士');if (this.amount>=500) Game.Win('大拇指，指骨，掌骨');if (this.amount>=600) Game.Win('随着她的手指和她的拇指');
		});
		
		Game.SpecialGrandmaUnlock=15;
		new Game.Object('Grandma','grandma|grandmas|烘焙|老奶奶 [X] 岁|老奶奶 [X] 岁','一个不错的奶奶，可以帮你制作更多的饼干',1,1,{pic:function(i){
			var list=['grandma'];
<<<<<<< HEAD:main.js
			if (Game.Has('农民老奶奶')) list.push('farmerGrandma');
			if (Game.Has('工人老奶奶')) list.push('workerGrandma');
			if (Game.Has('矿工老奶奶')) list.push('minerGrandma');
			if (Game.Has('宇宙老奶奶')) list.push('cosmicGrandma');
			if (Game.Has('嬗变老奶奶')) list.push('transmutedGrandma');
			if (Game.Has('改造老奶奶')) list.push('alteredGrandma');
			if (Game.Has('老奶奶的奶奶')) list.push('grandmasGrandma');
			if (Game.Has('反物质奶奶')) list.push('antiGrandma');
			if (Game.Has('彩虹老奶奶')) list.push('rainbowGrandma');
			if (Game.Has('银行家老奶奶')) list.push('bankGrandma');
			if (Game.Has('祭司老奶奶')) list.push('templeGrandma');
			if (Game.Has('女巫老奶奶')) list.push('witchGrandma');
			if (Game.Has('幸运老奶奶')) list.push('luckyGrandma');
=======
			if (Game.Has('Farmer grandmas')) list.push('farmerGrandma');
			if (Game.Has('Worker grandmas')) list.push('workerGrandma');
			if (Game.Has('Miner grandmas')) list.push('minerGrandma');
			if (Game.Has('Cosmic grandmas')) list.push('cosmicGrandma');
			if (Game.Has('Transmuted grandmas')) list.push('transmutedGrandma');
			if (Game.Has('Altered grandmas')) list.push('alteredGrandma');
			if (Game.Has('Grandmas\' grandmas')) list.push('grandmasGrandma');
			if (Game.Has('Antigrandmas')) list.push('antiGrandma');
			if (Game.Has('Rainbow grandmas')) list.push('rainbowGrandma');
			if (Game.Has('Banker grandmas')) list.push('bankGrandma');
			if (Game.Has('Priestess grandmas')) list.push('templeGrandma');
			if (Game.Has('Witch grandmas')) list.push('witchGrandma');
			if (Game.Has('Lucky grandmas')) list.push('luckyGrandma');
			if (Game.Has('Metagrandmas')) list.push('metaGrandma');
>>>>>>> 20180919:main.js
			if (Game.season=='christmas') list.push('elfGrandma');
			if (Game.season=='easter') list.push('bunnyGrandma');
			return choose(list)+'.png';
		},bg:'grandmaBackground.png',xV:8,yV:8,w:32,rows:3,x:0,y:16},100,function(me){
			var mult=1;
<<<<<<< HEAD:main.js
			if (Game.Has('农民老奶奶')) mult*=2;
			if (Game.Has('工人老奶奶')) mult*=2;
			if (Game.Has('矿工老奶奶')) mult*=2;
			if (Game.Has('宇宙老奶奶')) mult*=2;
			if (Game.Has('嬗变老奶奶')) mult*=2;
			if (Game.Has('改造老奶奶')) mult*=2;
			if (Game.Has('老奶奶的奶奶')) mult*=2;
			if (Game.Has('反物质奶奶')) mult*=2;
			if (Game.Has('彩虹老奶奶')) mult*=2;
			if (Game.Has('银行家老奶奶')) mult*=2;
			if (Game.Has('祭司老奶奶')) mult*=2;
			if (Game.Has('女巫老奶奶')) mult*=2;
			if (Game.Has('幸运老奶奶')) mult*=2;
			if (Game.Has('宾果游戏中心/研究设施')) mult*=4;
			if (Game.Has('仪式滚针')) mult*=2;
			if (Game.Has('淘气名单')) mult*=2;
=======
			for (var i in Game.GrandmaSynergies)
			{
				if (Game.Has(Game.GrandmaSynergies[i])) mult*=2;
			}
			if (Game.Has('Bingo center/Research facility')) mult*=4;
			if (Game.Has('Ritual rolling pins')) mult*=2;
			if (Game.Has('Naughty list')) mult*=2;
>>>>>>> 20180919:main.js
			
			if (Game.Has('Elderwort biscuits')) mult*=1.02;
			
			mult*=Game.eff('grandmaCps');
			
			mult*=Game.GetTieredCpsMult(me);

			var add=0;
			if (Game.Has('同心协力')) add+=Game.Objects['Grandma'].amount*0.02;
			if (Game.Has('集体洗脑')) add+=Game.Objects['Grandma'].amount*0.02;
			if (Game.Has('长者盟约')) add+=Game.Objects['Portal'].amount*0.05;
			
			var num=0;
			for (var i in Game.Objects) {if (Game.Objects[i].name!='Grandma') num+=Game.Objects[i].amount;}
			if (Game.hasAura('Elder Battalion')) mult*=1+0.01*num;
			
			mult*=Game.magicCpS(me.name);
			
			return (me.baseCps+add)*mult;
		},function(){
			Game.UnlockTiered(this);
		});
		Game.last.sellFunction=function()
		{
			Game.Win('大错特错');
			if (this.amount==0)
			{
				Game.Lock('老人的承诺');
				Game.CollectWrinklers();
				Game.pledgeT=0;
			}
		};
		Game.last.iconFunc=function(type){
			var grandmaIcons=[[0,1],[0,2],[1,2],[2,2]];
			if (type=='off') return [0,1];
			return grandmaIcons[Game.elderWrath];
		};
		
		
		new Game.Object('Farm','farm|farms|收获|[X] 更多土地|[X] 更多土地','从饼干种子中种植饼干。',3,2,{base:'farm',xV:8,yV:8,w:64,rows:2,x:0,y:16},500,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('农民老奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('农民老奶奶');
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
>>>>>>> 20180919:main.js
		});
		Game.last.minigameUrl='minigameGarden.js';
		Game.last.minigameName='花园';
		
		new Game.Object('Mine','矿山|矿山|开采|[X] 米深|[X] 米深','矿山生产饼干面团和巧克力片。',4,3,{base:'mine',xV:16,yV:16,w:64,rows:2,x:0,y:24},10000,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('矿工老奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('矿工老奶奶');
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
>>>>>>> 20180919:main.js
		});
		
		new Game.Object('Factory','f工厂|工厂|大量生产|[X] 附加专利|[X] 附加专利','生产大量的饼干。',5,4,{base:'factory',xV:8,yV:0,w:64,rows:1,x:0,y:-22},3000,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('工人老奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('工人老奶奶');
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
>>>>>>> 20180919:main.js
		});
		//Game.last.minigameUrl='minigameDungeon.js';//not yet
		//Game.last.minigameName='Dungeon';
		
		new Game.Object('Bank','银行|银行|存入银行|利率增加 [X]% |利率增加 [X]% ','从利息中生成饼干。',6,15,{base:'bank',xV:8,yV:4,w:56,rows:1,x:0,y:13},0,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('银行家老奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('银行家老奶奶');
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
>>>>>>> 20180919:main.js
		});
		
		new Game.Object('Temple','t寺庙|寺庙|发现|[X] 神圣的构件检索|[X] 神圣的构件检索','充满了珍贵的古代巧克力。',7,16,{base:'temple',xV:8,yV:4,w:72,rows:2,x:0,y:-5},0,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('祭司老奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('祭司老奶奶');
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
>>>>>>> 20180919:main.js
		});
		Game.last.minigameUrl='minigamePantheon.js';
		Game.last.minigameName='万神殿';
		
		new Game.Object('Wizard tower','精灵塔|精灵塔|召唤|咒语拥有 [X] 更多的音节|咒语拥有 [X] 更多的音节','用魔法咒语召唤饼干。',8,17,{base:'wizardtower',xV:16,yV:16,w:48,rows:2,x:0,y:20},0,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('女巫老奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('女巫老奶奶');
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
>>>>>>> 20180919:main.js
		});
		Game.last.minigameUrl='minigameGrimoire.js';
		Game.last.minigameName='魔法书';
		
		new Game.Object('Shipment','装船|装船|装运|[X] 星系完全探索|[X] 星系完全探索','从饼干星球带来新鲜的饼干。',9,5,{base:'shipment',xV:16,yV:16,w:64,rows:1,x:0,y:0},40000,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('宇宙老奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('宇宙老奶奶');
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
>>>>>>> 20180919:main.js
		});
		
		new Game.Object('Alchemy lab','炼金实验室|炼金实验室|转换|[X] 原始元素掌握|[X] 原始元素掌握','把金子变成饼干！',10,6,{base:'alchemylab',xV:16,yV:16,w:64,rows:2,x:0,y:16},200000,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('嬗变老奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('嬗变老奶奶');
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
>>>>>>> 20180919:main.js
		});
		
		new Game.Object('Portal','portal|portals|取回|[X] 维度奴役|[X] 维度奴役','打开通往饼干世界的大门。',11,7,{base:'portal',xV:32,yV:32,w:64,rows:2,x:0,y:0},1666666,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('改造老奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('改造老奶奶');
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
>>>>>>> 20180919:main.js
		});
		
		new Game.Object('Time machine','time machine|time machines|恢复|[X] 世纪安全|[X] 世纪安全','从过去带来的饼干，在它们被吃掉之前。',12,8,{base:'timemachine',xV:32,yV:32,w:64,rows:1,x:0,y:0},123456789,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('老奶奶的奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('老奶奶的奶奶');
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
>>>>>>> 20180919:main.js
		});
		
		new Game.Object('Antimatter condenser','antimatter condenser|antimatter condensers|浓缩|[X] 额外的夸克风味|[X] 额外的夸克风味','将宇宙中的反物质凝聚成饼干。',13,13,{base:'antimattercondenser',xV:0,yV:64,w:64,rows:1,x:0,y:0},3999999999,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('反物质奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('反物质奶奶');
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
>>>>>>> 20180919:main.js
		});
		Game.last.displayName='<span style="font-size:65%;position:relative;bottom:4px;">Antimatter condenser</span>';//shrink the name since it's so large
		
		new Game.Object('Prism','prism|prisms|转换|[X] 新的颜色发现|[X] 新的颜色发现','把光转化成饼干。',14,14,{base:'prism',xV:16,yV:4,w:64,rows:1,x:0,y:20},75000000000,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('彩虹老奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('彩虹老奶奶');
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
>>>>>>> 20180919:main.js
		});
		
		new Game.Object('Chancemaker','chancemaker|chancemakers|自发生成|投机分子能力 [X]-四叶草|投机分子能力 [X]-四叶草','从稀薄的空气中产生饼干，完全靠运气。',15,19,{base:'chancemaker',xV:8,yV:64,w:64,rows:1,x:0,y:0},77777777777,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
<<<<<<< HEAD:main.js
			if (Game.Has('幸运老奶奶')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
=======
>>>>>>> 20180919:main.js
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
<<<<<<< HEAD:main.js
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('幸运老奶奶');
		});
		
		Game.foolObjects={
			'Unknown':{name:'Investment',desc:'你不确定这是干什么的，你只知道这意味着利润。',icon:0},
			'Cursor':{name:'Rolling pin',desc:'压平面团的基本原理。制作饼干的第一步。',icon:0},
			'Grandma':{name:'Oven',desc:'烘焙饼干的关键元素。',icon:1},
			'Farm':{name:'Kitchen',desc:'厨房越多，员工做的饼干就越多。',icon:2},
			'Mine':{name:'Secret recipe',desc:'这些给你带来了超越那些讨厌的竞争对手的优势。',icon:3},
			'Factory':{name:'Factory',desc:'批量生产是烘焙的未来。把握今天，协同合作!',icon:4},
			'Bank':{name:'Investor',desc:'做生意的人都有获利的机会，只要能赚钱，就随时准备为你的事业融资。',icon:5},
			'Temple':{name:'Like',desc:'你的社交媒体页面正在迅速走红!积累“赞”是持久的在线广告和多汁的广告交易的关键。',icon:9},
			'Wizard tower':{name:'Meme',desc:'饼干模因风靡一时!只要有适量的社交媒体，你的品牌形象就会遍布整个网络空间。',icon:6},
			'Shipment':{name:'Supermarket',desc:'一个巨大的饼干商场——你自己的零售连锁店。',icon:7},
			'Alchemy lab':{name:'Stock share',desc:'你在股票市场上正式上市，每个人都想要一块!',icon:8},
			'Portal':{name:'TV show',desc:'你的饼干有自己的情景喜剧!令人捧腹的烧烤狂欢会让你笑得很开心。',icon:10},
			'Time machine':{name:'Theme park',desc:'饼干主题公园，满是吉祥物和过山车。建一个，建一百个!',icon:11},
			'Antimatter condenser':{name:'Cookiecoin',desc:'一种虚拟货币，在一些小国家已经取代了普通的货币。',icon:12},
			'Prism':{name:'Corporate country',desc:'你已经达到了顶峰，现在你可以买下整个国家，让你的企业更加贪婪。祝你好运。',icon:13},
			'Chancemaker':{name:'Privatized planet',desc:'事实上，你知道什么是最酷的吗?一个致力于生产、广告、销售和消费你的饼干的星球。',icon:15},
=======
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
		});
		
		new Game.Object('Fractal engine','fractal engine|fractal engines|made from cookies|[X] iteration deep|[X] iterations deep','Turns cookies into even more cookies.',16,20,{base:'fractalEngine',xV:8,yV:64,w:64,rows:1,x:0,y:0},12345678987654321,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
		});
		
		Game.foolObjects={
			'Unknown':{name:'Investment',desc:'You\'re not sure what this does, you just know it means profit.',icon:0},
			'Cursor':{name:'Rolling pin',desc:'Essential in flattening dough. The first step in cookie-making.',icon:0},
			'Grandma':{name:'Oven',desc:'A crucial element of baking cookies.',icon:1},
			'Farm':{name:'Kitchen',desc:'The more kitchens, the more cookies your employees can produce.',icon:2},
			'Mine':{name:'Secret recipe',desc:'These give you the edge you need to outsell those pesky competitors.',icon:3},
			'Factory':{name:'Factory',desc:'Mass production is the future of baking. Seize the day, and synergize!',icon:4},
			'Bank':{name:'Investor',desc:'Business folks with a nose for profit, ready to finance your venture as long as there\'s money to be made.',icon:5},
			'Temple':{name:'Like',desc:'Your social media page is going viral! Amassing likes is the key to a lasting online presence and juicy advertising deals.',icon:9},
			'Wizard tower':{name:'Meme',desc:'Cookie memes are all the rage! With just the right amount of social media astroturfing, your brand image will be all over the cyberspace.',icon:6},
			'Shipment':{name:'Supermarket',desc:'A gigantic cookie emporium - your very own retail chain.',icon:7},
			'Alchemy lab':{name:'Stock share',desc:'You\'re officially on the stock market, and everyone wants a piece!',icon:8},
			'Portal':{name:'TV show',desc:'Your cookies have their own sitcom! Hilarious baking hijinks set to the cheesiest laughtrack.',icon:10},
			'Time machine':{name:'Theme park',desc:'Cookie theme parks, full of mascots and roller-coasters. Build one, build a hundred!',icon:11},
			'Antimatter condenser':{name:'Cookiecoin',desc:'A virtual currency, already replacing regular money in some small countries.',icon:12},
			'Prism':{name:'Corporate country',desc:'You\'ve made it to the top, and you can now buy entire nations to further your corporate greed. Godspeed.',icon:13},
			'Chancemaker':{name:'Privatized planet',desc:'Actually, you know what\'s cool? A whole planet dedicated to producing, advertising, selling, and consuming your cookies.',icon:15},
			'Fractal engine':{name:'Senate seat',desc:'Only through political dominion can you truly alter this world to create a brighter, more cookie-friendly future.',icon:16},
>>>>>>> 20180919:main.js
		};
		
		
		//build store
		Game.BuildStore();
		
		//build master bar
		var str='';
		str+='<div id="buildingsMute" class="shadowFilter" style="position:relative;z-index:100;padding:4px 16px 0px 64px;"></div>';
		str+='<div class="separatorBottom" style="position:absolute;bottom:-8px;z-index:0;"></div>';
		l('buildingsMaster').innerHTML=str;
		
		//build object displays
		var muteStr='<div style="position:absolute;left:8px;bottom:12px;opacity:0.5;">已收起建筑 :</div>';
		for (var i in Game.Objects)
		{
			var me=Game.Objects[i];
			if (me.id>0)
			{
				me.canvas=l('rowCanvas'+me.id);
				me.ctx=me.canvas.getContext('2d',{alpha:false});
				me.pics=[];
				var icon=[0*64,me.icon*64];
				muteStr+='<div class="tinyProductIcon" id="mutedProduct'+me.id+'" style="display:none;background-position:-'+icon[0]+'px -'+icon[1]+'px;" '+Game.clickStr+'="Game.ObjectsById['+me.id+'].mute(0);PlaySound(Game.ObjectsById['+me.id+'].muted?\'snd/clickOff.mp3\':\'snd/clickOn.mp3\');" '+Game.getDynamicTooltip('Game.mutedBuildingTooltip('+me.id+')','this')+'></div>';
				//muteStr+='<div class="tinyProductIcon" id="mutedProduct'+me.id+'" style="display:none;background-position:-'+icon[0]+'px -'+icon[1]+'px;" '+Game.clickStr+'="Game.ObjectsById['+me.id+'].mute(0);PlaySound(Game.ObjectsById['+me.id+'].muted?\'snd/clickOff.mp3\':\'snd/clickOn.mp3\');" '+Game.getTooltip('<div style="width:150px;text-align:center;font-size:11px;"><b>Unmute '+me.plural+'</b><br>(Display this building)</div>')+'></div>';
				
				AddEvent(me.canvas,'mouseover',function(me){return function(){me.mouseOn=true;}}(me));
				AddEvent(me.canvas,'mouseout',function(me){return function(){me.mouseOn=false;}}(me));
				AddEvent(me.canvas,'mousemove',function(me){return function(e){var box=this.getBoundingClientRect();me.mousePos[0]=e.pageX-box.left;me.mousePos[1]=e.pageY-box.top;}}(me));
			}
		}
		Game.mutedBuildingTooltip=function(id)
		{
			return function(){
				var me=Game.ObjectsById[id];
				return '<div style="width:150px;text-align:center;font-size:11px;"><b>'+cndisplayname((me.plural.charAt(0).toUpperCase()+me.plural.slice(1)))+(me.level>0?' (等级&nbsp;'+me.level+')':'')+'</b><div class="line"></div>点击展开 '+cnsigle(me.plural)+'<br>(显示整个建筑)</div>';
			}
		}
		l('buildingsMute').innerHTML=muteStr;
		
		/*=====================================================================================
		UPGRADES
		=======================================================================================*/
		Game.upgradesToRebuild=1;
		Game.Upgrades=[];
		Game.UpgradesById=[];
		Game.UpgradesN=0;
		Game.UpgradesInStore=[];
		Game.UpgradesOwned=0;
		Game.Upgrade=function(name,desc,price,icon,buyFunction)
		{
			this.id=Game.UpgradesN;
			this.name=name;
			this.desc=desc;
			this.baseDesc=this.desc;
			this.desc=BeautifyInText(this.baseDesc);
			this.basePrice=price;
			this.icon=icon;
			this.iconFunction=0;
			this.buyFunction=buyFunction;
			/*this.unlockFunction=unlockFunction;
			this.unlocked=(this.unlockFunction?0:1);*/
			this.unlocked=0;
			this.bought=0;
			this.order=this.id;
			if (order) this.order=order+this.id*0.001;
			this.pool='';//can be '', cookie, toggle, debug, prestige, prestigeDecor, tech, or unused
			if (pool) this.pool=pool;
			this.power=0;
			if (power) this.power=power;
			this.vanilla=Game.vanilla;
			this.unlockAt=0;
			this.techUnlock=[];
			this.parents=[];
			this.type='upgrade';
			this.tier=0;
			this.buildingTie=0;//of what building is this a tiered upgrade of ?
			
			Game.last=this;
			Game.Upgrades[this.name]=this;
			Game.UpgradesById[this.id]=this;
			Game.UpgradesN++;
			return this;
		}
		
		Game.Upgrade.prototype.getPrice=function()
		{
			var price=this.basePrice;
			if (this.priceFunc) price=this.priceFunc();
			if (this.pool!='prestige')
			{
				if (Game.Has('玩具车间')) price*=0.95;
				if (Game.Has('五指折扣')) price*=Math.pow(0.99,Game.Objects['Cursor'].amount/100);
				if (Game.Has('圣诞老人的统治')) price*=0.98;
				if (Game.Has('法贝热彩蛋')) price*=0.99;
				if (Game.Has('神圣销售')) price*=0.99;
				if (Game.hasBuff('运气而已')) price*=0.98;
				if (Game.hasBuff('砍价的不幸')) price*=1.02;
				if (Game.hasAura('Master of the Armory')) price*=0.98;
				price*=Game.eff('upgradeCost');
				if (this.pool=='cookie' && Game.Has('神圣的面包店')) price/=5;
			}
			return Math.ceil(price);
		}
		
		Game.Upgrade.prototype.canBuy=function()
		{
			if (this.canBuyFunc) return this.canBuyFunc();
			if (Game.cookies>=this.getPrice()) return true; else return false;
		}
		
		Game.storeBuyAll=function()
		{
			if (!Game.Has('灵感的清单')) return false;
			for (var i in Game.UpgradesInStore)
			{
				var me=Game.UpgradesInStore[i];
				if (!me.isVaulted() && me.pool!='toggle' && me.pool!='tech') me.buy(1);
			}
		}
		
		Game.vault=[];
		Game.Upgrade.prototype.isVaulted=function()
		{
			if (Game.vault.indexOf(this.id)!=-1) return true; else return false;
		}
		Game.Upgrade.prototype.vault=function()
		{
			if (!this.isVaulted()) Game.vault.push(this.id);
		}
		Game.Upgrade.prototype.unvault=function()
		{
			if (this.isVaulted()) Game.vault.splice(Game.vault.indexOf(this.id),1);
		}
		
		Game.Upgrade.prototype.click=function(e)
		{
			if ((e && e.ctrlKey) || Game.keys[17])
			{
				if (this.pool=='toggle' || this.pool=='tech') {}
				else if (Game.Has('灵感的清单'))
				{
					if (this.isVaulted()) this.unvault();
					else this.vault();
					Game.upgradesToRebuild=1;
					PlaySound('snd/tick.mp3');
				}
			}
			else this.buy();
		}
		
		
		Game.Upgrade.prototype.buy=function(bypass)
		{
			var success=0;
			var cancelPurchase=0;
			if (this.clickFunction && !bypass) cancelPurchase=!this.clickFunction();
			if (!cancelPurchase)
			{
				if (this.choicesFunction)
				{
					if (Game.choiceSelectorOn==this.id)
					{
						l('toggleBox').style.display='none';
						l('toggleBox').innerHTML='';
						Game.choiceSelectorOn=-1;
						PlaySound('snd/tick.mp3');
					}
					else
					{
						Game.choiceSelectorOn=this.id;
						var choices=this.choicesFunction();
						if (choices.length>0)
						{
							var selected=0;
							for (var i in choices) {if (choices[i].selected) selected=i;}
							Game.choiceSelectorChoices=choices;//this is a really dumb way of doing this i am so sorry
							Game.choiceSelectorSelected=selected;
							var str='';
							str+='<div class="close" onclick="Game.UpgradesById['+this.id+'].buy();">x</div>';
							str+='<h3>'+this.name+'</h3>'+
							'<div class="line"></div>'+
							'<h4 id="choiceSelectedName">'+choices[selected].name+'</h4>'+
							'<div class="line"></div>';
							
							for (var i in choices)
							{
								var icon=choices[i].icon;
								str+='<div class="crate enabled'+(i==selected?' highlighted':'')+'" style="opacity:1;float:none;display:inline-block;'+(icon[2]?'background-image:url('+icon[2]+');':'')+'background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;" '+Game.clickStr+'="Game.UpgradesById['+this.id+'].choicesPick('+i+');PlaySound(\'snd/tick.mp3\');Game.choiceSelectorOn=-1;Game.UpgradesById['+this.id+'].buy();" onMouseOut="l(\'choiceSelectedName\').innerHTML=Game.choiceSelectorChoices[Game.choiceSelectorSelected].name;" onMouseOver="l(\'choiceSelectedName\').innerHTML=Game.choiceSelectorChoices['+i+'].name;"'+
								'></div>';
							}
						}
						l('toggleBox').innerHTML=str;
						l('toggleBox').style.display='block';
						l('toggleBox').focus();
						Game.tooltip.hide();
						PlaySound('snd/tick.mp3');
						success=1;
					}
				}
				else if (this.pool!='prestige')
				{
					var price=this.getPrice();
					if (this.canBuy() && !this.bought)
					{
						Game.Spend(price);
						this.bought=1;
						if (this.buyFunction) this.buyFunction();
						if (this.toggleInto)
						{
							Game.Lock(this.toggleInto);
							Game.Unlock(this.toggleInto);
						}
						Game.upgradesToRebuild=1;
						Game.recalculateGains=1;
						if (Game.CountsAsUpgradeOwned(this.pool)) Game.UpgradesOwned++;
						Game.setOnCrate(0);
						Game.tooltip.hide();
						PlaySound('snd/buy'+choose([1,2,3,4])+'.mp3',0.75);
						success=1;
					}
				}
				else
				{
					var price=this.getPrice();
					if (Game.heavenlyChips>=price && !this.bought)
					{
						Game.heavenlyChips-=price;
						Game.heavenlyChipsSpent+=price;
						this.unlocked=1;
						this.bought=1;
						if (this.buyFunction) this.buyFunction();
						Game.BuildAscendTree();
						PlaySound('snd/buy'+choose([1,2,3,4])+'.mp3',0.75);
						PlaySound('snd/shimmerClick.mp3');
						//PlaySound('snd/buyHeavenly.mp3');
						success=1;
					}
				}
			}
			if (this.bought && this.activateFunction) this.activateFunction();
			return success;
		}
		Game.Upgrade.prototype.earn=function()//just win the upgrades without spending anything
		{
			this.unlocked=1;
			this.bought=1;
			if (this.buyFunction) this.buyFunction();
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
			if (Game.CountsAsUpgradeOwned(this.pool)) Game.UpgradesOwned++;
		}
		Game.Upgrade.prototype.unearn=function()//remove the upgrade, but keep it unlocked
		{
			this.bought=0;
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
			if (Game.CountsAsUpgradeOwned(this.pool)) Game.UpgradesOwned--;
		}
		Game.Upgrade.prototype.unlock=function()
		{
			this.unlocked=1;
			Game.upgradesToRebuild=1;
		}
		Game.Upgrade.prototype.lose=function()
		{
			this.unlocked=0;
			this.bought=0;
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
			if (Game.CountsAsUpgradeOwned(this.pool)) Game.UpgradesOwned--;
		}
		Game.Upgrade.prototype.toggle=function()//cheating only
		{
			if (!this.bought)
			{
				this.bought=1;
				if (this.buyFunction) this.buyFunction();
				Game.upgradesToRebuild=1;
				Game.recalculateGains=1;
				if (Game.CountsAsUpgradeOwned(this.pool)) Game.UpgradesOwned++;
				PlaySound('snd/buy'+choose([1,2,3,4])+'.mp3',0.75);
				if (this.pool=='prestige' || this.pool=='debug') PlaySound('snd/shimmerClick.mp3');
			}
			else
			{
				this.bought=0;
				Game.upgradesToRebuild=1;
				Game.recalculateGains=1;
				if (Game.CountsAsUpgradeOwned(this.pool)) Game.UpgradesOwned--;
				PlaySound('snd/sell'+choose([1,2,3,4])+'.mp3',0.75);
				if (this.pool=='prestige' || this.pool=='debug') PlaySound('snd/shimmerClick.mp3');
			}
			if (Game.onMenu=='stats') Game.UpdateMenu();
		}
		
		Game.CountsAsUpgradeOwned=function(pool)
		{
			if (pool=='' || pool=='cookie' || pool=='tech') return true; else return false;
		}
		
		/*AddEvent(l('toggleBox'),'blur',function()//if we click outside of the selector, close it
			{
				//this has a couple problems, such as when clicking on the upgrade - this toggles it off and back on instantly
				l('toggleBox').style.display='none';
				l('toggleBox').innerHTML='';
				Game.choiceSelectorOn=-1;
			}
		);*/
		
		Game.RequiresConfirmation=function(upgrade,prompt)
		{
			upgrade.clickFunction=function(){Game.Prompt(prompt,[['Yes','Game.UpgradesById['+upgrade.id+'].buy(1);Game.ClosePrompt();'],'No']);return false;};
		}
		
		Game.Unlock=function(what)
		{
			if (typeof what==='string')
			{
				if (Game.Upgrades[what])
				{
					if (Game.Upgrades[what].unlocked==0)
					{
						Game.Upgrades[what].unlocked=1;
						Game.upgradesToRebuild=1;
						Game.recalculateGains=1;
						/*if (Game.prefs.popups) {}
						else Game.Notify('Upgrade unlocked','<div class="title" style="font-size:18px;margin-top:-2px;">'+Game.Upgrades[what].name+'</div>',Game.Upgrades[what].icon,6);*/
					}
				}
			}
			else {for (var i in what) {Game.Unlock(what[i]);}}
		}
		Game.Lock=function(what)
		{
			if (typeof what==='string')
			{
				if (Game.Upgrades[what])
				{
					Game.Upgrades[what].unlocked=0;
					Game.upgradesToRebuild=1;
					if (Game.Upgrades[what].bought==1 && Game.CountsAsUpgradeOwned(Game.Upgrades[what].pool)) Game.UpgradesOwned--;
					Game.Upgrades[what].bought=0;
					Game.recalculateGains=1;
				}
			}
			else {for (var i in what) {Game.Lock(what[i]);}}
		}
		
		Game.Has=function(what)
		{
			if (Game.ascensionMode==1 && Game.Upgrades[what].pool=='prestige') return 0;
			return (Game.Upgrades[what]?Game.Upgrades[what].bought:0);
		}
		Game.HasUnlocked=function(what)
		{
			return (Game.Upgrades[what]?Game.Upgrades[what].unlocked:0);
		}
		
		
		Game.RebuildUpgrades=function()//recalculate the upgrades you can buy
		{
			Game.upgradesToRebuild=0;
			var list=[];
			for (var i in Game.Upgrades)
			{
				var me=Game.Upgrades[i];
				if (!me.bought && me.pool!='debug' && me.pool!='prestige' && me.pool!='prestigeDecor' && (!me.lasting || Game.ascensionMode!=1))
				{
					if (me.unlocked) list.push(me);
				}
				else if (me.displayFuncWhenOwned && me.bought) list.push(me);
			}
			var sortMap=function(a,b)
			{
				var ap=a.pool=='toggle'?a.order:a.getPrice();
				var bp=b.pool=='toggle'?b.order:b.getPrice();
				if (ap>bp) return 1;
				else if (ap<bp) return -1;
				else return 0;
			}
			list.sort(sortMap);
			
			Game.UpgradesInStore=[];
			for (var i in list)
			{
				Game.UpgradesInStore.push(list[i]);
			}
			var storeStr='';
			var toggleStr='';
			var techStr='';
			var vaultStr='';
			
			if (Game.Has('灵感的清单'))
			{
				storeStr+='<div id="storeBuyAll" class="storePre" '+Game.getTooltip(
								'<div style="padding:8px;min-width:250px;text-align:center;font-size:11px;">将会 <b>立即购买</b> 你能负担得起的所有升级, 从最便宜的一个开始。<br><b>保险库</b>中的升级不会自动购买。<br>您可以通过<b>按住Ctrl键，单击</b>将升级放入保险库中。</div>'
								,'store')+
					'>'+
						'<div id="storeBuyAllButton" class="storePreButton" '+Game.clickStr+'="Game.storeBuyAll();">购买全部升级</div>'+
					'</div>';
				l('upgrades').classList.add('hasMenu');
			}
			else l('upgrades').classList.remove('hasMenu');
			
			for (var i in Game.UpgradesInStore)
			{
				//if (!Game.UpgradesInStore[i]) break;
				var me=Game.UpgradesInStore[i];
				var str=Game.crate(me,'store','Game.UpgradesById['+me.id+'].click(event);','upgrade'+i);
				
				/*var str='<div class="crate upgrade" '+Game.getTooltip(
				'<div style="min-width:200px;"><div style="float:right;"><span class="price">'+Beautify(Math.round(me.getPrice()))+'</span></div><small>'+(me.pool=='toggle'?'[Togglable]':'[Upgrade]')+'</small><div class="name">'+me.name+'</div><div class="line"></div><div class="description">'+me.desc+'</div></div>'
				,'store')+' '+Game.clickStr+'="Game.UpgradesById['+me.id+'].buy();" id="upgrade'+i+'" style="'+(me.icon[2]?'background-image:url('+me.icon[2]+');':'')+'background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div>';*/
				if (me.pool=='toggle') toggleStr+=str; else if (me.pool=='tech') techStr+=str; else
				{
					if (me.isVaulted() && Game.Has('灵感的清单')) vaultStr+=str; else storeStr+=str;
				}
			}
			
			l('upgrades').innerHTML=storeStr;
			l('toggleUpgrades').innerHTML=toggleStr;
			if (toggleStr=='') l('toggleUpgrades').style.display='none'; else l('toggleUpgrades').style.display='block';
			l('techUpgrades').innerHTML=techStr;
			if (techStr=='') l('techUpgrades').style.display='none'; else l('techUpgrades').style.display='block';
			l('vaultUpgrades').innerHTML=vaultStr;
			if (vaultStr=='') l('vaultUpgrades').style.display='none'; else l('vaultUpgrades').style.display='block';
		}
		
		Game.UnlockAt=[];//this contains an array of every upgrade with a cookie requirement in the form of {cookies:(amount of cookies earned required),name:(name of upgrade or achievement to unlock)} (and possibly require:(name of upgrade of achievement to own))
		//note : the cookie will not be added to the list if it contains locked:1 (use for seasonal cookies and such)
		
		Game.NewUpgradeCookie=function(obj)
		{
			var upgrade=new Game.Upgrade(obj.name,'饼干生产加成 <b>+'+Beautify((typeof(obj.power)=='function'?obj.power(obj):obj.power),1)+'%</b>.<q>'+obj.desc+'</q>',obj.price,obj.icon);
			upgrade.power=obj.power;
			upgrade.pool='cookie';
			var toPush={cookies:obj.price/20,name:obj.name};
			if (obj.require) toPush.require=obj.require;
			if (obj.season) toPush.season=obj.season;
			if (!obj.locked) Game.UnlockAt.push(toPush);
			return upgrade;
		}
		
		//tiered upgrades system
		//each building has several upgrade tiers
		//all upgrades in the same tier have the same color, unlock threshold and price multiplier
		Game.Tiers={
			1:{name:'Plain',unlock:1,achievUnlock:1,iconRow:0,color:'#ccb3ac',price:					10},
			2:{name:'Berrylium',unlock:5,achievUnlock:50,iconRow:1,color:'#ff89e7',price:				50},
			3:{name:'Blueberrylium',unlock:25,achievUnlock:100,iconRow:2,color:'#00deff',price:			500},
			4:{name:'Chalcedhoney',unlock:50,achievUnlock:150,iconRow:13,color:'#ffcc2f',price:			50000},
			5:{name:'Buttergold',unlock:100,achievUnlock:200,iconRow:14,color:'#e9d673',price:			5000000},
			6:{name:'Sugarmuck',unlock:150,achievUnlock:250,iconRow:15,color:'#a8bf91',price:			500000000},
			7:{name:'Jetmint',unlock:200,achievUnlock:300,iconRow:16,color:'#60ff50',price:				500000000000},
			8:{name:'Cherrysilver',unlock:250,achievUnlock:350,iconRow:17,color:'#f01700',price:		500000000000000},
			9:{name:'Hazelrald',unlock:300,achievUnlock:400,iconRow:18,color:'#9ab834',price:			500000000000000000},
			10:{name:'Mooncandy',unlock:350,achievUnlock:450,iconRow:19,color:'#7e7ab9',price:			500000000000000000000},
			11:{name:'Astrofudge',unlock:400,achievUnlock:500,iconRow:28,color:'#9a3316',price:			5000000000000000000000000},
			12:{name:'Alabascream',unlock:450,achievUnlock:550,iconRow:30,color:'#c1a88c',price:		50000000000000000000000000000},
<<<<<<< HEAD:main.js
			'synergy1':{name:'Synergy I',unlock:15,iconRow:20,color:'#008595',special:1,req:'协同效应1',price:			2000},
			'synergy2':{name:'Synergy II',unlock:75,iconRow:29,color:'#008595',special:1,req:'协同效应2',price:			2000000000},
=======
			'synergy1':{name:'Synergy I',unlock:15,iconRow:20,color:'#008595',special:1,req:'Synergies Vol. I',price:			200000},
			'synergy2':{name:'Synergy II',unlock:75,iconRow:29,color:'#008595',special:1,req:'Synergies Vol. II',price:			200000000000},
>>>>>>> 20180919:main.js
		};
		Game.GetIcon=function(type,tier)
		{
			var col=0;
			if (type=='Kitten') col=18; else col=Game.Objects[type].iconColumn;
			return [col,Game.Tiers[tier].iconRow];
		}
		Game.SetTier=function(building,tier)
		{
			if (!Game.Objects[building]) alert('No building named '+building);
			Game.last.tier=tier;
			Game.last.buildingTie=Game.Objects[building];
			if (Game.last.type=='achievement') Game.Objects[building].tieredAchievs[tier]=Game.last;
			else Game.Objects[building].tieredUpgrades[tier]=Game.last;
		}
		Game.MakeTiered=function(upgrade,tier,col)
		{
			upgrade.tier=tier;
			if (typeof col!=='undefined') upgrade.icon=[col,Game.Tiers[tier].iconRow];
		}
		Game.TieredUpgrade=function(name,desc,building,tier)
		{
			var upgrade=new Game.Upgrade(name,desc,Game.Objects[building].basePrice*Game.Tiers[tier].price,Game.GetIcon(building,tier));
			Game.SetTier(building,tier);
			return upgrade;
		}
		Game.SynergyUpgrade=function(name,desc,building1,building2,tier)
		{
			/*
				creates a new upgrade that :
				-unlocks when you have tier.unlock of building1 and building2
				-is priced at (building1.price*10+building2.price*1)*tier.price (formerly : Math.sqrt(building1.price*building2.price)*tier.price)
				-gives +(0.1*building1)% cps to building2 and +(5*building2)% cps to building1
				-if building2 is below building1 in worth, swap them
			*/
			//if (Game.Objects[building1].basePrice>Game.Objects[building2].basePrice) {var temp=building2;building2=building1;building1=temp;}
			var b1=Game.Objects[building1];
			var b2=Game.Objects[building2];
			if (b1.basePrice>b2.basePrice) {b1=Game.Objects[building2];b2=Game.Objects[building1];}//swap
			
			desc=
				cndisplayname((b1.plural.charAt(0).toUpperCase()+b1.plural.slice(1)))+' 获得 <b>+5% 饼干每秒产量</b> 每 '+cndisplayname(b2.name)+'.<br>'+
				cndisplayname((b2.plural.charAt(0).toUpperCase()+b2.plural.slice(1)))+' 获得 <b>+0.1% 饼干每秒产量</b> 每 '+cndisplayname(b1.name)+'.'+
				desc;
			var upgrade=new Game.Upgrade(name,desc,(b1.basePrice*10+b2.basePrice*1)*Game.Tiers[tier].price,Game.GetIcon(building1,tier));//Math.sqrt(b1.basePrice*b2.basePrice)*Game.Tiers[tier].price
			upgrade.tier=tier;
			upgrade.buildingTie1=b1;
			upgrade.buildingTie2=b2;
			upgrade.priceFunc=function(){return (this.buildingTie1.basePrice*10+this.buildingTie2.basePrice*1)*Game.Tiers[this.tier].price*(Game.Has('奇美拉')?0.98:1);};
			Game.Objects[building1].synergies.push(upgrade);
			Game.Objects[building2].synergies.push(upgrade);
			//Game.SetTier(building1,tier);
			return upgrade;
		}
		Game.GetTieredCpsMult=function(me)
		{
			var mult=1;
			for (var i in me.tieredUpgrades) {if (!Game.Tiers[me.tieredUpgrades[i].tier].special && Game.Has(me.tieredUpgrades[i].name)) mult*=2;}
			for (var i in me.synergies)
			{
				var syn=me.synergies[i];
				if (Game.Has(syn.name))
				{
					if (syn.buildingTie1.name==me.name) mult*=(1+0.05*syn.buildingTie2.amount);
					else if (syn.buildingTie2.name==me.name) mult*=(1+0.001*syn.buildingTie1.amount);
				}
			}
			if (me.grandma && Game.Has(me.grandma.name)) mult*=(1+Game.Objects['Grandma'].amount*0.01*(1/(me.id-1)));
			return mult;
		}
		Game.UnlockTiered=function(me)
		{
			for (var i in me.tieredUpgrades) {if (me.amount>=Game.Tiers[me.tieredUpgrades[i].tier].unlock) Game.Unlock(me.tieredUpgrades[i].name);}
			for (var i in me.tieredAchievs) {if (me.amount>=Game.Tiers[me.tieredAchievs[i].tier].achievUnlock) Game.Win(me.tieredAchievs[i].name);}
			for (var i in me.synergies) {var syn=me.synergies[i];if (Game.Has(Game.Tiers[syn.tier].req) && syn.buildingTie1.amount>=Game.Tiers[syn.tier].unlock && syn.buildingTie2.amount>=Game.Tiers[syn.tier].unlock) Game.Unlock(syn.name);}
		}
		
		
		
		var pool='';
		var power=0;
		
		//define upgrades
		//WARNING : do NOT add new upgrades in between, this breaks the saves. Add them at the end !
		var order=100;//this is used to set the order in which the items are listed
		new Game.Upgrade('加强的食指','每次鼠标和游标工作效率 <b>翻倍</b>。<q>戳戳</q>',100,[0,0]);Game.MakeTiered(Game.last,1,0);
		new Game.Upgrade('腕管预防霜','每次鼠标和游标工作效率 <b>翻倍</b>。<q>点击……得好痛</q>',500,[0,1]);Game.MakeTiered(Game.last,2,0);
		new Game.Upgrade('双手通用','每次鼠标和游标工作效率 <b>翻倍</b>。<q>看,两只手!</q>',10000,[0,2]);Game.MakeTiered(Game.last,3,0);
		new Game.Upgrade('千手指','鼠标和游标获得 <b>+0.1</b> 每个非游标建筑生产的饼干数。<q>点点</q>',100000,[0,13]);Game.MakeTiered(Game.last,4,0);
		new Game.Upgrade('百万手指','鼠标和游标获得 <b>+0.5</b> 每个非游标建筑生产的饼干数。<q>点点点点点</q>',10000000,[0,14]);Game.MakeTiered(Game.last,5,0);
		new Game.Upgrade('十亿手指','鼠标和游标获得 <b>+5</b> 每个非游标建筑生产的饼干数。<q>点啊点啊点啊点</q>',100000000,[0,15]);Game.MakeTiered(Game.last,6,0);
		new Game.Upgrade('万亿手指','鼠标和游标获得 <b>+50</b> 每个非游标建筑生产的饼干数。<q>点啊点啊点啊点点啊点啊点啊点</q>',1000000000,[0,16]);Game.MakeTiered(Game.last,7,0);
		
		order=200;
		new Game.TieredUpgrade('前锋老奶奶','老奶奶工作效率 <b>翻倍</b>。<q>我还以为你会被踢出这个地方呢。</q>','Grandma',1);
		new Game.TieredUpgrade('钢包滚针','老奶奶工作效率 <b>翻倍</b>。<q>就是你的膝盖。</q>','Grandma',2);
		new Game.TieredUpgrade('润滑假牙','老奶奶工作效率 <b>翻倍</b>。<q>压扁</q>','Grandma',3);
		
		order=300;
		new Game.TieredUpgrade('廉价的锄头','农场工作效率 <b>翻倍</b>。<q>把面团耙平!</q>','Farm',1);
		new Game.TieredUpgrade('肥料','农场工作效率 <b>翻倍</b>。<q>这是巧克力，我发誓。</q>','Farm',2);
		new Game.TieredUpgrade('饼干树','农场工作效率 <b>翻倍</b>。<q>面包果的亲戚。</q>','Farm',3);
		
		order=500;
		new Game.TieredUpgrade('更坚固的传送带','工厂工作效率 <b>翻倍</b>。<q>你要去的地方。</q>','Factory',1);
		new Game.TieredUpgrade('童工','工厂工作效率 <b>翻倍</b>。<q>更便宜,更健康的劳动力。</q>','Factory',2);
		new Game.TieredUpgrade('血汗工厂','工厂工作效率 <b>翻倍</b>。<q>游手好闲的人将被解雇。</q>','Factory',3);
		
		order=400;
		new Game.TieredUpgrade('糖气','矿工工作效率 <b>翻倍</b>。<q>在一些巧克力洞穴的深处发现了一种粉红色的挥发性气体。</q>','Mine',1);
		new Game.TieredUpgrade('大型钻','矿工工作效率 <b>翻倍</b>。<q>你太深了。</q>','Mine',2);
		new Game.TieredUpgrade('超级钻','矿工工作效率 <b>翻倍</b>。<q>终于妥协了?</q>','Mine',3);
		
		order=600;
		new Game.TieredUpgrade('香草星云','装船工作效率 <b>翻倍</b>。<q>如果你去掉了你的太空头盔，你可能会闻到它!<br/>(注意:不要那样做。)</q>','Shipment',1);
		new Game.TieredUpgrade('虫洞','装船工作效率 <b>翻倍</b>。<q>通过使用这些快捷方式，你的船只可以行驶得更快。</q>','Shipment',2);
		new Game.TieredUpgrade('飞行常客','装船工作效率 <b>翻倍</b>。<q>很快回来!</q>','Shipment',3);
		
		order=700;
		new Game.TieredUpgrade('锑','炼金实验室工作效率 <b>翻倍</b>。<q>确实值得一大笔钱。</q>','Alchemy lab',1);
		new Game.TieredUpgrade('面团的本质','炼金实验室工作效率 <b>翻倍</b>。<q>从炼化烘焙的5个古老步骤中提取。</q>','Alchemy lab',2);
		new Game.TieredUpgrade('真正的巧克力','炼金实验室工作效率 <b>翻倍</b>。<q>可可的最纯净的形式。</q>','Alchemy lab',3);
		
		order=800;
		new Game.TieredUpgrade('古碑文','传送门工作效率 <b>翻倍</b>。<q>一块奇怪的花生脆饼，拿着一个古老的饼干食谱。太棒了!</q>','Portal',1);
		new Game.TieredUpgrade('疯狂的燕麦工人','传送门工作效率 <b>翻倍</b>。<q>起来，我的奴才们!</q>','Portal',2);
		new Game.TieredUpgrade('灵魂纽带','传送门工作效率 <b>翻倍</b>。<q>所以我只是注册并得到更多的饼干?当然，管他呢!</q>','Portal',3);
		
		order=900;
		new Game.TieredUpgrade('通量电容器','时光机器工作效率 <b>翻倍</b>。<q>烤到未来。</q>','Time machine',1);
		new Game.TieredUpgrade('时间悖论解析器','时光机器工作效率 <b>翻倍</b>。<q>别再和你的老奶奶鬼混了!</q>','Time machine',2);
		new Game.TieredUpgrade('量子难题','时光机器工作效率 <b>翻倍</b>。<q>只有一个常数，那就是普遍的不确定性。<br>是这样吗?</q>','Time machine',3);
		
		order=20000;
		new Game.Upgrade('小猫助手','你的牛奶越多，你获得的<b>饼干每秒产量越多</b>。<q>喵~我可以帮你吗？</q>',9000000,Game.GetIcon('Kitten',1));Game.last.kitten=1;Game.MakeTiered(Game.last,1,18);
		new Game.Upgrade('小猫工人','你的牛奶越多，你获得的<b>饼干每秒产量越多</b>。<q>喵喵喵喵</q>',9000000000,Game.GetIcon('Kitten',2));Game.last.kitten=1;Game.MakeTiered(Game.last,2,18);
		
		order=10000;
		Game.NewUpgradeCookie({name:'原味饼干',desc:'我们都得从某个地方开始。',icon:[2,3],power:																1,	price:	999999});
		Game.NewUpgradeCookie({name:'糖饼干',desc:'美味可口，如果有点缺乏想象力的话。',icon:[7,3],power:									1,	price:	999999*5});
		Game.NewUpgradeCookie({name:'燕麦葡萄干饼干',desc:'没有人会憎恨这些。',icon:[0,3],power:									1,	price:	9999999});
		Game.NewUpgradeCookie({name:'花生酱饼干',desc:'给自己一些果酱饼干!',icon:[1,3],power:								1,	price:	9999999*5});
		Game.NewUpgradeCookie({name:'椰子饼干',desc:'片状,但不可靠。有些人为此疯狂。',icon:[3,3],power:											2,	price:	99999999});
		order=10001;
		Game.NewUpgradeCookie({name:'白巧克力饼干',desc:'我知道你会说什么。这只是可可脂!这不是真正的巧克力!<br>哦，拜托。',icon:[4,3],power:2,	price:	99999999*5});
		Game.NewUpgradeCookie({name:'坚果饼干',desc:'它们真是好吃极了!',icon:[5,3],power:								2,	price:	999999999});
		Game.NewUpgradeCookie({name:'双层饼干',desc:'双倍的饼干<br>双倍的美味<br>(双倍卡路里)',icon:[6,3],power:2,	price:	999999999*5});
		Game.NewUpgradeCookie({name:'白巧克力坚果饼干',desc:'奥泰伊的最爱。',icon:[8,3],power:						2,	price:	9999999999});
		Game.NewUpgradeCookie({name:'全巧克力饼干',desc:'巧克力剂。',icon:[9,3],power:												2,	price:	9999999999*5});
		
		order=100;
		new Game.Upgrade('千万亿手指','鼠标和游标获得 <b>+500</b> 每个非游标建筑生产的饼干数。<q>点点点点点点点点点点点点</q>',10000000000,[0,17]);Game.MakeTiered(Game.last,8,0);
		
		order=200;new Game.TieredUpgrade('西梅汁','老奶奶工作效率 <b>翻倍</b>。<q>让我走。</q>','Grandma',4);
		order=300;new Game.TieredUpgrade('转基因饼干','农场工作效率 <b>翻倍</b>。<q>全自然变异。</q>','Farm',4);
		order=500;new Game.TieredUpgrade('镭反应堆','工厂工作效率 <b>翻倍</b>。<q>让你的饼干焕发光彩。</q>','Factory',4);
		order=400;new Game.TieredUpgrade('天涯钻','矿山工作效率 <b>翻倍</b>。<q>穿过天空，等等。</q>','Mine',4);
		order=600;new Game.TieredUpgrade('曲速驱动','装船工作效率 <b>翻倍</b>。<q>大胆地烘烤。</q>','Shipment',4);
		order=700;new Game.TieredUpgrade('美味食物','炼金实验室工作效率 <b>翻倍</b>。<q>把这个加入到饼干的混合物中肯定会让他们更容易上瘾!<br>也许是危险的。<br>希望你能继续合法地销售这些产品。</q>','Alchemy lab',4);
		order=800;new Game.TieredUpgrade('理智之舞','传送门工作效率 <b>翻倍</b>。<q>如果我们愿意，我们可以改变。<br>我们可以把我们的大脑抛在脑后。</q>','Portal',4);
		order=900;new Game.TieredUpgrade('因果关系的执行者','时光机器工作效率 <b>翻倍</b>。<q>发生了什么,发生了。</q>','Time machine',4);
		
		order=5000;
		new Game.Upgrade('幸运日','黄金饼干出现工作效率 <b>两倍一样的频繁</b> 并且停留 <b>两倍的时间</b>.<q>哦，嗨，一枚四叶的硬币！</q>',777777777,[27,6]);
		new Game.Upgrade('意外的惊喜','黄金饼干出现工作效率 <b>两倍一样的频繁</b> 并且停留 <b>两倍的时间</b>.<q>多么快乐!七个马蹄铁!</q>',77777777777,[27,6]);
		
		order=20000;
		new Game.Upgrade('小猫工程师','你的牛奶越多，你获得的<b>饼干每秒产量越多<q>喵喵喵，先生</q>',90000000000000,Game.GetIcon('Kitten',3));Game.last.kitten=1;Game.MakeTiered(Game.last,3,18);
		
		order=10020;
		Game.NewUpgradeCookie({name:'黑巧克力饼干',desc:'这些光吸收的光线如此之好，你几乎需要眯着眼才能看到它们。',icon:[10,3],power:			4,	price:	99999999999});
		Game.NewUpgradeCookie({name:'白巧克力饼干',desc:'这些令人眼花缭乱的饼干绝对是有味道的。',icon:[11,3],power:					4,	price:	99999999999});
		
		Game.GrandmaSynergies=[];
		Game.GrandmaSynergy=function(name,desc,building)
		{
			var building=Game.Objects[building];
			var grandmaNumber=(building.id-1);
<<<<<<< HEAD:main.js
			if (grandmaNumber==1) grandmaNumber='老奶奶';
			else grandmaNumber+=' 老奶奶';
			return '老奶奶工作效率 <b>翻倍</b>. '+cnsigle(building.plural)+' 获得 <b>+1% 饼干每秒总产量</b> 每 '+grandmaNumber+'.';
		}
		
		order=250;
		new Game.Upgrade('农民老奶奶',Game.getGrandmaSynergyUpgradeDesc('Farm')+'<q>一个种植更多饼干的好农夫。</q>',Game.Objects['Farm'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('矿工老奶奶',Game.getGrandmaSynergyUpgradeDesc('Mine')+'<q>一个挖更多饼干的好矿工。</q>',Game.Objects['Mine'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('工人老奶奶',Game.getGrandmaSynergyUpgradeDesc('Factory')+'<q>一个制造更多饼干的好工人。</q>',Game.Objects['Factory'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		order=255;
		new Game.Upgrade('宇宙老奶奶',Game.getGrandmaSynergyUpgradeDesc('Shipment')+'<q>一个好东西去……阿……更多饼干。</q>',Game.Objects['Shipment'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('嬗变老奶奶',Game.getGrandmaSynergyUpgradeDesc('Alchemy lab')+'<q>一个漂亮的金色奶奶转换更多的饼干。</q>',Game.Objects['Alchemy lab'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('改造老奶奶',Game.getGrandmaSynergyUpgradeDesc('Portal')+'<q>一个好的奶奶去烘##########</q>',Game.Objects['Portal'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('老奶奶的奶奶',Game.getGrandmaSynergyUpgradeDesc('Time machine')+'<q>奶奶的好奶奶，烘烤双倍的饼干。</q>',Game.Objects['Time machine'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
=======
			if (grandmaNumber==1) grandmaNumber='grandma';
			else grandmaNumber+=' grandmas';
			desc='Grandmas are <b>twice</b> as efficient. '+(building.plural.charAt(0).toUpperCase()+building.plural.slice(1))+' gain <b>+1% CpS</b> per '+grandmaNumber+'.<q>'+desc+'</q>';
			
			var upgrade=new Game.Upgrade(name,desc,building.basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
			building.grandma=upgrade;
			upgrade.buildingTie=building;
			Game.GrandmaSynergies.push(upgrade.name);
			return upgrade;
		}
		
		order=250;
		Game.GrandmaSynergy('Farmer grandmas','A nice farmer to grow more cookies.','Farm');
		Game.GrandmaSynergy('Miner grandmas','A nice miner to dig more cookies.','Mine');
		Game.GrandmaSynergy('Worker grandmas','A nice worker to manufacture more cookies.','Factory');
		Game.GrandmaSynergy('Cosmic grandmas','A nice thing to... uh... cookies.','Shipment');
		Game.GrandmaSynergy('Transmuted grandmas','A nice golden grandma to convert into more cookies.','Alchemy lab');
		Game.GrandmaSynergy('Altered grandmas','a NiCe GrAnDmA tO bA##########','Portal');
		Game.GrandmaSynergy('Grandmas\' grandmas','A nice grandma\'s nice grandma to bake double the cookies.','Time machine');
>>>>>>> 20180919:main.js
		
		order=14000;
		Game.baseResearchTime=Game.fps*60*30;
		Game.SetResearch=function(what,time)
		{
			if (Game.Upgrades[what] && !Game.Has(what))
			{
				Game.researchT=Game.baseResearchTime;
				if (Game.Has('持久的记忆')) Game.researchT=Math.ceil(Game.baseResearchTime/10);
				if (Game.Has('超音波')) Game.researchT=Game.fps*5;
				Game.nextResearch=Game.Upgrades[what].id;
				if (Game.prefs.popups) Game.Popup('研究已经开始。');
				else Game.Notify('研究已经开始','你的宾果中心/研究中心正在进行实验。',[9,0]);
			}
		}
		
		new Game.Upgrade('宾果游戏中心/研究设施','老奶奶操作的科学实验室和休闲俱乐部。<br>老奶奶工作效率工作效率 <b>4 倍</b>。<br><b>定期解锁新升级</b>.<q>还有什么能阻止这些老奶奶们呢?...<br>宾果。</q>',1000000000000000,[11,9],function(){Game.SetResearch('专业巧克力片');});Game.last.noPerm=1;
		
		order=15000;
		new Game.Upgrade('专业巧克力片','饼干生产增加 <b>+1%</b>.<q>电脑设计的巧克力片。电脑芯片，如果你愿意。</q>',1000000000000000,[0,9],function(){Game.SetResearch('可可豆设计师');});Game.last.pool='tech';
		new Game.Upgrade('可可豆设计师','饼干生产增加 <b>+2%</b>.<q>现在比以前更符合空气动力学了!</q>',2000000000000000,[1,9],function(){Game.SetResearch('仪式滚针');});Game.last.pool='tech';
		new Game.Upgrade('仪式滚针','老奶奶工作效率 <b>翻倍</b>。<q>多年的科学研究成果!</q>',4000000000000000,[2,9],function(){Game.SetResearch('地下烤箱');});Game.last.pool='tech';
		new Game.Upgrade('地下烤箱','饼干生产增加 <b>+3%</b>.<q>当然是靠科学的力量!</q>',8000000000000000,[3,9],function(){Game.SetResearch('同心协力');});Game.last.pool='tech';
		new Game.Upgrade('同心协力','每个老奶奶收获 <b>+0.0<span></span>2 基本秒收益老奶奶</b>.<div class="warning">注意:祖母们越来越焦躁不安。不要鼓励他们。</div><q>我们是一个。我们有很多。</q>',16000000000000000,[4,9],function(){Game.elderWrath=1;Game.SetResearch('奇异果');Game.storeToRefresh=1;});Game.last.pool='tech';
		//Game.last.clickFunction=function(){return confirm('Warning : purchasing this will have unexpected, and potentially undesirable results!\nIt\'s all downhill from here. You have been warned!\nPurchase anyway?');};
		Game.RequiresConfirmation(Game.last,'<div class="block"><b>警告 :</b> 购买这种产品将会带来意想不到的结果，而且可能会带来意想不到的后果!<br><small>从这里开始，一切都在走下坡路。我已经警告过你了!</small><br><br>还是购买?</small></div>');
		new Game.Upgrade('奇异果','饼干生产增加 <b>+4%</b>.<q>你会为这些疯狂的!</q>',32000000000000000,[5,9],function(){Game.SetResearch('集体洗脑');});Game.last.pool='tech';
		new Game.Upgrade('集体洗脑','每一个奶奶的收益 <b>+0.0<span></span>2 基本秒收益老奶奶</b>.<div class="warning">注:继续进行科学研究可能会产生意想不到的结果。我已经警告过你了!</div><q>我们融合。我们合并。我们成长。</q>',64000000000000000,[6,9],function(){Game.elderWrath=2;Game.SetResearch('神秘的糖');Game.storeToRefresh=1;});Game.last.pool='tech';
		new Game.Upgrade('神秘的糖','饼干生产增加 <b>+5%</b>.<q>尝起来像昆虫、韧带和糖蜜。</q>',128000000000000000,[7,9],function(){Game.SetResearch('长者盟约');});Game.last.pool='tech';
		new Game.Upgrade('长者盟约','每一个老奶奶收益 <b>+0.0<span></span>5 基础饼干秒生产量每个传送门</b>.<div class="warning">注意:这不是一个好主意。</div><q>今天我们起来<br/>爬着爬着爬着爬着</q>',256000000000000000,[8,9],function(){Game.elderWrath=3;Game.storeToRefresh=1;});Game.last.pool='tech';
		new Game.Upgrade('老人的承诺','包含了长老们的愤怒，至少是暂时的。<q>这是一个简单的仪式，包括抗老化奶油，饼干面糊在月光下，和一只活鸡。</q>',1,[9,9],function()
		{
			Game.elderWrath=0;
			Game.pledges++;
			Game.pledgeT=Game.getPledgeDuration();
			Game.Unlock('老人契约');
			Game.CollectWrinklers();
			Game.storeToRefresh=1;
		});
		Game.getPledgeDuration=function(){return Game.fps*60*(Game.Has('牺牲擀面杖')?60:30);}
		Game.last.pool='toggle';
		Game.last.displayFuncWhenOwned=function(){return '<div style="text-align:center;">直到承诺用完剩下的时间 :<br><b>'+Game.sayTime(Game.pledgeT,-1)+'</b></div>';}
		Game.last.timerDisplay=function(){if (!Game.Upgrades['老人的承诺'].bought) return -1; else return 1-Game.pledgeT/Game.getPledgeDuration();}
		Game.last.priceFunc=function(){return Math.pow(8,Math.min(Game.pledges+2,14));}
		
		Game.last.descFunc=function(){
			return '<div style="text-align:center;">'+(Game.pledges==0?'You haven\'t pledged to the elders yet.':('You\'ve pledged to the elders <b>'+(Game.pledges==1?'once':Game.pledges==2?'twice':(Game.pledges+' times'))+'</b>.'))+'<div class="line"></div></div>'+this.desc;
		};
		
		
		order=150;
		new Game.Upgrade('塑料鼠标','点击获得 <b>+1% 总秒收益</b>.<q>轻微的吱吱作响。</q>',50000,[11,0]);Game.MakeTiered(Game.last,1,11);
		new Game.Upgrade('铁制鼠标','点击获得 <b>+1% 总秒收益</b>.<q>按一下，1349 !</q>',5000000,[11,1]);Game.MakeTiered(Game.last,2,11);
		new Game.Upgrade('钛制鼠标','点击获得 <b>+1% 总秒收益</b>.<q>重,但功能强大。</q>',500000000,[11,2]);Game.MakeTiered(Game.last,3,11);
		new Game.Upgrade('釉质鼠标','点击获得 <b>+1% 总秒收益</b>.<q>你可以用这些来切割钻石。</q>',50000000000,[11,13]);Game.MakeTiered(Game.last,4,11);
		
		order=40000;
		new Game.Upgrade('超音波','研究只需要 <b>5 秒</b>.<q>是的,科学!</q>',7,[9,2]);//debug purposes only
		Game.last.pool='debug';
		
		order=10020;
		Game.NewUpgradeCookie({name:'日食饼干',desc:'注意饼干.',icon:[0,4],power:					2,	price:	99999999999*5});
		Game.NewUpgradeCookie({name:'斑马饼干',desc:'...',icon:[1,4],power:									2,	price:	999999999999});
		
		order=100;
		new Game.Upgrade('万兆手指','鼠标和游标获得 <b>+5000</b> 每个非游标建筑生产的饼干数。<q>年轻人,你只需要点击，点击，点击，点击, 这真的很简单, 年轻人.</q>',10000000000000,[0,18]);Game.MakeTiered(Game.last,9,0);
		
		order=40000;
		new Game.Upgrade('Gold hoard','黄金饼干出现 <b>更加频繁</b>.<q>那真是太多了。</q>',7,[10,14]);//debug purposes only
		Game.last.pool='debug';
		
		order=15000;
		new Game.Upgrade('老人契约','将永久结束长老的愤怒, 价格是 5% 总秒收益。<q>这是一种复杂的仪式，包括一些愚蠢的、无关紧要的琐事，比如被诅咒的泻药、有百年历史的可可和一个婴儿。<br>不要质疑它。</q>',66666666666666,[8,9],function()
		{
			Game.pledgeT=0;
			Game.Lock('撤销老人契约');
			Game.Unlock('撤销老人契约');
			Game.Lock('老人的承诺');
			Game.Win('平静的老人');
			Game.CollectWrinklers();
			Game.storeToRefresh=1;
		});
		Game.last.pool='toggle';

		new Game.Upgrade('撤销老人契约','你会得到 5% 饼干秒生产量, 但是老奶奶们会回来的。<q>我们<br>再次<br>出现</q>',6666666666,[8,9],function()
		{
			Game.Lock('老人契约');
			Game.Unlock('老人契约');
		});
		Game.last.pool='toggle';
		
		order=5000;
		new Game.Upgrade('走运','黄金饼干效果至少持续 <b>两倍的时间</b>。<q>你整晚都没睡，是吧?</q>',77777777777777,[27,6]);
		
		order=15000;
		new Game.Upgrade('牺牲擀面杖','长者承诺至少持续 <b>翻倍</b> 的时间。<q>这些主要是为了推广抗衰老面霜。<br>(而且还可以缩短鸡的痛苦。)</q>',2888888888888,[2,9]);
		
		order=10020;
		Game.NewUpgradeCookie({name:'肉桂奶油饼干',desc:'确实是他们的名字。',icon:[2,4],power:												2,	price:	999999999999*5});
		Game.NewUpgradeCookie({name:'荷式松饼干',desc:'如果不是荷兰人，那就太不重要了。',icon:[3,4],power:									2,	price:	9999999999999});
		Game.NewUpgradeCookie({name:'蛋白杏仁饼干',desc:'不要和马卡龙混淆。<br>这些有椰子，好吗?',icon:[4,4],power:			2,	price:	9999999999999*5});
		
		order=40000;
		new Game.Upgrade('神经占卜','可以在统计菜单中随意开启和关闭升级。<q>也可以派人去看那些看不到的东西。</q>',7,[4,9]);//debug purposes only
		Game.last.pool='debug';
		
		order=10030;
		Game.NewUpgradeCookie({name:'帝国饼干',desc:'当然，对你不断增长的饼干帝国来说！',icon:[5,4],power:											2,	price:	99999999999999});
		Game.NewUpgradeCookie({name:'英国茶饼干',desc:'确实。',icon:[6,4],require:'一罐英国茶饼干',power:									2,	price:	99999999999999});
		Game.NewUpgradeCookie({name:'英国茶巧克力饼干',desc:'是的，没错。',icon:[7,4],require:Game.last.name,power:									2,	price:	99999999999999});
		Game.NewUpgradeCookie({name:'圆形英国茶饼干',desc:'是的，很吸引人。',icon:[8,4],require:Game.last.name,power:								2,	price:	99999999999999});
		Game.NewUpgradeCookie({name:'圆巧克力英国茶饼干',desc:'是的，的确很吸引人。',icon:[9,4],require:Game.last.name,power:				2,	price:	99999999999999});
		Game.NewUpgradeCookie({name:'有心形图案的圆形英国茶饼干',desc:'是的，很吸引人，老伙计。',icon:[10,4],require:Game.last.name,power:	2,	price:	99999999999999});
		Game.NewUpgradeCookie({name:'有心形图案的圆巧克力英国茶饼干',desc:'我喜欢饼干。',icon:[11,4],require:Game.last.name,power:		2,	price:	99999999999999});
		
		order=1000;
		new Game.TieredUpgrade('糖玻色子','反物质冷凝器工作效率 <b>翻倍</b>。<q>可爱的公司玻色子。','Antimatter condenser',1);
		new Game.TieredUpgrade('弦理论','反物质冷凝器工作效率 <b>翻倍</b>。<q>揭示烘烤饼干的真正意义(还有，作为奖励，宇宙的结构)。</q>','Antimatter condenser',2);
		new Game.TieredUpgrade('大马卡龙对撞机','反物质冷凝器工作效率 <b>翻倍</b>。<q>多么奇异!</q>','Antimatter condenser',3);
		new Game.TieredUpgrade('大爆炸烘烤','反物质冷凝器工作效率 <b>翻倍</b>。<q>这就是一切的开始。</q>','Antimatter condenser',4);

		order=255;
<<<<<<< HEAD:main.js
		new Game.Upgrade('反物质奶奶',Game.getGrandmaSynergyUpgradeDesc('Antimatter condenser')+'<q>一个吝啬的反物质奶奶吐出更多饼干<br>(不要将其与正常奶奶接触；否则可能会发生物质损失。)</q>',Game.Objects['Antimatter condenser'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
=======
		Game.GrandmaSynergy('Antigrandmas','A mean antigrandma to vomit more cookies.','Antimatter condenser');
>>>>>>> 20180919:main.js

		order=10020;
		Game.NewUpgradeCookie({name:'玛德琳蛋糕',desc:'难忘的!',icon:[12,3],power:																2,	price:	99999999999999*5});
		Game.NewUpgradeCookie({name:'蝴蝶酥',desc:'比你还好!',icon:[13,3],power:																2,	price:	99999999999999*5});
		Game.NewUpgradeCookie({name:'调色板',desc:'你可以用这些来打曲棍球。我的意思是，你可以试一试。',icon:[12,4],power:	2,	price:	999999999999999});
		Game.NewUpgradeCookie({name:'沙琪玛饼干',desc:'这个名字暗示着它们是由沙子构成的。但你知道得更好，不是吗?',icon:[13,4],power:	2,	price:	999999999999999});
		
		order=20000;
		new Game.Upgrade('小猫监工','你的牛奶越多，你获得的<b>饼干每秒产量越多<q>我的目的是为您服务，先生</q>',90000000000000000,Game.GetIcon('Kitten',4));Game.last.kitten=1;Game.MakeTiered(Game.last,4,18);
		
		
		order=100;
		new Game.Upgrade('百万的六乘方手指','鼠标和游标获得 <b>+50000</b> 每个非游标建筑生产的饼干数。<q>有时<br>事情只是<br>点击</q>',10000000000000000,[0,19]);Game.MakeTiered(Game.last,10,0);
		
		order=200;new Game.TieredUpgrade('双层厚眼镜','老奶奶工作效率 <b>翻倍</b>。<q>哦……所以这就是我一直在烘焙的东西。</q>','Grandma',5);
		order=300;new Game.TieredUpgrade('姜饼稻草人','农场工作效率 <b>翻倍</b>。<q>看着你的庄稼，带着淘气的欢乐。</q>','Farm',5);
		order=500;new Game.TieredUpgrade('重新组合','工厂工作效率 <b>翻倍</b>。<q>这是饼干的主要组成部分。</q>','Factory',5);
		order=400;new Game.TieredUpgrade('氢弹开采','矿山工作效率 <b>翻倍</b>。<q>虽然效率有问题，但还是很壮观。</q>','Mine',5);
		order=600;new Game.TieredUpgrade('巧克力块','装船工作效率 <b>翻倍</b>。<q>我的上帝。全是巧克力棒。</q>','Shipment',5);
		order=700;new Game.TieredUpgrade('甲壳纲','炼金实验室工作效率 <b>翻倍</b>。<q>小心点，一滴太多，你就会得到松饼。<br>没有人喜欢松饼。</q>','Alchemy lab',5);
		order=800;new Game.TieredUpgrade('膜移植','传送门工作效率 <b>翻倍</b>。<q>这指的是将更高维度的宇宙，或“膜”，与我们自己的相结合，以方便运输(和收获宝贵的饼干面团)。</q>','Portal',5);
		order=900;new Game.TieredUpgrade('昨天比较器','时光机器工作效率 <b>翻倍</b>。<q>两周进入千禧年。</q>','Time machine',5);
		order=1000;new Game.TieredUpgrade('反向回旋加速器','反物质冷凝器工作效率 <b>翻倍</b>。<q>它们可以不碰撞粒子和不旋转的原子。为…嗯…更好的味道,和东西。</q>','Antimatter condenser',5);
		
		order=150;
		new Game.Upgrade('难得素鼠标','点击获得 <b>+1% 总秒收益</b>.<q>这些漂亮的鼠标就够了。</q>',5000000000000,[11,14]);Game.MakeTiered(Game.last,5,11);
		
		order=10020;
		Game.NewUpgradeCookie({name:'卡拉恐鸟',desc:'那个戒指很漂亮。',icon:[14,4],require:'品牌饼干盒',power:					3,	price:	9999999999999999});
		Game.NewUpgradeCookie({name:'萨松',desc:'老奶奶最喜欢的是什么?',icon:[15,3],require:'品牌饼干盒',power:									3,	price:	9999999999999999});
		Game.NewUpgradeCookie({name:'短管',desc:'再次失败!',icon:[15,4],require:'品牌饼干盒',power:										3,	price:	9999999999999999});
		Game.NewUpgradeCookie({name:'赢得薄荷糖',desc:'它们是你吃过的最幸运的饼干!',icon:[14,3],require:'品牌饼干盒',power:	3,	price:	9999999999999999});
		
		order=40000;
		new Game.Upgrade('完美的空转','即使游戏关闭，你也会继续生产饼干。<q>这是我所见过的最美的东西。</q>',7,[10,0]);//debug purposes only
		Game.last.pool='debug';
		
		order=10030;
		Game.NewUpgradeCookie({name:'无花果胶子',desc:'一切都搞定了。',icon:[17,4],require:'品牌饼干盒',power:													2,	price:	999999999999999*5});
		Game.NewUpgradeCookie({name:'洛丽醇',desc:'因为,呃…它们值得吗?',icon:[16,3],require:'品牌饼干盒',power:												2,	price:	999999999999999*5});
		Game.NewUpgradeCookie({name:'佳发蛋糕',desc:'如果你想从头开始烤一个饼干，你必须先建一个工厂。',icon:[17,3],require:'品牌饼干盒',power:	2,	price:	999999999999999*5});
		Game.NewUpgradeCookie({name:'油脂杯',desc:'特别油腻的花生酱。',icon:[16,4],require:'品牌饼干盒',power:												2,	price:	999999999999999*5});
		
		order=30000;
		new Game.Upgrade('天堂芯片的秘密','解锁 <b>5%</b> 你的威望等级的潜力。<q>授予天堂芯片的知识,以及如何使用它们来提高烘焙的效率。<br>这是每个人的秘密。</q>',11,[19,7]);Game.last.noPerm=1;
		new Game.Upgrade('天堂饼干站','解锁 <b>25%</b> 你的威望等级的潜力。<q>别忘了去参观天堂的柠檬水摊。来世给你柠檬...</q>',1111,[18,7]);Game.last.noPerm=1;
		new Game.Upgrade('天堂面包店','解锁 <b>50%</b> 你的威望等级的潜力。<q>还卖神圣的蛋糕和神圣的点心。椒盐卷饼也不坏。</q>',111111,[17,7]);Game.last.noPerm=1;
		new Game.Upgrade('天堂糖果店','解锁 <b>75%</b> 你的威望等级的潜力。<q>他们说天使面包师在那里工作。他们带着天使午餐休息，有时还会进行天使袭击。</q>',11111111,[16,7]);Game.last.noPerm=1;
		new Game.Upgrade('天国的钥匙','解锁 <b>100%</b> 你的威望等级的潜力。<q>这是做馅饼天堂的珍珠(和美味)大门的关键，让你可以进入你的整个储存的天堂芯片，用于烘焙。<br>请明智地使用它们。</q>',1111111111,[15,7]);Game.last.noPerm=1;
		
		order=10100;
<<<<<<< HEAD:main.js
		Game.NewUpgradeCookie({name:'骷髅饼干',desc:'想知道什么鬼东西吗?你现在脑子里有个想法。',locked:1,icon:[12,8],power:	2, price: 444444444444});
		Game.NewUpgradeCookie({name:'鬼饼干',desc:'它们很奇怪，但看起来很不错!',locked:1,icon:[13,8],power:								2, price: 444444444444});
		Game.NewUpgradeCookie({name:'蝙蝠饼干',desc:'这个小镇值得拥有的饼干。',locked:1,icon:[14,8],power:														2, price: 444444444444});
		Game.NewUpgradeCookie({name:'粘液饼干',desc:'令人难以置信的融化饼干!',locked:1,icon:[15,8],power: 														2, price: 444444444444});
		Game.NewUpgradeCookie({name:'南瓜饼干',desc:'连南瓜味都没有。味道像玻璃。是啊。',locked:1,icon:[16,8],power:								2, price: 444444444444});
		Game.NewUpgradeCookie({name:'眼球饼干',desc:'当你盯着饼干的时候，饼干会盯着你看。',locked:1,icon:[17,8],power:						2, price: 444444444444});
		Game.NewUpgradeCookie({name:'蜘蛛饼干',desc:'你在网上找到了这个菜谱。他们做任何饼干都可以。',locked:1,icon:[18,8],power:						2, price: 444444444444});

=======
		Game.NewUpgradeCookie({name:'Skull cookies',desc:'Wanna know something spooky? You\'ve got one of these inside your head RIGHT NOW.',locked:1,icon:[12,8],power:	2, price: 444444444444});
		Game.NewUpgradeCookie({name:'Ghost cookies',desc:'They\'re something strange, but they look pretty good!',locked:1,icon:[13,8],power:								2, price: 444444444444});
		Game.NewUpgradeCookie({name:'Bat cookies',desc:'The cookies this town deserves.',locked:1,icon:[14,8],power:														2, price: 444444444444});
		Game.NewUpgradeCookie({name:'Slime cookies',desc:'The incredible melting cookies!',locked:1,icon:[15,8],power: 														2, price: 444444444444});
		Game.NewUpgradeCookie({name:'Pumpkin cookies',desc:'Not even pumpkin-flavored. Tastes like glazing. Yeugh.',locked:1,icon:[16,8],power:								2, price: 444444444444});
		Game.NewUpgradeCookie({name:'Eyeball cookies',desc:'When you stare into the cookie, the cookie stares back at you.',locked:1,icon:[17,8],power:						2, price: 444444444444});
		Game.NewUpgradeCookie({name:'Spider cookies',desc:'You found the recipe on the web. They do whatever a cookie can.',locked:1,icon:[18,8],power:						2, price: 444444444444});
		
		Game.halloweenDrops=['Skull cookies','Ghost cookies','Bat cookies','Slime cookies','Pumpkin cookies','Eyeball cookies','Spider cookies'];
		
		Game.GetHowManyHalloweenDrops=function()
		{
			var num=0;
			for (var i in Game.halloweenDrops) {if (Game.Has(Game.halloweenDrops[i])) num++;}
			return num;
		}
		/*for (var i in Game.halloweenDrops)
		{
			Game.Upgrades[Game.halloweenDrops[i]].descFunc=function(){return '<div style="text-align:center;">You currently own <b>'+Game.GetHowManyHalloweenDrops()+'/'+Game.halloweenDrops.length+'</b> halloween cookies.</div><div class="line"></div>'+this.desc;};
		}*/
		
>>>>>>> 20180919:main.js
		order=0;
		new Game.Upgrade('持久的记忆','后续研究将工作效率 <b>10 倍</b> 那样快。<q>这一切都是有道理的!<br>再一次!<br>Again!</q>',500,[9,2]);Game.last.pool='prestige';
		
		order=40000;
		new Game.Upgrade('皱纹门垫','皱纹产生的频率要高得多。<q>你真是个软弱的人。</q>',7,[19,8]);//debug purposes only
		Game.last.pool='debug';
		
		order=10200;
		Game.NewUpgradeCookie({name:'圣诞树饼干',desc:'这是谁的松树?',locked:1,icon:[12,10],power:2,price: 252525252525});
		Game.NewUpgradeCookie({name:'雪花饼干',desc:'批量生产在各个方面都是独一无二的。',locked:1,icon:[13,10],power:2,price: 252525252525});
		Game.NewUpgradeCookie({name:'雪人饼干',desc:'它被冻起来了。更是如此。',locked:1,icon:[14,10],power:2,price: 252525252525});
		Game.NewUpgradeCookie({name:'冬青饼干',desc:'你不能在这些东西下面接吻。这将是槲寄生(植物学上是槲寄生的一个变种)。',locked:1,icon:[15,10],power:2,price: 252525252525});
		Game.NewUpgradeCookie({name:'糖果手杖饼干',desc:'这是一种两种享受!<br />(进一步的检查发现，糖霜并不像薄荷味，而是像普通的含糖的糖霜。)',locked:1,icon:[16,10],power:2,price: 252525252525});
		Game.NewUpgradeCookie({name:'铃铛饼干',desc:'这些与圣诞节有什么关系呢?谁在乎，给他们打电话!',locked:1,icon:[17,10],power:2,price: 252525252525});
		Game.NewUpgradeCookie({name:'目前的饼干',desc:'未来饼干的前传。小心!',locked:1,icon:[18,10],power:2,price: 252525252525});
		
		order=10020;
		Game.NewUpgradeCookie({name:'姜饼人',desc:'你喜欢先咬腿，对吗?把胳膊撕掉怎么样?你这个恶心的怪物。',icon:[18,4],power:		2,price: 9999999999999999});
		Game.NewUpgradeCookie({name:'姜饼树',desc:'常青树糕点形式。你所能想到的会让你大吃一惊。',icon:[18,3],power:							2,price: 9999999999999999});
		
		order=25000;
		new Game.Upgrade('节庆帽子','<b>解锁了... 一些东西。</b><q>没有一只动物在动，连一只老鼠也没有。</q>',25,[19,9],function()
		{
			var drop=choose(Game.santaDrops);
			Game.Unlock(drop);
			if (Game.prefs.popups) Game.Popup('在节日的礼帽里，你会发现……<br>一个节日测试管<br>和 '+drop+'.');
			else Game.Notify('在节日的礼帽里，你会发现……','一个节日测试管<br>和 <b>'+drop+'</b>.',Game.Upgrades[drop].icon);
		});
		
		new Game.Upgrade('增加愉快','饼干生产增加 <b>+15%</b>.<br>以圣诞老人等级为标准的成本衡量表。<q>结果证明这是增加愉快, 奇怪的是,恰好是一个不错的篝火和一些年代习俗。<br>你知道他们说什么，毕竟;越多越好，越多越好。</q>',2525,[17,9]);
		new Game.Upgrade('改良愉快','饼干生产增加 <b>+15%</b>.<br>以圣诞老人等级为标准的成本衡量表。<q>一个摇摇欲坠的小肚子会有很长的路要走。<br>你快乐吗?</q>',2525,[17,9]);
		new Game.Upgrade('一堆煤','饼干生产增加 <b>+1%</b>.<br>以圣诞老人等级为标准的成本衡量表。<q>一些世界上最糟糕的袜子填充物。<br/>我猜你可以尝试开创自己的小工业革命，还是别的什么?...</q>',2525,[13,9]);
		new Game.Upgrade('发痒的毛衣','饼干生产增加 <b>+1%</b>.<br>以圣诞老人等级为标准的成本衡量表。<q>你不知道更糟糕的是什么:那个令人尴尬的古怪的“驯鹿”图案，或者穿着它会让你感觉像被一个死去的大脚野人裹住一样。</q>',2525,[14,9]);
		new Game.Upgrade('驯鹿烘烤场','驯鹿出现频率 <b>两倍频繁</b>.<br>以圣诞老人等级为标准的成本衡量表。<q>雄性驯鹿来自火星;雌性驯鹿是鹿肉。</q>',2525,[12,9]);
		new Game.Upgrade('加重雪橇','驯鹿离开速度 <b>放慢2倍</b>.<br>以圣诞老人等级为标准的成本衡量表。<q>希望它物有所值。<br>(某物被迫成为某物)</q>',2525,[12,9]);
		new Game.Upgrade('何蚝味糖霜','点击驯鹿的奖励 <b>翻倍</b>.<br>以圣诞老人等级为标准的成本衡量表。<q>这是我该起床的时候了。</q>',2525,[12,9]);
		new Game.Upgrade('季节储蓄','所有建筑都便宜 <b>1%</b>.<br>以圣诞老人等级为标准的成本衡量表。<q>圣诞老人的胡子，什么储蓄!<br/>谁会来救我们?</q>',2525,[16,9],function(){Game.storeToRefresh=1;});
		new Game.Upgrade('玩具车间','所有升级都便宜 <b>5% </b>.<br>以圣诞老人等级为标准的成本衡量表。<q>看着你身边的精灵，他们可能会偷走我们的生产秘密。<br>或者更糟!</q>',2525,[16,9],function(){Game.upgradesToRebuild=1;});
		new Game.Upgrade('淘气名单','老奶奶工作效率 <b>翻倍</b> .<br>以圣诞老人等级为标准的成本衡量表。<q>这个名单包含了每一个由格兰德克德人延续的不神圣的行为。<br>他赢不了两次了。<br>一次。一次就足够了。</q>',2525,[15,9]);
		new Game.Upgrade('圣诞老人的无底包','随机掉落 <b>10% 更常见的</b>.<br>以圣诞老人等级为标准的成本衡量表。<q>这是你不能检查的一个底部。</q>',2525,[19,9]);
		new Game.Upgrade('圣诞老人的帮手','点击加成 <b>10% 更强大的</b>.<br>以圣诞老人等级为标准的成本衡量表。<q>一些人选择帮助汉堡包;有些人选择帮助你。<br>我想，每个人都有自己的想法。</q>',2525,[19,9]);
		new Game.Upgrade('圣诞老人的遗产','饼干生产增加 <b>+3% 每圣诞老人等级</b>.<br>以圣诞老人等级为标准的成本衡量表。<q>在北极，你得先找到精灵。当你得到精灵，你就开始制造玩具。然后当你拿到玩具的时候…然后你得到饼干。</q>',2525,[19,9]);
		new Game.Upgrade('圣诞老人的牛奶和饼干','牛奶能力加 <b>5%</b>。<br>以圣诞老人等级为标准的成本衡量表。<q>这是圣诞老人可怕的不平衡饮食的一部分。</q>',2525,[19,9]);
		
		order=40000;
		new Game.Upgrade('驯鹿的季节','驯鹿产生更频繁。<q>走,骗子!去,黑客和骗子!</q>',7,[12,9]);//debug purposes only
		Game.last.pool='debug';
		
		order=25000;
		new Game.Upgrade('圣诞老人的统治','饼干生产增加 <b>+20%</b>.<br>所有建筑成本便宜 <b>1%</b>.<br>所有升级便宜 <b>2%</b>.<q>我的名字是克劳斯，万王之王;<br>看我的玩具，你是伟大的，绝望的!</q>',2525252525252525,[19,10],function(){Game.storeToRefresh=1;});
		
		order=10300;
		var heartPower=function(){
			var pow=2;
			if (Game.Has('星际之恋')) pow=3;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('seasons');
				if (godLvl==1) pow*=1.3;
				else if (godLvl==2) pow*=1.2;
				else if (godLvl==3) pow*=1.1;
			}
			return pow;
		};
<<<<<<< HEAD:main.js
		Game.NewUpgradeCookie({name:'纯心饼干',desc:'融化的白巧克力<br/>，上面写着“我喜欢你”。',season:'valentines',icon:[19,3],													power:heartPower,price: 1000000});
		Game.NewUpgradeCookie({name:'心切饼干',desc:'一个红色的热樱桃饼干，它会将你的情感目标推向一个有趣的方向。',require:Game.last.name,season:'valentines',icon:[20,3],			power:heartPower,price: 1000000000});
		Game.NewUpgradeCookie({name:'酸心饼干',desc:'为孤独和心碎的人做酸橙饼干。',require:Game.last.name,season:'valentines',icon:[20,4],													power:heartPower,price: 1000000000000});
		Game.NewUpgradeCookie({name:'心水饼干',desc:'一个冰凉的蓝莓饼干，象征着一颗愈合的心。',require:Game.last.name,season:'valentines',icon:[21,3],												power:heartPower,price: 1000000000000000});
		Game.NewUpgradeCookie({name:'金心饼干',desc:'一个漂亮的饼干象征着善良、真爱和真诚。',require:Game.last.name,season:'valentines',icon:[21,4],										power:heartPower,price: 1000000000000000000});
		Game.NewUpgradeCookie({name:'永恒的心饼干',desc:'银色的糖霜对于一个非常特别的人来说，你已经喜欢了很长时间了。',require:Game.last.name,season:'valentines',icon:[19,4],							power:heartPower,price: 1000000000000000000000});

=======
		Game.NewUpgradeCookie({name:'Pure heart biscuits',desc:'Melty white chocolate<br>that says "I *like* like you".',season:'valentines',icon:[19,3],													power:heartPower,price: 1000000});
		Game.NewUpgradeCookie({name:'Ardent heart biscuits',desc:'A red hot cherry biscuit that will nudge the target of your affection in interesting directions.',require:Game.last.name,season:'valentines',icon:[20,3],			power:heartPower,price: 1000000000});
		Game.NewUpgradeCookie({name:'Sour heart biscuits',desc:'A bitter lime biscuit for the lonely and the heart-broken.',require:Game.last.name,season:'valentines',icon:[20,4],													power:heartPower,price: 1000000000000});
		Game.NewUpgradeCookie({name:'Weeping heart biscuits',desc:'An ice-cold blueberry biscuit, symbol of a mending heart.',require:Game.last.name,season:'valentines',icon:[21,3],												power:heartPower,price: 1000000000000000});
		Game.NewUpgradeCookie({name:'Golden heart biscuits',desc:'A beautiful biscuit to symbolize kindness, true love, and sincerity.',require:Game.last.name,season:'valentines',icon:[21,4],										power:heartPower,price: 1000000000000000000});
		Game.NewUpgradeCookie({name:'Eternal heart biscuits',desc:'Silver icing for a very special someone you\'ve liked for a long, long time.',require:Game.last.name,season:'valentines',icon:[19,4],							power:heartPower,price: 1000000000000000000000});
		
		Game.heartDrops=['Pure heart biscuits','Ardent heart biscuits','Sour heart biscuits','Weeping heart biscuits','Golden heart biscuits','Eternal heart biscuits'];
		
		Game.GetHowManyHeartDrops=function()
		{
			var num=0;
			for (var i in Game.heartDrops) {if (Game.Has(Game.heartDrops[i])) num++;}
			return num;
		}
		/*for (var i in Game.heartDrops)
		{
			Game.Upgrades[Game.heartDrops[i]].descFunc=function(){return '<div style="text-align:center;">You currently own <b>'+Game.GetHowManyHeartDrops()+'/'+Game.heartDrops.length+'</b> heart biscuits.</div><div class="line"></div>'+this.desc;};
		}*/
		
>>>>>>> 20180919:main.js
		order=1100;
		new Game.TieredUpgrade('宝石抛光','棱镜 <b>翻倍</b>。<q>摆脱污垢，让更多的光线进入。<br>真的，真是太离谱了。</q>','Prism',1);
		new Game.TieredUpgrade('9号颜色','棱镜 <b>翻倍</b>。<q>深入研究未受影响的光学深度甚至螳螂虾都没有引人注目！</q>','Prism',2);
		new Game.TieredUpgrade('巧克力之光','棱镜 <b>翻倍</b>。<q>沐浴在它的茧中。<br>(警告:可能导致各种有趣但致命的皮肤状况。)</q>','Prism',3);
		new Game.TieredUpgrade('谷粒弓','棱镜 <b>翻倍</b>。<q>记住不同的谷物使用方便的Roy G. Biv助记法:R是大米，O是燕麦…B是大麦吗?</q>','Prism',4);
		new Game.TieredUpgrade('纯粹的宇宙之光','棱镜 <b>翻倍</b>。<q>你的棱镜现在接收到来自宇宙另一端的原始、纯净的光子。</q>','Prism',5);

		order=255;
<<<<<<< HEAD:main.js
		new Game.Upgrade('彩虹老奶奶',Game.getGrandmaSynergyUpgradeDesc('Prism')+'<q>一个发光的奶奶在饼干中闪闪发光。</q>',Game.Objects['Prism'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		
		order=24000;
		Game.seasonTriggerBasePrice=1111111111;
		new Game.Upgrade('季节切换器','允许你 <b>触发节日事件</b>, 只要你出得起价钱.<q>总是会有时间.</q>',1111,[16,6],function(){for (var i in Game.seasons){Game.Unlock(Game.seasons[i].trigger);}});Game.last.pool='prestige';
		new Game.Upgrade('节日饼干','触发 <b>圣诞节</b> 在接下来的24小时。<br>触发其它节日，将会取消这个节日。<br>每个季节的开关都会增加成本。<q>是圣诞节前的那个晚上，是吗?</q>',Game.seasonTriggerBasePrice,[12,10]);Game.last.season='christmas';Game.last.pool='toggle';
		new Game.Upgrade('鬼魂饼干','触发 <b>万圣节</b> 在接下来的24小时。<br>触发另一个季节将会取消这个。<br>每个季节的开关都会增加成本。<q>恐怖的骷髅<br/>会把你吵醒</q>',Game.seasonTriggerBasePrice,[13,8]);Game.last.season='halloween';Game.last.pool='toggle';
		new Game.Upgrade('相思病饼干','触发 <b>情人节</b> 在接下来的24小时<br><br>每个季节的开关都会增加成本。<q>浪漫永远不会过时。</q>',Game.seasonTriggerBasePrice,[20,3]);Game.last.season='valentines';Game.last.pool='toggle';
		new Game.Upgrade('傻瓜的饼干','触发 <b>工作日</b> 在接下来的24小时。<br>触发另一个季节将会取消这个。<br>每个季节的开关都会增加成本。<q>生意。正经事。这完全是你的事。</q>',Game.seasonTriggerBasePrice,[17,6]);Game.last.season='fools';Game.last.pool='toggle';
=======
		Game.GrandmaSynergy('Rainbow grandmas','A luminous grandma to sparkle into cookies.','Prism');
		
		order=24000;
		Game.seasonTriggerBasePrice=1000000000;//1111111111;
		new Game.Upgrade('Season switcher','Allows you to <b>trigger seasonal events</b> at will, for a price.<q>There will always be time.</q>',1111,[16,6],function(){for (var i in Game.seasons){Game.Unlock(Game.seasons[i].trigger);}});Game.last.pool='prestige';Game.last.parents=['Heralds'];
		new Game.Upgrade('Festive biscuit','Triggers <b>Christmas season</b> for the next 24 hours.<br>Triggering another season will cancel this one.<br>Cost scales with unbuffed CpS and increases with every season switch.<q>\'Twas the night before Christmas- or was it?</q>',Game.seasonTriggerBasePrice,[12,10]);Game.last.season='christmas';Game.last.pool='toggle';
		new Game.Upgrade('Ghostly biscuit','Triggers <b>Halloween season</b> for the next 24 hours.<br>Triggering another season will cancel this one.<br>Cost scales with unbuffed CpS and increases with every season switch.<q>spooky scary skeletons<br>will wake you with a boo</q>',Game.seasonTriggerBasePrice,[13,8]);Game.last.season='halloween';Game.last.pool='toggle';
		new Game.Upgrade('Lovesick biscuit','Triggers <b>Valentine\'s Day season</b> for the next 24 hours.<br>Triggering another season will cancel this one.<br>Cost scales with unbuffed CpS and increases with every season switch.<q>Romance never goes out of fashion.</q>',Game.seasonTriggerBasePrice,[20,3]);Game.last.season='valentines';Game.last.pool='toggle';
		new Game.Upgrade('Fool\'s biscuit','Triggers <b>Business Day season</b> for the next 24 hours.<br>Triggering another season will cancel this one.<br>Cost scales with unbuffed CpS and increases with every season switch.<q>Business. Serious business. This is absolutely all of your business.</q>',Game.seasonTriggerBasePrice,[17,6]);Game.last.season='fools';Game.last.pool='toggle';
		
>>>>>>> 20180919:main.js
		
		order=40000;
		new Game.Upgrade('永恒的季节','现在的季节永远持续下去。<q>季节的味道。</q>',7,[16,6],function(){for (var i in Game.seasons){Game.Unlock(Game.seasons[i].trigger);}});//debug purposes only
		Game.last.pool='debug';
		
		
		order=20000;
		new Game.Upgrade('小猫经理','你的牛奶越多，你获得的<b>饼干每秒产量越多<q>先生，这不会造成任何问题</q>',900000000000000000000,Game.GetIcon('Kitten',5));Game.last.kitten=1;Game.MakeTiered(Game.last,5,18);
		
		order=100;
<<<<<<< HEAD:main.js
		new Game.Upgrade('巨量的手指','鼠标和游标获得 <b>+500000</b> 每个非游标建筑生产的饼干数。<q>[粗略的风格]</q>',10000000000000000000,[12,20]);Game.MakeTiered(Game.last,11,0);
		new Game.Upgrade('千的九次方手指','鼠标和游标获得 <b>+5000000</b> 每个非游标建筑生产的饼干数。<q>证明你 <b>可以</b> 把你的手指放在上面。</q>',10000000000000000000000,[12,19]);Game.MakeTiered(Game.last,12,0);
		
		order=150;new Game.Upgrade('E合金鼠标','点击获得 <b>+1% 总秒收益</b>.<q>如果我是你，我就会这么做。</q>',500000000000000,[11,15]);Game.MakeTiered(Game.last,6,11);
		new Game.Upgrade('叉合金鼠标','点击获得 <b>+1% 总秒收益</b>.<q>按一下就可以了，但是不要把你的鼠标砸在上面。开始你的游戏吧。去玩。</q>',50000000000000000,[11,16]);Game.MakeTiered(Game.last,7,11);
		order=200;new Game.TieredUpgrade('老化剂','老奶奶工作效率 <b>翻倍</b>。<q>与直觉相反的是，奶奶有一种不可思议的能力，可以变得更强大。</q>','Grandma',6);
		order=300;new Game.TieredUpgrade('脉冲星洒水器','农场工作效率 <b>翻倍</b>。<q>农场工作效率 <b>翻倍</b>。<q>不存在过度浇水的问题。潮湿是最好的。</q>','Farm',6);
		order=500;new Game.TieredUpgrade('深度烘焙过程','工厂工作效率 <b>翻倍</b>。<q>一个专利的过程增加饼干产量两倍的相同数量的原料。别问了，别拍照，一定要穿防护服。</q>','Factory',6);
		order=400;new Game.TieredUpgrade('铁匠铺','矿山工作效率 <b>翻倍</b>。<q>你终于挖出了一条地道到地球的核心。这里很暖和。</q>','Mine',6);
		order=600;new Game.TieredUpgrade('发电船','装船工作效率 <b>翻倍</b>。<q>建造到最后，这个巨大的飞船一定会把你的饼干送到太空深处，总有一天。</q>','Shipment',6);
		order=700;new Game.TieredUpgrade('起源坩埚','炼金实验室工作效率 <b>翻倍</b>。<q>这个传说中的坩埚是由地球上最稀有的星球建造而成，位于最深处，据说它能保留大爆炸本身的特性。</q>','Alchemy lab',6);
		order=800;new Game.TieredUpgrade('大型传送门','传送门工作效率 <b>翻倍</b>。<q>就像，说，老天爷能把这东西塞进去。假设地。</q>','Portal',6);
		order=900;new Game.TieredUpgrade('未来的法令','时光机器工作效率 <b>翻倍</b>。<q>遥远未来的法令授权你深入挖掘未来——文明已经堕落，又重新崛起，而饼干是丰富的。</q>','Time machine',6);
		order=1000;new Game.TieredUpgrade('纳米宇宙','反物质冷凝器工作效率 <b>翻倍</b>。<q>纳米宇宙理论认为，每一个亚原子粒子实际上都是它自己自足的宇宙，拥有不可思议的能量。</q>','Antimatter condenser',6);
=======
		new Game.Upgrade('Septillion fingers','The mouse and cursors gain <b>+500000</b> cookies for each non-cursor object owned.<q>[cursory flavor text]</q>',10000000000000000000,[12,20]);Game.MakeTiered(Game.last,11,0);
		new Game.Upgrade('Octillion fingers','The mouse and cursors gain <b>+5000000</b> cookies for each non-cursor object owned.<q>Turns out you <b>can</b> quite put your finger on it.</q>',10000000000000000000000,[12,19]);Game.MakeTiered(Game.last,12,0);
		
		order=150;new Game.Upgrade('Eludium mouse','Clicking gains <b>+1% of your CpS</b>.<q>I rodent do that if I were you.</q>',500000000000000,[11,15]);Game.MakeTiered(Game.last,6,11);
		new Game.Upgrade('Wishalloy mouse','Clicking gains <b>+1% of your CpS</b>.<q>Clicking is fine and dandy, but don\'t smash your mouse over it. Get your game on. Go play.</q>',50000000000000000,[11,16]);Game.MakeTiered(Game.last,7,11);
		order=200;new Game.TieredUpgrade('Aging agents','Grandmas are <b>twice</b> as efficient.<q>Counter-intuitively, grandmas have the uncanny ability to become more powerful the older they get.</q>','Grandma',6);
		order=300;new Game.TieredUpgrade('Pulsar sprinklers','Farms are <b>twice</b> as efficient.<q>There\'s no such thing as over-watering. The moistest is the bestest.</q>','Farm',6);
		order=500;new Game.TieredUpgrade('Deep-bake process','Factories are <b>twice</b> as efficient.<q>A patented process increasing cookie yield two-fold for the same amount of ingredients. Don\'t ask how, don\'t take pictures, and be sure to wear your protective suit.</q>','Factory',6);
		order=400;new Game.TieredUpgrade('Coreforge','Mines are <b>twice</b> as efficient.<q>You\'ve finally dug a tunnel down to the Earth\'s core. It\'s pretty warm down here.</q>','Mine',6);
		order=600;new Game.TieredUpgrade('Generation ship','Shipments are <b>twice</b> as efficient.<q>Built to last, this humongous spacecraft will surely deliver your cookies to the deep ends of space, one day.</q>','Shipment',6);
		order=700;new Game.TieredUpgrade('Origin crucible','Alchemy labs are <b>twice</b> as efficient.<q>Built from the rarest of earths and located at the very deepest of the largest mountain, this legendary crucible is said to retain properties from the big-bang itself.</q>','Alchemy lab',6);
		order=800;new Game.TieredUpgrade('Deity-sized portals','Portals are <b>twice</b> as efficient.<q>It\'s almost like, say, an elder god could fit through this thing now. Hypothetically.</q>','Portal',6);
		order=900;new Game.TieredUpgrade('Far future enactment','Time machines are <b>twice</b> as efficient.<q>The far future enactment authorizes you to delve deep into the future - where civilization has fallen and risen again, and cookies are plentiful.</q>','Time machine',6);
		order=1000;new Game.TieredUpgrade('Nanocosmics','Antimatter condensers are <b>twice</b> as efficient.<q>The theory of nanocosmics posits that each subatomic particle is in fact its own self-contained universe, holding unfathomable amounts of energy.<br>This somehow stacks with the nested universe theory, because physics.</q>','Antimatter condenser',6);
>>>>>>> 20180919:main.js
		order=1100;
		new Game.TieredUpgrade('在黑暗中发光','棱镜工作效率 <b>翻倍</b>。<q>你的棱镜现在在黑暗中发光，有效地加倍它们的输出!</q>','Prism',6);
		
		order=10032;
		Game.NewUpgradeCookie({name:'玫瑰马卡龙',desc:'虽然味道很怪，但这些糕点最近越来越受欢迎。',icon:[22,3],require:'马卡龙盒子',		power:3,price: 9999});
		Game.NewUpgradeCookie({name:'柠檬马卡龙',desc:'酸甜的，令人愉快的款待。',icon:[23,3],require:'马卡龙盒子',										power:3,price: 9999999});
		Game.NewUpgradeCookie({name:'巧克力马卡龙',desc:'它们就像小小的含糖的汉堡!',icon:[24,3],require:'马卡龙盒子',									power:3,price: 9999999999});
		Game.NewUpgradeCookie({name:'开心果马卡龙',desc:'在多次投诉后，开心果壳被移除。',icon:[22,4],require:'马卡龙盒子',										power:3,price: 9999999999999});
		Game.NewUpgradeCookie({name:'榛子马卡龙',desc:'这些咖啡特别适合饮用。',icon:[23,4],require:'马卡龙盒子',									power:3,price: 9999999999999999});
		Game.NewUpgradeCookie({name:'紫罗兰马卡龙',desc:'这就像向你的嘴里喷香水!',icon:[24,4],require:'马卡龙盒子',							power:3,price: 9999999999999999999});
		
		order=40000;
		new Game.Upgrade('神奇的恶作剧','饼干生产 <b>乘以 1,000</b>。<q>这是魔法。我不需要解释<div style="display:inline-block;background:url(img/money.png);width:16px;height:16px;position:relative;top:4px;left:0px;margin:0px -2px;"></div></q>',7,[17,5]);//debug purposes only
		Game.last.pool='debug';
		
		
		order=24000;
<<<<<<< HEAD:main.js
		new Game.Upgrade('兔子饼干','触发 <b>复活节</b> 在接下来的24小时。<br>触发另一个季节将会取消这个。<br>每个季节的开关都会增加成本。<q>全世界都会成为你的敌人<br>并且当他们抓到你，<br>他们会杀了你...<br>但首先，他们必须抓住你。</q>',Game.seasonTriggerBasePrice,[0,12]);Game.last.season='easter';Game.last.pool='toggle';
=======
		new Game.Upgrade('Bunny biscuit','Triggers <b>Easter season</b> for the next 24 hours.<br>Triggering another season will cancel this one.<br>Cost scales with unbuffed CpS and increases with every season switch.<q>All the world will be your enemy<br>and when they catch you,<br>they will kill you...<br>but first they must catch you.</q>',Game.seasonTriggerBasePrice,[0,12]);Game.last.season='easter';Game.last.pool='toggle';
>>>>>>> 20180919:main.js
		
		var eggPrice=999999999999;
		var eggPrice2=99999999999999;
		new Game.Upgrade('鸡蛋','饼干生产增加 <b>+1%</b>.<br>成本是你拥有多少个蛋。<q>鸡蛋。鸡蛋是第一位的。克服它。</q>',eggPrice,[1,12]);
		new Game.Upgrade('鸭蛋','饼干生产增加 <b>+1%</b>.<br>成本是你拥有多少个蛋。<q>然后他摇摇摆摆地走了。</q>',eggPrice,[2,12]);
		new Game.Upgrade('火鸡蛋','饼干生产增加 <b>+1%</b>.<br>成本是你拥有多少个蛋。<q>这些孵化成奇异的手形生物。</q>',eggPrice,[3,12]);
		new Game.Upgrade('鹌鹑蛋','饼干生产增加 <b>+1%</b>.<br>成本是你拥有多少个蛋。<q>这些蛋确实很小。我是说，看看他们。这是如何发生的?这是谁的主意?</q>',eggPrice,[4,12]);
		new Game.Upgrade('知更鸟蛋','饼干生产增加 <b>+1%</b>.<br>成本是你拥有多少个蛋。<q>神圣的，有壳的胚胎!</q>',eggPrice,[5,12]);
		new Game.Upgrade('鸵鸟蛋','饼干生产增加 <b>+1%</b>.<br>成本是你拥有多少个蛋。<q>世界上最大的蛋之一。更像奥斯垂奇，对吧?<br>伙计们?</q>',eggPrice,[6,12]);
		new Game.Upgrade('食火鸡蛋','饼干生产增加 <b>+1%</b>.<br>成本是你拥有多少个蛋。<q>食火鸡比你高，拥有凶残的爪子，很容易跑得比你快。<br/>你最好对他们小心些。</q>',eggPrice,[7,12]);
		new Game.Upgrade('鲑鱼籽','饼干生产增加 <b>+1%</b>.<br>成本是你拥有多少个蛋。<q>做不可能的事，看不见的。<br>罗伊·罗伊，反抗权力?</q>',eggPrice,[8,12]);
		new Game.Upgrade('蛙卵','饼干生产增加 <b>+1%</b>.<br>成本是你拥有多少个蛋。<q>我想说一下这些“看起来像眼球”的东西，但忘掉它。</q>',eggPrice,[9,12]);
		new Game.Upgrade('鲨鱼卵','饼干生产增加 <b>+1%</b>.<br>成本是你拥有多少个蛋。<q>你好这是食物吗?<br/>让我告诉你关于食物的事。<br/>我为什么一直吃我的朋友</q>',eggPrice,[10,12]);
		new Game.Upgrade('龟蛋','饼干生产增加 <b>+1%</b>.<br>成本是你拥有多少个蛋。<q>乌龟，对吧?<br>从贝壳里孵化出来。成长为贝壳。这是怎么了?现在是我的关于飞机食物的滑稽短剧。</q>',eggPrice,[11,12]);
		new Game.Upgrade('蚂蚁幼虫','饼干生产增加 <b>+1%</b>.<br>成本是你拥有多少个蛋。<q>我发誓，在一些国家，这是一种美味。你会让这些侵入你的消化道，你会从中获得极大的乐趣。，一切都会好的。</q>',eggPrice,[12,12]);
		new Game.Upgrade('金鹅蛋','黄金饼干出现几率 <b>+5%</b>.<br>成本是你拥有多少个蛋。<q>这是一个关于错误投资的悲惨故事的唯一痕迹。</q>',eggPrice2,[13,12]);
		new Game.Upgrade('法贝热彩蛋','所有建筑和升级 <b>降低 1% 成本</b>.<br>成本是你拥有多少个蛋。<q>这个可恶的蛋绝对是假的。</q>',eggPrice2,[14,12],function(){Game.storeToRefresh=1;});
		new Game.Upgrade('皱纹卵','皱纹炸裂加成 <b>5% 饼干</b>.<br>成本是你拥有多少个蛋。<q>看看这个小家伙!总有一天会成为一个大男孩的!没错,是很好玩!</q>',eggPrice2,[15,12]);
		new Game.Upgrade('饼干蛋','点击加成 <b>10% </b>。<br>成本是你拥有多少个蛋。<q>壳体似乎有缺口。<br>我想知道这个里面有什么!</q>',eggPrice2,[16,12]);
		new Game.Upgrade('煎蛋','其他蛋出现频率增加 <b>10% </b>。<br>成本是你拥有多少个蛋。<q>不包括他的年龄。</q>',eggPrice2,[17,12]);
		new Game.Upgrade('巧克力蛋','包含 <b>很多的饼干</b>.<br>成本是你拥有多少个蛋。<q>这是一种难以捉摸的可可鸟。里面有个惊喜!</q>',eggPrice2,[18,12],function()
		{
			var cookies=Game.cookies*0.05;
			if (Game.prefs.popups) Game.Popup('巧克力蛋突然爆发<br>'+Beautify(cookies)+'!');
			else Game.Notify('巧克力蛋','蛋突然爆发 <b>'+Beautify(cookies)+'</b> 饼干！!',Game.Upgrades['巧克力蛋'].icon);
			Game.Earn(cookies);
		});
<<<<<<< HEAD:main.js
		new Game.Upgrade('世纪蛋','你不断地获得 <b>更多的饼干每秒产量，当你玩得越久</b> 在这个季节。<br>成本是你拥有多少个蛋。<q>实际上没有几个世纪的历史。这一天不超过86岁！</q>',eggPrice2,[19,12]);
		new Game.Upgrade('"蛋"','<b>+9 饼干秒产量</b><q>嘿，这是"蛋"</q>',eggPrice2,[20,12]);
=======
		new Game.Upgrade('Century egg','You continually gain <b>more CpS the longer you\'ve played</b> in the current ascension.<br>Cost scales with how many eggs you own.<q>Actually not centuries-old. This one isn\'t a day over 86!</q>',eggPrice2,[19,12]);
		Game.last.descFunc=function(){
				var day=Math.floor((Date.now()-Game.startDate)/1000/10)*10/60/60/24;
				day=Math.min(day,100);
				var n=(1-Math.pow(1-day/100,3))*0.1;
			return '<div style="text-align:center;">Current boost : <b>+'+Beautify(n*100,1)+'%</b></div><div class="line"></div>'+this.desc;
		};
		new Game.Upgrade('"egg"','<b>+9 CpS</b><q>hey it\'s "egg"</q>',eggPrice2,[20,12]);
>>>>>>> 20180919:main.js
		
		Game.easterEggs=['鸡蛋','鸭蛋','火鸡蛋','鹌鹑蛋','知更鸟蛋','鸵鸟蛋','食火鸡蛋','鲑鱼籽','蛙卵','鲨鱼卵','龟蛋','蚂蚁幼虫','金鹅蛋','法贝热彩蛋','皱纹卵','饼干蛋','煎蛋','巧克力蛋','世纪蛋','"蛋"'];
		Game.eggDrops=['鸡蛋','鸭蛋','火鸡蛋','鹌鹑蛋','知更鸟蛋','鸵鸟蛋','食火鸡蛋','鲑鱼籽','蛙卵','鲨鱼卵','龟蛋','蚂蚁幼虫'];
		Game.rareEggDrops=['金鹅蛋','法贝热彩蛋','皱纹卵','饼干蛋','煎蛋','巧克力蛋','世纪蛋','"蛋"'];
		
		Game.GetHowManyEggs=function()
		{
			var num=0;
			for (var i in Game.easterEggs) {if (Game.Has(Game.easterEggs[i])) num++;}
			return num;
		}
		for (var i in Game.eggDrops)//scale egg prices to how many eggs you have
		{Game.Upgrades[Game.eggDrops[i]].priceFunc=function(){return Math.pow(2,Game.GetHowManyEggs())*999;}}
		//{Game.Upgrades[Game.eggDrops[i]].priceFunc=function(){return Math.pow(Game.GetHowManyEggs()+1,2)*Game.cookiesPs*60*5;}}
		for (var i in Game.rareEggDrops)
		{Game.Upgrades[Game.rareEggDrops[i]].priceFunc=function(){return Math.pow(3,Game.GetHowManyEggs())*999;}}
		//{Game.Upgrades[Game.rareEggDrops[i]].priceFunc=function(){return Math.pow(Game.GetHowManyEggs()+1,3)*Game.cookiesPs*60*5;}}
		
		/*for (var i in Game.easterEggs)
		{
			Game.Upgrades[Game.easterEggs[i]].descFunc=function(){return '<div style="text-align:center;">You currently own <b>'+Game.GetHowManyEggs()+'/'+Game.easterEggs.length+'</b> eggs.</div><div class="line"></div>'+this.desc;};
		}*/
		
		Game.DropEgg=function(failRate)
		{
			failRate*=1/Game.dropRateMult();
			if (Game.season!='easter') return;
			if (Game.HasAchiev('捉迷藏冠军')) failRate*=0.7;
			if (Game.Has('煎蛋')) failRate*=0.9;
			if (Game.Has('星人')) failRate*=0.9;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('seasons');
				if (godLvl==1) failRate*=0.9;
				else if (godLvl==2) failRate*=0.95;
				else if (godLvl==3) failRate*=0.97;
			}
			if (Math.random()>=failRate)
			{
				var drop='';
				if (Math.random()<0.1) drop=choose(Game.rareEggDrops);
				else drop=choose(Game.eggDrops);
				if (Game.Has(drop) || Game.HasUnlocked(drop))//reroll if we have it
				{
					if (Math.random()<0.1) drop=choose(Game.rareEggDrops);
					else drop=choose(Game.eggDrops);
				}
				if (Game.Has(drop) || Game.HasUnlocked(drop)) return;
				Game.Unlock(drop);
				if (Game.prefs.popups) Game.Popup('你找到了 :<br>'+drop+'!');
				else Game.Notify('你找到了一个蛋!','<b>'+drop+'</b>',Game.Upgrades[drop].icon);
			}
		};
		
		order=10032;
		Game.NewUpgradeCookie({name:'焦糖马卡龙',desc:'最咸的，最不愉快的。',icon:[25,3],require:'马卡龙盒子',		power:3,price: 9999999999999999999999});
		Game.NewUpgradeCookie({name:'甘草马卡龙',desc:'又名“黑火龙”。',icon:[25,4],require:'马卡龙盒子',				power:3,price: 9999999999999999999999999});
		
		
		order=525;
		new Game.TieredUpgrade('更高级的出纳员','银行工作效率 <b>翻倍</b>。<q>能够处理更高数量的事务。不过要小心，因为高个子的人会讲些高挑的故事。</q>','Bank',1);
		new Game.TieredUpgrade('抗剪刀的信用卡','银行工作效率 <b>翻倍</b>。<q>对那些真正有价值的顾客。</q>','Bank',2);
		new Game.TieredUpgrade('耐酸金库','银行工作效率 <b>翻倍</b>。<q>你知道他们说什么吗，小心点。</q>','Bank',3);
		new Game.TieredUpgrade('巧克力硬币','银行工作效率 <b>翻倍</b>。<q>这种革命性的货币更容易从内部和内部熔化——而且味道更好，这是一种改变。</q>','Bank',4);
		new Game.TieredUpgrade('指数利率','银行工作效率 <b>翻倍</b>。<q>不能和数学争辩!现在把它分叉。</q>','Bank',5);
		new Game.TieredUpgrade('金融禅宗','银行工作效率 <b>翻倍</b>。<q>经济思想的终极目标;大资金的风水,股市瑜伽-海姆利克氏操作法的1角和2角5分的硬币。</q>','Bank',6);
		
		order=550;
		new Game.TieredUpgrade('金色偶像','寺庙工作效率 <b>翻倍</b>。<q>吸引更贪婪的冒险者来找回你的饼干。现在这是真正的偶像比赛!</q>','Temple',1);
		new Game.TieredUpgrade('牺牲','寺庙工作效率 <b>翻倍</b>。<q>10亿美元的饼干是什么样的生活?</q>','Temple',2);
		new Game.TieredUpgrade('美味的祝福','寺庙工作效率 <b>翻倍</b>。<q>瞧，面包师的万能汤匙降临，对信徒和分布式神圣的礼物——闪闪发光的糖,巧克力漆黑如夜,和各种各样的小麦。让我告诉你，那个聚会很不友好。</q>','Temple',3);
		new Game.TieredUpgrade('太阳节','寺庙工作效率 <b>翻倍</b>。<q>在每年的庆祝活动中，你的太阳穴都能释放出你的原始力量，包括喷火者、传统舞蹈、仪式砍头和其他的欢乐!</q>','Temple',4);
		new Game.TieredUpgrade('扩大万神殿','寺庙工作效率 <b>翻倍</b>。<q>精神上的不足!比你需要的还要多，或者你的钱要回来!百分百保证!</q>','Temple',5);
		new Game.TieredUpgrade('天上的面包师','寺庙工作效率 <b>翻倍</b>。<q>这是它。终极神终于在你的行动上投射他们的神性的眼睛;无论这是一件好事，或者可能是几天的结束，你很快就会发现。</q>','Temple',6);
		
		order=575;
		new Game.TieredUpgrade('尖尖的帽子','精灵塔工作效率 <b>翻倍</b>。<q>测试显示，相对于神奇的圆锥工具的几何比例，它的可接受性增加了。</q>','Wizard tower',1);
		new Game.TieredUpgrade('胡子胡子','精灵塔工作效率 <b>翻倍</b>。<q>你没听说吗?胡子就是这个词。</q>','Wizard tower',2);
		new Game.TieredUpgrade('古魔典','精灵塔工作效率 <b>翻倍</b>。<q>包含一些有趣的咒语，比如“把水变成流口水”，“在家具上长眉毛”和“召唤政治家”。</q>','Wizard tower',3);
		new Game.TieredUpgrade('厨房诅咒','精灵塔工作效率 <b>翻倍</b>。<q>奇异魔法涉及到一切与人有关的东西。好极了!</q>','Wizard tower',4);
		new Game.TieredUpgrade('魔法学校','精灵塔工作效率 <b>翻倍</b>。<q>这个由饼干资助的魔法学院是四所著名的魔法学院的所在地:运动员，书呆子，预备者，和死亡的人。</q>','Wizard tower',5);
		new Game.TieredUpgrade('黑暗公式','精灵塔工作效率 <b>翻倍</b>。<q>在这些咒语的背后，有一种力量在发挥作用——你会感觉到你真的不应该把它们弄乱。但是我是说，免费的饼干，对吧?</q>','Wizard tower',6);

		order=250;
<<<<<<< HEAD:main.js
		new Game.Upgrade('银行家老奶奶',Game.getGrandmaSynergyUpgradeDesc('Bank')+'<q>一个不错的银行家，能赚到更多的饼干。</q>',Game.Objects['Bank'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('祭司老奶奶',Game.getGrandmaSynergyUpgradeDesc('Temple')+'<q>一个很好的祭司，赞美天空中真正的烘烤师。</q>',Game.Objects['Temple'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('女巫老奶奶',Game.getGrandmaSynergyUpgradeDesc('Wizard tower')+'<q>一个优秀的女巫，能够做一个包，然后噗啪一声，饼干出来了！</q>',Game.Objects['Wizard tower'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
=======
		Game.GrandmaSynergy('Banker grandmas','A nice banker to cash in more cookies.','Bank');
		Game.GrandmaSynergy('Priestess grandmas','A nice priestess to praise the one true Baker in the sky.','Temple');
		Game.GrandmaSynergy('Witch grandmas','A nice witch to cast a zip, and a zoop, and poof! Cookies.','Wizard tower');
>>>>>>> 20180919:main.js
		
		
		
		order=0;
		new Game.Upgrade('一罐英国茶饼干','里面有各式各样的饼干。<q>每次都是下午茶时间。</q>',25,[21,8]);Game.last.pool='prestige';Game.last.parents=['天堂饼干'];
		new Game.Upgrade('马卡龙盒子','包含各种各样的马卡龙。<q>五彩缤纷的佳肴充满了各式各样的果酱。<br>不要和马卡龙，通心粉，麦卡洛尼，或者其他那些鬼话混在一起。</q>',25,[20,8]);Game.last.pool='prestige';Game.last.parents=['天堂饼干'];
		new Game.Upgrade('品牌饼干盒','包含各式各样的流行饼干。<q>它们是全新的!</q>',25,[20,9]);Game.last.pool='prestige';Game.last.parents=['天堂饼干'];
	
		order=10020;
		Game.NewUpgradeCookie({name:'纯黑巧克力饼干',desc:'浸在实验室里的物质比最黑的可可更黑(被称为"巧克力")',icon:[26,3],power:									4,price: 9999999999999999*5});
		Game.NewUpgradeCookie({name:'纯白巧克力饼干',desc:'在纳米尺度上，这种饼干的涂层即使在漆黑的环境中也能折射光线。',icon:[26,4],power:	4,price: 9999999999999999*5});
		Game.NewUpgradeCookie({name:'松脆饼',desc:'打扫干净，消毒好，你肯定会说它们是真正的饼干。',icon:[27,3],power:																	3,price: 99999999999999999});
		Game.NewUpgradeCookie({name:'瓦片',desc:'这些永远不会消失。',icon:[27,4],power:																													3,price: 99999999999999999*5});
		Game.NewUpgradeCookie({name:'巧克力饼干',desc:'高贵的零食!<br>这些洞是巧克力填充物可以呼吸的。',icon:[28,3],power:												3,price: 999999999999999999});
		Game.NewUpgradeCookie({name:'切克饼干',desc:'一个方形饼干吗?这解决了很多存储和打包问题!你真是个天才!',icon:[28,4],power:												3,price: 999999999999999999*5});
		Game.NewUpgradeCookie({name:'黄油饼干',desc:'这些东西会从你的嘴里融化并进入你的心脏。(让我们面对现实吧，他们更容易发胖。)',icon:[29,3],power:									3,price: 9999999999999999999});
		Game.NewUpgradeCookie({name:'奶油饼干',desc:'它像两个巧克力曲奇饼干!但是带着奶油的魔力一起带来的!这太完美了!',icon:[29,4],power:						3,price: 9999999999999999999*5});

		order=0;
		var desc='在这个插槽中进行升级将会产生 <b>永久</b> 效果,在之后所有的游戏。<br><b>点击它就能激活。</b>';
		new Game.Upgrade('永久升级槽 I',desc,	100,[0,10]);Game.last.pool='prestige';Game.last.iconFunction=function(){return Game.PermanentSlotIcon(0);};Game.last.activateFunction=function(){Game.AssignPermanentSlot(0);};
		new Game.Upgrade('永久升级槽 II',desc,	2000,[1,10]);Game.last.pool='prestige';Game.last.parents=['永久升级槽 I'];Game.last.iconFunction=function(){return Game.PermanentSlotIcon(1);};Game.last.activateFunction=function(){Game.AssignPermanentSlot(1);};
		new Game.Upgrade('永久升级槽 III',desc,	30000,[2,10]);Game.last.pool='prestige';Game.last.parents=['永久升级槽 II'];Game.last.iconFunction=function(){return Game.PermanentSlotIcon(2);};Game.last.activateFunction=function(){Game.AssignPermanentSlot(2);};
		new Game.Upgrade('永久升级槽 IV',desc,	400000,[3,10]);Game.last.pool='prestige';Game.last.parents=['永久升级槽 III'];Game.last.iconFunction=function(){return Game.PermanentSlotIcon(3);};Game.last.activateFunction=function(){Game.AssignPermanentSlot(3);};
		new Game.Upgrade('永久升级槽 V',desc,	5000000,[4,10]);Game.last.pool='prestige';Game.last.parents=['永久升级槽 IV'];Game.last.iconFunction=function(){return Game.PermanentSlotIcon(4);};Game.last.activateFunction=function(){Game.AssignPermanentSlot(4);};
		
		var slots=['Permanent upgrade slot I','Permanent upgrade slot II','Permanent upgrade slot III','Permanent upgrade slot IV','Permanent upgrade slot V'];
		for (var i=0;i<slots.length;i++)
		{
			Game.Upgrades[slots[i]].descFunc=function(i){return function(){
				if (Game.permanentUpgrades[i]==-1) return this.desc;
				var upgrade=Game.UpgradesById[Game.permanentUpgrades[i]];
				return '<div style="text-align:center;">'+'Current : <div class="icon" style="vertical-align:middle;display:inline-block;'+(upgrade.icon[2]?'background-image:url('+upgrade.icon[2]+');':'')+'background-position:'+(-upgrade.icon[0]*48)+'px '+(-upgrade.icon[1]*48)+'px;transform:scale(0.5);margin:-16px;"></div> <b>'+upgrade.name+'</b><div class="line"></div></div>'+this.desc;
			};}(i);
		}
		
		Game.PermanentSlotIcon=function(slot)
		{
			if (Game.permanentUpgrades[slot]==-1) return [slot,10];
			return Game.UpgradesById[Game.permanentUpgrades[slot]].icon;
		}
		Game.AssignPermanentSlot=function(slot)
		{
			PlaySound('snd/tick.mp3');
			Game.tooltip.hide();
			var list=[];
			for (var i in Game.Upgrades)
			{
				var me=Game.Upgrades[i];
				if (me.bought && me.unlocked && !me.noPerm && (me.pool=='' || me.pool=='cookie'))
				{
					var fail=0;
					for (var ii in Game.permanentUpgrades) {if (Game.permanentUpgrades[ii]==me.id) fail=1;}//check if not already in another permaslot
					if (!fail) list.push(me);
				}
			}
			
			var sortMap=function(a,b)
			{
				if (a.order>b.order) return 1;
				else if (a.order<b.order) return -1;
				else return 0;
			}
			list.sort(sortMap);
			
			var upgrades='';
			for (var i in list)
			{
				var me=list[i];
				upgrades+=Game.crate(me,'','PlaySound(\'snd/tick.mp3\');Game.PutUpgradeInPermanentSlot('+me.id+','+slot+');','upgradeForPermanent'+me.id);
			}
			var upgrade=Game.permanentUpgrades[slot];
			Game.SelectingPermanentUpgrade=upgrade;
			Game.Prompt('<h3>选择升级，使其成为永久的</h3>'+
			
						'<div class="line"></div><div style="margin:4px auto;clear:both;width:120px;"><div class="crate upgrade enabled" style="background-position:'+(-slot*48)+'px '+(-10*48)+'px;"></div><div id="upgradeToSlotNone" class="crate upgrade enabled" style="background-position:'+(-0*48)+'px '+(-7*48)+'px;display:'+(upgrade!=-1?'none':'block')+';"></div><div id="upgradeToSlotWrap" style="float:left;display:'+(upgrade==-1?'none':'block')+';">'+(Game.crate(Game.UpgradesById[upgrade==-1?0:upgrade],'','','upgradeToSlot'))+'</div></div>'+
						'<div class="block crateBox" style="overflow-y:scroll;float:left;clear:left;width:317px;padding:0px;height:250px;">'+upgrades+'</div>'+
						'<div class="block" style="float:right;width:152px;clear:right;height:234px;">以下是你上次购买的所有升级。<div class="line"></div>选择一个来永久地获得它的效果！<div class="line"></div>当你转生时，你可以重新分配这个插槽。</div>'
						,[['确定','Game.permanentUpgrades['+slot+']=Game.SelectingPermanentUpgrade;Game.BuildAscendTree();Game.ClosePrompt();'],'取消'],0,'widePrompt');
		}
		Game.SelectingPermanentUpgrade=-1;
		Game.PutUpgradeInPermanentSlot=function(upgrade,slot)
		{
			Game.SelectingPermanentUpgrade=upgrade;
			l('upgradeToSlotWrap').innerHTML='';
			l('upgradeToSlotWrap').style.display=(upgrade==-1?'none':'block');
			l('upgradeToSlotNone').style.display=(upgrade!=-1?'none':'block');
			l('upgradeToSlotWrap').innerHTML=(Game.crate(Game.UpgradesById[upgrade==-1?0:upgrade],'','','upgradeToSlot'));
		}
		
		new Game.Upgrade('星人','鸡蛋掉率增加 <b>10%</b>。<br>黄金饼干出现频率增加 <b>2%</b> 在复活节期间。',111111,[0,12]);Game.last.pool='prestige';Game.last.parents=['季节切换器'];
		new Game.Upgrade('星雪','圣诞饼干掉率增加 <b>5%</b>。<br>在复活节期间额外增加 <b>5%</b>。',111111,[12,9]);Game.last.pool='prestige';Game.last.parents=['季节切换器'];
		new Game.Upgrade('星际恐怖','幽灵饼干掉率增加 <b>10%</b> 更多地.<br>黄金饼干在万圣节期间出现几率增加 <b>2%</b>。',111111,[13,8]);Game.last.pool='prestige';Game.last.parents=['季节切换器'];
		new Game.Upgrade('星际之恋','心形饼干能力增加 <b>50%</b>。<br>黄金饼干在情人节期间出现几率增加 <b>2%</b>。',111111,[20,3]);Game.last.pool='prestige';Game.last.parents=['季节切换器'];
		new Game.Upgrade('星际贸易','黄金饼干在工作日掉率增加 <b>5%</b>。',111111,[17,6]);Game.last.pool='prestige';Game.last.parents=['季节切换器'];
		
		var angelPriceFactor=7;
		var desc=function(percent,total){return '你获得了另外 <b>+'+percent+'%</b> 当前饼干每秒产量,当游戏关闭时。 总共 <b>'+total+'%</b>.';}
		new Game.Upgrade('天使',desc(10,15)+'<q>在糕点天堂的第一层，天使们的任务是向他们认为有价值的人提供新的食谱。</q>',Math.pow(angelPriceFactor,1),[0,11]);Game.last.pool='prestige';Game.last.parents=['双重超越之门'];
		new Game.Upgrade('大天使',desc(10,25)+'<q>天使长们是第一个糕点天堂的成员，他们负责世界上最大的面包房的顺利运转。</q>',Math.pow(angelPriceFactor,2),[1,11]);Game.last.pool='prestige';Game.last.parents=['天使'];
		new Game.Upgrade('美德',desc(10,35)+'<q>在糕点天堂的第二层发现，美德利用他们的天力量来推和拉宇宙之星。</q>',Math.pow(angelPriceFactor,3),[2,11]);Game.last.pool='prestige';Game.last.parents=['大天使'];
		new Game.Upgrade('领地',desc(10,45)+'<q>在糕点天堂的第二个领域，自治领有一个管理职位，负责会计和管理的日程安排。</q>',Math.pow(angelPriceFactor,4),[3,11]);Game.last.pool='prestige';Game.last.parents=['美德'];
		new Game.Upgrade('智天使',desc(10,55)+'<q>在糕点天堂的第一层，四面派的小天使是天堂的护卫和保镖。</q>',Math.pow(angelPriceFactor,5),[4,11]);Game.last.pool='prestige';Game.last.parents=['领地'];
		new Game.Upgrade('六翼天使',desc(10,65)+'<q>在糕点天堂的第一个领域，六翼天使拥有关于烘焙的所有知识。</q>',Math.pow(angelPriceFactor,6),[5,11]);Game.last.pool='prestige';Game.last.parents=['智天使'];
		new Game.Upgrade('上帝',desc(10,75)+'<q>就像圣诞老人一样，但乐趣却少了。</q>',Math.pow(angelPriceFactor,7),[6,11]);Game.last.pool='prestige';Game.last.parents=['六翼天使'];
		
		new Game.Upgrade('双重超越之门','你现在可以 <b>离线制作饼干</b>, 离线饼干每秒产量是你当前饼干每秒产量的 <b>5%</b>，离线时间是游戏关闭之后的 <b>1 小时</b>。<br>(超过1小时后，这个比例又降低了90% —— 直到你的比例下降到 <b>0.5%</b> 当前饼干每秒产量。)<q>这是一次你总是穿得不得体的场合。别担心，只要冲过保镖，假装你认识人。</q>',1,[15,11]);Game.last.pool='prestige';

		new Game.Upgrade('天上的运气','黄金饼干出现几率增加 <b>5%</b>。<q>上面有人喜欢你。</q>',77,[22,6]);Game.last.pool='prestige';
		new Game.Upgrade('永恒的财富','黄金饼干效果持续时间增加 <b>10%</b>。<q>这是你每天的运气。这是……运气好。</q>',777,[23,6]);Game.last.pool='prestige';Game.last.parents=['天上的运气'];
		new Game.Upgrade('决定性的命运','黄金饼干停留时间增加 <b>5%</b>。<q>生活变得更加紧张。</q>',7777,[10,14]);Game.last.pool='prestige';Game.last.parents=['永恒的财富'];

		new Game.Upgrade('神圣折扣','建筑便宜 <b>1% </b>。<q>一个特别的人值得付出特别的代价。</q>',99999,[21,7]);Game.last.pool='prestige';Game.last.parents=['决定性的命运'];
		new Game.Upgrade('神圣销售','升级便宜 <b>1% </b>。<q>一切都得过去!</q>',99999,[18,7]);Game.last.pool='prestige';Game.last.parents=['决定性的命运'];
		new Game.Upgrade('神圣的面包店','饼干升级 <b>便宜 5 倍</b>.<q>他们肯定知道自己在做什么。</q>',399999,[17,7]);Game.last.pool='prestige';Game.last.parents=['神圣销售','神圣折扣'];
		
		new Game.Upgrade('启动装置','你开局时有 <b>10 游标</b>.<q>这可以派上用场。</q>',50,[0,14]);Game.last.pool='prestige';Game.last.parents=['一罐英国茶饼干','马卡龙盒子','品牌饼干盒','奶油饼干罐头'];
		new Game.Upgrade('启动厨房','你开局时有 <b>5 老奶奶</b>.<q>这些东西是从哪里来的?</q>',5000,[1,14]);Game.last.pool='prestige';Game.last.parents=['启动装置'];
		new Game.Upgrade('光环手套','点击效果增加 <b>10%</b>.<q>吃了那饼干。</q>',55555,[22,7]);Game.last.pool='prestige';Game.last.parents=['启动装置'];

		new Game.Upgrade('小猫天使','你的牛奶越多，你获得的<b>饼干每秒产量越多<q>所有的猫都会去天堂。</q>',9000,[23,7]);Game.last.pool='prestige';Game.last.parents=['领地'];Game.last.kitten=1;
		
		new Game.Upgrade('邪恶的诱饵','皱纹出现频率变快 <b>5 倍</b>。<q>没有皱纹可以抵御蠕虫饼干的气味。</q>',44444,[15,12]);Game.last.pool='prestige';Game.last.parents=['启动厨房'];
		new Game.Upgrade('亵渎神明','起皱的人获得 <b>5%</b> 更多的饼干。<q>独特的动物王国，皱纹消化道能够承受难以置信程度的扩张——只要你适当地刺激它们。</q>',444444,[19,8]);Game.last.pool='prestige';Game.last.parents=['邪恶的诱饵'];
		
		
		order=200;new Game.TieredUpgrade('播放器步行者','老奶奶工作效率 <b>翻倍</b>。<q>Complete with flame decals and a little horn that goes "toot".</q>','Grandma',7);
		order=300;new Game.TieredUpgrade('Fudge fungus','农场工作效率 <b>翻倍</b>。<q>A sugary parasite whose tendrils help cookie growth.<br>Please do not breathe in the spores. In case of spore ingestion, seek medical help within the next 36 seconds.</q>','Farm',7);
		order=400;new Game.TieredUpgrade('Planetsplitters','矿山工作效率 <b>翻倍</b>。<q>These new state-of-the-art excavators have been tested on Merula, Globort and Flwanza VI, among other distant planets which have been curiously quiet lately.</q>','Mine',7);
		order=500;new Game.TieredUpgrade('Cyborg workforce','工厂工作效率 <b>翻倍</b>。<q>Semi-synthetic organisms don\'t slack off, don\'t unionize, and have 20% shorter lunch breaks, making them ideal labor fodder.</q>','Factory',7);
		order=525;new Game.TieredUpgrade('Way of the wallet','银行工作效率 <b>翻倍</b>。<q>This new monetary school of thought is all the rage on the banking scene; follow its precepts and you may just profit from it.</q>','Bank',7);
		order=550;new Game.TieredUpgrade('Creation myth','寺庙工作效率 <b>翻倍</b>。<q>Stories have been circulating about the origins of the very first cookie that was ever baked; tales of how it all began, in the Dough beyond time and the Ovens of destiny.</q>','Temple',7);
		order=575;new Game.TieredUpgrade('Cookiemancy','精灵塔工作效率 <b>翻倍</b>。<q>There it is; the perfected school of baking magic. From summoning chips to hexing nuts, there is not a single part of cookie-making that hasn\'t been improved tenfold by magic tricks.</q>','Wizard tower',7);
		order=600;new Game.TieredUpgrade('Dyson sphere','装船工作效率 <b>翻倍</b>。<q>You\'ve found a way to apply your knowledge of cosmic technology to slightly more local endeavors; this gigantic sphere of meta-materials, wrapping the solar system, is sure to kick your baking abilities up a notch.</q>','Shipment',7);
		order=700;new Game.TieredUpgrade('Theory of atomic fluidity','炼金实验室工作效率 <b>翻倍</b>。<q>Pushing alchemy to its most extreme limits, you find that everything is transmutable into anything else - lead to gold, mercury to water; more importantly, you realize that anything can -and should- be converted to cookies.</q>','Alchemy lab',7);
		order=800;new Game.TieredUpgrade('End of times back-up plan','传送门工作效率 <b>翻倍</b>。<q>Just in case, alright?</q>','Portal',7);
		order=900;new Game.TieredUpgrade('Great loop hypothesis','时光机器工作效率 <b>翻倍</b>。<q>What if our universe is just one instance of an infinite cycle? What if, before and after it, stretched infinite amounts of the same universe, themselves containing infinite amounts of cookies?</q>','Time machine',7);
		order=1000;new Game.TieredUpgrade('The Pulse','反物质冷凝器工作效率 <b>翻倍</b>。<q>You\'ve tapped into the very pulse of the cosmos, a timeless rhythm along which every material and antimaterial thing beats in unison. This, somehow, means more cookies.</q>','Antimatter condenser',7);
		order=1100;
		new Game.TieredUpgrade('Lux sanctorum','棱镜工作效率 <b>翻倍</b>。<q>Your prism attendants have become increasingly mesmerized with something in the light - or maybe something beyond it; beyond us all, perhaps?</q>','Prism',7);
		
		
		order=200;new Game.TieredUpgrade('未被发现的','老奶奶工作效率 <b>翻倍</b>。<q>这可能是一个糟糕的育儿方式的经典故事，但是让我们来看看奶奶是怎么做的。</q>','Grandma',8);
		order=300;new Game.TieredUpgrade('小麦的由来','农场工作效率 <b>翻倍</b>。<q>当你的植物可以在农场里到处走走，帮助你的时候，照料庄稼就容易多了。<br>没有宠物。不要进食。不要试图与之交谈。</q>','Farm',8);
		order=400;new Game.TieredUpgrade('菜籽油井','矿山工作效率 <b>翻倍</b>。<q>菜籽油是一种以前未开发的资源，它渗透在地下的橄榄石中，使其具有独特的味道和丰厚的性能.</q>','Mine',8);
		order=500;new Game.TieredUpgrade('每天78小时','工厂工作效率 <b>翻倍</b>。<q>我们为什么不早点想到这个呢?</q>','Factory',8);
		order=525;new Game.TieredUpgrade('基本原理','银行工作效率 <b>翻倍</b>。<q>如果不是现在,更待何时?如果不是，是什么?如果不是东西……东西呢?</q>','Bank',8);
		order=550;new Game.TieredUpgrade('神权政治','寺庙工作效率 <b>翻倍</b>。<q>你把你的饼干帝国变成了一个完美的神权政治，聚集了无数的追随者，从宇宙的每一个角落。<br/>别让它冲昏了你的头。</q>','Temple',8);
		order=575;new Game.TieredUpgrade('兔子戏法','精灵塔工作效率 <b>翻倍</b>。<q>除了一顶华丽的帽子外，你的巫师们已经找到了一种方法，可以同时控制兔子的数量，并能产生大量额外的饼干，基本上是免费的!<br>由此产生的饼干可能不适合纯素食者。</q>','Wizard tower',8);
		order=600;new Game.TieredUpgrade('最后的边界','装船工作效率 <b>翻倍</b>。<q>从那里到这里，这条路很长。不过，这一切都是值得的——景色很美，油价也稍微合理一些。</q>','Shipment',8);
		order=700;new Game.TieredUpgrade('原色古果','炼金实验室工作效率 <b>翻倍</b>。<q>现在，你已经做到了。干得好。很好。这是你的3个星系，你刚刚把它们转换成饼干。你可以从宇宙跳跃到宇宙。</q>','Alchemy lab',8);
		order=800;new Game.TieredUpgrade('疯狂的圣歌','传送门工作效率 <b>翻倍</b>。<q>流行的诗句是这样的 : "jau\'hn madden jau\'hn madden aeiouaeiouaeiou brbrbrbrbrbrbr"</q>','Portal',8);
		order=900;new Game.TieredUpgrade('也许是小饼干的时候','时光机器工作效率 <b>翻倍</b>。<q>追忆过去的事，本应是如此。</q>','Time machine',8);
		order=1000;new Game.TieredUpgrade('还有其他超微小的基本粒子吗?','反物质冷凝器工作效率 <b>翻倍</b>。<q>当连宇宙都没了主意的时候，当你知道你快要结束的时候。</q>','Antimatter condenser',8);
		order=1100;
		new Game.TieredUpgrade('反向阴影','棱镜工作效率 <b>翻倍</b>。<q>哦，老兄，这真让你的眼睛大乱。</q>','Prism',8);
		
		
		order=20000;
		new Game.Upgrade('小猫会计','你的牛奶越多，你获得的<b>饼干每秒产量越多<q>生意很好，先生</q>',900000000000000000000000,Game.GetIcon('Kitten',6));Game.last.kitten=1;Game.MakeTiered(Game.last,6,18);
		new Game.Upgrade('小猫专家','你的牛奶越多，你获得的<b>饼干每秒产量越多<q>乐观地调整你的工作流程，先生</q>',900000000000000000000000000,Game.GetIcon('Kitten',7));Game.last.kitten=1;Game.MakeTiered(Game.last,7,18);
		new Game.Upgrade('小猫能手','你的牛奶越多，你获得的<b>饼干每秒产量越多<q>先生，10年时间在饼干生意中度过了</q>',900000000000000000000000000000,Game.GetIcon('Kitten',8));Game.last.kitten=1;Game.MakeTiered(Game.last,8,18);
		
		new Game.Upgrade('如何烤你的龙','一旦你获得了100万个饼干，你就可以购买一个<b>易碎的鸡蛋</b>。<q>这本书里有很多有用的建议，比如“哦，上帝，离它远点”，“我们为什么要买这个东西，它甚至连房子都没破”和“一周两次，朝着天平的方向”。</q>',9,[22,12]);Game.last.pool='prestige';

		order=25100;
		new Game.Upgrade('易碎的鸡蛋','解锁 <b>饼干龙蛋</b>.<q>谢谢你收养了这个健壮的，有趣的饼干龙!它将给你带来数年的欢乐和娱乐。<br>保持干燥凉爽的环境，远离其他宠物。强烈建议购买家庭保险。</q>',25,[21,12]);
		
<<<<<<< HEAD:main.js
		new Game.Upgrade('奇美拉','协同升级的成本<b>降低了2%</b>。<br>你获得了另外 <b>+5%</b> 基本饼干产量，当游戏关闭时。<br>当游戏关闭 <b>2 天以上</b> 时，会保持最优的饼干生产。<q>比它的各个部分的总和还多。</q>',Math.pow(angelPriceFactor,8),[24,7]);Game.last.pool='prestige';Game.last.parents=['上帝','路西法','协同效应2'];
=======
		new Game.Upgrade('Chimera','Synergy upgrades are <b>2% cheaper</b>.<br>You gain another <b>+5%</b> of your regular CpS while the game is closed.<br>You retain optimal cookie production while the game is closed for <b>2 more days</b>.<q>More than the sum of its parts.</q>',Math.pow(angelPriceFactor,9),[24,7]);Game.last.pool='prestige';Game.last.parents=['God','Lucifer','Synergies Vol. II'];
>>>>>>> 20180919:main.js
		
		new Game.Upgrade('奶油饼干罐头','含有丰富的奶油饼干。<q>丹麦饼干的五个品种。<br/>配小纸杯。</q>',25,[21,9]);Game.last.pool='prestige';Game.last.parents=['天堂饼干'];
		
		new Game.Upgrade('黄金开关','解锁 <b>黄金开关</b>, 这可以让你的饼干秒产量增加50%，但会让你失去金色的饼干。<q>更少的点击,更多的空闲。</q>',999,[21,10]);Game.last.pool='prestige';Game.last.parents=['天上的运气'];
		
		new Game.Upgrade('选择经典的乳制品','解锁 <b>牛奶选择器</b>, 让你挑出你的饼干下面的牛奶。<br>有各种各样的基本口味。<q>别大惊小怪的，老兄。</q>',9,[1,8]);Game.last.pool='prestige';Game.last.parents=[];
		
		new Game.Upgrade('奇特的乳制品选择','为您提供更多的异国风味的牛奶选择器.<q>骨骼强健的骷颅军队。</q>',1000000,[9,7]);Game.last.pool='prestige';Game.last.parents=['选择经典的乳制品'];
		
		order=10300;
		Game.NewUpgradeCookie({name:'龙形饼干',desc:'这款神秘的小甜饼充满了一种成熟的饼干龙的活力和活力，它将为你的后代壮胆。',icon:[10,25],power:5,price:9999999999999999*7,locked:1});
		
		
		order=40000;
		new Game.Upgrade('黄金开关[关闭]','打开这个会让你变得被动 <b>+50% 饼干秒产量</b>, 但是阻止了金色饼干的产生。<br>成本等于生产一小时。',1000000,[20,10]);
		Game.last.pool='toggle';Game.last.toggleInto='黄金开关[开启]';
		Game.last.priceFunc=function(){return Game.cookiesPs*60*60;}
		var func=function(){
			if (Game.Has('Residual luck'))
			{
				var bonus=0;
				var upgrades=Game.goldenCookieUpgrades;
				for (var i in upgrades) {if (Game.Has(upgrades[i])) bonus++;}
				return '<div style="text-align:center;font-size:80%;">The effective boost is <b>+'+Beautify(Math.round(50+bonus*10))+'%</b><br>thanks to residual luck and your '+bonus+' golden cookie upgrade'+(bonus==1?'':'s')+'</div><div class="line"></div>'+this.desc;
			}
			return this.desc;
		};
		Game.last.descFunc=func;
		
		new Game.Upgrade('黄金开关[开启]','这个开关现在是被动的 <b>+50% 饼干秒产量</b>; 它还可以防止黄金饼干产生。<br>关闭它将恢复这些效果。<br>成本等于1小时的生产。',1000000,[21,10]);
		Game.last.pool='toggle';Game.last.toggleInto='黄金开关[关闭]';
		Game.last.priceFunc=function(){return Game.cookiesPs*60*60;}
		Game.last.descFunc=func;
		
		order=50000;
<<<<<<< HEAD:main.js
		new Game.Upgrade('牛奶选择器','让你选择要展示的牛奶的味道。',0,[1,8]);
=======
		new Game.Upgrade('Milk selector','Lets you pick what flavor of milk to display.',0,[1,8]);
		Game.last.descFunc=function(){
			var choice=this.choicesFunction()[Game.milkType];
			return '<div style="text-align:center;">Current : <div class="icon" style="vertical-align:middle;display:inline-block;'+(choice.icon[2]?'background-image:url('+choice.icon[2]+');':'')+'background-position:'+(-choice.icon[0]*48)+'px '+(-choice.icon[1]*48)+'px;transform:scale(0.5);margin:-16px;"></div> <b>'+choice.name+'</b></div><div class="line"></div>'+this.desc;
		};
		
>>>>>>> 20180919:main.js
		Game.last.pool='toggle';
		Game.last.choicesFunction=function()
		{
			var choices=[];
			choices[0]={name:'自动',icon:[0,7]};
			choices[1]={name:'纯牛奶',icon:[1,8]};
			choices[2]={name:'巧克力牛奶',icon:[2,8]};
			choices[3]={name:'树莓牛奶',icon:[3,8]};
			choices[4]={name:'橙汁牛奶',icon:[4,8]};
			choices[5]={name:'焦糖牛奶',icon:[5,8]};
			choices[6]={name:'香蕉牛奶',icon:[6,8]};
			choices[7]={name:'石灰牛奶',icon:[7,8]};
			choices[8]={name:'蓝莓牛奶',icon:[8,8]};
			choices[9]={name:'草莓牛奶',icon:[9,8]};
			choices[10]={name:'香草牛奶',icon:[10,8]};
			
			if (Game.Has('奇特的乳制品选择'))
			{
				choices[11]={name:'Zebra milk',icon:[10,7]};
				choices[12]={name:'Cosmic milk',icon:[9,7]};
				choices[13]={name:'Flaming milk',icon:[8,7]};
				choices[14]={name:'Sanguine milk',icon:[7,7]};
				choices[15]={name:'Midas milk',icon:[6,7]};
				choices[16]={name:'Midnight milk',icon:[5,7]};
				choices[17]={name:'Green inferno milk',icon:[4,7]};
				choices[18]={name:'Frostfire milk',icon:[3,7]};
				
				choices[24]={name:'Soy milk',icon:[27,23]};
			}
			
			choices[19]={name:'蜂蜜牛奶',icon:[21,23]};
			choices[20]={name:'咖啡牛奶',icon:[22,23]};
			choices[21]={name:'加茶牛奶',icon:[23,23]};
			choices[22]={name:'椰子牛奶',icon:[24,23]};
			choices[23]={name:'樱桃牛奶',icon:[25,23]};
			
<<<<<<< HEAD:main.js
			choices[25]={name:'香料牛奶',icon:[26,23]};
=======
			choices[25]={name:'Spiced milk',icon:[26,23]};
			choices[26]={name:'Maple milk',icon:[28,23]};
>>>>>>> 20180919:main.js
			
			choices[Game.milkType].selected=1;
			return choices;
		}
		Game.last.choicesPick=function(id)
		{Game.milkType=id;}
		
		Game.MilksByChoice={
			0:{pic:'milkPlain'},
			1:{pic:'milkPlain'},
			2:{pic:'milkChocolate'},
			3:{pic:'milkRaspberry'},
			4:{pic:'milkOrange'},
			5:{pic:'milkCaramel'},
			6:{pic:'milkBanana'},
			7:{pic:'milkLime'},
			8:{pic:'milkBlueberry'},
			9:{pic:'milkStrawberry'},
			10:{pic:'milkVanilla'},
			11:{pic:'milkZebra'},
			12:{pic:'milkStars'},
			13:{pic:'milkFire'},
			14:{pic:'milkBlood'},
			15:{pic:'milkGold'},
			16:{pic:'milkBlack'},
			17:{pic:'milkGreenFire'},
			18:{pic:'milkBlueFire'},
			19:{pic:'milkHoney'},
			20:{pic:'milkCoffee'},
			21:{pic:'milkTea'},
			22:{pic:'milkCoconut'},
			23:{pic:'milkCherry'},
			24:{pic:'milkSoy'},
			25:{pic:'milkSpiced'},
			26:{pic:'milkMaple'},
		};
		
		
		order=10300;
		Game.NewUpgradeCookie({name:'牛奶巧克力奶油饼干',desc:'当你拥有100个各种建筑时的奖励。这是一位优秀企业家的雕刻。',icon:[27,8],power:	10,price: 999999999999999999999,locked:1});
		Game.NewUpgradeCookie({name:'黑巧克力奶油饼干',desc:'当你拥有150个各种建筑时的奖励。<br>它的形象是一位经验丰富的饼干大亨的形象。',icon:[27,9],power:	10,price: 999999999999999999999999,locked:1});
		Game.NewUpgradeCookie({name:'白巧克力奶油饼干',desc:'当你拥有200个各种建筑时的奖励。<br>巧克力的轮廓，描绘了一位优秀的糕点大亨。',icon:[28,9],power:	10,price: 999999999999999999999999999,locked:1});
		Game.NewUpgradeCookie({name:'红宝石巧克力奶油饼干',desc:'当你拥有250个各种建筑时的奖励。<br>这款饼干被一种罕见的红色巧克力所覆盖，它被蚀刻成一个饼干产业主义者的脸，这是一种疯狂的力量。',icon:[28,8],power:	10,price: 999999999999999999999999999999,locked:1});
		
		order=10020;
		Game.NewUpgradeCookie({name:'姜饼',desc:'带着灵魂的饼干。可能吧。',icon:[29,10],power:						4,price: 99999999999999999999});
		Game.NewUpgradeCookie({name:'肉桂饼干',desc:'秘密是在专利的旋转玻璃上。',icon:[23,8],power:						4,price: 99999999999999999999*5});
		Game.NewUpgradeCookie({name:'小甜饼',desc:'在这个颓废的小甜饼上有一个小小的蜜饯水果。',icon:[22,8],power:						4,price: 999999999999999999999});
		Game.NewUpgradeCookie({name:'雪茄',desc:'最近，他们在咖啡店里卖的那些奢侈的曲奇饼干都卖得很好。',icon:[25,8],power:						4,price: 999999999999999999999*5});
		Game.NewUpgradeCookie({name:'风车饼干',desc:'给你带来令人眼花缭乱的棕色味道和米黄色味道！',icon:[22,10],power:						4,price: 9999999999999999999999});
		Game.NewUpgradeCookie({name:'软糖方块',desc:'不完全是饼干，但一旦你尝了其中的一种，你就不会在意。<br/>他们太棒了，这太棒了!',icon:[24,8],power:						4,price: 9999999999999999999999*5});
		
		order=10030;
		Game.NewUpgradeCookie({name:'数字',desc:'三种口味，零指骨。',icon:[26,8],require:'品牌饼干盒',power:												2,	price:	999999999999999*5});
		
		order=10030;
		Game.NewUpgradeCookie({name:'黄油马蹄铁',desc:'你不应该过分沉溺其中。',icon:[22,9],require:'奶油饼干罐头',power:							4,	price:	99999999999999999999999});
		Game.NewUpgradeCookie({name:'奶油泡',desc:'主啊，这些凡人是多么愚蠢啊！<br>(这是一个很重要的参考。)',icon:[23,9],require:'奶油饼干罐头',power:							4,	price:	99999999999999999999999*5});
		Game.NewUpgradeCookie({name:'黄油结',desc:'听着，如果你想的话，你可以叫这些椒盐卷饼，但是你只是在愚弄你自己，对吗?',icon:[24,9],require:'奶油饼干罐头',power:							4,	price:	999999999999999999999999});
		Game.NewUpgradeCookie({name:'黄油板',desc:'没有什么比一张板脸更好的了。',icon:[25,9],require:'奶油饼干罐头',power:							4,	price:	999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'黄油漩涡',desc:'这些都是糖、黄油和温暖的模糊感觉——所有这些都导致了每天数百万人的死亡。',icon:[26,9],require:'奶油饼干罐头',power:							4,	price:	9999999999999999999999999});
		
		order=10020;
		Game.NewUpgradeCookie({name:'脆饼饼干',desc:'这些奶油饼干既不短也不面包。多么好的国家啊!',icon:[23,10],power:						4,price: 99999999999999999999999});
		Game.NewUpgradeCookie({name:'百万富翁酥饼',desc:'三层令人深思的奶油巧克力，辛勤的焦糖和松软的饼干，这是阶级斗争的尖锐评论。',icon:[24,10],power:						4,price: 99999999999999999999999*5});
		Game.NewUpgradeCookie({name:'焦糖饼干',desc:'这些饼干的聚合碳水化合物肯定会粘在你的牙齿上一段时间。',icon:[25,10],power:						4,price: 999999999999999999999999});
		
		
		var desc=function(totalHours){
			var hours=totalHours%24;
			var days=Math.floor(totalHours/24);
			var str=hours+(hours==1?' 小时':' 小时');
			if (days>0) str=days+(days==1?' 天':' 天')+' 和 '+str;
			return '在游戏结束的时候，你保持最佳的饼干制作时间是所有的两倍 <b>'+str+'</b>.';
		}
		new Game.Upgrade('贝尔菲格',desc(2)+'<q>一个有捷径和懒惰的恶魔，他命令机器替他干活。</q>',Math.pow(angelPriceFactor,1),[7,11]);Game.last.pool='prestige';Game.last.parents=['双重超越之门'];
		new Game.Upgrade('财神',desc(4)+'<q>财富的恶魔化身,财神从他所有的信徒请求一个小部分血和黄金。</q>',Math.pow(angelPriceFactor,2),[8,11]);Game.last.pool='prestige';Game.last.parents=['贝尔菲格'];
		new Game.Upgrade('阿巴登',desc(8)+'<q>放纵的大师,阿巴登着皱纹窝和激发他们的不知足。</q>',Math.pow(angelPriceFactor,3),[9,11]);Game.last.pool='prestige';Game.last.parents=['财神'];
		new Game.Upgrade('撒旦',desc(16)+'<q>对一切正直的人来说，这个魔鬼代表着欺骗和诱惑的邪恶势力。</q>',Math.pow(angelPriceFactor,4),[10,11]);Game.last.pool='prestige';Game.last.parents=['阿巴登'];
		new Game.Upgrade('魔王',desc(32)+'<q>这个恶魔有三个可怕的脑袋，他的力量来自于对饼干和所有甜食的强烈渴望。</q>',Math.pow(angelPriceFactor,5),[11,11]);Game.last.pool='prestige';Game.last.parents=['撒旦'];
		new Game.Upgrade('恶魔',desc(64)+'<q>枯萎病和疾病的不断恶化的化身,恶的大军糕点地狱魔规则。</q>',Math.pow(angelPriceFactor,6),[12,11]);Game.last.pool='prestige';Game.last.parents=['魔王'];
		new Game.Upgrade('路西法',desc(128)+'<q>也被称为光明使者，这个可恶的王子的自负让他从糕点天堂被抛弃了。</q>',Math.pow(angelPriceFactor,7),[13,11]);Game.last.pool='prestige';Game.last.parents=['恶魔'];
		
		new Game.Upgrade('金色饼干提示音','解锁 <b>黄金饼干声音选择器</b>, 这让你可以选择黄金饼干是否在出现时发出声音。<q>一个良好的决策。</q>',9999,[28,6]);Game.last.pool='prestige';Game.last.parents=['决定性的命运','黄金开关'];
		
		order=49900;
<<<<<<< HEAD:main.js
		new Game.Upgrade('黄金饼干声音选择器','让你改变黄金饼干产生时的声音。',0,[28,6]);
=======
		new Game.Upgrade('Golden cookie sound selector','Lets you change the sound golden cookies make when they spawn.',0,[28,6]);
		Game.last.descFunc=function(){
			var choice=this.choicesFunction()[Game.chimeType];
			return '<div style="text-align:center;">Current : <div class="icon" style="vertical-align:middle;display:inline-block;'+(choice.icon[2]?'background-image:url('+icon[2]+');':'')+'background-position:'+(-choice.icon[0]*48)+'px '+(-choice.icon[1]*48)+'px;transform:scale(0.5);margin:-16px;"></div> <b>'+choice.name+'</b></div><div class="line"></div>'+this.desc;
		};
		
>>>>>>> 20180919:main.js
		Game.last.pool='toggle';
		Game.last.choicesFunction=function()
		{
			var choices=[];
			choices[0]={name:'No sound',icon:[0,7]};
			choices[1]={name:'Chime',icon:[22,6]};
			
			choices[Game.chimeType].selected=1;
			return choices;
		}
		Game.last.choicesPick=function(id)
		{Game.chimeType=id;}
		
		
		new Game.Upgrade('基本壁纸分类','解锁 <b>背景选择器</b>, 让你可以选择游戏的背景。<br>有各种各样的基本口味。<q>优先考虑美学而不是关键的实用升级?让我印象深刻。</q>',99,[29,5]);Game.last.pool='prestige';Game.last.parents=['选择经典的乳制品'];
		
		new Game.Upgrade('遗产','这是第一次天堂的升级;它解锁<b>天堂芯片</b>系统。<div class="line"></div>你每转生一次，你过去生活中的饼干就变成了 <b>天堂芯片</b> 和 <b>声望</b>.<div class="line"></div><b>天堂芯片</b> 可以用于各种永久的超越升级。<div class="line"></div>您的 <b>声望等级</b> 每一级会给你永久的 <b>+1% 饼干秒生产量</b> 。<q>我们都在等你。</q>',1,[21,6]);Game.last.pool='prestige';Game.last.parents=[];
		
		new Game.Upgrade('老香料','你可以吸引 <b>2 更多的皱纹</b>.<q>你的饼干闻起来像的饼干。</q>',444444,[19,8]);Game.last.pool='prestige';Game.last.parents=['邪恶的诱饵'];
		
		new Game.Upgrade('残余运气','当金色开关打开时，你会得到额外的 <b>+10% 饼干秒生产量</b> 每个黄金饼干升级所有。<q>财富的方法有许多种。</q>',99999,[27,6]);Game.last.pool='prestige';Game.last.parents=['黄金开关'];
		
		order=150;new Game.Upgrade('范塔钢鼠标','点击获得 <b>+1% 饼干秒生产量</b>.<q>你可以用你的触摸板来点击，而我们不会变得更聪明。</q>',5000000000000000000,[11,17]);Game.MakeTiered(Game.last,8,11);
		new Game.Upgrade('永不崩溃的鼠标','点击获得 <b>+1% 总秒收益</b>.<q>你能造一只鼠标直到它被认为是鼠标吗?</q>',500000000000000000000,[11,18]);Game.MakeTiered(Game.last,9,11);
		
		
		new Game.Upgrade('五指折扣','所有升级 <b>便宜1% ，当你有每100个游标时</b>.<q>它贴在男人身上。</q>',555555,[28,7],function(){Game.upgradesToRebuild=1;});Game.last.pool='prestige';Game.last.parents=['光环手套','阿巴登'];
		
		
		order=5000;
<<<<<<< HEAD:main.js
		new Game.SynergyUpgrade('未来年鉴','<q>让你预测最佳的种植时间。时间旅行能做的事真是太疯狂了!</q>','Farm','Time machine','synergy1');
		new Game.SynergyUpgrade('雨中的祈祷','<q>这是一种涉及复杂的舞蹈动作和高科技的云计算激光的精神仪式。</q>','Farm','Temple','synergy2');
		
		new Game.SynergyUpgrade('地震魔法','<q>意外地震是魔法兄弟会的老宠儿。</q>','Mine','Wizard tower','synergy1');
		new Game.SynergyUpgrade('小行星采矿','<q>根据<span> 19 </span> 74联合宇宙大会，彗星，卫星和有人居住的小行星不再是合法的可挖掘物。但是，嘿，太空贿赂还有很长的路要走。</q>','Mine','Shipment','synergy2');
		
		new Game.SynergyUpgrade('量子电子学','<q>你的机器甚至不确定它们是否开启或关闭！</q>','Factory','Antimatter condenser','synergy1');
		new Game.SynergyUpgrade('颞超频','<q>在系统中引入更多速度，以提高牢度。</q>','Factory','Time machine','synergy2');
		
		new Game.SynergyUpgrade('来自远方的合同','<q>一定要仔细阅读！</q>','Bank','Portal','synergy1');
		new Game.SynergyUpgrade('印刷机','<q>虚假票据如此真实，它们几乎值得他们印刷的墨水。</q>','Bank','Factory','synergy2');
		
		new Game.SynergyUpgrade('异教','<q>有些神灵最好不要离婚。</q>','Temple','Portal','synergy1');
		new Game.SynergyUpgrade('上帝粒子','<q>事实证明，上帝比我们想象的要小得多。</q>','Temple','Antimatter condenser','synergy2');
		
		new Game.SynergyUpgrade('奥术知识','<q>有些事情从来没有被人知道 - 只是有点推测。</q>','Wizard tower','Alchemy lab','synergy1');
		new Game.SynergyUpgrade('神奇植物学','<q>在一些反动报纸中已经称为“巫师的转基因生物”。</q>','Wizard tower','Farm','synergy2');
		
		new Game.SynergyUpgrade('化石燃料','<q>不知何故比钚更能为火箭提供动力。<br>从古代化石文明的燃料中提取。</q>','Shipment','Mine','synergy1');
		new Game.SynergyUpgrade('船厂','<q>当木工，盲目的运气，和石棉保温团结起来，产生在这个星球上最耀眼的太空船。</q>','Shipment','Factory','synergy2');
		
		new Game.SynergyUpgrade('原始矿石','<q>只有在精制最纯净的金属时，才能提取出最甜蜜的地球汁液。</q>','Alchemy lab','Mine','synergy1');
		new Game.SynergyUpgrade('黄金基金','<q>如果黄金是经济的支柱，肯定是饼干的髋关节。</q>','Alchemy lab','Bank','synergy2');
		
		new Game.SynergyUpgrade('地狱作物','<q>定期用火喷洒。</q>','Portal','Farm','synergy1');
		new Game.SynergyUpgrade('暗淡的微光','<q>有人或某事正在盯着你。<br>也许在我们所有人身上。</q>','Portal','Prism','synergy2');
		
		new Game.SynergyUpgrade('相对论性的省略','<q>人们会告诉你这在物理上是不可能的。<br>这些是你不想要的人。</q>','Time machine','Shipment','synergy1');
		new Game.SynergyUpgrade('原始辉光','<q>从无止境的时代开始，古老的光芒仍然闪耀着，在它的晚年仍然是不可思议的纯净和脆弱。</q>','Time machine','Prism','synergy2');
		
		new Game.SynergyUpgrade('额外的物理资金','<q>是时候把你的钱放在粒子碰撞器的位置了。</q>','Antimatter condenser','Bank','synergy1');
		new Game.SynergyUpgrade('化学能力','<q>发现令人兴奋的新元素，如Fleshmeltium，Inert Shampoo Byproduct＃17和Carbon ++！</q>','Antimatter condenser','Alchemy lab','synergy2');
		
		new Game.SynergyUpgrade('光明魔法','<q>其实不要掉以轻心！ 不，我认真的。 去年有178人死亡。 你不要乱用魔法。</q>','Prism','Wizard tower','synergy1');
		new Game.SynergyUpgrade('神秘的能量','<q>在光明中有些东西在招手。 它是温暖，舒适，并且显然是几种外来皮肤癌的原因。</q>','Prism','Temple','synergy2');
		
		
		new Game.Upgrade('协同效应1','解锁新一层的升级，<b> 同时影响2栋建筑</b>。<br>一旦你同时拥有<b> 15 </b>所有建筑物，就会出现协同作用。<q>许多人击败了少数人。</q>',2525,[10,20]);Game.last.pool='prestige';Game.last.parents=['撒旦','领地'];
		new Game.Upgrade('协同效应2','解锁新一层的升级，<b> 同时影响2栋建筑</b>。<br>一旦你同时拥有<b> 75 </b>所有建筑物，就会出现协同作用。<q>这几个击败了许多人。</q>',252525,[10,29]);Game.last.pool='prestige';Game.last.parents=['恶魔','六翼天使','协同效应1'];
=======
		Game.SynergyUpgrade('Future almanacs','<q>Lets you predict optimal planting times. It\'s crazy what time travel can do!</q>','Farm','Time machine','synergy1');
		Game.SynergyUpgrade('Rain prayer','<q>A deeply spiritual ceremonial involving complicated dance moves and high-tech cloud-busting lasers.</q>','Farm','Temple','synergy2');
		
		Game.SynergyUpgrade('Seismic magic','<q>Surprise earthquakes are an old favorite of wizardly frat houses.</q>','Mine','Wizard tower','synergy1');
		Game.SynergyUpgrade('Asteroid mining','<q>As per the <span>19</span>74 United Cosmic Convention, comets, moons, and inhabited planetoids are no longer legally excavatable.<br>But hey, a space bribe goes a long way.</q>','Mine','Shipment','synergy2');
		
		Game.SynergyUpgrade('Quantum electronics','<q>Your machines won\'t even be sure if they\'re on or off!</q>','Factory','Antimatter condenser','synergy1');
		Game.SynergyUpgrade('Temporal overclocking','<q>Introduce more quickitude in your system for increased speedation of fastness.</q>','Factory','Time machine','synergy2');
		
		Game.SynergyUpgrade('Contracts from beyond','<q>Make sure to read the fine print!</q>','Bank','Portal','synergy1');
		Game.SynergyUpgrade('Printing presses','<q>Fake bills so real, they\'re almost worth the ink they\'re printed with.</q>','Bank','Factory','synergy2');
		
		Game.SynergyUpgrade('Paganism','<q>Some deities are better left unworshipped.</q>','Temple','Portal','synergy1');
		Game.SynergyUpgrade('God particle','<q>Turns out God is much tinier than we thought, I guess.</q>','Temple','Antimatter condenser','synergy2');
		
		Game.SynergyUpgrade('Arcane knowledge','<q>Some things were never meant to be known - only mildly speculated.</q>','Wizard tower','Alchemy lab','synergy1');
		Game.SynergyUpgrade('Magical botany','<q>Already known in some reactionary newspapers as "the wizard\'s GMOs".</q>','Wizard tower','Farm','synergy2');
		
		Game.SynergyUpgrade('Fossil fuels','<q>Somehow better than plutonium for powering rockets.<br>Extracted from the fuels of ancient, fossilized civilizations.</q>','Shipment','Mine','synergy1');
		Game.SynergyUpgrade('Shipyards','<q>Where carpentry, blind luck, and asbestos insulation unite to produce the most dazzling spaceships on the planet.</q>','Shipment','Factory','synergy2');
		
		Game.SynergyUpgrade('Primordial ores','<q>Only when refining the purest metals will you extract the sweetest sap of the earth.</q>','Alchemy lab','Mine','synergy1');
		Game.SynergyUpgrade('Gold fund','<q>If gold is the backbone of the economy, cookies, surely, are its hip joints.</q>','Alchemy lab','Bank','synergy2');
		
		Game.SynergyUpgrade('Infernal crops','<q>Sprinkle regularly with FIRE.</q>','Portal','Farm','synergy1');
		Game.SynergyUpgrade('Abysmal glimmer','<q>Someone, or something, is staring back at you.<br>Perhaps at all of us.</q>','Portal','Prism','synergy2');
		
		Game.SynergyUpgrade('Relativistic parsec-skipping','<q>People will tell you this isn\'t physically possible.<br>These are people you don\'t want on your ship.</q>','Time machine','Shipment','synergy1');
		Game.SynergyUpgrade('Primeval glow','<q>From unending times, an ancient light still shines, impossibly pure and fragile in its old age.</q>','Time machine','Prism','synergy2');
		
		Game.SynergyUpgrade('Extra physics funding','<q>Time to put your money where your particle colliders are.</q>','Antimatter condenser','Bank','synergy1');
		Game.SynergyUpgrade('Chemical proficiency','<q>Discover exciting new elements, such as Fleshmeltium, Inert Shampoo Byproduct #17 and Carbon++!</q>','Antimatter condenser','Alchemy lab','synergy2');
		
		Game.SynergyUpgrade('Light magic','<q>Actually not to be taken lightly! No, I\'m serious. 178 people died last year. You don\'t mess around with magic.</q>','Prism','Wizard tower','synergy1');
		Game.SynergyUpgrade('Mystical energies','<q>Something beckons from within the light. It is warm, comforting, and apparently the cause for several kinds of exotic skin cancers.</q>','Prism','Temple','synergy2');
		
		
		new Game.Upgrade('Synergies Vol. I','Unlocks a new tier of upgrades that affect <b>2 buildings at the same time</b>.<br>Synergies appear once you have <b>15</b> of both buildings.<q>The many beats the few.</q>',222222,[10,20]);Game.last.pool='prestige';Game.last.parents=['Satan','Dominions'];
		new Game.Upgrade('Synergies Vol. II','Unlocks a new tier of upgrades that affect <b>2 buildings at the same time</b>.<br>Synergies appear once you have <b>75</b> of both buildings.<q>The several beats the many.</q>',2222222,[10,29]);Game.last.pool='prestige';Game.last.parents=['Beelzebub','Seraphim','Synergies Vol. I'];
>>>>>>> 20180919:main.js
		
		new Game.Upgrade('天堂饼干','饼干生产增加 <b>+10% 永久产量</b>.<q>和天堂芯片一起拷。另一种超越时间和空间的文字。</q>',3,[25,12]);Game.last.pool='prestige';Game.last.parents=['遗产'];Game.last.power=10;Game.last.pseudoCookie=true;
		new Game.Upgrade('皱纹饼干','饼干生产增加 <b>+10% 永久地</b>.<q>在一个时间和空间都没有意义的地方，普通饼干的结果会让无数的电子人离开。</q>',6666666,[26,12]);Game.last.pool='prestige';Game.last.parents=['亵渎神明','老香料'];Game.last.power=10;Game.last.pseudoCookie=true;
		new Game.Upgrade('翻倍运气的精华','金色饼干（以及所有其他产生的东西，如驯鹿）有<b>1%的几率被加倍</b>.<q>味道亮闪闪的。空的小瓶是用来做大铅笔的。</q>',7777777,[27,12]);Game.last.pool='prestige';Game.last.parents=['神圣的面包店','残余运气'];
		
		order=40000;
		new Game.Upgrade('神秘障碍','饼干生产 <b>减少到 0</b>.<q>如果症状持续，请咨询医生。</q>',7,[15,5]);//debug purposes only
		Game.last.pool='debug';
		new Game.Upgrade('葡萄糖空气','糖块会<b>更快地</b>结合在一起.<q>不要呼吸太多，否则你会得糖尿病的!</q>',7,[29,16]);//debug purposes only
		Game.last.pool='debug';
		
		order=10300;
		Game.NewUpgradeCookie({name:'薰衣草巧克力奶油饼干',desc:'拥有300个各种建筑。<br>这种口味微妙的饼干代表了几十年来最高机密的研究成果。巧克力造型的造型就像一位著名的企业家，把他们的一切都献给了古老的烘焙之路。',icon:[26,10],power:	10,price: 999999999999999999999999999999999,locked:1});
		
		order=10030;
		Game.NewUpgradeCookie({name:'伦巴第饼干',desc:'这些来自那些有着良好记忆的农场。',icon:[23,13],require:'品牌饼干盒',power:												3,	price:	999999999999999999999*5});
		Game.NewUpgradeCookie({name:'巴斯顿坎饼干',desc:'法国曲奇饼是由香肉桂和糖制成的。这些不含坚果!',icon:[24,13],require:'品牌饼干盒',power:												3,	price:	999999999999999999999*5});
		
		order=10020;
		Game.NewUpgradeCookie({name:'山核桃饼干',desc:'把坚果粘在饼干上，把它叫做一天！给你的乐队命名!随你的便!',icon:[25,13],power:						4,price: 999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'摩拉维亚香料饼干',desc:'它是世界上最美味的饼干。',icon:[26,13],power:						4,price: 9999999999999999999999999});
		Game.NewUpgradeCookie({name:'澳扎克饼干',desc:'从一家面包店买来的军用饼干，里面没有鸡蛋，只有燕麦。',icon:[27,13],power:						4,price: 9999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'黄油蛋糕',desc:'这些饼干的胆固醇含量高，这些饼干在饼干的法律定义和简单的黄油块之间的线之间有一层关系。',icon:[29,13],power:						4,price: 99999999999999999999999999});
		Game.NewUpgradeCookie({name:'冰淇淋三明治',desc:'在另一个宇宙中，“冰淇淋三明治”设计了一个冰淇淋蛋筒，里面装满了熏肉、生菜和西红柿。也许一些洒。',icon:[28,13],power:						4,price: 99999999999999999999999999*5});
		
		new Game.Upgrade('甜菊糖','糖块成熟 <b>早一个小时</b>.<q>一种由天使在天堂花园中种植的超自然的甜味植物。</q>',100000000,[25,15]);Game.last.pool='prestige';Game.last.parents=['皱纹饼干'];
		new Game.Upgrade('糖尿病患者','糖块成熟 <b>早一个小时</b>.<q>这是一种恶毒的，据说是在黑暗的深渊的悬崖上生长的美味的药草。</q>',300000000,[26,15]);Game.last.pool='prestige';Game.last.parents=['甜菊糖','路西法'];
		new Game.Upgrade('舒张症','分叉糖块出现几率 <b>5% 更多地</b> 并且 <b>5% 更有可能</b> 掉两个糖块。<q>一种罕见的无趣的浆果，它的用途是有限的;只受那些贪心的收藏家的追捧，他们手上有太多的财富。</q>',1000000000,[27,15]);Game.last.pool='prestige';Game.last.parents=['糖尿病患者'];
		
		//note : these showIf functions stop working beyond 10 quadrillion prestige level, due to loss in precision; the solution, of course, is to make sure 10 quadrillion is not an attainable prestige level
		new Game.Upgrade('幸运数字','<b>+1%</b> 声望等级每秒饼干产量效果<br><b>+1%</b> 黄金饼干效果持续时间。<br><b>+1%</b> 黄金饼干寿命。<q>这种升级有点害羞，只有当你的声望等级达到7时才会出现。</q>',777,[24,15]);Game.last.pool='prestige';Game.last.parents=['天上的运气'];Game.last.showIf=function(){return (Math.ceil(Game.prestige)%10==7);};
		new Game.Upgrade('幸运数','<b>+1%</b> 声望等级每秒饼干产量效果<br><b>+1%</b> 黄金饼干效果持续时间。<br><b>+1%</b> 黄金饼干寿命。<q>这是一个隐藏的绅士，只有当你的声望达到777时才会出现。</q>',77777,[24,15]);Game.last.pool='prestige';Game.last.parents=['幸运数字','永恒的财富'];Game.last.showIf=function(){return (Math.ceil(Game.prestige)%1000==777);};
		new Game.Upgrade('幸运的支付','<b>+1%</b> 声望等级每秒饼干产量效果<br><b>+1%</b> 黄金饼干效果持续时间。<br><b>+1%</b> 黄金饼干寿命。<q>这一升级誓言与世界其他地区完全隔绝，只有当你的声望达到777777时才会出现。',77777777,[24,15]);Game.last.pool='prestige';Game.last.parents=['幸运数','决定性的命运'];Game.last.showIf=function(){return (Math.ceil(Game.prestige)%1000000==777777);};
		
		order=50000;
<<<<<<< HEAD:main.js
		new Game.Upgrade('背景选择器','让您选择要显示的壁纸。',0,[29,5]);
=======
		new Game.Upgrade('Background selector','Lets you pick which wallpaper to display.',0,[29,5]);
		Game.last.descFunc=function(){
			var choice=this.choicesFunction()[Game.bgType];
			return '<div style="text-align:center;">Current : <div class="icon" style="vertical-align:middle;display:inline-block;'+(choice.icon[2]?'background-image:url('+choice.icon[2]+');':'')+'background-position:'+(-choice.icon[0]*48)+'px '+(-choice.icon[1]*48)+'px;transform:scale(0.5);margin:-16px;"></div> <b>'+choice.name+'</b></div><div class="line"></div>'+this.desc;
		};
		
>>>>>>> 20180919:main.js
		Game.last.pool='toggle';
		Game.last.choicesFunction=function()
		{
			var choices=[];
			choices[0]={name:'Automatic',icon:[0,7]};
			choices[1]={name:'Blue',icon:[21,21]};
			choices[2]={name:'Red',icon:[22,21]};
			choices[3]={name:'White',icon:[23,21]};
			choices[4]={name:'Black',icon:[24,21]};
			choices[5]={name:'Gold',icon:[25,21]};
			choices[6]={name:'Grandmas',icon:[26,21]};
			choices[7]={name:'Displeased grandmas',icon:[27,21]};
			choices[8]={name:'Angered grandmas',icon:[28,21]};
			choices[9]={name:'Money',icon:[29,21]};
			choices[Game.bgType].selected=1;
			return choices;
		}
		Game.last.choicesPick=function(id)
		{Game.bgType=id;}
		
		Game.BGsByChoice={
			0:{pic:'bgBlue'},
			1:{pic:'bgBlue'},
			2:{pic:'bgRed'},
			3:{pic:'bgWhite'},
			4:{pic:'bgBlack'},
			5:{pic:'bgGold'},
			6:{pic:'grandmas1'},
			7:{pic:'grandmas2'},
			8:{pic:'grandmas3'},
			9:{pic:'bgMoney'},
		};
		
		order=255;
<<<<<<< HEAD:main.js
		new Game.Upgrade('幸运老奶奶',Game.getGrandmaSynergyUpgradeDesc('Chancemaker')+'<q>幸运的奶奶总是能找到更多的饼干。</q>',Game.Objects['Chancemaker'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
=======
		Game.GrandmaSynergy('Lucky grandmas','A fortunate grandma that always seems to find more cookies.','Chancemaker');
>>>>>>> 20180919:main.js
		
		order=1200;
		new Game.TieredUpgrade('Your lucky cookie','机会制造者工作效率 <b>翻倍</b>。<q>This is the first cookie you\'ve ever baked. It holds a deep sentimental value and, after all this time, an interesting smell.</q>','Chancemaker',1);
		new Game.TieredUpgrade('"All Bets Are Off" magic coin','机会制造者工作效率 <b>翻倍</b>。<q>A coin that always lands on the other side when flipped. Not heads, not tails, not the edge. The <i>other side</i>.</q>','Chancemaker',2);
		new Game.TieredUpgrade('Winning lottery ticket','机会制造者工作效率 <b>翻倍</b>。<q>What lottery? THE lottery, that\'s what lottery! Only lottery that matters!</q>','Chancemaker',3);
		new Game.TieredUpgrade('Four-leaf clover field','机会制造者工作效率 <b>翻倍</b>。<q>No giant monsters here, just a whole lot of lucky grass.</q>','Chancemaker',4);
		new Game.TieredUpgrade('A recipe book about books','机会制造者工作效率 <b>翻倍</b>。<q>Tip the scales in your favor with 28 creative new ways to cook the books.</q>','Chancemaker',5);
		new Game.TieredUpgrade('Leprechaun village','机会制造者工作效率 <b>翻倍</b>。<q>You\'ve finally become accepted among the local leprechauns, who lend you their mythical luck as a sign of friendship (as well as some rather foul-tasting tea).</q>','Chancemaker',6);
		new Game.TieredUpgrade('Improbability drive','机会制造者工作效率 <b>翻倍</b>。<q>A strange engine that turns statistics on their head. Recommended by the Grandmother\'s Guide to the Bakery.</q>','Chancemaker',7);
		new Game.TieredUpgrade('Antisuperstistronics','机会制造者工作效率 <b>翻倍</b>。<q>An exciting new field of research that makes unlucky things lucky. No mirror unbroken, no ladder unwalked under!</q>','Chancemaker',8);
		
		order=5000;
		Game.SynergyUpgrade('Gemmed talismans','<q>Good-luck charms covered in ancient and excruciatingly rare crystals. A must have for job interviews!</q>','Chancemaker','Mine','synergy1');
		
		order=20000;
		new Game.Upgrade('小猫顾问','你的牛奶越多，你获得的<b>饼干每秒产量越多<q>很高兴能和你一起工作，先生。</q>',900000000000000000000000000000000,Game.GetIcon('Kitten',9));Game.last.kitten=1;Game.MakeTiered(Game.last,9,18);
		
		order=99999;
		var years=Math.floor((Date.now()-new Date(2013,7,8))/(1000*60*60*24*365));
		//only updates on page load
		//may behave strangely on leap years
		Game.NewUpgradeCookie({name:'Birthday cookie',desc:'-',icon:[22,13],power:years,price:99999999999999999999999999999});Game.last.baseDesc='Cookie production multiplier <b>+1%</b> for every year Cookie Clicker has existed (currently : <b>+'+Beautify(years)+'%</b>).<q>Thank you for playing Cookie Clicker!<br>-Orteil</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		
		
		order=150;new Game.Upgrade('阿迈斯里鼠标','点击获得 <b>+1% 总秒收益</b>.<q>这个需要大约53人来推动它，另外48人跳下来按下按钮并触发点击。你可以说它有一些分量。</q>',50000000000000000000000,[11,19]);Game.MakeTiered(Game.last,10,11);
		
		order=200;new Game.TieredUpgrade('反向痴呆症','老奶奶工作效率 <b>翻倍</b>。<q>Extremely unsettling, and somehow even worse than the regular kind.</q>','Grandma',9);
		order=300;new Game.TieredUpgrade('人道杀虫剂','农场工作效率 <b>翻倍</b>。<q>由人民，人民，人民制造，并准备在那些非常值得它的讨厌的昆虫上释放出一些正义的灼热之痛。</q>','Farm',9);
		order=400;new Game.TieredUpgrade('鼹鼠们','矿山工作效率 <b>翻倍</b>。<q>这些坚固的小伙伴们在你的实验室里从真正的人类中设计出来，他们有能力在更昂贵的机器可能无法生存的条件下寻找最美味的地下矿物。</q>','Mine',9);
		order=500;new Game.TieredUpgrade('机器学习','工厂工作效率 <b>翻倍</b>。<q>如果你真的告诉你的工人要学习如何操作机器，你可能会觉得你的生产力可能会提高。 有时，这是小事......</q>','Factory',9);
		order=525;new Game.TieredUpgrade('食用钱','银行工作效率 <b>翻倍</b>。<q>这真的很简单; 你让所有的货币都太美味了，不吃饭，一举解决世界饥饿和通货膨胀！</q>','Bank',9);
		order=550;new Game.TieredUpgrade('生病说唱祈祷','寺庙工作效率 <b>翻倍</b>。<q>随着他们的节拍和激进的押韵，这些嘻嘻哈哈的宗教音乐肯定会让所有认为自己是2个很酷的教堂的年轻人回到座位上并祈祷更多！ 邪恶！</q>','Temple',9);
		order=575;new Game.TieredUpgrade('豪华定制魔杖','精灵塔工作效率 <b>翻倍</b>。<q>在这个科学时代，大多数技术娴熟的魔杖制造者现在已经不复存在了; 但幸运的是 - 并非所有这些游荡都会丢失。</q>','Wizard tower',9);
		order=600;new Game.TieredUpgrade('自动驾驶仪','装船工作效率 <b>翻倍</b>。<q>你的船现在装有完全机器人的船员！ 当你不必赔偿太空中失踪者的家属时，你会节省多少钱。</q>','Shipment',9);
		order=700;new Game.TieredUpgrade('化学的到来','炼金实验室工作效率 <b>翻倍</b>。<q>你知道吗？ 这整个炼金术胡说是没有根据的废话。 亲爱的上帝，你在想什么？</q>','Alchemy lab',9);
		order=800;new Game.TieredUpgrade('真实的世界','传送门工作效率 <b>翻倍</b>。<q>事实证明，我们的宇宙实际上是另一个更理性的现实世界扭曲的维度。是时候跳上去抢那个地方了!</q>','Portal',9);
		order=900;new Game.TieredUpgrade('第二秒','时光机器工作效率 <b>翻倍</b>。<q>这是在相同时间内两倍的时间!什么交易!还有，以上帝的名义!</q>','Time machine',9);
		order=1000;new Game.TieredUpgrade('量子梳','反物质冷凝器工作效率 <b>翻倍</b>。<q>量子纠缠是那些令人讨厌的事情之一，如果没有它我们可能真的会变得更好。 这最终可能归功于量子梳！</q>','Antimatter condenser',9);
		order=1100;new Game.TieredUpgrade('水晶镜子','棱镜工作效率 <b>翻倍</b>。<q>旨在将更多光线过滤回棱镜，达到现实本身从未计划过的亮度水平。</q>','Prism',9);
		order=1200;new Game.TieredUpgrade('小松鼠','机会制造者工作效率 <b>翻倍</b>。<q>你已经用数百只爪子养殖兔子，这使得它们本身非常幸运，因此是一种非常方便（如果非常令人不安）的宠物。</q>','Chancemaker',9);
		
		order=20000;
		new Game.Upgrade('小猫助理区域经理','你的牛奶越多，你获得的<b>饼干每秒产量越多<q>没有什么能强调……除了必须征得我的下级的同意外，先生</q>',900000000000000000000000000000000000,Game.GetIcon('Kitten',10));Game.last.kitten=1;Game.MakeTiered(Game.last,10,18);
		
		order=5000;
<<<<<<< HEAD:main.js
		new Game.SynergyUpgrade('魅力夸克','<q>他们在你的幸运夸克之后！</q>','Chancemaker','Antimatter condenser','synergy2');
=======
		Game.SynergyUpgrade('Charm quarks','<q>They\'re after your lucky quarks!</q>','Chancemaker','Antimatter condenser','synergy2');
>>>>>>> 20180919:main.js
		
		
		order=10020;
		Game.NewUpgradeCookie({name:'粉红色的饼干',desc:'最古老的饼干之一。 传统上，用香槟浸泡软化，因为法国人会利用任何机会喝酒。',icon:[21,16],power:						4,price: 999999999999999999999999999});
		Game.NewUpgradeCookie({name:'全麦饼干',desc:'覆盖在种子和其他朴实的碎片中。 真的想要那个“5秒规则”的样子。',icon:[22,16],power:						4,price: 999999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'糖果饼干',desc:'这些只是在你的手中融化了一点点。',icon:[23,16],power:						4,price: 9999999999999999999999999999});
		Game.NewUpgradeCookie({name:'大曲奇饼',desc:'你对这些芯片的大小感到敬畏。 绝对单位。',icon:[24,16],power:						4,price: 9999999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'一个曲奇饼',desc:'你得到一个。',icon:[25,16],power:						1,price: 99999999999999999999999999999});
		
		
<<<<<<< HEAD:main.js
		new Game.Upgrade('糖烘焙','每个未消耗的糖块（最多100个）产生<b> +1％ 饼干每秒产量</b>。<div class="warning">注意：这意味着花费糖块会降低你的饼干每秒产量，直到它们重新长大。</div><q>要用自己的含糖精华来烘焙，你必须先学会享受甜蜜的时光。</q>',200000000,[21,17]);Game.last.pool='prestige';Game.last.parents=['甜菊糖'];
		new Game.Upgrade('糖分渴求','一旦提升, 你就可以使用 "糖的狂热" 切换 <b>翻倍你的 饼干每秒产量</b> 1小时, 成本是<b>1 糖块</b>.<q>只需一点点就能让这笔交易变得更加美好。</q>',400000000,[22,17]);Game.last.pool='prestige';Game.last.parents=['糖烘焙'];
		new Game.Upgrade('糖老化过程','每个奶奶（最多600个）使糖块更快地成熟<b> 6秒</b>。<q>他们只是最甜蜜的吗？</q>',600000000,[23,17]);Game.last.pool='prestige';Game.last.parents=['糖分渴求','糖尿病患者'];
		
		order=40000;
		new Game.Upgrade('糖的狂热','激活这个将会让你的饼干每秒产量在1小时内 <b>翻倍</b> , 成本是 <b>1 糖块</b>.<br>每次提升只能使用一次.',0,[22,17]);
=======
		new Game.Upgrade('Sugar baking','Each unspent sugar lump (up to 100) gives <b>+1% CpS</b>.<div class="warning">Note : this means that spending sugar lumps will decrease your CpS until they grow back.</div><q>To bake with the sugary essence of eons themselves, you must first learn to take your sweet time.</q>',200000000,[21,17]);Game.last.pool='prestige';Game.last.parents=['Stevia Caelestis'];
		new Game.Upgrade('Sugar craving','Once an ascension, you may use the "Sugar frenzy" switch to <b>triple your CpS</b> for 1 hour, at the cost of <b>1 sugar lump</b>.<q>Just a little kick to sweeten the deal.</q>',400000000,[22,17]);Game.last.pool='prestige';Game.last.parents=['Sugar baking'];
		new Game.Upgrade('Sugar aging process','Each grandma (up to 600) makes sugar lumps ripen <b>6 seconds</b> sooner.<q>Aren\'t they just the sweetest?</q>',600000000,[23,17]);Game.last.pool='prestige';Game.last.parents=['Sugar craving','Diabetica Daemonicus'];
		
		order=40050;
		new Game.Upgrade('Sugar frenzy','Activating this will <b>triple your CpS</b> for 1 hour, at the cost of <b>1 sugar lump</b>.<br>May only be used once per ascension.',0,[22,17]);
>>>>>>> 20180919:main.js
		Game.last.pool='toggle';Game.last.toggleInto=0;
		Game.last.canBuyFunc=function(){return Game.lumps>=1;};
		Game.last.clickFunction=Game.spendLump(1,'activate the sugar frenzy',function()
		{
<<<<<<< HEAD:main.js
			Game.Upgrades['糖的狂热'].buy(1);
			buff=Game.gainBuff('糖的狂热',60*60,2);
			if (Game.prefs.popups) Game.Popup('糖的狂热 已激活!');
			else Game.Notify('糖的狂热!','饼干每秒产量在1小时内翻倍!',[29,14]);
=======
			Game.Upgrades['Sugar frenzy'].buy(1);
			buff=Game.gainBuff('sugar frenzy',60*60,3);
			if (Game.prefs.popups) Game.Popup('Sugar frenzy activated!');
			else Game.Notify('Sugar frenzy!','CpS x3 for 1 hour!',[29,14]);
>>>>>>> 20180919:main.js
		});
		
		order=10020;
		Game.NewUpgradeCookie({name:'Sprinkles cookies',desc:'A bit of festive decorating helps hide the fact that this might be one of the blandest cookies you\'ve ever tasted.',icon:[21,14],power:						4,price: 99999999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Peanut butter blossoms',desc:'Topped with a scrumptious chocolate squirt, which is something we really wish we didn\'t just write.',icon:[22,14],power:						4,price: 999999999999999999999999999999});
		Game.NewUpgradeCookie({name:'No-bake cookies',desc:'You have no idea how these mysterious oven-less treats came to be or how they hold their shape. You\'re thinking either elephant glue or cold fusion.',icon:[21,15],power:						4,price: 999999999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Florentines',desc:'These make up for being the fruitcake of cookies by at least having the decency to feature chocolate.',icon:[26,16],power:						4,price: 9999999999999999999999999999999});
		Game.NewUpgradeCookie({name:'Chocolate crinkles',desc:'Non-denominational cookies to celebrate year-round deliciousness, and certainly not Christmas or some other nonsense.',icon:[22,15],power:						4,price: 9999999999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Maple cookies',desc:'Made with syrup from a land where milk comes in bags, instead of spontaneously pooling at the bottom of your screen depending on your achievements.',icon:[21,13],power:						4,price: 99999999999999999999999999999999});
		
		
		order=40000;
		new Game.Upgrade('涡轮增压土壤','花园植物每秒都在生长。<br>花园种子可以自由种植。<br>您可以随时切换土壤。<q>它有电解质！</q>',7,[2,16]);//debug purposes only
		Game.last.buyFunction=function(){if (Game.Objects['Farm'].minigameLoaded){Game.Objects['Farm'].minigame.computeStepT();}}
		Game.last.pool='debug';
		
		order=150;
		new Game.Upgrade('高科技鼠标','点击获得 <b>+1% 饼干秒生产量</b>.<q>高级鼠标，设计精巧。 其中只有一件事：点击。</q>',5000000000000000000000000,[11,28]);Game.MakeTiered(Game.last,11,11);
		new Game.Upgrade('Plasmarble mouse','点击获得 <b>+1% 饼干秒生产量</b>.<q>A shifting blur in the corner of your eye, this mouse can trigger a flurry of clicks when grazed by even the slightest breeze.</q>',500000000000000000000000000,[11,30]);Game.MakeTiered(Game.last,12,11);
		
		order=20000;
		new Game.Upgrade('小猫市场商人','你的牛奶越多，你获得的<b>饼干每秒产量越多<q>no such thing as a saturated markit, sir</q>',900000000000000000000000000000000000000,Game.GetIcon('Kitten',11));Game.last.kitten=1;Game.MakeTiered(Game.last,11,18);
		
		order=10030;
		Game.NewUpgradeCookie({name:'节日循环',desc:'These garish biscuits are a perfect fit for children\'s birthday parties or the funerals of strange, eccentric billionaires.',icon:[25,17],require:'品牌饼干盒',power:												2,	price:	999999999999999*5});
		
		order=10020;
		Game.NewUpgradeCookie({name:'Persian rice cookies',desc:'Rose water and poppy seeds are the secret ingredients of these small, butter-free cookies.',icon:[28,15],power:						4,price: 99999999999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Norwegian cookies',desc:'A flat butter cookie with a sliver of candied cherry on top. It is said that these illustrate the bleakness of scandinavian existentialism.',icon:[22,20],power:						4,price: 999999999999999999999999999999999});
		Game.NewUpgradeCookie({name:'Crispy rice cookies',desc:'Fun to make at home! Store-bought cookies are obsolete! Topple the system! There\'s marshmallows in these! Destroy capitalism!',icon:[23,20],power:						4,price: 999999999999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Ube cookies',desc:'The tint is obtained by the use of purple yams. According to color symbolism, these cookies are either noble, holy, or supervillains.',icon:[24,17],power:						4,price: 9999999999999999999999999999999999});
		Game.NewUpgradeCookie({name:'Butterscotch cookies',desc:'The butterscotch chips are just the right amount of sticky, and make you feel like you\'re eating candy.',icon:[24,20],power:						4,price: 9999999999999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Speculaas',desc:'These crunchy, almost obnoxiously cinnamony cookies are a source of dutch pride. About the origin of the name, one can only speculate.',icon:[21,20],power:						4,price: 99999999999999999999999999999999999});
		
		order=10200;
		Game.NewUpgradeCookie({name:'Elderwort biscuits',desc:'-',icon:[22,25],power:2,price:60*2,locked:1});Game.last.baseDesc='Cookie production multiplier <b>+2%</b>.<br>Grandma production multiplier <b>+2%</b>.<br>Dropped by elderwort plants.<q>They taste incredibly stale, even when baked fresh.</q>';
		Game.NewUpgradeCookie({name:'Bakeberry cookies',desc:'-',icon:[23,25],power:2,price:60,locked:1});Game.last.baseDesc='Cookie production multiplier <b>+2%</b>.<br>Dropped by bakeberry plants.<q>Really good dipped in hot chocolate.</q>';
		Game.NewUpgradeCookie({name:'Duketater cookies',desc:'-',icon:[24,25],power:10,price:60*3,locked:1});Game.last.baseDesc='Cookie production multiplier <b>+10%</b>.<br>Dropped by duketater plants.<q>Fragrant and mealy, with a slight yellow aftertaste.</q>';
		Game.NewUpgradeCookie({name:'Green yeast digestives',desc:'-',icon:[25,25],power:0,price:60*3,locked:1});Game.last.baseDesc='<b>+1%</b> golden cookie gains and effect duration.<br><b>+1%</b> golden cookie frequency.<br><b>+3%</b> random drops.<br>Dropped by green rot plants.<q>These are tastier than you\'d expect, but not by much.</q>';
		
		order=23000;
		new Game.Upgrade('Fern tea','You gain <b>+3%</b> of your regular 饼干秒生产量 while the game is closed <small>(provided you have the 双重超越之门 heavenly upgrade)</small>.<br>Dropped by drowsyfern plants.<q>A chemically complex natural beverage, this soothing concoction has been used by mathematicians to solve equations in their sleep.</q>',60,[26,25]);
		new Game.Upgrade('Ichor syrup','You gain <b>+7%</b> of your regular CpS while the game is closed <small>(provided you have the 双重超越之门 heavenly upgrade)</small>.<br>Sugar lumps mature <b>7 minutes</b> sooner.<br>Dropped by ichorpuff plants.<q>Tastes like candy. The smell is another story.</q>',60*2,[27,25]);
		
		order=10200;
		Game.NewUpgradeCookie({name:'Wheat slims',desc:'-',icon:[28,25],power:1,price:30,locked:1});Game.last.baseDesc='Cookie production multiplier <b>+1%</b>.<br>Dropped by baker\'s wheat plants.<q>The only reason you\'d consider these cookies is because you feel slightly sorry for them.</q>';
		
		var gardenDrops=['Elderwort biscuits','Bakeberry cookies','Duketater cookies','Green yeast digestives','Fern tea','Ichor syrup','Wheat slims'];
		for (var i in gardenDrops)//scale by CpS
		{
			var it=Game.Upgrades[gardenDrops[i]];
			it.priceFunc=function(cost){return function(){return cost*Game.cookiesPs*60;}}(it.basePrice);
			it.baseDesc=it.baseDesc.replace('<q>','<br>花费饼干秒生产量的比例.<q>');
			it.desc=BeautifyInText(it.baseDesc);
			it.lasting=true;
		}
		
		
		order=10300;
		Game.NewUpgradeCookie({name:'Synthetic chocolate green honey butter biscuit',desc:'Rewarded for owning 350 of everything.<br>The recipe for this butter biscuit was once the sole heritage of an ancient mountain monastery. Its flavor is so refined that only a slab of lab-made chocolate specifically engineered to be completely tasteless could complement it.<br>Also it\'s got your face on it.',icon:[24,26],power:	10,price: 999999999999999999999999999999999999,locked:1});
		Game.NewUpgradeCookie({name:'Royal raspberry chocolate butter biscuit',desc:'Rewarded for owning 400 of everything.<br>Once reserved for the megalomaniac elite, this unique strain of fruity chocolate has a flavor and texture unlike any other. Whether its exorbitant worth is improved or lessened by the presence of your likeness on it still remains to be seen.',icon:[25,26],power:	10,price: 999999999999999999999999999999999999999,locked:1});
		Game.NewUpgradeCookie({name:'Ultra-concentrated high-energy chocolate butter biscuit',desc:'Rewarded for owning 450 of everything.<br>Infused with the power of several hydrogen bombs through a process that left most nuclear engineers and shareholders perplexed. Currently at the center of some rather heated United Nations meetings. Going in more detail about this chocolate would violate several state secrets, but we\'ll just add that someone\'s bust seems to be pictured on it. Perhaps yours?',icon:[26,26],power:	10,price: 999999999999999999999999999999999999999999,locked:1});
		
		
		
		order=200;new Game.TieredUpgrade('Timeproof hair dyes','老奶奶工作效率 <b>翻倍</b>。<q>Why do they always have those strange wispy pink dos? What do they know about candy floss that we don\'t?</q>','Grandma',10);
		order=300;new Game.TieredUpgrade('Barnstars','农场工作效率 <b>翻倍</b>。<q>Ah, yes. These help quite a bit. Somehow.</q>','Farm',10);
		order=400;new Game.TieredUpgrade('Mine canaries','矿山工作效率 <b>翻倍</b>。<q>These aren\'t used for anything freaky! The miners just enjoy having a pet or two down there.</q>','Mine',10);
		order=500;new Game.TieredUpgrade('Brownie point system','工厂工作效率 <b>翻倍</b>。<q>Oh, these are lovely! You can now reward your factory employees for good behavior, such as working overtime or snitching on coworkers. 58 brownie points gets you a little picture of a brownie, and 178 of those pictures gets you an actual brownie piece for you to do with as you please! Infantilizing? Maybe. Oodles of fun? You betcha!</q>','Factory',10);
		order=525;new Game.TieredUpgrade('Grand supercycles','银行工作效率 <b>翻倍</b>。<q>We let the public think these are complicated financial terms when really we\'re just rewarding the bankers with snazzy bicycles for a job well done. It\'s only natural after you built those fancy gold swimming pools for them, where they can take a dip and catch Kondratiev waves.</q>','Bank',10);
		order=550;new Game.TieredUpgrade('Psalm-reading','寺庙工作效率 <b>翻倍</b>。<q>A theologically dubious and possibly blasphemous blend of fortune-telling and scripture studies.</q>','Temple',10);
		order=575;new Game.TieredUpgrade('Immobile spellcasting','精灵塔工作效率 <b>翻倍</b>。<q>Wizards who master this skill can now cast spells without having to hop and skip and gesticulate embarrassingly, which is much sneakier and honestly quite a relief.</q>','Wizard tower',10);
		order=600;new Game.TieredUpgrade('Restaurants at the end of the universe','装船工作效率 <b>翻倍</b>。<q>Since the universe is spatially infinite, and therefore can be construed to have infinite ends, you\'ve opened an infinite chain of restaurants where your space truckers can rest and partake in some home-brand cookie-based meals.</q>','Shipment',10);
		order=700;new Game.TieredUpgrade('On second thought','<q>Disregard that last upgrade, alchemy is where it\'s at! Your eggheads just found a way to transmute children\'s nightmares into rare metals!</q>','Alchemy lab',10);
		order=800;new Game.TieredUpgrade('Dimensional garbage gulper','传送门工作效率 <b>翻倍</b>。<q>So we\'ve been looking for a place to dispose of all the refuse that\'s been accumulating since we started baking - burnt cookies, failed experiments, unruly workers - and well, we figured rather than sell it to poor countries like we\'ve been doing, we could just dump it in some alternate trash dimension where it\'s not gonna bother anybody! Probably!</q>','Portal',10);
		order=900;new Game.TieredUpgrade('Additional clock hands','时光机器工作效率 <b>翻倍</b>。<q>It seemed like a silly idea at first, but it turns out these have the strange ability to twist time in interesting new ways.</q>','Time machine',10);
		order=1000;new Game.TieredUpgrade('Baking Nobel prize','反物质冷凝器工作效率 <b>翻倍</b>。<q>What better way to sponsor scientific growth than to motivate those smarmy nerds with a meaningless award! What\'s more, each prize comes with a fine print lifelong exclusive contract to come work for you (or else)!</q>','Antimatter condenser',10);
		order=1100;new Game.TieredUpgrade('Reverse theory of light','棱镜工作效率 <b>翻倍</b>。<q>A whole new world of physics opens up when you decide that antiphotons are real and posit that light is merely a void in shadow.</q>','Prism',10);
		order=1200;new Game.TieredUpgrade('Revised probabilistics','机会制造者工作效率 <b>翻倍</b>。<q>Either something happens or it doesn\'t. That\'s a 50% chance! This suddenly makes a lot of unlikely things very possible.</q>','Chancemaker',10);
		
		order=20000;
		new Game.Upgrade('小猫分析师','你得到了 <b>更多的饼干秒生产量</b> the more milk you have.<q>based on purrent return-on-investment meowdels we should be able to affurd to pay our empawyees somewhere around next century, sir</q>',900000000000000000000000000000000000000000,Game.GetIcon('Kitten',12));Game.last.kitten=1;Game.MakeTiered(Game.last,12,18);
		
		
		new Game.Upgrade('皱纹的眼睛','Mouse over a wrinkler to see how many cookies are in its stomach.<q>Just a wrinkler and its will to survive.<br>Hangin\' tough, stayin\' hungry.</q>',99999999,[27,26]);Game.last.pool='prestige';Game.last.parents=['皱纹饼干'];
		
		new Game.Upgrade('灵感的清单','解锁 <b>购买所有</b> 功能, 它可以让您立即购买商店中的每个升级（从最便宜的一个开始）。<br>同时解锁<b>保险库</b>，这是一个可以放置您不想自动购买的升级的主要部分。<q>时髦的奶奶配件？检查。 跨维度的可憎之事？检查。 一堆鸡蛋出于某种原因？检查。 机器“ping”？ 检查并检查。</q>',900000,[28,26]);Game.last.pool='prestige';Game.last.parents=['持久的记忆','永久升级槽 IV'];
		
		order=10300;
		Game.NewUpgradeCookie({name:'纯黑色巧克力黄油饼干',desc:'拥有所有建筑各500件的奖励。<br>这种巧克力是如此的纯净无暇，它没有自己的颜色，而是呈现出它周围的一切。你会有点惊讶地发现这尊雕像没有印上你的肖像，因为它的表面非常光滑(对象形仪来说)——直到你意识到它像镜子一样真实地反映了你自己的脸。',icon:[24,27],power:	10,price: 999999999999999999999999999999999999999999999,locked:1});
		
		order=10020;
		Game.NewUpgradeCookie({name:'巧克力燕麦饼干',desc:'这些坏男孩弥补缺乏一个有凝聚力的形式，并通过为只是单纯的美味凹凸不平的，外观造型不美观。 我们都应该渴望的东西。',icon:[23,28],power:						4,price: 99999999999999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'糖蜜饼干',desc:'粘稠，脆裂，撒上细糖。<br>一些疯子已经知道用土豆吃这些。',icon:[24,28],power:						4,price: 999999999999999999999999999999999999});
		Game.NewUpgradeCookie({name:'脆饼',desc:'杏仁和开心果使这些非常结实的饼干吃起来比用它们来吓唬人更有趣。',icon:[22,28],power:						4,price: 999999999999999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'比利时饼干',desc:'这些饼干是否具有令人震惊的华夫饼一样的功能，或者只是普通的饼干大小的华夫饼，这是我们没有讨论的话题。',icon:[21,28],power:						4,price: 9999999999999999999999999999999999999});
		
		
		order=10000;
		//early cookies that unlock at the same time as coconut cookies; meant to boost early game a little bit
		Game.NewUpgradeCookie({name:'杏仁饼干',desc:'有时候你会觉得自己就是其中之一。有时候你不。',icon:[21,27],power:							2,	price:	99999999});
		Game.NewUpgradeCookie({name:'榛子饼干',desc:'尝起来就像早晨漫步在芬芳的森林里，没有了蚊蚋的云彩。',icon:[22,27],power:							2,	price:	99999999});
		Game.NewUpgradeCookie({name:'核桃饼干',desc:'一些专家指出，核桃与人类大脑的怪异相似是其感知的标志 - 这是大多数核桃强烈反对的理论。',icon:[23,27],power:							2,	price:	99999999});
		
		
<<<<<<< HEAD:main.js
		new Game.Upgrade('标签打印机','将鼠标悬停在升级上以查看其弹出层。<br><small>注意：只有一些升级有弹出层。 等级纯粹是装饰性的，对游戏玩法没有影响。</small><q>当你想从番茄酱分辨酱还配备实时得心应手。</q>',9999,[27,7]);Game.last.pool='prestige';Game.last.parents=['启动厨房'];
=======
		new Game.Upgrade('Label printer','Mouse over an upgrade to see its tier.<br><small>Note : only some upgrades have tiers. Tiers are purely cosmetic and have no effect on gameplay.</small><q>Also comes in real handy when you want to tell catsup apart from ketchup.</q>',999999,[28,29]);Game.last.pool='prestige';Game.last.parents=['Starter kitchen'];
>>>>>>> 20180919:main.js
		
		
		
		
		order=200;new Game.TieredUpgrade('礼貌','老奶奶 工作效率 <b>翻倍</b>。<q>Apparently these ladies are much more amiable if you take the time to learn their strange, ancient customs, which seem to involve saying "please" and "thank you" and staring at the sun with bulging eyes while muttering eldritch curses under your breath.</q>','Grandma',11);
		order=300;new Game.TieredUpgrade('Lindworms','农场 工作效率 <b>翻倍</b>。<q>You have to import these from far up north, but they really help areate the soil!</q>','Farm',11);
		order=400;new Game.TieredUpgrade('Bore again','矿山 工作效率 <b>翻倍</b>。<q>After extracting so much sediment for so long, you\'ve formed some veritable mountains of your own from the accumulated piles of rock and dirt. Time to dig through those and see if you find anything fun!</q>','Mine',11);
		order=500;new Game.TieredUpgrade('"Volunteer" interns','工厂 工作效率 <b>翻倍</b>。<q>If you\'re bad at something, always do it for free.</q>','Factory',11);
		order=525;new Game.TieredUpgrade('Rules of acquisition','银行 工作效率 <b>翻倍</b>。<q>Rule 387 : a cookie baked is a cookie kept.</q>','Bank',11);
		order=550;new Game.TieredUpgrade('War of the gods','寺庙 工作效率 <b>翻倍</b>。<q>An interesting game; the only winning move is not to pray.</q>','Temple',11);
		order=575;new Game.TieredUpgrade('Electricity','精灵塔 工作效率 <b>翻倍</b>。<q>Ancient magicks and forbidden hexes shroud this arcane knowledge, whose unfathomable power can mysteriously turn darkness into light and shock an elephant to death.</q>','Wizard tower',11);
		order=600;new Game.TieredUpgrade('Universal alphabet','装船 工作效率 <b>翻倍</b>。<q>You\'ve managed to chart a language that can be understood by any sentient species in the galaxy; its exciting vocabulary contains over 56 trillion words that sound and look like sparkly burps, forming intricate sentences that usually translate to something like "give us your cookies, or else".</q>','Shipment',11);
		order=700;new Game.TieredUpgrade('Public betterment','炼金实验室工作效率 <b>翻倍</b>。<q>Why do we keep trying to change useless matter into cookies, or cookies into even better cookies? Clearly, the way of the future is to change the people who eat the cookies into people with a greater understanding, appreciation and respect for the cookies they\'re eating. Into the vat you go!</q>','Alchemy lab',11);
		order=800;new Game.TieredUpgrade('Embedded microportals','传送门工作效率 <b>翻倍</b>。<q>We\'ve found out that if we bake the portals into the cookies themselves, we can transport people\'s taste buds straight into the taste dimension! Good thing your army of lawyers got rid of the FDA a while ago!</q>','Portal',11);
		order=900;new Game.TieredUpgrade('Nostalgia','时光机器工作效率 <b>翻倍</b>。<q>Your time machine technicians insist that this is some advanced new time travel tech, and not just an existing emotion universal to mankind. Either way, you have to admit that selling people the same old cookies just because it reminds them of the good old times is an interesting prospect.</q>','Time machine',11);
		order=1000;new Game.TieredUpgrade('The definite molecule','反物质冷凝器工作效率 <b>翻倍</b>。<q>Your scientists have found a way to pack a cookie into one single continuous molecule, opening exciting new prospects in both storage and flavor despite the fact that these take up to a whole year to digest.</q>','Antimatter condenser',11);
		order=1100;new Game.TieredUpgrade('光捕获措施','棱镜工作效率 <b>翻倍</b>。<q>由于你将越来越多的光转换成饼干，宇宙变得越来越暗，你已经开始为你的棱镜找到新的和未开发的光源; 例如，孕妇发出的温暖的光芒，或者一个充满希望的孩子眼中闪烁的光芒。</q>','Prism',11);
		order=1200;new Game.TieredUpgrade('0面骰子','机会制造者工作效率 <b>翻倍</b>。<q>The advent of the 0-sided dice has had unexpected and tumultuous effects on the gambling community, and saw experts around the world calling you both a genius and an imbecile.</q>','Chancemaker',11);
		
		
		new Game.Upgrade('Heralds','You now benefit from the boost provided by <b>heralds</b>.<br>Each herald gives you <b>+1% CpS</b>.<br>Look on the purple flag at the top to see how many heralds are active at any given time.<q>Be excellent to each other.<br>And Patreon, dudes!</q>',100,[21,29]);Game.last.pool='prestige';
		
		order=255;
		Game.GrandmaSynergy('Metagrandmas','A fractal grandma to make more grandmas to make more cookies.','Fractal engine');
		
		order=1300;
		new Game.TieredUpgrade('Metabakeries','Fractal engines are <b>twice</b> as efficient.<q>They practically bake themselves!</q>','Fractal engine',1);
		new Game.TieredUpgrade('Mandelbrown sugar','Fractal engines are <b>twice</b> as efficient.<q>A substance that displays useful properties such as fractal sweetness and instant contact lethality.</q>','Fractal engine',2);
		new Game.TieredUpgrade('Fractoids','Fractal engines are <b>twice</b> as efficient.<q>Here\'s a frun fract : all in all, these were a terrible idea.</q>','Fractal engine',3);
		new Game.TieredUpgrade('Nested universe theory','Fractal engines are <b>twice</b> as efficient.<q>Asserts that each subatomic particle is host to a whole new universe, and therefore, another limitless quantity of cookies.<br>This somehow stacks with the theory of nanocosmics, because physics.</q>','Fractal engine',4);
		new Game.TieredUpgrade('Menger sponge cake','Fractal engines are <b>twice</b> as efficient.<q>Frighteningly absorbent thanks to its virtually infinite surface area. Keep it isolated in a dry chamber, never handle it with an open wound, and do not ever let it touch a body of water.</q>','Fractal engine',5);
		new Game.TieredUpgrade('One particularly good-humored cow','Fractal engines are <b>twice</b> as efficient.<q>This unassuming bovine was excruciatingly expensive and it may seem at first like you were ripped off. On closer inspection however, you notice that its earrings (it\'s wearing earrings) are actually fully functional copies of itself, each of which also wearing their own cow earrings, and so on, infinitely. It appears your dairy concerns will be taken care of for a while, although you\'ll have to put up with the cow\'s annoying snickering.</q>','Fractal engine',6);
		new Game.TieredUpgrade('Chocolate ouroboros','Fractal engines are <b>twice</b> as efficient.<q>Forever eating its own tail and digesting itself, in a metabolically dubious tale of delicious tragedy.</q>','Fractal engine',7);
		new Game.TieredUpgrade('Nested','Fractal engines are <b>twice</b> as efficient.<q>Clever self-reference or shameful cross-promotion? This upgrade apparently has the gall to advertise a link to <u>orteil.dashnet.org/nested</u>, in a tooltip you can\'t even click.</q>','Fractal engine',8);
		new Game.TieredUpgrade('Space-filling fibers','Fractal engines are <b>twice</b> as efficient.<q>This special ingredient has the incredible ability to fill the local space perfectly, effectively eradicating hunger in those who consume it!<br>Knowing that no hunger means no need for cookies, your marketers urge you to repurpose this product into next-level packing peanuts.</q>','Fractal engine',9);
		new Game.TieredUpgrade('Endless book of prose','Fractal engines are <b>twice</b> as efficient.','Fractal engine',10);
			Game.last.descFunc=function(){
				var str='"There once was a baker named '+Game.bakeryName+'. One day, there was a knock at the door; '+Game.bakeryName+' opened it and was suddenly face-to-face with a strange and menacing old grandma. The grandma opened her mouth and, in a strange little voice, started reciting this strange little tale : ';
				var n=35;
				var i=Math.floor(Game.T*0.1);
				return this.desc+'<q style="font-family:Courier;">'+(str.substr(i%str.length,n)+(i%str.length>(str.length-n)?str.substr(0,i%str.length-(str.length-n)):''))+'</q>';
			};
		new Game.TieredUpgrade('The set of all sets','Fractal engines are <b>twice</b> as efficient.<q>The answer, of course, is a definite maybe.</q>','Fractal engine',11);
		
		order=5000;
		Game.SynergyUpgrade('Recursive mirrors','<q>Do you have any idea what happens when you point two of these at each other? Apparently, the universe doesn\'t either.</q>','Fractal engine','Prism','synergy1');
		//Game.SynergyUpgrade('Compounded odds','<q>When probabilities start cascading, "never in a billion lifetimes" starts looking terribly like "probably before Monday comes around".</q>','Fractal engine','Chancemaker','synergy1');
		Game.SynergyUpgrade('Mice clicking mice','','Fractal engine','Cursor','synergy2');
		Game.last.descFunc=function(){
			Math.seedrandom(Game.seed+'-blacsphemouse');
			if (Math.random()<0.3) {Math.seedrandom();return this.desc+'<q>Absolutely blasphemouse!</q>';}
			else {Math.seedrandom();return this.desc+'<q>Absolutely blasphemous!</q>';}
		};
		
		
		order=10020;
		Game.NewUpgradeCookie({name:'Custard creams',desc:'British lore pits these in a merciless war against bourbon biscuits.<br>The filling evokes vanilla without quite approaching it.<br>They\'re tastier on the inside!',icon:[23,29],power:						4,price: 9999999999999999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Bourbon biscuits',desc:'Two chocolate biscuits joined together with even more chocolate.<br>The sworn rivals of custard creams, as legend has it.',icon:[24,29],power:						4,price: 99999999999999999999999999999999999999});
		
		
		new Game.Upgrade('Keepsakes','Seasonal random drops have a <b>1/5 chance</b> to carry over through ascensions.<q>Cherish the memories.</q>',1111111111,[22,29]);Game.last.pool='prestige';Game.last.parents=['Starsnow','Starlove','Starterror','Startrade','Starspawn'];
		
		order=10020;
		Game.NewUpgradeCookie({name:'Mini-cookies',desc:'Have you ever noticed how the smaller something is, the easier it is to binge on it?',icon:[29,30],power:						5,price: 99999999999999999999999999999999999999*5});
		
		//todo : effect
		new Game.Upgrade('Sugar crystal cookies','Cookie production multiplier <b>+5% permanently</b>, and <b>+1%</b> for every building type level 10 or higher.<q>Infused with cosmic sweetness. It gives off a faint shimmery sound when you hold it up to your ear.</q>',1000000000,[21,30]);Game.last.pool='prestige';Game.last.parents=['Sugar baking'];Game.last.power=function(){
			var n=5;
			for (var i in Game.Objects)
			{
				if (Game.Objects[i].level>=10) n++;
			}
			return n;
		};Game.last.pseudoCookie=true;
		Game.last.descFunc=function(){
			var n=5;
			for (var i in Game.Objects)
			{
				if (Game.Objects[i].level>=10) n++;
			}
			return '<div style="text-align:center;">Current : <b>+'+Beautify(n)+'%</b><div class="line"></div></div>'+this.desc;
		};
		new Game.Upgrade('Box of maybe cookies','Contains an assortment of...something.<q>These may or may not be considered cookies.</q>',333000000000,[25,29]);Game.last.pool='prestige';Game.last.parents=['Sugar crystal cookies'];
		new Game.Upgrade('Box of not cookies','Contains an assortment of...something.<q>These are strictly, definitely not cookies.</q>',333000000000,[26,29]);Game.last.pool='prestige';Game.last.parents=['Sugar crystal cookies'];
		new Game.Upgrade('Box of pastries','Contains an assortment of delicious pastries.<q>These are a damn slippery slope is what they are!</q>',333000000000,[27,29]);Game.last.pool='prestige';Game.last.parents=['Sugar crystal cookies'];
		
		order=10040;
		Game.NewUpgradeCookie({name:'Profiteroles',desc:'Also known as cream puffs, these pastries are light, fluffy, filled with whipped cream and fun to throw at people when snowballs are running scarce.',icon:[29,29],require:'Box of pastries',		power:4,price: Math.pow(10,31)});
		Game.NewUpgradeCookie({name:'Jelly donut',desc:'Guaranteed to contain at least 0.3% jelly filling, or your money back.<br>You can still see the jelly stab wound!',icon:[27,28],require:'Box of pastries',		power:4,price: Math.pow(10,33)});
		Game.NewUpgradeCookie({name:'Glazed donut',desc:'Absolutely gooey with sugar. The hole is the tastiest part!',icon:[28,28],require:'Box of pastries',		power:4,price: Math.pow(10,35)});
		Game.NewUpgradeCookie({name:'Chocolate cake',desc:'The cake is a Portal reference!',icon:[25,27],require:'Box of pastries',		power:4,price: Math.pow(10,37)});
		Game.NewUpgradeCookie({name:'Strawberry cake',desc:'It\'s not easy to come up with flavor text for something as generic as this, but some would say it\'s a piece of cake.',icon:[26,27],require:'Box of pastries',		power:4,price: Math.pow(10,39)});
		Game.NewUpgradeCookie({name:'Apple pie',desc:'It is said that some grandmas go rogue and bake these instead.',icon:[25,28],require:'Box of pastries',		power:4,price: Math.pow(10,41)});
		Game.NewUpgradeCookie({name:'Lemon meringue pie',desc:'Meringue is a finicky substance made of sugar and egg whites that requires specific atmospheric conditions to be baked at all. The lemon, as far as we can tell, isn\'t nearly as picky.',icon:[26,28],require:'Box of pastries',		power:4,price: Math.pow(10,43)});
		Game.NewUpgradeCookie({name:'Butter croissant',desc:'Look around.<br>A rude man in a striped shirt bikes past you. He smells of cigarettes and caf&eacute;-au-lait. Somewhere, a mime uses his moustache to make fun of the British. 300 pigeons fly overhead.<br>Relax. You\'re experiencing croissant.',icon:[29,28],require:'Box of pastries',		power:4,price: Math.pow(10,45)});
		
		order=10050;
		Game.NewUpgradeCookie({name:'Cookie dough',desc:'Bursting with infinite potential, but can also be eaten as is. Arguably worth the salmonella.',icon:[25,30],require:'Box of maybe cookies',		power:4,price: Math.pow(10,35)});
		Game.NewUpgradeCookie({name:'Burnt cookie',desc:'This cookie flew too close to the sun and is now a shadow of its former self. If only you remembered to set a timer, you wouldn\'t have this tragedy on your hands...',icon:[23,30],require:'Box of maybe cookies',		power:4,price: Math.pow(10,37)});
		Game.NewUpgradeCookie({name:'A chocolate chip cookie but with the chips picked off for some reason',desc:'This has to be the saddest thing you\'ve ever seen.',icon:[24,30],require:'Box of maybe cookies',		power:3,price: Math.pow(10,39)});
		Game.NewUpgradeCookie({name:'Flavor text cookie',desc:'What you\'re currently reading is what gives this cookie its inimitable flavor.',icon:[22,30],require:'Box of maybe cookies',		power:4,price: Math.pow(10,41)});
		Game.NewUpgradeCookie({name:'High-definition cookie',desc:'Uncomfortably detailed, like those weird stories your aunt keeps telling at parties.',icon:[28,10],require:'Box of maybe cookies',		power:5,price: Math.pow(10,43)});
		
		order=10060;
		Game.NewUpgradeCookie({name:'Toast',desc:'A crisp slice of bread, begging for some butter and jam.<br>Why do people keep proposing these at parties?',icon:[27,10],require:'Box of not cookies',		power:4,price: Math.pow(10,34)});
		Game.NewUpgradeCookie({name:'Peanut butter & jelly',desc:'It\'s time.',icon:[29,9],require:'Box of not cookies',		power:4,price: Math.pow(10,36)});
		Game.NewUpgradeCookie({name:'Wookies',desc:'These aren\'t the cookies you\'re looking for.',icon:[26,30],require:'Box of not cookies',		power:4,price: Math.pow(10,38)});
		Game.NewUpgradeCookie({name:'Cheeseburger',desc:'Absolutely no relation to cookies whatsoever - Orteil just wanted an excuse to draw a cheeseburger.',icon:[28,30],require:'Box of not cookies',		power:4,price: Math.pow(10,40)});
		Game.NewUpgradeCookie({name:'One lone chocolate chip',desc:'The start of something beautiful.',icon:[27,30],require:'Box of not cookies',		power:1,price: Math.pow(10,42)});
		
		
		new Game.Upgrade('Genius accounting','Unlocks <b>extra price information</b>.<br>Each displayed cost now specifies how long it\'ll take you to afford it, and how much of your bank it represents.<q>There\'s no accounting for taste, and yet here we are.</q>',2000000,[11,10]);Game.last.pool='prestige';Game.last.parents=['Inspired checklist'];
		
		
		new Game.Upgrade('Shimmering veil','Unlocks the <b>shimmering veil</b>, a switch that passively boosts your CpS by <b>50%</b>.<br>You start with the veil turned on; however, it is very fragile, and clicking the big cookie or any golden cookie or reindeer will turn it off, requiring 24 hours of CpS to turn back on.<q>Less clicking, more idling.</q>',999999999,[9,10]);Game.last.pool='prestige';Game.last.parents=['Distilled essence of redoubled luck'];
		
		order=40005;
		new Game.Upgrade('Shimmering veil [off]','Boosts your cookie production by <b>50%</b> when active.<br>The veil is very fragile and will break if you click the big cookie or any golden cookies or reindeer.<br>Turning the veil back on costs 24 hours of unbuffed CpS.',1000000,[9,10]);
		Game.last.pool='toggle';Game.last.toggleInto='Shimmering veil [on]';
		Game.last.priceFunc=function(){return Game.unbuffedCps*60*60*24;}
		new Game.Upgrade('Shimmering veil [on]','<div style="text-align:center;">Active.</div><div class="line"></div>Boosts your cookie production by <b>50%</b> when active.<br>The veil is very fragile and will break if you click the big cookie or any golden cookies or reindeer.<br>Turning the veil back on costs 24 hours of unbuffed CpS.',0,[9,10]);
		Game.last.pool='toggle';Game.last.toggleInto='Shimmering veil [off]';
		
		Game.loseShimmeringVeil=function()
		{
			if (!Game.Has('Shimmering veil')) return false;
			if (!Game.Has('Shimmering veil [off]') && Game.Has('Shimmering veil [on]')) return false;
			var me=Game.Upgrades['Shimmering veil [on]'];
			me.bought=1;
			//Game.Upgrades[me.toggleInto].bought=false;
			Game.Lock(me.toggleInto);
			Game.Unlock(me.toggleInto);
			Game.Notify('The shimmering veil disappears...','',[9,10]);
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
			PlaySound('snd/spellFail.mp3',0.75);
		}
		
		
		//end of upgrades
		
		Game.seasons={
			'christmas':{name:'圣诞节',start:'圣诞节已经开始了！',over:'圣诞节已经结束。',trigger:'节日饼干'},
			'valentines':{name:'情人节',start:'情人节已经开始了！',over:'情人节已经结束。',trigger:'相思病饼干'},
			'fools':{name:'工作日',start:'工作日已经开始了！',over:'工作日已经结束。',trigger:'傻瓜的饼干'},
			'easter':{name:'复活节',start:'复活节已经开始了！',over:'复活节已经结束。',trigger:'兔子饼干'},
			'halloween':{name:'万圣节',start:'万圣节已经开始了！',over:'万圣节已经结束。',trigger:'鬼魂饼干'}
		};
		
		Game.listTinyOwnedUpgrades=function(arr)
		{
			var str='';
			for (var i=0;i<arr.length;i++)
			{
				if (Game.Has(arr[i]))
				{
					var it=Game.Upgrades[arr[i]];
					str+='<div class="icon" style="vertical-align:middle;display:inline-block;'+(it.icon[2]?'background-image:url('+it.icon[2]+');':'')+'background-position:'+(-it.icon[0]*48)+'px '+(-it.icon[1]*48)+'px;transform:scale(0.5);margin:-16px;"></div>';
				}
			}
			return str;
		}
		
		Game.santaDrops=['Increased merriness','Improved jolliness','A lump of coal','An itchy sweater','Reindeer baking grounds','Weighted sleighs','Ho ho ho-flavored frosting','Season savings','Toy workshop','Naughty list','Santa\'s bottomless bag','Santa\'s helpers','Santa\'s legacy','Santa\'s milk and cookies'];
		
		Game.GetHowManySantaDrops=function()
		{
			var num=0;
			for (var i in Game.santaDrops) {if (Game.Has(Game.santaDrops[i])) num++;}
			return num;
		}
		
		Game.reindeerDrops=['Christmas tree biscuits','Snowflake biscuits','Snowman biscuits','Holly biscuits','Candy cane biscuits','Bell biscuits','Present biscuits'];
		Game.GetHowManyReindeerDrops=function()
		{
			var num=0;
			for (var i in Game.reindeerDrops) {if (Game.Has(Game.reindeerDrops[i])) num++;}
			return num;
		}
		/*for (var i in Game.santaDrops)
		{
			Game.Upgrades[Game.santaDrops[i]].descFunc=function(){return '<div style="text-align:center;">You currently own <b>'+Game.GetHowManySantaDrops()+'/'+Game.santaDrops.length+'</b> of Santa\'s gifts.</div><div class="line"></div>'+this.desc;};
		}*/
		
		Game.seasonDrops=Game.heartDrops.concat(Game.halloweenDrops).concat(Game.easterEggs).concat(Game.santaDrops).concat(Game.reindeerDrops);
		
		Game.saySeasonSwitchUses=function()
		{
			if (Game.seasonUses==0) return 'You haven\'t switched seasons this ascension yet.';
			return 'You\'ve switched seasons <b>'+(Game.seasonUses==1?'once':Game.seasonUses==2?'twice':(Game.seasonUses+' times'))+'</b> this ascension.';
		}
		Game.Upgrades['Festive biscuit'].descFunc=function(){return '<div style="text-align:center;">'+Game.listTinyOwnedUpgrades(Game.santaDrops)+'<br><br>You\'ve found <b>'+Game.GetHowManySantaDrops()+'/'+Game.santaDrops.length+'</b> of Santa\'s gifts.<div class="line"></div>'+Game.listTinyOwnedUpgrades(Game.reindeerDrops)+'<br><br>You\'ve found <b>'+Game.GetHowManyReindeerDrops()+'/'+Game.reindeerDrops.length+'</b> reindeer cookies.<div class="line"></div>'+Game.saySeasonSwitchUses()+'<div class="line"></div></div>'+this.desc;};
		Game.Upgrades['Bunny biscuit'].descFunc=function(){return '<div style="text-align:center;">'+Game.listTinyOwnedUpgrades(Game.easterEggs)+'<br><br>You\'ve found <b>'+Game.GetHowManyEggs()+'/'+Game.easterEggs.length+'</b> eggs.<div class="line"></div>'+Game.saySeasonSwitchUses()+'<div class="line"></div></div>'+this.desc;};
		Game.Upgrades['Ghostly biscuit'].descFunc=function(){return '<div style="text-align:center;">'+Game.listTinyOwnedUpgrades(Game.halloweenDrops)+'<br><br>You\'ve found <b>'+Game.GetHowManyHalloweenDrops()+'/'+Game.halloweenDrops.length+'</b> halloween cookies.<div class="line"></div>'+Game.saySeasonSwitchUses()+'<div class="line"></div></div>'+this.desc;};
		Game.Upgrades['Lovesick biscuit'].descFunc=function(){return '<div style="text-align:center;">'+Game.listTinyOwnedUpgrades(Game.heartDrops)+'<br><br>You\'ve found <b>'+Game.GetHowManyHeartDrops()+'/'+Game.heartDrops.length+'</b> heart biscuits.<div class="line"></div>'+Game.saySeasonSwitchUses()+'<div class="line"></div></div>'+this.desc;};
		Game.Upgrades['Fool\'s biscuit'].descFunc=function(){return '<div style="text-align:center;">'+Game.saySeasonSwitchUses()+'<div class="line"></div></div>'+this.desc;};
		
		Game.computeSeasonPrices=function()
		{
			for (var i in Game.seasons)
			{
				Game.seasons[i].triggerUpgrade.priceFunc=function(){
					var m=1;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('seasons');
						if (godLvl==1) m*=2;
						else if (godLvl==2) m*=1.50;
						else if (godLvl==3) m*=1.25;
					}
					//return Game.seasonTriggerBasePrice*Math.pow(2,Game.seasonUses)*m;
					//return Game.cookiesPs*60*Math.pow(1.5,Game.seasonUses)*m;
					return Game.seasonTriggerBasePrice+Game.unbuffedCps*60*Math.pow(1.5,Game.seasonUses)*m;
				}
			}
		}
		Game.computeSeasons=function()
		{
			for (var i in Game.seasons)
			{
				var me=Game.Upgrades[Game.seasons[i].trigger];
				Game.seasons[i].triggerUpgrade=me;
				me.pool='toggle';
				me.buyFunction=function()
				{
					Game.seasonUses+=1;
					Game.computeSeasonPrices();
					//Game.Lock(this.name);
					for (var i in Game.seasons)
					{
						var me=Game.Upgrades[Game.seasons[i].trigger];
						if (me.name!=this.name) {Game.Lock(me.name);Game.Unlock(me.name);}
					}
					if (Game.season!='' && Game.season!=this.season)
					{
						var str=Game.seasons[Game.season].over+'<div class="line"></div>';
						if (Game.prefs.popups) Game.Popup(str);
						else Game.Notify(str,'',Game.seasons[Game.season].triggerUpgrade.icon,4);
					}
					Game.season=this.season;
					Game.seasonT=Game.getSeasonDuration();
					Game.storeToRefresh=1;
					Game.upgradesToRebuild=1;
					Game.Objects['Grandma'].redraw();
					var str=Game.seasons[this.season].start+'<div class="line"></div>';
					if (Game.prefs.popups) Game.Popup(str);
					else Game.Notify(str,'',this.icon,4);
				}
				
<<<<<<< HEAD:main.js
				me.displayFuncWhenOwned=function(){return '<div style="text-align:center;">Time remaining :<br><b>'+(Game.Has('永恒的季节')?'forever':Game.sayTime(Game.seasonT,-1))+'</b></div>';}
				me.timerDisplay=function(upgrade){return function(){if (!Game.Upgrades[upgrade.name].bought || Game.Has('永恒的季节')) return -1; else return 1-Game.seasonT/Game.getSeasonDuration();}}(me);
=======
				me.clickFunction=function(me){return function()
				{
					//undo season
					if (me.bought && Game.season && me==Game.seasons[Game.season].triggerUpgrade)
					{
						me.lose();
						var str=Game.seasons[Game.season].over;
						if (Game.prefs.popups) Game.Popup(str);
						else Game.Notify(str,'',Game.seasons[Game.season].triggerUpgrade.icon);
						if (Game.Has('Season switcher')) {Game.Unlock(Game.seasons[Game.season].trigger);Game.seasons[Game.season].triggerUpgrade.bought=0;}
						
						Game.upgradesToRebuild=1;
						Game.recalculateGains=1;
						Game.season=Game.baseSeason;
						Game.seasonT=-1;
						PlaySound('snd/tick.mp3');
						return false;
					}
					else return true;
				};}(me);
				
				me.displayFuncWhenOwned=function(){return '<div style="text-align:center;">Time remaining :<br><b>'+(Game.Has('Eternal seasons')?'forever':Game.sayTime(Game.seasonT,-1))+'</b><div style="font-size:80%;">(Click again to cancel season)</div></div>';}
				me.timerDisplay=function(upgrade){return function(){if (!Game.Upgrades[upgrade.name].bought || Game.Has('Eternal seasons')) return -1; else return 1-Game.seasonT/Game.getSeasonDuration();}}(me);
>>>>>>> 20180919:main.js
				
			}
		}
		Game.getSeasonDuration=function(){return Game.fps*60*60*24;}
		Game.computeSeasons();
		
		//alert untiered building upgrades
		for (var i in Game.Upgrades)
		{
			var me=Game.Upgrades[i];
			if (me.order>=200 && me.order<2000 && !me.tier && me.name.indexOf('grandma')==-1 && me.pool!='prestige') console.log(me.name+' 没有层。');
		}
		
		Game.UpgradesByPool=[];
		for (var i in Game.Upgrades)
		{
			if (!Game.UpgradesByPool[Game.Upgrades[i].pool]) Game.UpgradesByPool[Game.Upgrades[i].pool]=[];
			Game.UpgradesByPool[Game.Upgrades[i].pool].push(Game.Upgrades[i]);
		}
		
		Game.PrestigeUpgrades=[];
		for (var i in Game.Upgrades)
		{
			if (Game.Upgrades[i].pool=='prestige' || Game.Upgrades[i].pool=='prestigeDecor')
			{
				Game.PrestigeUpgrades.push(Game.Upgrades[i]);
				Game.Upgrades[i].posX=0;
				Game.Upgrades[i].posY=0;
				if (Game.Upgrades[i].parents.length==0 && Game.Upgrades[i].name!='遗产') Game.Upgrades[i].parents=['遗产'];
				Game.Upgrades[i].parents=Game.Upgrades[i].parents||[-1];
				for (var ii in Game.Upgrades[i].parents) {if (Game.Upgrades[i].parents[ii]!=-1) Game.Upgrades[i].parents[ii]=Game.Upgrades[Game.Upgrades[i].parents[ii]];}
			}
		}
		
		Game.goldenCookieUpgrades=['Get lucky','Lucky day','Serendipity','Heavenly luck','Lasting fortune','Decisive fate','Lucky digit','Lucky number','Lucky payout'];
		
		Game.cookieUpgrades=[];
		for (var i in Game.Upgrades)
		{
			var me=Game.Upgrades[i];
			if ((me.pool=='cookie' || me.pseudoCookie)) Game.cookieUpgrades.push(me);
		}
		for (var i in Game.UnlockAt){Game.Upgrades[Game.UnlockAt[i].name].unlockAt=Game.UnlockAt[i];}
		for (var i in Game.Upgrades){if (Game.Upgrades[i].pool=='prestige') Game.Upgrades[i].order=Game.Upgrades[i].id;}
		
		/*var oldPrestigePrices={"Chimera":5764801,"Synergies Vol. I":2525,"Synergies Vol. II":252525,"Label printer":9999};
		for (var i in oldPrestigePrices){Game.Upgrades[i].basePrice=oldPrestigePrices[i];}*/
		
		Game.UpgradePositions={141:[176,-66],181:[-555,-93],253:[-272,-231],254:[-99,-294],255:[-193,-279],264:[48,123],265:[133,154],266:[223,166],267:[305,137],268:[382,85],269:[-640,42],270:[-607,-246],271:[-728,-120],272:[-688,-201],273:[-711,-33],274:[270,-328],275:[317,-439],276:[333,-556],277:[334,-676],278:[333,-796],279:[328,-922],280:[303,-1040],281:[194,-230],282:[-265,212],283:[-321,297],284:[-322,406],285:[-243,501],286:[-403,501],287:[-314,606],288:[-312,-374],289:[-375,-502],290:[-206,-476],291:[453,-745],292:[-375,-651],293:[-399,-794],323:[-215,32],325:[192,-1127],326:[-328,-158],327:[-192,290],328:[-3,237],329:[92,376],353:[121,-326],354:[77,-436],355:[64,-548],356:[57,-673],357:[52,-793],358:[58,-924],359:[82,-1043],360:[-188,408],362:[158,289],363:[-30,-30],364:[-232,-730],365:[-77,349],368:[-82,-532],393:[196,-714],394:[197,-964],395:[-124,-139],396:[-264,-889],397:[-69,563],408:[-204,-1036],409:[-72,-1152],410:[-70,-1328],411:[-388,137],412:[-470,253],413:[-482,389],449:[-367,-1113],450:[-334,-1214],451:[-278,-1303],495:[-402,-966],496:[200,49],505:[-545,-570],520:[-204,-70],537:[-937,-149],539:[-508,-1270],540:[-629,-1291],541:[-594,-1186],542:[-548,-1374],561:[300,-17],562:[52,646],};
		
		for (var i in Game.UpgradePositions) {Game.UpgradesById[i].posX=Game.UpgradePositions[i][0];Game.UpgradesById[i].posY=Game.UpgradePositions[i][1];}
		
		
		/*=====================================================================================
		ACHIEVEMENTS
		=======================================================================================*/		
		Game.Achievements=[];
		Game.AchievementsById=[];
		Game.AchievementsN=0;
		Game.AchievementsOwned=0;
		Game.Achievement=function(name,desc,icon)
		{
			this.id=Game.AchievementsN;
			this.name=name;
			this.desc=desc;
			this.baseDesc=this.desc;
			this.desc=BeautifyInText(this.baseDesc);
			this.icon=icon;
			this.won=0;
			this.disabled=0;
			this.order=this.id;
			if (order) this.order=order+this.id*0.001;
			this.pool='normal';
			this.vanilla=Game.vanilla;
			this.type='achievement';
			
			this.click=function()
			{
				if (this.clickFunction) this.clickFunction();
			}
			Game.last=this;
			Game.Achievements[this.name]=this;
			Game.AchievementsById[this.id]=this;
			Game.AchievementsN++;
			return this;
		}
		
		Game.Win=function(what)
		{
			if (typeof what==='string')
			{
				if (Game.Achievements[what])
				{
					if (Game.Achievements[what].won==0)
					{
						var name=Game.Achievements[what].shortName?Game.Achievements[what].shortName:Game.Achievements[what].name;
						Game.Achievements[what].won=1;
						if (Game.prefs.popups) Game.Popup('成就解锁 :<br>'+name);
						else Game.Notify('成就解锁','<div class="title" style="font-size:18px;margin-top:-2px;">'+name+'</div>',Game.Achievements[what].icon);
						if (Game.CountsAsAchievementOwned(Game.Achievements[what].pool)) Game.AchievementsOwned++;
						Game.recalculateGains=1;
					}
				}
			}
			else {for (var i in what) {Game.Win(what[i]);}}
		}
		Game.RemoveAchiev=function(what)
		{
			if (Game.Achievements[what])
			{
				if (Game.Achievements[what].won==1)
				{
					Game.Achievements[what].won=0;
					if (Game.CountsAsAchievementOwned(Game.Achievements[what].pool)) Game.AchievementsOwned--;
					Game.recalculateGains=1;
				}
			}
		}
		Game.Achievement.prototype.toggle=function()//cheating only
		{
			if (!this.won)
			{
				Game.Win(this.name);
			}
			else
			{
				Game.RemoveAchiev(this.name);
			}
			if (Game.onMenu=='stats') Game.UpdateMenu();
		}
		
		Game.CountsAsAchievementOwned=function(pool)
		{
			if (pool=='' || pool=='normal') return true; else return false;
		}
		
		Game.HasAchiev=function(what)
		{
			return (Game.Achievements[what]?Game.Achievements[what].won:0);
		}
		
		Game.TieredAchievement=function(name,desc,building,tier)
		{
			var achiev=new Game.Achievement(name,desc,Game.GetIcon(building,tier));
			Game.SetTier(building,tier);
			return achiev;
		}
		
		Game.ProductionAchievement=function(name,building,tier,q,mult)
		{
			var building=Game.Objects[building];
			var icon=[building.iconColumn,22];
			var n=12+building.n+(mult||0);
			if (tier==2) {icon[1]=23;n+=7;}
			else if (tier==3) {icon[1]=24;n+=14;}
			var pow=Math.pow(10,n);
			var achiev=new Game.Achievement(name,'Make <b>'+Beautify(pow)+'</b> cookies just from '+building.plural+'.'+(q?'<q>'+q+'</q>':''),icon);
			building.productionAchievs.push({pow:pow,achiev:achiev});
			return achiev;
		}
		
		Game.thresholdIcons=[0,1,2,3,4,5,6,7,8,9,10,11,18,19,20,21,22,23,24,25,26,27,28,29,21,22,23,24,25,26,27,28,29,30];
		Game.BankAchievements=[];
		Game.BankAchievement=function(name)
		{
			var threshold=Math.pow(10,Math.floor(Game.BankAchievements.length*1.5+2));
			if (Game.BankAchievements.length==0) threshold=1;
			var achiev=new Game.Achievement(name,'烘烤 <b>'+Beautify(threshold)+'</b> 饼干'+(threshold==1?'':'')+' 在一次转生中。',[Game.thresholdIcons[Game.BankAchievements.length],(Game.BankAchievements.length>23?2:5)]);
			achiev.threshold=threshold;
			achiev.order=100+Game.BankAchievements.length*0.01;
			Game.BankAchievements.push(achiev);
			return achiev;
		}
		Game.CpsAchievements=[];
		Game.CpsAchievement=function(name)
		{
			var threshold=Math.pow(10,Math.floor(Game.CpsAchievements.length*1.2));
			//if (Game.CpsAchievements.length==0) threshold=1;
			var achiev=new Game.Achievement(name,'每秒烘烤 <b>'+Beautify(threshold)+'</b> 饼干'+(threshold==1?'':'')+'。',[Game.thresholdIcons[Game.CpsAchievements.length],(Game.CpsAchievements.length>23?2:5)]);
			achiev.threshold=threshold;
			achiev.order=200+Game.CpsAchievements.length*0.01;
			Game.CpsAchievements.push(achiev);
			return achiev;
		}
		
		//define achievements
		//WARNING : do NOT add new achievements in between, this breaks the saves. Add them at the end !
		
		var order=0;//this is used to set the order in which the items are listed
		
		Game.BankAchievement('唤醒和烘烤');
		Game.BankAchievement('做一些面团');
		Game.BankAchievement('现在就烤好了');
		Game.BankAchievement('初出茅庐的面包店');
		Game.BankAchievement('富裕的面包店');
		Game.BankAchievement('世界著名的面包店');
		Game.BankAchievement('宇宙面包店');
		Game.BankAchievement('银河面包店');
		Game.BankAchievement('万能面包店');
		Game.BankAchievement('永恒的面包店');
		Game.BankAchievement('无限的面包店');
		Game.BankAchievement('不朽的面包店');
		Game.BankAchievement('别拦着我');
		Game.BankAchievement('你可以停下来了');
		Game.BankAchievement('一路都是饼干');
		Game.BankAchievement('过量');
		
		Game.CpsAchievement('随意的烘焙');
		Game.CpsAchievement('铁杆烘焙');
		Game.CpsAchievement('稳定的美味的流');
		Game.CpsAchievement('饼干怪兽');
		Game.CpsAchievement('大规模生产');
		Game.CpsAchievement('饼干漩涡');
		Game.CpsAchievement('饼干脉冲星');
		Game.CpsAchievement('饼干类星体');
		Game.CpsAchievement('嘿，你还在这儿');
		Game.CpsAchievement('别再烤了');
		
		order=30010;
		new Game.Achievement('牺牲','转生时有 <b>1 million</b> 烘烤的饼干。<q>来得容易,去得快。</q>',[11,6]);
		new Game.Achievement('遗忘','转生时有 <b>1 billion</b> 烘烤的饼干。<q>从头再来。</q>',[11,6]);
		new Game.Achievement('从头开始','转生时有 <b>1 trillion</b> 烘烤的饼干。<q>这很有趣。</q>',[11,6]);
		
		order=11010;
		new Game.Achievement('永不点击','制作 <b>1 million</b> 饼干,只点击了 <b>15 次。',[12,0]);//Game.last.pool='shadow';
		order=1000;
		new Game.Achievement('可以点击','制作 <b>1,000</b> 饼干通过点击。',[11,0]);
		new Game.Achievement('全能点击','制作 <b>100,000</b> 饼干通过点击。',[11,1]);
		new Game.Achievement('点击奥林匹克','制作 <b>10,000,000</b> 饼干通过点击。',[11,2]);
		new Game.Achievement('点击奥腊马','制作 <b>1,000,000,000</b> 饼干通过点击。',[11,13]);
		
		order=1050;
		new Game.Achievement('单击','拥有 <b>1</b> 游标。',[0,0]);
		new Game.Achievement('双击','拥有 <b>2</b> 游标。',[0,6]);
		new Game.Achievement('鼠标滚轮','拥有 <b>50</b> 游标。',[1,6]);
		new Game.Achievement('鼠标和人','拥有 <b>100</b> 游标。',[0,1]);
		new Game.Achievement('数字','拥有 <b>200</b> 游标。',[0,2]);
		
		order=1100;
<<<<<<< HEAD:main.js
		new Game.Achievement('大错特错','出售1个老奶奶<q>我以为你爱我。</q>',[10,9]);
		new Game.TieredAchievement('奶奶的饼干','拥有 <b>1</b> 老奶奶。','Grandma',1);
		new Game.TieredAchievement('草率的吻','拥有 <b>50</b> 老奶奶。','Grandma',2);
		new Game.TieredAchievement('养老院','拥有 <b>100</b> 老奶奶。','Grandma',3);
		
		order=1200;
		new Game.TieredAchievement('我的第一个农场','拥有 <b>1</b> 农场。','Farm',1);
		new Game.TieredAchievement('收获你所播种','拥有 <b>50</b> 农场。','Farm',2);
		new Game.TieredAchievement('农场生病了','拥有 <b>100</b> 农场。','Farm',3);
		
		order=1400;
		new Game.TieredAchievement('生产链','拥有 <b>1</b> 工厂。','Factory',1);
		new Game.TieredAchievement('工业革命','拥有 <b>50</b> 工厂。','Factory',2);
		new Game.TieredAchievement('全球变暖','拥有 <b>100</b> 工厂。','Factory',3);
		
		order=1300;
		new Game.TieredAchievement('你知道钻','拥有 <b>1</b> 矿山。','Mine',1);
		new Game.TieredAchievement('挖掘现场','拥有 <b>50</b> 矿山。','Mine',2);
		new Game.TieredAchievement('空心地球','拥有 <b>100</b> 矿山。','Mine',3);
		
		order=1500;
		new Game.TieredAchievement('探险','拥有 <b>1</b> 装船。','Shipment',1);
		new Game.TieredAchievement('银河高速公路','拥有 <b>50</b> 装船。','Shipment',2);
		new Game.TieredAchievement('遥远的远方','拥有 <b>100</b> 装船。','Shipment',3);
		
		order=1600;
		new Game.TieredAchievement('转化','拥有 <b>1</b> 炼金术实验室。','Alchemy lab',1);
		new Game.TieredAchievement('变形','拥有 <b>50</b> 炼金术实验室。','Alchemy lab',2);
		new Game.TieredAchievement('黄金会员','拥有 <b>100</b> 炼金术实验室。','Alchemy lab',3);
		
		order=1700;
		new Game.TieredAchievement('一个全新的世界','拥有 <b>1</b> 传送门。','Portal',1);
		new Game.TieredAchievement('现在你在思考了','拥有 <b>50</b> 传送门。','Portal',2);
		new Game.TieredAchievement('空间移位','拥有 <b>100</b> 传送门。','Portal',3);
		
		order=1800;
		new Game.TieredAchievement('时间隧道','拥有 <b>1</b> 时光机器。','Time machine',1);
		new Game.TieredAchievement('交替时间线','拥有 <b>50</b> 时光机器。','Time machine',2);
		new Game.TieredAchievement('改写历史','拥有 <b>100</b> 时光机器。','Time machine',3);
=======
		new Game.Achievement('Just wrong','Sell a grandma.<q>I thought you loved me.</q>',[10,9]);
		Game.TieredAchievement('Grandma\'s cookies','Have <b>1</b> grandma.','Grandma',1);
		Game.TieredAchievement('Sloppy kisses','Have <b>50</b> grandmas.','Grandma',2);
		Game.TieredAchievement('Retirement home','Have <b>100</b> grandmas.','Grandma',3);
		
		order=1200;
		Game.TieredAchievement('My first farm','Have <b>1</b> farm.','Farm',1);
		Game.TieredAchievement('Reap what you sow','Have <b>50</b> farms.','Farm',2);
		Game.TieredAchievement('Farm ill','Have <b>100</b> farms.','Farm',3);
		
		order=1400;
		Game.TieredAchievement('Production chain','Have <b>1</b> factory.','Factory',1);
		Game.TieredAchievement('Industrial revolution','Have <b>50</b> factories.','Factory',2);
		Game.TieredAchievement('Global warming','Have <b>100</b> factories.','Factory',3);
		
		order=1300;
		Game.TieredAchievement('You know the drill','Have <b>1</b> mine.','Mine',1);
		Game.TieredAchievement('Excavation site','Have <b>50</b> mines.','Mine',2);
		Game.TieredAchievement('Hollow the planet','Have <b>100</b> mines.','Mine',3);
		
		order=1500;
		Game.TieredAchievement('Expedition','Have <b>1</b> shipment.','Shipment',1);
		Game.TieredAchievement('Galactic highway','Have <b>50</b> shipments.','Shipment',2);
		Game.TieredAchievement('Far far away','Have <b>100</b> shipments.','Shipment',3);
		
		order=1600;
		Game.TieredAchievement('Transmutation','Have <b>1</b> alchemy lab.','Alchemy lab',1);
		Game.TieredAchievement('Transmogrification','Have <b>50</b> alchemy labs.','Alchemy lab',2);
		Game.TieredAchievement('Gold member','Have <b>100</b> alchemy labs.','Alchemy lab',3);
		
		order=1700;
		Game.TieredAchievement('A whole new world','Have <b>1</b> portal.','Portal',1);
		Game.TieredAchievement('Now you\'re thinking','Have <b>50</b> portals.','Portal',2);
		Game.TieredAchievement('Dimensional shift','Have <b>100</b> portals.','Portal',3);
		
		order=1800;
		Game.TieredAchievement('Time warp','Have <b>1</b> time machine.','Time machine',1);
		Game.TieredAchievement('Alternate timeline','Have <b>50</b> time machines.','Time machine',2);
		Game.TieredAchievement('Rewriting history','Have <b>100</b> time machines.','Time machine',3);
>>>>>>> 20180919:main.js
		
		
		order=7000;
		new Game.Achievement('其中的一切','拥有 <b>至少一个</b> 每一种建筑',[2,7]);
		new Game.Achievement('数学家','拥有至少 <b>1个是最贵的建筑，2个第二贵的建筑，3个第三贵的建筑</b> 以此类推（上限为128）。',[23,12]);
		new Game.Achievement('基数10','拥有至少 <b>10 件最贵的物品，第二昂贵的20件，第三贵的30件</b> 以此类推。',[23,12]);
		
		order=10000;
		new Game.Achievement('黄金饼干','点击1个 <b>黄金饼干</b>。',[10,14]);
		new Game.Achievement('幸运饼干','点击 <b>7个黄金饼干</b>.',[22,6]);
		new Game.Achievement('好运气','点击 <b>27个黄金饼干</b>.',[23,6]);
		
		order=30200;
		new Game.Achievement('被骗的饼干味道很糟糕','侵入一些饼干',[10,6]);Game.last.pool='shadow';
		order=11010;
		new Game.Achievement('神奇遥控器','点击真的非常快。<q>好吧，我会的!</q>',[12,0]);
		
		order=5000;
		new Game.Achievement('建设者','拥有 <b>100</b> 建筑。',[2,6]);
		new Game.Achievement('建筑师','拥有 <b>500</b> 建筑。',[3,6]);
		order=6000;
		new Game.Achievement('增强剂','购买 <b>20</b> 升级。',[9,0]);
		new Game.Achievement('增益剂','购买 <b>50</b> 升级。',[9,1]);
		
		order=11000;
		new Game.Achievement('饼干灌篮高手','扣篮成功。<q>你做到了!</q>',[1,8]);
		
		order=10000;
		new Game.Achievement('幸运','点击 <b>77黄金饼干</b>.<q>你真的应该去睡觉了。</q>',[24,6]);
		order=31000;
		new Game.Achievement('真正的永不点击','制作 <b>1 million</b> 饼干 <b>不去</b> 点击饼干。<q>这有点违背了初衷，不是吗?</q>',[12,0]);Game.last.pool='shadow';
		
		order=20000;
		new Game.Achievement('老年小睡','至少要安抚老奶奶 <b>1次</b>。<q>我们<br>是<br>永恒的</q>',[8,9]);
		new Game.Achievement('老年沉睡','至少要安抚老奶奶 <b>5次</b>。<q>我们的思想<br>胜过<br>宇宙</q>',[8,9]);
		
		order=1150;
		new Game.Achievement('老年人','拥有至少 <b>7</b> 老奶奶的类型.',[10,9]);
		
		order=20000;
		new Game.Achievement('平静的老人','与祖母宣告立约。<q>我们<br>有<br>美联储</q>',[8,9]);
		
		order=5000;
		new Game.Achievement('工程师','拥有 <b>1000</b> 建筑.',[4,6]);
		
		order=10000;
		new Game.Achievement('妖精','点击 <b>777 黄金饼干</b>.',[25,6]);
		new Game.Achievement('黑猫的爪子','点击 <b>7777 黄金饼干</b>.',[26,6]);
		
		order=30050;
		new Game.Achievement('虚无主义','转生时有 <b>1 quadrillion</b> 烘烤的饼干。<q>有很多东西<br>都需要擦除</q>',[11,7]);
		
		order=1900;
<<<<<<< HEAD:main.js
		new Game.TieredAchievement('防糊剂','拥有 <b>1</b> 反物质冷凝器。','Antimatter condenser',1);
		new Game.TieredAchievement('古怪夸克','拥有 <b>50</b> 反物质冷凝器。','Antimatter condenser',2);
		new Game.TieredAchievement('这很重要!','拥有 <b>100</b> 反物质冷凝器。','Antimatter condenser',3);
=======
		Game.TieredAchievement('Antibatter','Have <b>1</b> antimatter condenser.','Antimatter condenser',1);
		Game.TieredAchievement('Quirky quarks','Have <b>50</b> antimatter condensers.','Antimatter condenser',2);
		Game.TieredAchievement('It does matter!','Have <b>100</b> antimatter condensers.','Antimatter condenser',3);
>>>>>>> 20180919:main.js
		
		order=6000;
		new Game.Achievement('升级程序','购买 <b>100</b> 项升级。',[9,2]);
		
		order=7000;
		new Game.Achievement('一百周年纪念','至少有 <b>100 个全部建筑</b>.',[6,6]);
		
		order=30500;
		new Game.Achievement('核心','达到 <b>1 billion</b> 饼干烘焙而 <b>未购买升级</b>.',[12,6]);//Game.last.pool='shadow';
		
		order=30600;
		new Game.Achievement('快速烘焙 I','达到 <b>1 million</b> 饼干烘焙在 <b>35 分钟内</b>.',[12,5]);Game.last.pool='shadow';
		new Game.Achievement('快速烘焙 II','达到 <b>1 million</b> 饼干烘焙在 <b>25 分钟内</b>.',[13,5]);Game.last.pool='shadow';
		new Game.Achievement('快速烘焙 III','达到 <b>1 million</b> 饼干烘焙在 <b>15 分钟内</b>.',[14,5]);Game.last.pool='shadow';
		
		
		order=61000;
		var achiev=new Game.Achievement('即使有烤箱','击败 <b>感应炉</b> 在工厂的地牢。',[12,7]);Game.last.pool='dungeon';
		var achiev=new Game.Achievement('这真是太棒了','击败 <b>提升烘干仓</b> 在工厂的地牢。',[12,7]);Game.last.pool='dungeon';
		var achiev=new Game.Achievement('发出叫声','找到并击败 <b>活泼的</b>, 功能障碍报警机器人。',[13,7]);Game.last.pool='dungeon';
		var achiev=new Game.Achievement('跟着白兔','寻找并击败那些难以捉摸的 <b>糖兔子</b>.',[14,7]);Game.last.pool='dungeon';
		
		order=1000;
		new Game.Achievement('点击狂魔','通过点击获取 <b>100,000,000,000</b> 饼干。',[11,14]);
		
		order=1100;
<<<<<<< HEAD:main.js
		new Game.TieredAchievement('老人的朋友','拥有 <b>150</b> 老奶奶.','Grandma',4);
		new Game.TieredAchievement('老人的统治者','拥有 <b>200</b> 老奶奶.','Grandma',5);
=======
		Game.TieredAchievement('Friend of the ancients','Have <b>150</b> grandmas.','Grandma',4);
		Game.TieredAchievement('Ruler of the ancients','Have <b>200</b> grandmas.','Grandma',5);
>>>>>>> 20180919:main.js
		
		order=32000;
		new Game.Achievement('健康','解锁 <b>100%</b> 你的天赋芯片的力量.',[15,7]);
		
		order=33000;
		new Game.Achievement('非常幸运','你每秒有 <b>50万分之一</b> 的机会获得这个成就。',[15,6]);Game.last.pool='shadow';
		
		order=21000;
		new Game.Achievement('瘙痒不求人','爆裂 <b>1 皱纹</b>.',[19,8]);
		new Game.Achievement('皱纹的问题','爆裂 <b>50 皱纹</b>.',[19,8]);
		new Game.Achievement('湿气爆炸','爆裂 <b>200 皱纹</b>.',[19,8]);
		
		order=22000;
		new Game.Achievement('幽灵饼干','解锁 <b>每个万圣节主题的饼干</b>.<br>拥有这个成就使万圣节主题饼干在未来的游戏中更频繁地降临。',[12,8]);
		
		order=22100;
		new Game.Achievement('来到城镇','达到 <b>圣诞老人的第七张表</b>.',[18,9]);
		new Game.Achievement('所有的圣诞老人都欢呼','达到 <b>圣诞老人的最终形式</b>.',[19,10]);
		new Game.Achievement('让它下雪','解锁 <b>每一个以圣诞为主题的饼干</b>.<br>拥有这一成就，圣诞主题的饼干在未来的游戏中会更频繁地掉落。',[19,9]);
		new Game.Achievement('哦，鹿','点击 <b>1 驯鹿</b>.',[12,9]);
		new Game.Achievement('戏法','点击 <b>50 驯鹿</b>.',[12,9]);
		new Game.Achievement('驯鹿长辈','点击 <b>200 驯鹿</b>.',[12,9]);

		order=1200;
<<<<<<< HEAD:main.js
		new Game.TieredAchievement('完善农业','拥有 <b>150</b> 农场。','Farm',4);
		order=1400;
		new Game.TieredAchievement('终极自动化','拥有 <b>150</b> 工厂。','Factory',4);
		order=1300;
		new Game.TieredAchievement('你能把它挖出来吗?','拥有 <b>150</b> 矿山。','Mine',4);
		order=1500;
		new Game.TieredAchievement('第二类文明','拥有 <b>150</b> 装船。','Shipment',4);
		order=1600;
		new Game.TieredAchievement('镀金的战争','拥有 <b>150</b> 炼金术实验室。','Alchemy lab',4);
		order=1700;
		new Game.TieredAchievement('大脑分裂','拥有 <b>150</b> 传送门。','Portal',4);
		order=1800;
		new Game.TieredAchievement('时间公爵','拥有 <b>150</b> 时光机器。','Time machine',4);
		order=1900;
		new Game.TieredAchievement('分子大师','拥有 <b>150</b> 反物质冷凝器。','Antimatter condenser',4);
		
		order=2000;
		new Game.TieredAchievement('孤独的光子','拥有 <b>1</b> 棱镜。','Prism',1);
		new Game.TieredAchievement('耀眼的微光','拥有 <b>50</b> 棱镜。','Prism',2);
		new Game.TieredAchievement('眩目的闪光','拥有 <b>100</b> 棱镜。','Prism',3);
		new Game.TieredAchievement('永恒的光芒','拥有 <b>150</b> 棱镜。','Prism',4);
=======
		Game.TieredAchievement('Perfected agriculture','Have <b>150</b> farms.','Farm',4);
		order=1400;
		Game.TieredAchievement('Ultimate automation','Have <b>150</b> factories.','Factory',4);
		order=1300;
		Game.TieredAchievement('Can you dig it','Have <b>150</b> mines.','Mine',4);
		order=1500;
		Game.TieredAchievement('Type II civilization','Have <b>150</b> shipments.','Shipment',4);
		order=1600;
		Game.TieredAchievement('Gild wars','Have <b>150</b> alchemy labs.','Alchemy lab',4);
		order=1700;
		Game.TieredAchievement('Brain-split','Have <b>150</b> portals.','Portal',4);
		order=1800;
		Game.TieredAchievement('Time duke','Have <b>150</b> time machines.','Time machine',4);
		order=1900;
		Game.TieredAchievement('Molecular maestro','Have <b>150</b> antimatter condensers.','Antimatter condenser',4);
		
		order=2000;
		Game.TieredAchievement('Lone photon','Have <b>1</b> prism.','Prism',1);
		Game.TieredAchievement('Dazzling glimmer','Have <b>50</b> prisms.','Prism',2);
		Game.TieredAchievement('Blinding flash','Have <b>100</b> prisms.','Prism',3);
		Game.TieredAchievement('Unending glow','Have <b>150</b> prisms.','Prism',4);
>>>>>>> 20180919:main.js
		
		order=5000;
		new Game.Achievement('建筑之王','拥有<b>2000</b> 建筑。<q>他看见广阔的平原在他前面伸展，他说:“让文明来吧。”</q>',[5,6]);
		order=6000;
		new Game.Achievement('进步之王','购买 <b>200</b> 升级。<q>一个人总能做得更好。但你是否应该?</q>',[9,14]);
		order=7002;
		new Game.Achievement('周年纪念','至少有 <b>200 所有建筑</b>.<q>你这个疯子。</q>',[8,6]);
		
		order=22300;
		new Game.Achievement('可爱的饼干','解锁 <b>每个情人节主题的饼干</b>.',[20,3]);
		
		order=7001;
		new Game.Achievement('150周年纪念','至少有 <b>150 所有建筑</b>。',[7,6]);
		
		order=11000;
		new Game.Achievement('小饼干','点击小饼干。<q>这些不是饼干<br>你在点击的。</q>',[0,5]);
		
		order=400000;
		new Game.Achievement('你赢了一个饼干','这是为了烘培10万亿个小甜饼，并在当地新闻上发表。<q>我们都为你感到骄傲。</q>',[10,0]);
		
		order=1070;
<<<<<<< HEAD:main.js
		new Game.Achievement('点击委托','制作 <b>10,000,000,000,000,000,000</b> 饼干通过游标。',[0,22]);
		order=1120;
		new Game.Achievement('滔滔不绝','制作 <b>10,000,000,000,000,000,000</b> 饼干通过老奶奶。',[1,22]);
		order=1220;
		new Game.Achievement('我讨厌肥料','制作 <b>10,000,000,000,000</b> 饼干通过农场。',[2,22]);
		order=1320;
		new Game.Achievement('千万别挖','制作 <b>100,000,000,000,000</b> 饼干通过矿山。',[3,22]);
		order=1420;
		new Game.Achievement('神奇的机器','制作 <b>1,000,000,000,000,000</b> 饼干通过工厂。',[4,22]);
		order=1520;
		new Game.Achievement('超越','制作 <b>10,000,000,000,000,000,000</b> 饼干通过装船。',[5,22]);
		order=1620;
		new Game.Achievement('代表作','制作 <b>100,000,000,000,000,000,000</b> 饼干通过炼金术实验室。',[6,22]);
		order=1720;
		new Game.Achievement('奇怪地','制作 <b>1,000,000,000,000,000,000,000</b> 饼干通过传送门。',[7,22]);
		order=1820;
		new Game.Achievement('时空拼图','制作 <b>10,000,000,000,000,000,000,000</b> 饼干通过时光机器。',[8,22]);
		order=1920;
		new Game.Achievement('超大质量','制作 <b>100,000,000,000,000,000,000,000</b> 饼干通过反物质冷凝器。',[13,22]);
		order=2020;
		new Game.Achievement('赞美太阳','制作 <b>1,000,000,000,000,000,000,000,000</b> 饼干通过棱镜。',[14,22]);
=======
		Game.ProductionAchievement('Click delegator','Cursor',1,0,7);
		order=1120;
		Game.ProductionAchievement('Gushing grannies','Grandma',1,0,6);
		order=1220;
		Game.ProductionAchievement('I hate manure','Farm',1);
		order=1320;
		Game.ProductionAchievement('Never dig down','Mine',1);
		order=1420;
		Game.ProductionAchievement('The incredible machine','Factory',1);
		order=1520;
		Game.ProductionAchievement('And beyond','Shipment',1);
		order=1620;
		Game.ProductionAchievement('Magnum Opus','Alchemy lab',1);
		order=1720;
		Game.ProductionAchievement('With strange eons','Portal',1);
		order=1820;
		Game.ProductionAchievement('Spacetime jigamaroo','Time machine',1);
		order=1920;
		Game.ProductionAchievement('Supermassive','Antimatter condenser',1);
		order=2020;
		Game.ProductionAchievement('Praise the sun','Prism',1);
>>>>>>> 20180919:main.js
		
		
		order=1000;
		new Game.Achievement('点击时代','制作 <b>10,000,000,000,000</b> 饼干通过点击。',[11,15]);
		new Game.Achievement('单击中心','制作 <b>1,000,000,000,000,000</b> 饼干通过点击。',[11,16]);
		
		order=1050;
<<<<<<< HEAD:main.js
		new Game.Achievement('极端多指','拥有 <b>300</b> 游标。',[0,13]);
		new Game.Achievement('T博士','拥有 <b>400</b> 游标。',[0,14]);
		
		order=1100;new Game.TieredAchievement('反正老奶奶从不烦我','拥有 <b>250</b> 老奶奶。','Grandma',6);
		order=1200;new Game.TieredAchievement('国产','拥有 <b>200</b> 农场。','Farm',5);
		order=1400;new Game.TieredAchievement('技术统治论','拥有 <b>200</b> 工厂。','Factory',5);
		order=1300;new Game.TieredAchievement('地球的中心','拥有 <b>200</b> 矿山。','Mine',5);
		order=1500;new Game.TieredAchievement('我们为和平而来','拥有 <b>200</b> 装船。','Shipment',5);
		order=1600;new Game.TieredAchievement('宇宙的秘密','拥有 <b>200</b> 炼金术实验室。','Alchemy lab',5);
		order=1700;new Game.TieredAchievement('疯狂的上帝的王国','拥有 <b>200</b> 传送门。','Portal',5);
		order=1800;new Game.TieredAchievement('永永远远','拥有 <b>200</b> 时光机器。','Time machine',5);
		order=1900;new Game.TieredAchievement('走普朗克','拥有 <b>200</b> 反物质冷凝器。','Antimatter condenser',5);
		order=2000;new Game.TieredAchievement('升起，闪耀','拥有 <b>200</b> 棱镜。','Prism',5);
=======
		new Game.Achievement('Extreme polydactyly','Have <b>300</b> cursors.',[0,13]);
		new Game.Achievement('Dr. T','Have <b>400</b> cursors.',[0,14]);
		
		order=1100;Game.TieredAchievement('The old never bothered me anyway','Have <b>250</b> grandmas.','Grandma',6);
		order=1200;Game.TieredAchievement('Homegrown','Have <b>200</b> farms.','Farm',5);
		order=1400;Game.TieredAchievement('Technocracy','Have <b>200</b> factories.','Factory',5);
		order=1300;Game.TieredAchievement('The center of the Earth','Have <b>200</b> mines.','Mine',5);
		order=1500;Game.TieredAchievement('We come in peace','Have <b>200</b> shipments.','Shipment',5);
		order=1600;Game.TieredAchievement('The secrets of the universe','Have <b>200</b> alchemy labs.','Alchemy lab',5);
		order=1700;Game.TieredAchievement('Realm of the Mad God','Have <b>200</b> portals.','Portal',5);
		order=1800;Game.TieredAchievement('Forever and ever','Have <b>200</b> time machines.','Time machine',5);
		order=1900;Game.TieredAchievement('Walk the planck','Have <b>200</b> antimatter condensers.','Antimatter condenser',5);
		order=2000;Game.TieredAchievement('Rise and shine','Have <b>200</b> prisms.','Prism',5);
>>>>>>> 20180919:main.js
		
		order=30200;
		new Game.Achievement('上帝情结','说出你的名字<b>奥泰伊</b>.<div class="warning">注意，篡位者会受到1%的饼干秒产量处罚直到他们重新给自己改名。</div><q>但那不是你，对吗?</q>',[17,5]);Game.last.pool='shadow';
		new Game.Achievement('第三方','使用一个 <b>附加组件</b>.<q>有些人觉得香草是最无聊的味道。</q>',[16,5]);Game.last.pool='shadow';//if you're making a mod, add a Game.Win('第三方') somewhere in there!
		
		order=30050;
		new Game.Achievement('非物质化','转生时有 <b>1 quintillion</b> 烘烤的饼干。<q>您看!<br>...饼干去哪儿了?</q>',[11,7]);
		new Game.Achievement('零零零','转生时有 <b>1 sextillion</b> 烘烤的饼干。<q>总而言之:真的一点也不重要。</q>',[11,7]);
		new Game.Achievement('超越','转生时有 <b>1 septillion</b> 烘烤的饼干。<q>你的饼干现在在更高的平面上。</q>',[11,8]);
		new Game.Achievement('消灭','转生时有 <b>1 octillion</b> 烘烤的饼干。<q>Resistance is futile, albeit entertaining.</q>',[11,8]);
		new Game.Achievement('消极的空白','转生时有 <b>1 nonillion</b> 烘烤的饼干。<q>你现在有那么少的饼干，就像你的饼干数量是负数一样。</q>',[11,8]);
		
		order=22400;
		new Game.Achievement('狩猎开始了','解锁 <b>1 蛋</b>.',[1,12]);
		new Game.Achievement('鸡蛋开始了','解锁 <b>7 蛋</b>.',[4,12]);
		new Game.Achievement('复活节弥撒','解锁 <b>14 蛋</b>.',[7,12]);
		new Game.Achievement('捉迷藏冠军','解锁 <b>所有的蛋</b>。<br>拥有这一成就，在未来的游戏中，鸡蛋会更容易掉落。',[13,12]);
	
		order=11000;
		new Game.Achievement('名字里有什么','给你的面包店起个名字。',[15,9]);
	
	
		order=1425;
<<<<<<< HEAD:main.js
		new Game.TieredAchievement('一大笔钱','拥有 <b>1</b> 银行。','Bank',1);
		new Game.TieredAchievement('符合要求','拥有 <b>50</b> 银行。','Bank',2);
		new Game.TieredAchievement('黑暗中的一笔贷款','拥有 <b>100</b> 银行。','Bank',3);
		new Game.TieredAchievement('贪婪需求','拥有 <b>150</b> 银行。','Bank',4);
		new Game.TieredAchievement('这是经济，笨蛋','拥有 <b>200</b> 银行。','Bank',5);
		order=1450;
		new Game.TieredAchievement('你去神殿的时间','拥有 <b>1</b> 寺庙。','Temple',1);
		new Game.TieredAchievement('阴暗的教派','拥有 <b>50</b> 寺庙。','Temple',2);
		new Game.TieredAchievement('新时代崇拜','拥有 <b>100</b> 寺庙。','Temple',3);
		new Game.TieredAchievement('有组织的宗教','拥有 <b>150</b> 寺庙。','Temple',4);
		new Game.TieredAchievement('狂热','拥有 <b>200</b> 寺庙。','Temple',5);
		order=1475;
		new Game.TieredAchievement('蛊惑','拥有 <b>1</b> 精灵塔。','Wizard tower',1);
		new Game.TieredAchievement('魔法师的学徒','拥有 <b>50</b> 精灵塔。','Wizard tower',2);
		new Game.TieredAchievement('魅力和魔力','拥有 <b>100</b> 精灵塔。','Wizard tower',3);
		new Game.TieredAchievement('诅咒,诅咒','拥有 <b>150</b> 精灵塔。','Wizard tower',4);
		new Game.TieredAchievement('魔幻王国','拥有 <b>200</b> 精灵塔。','Wizard tower',5);
		
		order=1445;
		new Game.Achievement('既得利益','制作 <b>10,000,000,000,000,000</b> 饼干通过银行。',[15,22]);
		order=1470;
		new Game.Achievement('世界新秩序','制作 <b>100,000,000,000,000,000</b> 饼干通过寺庙。',[16,22]);
		order=1495;
		new Game.Achievement('欺骗','制作 <b>1,000,000,000,000,000,000</b> 饼干通过精灵塔。',[17,22]);
		
		
		order=1070;
		new Game.Achievement('手指点击很好','制作 <b>10,000,000,000,000,000,000,000</b> 饼干通过游标。',[0,23]);
		order=1120;
		new Game.Achievement('对宾果的恐慌','制作 <b>10,000,000,000,000,000,000,000</b> 饼干通过老奶奶。',[1,23]);
		order=1220;
		new Game.Achievement('在面团里搅拌','制作 <b>10,000,000,000,000,000</b> 饼干通过农场。',[2,23]);
		order=1320;
		new Game.Achievement('采石场','制作 <b>100,000,000,000,000,000</b> 饼干通过矿山。',[3,23]);
		order=1420;
		new Game.Achievement('是的，我喜欢科技','制作 <b>1,000,000,000,000,000,000</b> 饼干通过工厂。',[4,23]);
		order=1445;
		new Game.Achievement('全部付清','制作 <b>10,000,000,000,000,000,000</b> 饼干通过银行。',[15,23]);
		order=1470;
		new Game.Achievement('古教会的教堂','制作 <b>100,000,000,000,000,000,000</b> 饼干通过寺庙。',[16,23]);
		order=1495;
		new Game.Achievement('兔子太多，帽子不够','制作 <b>1,000,000,000,000,000,000,000</b> 饼干通过精灵塔。',[17,23]);
		order=1520;
		new Game.Achievement('最珍贵的货物','制作 <b>10,000,000,000,000,000,000,000</b> 饼干通过装船。',[5,23]);
		order=1620;
		new Game.Achievement('金色的','制作 <b>100,000,000,000,000,000,000,000</b> 饼干通过炼金术实验室。',[6,23]);
		order=1720;
		new Game.Achievement('更加丑恶','制作 <b>1,000,000,000,000,000,000,000,000</b> 饼干通过传送门。',[7,23]);
		order=1820;
		new Game.Achievement('仁慈，重来','制作 <b>10,000,000,000,000,000,000,000,000</b> 饼干通过时光机器。',[8,23]);
		order=1920;
		new Game.Achievement('极小的','制作 <b>100,000,000,000,000,000,000,000,000</b> 饼干通过反物质冷凝器。',[13,23]);
		order=2020;
		new Game.Achievement('一个更加灿烂的黎明','制作 <b>1,000,000,000,000,000,000,000,000,000</b> 饼干通过棱镜。',[14,23]);
=======
		Game.TieredAchievement('Pretty penny','Have <b>1</b> bank.','Bank',1);
		Game.TieredAchievement('Fit the bill','Have <b>50</b> banks.','Bank',2);
		Game.TieredAchievement('A loan in the dark','Have <b>100</b> banks.','Bank',3);
		Game.TieredAchievement('Need for greed','Have <b>150</b> banks.','Bank',4);
		Game.TieredAchievement('It\'s the economy, stupid','Have <b>200</b> banks.','Bank',5);
		order=1450;
		Game.TieredAchievement('Your time to shrine','Have <b>1</b> temple.','Temple',1);
		Game.TieredAchievement('Shady sect','Have <b>50</b> temples.','Temple',2);
		Game.TieredAchievement('New-age cult','Have <b>100</b> temples.','Temple',3);
		Game.TieredAchievement('Organized religion','Have <b>150</b> temples.','Temple',4);
		Game.TieredAchievement('Fanaticism','Have <b>200</b> temples.','Temple',5);
		order=1475;
		Game.TieredAchievement('Bewitched','Have <b>1</b> wizard tower.','Wizard tower',1);
		Game.TieredAchievement('The sorcerer\'s apprentice','Have <b>50</b> wizard towers.','Wizard tower',2);
		Game.TieredAchievement('Charms and enchantments','Have <b>100</b> wizard towers.','Wizard tower',3);
		Game.TieredAchievement('Curses and maledictions','Have <b>150</b> wizard towers.','Wizard tower',4);
		Game.TieredAchievement('Magic kingdom','Have <b>200</b> wizard towers.','Wizard tower',5);
		
		order=1445;
		Game.ProductionAchievement('Vested interest','Bank',1);
		order=1470;
		Game.ProductionAchievement('New world order','Temple',1);
		order=1495;
		Game.ProductionAchievement('Hocus pocus','Wizard tower',1);
		
		
		
		order=1070;
		Game.ProductionAchievement('Finger clickin\' good','Cursor',2,0,7);
		order=1120;
		Game.ProductionAchievement('Panic at the bingo','Grandma',2,0,6);
		order=1220;
		Game.ProductionAchievement('Rake in the dough','Farm',2);
		order=1320;
		Game.ProductionAchievement('Quarry on','Mine',2);
		order=1420;
		Game.ProductionAchievement('Yes I love technology','Factory',2);
		order=1445;
		Game.ProductionAchievement('Paid in full','Bank',2);
		order=1470;
		Game.ProductionAchievement('Church of Cookiology','Temple',2);
		order=1495;
		Game.ProductionAchievement('Too many rabbits, not enough hats','Wizard tower',2);
		order=1520;
		Game.ProductionAchievement('The most precious cargo','Shipment',2);
		order=1620;
		Game.ProductionAchievement('The Aureate','Alchemy lab',2);
		order=1720;
		Game.ProductionAchievement('Ever more hideous','Portal',2);
		order=1820;
		Game.ProductionAchievement('Be kind, rewind','Time machine',2);
		order=1920;
		Game.ProductionAchievement('Infinitesimal','Antimatter condenser',2);
		order=2020;
		Game.ProductionAchievement('A still more glorious dawn','Prism',2);
>>>>>>> 20180919:main.js
		
		order=30000;
		new Game.Achievement('重生','转生至少1次。',[21,6]);
		
		order=11000;
		new Game.Achievement('给你','点击这个“成就”的插槽。<q>你所要做的就是问。</q>',[1,7]);Game.last.clickFunction=function(){if (!Game.HasAchiev('给你')){PlaySound('snd/tick.mp3');Game.Win('给你');}};
		
		order=30000;
		new Game.Achievement('复活','转生 <b>10 次</b>.',[21,6]);
		new Game.Achievement('转生','转生 <b>100 次</b>.',[21,6]);
		new Game.Achievement('无限循环','转生 <b>1000 次</b>.<q>哦，嘿，又是你。</q>',[2,7]);Game.last.pool='shadow';
		
		
		
		order=1100;
<<<<<<< HEAD:main.js
		new Game.TieredAchievement('那个烤面包机','拥有 <b>300</b> 老奶奶。','Grandma',7);
		new Game.TieredAchievement('出来走','拥有 <b>350</b> 老奶奶。','Grandma',8);
		
		order=1200;new Game.TieredAchievement('杰出的园丁','拥有 <b>250</b> 农场。','Farm',6);
		order=1300;new Game.TieredAchievement('构造大使','拥有 <b>250</b> 矿山。','Mine',6);
		order=1400;new Game.TieredAchievement('机器的崛起','拥有 <b>250</b> 工厂。','Factory',6);
		order=1425;new Game.TieredAchievement('获得货币','拥有 <b>250</b> 银行。','Bank',6);
		order=1450;new Game.TieredAchievement('狂热','拥有 <b>250</b> 寺庙。','Temple',6);
		order=1475;new Game.TieredAchievement('魔法世界','拥有 <b>250</b> 精灵塔。','Wizard tower',6);
		order=1500;new Game.TieredAchievement('帕西-马西','拥有 <b>250</b> 装船。','Shipment',6);
		order=1600;new Game.TieredAchievement('一生的工作','拥有 <b>250</b> 炼金术实验室。','Alchemy lab',6);
		order=1700;new Game.TieredAchievement('一个迷失的地方','拥有 <b>250</b> 传送门。','Portal',6);
		order=1800;new Game.TieredAchievement('热死','拥有 <b>250</b> 时光机器。','Time machine',6);
		order=1900;new Game.TieredAchievement('微观世界','拥有 <b>250</b> 反物质冷凝器。','Antimatter condenser',6);
		order=2000;new Game.TieredAchievement('光明的未来','拥有 <b>250</b> 棱镜。','Prism',6);
=======
		Game.TieredAchievement('The agemaster','Have <b>300</b> grandmas.','Grandma',7);
		Game.TieredAchievement('To oldly go','Have <b>350</b> grandmas.','Grandma',8);
		
		order=1200;Game.TieredAchievement('Gardener extraordinaire','Have <b>250</b> farms.','Farm',6);
		order=1300;Game.TieredAchievement('Tectonic ambassador','Have <b>250</b> mines.','Mine',6);
		order=1400;Game.TieredAchievement('Rise of the machines','Have <b>250</b> factories.','Factory',6);
		order=1425;Game.TieredAchievement('Acquire currency','Have <b>250</b> banks.','Bank',6);
		order=1450;Game.TieredAchievement('Zealotry','Have <b>250</b> temples.','Temple',6);
		order=1475;Game.TieredAchievement('The wizarding world','Have <b>250</b> wizard towers.','Wizard tower',6);
		order=1500;Game.TieredAchievement('Parsec-masher','Have <b>250</b> shipments.','Shipment',6);
		order=1600;Game.TieredAchievement('The work of a lifetime','Have <b>250</b> alchemy labs.','Alchemy lab',6);
		order=1700;Game.TieredAchievement('A place lost in time','Have <b>250</b> portals.','Portal',6);
		order=1800;Game.TieredAchievement('Heat death','Have <b>250</b> time machines.','Time machine',6);
		order=1900;Game.TieredAchievement('Microcosm','Have <b>250</b> antimatter condensers.','Antimatter condenser',6);
		order=2000;Game.TieredAchievement('Bright future','Have <b>250</b> prisms.','Prism',6);
>>>>>>> 20180919:main.js
		
		order=25000;
		new Game.Achievement('这就是龙','完成你的 <b>龙的训练</b>.',[21,12]);
		
		Game.BankAchievement('怎么样？');
		Game.BankAchievement('牛奶和饼干的土地');
		Game.BankAchievement('控制饼干的人控制着宇宙');Game.last.baseDesc+='<q>牛奶必须流动！</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.BankAchievement('今晚上囤积');
		Game.BankAchievement('你会吃掉这一切吗？');
		Game.BankAchievement('我们需要一个更大的面包店');
		Game.BankAchievement('在疯狂的口中');Game.last.baseDesc+='<q>就是我们告诉对方它是一个饼干。</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.BankAchievement('这封信给你带来了 <div style="display:inline-block;background:url(img/money.png);width:16px;height:16px;"></div>');
	
	
		Game.CpsAchievement('一个充满了饼干的世界');
		Game.CpsAchievement('这个宝宝打 '+Beautify(100000000000*60*60)+' 饼干每小时');
		Game.CpsAchievement('快速和美味');
		Game.CpsAchievement('饼干赫兹：非常，非常好吃~赫兹');Game.last.baseDesc+='<q>无论如何，比赫兹甜甜圈还要辣。</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('哎呀，你解决了世界饥饿问题');
		Game.CpsAchievement('涡轮');Game.last.baseDesc+='<q>大自然会像“慢~下~来~”一样。</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('更快的人');
		Game.CpsAchievement('但你仍然很饿');
		Game.CpsAchievement('觉醒');
		Game.CpsAchievement('这些成就的名字能有多长，我真的不知道有多大的限制，我很想看看我们能走多远。<br>阿道弗斯·w·格林(1844 - 1917)于1864年开始担任格罗顿学校的校长。1865年，他成为纽约商业图书馆的第二助理馆长;从1867年到1869年，他被提升为图书馆员。从1869年到1873年，他为Evarts工作，他是Southmayd & Choate律师事务所，由William m . Evarts联合创立，Charles Ferdinand Southmayd和Joseph Hodges Choate。1873年，他被纽约州律师协会录取。<br>不管怎样，你这一天过得怎么样?');//Game.last.shortName='There\'s really no hard limit to how long these achievement names can be and to be quite honest I\'m [...]';
		Game.CpsAchievement('快速');Game.last.baseDesc+='<q>哇!</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		
		order=7002;
		new Game.Achievement('二百年半','拥有至少 <b>250 个每样建筑</b>.<q>继续继续。</q>',[9,6]);
		
		order=11000;
		new Game.Achievement('小报上瘾','点击新闻报道 <b>50 次</b>.<q>第6页：疯狂的个人点击饼干的图片，在徒劳无益情况下企图逃脱无聊！<br>第6页：英国议会吃了我的宝贝！</q>',[27,7]);
		
		order=1000;
		new Game.Achievement('点击祸患','通过点击制作 <b>100,000,000,000,000,000</b> 饼干。',[11,17]);
		new Game.Achievement('点击大灾变','通过点击制作 <b>10,000,000,000,000,000,000</b> 饼干。',[11,18]);
		
		order=1050;
		new Game.Achievement('大拇指，指骨，掌骨','拥有 <b>500</b> 游标。<q>& 指关节</q>',[0,15]);
		
		order=6000;
		new Game.Achievement('博学','拥有<b>300</b> 升级 <b>3000</b> 建筑。<q>卓越不是一蹴而就的 - 通常需要好几天的时间。</q>',[29,7]);
		
<<<<<<< HEAD:main.js
		new Game.Achievement('上古卷轴','拥有一个组合 <b>777</b> 老奶奶和游标。<q>让我猜猜。 有人偷了你的饼干。</q>',[10,9]);
		
		order=30050;
		new Game.Achievement('你说的是面包屑?','转生时有 <b>1 decillion</b> 烘烤的饼干。<q>很好。</q>',[29,6]);
		
		order=1200;new Game.TieredAchievement('破烂生意','拥有 <b>300</b> 农场。','Farm',7);
		order=1300;new Game.TieredAchievement('反常压裂法','拥有 <b>300</b> 矿山。','Mine',7);
		order=1400;new Game.TieredAchievement('摩登时代','拥有 <b>300</b> 工厂。','Factory',7);
		order=1425;new Game.TieredAchievement('战争的勇气','拥有 <b>300</b> 银行。','Bank',7);
		order=1450;new Game.TieredAchievement('Wololo','拥有 <b>300</b> 寺庙。','Temple',7);
		order=1475;new Game.TieredAchievement('现在我要做的下一个技巧是，我需要一个来自观众的志愿者','拥有 <b>300</b> 精灵塔。','Wizard tower',7);
		order=1500;new Game.TieredAchievement('这是不送的','拥有 <b>300</b> 装船。','Shipment',7);
		order=1600;new Game.TieredAchievement('黄金,杰瑞!黄金!','拥有 <b>300</b> 炼金术实验室。','Alchemy lab',7);
		order=1700;new Game.TieredAchievement('禁区','拥有 <b>300</b> 传送门。','Portal',7);
		order=1800;new Game.TieredAchievement('无尽的饼干永远和永远一百年的无尽的饼干，永远的一天，永远一百倍，一遍又一遍的无尽的饼干冒险。','拥有 <b>300</b> 时光机器。','Time machine',7);
		order=1900;new Game.TieredAchievement('科学家们束手无策','拥有 <b>300</b> 反物质冷凝器。','Antimatter condenser',7);
		order=2000;new Game.TieredAchievement('和谐的球体','拥有 <b>300</b> 棱镜。','Prism',7);
=======
		order=6005;
		new Game.Achievement('The elder scrolls','Own a combined <b>777</b> grandmas and cursors.<q>Let me guess. Someone stole your cookie.</q>',[10,9]);
		
		order=30050;
		new Game.Achievement('To crumbs, you say?','Ascend with <b>1 decillion</b> cookies baked.<q>Very well then.</q>',[29,6]);
		
		order=1200;Game.TieredAchievement('Seedy business','Have <b>300</b> farms.','Farm',7);
		order=1300;Game.TieredAchievement('Freak fracking','Have <b>300</b> mines.','Mine',7);
		order=1400;Game.TieredAchievement('Modern times','Have <b>300</b> factories.','Factory',7);
		order=1425;Game.TieredAchievement('The nerve of war','Have <b>300</b> banks.','Bank',7);
		order=1450;Game.TieredAchievement('Wololo','Have <b>300</b> temples.','Temple',7);
		order=1475;Game.TieredAchievement('And now for my next trick, I\'ll need a volunteer from the audience','Have <b>300</b> wizard towers.','Wizard tower',7);
		order=1500;Game.TieredAchievement('It\'s not delivery','Have <b>300</b> shipments.','Shipment',7);
		order=1600;Game.TieredAchievement('Gold, Jerry! Gold!','Have <b>300</b> alchemy labs.','Alchemy lab',7);
		order=1700;Game.TieredAchievement('Forbidden zone','Have <b>300</b> portals.','Portal',7);
		order=1800;Game.TieredAchievement('cookie clicker forever and forever a hundred years cookie clicker, all day long forever, forever a hundred times, over and over cookie clicker adventures dot com','Have <b>300</b> time machines.','Time machine',7);
		order=1900;Game.TieredAchievement('Scientists baffled everywhere','Have <b>300</b> antimatter condensers.','Antimatter condenser',7);
		order=2000;Game.TieredAchievement('Harmony of the spheres','Have <b>300</b> prisms.','Prism',7);
>>>>>>> 20180919:main.js
		
		order=35000;
		new Game.Achievement('最后机会','冲破濒临灭绝的<b>闪亮的皱纹</b>.<q>你这个怪物!</q>',[24,12]);Game.last.pool='shadow';
		
		order=10000;
		new Game.Achievement('早起的鸟儿','点击黄金饼干 <b>在它产生后不到1秒</b>.',[10,14]);
		new Game.Achievement('逝去的运气','点击黄金饼干 <b>在它消失前不到1秒</b>.',[10,14]);
		
		order=22100;
		new Game.Achievement('麋鹿','放一只驯鹿 <b>在一场老年狂潮中</b>.',[12,9]);
		
		order=21100;
		new Game.Achievement('伙计，亲爱的','收获 <b>7 合并糖块</b>.',[24,14]);
		new Game.Achievement('糖粉','收获 <b>30 合并糖块</b>.',[26,14]);
		new Game.Achievement('一年的蛀牙','收获 <b>365 合并糖块</b>.<q>我的糖块我的糖块</q>',[29,14]);
		new Game.Achievement('精心挑选','在成熟之前，成功地收获一个合并的糖块。',[28,14]);
		new Game.Achievement('糖糖','收获 1个 <b>分叉糖块</b>.',[29,15]);
		new Game.Achievement('天然蔗糖','收获 1个 <b>黄金糖块</b>.',[29,16]);Game.last.pool='shadow';
		new Game.Achievement('甜品','收获 1个 <b>肉质糖块</b>.',[29,17]);
		
		order=7002;
<<<<<<< HEAD:main.js
		new Game.Achievement('三百周年纪念','至少有 <b>300 每种建筑</b>.<q>不能停，不能停。也许应该停止了。</q>',[29,12]);
		
		Game.CpsAchievement('为了速度而揉捏');Game.last.baseDesc+='<q>我们怎么没做那个呢？</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('好吧，饼干开始到来，他们不会停止来');Game.last.baseDesc+='<q>不点击是没有意义的。</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('我不知道你是否注意到了，但是所有这些图标都有点偏离中心');
		Game.CpsAchievement('饼干的证据就在烘焙中');Game.last.baseDesc+='<q>如果你不烤面团，你怎么能吃到饼干呢?</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('如果它值得去做，那它就值得去做');
		
		Game.BankAchievement('我烘焙的梦想是我所拥有的最好的梦想');
		Game.BankAchievement('为生活而设');
		
		order=1200;new Game.TieredAchievement('你和豆茎','拥有 <b>350</b> 农场。','Farm',8);
		order=1300;new Game.TieredAchievement('浪漫的石头','拥有 <b>350</b> 矿山。','Mine',8);
		order=1400;new Game.TieredAchievement('救世主','拥有 <b>350</b> 工厂。','Factory',8);
		order=1425;new Game.TieredAchievement('我现在就需要它','拥有 <b>350</b> 银行。','Bank',8);
		order=1450;new Game.TieredAchievement('祈祷弱者','拥有 <b>350</b> 寺庙。','Temple',8);
		order=1475;new Game.TieredAchievement('这是一种魔法','拥有 <b>350</b> 精灵塔。','Wizard tower',8);
		order=1500;new Game.TieredAchievement('成功','拥有 <b>350</b> 装船。','Shipment',8);
		order=1600;new Game.TieredAchievement('闪光的都是金子','拥有 <b>350</b> 炼金术实验室。','Alchemy lab',8);
		order=1700;new Game.TieredAchievement('他来了','拥有 <b>350</b> 传送门。','Portal',8);
		order=1800;new Game.TieredAchievement('当时的方式','拥有 <b>350</b> 时光机器。','Time machine',8);
		order=1900;new Game.TieredAchievement('外来物质','拥有 <b>350</b> 反物质冷凝器。','Antimatter condenser',8);
		order=2000;new Game.TieredAchievement('在隧道的尽头','拥有 <b>350</b> 棱镜。','Prism',8);
		
		order=1070;
		new Game.Achievement('点击(亚当•桑德勒主演)','制作 <b>10,000,000,000,000,000,000,000,000</b> 饼干通过游标。',[0,24]);
		order=1120;
		new Game.Achievement('古物','制作 <b>10,000,000,000,000,000,000,000,000</b> 饼干通过老奶奶。',[1,24]);
		order=1220;
		new Game.Achievement('过度生长','制作 <b>10,000,000,000,000,000,000</b> 饼干通过农场。',[2,24]);
		order=1320;
		new Game.Achievement('沉积主义','制作 <b>100,000,000,000,000,000,000</b> 饼干通过矿山。',[3,24]);
		order=1420;
		new Game.Achievement('爱的劳动','制作 <b>1,000,000,000,000,000,000,000</b> 饼干通过工厂。',[4,24]);
		order=1445;
		new Game.Achievement('逆向漏斗系统','制作 <b>10,000,000,000,000,000,000,000</b> 饼干通过银行。',[15,24]);
		order=1470;
		new Game.Achievement('你这样说','制作 <b>100,000,000,000,000,000,000,000</b> 饼干通过寺庙。',[16,24]);
		order=1495;
		new Game.Achievement('天命','制作 <b>1,000,000,000,000,000,000,000,000</b> 饼干通过精灵塔。',[17,24]);
		order=1520;
		new Game.Achievement('无论雨雪热还是漫漫黑夜','制作 <b>10,000,000,000,000,000,000,000,000</b> 饼干通过装船。',[5,24]);
		order=1620;
		new Game.Achievement('我有点石成金的本领','制作 <b>100,000,000,000,000,000,000,000,000</b> 饼干通过炼金术实验室。',[6,24]);
		order=1720;
		new Game.Achievement('这永恒的谎言','制作 <b>1,000,000,000,000,000,000,000,000,000</b> 饼干通过传送门。',[7,24]);
		order=1820;
		new Game.Achievement('似曾相识','制作 <b>10,000,000,000,000,000,000,000,000,000</b> 饼干通过时光机器。',[8,24]);
		order=1920;
		new Game.Achievement('十大权力','制作 <b>100,000,000,000,000,000,000,000,000,000</b> 饼干通过反物质冷凝器。',[13,24]);
		order=2020;
		new Game.Achievement('现在黑暗的日子已经过去了','制作 <b>1,000,000,000,000,000,000,000,000,000,000</b> 饼干通过棱镜。',[14,24]);
=======
		new Game.Achievement('Tricentennial','Have at least <b>300 of everything</b>.<q>Can\'t stop, won\'t stop. Probably should stop, though.</q>',[29,12]);
		
		Game.CpsAchievement('Knead for speed');Game.last.baseDesc+='<q>How did we not make that one yet?</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('Well the cookies start coming and they don\'t stop coming');Game.last.baseDesc+='<q>Didn\'t make sense not to click for fun.</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('I don\'t know if you\'ve noticed but all these icons are very slightly off-center');
		Game.CpsAchievement('The proof of the cookie is in the baking');Game.last.baseDesc+='<q>How can you have any cookies if you don\'t bake your dough?</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('If it\'s worth doing, it\'s worth overdoing');
		
		Game.BankAchievement('The dreams in which I\'m baking are the best I\'ve ever had');
		Game.BankAchievement('Set for life');
		
		order=1200;Game.TieredAchievement('You and the beanstalk','Have <b>350</b> farms.','Farm',8);
		order=1300;Game.TieredAchievement('Romancing the stone','Have <b>350</b> mines.','Mine',8);
		order=1400;Game.TieredAchievement('Ex machina','Have <b>350</b> factories.','Factory',8);
		order=1425;Game.TieredAchievement('And I need it now','Have <b>350</b> banks.','Bank',8);
		order=1450;Game.TieredAchievement('Pray on the weak','Have <b>350</b> temples.','Temple',8);
		order=1475;Game.TieredAchievement('It\'s a kind of magic','Have <b>350</b> wizard towers.','Wizard tower',8);
		order=1500;Game.TieredAchievement('Make it so','Have <b>350</b> shipments.','Shipment',8);
		order=1600;Game.TieredAchievement('All that glitters is gold','Have <b>350</b> alchemy labs.','Alchemy lab',8);
		order=1700;Game.TieredAchievement('H̸̷͓̳̳̯̟͕̟͍͍̣͡ḛ̢̦̰̺̮̝͖͖̘̪͉͘͡ ̠̦͕̤̪̝̥̰̠̫̖̣͙̬͘ͅC̨̦̺̩̲̥͉̭͚̜̻̝̣̼͙̮̯̪o̴̡͇̘͎̞̲͇̦̲͞͡m̸̩̺̝̣̹̱͚̬̥̫̳̼̞̘̯͘ͅẹ͇̺̜́̕͢s̶̙̟̱̥̮̯̰̦͓͇͖͖̝͘͘͞','Have <b>350</b> portals.','Portal',8);
		order=1800;Game.TieredAchievement('Way back then','Have <b>350</b> time machines.','Time machine',8);
		order=1900;Game.TieredAchievement('Exotic matter','Have <b>350</b> antimatter condensers.','Antimatter condenser',8);
		order=2000;Game.TieredAchievement('At the end of the tunnel','Have <b>350</b> prisms.','Prism',8);
		
		
		
		order=1070;
		Game.ProductionAchievement('Click (starring Adam Sandler)','Cursor',3,0,7);
		order=1120;
		Game.ProductionAchievement('Frantiquities','Grandma',3,0,6);
		order=1220;
		Game.ProductionAchievement('Overgrowth','Farm',3);
		order=1320;
		Game.ProductionAchievement('Sedimentalism','Mine',3);
		order=1420;
		Game.ProductionAchievement('Labor of love','Factory',3);
		order=1445;
		Game.ProductionAchievement('Reverse funnel system','Bank',3);
		order=1470;
		Game.ProductionAchievement('Thus spoke you','Temple',3);
		order=1495;
		Game.ProductionAchievement('Manafest destiny','Wizard tower',3);
		order=1520;
		Game.ProductionAchievement('Neither snow nor rain nor heat nor gloom of night','Shipment',3);
		order=1620;
		Game.ProductionAchievement('I\'ve got the Midas touch','Alchemy lab',3);
		order=1720;
		Game.ProductionAchievement('Which eternal lie','Portal',3);
		order=1820;
		Game.ProductionAchievement('D&eacute;j&agrave; vu','Time machine',3);
		order=1920;
		Game.ProductionAchievement('Powers of Ten','Antimatter condenser',3);
		order=2020;
		Game.ProductionAchievement('Now the dark days are gone','Prism',3);
>>>>>>> 20180919:main.js
		
		order=1070;
		new Game.Achievement('怪异的爵士手','达到 <b>10</b> 级游标。',[0,26]);Game.Objects['Cursor'].levelAchiev10=Game.last;
		order=1120;
		new Game.Achievement('玛土撒拉','达到 <b>10</b> 级老奶奶。',[1,26]);Game.Objects['Grandma'].levelAchiev10=Game.last;
		order=1220;
		new Game.Achievement('大片土地','达到 <b>10</b> 级农场。',[2,26]);Game.Objects['Farm'].levelAchiev10=Game.last;
		order=1320;
		new Game.Achievement('再深一点','达到 <b>10</b> 级矿山。',[3,26]);Game.Objects['Mine'].levelAchiev10=Game.last;
		order=1420;
		new Game.Achievement('明显的天才','达到 <b>10</b> 级工厂。',[4,26]);Game.Objects['Factory'].levelAchiev10=Game.last;
		order=1445;
		new Game.Achievement('一个好主意','达到 <b>10</b> 级银行。',[15,26]);Game.Objects['Bank'].levelAchiev10=Game.last;
		order=1470;
		new Game.Achievement('它属于一家面包店','达到 <b>10</b> 级寺庙。',[16,26]);Game.Objects['Temple'].levelAchiev10=Game.last;
		order=1495;
		new Game.Achievement('汽车嘴','达到 <b>10</b> 级精灵塔。',[17,26]);Game.Objects['Wizard tower'].levelAchiev10=Game.last;
		order=1520;
		new Game.Achievement('去过也做过','达到 <b>10</b> 级装船。',[5,26]);Game.Objects['Shipment'].levelAchiev10=Game.last;
		order=1620;
		new Game.Achievement('复杂的物质','达到 <b>10</b> 级炼金术实验室。',[6,26]);Game.Objects['Alchemy lab'].levelAchiev10=Game.last;
		order=1720;
		new Game.Achievement('奇怪的世界','达到 <b>10</b> 级传送门。',[7,26]);Game.Objects['Portal'].levelAchiev10=Game.last;
		order=1820;
		new Game.Achievement('漫长的现在','达到 <b>10</b> 级时光机器。',[8,26]);Game.Objects['Time machine'].levelAchiev10=Game.last;
		order=1920;
		new Game.Achievement('胖嘟嘟的','达到<b>10</b> 级反物质冷凝器。',[13,26]);Game.Objects['Antimatter condenser'].levelAchiev10=Game.last;
		order=2020;
		new Game.Achievement('可调性','达到 <b>10</b> 级棱镜。',[14,26]);Game.Objects['Prism'].levelAchiev10=Game.last;
		
		order=61470;
		order=61495;
		new Game.Achievement('圣经','投射 <b>9</b> 法术。',[21,11]);
		new Game.Achievement('我是天才','投射 <b>99</b> 法术。',[22,11]);
		new Game.Achievement('巫师就是你','投射 <b>999</b> 法术。<q>我是什么?</q>',[29,11]);
		
		order=10000;
		new Game.Achievement('四叶饼干','拥有 <b>4</b> 黄金饼干同时出现。<q>相当罕见，因为饼干都没有叶子。</q>',[27,6]);Game.last.pool='shadow';
		
		order=2100;
<<<<<<< HEAD:main.js
		new Game.TieredAchievement('Lucked out','拥有 <b>1</b> chancemaker.','Chancemaker',1);
		new Game.TieredAchievement('What are the odds','拥有 <b>50</b> chancemakers.','Chancemaker',2);
		new Game.TieredAchievement('Grandma needs a new pair of shoes','拥有 <b>100</b> chancemakers.','Chancemaker',3);
		new Game.TieredAchievement('Million to one shot, doc','拥有 <b>150</b> chancemakers.','Chancemaker',4);
		new Game.TieredAchievement('As luck would have it','拥有 <b>200</b> chancemakers.','Chancemaker',5);
		new Game.TieredAchievement('Ever in your favor','拥有 <b>250</b> chancemakers.','Chancemaker',6);
		new Game.TieredAchievement('Be a lady','拥有 <b>300</b> chancemakers.','Chancemaker',7);
		new Game.TieredAchievement('Dicey business','拥有 <b>350</b> chancemakers.','Chancemaker',8);
		
		order=2120;
		new Game.Achievement('Fingers crossed','制作 <b>10,000,000,000,000,000,000,000,000</b> 饼干通过chancemakers.',[19,22]);
		new Game.Achievement('Just a statistic','制作 <b>10,000,000,000,000,000,000,000,000,000</b> 饼干通过chancemakers.',[19,23]);
		new Game.Achievement('Murphy\'s wild guess','制作 <b>10,000,000,000,000,000,000,000,000,000,000</b> 饼干通过chancemakers.',[19,24]);
=======
		Game.TieredAchievement('Lucked out','Have <b>1</b> chancemaker.','Chancemaker',1);
		Game.TieredAchievement('What are the odds','Have <b>50</b> chancemakers.','Chancemaker',2);
		Game.TieredAchievement('Grandma needs a new pair of shoes','Have <b>100</b> chancemakers.','Chancemaker',3);
		Game.TieredAchievement('Million to one shot, doc','Have <b>150</b> chancemakers.','Chancemaker',4);
		Game.TieredAchievement('As luck would have it','Have <b>200</b> chancemakers.','Chancemaker',5);
		Game.TieredAchievement('Ever in your favor','Have <b>250</b> chancemakers.','Chancemaker',6);
		Game.TieredAchievement('Be a lady','Have <b>300</b> chancemakers.','Chancemaker',7);
		Game.TieredAchievement('Dicey business','Have <b>350</b> chancemakers.','Chancemaker',8);
		
		order=2120;
		Game.ProductionAchievement('Fingers crossed','Chancemaker',1);
		Game.ProductionAchievement('Just a statistic','Chancemaker',2);
		Game.ProductionAchievement('Murphy\'s wild guess','Chancemaker',3);
>>>>>>> 20180919:main.js
		
		new Game.Achievement('Let\'s leaf it at that','达到 <b>10</b> chancemakers.',[19,26]);Game.Objects['Chancemaker'].levelAchiev10=Game.last;
		
		order=1000;
		new Game.Achievement('终极点击','制作 <b>1,000,000,000,000,000,000,000</b> 饼干通过点击。<q>(of ultimate destiny.)',[11,19]);
		
		
		order=1100;
<<<<<<< HEAD:main.js
		new Game.TieredAchievement('年老的好处','拥有 <b>400</b> 老奶奶。','Grandma',9);
		new Game.TieredAchievement('101岁的生日','拥有 <b>450</b> 老奶奶。','Grandma',10);
		new Game.TieredAchievement('老人的防卫','拥有 <b>500</b> 老奶奶。','Grandma',11);
		order=1200;new Game.TieredAchievement('收获月亮','拥有 <b>400</b> 农场。','Farm',9);
		order=1300;new Game.TieredAchievement('矿山？','拥有 <b>400</b> 矿山。','Mine',9);
		order=1400;new Game.TieredAchievement('全速生产','拥有 <b>400</b> 工厂。','Factory',9);
		order=1425;new Game.TieredAchievement('Treacle tart economics','拥有 <b>400</b> 银行。','Bank',9);
		order=1450;new Game.TieredAchievement('Holy cookies, grandma!','拥有 <b>400</b> 寺庙。','Temple',9);
		order=1475;new Game.TieredAchievement('The Prestige','拥有 <b>400</b> 精灵塔。<q>(与相同名称的饼干点击器效果无关。)</q>','Wizard tower',9);
		order=1500;new Game.TieredAchievement('That\'s just peanuts to space','拥有 <b>400</b> 装船','Shipment',9);
		order=1600;new Game.TieredAchievement('Worth its weight in lead','拥有 <b>400</b> 炼金术实验室。','Alchemy lab',9);
		order=1700;new Game.TieredAchievement('What happens in the vortex stays in the vortex','拥有 <b>400</b> 传送门。','Portal',9);
		order=1800;new Game.TieredAchievement('Invited to yesterday\'s party','拥有 <b>400</b> 时光机器。','Time machine',9);
		order=1900;new Game.TieredAchievement('Downsizing','拥有 <b>400</b> 反物质冷凝器。','Antimatter condenser',9);//the trailer got me really hyped up but i've read some pretty bad reviews. is it watchable ? is it worth seeing ? i don't mind matt damon
		order=2000;new Game.TieredAchievement('我的眼睛','拥有 <b>400</b> 棱镜。','Prism',9);
		order=2100;new Game.TieredAchievement('Maybe a chance in hell, actually','拥有 <b>400</b> chancemakers.','Chancemaker',9);
		
		order=1200;new Game.TieredAchievement('就像一棵树','拥有 <b>450</b> 农场。','Farm',10);
		order=1300;new Game.TieredAchievement('山洞的故事','拥有 <b>450</b> 矿山。','Mine',10);
		order=1400;new Game.TieredAchievement('In-cog-neato','拥有 <b>450</b> 工厂。','Factory',10);
		order=1425;new Game.TieredAchievement('保留你的气息，因为你只剩下这些了','拥有 <b>450</b> 银行。','Bank',10);
		order=1450;new Game.TieredAchievement('复仇的，全能的','拥有 <b>450</b> 寺庙。','Temple',10);
		order=1475;new Game.TieredAchievement('你来说出咒语','拥有 <b>450</b> 精灵塔。','Wizard tower',10);
		order=1500;new Game.TieredAchievement('空间空间空间空间空间！','拥有 <b>450</b> 装船。<q>It\'s too far away...</q>','Shipment',10);
		order=1600;new Game.TieredAchievement('不要对自己习以为常，你必须改变','拥有 <b>450</b> 炼金术实验室。','Alchemy lab',10);
		order=1700;new Game.TieredAchievement('Objects in the mirror dimension are closer than they appear','拥有 <b>450</b> 传送门','Portal',10);
		order=1800;new Game.TieredAchievement('Groundhog day','拥有 <b>450</b> 时光机器。','Time machine',10);
		order=1900;new Game.TieredAchievement('A matter of perspective','拥有 <b>450</b> 反物质冷凝器。','Antimatter condenser',10);
		order=2000;new Game.TieredAchievement('视觉错觉','拥有 <b>450</b> 棱镜。','Prism',10);
		order=2100;new Game.TieredAchievement('Jackpot','拥有 <b>450</b> chancemakers.','Chancemaker',10);
=======
		Game.TieredAchievement('Aged well','Have <b>400</b> grandmas.','Grandma',9);
		Game.TieredAchievement('101st birthday','Have <b>450</b> grandmas.','Grandma',10);
		Game.TieredAchievement('Defense of the ancients','Have <b>500</b> grandmas.','Grandma',11);
		order=1200;Game.TieredAchievement('Harvest moon','Have <b>400</b> farms.','Farm',9);
		order=1300;Game.TieredAchievement('Mine?','Have <b>400</b> mines.','Mine',9);
		order=1400;Game.TieredAchievement('In full gear','Have <b>400</b> factories.','Factory',9);
		order=1425;Game.TieredAchievement('Treacle tart economics','Have <b>400</b> banks.','Bank',9);
		order=1450;Game.TieredAchievement('Holy cookies, grandma!','Have <b>400</b> temples.','Temple',9);
		order=1475;Game.TieredAchievement('The Prestige','Have <b>400</b> wizard towers.<q>(Unrelated to the Cookie Clicker feature of the same name.)</q>','Wizard tower',9);
		order=1500;Game.TieredAchievement('That\'s just peanuts to space','Have <b>400</b> shipments.','Shipment',9);
		order=1600;Game.TieredAchievement('Worth its weight in lead','Have <b>400</b> alchemy labs.','Alchemy lab',9);
		order=1700;Game.TieredAchievement('What happens in the vortex stays in the vortex','Have <b>400</b> portals.','Portal',9);
		order=1800;Game.TieredAchievement('Invited to yesterday\'s party','Have <b>400</b> time machines.','Time machine',9);
		order=1900;Game.TieredAchievement('Downsizing','Have <b>400</b> antimatter condensers.','Antimatter condenser',9);//the trailer got me really hyped up but i've read some pretty bad reviews. is it watchable ? is it worth seeing ? i don't mind matt damon
		order=2000;Game.TieredAchievement('My eyes','Have <b>400</b> prisms.','Prism',9);
		order=2100;Game.TieredAchievement('Maybe a chance in hell, actually','Have <b>400</b> chancemakers.','Chancemaker',9);
		
		order=1200;Game.TieredAchievement('Make like a tree','Have <b>450</b> farms.','Farm',10);
		order=1300;Game.TieredAchievement('Cave story','Have <b>450</b> mines.','Mine',10);
		order=1400;Game.TieredAchievement('In-cog-neato','Have <b>450</b> factories.','Factory',10);
		order=1425;Game.TieredAchievement('Save your breath because that\'s all you\'ve got left','Have <b>450</b> banks.','Bank',10);
		order=1450;Game.TieredAchievement('Vengeful and almighty','Have <b>450</b> temples.','Temple',10);
		order=1475;Game.TieredAchievement('Spell it out for you','Have <b>450</b> wizard towers.','Wizard tower',10);
		order=1500;Game.TieredAchievement('Space space space space space','Have <b>450</b> shipments.<q>It\'s too far away...</q>','Shipment',10);
		order=1600;Game.TieredAchievement('Don\'t get used to yourself, you\'re gonna have to change','Have <b>450</b> alchemy labs.','Alchemy lab',10);
		order=1700;Game.TieredAchievement('Objects in the mirror dimension are closer than they appear','Have <b>450</b> portals.','Portal',10);
		order=1800;Game.TieredAchievement('Groundhog day','Have <b>450</b> time machines.','Time machine',10);
		order=1900;Game.TieredAchievement('A matter of perspective','Have <b>450</b> antimatter condensers.','Antimatter condenser',10);
		order=2000;Game.TieredAchievement('Optical illusion','Have <b>450</b> prisms.','Prism',10);
		order=2100;Game.TieredAchievement('Jackpot','Have <b>450</b> chancemakers.','Chancemaker',10);
>>>>>>> 20180919:main.js
		
		order=36000;
		new Game.Achievement('要做的事情太多了','Manage a cookie legacy for <b>at least a year</b>.<q>Thank you so much for playing Cookie Clicker!</q>',[23,11]);Game.last.pool='shadow';
		
		
		
		Game.CpsAchievement('Running with scissors');
		Game.CpsAchievement('Rarefied air');
		Game.CpsAchievement('Push it to the limit');
		Game.CpsAchievement('Green cookies sleep furiously');
		
		Game.BankAchievement('Panic! at Nabisco');
		Game.BankAchievement('Bursting at the seams');
		Game.BankAchievement('Just about full');
		Game.BankAchievement('Hungry for more');
		
		order=1000;
		new Game.Achievement('所有其他孩子们都被点击了','通过点击获取 <b>100,000,000,000,000,000,000,000</b> 饼干。',[11,28]);
		new Game.Achievement('一个…更多…点击…','通过点击获取 <b>10,000,000,000,000,000,000,000,000</b> 饼干。',[11,30]);
		
		order=61515;
		new Game.Achievement('Botany enthusiast','收获<b> 100 </b>成熟的园林植物。',[26,20]);
		new Game.Achievement('Green, aching thumb','收获<b> 1000 </b>成熟的园林植物。',[27,20]);
		new Game.Achievement('In the garden of Eden (baby)','用植物填充最大的花园地块的每块瓷砖。<q>那些珍贵的小植物是不是只是如此摇滚和/或滚动？</q>',[28,20]);
		
		new Game.Achievement('Keeper of the conservatory','解锁所有花园的种子。',[25,20]);
		new Game.Achievement('Seedless to nay','Convert a complete seed log into sugar lumps by sacrificing your garden to the sugar hornets.<div class="line"></div>Owning this achievement makes seeds <b>5% cheaper</b>, plants mature <b>5% sooner</b>, and plant upgrades drop <b>5% more</b>.',[29,20]);
		
		order=30050;
		new Game.Achievement('你一无所获','转生时烤了 <b>1 undecillion</b> 饼干。<q>美好的一天,先生！</q>',[29,6]);
		new Game.Achievement('谦虚的重新开始','转生时烤了 <b>1 duodecillion</b> 饼干。<q>从底部开始，现在我们来到这里。</q>',[29,6]);
		new Game.Achievement('世界末日','转生时烤了 <b>1 tredecillion</b> 饼干。<q>(因为我们知道它)</q>',[21,25]);
		new Game.Achievement('哦，你回来了','转生时烤了 <b>1 quattuordecillion</b> 饼干。<q>想念我们？</q>',[21,25]);
		new Game.Achievement('拉撒路','转生时烤了 <b>1 quindecillion</b> 饼干。<q>试试，再试一次。</q>',[21,25]);
		
		Game.CpsAchievement('Leisurely pace');
		Game.CpsAchievement('Hypersonic');
		
		Game.BankAchievement('Feed me, Orteil');
		Game.BankAchievement('And then what?');
		
		order=7002;
		new Game.Achievement('Tricentennial and a half','Have at least <b>350 of everything</b>.<q>(it\'s free real estate)</q>',[21,26]);
		new Game.Achievement('Quadricentennial','Have at least <b>400 of everything</b>.<q>You\'ve had to do horrible things to get this far.<br>Horrible... horrible things.</q>',[22,26]);
		new Game.Achievement('Quadricentennial and a half','Have at least <b>450 of everything</b>.<q>At this point, you might just be compensating for something.</q>',[23,26]);
		
		new Game.Achievement('Quincentennial','Have at least <b>500 of everything</b>.<q>Some people would say you\'re halfway there.<br>We do not care for those people and their reckless sense of unchecked optimism.</q>',[29,25]);
		
		
		order=21100;
		new Game.Achievement('Maillard reaction','Harvest a <b>caramelized sugar lump</b>.',[29,27]);
		
		order=30250;
		new Game.Achievement('当饼干提升恰到好处时','Ascend with exactly <b>1,000,000,000,000 cookies</b>.',[25,7]);Game.last.pool='shadow';//this achievement is shadow because it is only achievable through blind luck or reading external guides; this may change in the future
		
		
		order=1050;
<<<<<<< HEAD:main.js
		new Game.Achievement('随着她的手指和她的拇指','拥有 <b>600</b> 游标.',[0,16]);
		
		order=1100;new Game.TieredAchievement('但是等到你变老的时候','拥有 <b>550</b> 老奶奶.','Grandma',12);
		order=1200;new Game.TieredAchievement('棚子里最锋利的工具','拥有 <b>500</b> 农场.','Farm',11);
		order=1300;new Game.TieredAchievement('嘿，现在，你是一块石头','拥有 <b>500</b> 矿山.','Mine',11);
		order=1400;new Game.TieredAchievement('打破模具','拥有 <b>500</b> 工厂.','Factory',11);
		order=1425;new Game.TieredAchievement('获得节目，获得报酬','拥有 <b>500</b> 银行.','Bank',11);
		order=1450;new Game.TieredAchievement('我的世界很火，你的怎么样','拥有 <b>500</b> 寺庙.','Temple',11);
		order=1475;new Game.TieredAchievement('流星们不以为然','拥有 <b>500</b> 精灵塔.','Wizard tower',11);
		order=1500;new Game.TieredAchievement('只有流星','拥有 <b>500</b> 装船.','Shipment',11);
		order=1600;new Game.TieredAchievement('我们能做的也只能一点点变化','拥有 <b>500</b> 炼金实验室.','Alchemy lab',11);//"all that glitters is gold" was already an achievement
		order=1700;new Game.TieredAchievement('你的大脑变聪明，但你的头变得愚蠢','拥有 <b>500</b> 传送门.','Portal',11);
		order=1800;new Game.TieredAchievement('这些年开始了','拥有 <b>500</b> 时光机器.','Time machine',11);
		order=1900;new Game.TieredAchievement('这个概念是什么','拥有 <b>500</b> 反物质冷凝器.','Antimatter condenser',11);
		order=2000;new Game.TieredAchievement('如果你不发光，你永远不会发光','拥有 <b>500</b> 棱镜.','Prism',11);
		order=2100;new Game.TieredAchievement('如果你不去你永远也不会知道','拥有 <b>500</b> 机会制造商.','Chancemaker',11);
=======
		new Game.Achievement('With her finger and her thumb','Have <b>600</b> cursors.',[0,16]);
		
		order=1100;Game.TieredAchievement('But wait \'til you get older','Have <b>550</b> grandmas.','Grandma',12);
		order=1200;Game.TieredAchievement('Sharpest tool in the shed','Have <b>500</b> farms.','Farm',11);
		order=1300;Game.TieredAchievement('Hey now, you\'re a rock','Have <b>500</b> mines.','Mine',11);
		order=1400;Game.TieredAchievement('Break the mold','Have <b>500</b> factories.','Factory',11);
		order=1425;Game.TieredAchievement('Get the show on, get paid','Have <b>500</b> banks.','Bank',11);
		order=1450;Game.TieredAchievement('My world\'s on fire, how about yours','Have <b>500</b> temples.','Temple',11);
		order=1475;Game.TieredAchievement('The meteor men beg to differ','Have <b>500</b> wizard towers.','Wizard tower',11);
		order=1500;Game.TieredAchievement('Only shooting stars','Have <b>500</b> shipments.','Shipment',11);
		order=1600;Game.TieredAchievement('We could all use a little change','Have <b>500</b> alchemy labs.','Alchemy lab',11);//"all that glitters is gold" was already an achievement
		order=1700;Game.TieredAchievement('Your brain gets smart but your head gets dumb','Have <b>500</b> portals.','Portal',11);
		order=1800;Game.TieredAchievement('The years start coming','Have <b>500</b> time machines.','Time machine',11);
		order=1900;Game.TieredAchievement('What a concept','Have <b>500</b> antimatter condensers.','Antimatter condenser',11);
		order=2000;Game.TieredAchievement('You\'ll never shine if you don\'t glow','Have <b>500</b> prisms.','Prism',11);
		order=2100;Game.TieredAchievement('You\'ll never know if you don\'t go','Have <b>500</b> chancemakers.','Chancemaker',11);
		
		order=2200;
		Game.TieredAchievement('Self-contained','Have <b>1</b> fractal engine.','Fractal engine',1);
		Game.TieredAchievement('Threw you for a loop','Have <b>50</b> fractal engines.','Fractal engine',2);
		Game.TieredAchievement('The sum of its parts','Have <b>100</b> fractal engines.','Fractal engine',3);
		Game.TieredAchievement('Bears repeating','Have <b>150</b> fractal engines.<q>Where did these come from?</q>','Fractal engine',4);
		Game.TieredAchievement('More of the same','Have <b>200</b> fractal engines.','Fractal engine',5);
		Game.TieredAchievement('Last recurse','Have <b>250</b> fractal engines.','Fractal engine',6);
		Game.TieredAchievement('Out of one, many','Have <b>300</b> fractal engines.','Fractal engine',7);
		Game.TieredAchievement('An example of recursion','Have <b>350</b> fractal engines.','Fractal engine',8);
		Game.TieredAchievement('For more information on this achievement, please refer to its title','Have <b>400</b> fractal engines.','Fractal engine',9);
		Game.TieredAchievement('I\'m so meta, even this achievement','Have <b>450</b> fractal engines.','Fractal engine',10);
		Game.TieredAchievement('Never get bored','Have <b>500</b> fractal engines.','Fractal engine',11);
		
		order=2220;
		Game.ProductionAchievement('The needs of the many','Fractal engine',1);
		Game.ProductionAchievement('Eating its own','Fractal engine',2);
		Game.ProductionAchievement('We must go deeper','Fractal engine',3);
		
		new Game.Achievement('Sierpinski rhomboids','Reach level <b>10</b> fractal engines.',[20,26]);Game.Objects['Fractal engine'].levelAchiev10=Game.last;
		
		Game.CpsAchievement('Gotta go fast');
		Game.BankAchievement('I think it\'s safe to say you\'ve got it made');
		
		order=6000;
		new Game.Achievement('Renaissance baker','Own <b>400</b> upgrades and <b>4000</b> buildings.<q>If you have seen further, it is by standing on the shoulders of giants - a mysterious species of towering humanoids until now thought long-extinct.</q>',[10,10]);
>>>>>>> 20180919:main.js
		
		order=1150;
		new Game.Achievement('Veteran','Own at least <b>14</b> grandma types.<q>14\'s a crowd!</q>',[10,9]);
		
		//end of achievements
		
		/*=====================================================================================
		BUFFS
		=======================================================================================*/
		
		Game.buffs=[];//buffs currently in effect by name
		Game.buffsN=0;
		Game.buffsL=l('buffs');
		Game.gainBuff=function(type,time,arg1,arg2,arg3)
		{
			type=Game.buffTypesByName[type];
			var obj=type.func(time,arg1,arg2,arg3);
			obj.type=type;
			obj.arg1=arg1;
			obj.arg2=arg2;
			obj.arg3=arg3;
			
			var buff={
				visible:true,
				time:0,
				name:'???',
				desc:'',
				icon:[0,0]
			};
			if (Game.buffs[obj.name])//if there is already a buff in effect with this name
			{
				var buff=Game.buffs[obj.name];
				if (obj.max) buff.time=Math.max(obj.time,buff.time);//new duration is max of old and new
				if (obj.add) buff.time+=obj.time;//new duration is old + new
				if (!obj.max && !obj.add) buff.time=obj.time;//new duration is set to new
				buff.maxTime=buff.time;
			}
			else//create new buff
			{
				for (var i in obj)//paste parameters onto buff
				{buff[i]=obj[i];}
				buff.maxTime=buff.time;
				Game.buffs[buff.name]=buff;
				buff.id=Game.buffsN;
				
				//create dom
				Game.buffsL.innerHTML=Game.buffsL.innerHTML+'<div id="buff'+buff.id+'" class="crate enabled buff" '+(buff.desc?Game.getTooltip(
					'<div class="prompt" style="min-width:200px;text-align:center;font-size:11px;margin:8px 0px;"><h3>'+buff.name+'</h3><div class="line"></div>'+buff.desc+'</div>'
				,'left',true):'')+' style="opacity:1;float:none;display:block;'+(buff.icon[2]?'background-image:url('+buff.icon[2]+');':'')+'background-position:'+(-buff.icon[0]*48)+'px '+(-buff.icon[1]*48)+'px;"></div>';
				
				buff.l=l('buff'+buff.id);
				
				Game.buffsN++;
			}
			Game.recalculateGains=1;
			Game.storeToRefresh=1;
			return buff;
		}
		Game.hasBuff=function(what)//returns 0 if there is no buff in effect with this name; else, returns it
		{if (!Game.buffs[what]) return 0; else return Game.buffs[what];}
		Game.updateBuffs=function()//executed every logic frame
		{
			for (var i in Game.buffs)
			{
				var buff=Game.buffs[i];
				
				if (buff.time>=0)
				{
					if (!l('buffPieTimer'+buff.id)) l('buff'+buff.id).innerHTML=l('buff'+buff.id).innerHTML+'<div class="pieTimer" id="buffPieTimer'+buff.id+'"></div>';
					var T=1-(buff.time/buff.maxTime);
					T=(T*144)%144;
					l('buffPieTimer'+buff.id).style.backgroundPosition=(-Math.floor(T%18))*48+'px '+(-Math.floor(T/18))*48+'px';
				}
				buff.time--;
				if (buff.time<=0)
				{
					if (Game.onCrate==l('buff'+buff.id)) Game.tooltip.hide();
					if (buff.onDie) buff.onDie();
					Game.buffsL.removeChild(l('buff'+buff.id));
					if (Game.buffs[buff.name])
					{
						Game.buffs[buff.name]=0;
						delete Game.buffs[buff.name];
					}
					Game.recalculateGains=1;
					Game.storeToRefresh=1;
				}
			}
		}
		Game.killBuff=function(what)//remove a buff by name
		{if (Game.buffs[what]){Game.buffs[what].time=0;/*Game.buffs[what]=0;*/}}
		Game.killBuffs=function()//remove all buffs
		{Game.buffsL.innerHTML='';Game.buffs=[];Game.recalculateGains=1;Game.storeToRefresh=1;}
		
		
		Game.buffTypes=[];//buff archetypes; only buffs declared from these can be saved and loaded
		Game.buffTypesByName=[];
		Game.buffTypesN=0;
		Game.buffType=function(name,func)
		{
			this.name=name;
			this.func=func;//this is a function that returns a buff object; it takes a "time" argument in seconds, and 3 more optional arguments at most, which will be saved and loaded as floats
			this.id=Game.buffTypesN;
			this.vanilla=Game.vanilla;
			Game.buffTypesByName[this.name]=this;
			Game.buffTypes[Game.buffTypesN]=this;
			Game.buffTypesN++;
		}
		
		/*
		basic buff parameters :
			name:'Kitten rain',
			desc:'It\'s raining kittens!',
			icon:[0,0],
			time:30*Game.fps
		other parameters :
			visible:false - will hide the buff from the buff list
			add:true - if this buff already exists, add the new duration to the old one
			max:true - if this buff already exists, set the new duration to the max of either
			onDie:function(){} - function will execute when the buff runs out
			power:3 - used by some buffs
			multCpS:3 - buff multiplies CpS by this amount
			multClick:3 - buff multiplies click power by this amount
		*/
		
		//base buffs
		new Game.buffType('frenzy',function(time,pow)
		{
			return {
				name:'疯狂',
				desc:'饼干产量 x'+pow+' 持续 '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[10,14],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
				aura:1
			};
		});
		new Game.buffType('blood frenzy',function(time,pow)
		{
			return {
				name:'老者狂怒',
				desc:'饼干产量 x'+pow+' 持续 '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[29,6],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
				aura:1
			};
		});
		new Game.buffType('clot',function(time,pow)
		{
			return {
				name:'血栓',
				desc:'饼干产量减半持续 '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[15,5],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
				aura:2
			};
		});
		new Game.buffType('dragon harvest',function(time,pow)
		{
			return {
				name:'龙之收获',
				desc:'饼干产量 x'+pow+' 持续 '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[10,25],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
				aura:1
			};
		});
		new Game.buffType('everything must go',function(time,pow)
		{
			return {
				name:'一切都得走',
				desc:'所有建筑便宜 '+pow+'% '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[17,6],
				time:time*Game.fps,
				add:true,
				power:pow,
				aura:1
			};
		});
		new Game.buffType('cursed finger',function(time,pow)
		{
			return {
				name:'被诅咒的手指',
				desc:'饼干生产停止 '+Game.sayTime(time*Game.fps,-1)+',<br>但是每一次点击都是值得的 '+Game.sayTime(time*Game.fps,-1)+' 饼干每秒产量.',
				icon:[12,17],
				time:time*Game.fps,
				add:true,
				power:pow,
				multCpS:0,
				aura:1
			};
		});
		new Game.buffType('click frenzy',function(time,pow)
		{
			return {
				name:'点击狂潮',
				desc:'点击效果 x'+pow+' 持续 '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[0,14],
				time:time*Game.fps,
				add:true,
				multClick:pow,
				aura:1
			};
		});
		new Game.buffType('龙之飞舞',function(time,pow)
		{
			return {
				name:'龙之飞舞',
				desc:'点击效果 x'+pow+' 持续 '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[0,25],
				time:time*Game.fps,
				add:true,
				multClick:pow,
				aura:1
			};
		});
		new Game.buffType('cookie storm',function(time,pow)
		{
			return {
				name:'饼干风暴',
				desc:'饼干无处不在!',
				icon:[22,6],
				time:time*Game.fps,
				add:true,
				power:pow,
				aura:1
			};
		});
		new Game.buffType('building buff',function(time,pow,building)
		{
			var obj=Game.ObjectsById[building];
			return {
				name:Game.goldenCookieBuildingBuffs[obj.name][0],
				desc:'你的 '+obj.amount+' '+cnsigle(obj.plural)+' 促进饼干每秒产量!<br>饼干生产 +'+(Math.ceil(pow*100-100))+'% '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[obj.iconColumn,14],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
				aura:1
			};
		});
		new Game.buffType('building debuff',function(time,pow,building)
		{
			var obj=Game.ObjectsById[building];
			return {
				name:Game.goldenCookieBuildingBuffs[obj.name][1],
				desc:'你的 '+obj.amount+' '+obj.plural+' 锈蚀饼干秒产量<br>饼干生产减慢 '+(Math.ceil(pow*100-100))+'% '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[obj.iconColumn,15],
				time:time*Game.fps,
				add:true,
				multCpS:1/pow,
				aura:2
			};
		});
		new Game.buffType('sugar blessing',function(time,pow)
		{
			return {
				name:'糖的祝福',
				desc:'你发现黄金饼干的几率增加 10% 在接下来 '+Game.sayTime(time*Game.fps,-1)+'.',
				icon:[29,16],
				time:time*Game.fps,
				//add:true
			};
		});
		new Game.buffType('haggler luck',function(time,pow)
		{
			return {
				name:'运气而已',
				desc:'所有升级都便宜 '+pow+'% '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[25,11],
				time:time*Game.fps,
				power:pow,
				max:true
			};
		});
		new Game.buffType('haggler misery',function(time,pow)
		{
			return {
				name:'砍价的不幸',
				desc:'所有升级成本增加 '+pow+'% '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[25,11],
				time:time*Game.fps,
				power:pow,
				max:true
			};
		});
		new Game.buffType('pixie luck',function(time,pow)
		{
			return {
				name:'狡猾的小妖精',
				desc:'所有建筑便宜 '+pow+'% '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[26,11],
				time:time*Game.fps,
				power:pow,
				max:true
			};
		});
		new Game.buffType('pixie misery',function(time,pow)
		{
			return {
				name:'肮脏的妖精',
				desc:'所有建筑成本增加 '+pow+'% '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[26,11],
				time:time*Game.fps,
				power:pow,
				max:true
			};
		});
		new Game.buffType('魔法专家',function(time,pow)
		{
			return {
				name:'魔法专家',
				desc:'咒语会适得其反 '+pow+'持续时间变短'+Game.sayTime(time*Game.fps,-1)+'.',
				icon:[29,11],
				time:time*Game.fps,
				power:pow,
				max:true
			};
		});
		new Game.buffType('魔法无能',function(time,pow)
		{
			return {
				name:'魔法无能',
				desc:'咒语反效果会增加 '+pow+' 次在接下来的 '+Game.sayTime(time*Game.fps,-1)+'分钟.',
				icon:[29,11],
				time:time*Game.fps,
				power:pow,
				max:true
			};
		});
		new Game.buffType('devastation',function(time,pow)
		{
			return {
				name:'破坏',
				desc:'点击效果 +'+Math.floor(pow*100-100)+'% 持续 '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[23,18],
				time:time*Game.fps,
				multClick:pow,
				aura:1,
				max:true
			};
		});
		new Game.buffType('sugar frenzy',function(time,pow)
		{
			return {
				name:'糖的狂热',
				desc:'饼干产量 x'+pow+' 持续 '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[29,14],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
				aura:0
			};
		});
		
		//end of buffs
		
		
		
		
		
		BeautifyAll();
		Game.vanilla=0;//everything we create beyond this will not be saved in the default save
		
		
		for (var i in Game.customCreate) {Game.customCreate[i]();}
		
		
		/*=====================================================================================
		GRANDMAPOCALYPSE
		=======================================================================================*/
		Game.UpdateGrandmapocalypse=function()
		{
			if (Game.Has('老人契约') || Game.Objects['Grandma'].amount==0) Game.elderWrath=0;
			else if (Game.pledgeT>0)//if the pledge is active, lower it
			{
				Game.pledgeT--;
				if (Game.pledgeT==0)//did we reach 0? make the pledge purchasable again
				{
					Game.Lock('老人的承诺');
					Game.Unlock('老人的承诺');
					Game.elderWrath=1;
				}
			}
			else
			{
				if (Game.Has('同心协力') && Game.elderWrath==0)
				{
					Game.elderWrath=1;
				}
				if (Math.random()<0.001 && Game.elderWrath<Game.Has('同心协力')+Game.Has('集体洗脑')+Game.Has('长者盟约'))
				{
					Game.elderWrath++;//have we already pledged? make the elder wrath shift between different stages
				}
				if (Game.Has('长者盟约') && Game.Upgrades['老人的承诺'].unlocked==0)
				{
					Game.Lock('老人的承诺');
					Game.Unlock('老人的承诺');
				}
			}
			Game.elderWrathD+=((Game.elderWrath+1)-Game.elderWrathD)*0.001;//slowly fade to the target wrath state
			
			if (Game.elderWrath!=Game.elderWrathOld) Game.storeToRefresh=1;
			
			Game.elderWrathOld=Game.elderWrath;
			
			Game.UpdateWrinklers();
		}
		
		//wrinklers
		
		function inRect(x,y,rect)
		{
			//find out if the point x,y is in the rotated rectangle rect{w,h,r,o} (width,height,rotation in radians,y-origin) (needs to be normalized)
			//I found this somewhere online I guess
			var dx = x+Math.sin(-rect.r)*(-(rect.h/2-rect.o)),dy=y+Math.cos(-rect.r)*(-(rect.h/2-rect.o));
			var h1 = Math.sqrt(dx*dx + dy*dy);
			var currA = Math.atan2(dy,dx);
			var newA = currA - rect.r;
			var x2 = Math.cos(newA) * h1;
			var y2 = Math.sin(newA) * h1;
			if (x2 > -0.5 * rect.w && x2 < 0.5 * rect.w && y2 > -0.5 * rect.h && y2 < 0.5 * rect.h) return true;
			return false;
		}
		
		Game.wrinklerHP=2.1;
		Game.wrinklers=[];
		for (var i=0;i<12;i++)
		{
			Game.wrinklers.push({id:parseInt(i),close:0,sucked:0,phase:0,x:0,y:0,r:0,hurt:0,hp:Game.wrinklerHP,selected:0,type:0});
		}
		Game.getWrinklersMax=function()
		{
			var n=10;
			if (Game.Has('老香料')) n+=2;
			return n;
		}
		Game.ResetWrinklers=function()
		{
			for (var i in Game.wrinklers)
			{
				Game.wrinklers[i]={id:parseInt(i),close:0,sucked:0,phase:0,x:0,y:0,r:0,hurt:0,hp:Game.wrinklerHP,type:0};
			}
		}
		Game.CollectWrinklers=function()
		{
			for (var i in Game.wrinklers)
			{
				Game.wrinklers[i].hp=0;
			}
		}
		Game.wrinklerSquishSound=Math.floor(Math.random()*4)+1;
		Game.playWrinklerSquishSound=function()
		{
			PlaySound('snd/squish'+(Game.wrinklerSquishSound)+'.mp3',0.5);
			Game.wrinklerSquishSound+=Math.floor(Math.random()*1.5)+1;
			if (Game.wrinklerSquishSound>4) Game.wrinklerSquishSound-=4;
		}
		Game.SpawnWrinkler=function(me)
		{
			if (!me)
			{
				var max=Game.getWrinklersMax();
				var n=0;
				for (var i in Game.wrinklers)
				{
					if (Game.wrinklers[i].phase>0) n++;
				}
				for (var i in Game.wrinklers)
				{
					var it=Game.wrinklers[i];
					if (it.phase==0 && Game.elderWrath>0 && n<max && it.id<max)
					{
						me=it;
						break;
					}
				}
			}
			if (!me) return false;
			me.phase=1;
			me.hp=Game.wrinklerHP;
			me.type=0;
			if (Math.random()<0.0001) me.type=1;//shiny wrinkler
			return me;
		}
		Game.PopRandomWrinkler=function()
		{
			var wrinklers=[];
			for (var i in Game.wrinklers)
			{
				if (Game.wrinklers[i].phase>0 && Game.wrinklers[i].hp>0) wrinklers.push(Game.wrinklers[i]);
			}
			if (wrinklers.length>0)
			{
				var me=choose(wrinklers);
				me.hp=-10;
				return me;
			}
			return false;
		}
		Game.UpdateWrinklers=function()
		{
			var xBase=0;
			var yBase=0;
			var onWrinkler=0;
			if (Game.LeftBackground)
			{
				xBase=Game.cookieOriginX;
				yBase=Game.cookieOriginY;
			}
			var max=Game.getWrinklersMax();
			var n=0;
			for (var i in Game.wrinklers)
			{
				if (Game.wrinklers[i].phase>0) n++;
			}
			for (var i in Game.wrinklers)
			{
				var me=Game.wrinklers[i];
				if (me.phase==0 && Game.elderWrath>0 && n<max && me.id<max)
				{
					var chance=0.00001*Game.elderWrath;
					chance*=Game.eff('wrinklerSpawn');
					if (Game.Has('邪恶的诱饵')) chance*=5;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('scorn');
						if (godLvl==1) chance*=2.5;
						else if (godLvl==2) chance*=2;
						else if (godLvl==3) chance*=1.5;
					}
					if (Game.Has('皱纹门垫')) chance=0.1;
					if (Math.random()<chance)//respawn
					{
						Game.SpawnWrinkler(me);
					}
				}
				if (me.phase>0)
				{
					if (me.close<1) me.close+=(1/Game.fps)/10;
					if (me.close>1) me.close=1;
				}
				else me.close=0;
				if (me.close==1 && me.phase==1)
				{
					me.phase=2;
					Game.recalculateGains=1;
				}
				if (me.phase==2)
				{
					me.sucked+=(((Game.cookiesPs/Game.fps)*Game.cpsSucked));//suck the cookies
				}
				if (me.phase>0)
				{
					if (me.type==0)
					{
						if (me.hp<Game.wrinklerHP) me.hp+=0.04;
						me.hp=Math.min(Game.wrinklerHP,me.hp);
					}
					else if (me.type==1)
					{
						if (me.hp<Game.wrinklerHP*3) me.hp+=0.04;
						me.hp=Math.min(Game.wrinklerHP*3,me.hp);
					}
					var d=128*(2-me.close);//*Game.BigCookieSize;
					if (Game.prefs.fancy) d+=Math.cos(Game.T*0.05+parseInt(me.id))*4;
					me.r=(me.id/max)*360;
					if (Game.prefs.fancy) me.r+=Math.sin(Game.T*0.05+parseInt(me.id))*4;
					me.x=xBase+(Math.sin(me.r*Math.PI/180)*d);
					me.y=yBase+(Math.cos(me.r*Math.PI/180)*d);
					if (Game.prefs.fancy) me.r+=Math.sin(Game.T*0.09+parseInt(me.id))*4;
					var rect={w:100,h:200,r:(-me.r)*Math.PI/180,o:10};
					if (Math.random()<0.01) me.hurt=Math.max(me.hurt,Math.random());
					if (Game.T%5==0 && Game.CanClick) {if (Game.LeftBackground && Game.mouseX<Game.LeftBackground.canvas.width && inRect(Game.mouseX-me.x,Game.mouseY-me.y,rect)) me.selected=1; else me.selected=0;}
					if (me.selected && onWrinkler==0 && Game.CanClick)
					{
						me.hurt=Math.max(me.hurt,0.25);
						//me.close*=0.99;
						if (Game.Click && Game.lastClickedEl==l('backgroundLeftCanvas'))
						{
							if (Game.keys[17] && Game.sesame) {me.type=!me.type;PlaySound('snd/shimmerClick.mp3');}//ctrl-click on a wrinkler in god mode to toggle its shininess
							else
							{
								Game.playWrinklerSquishSound();
								me.hurt=1;
								me.hp-=0.75;
								if (Game.prefs.particles && !(me.hp<=0.5 && me.phase>0))
								{
									var x=me.x+(Math.sin(me.r*Math.PI/180)*90);
									var y=me.y+(Math.cos(me.r*Math.PI/180)*90);
									for (var ii=0;ii<3;ii++)
									{
										//Game.particleAdd(x+Math.random()*50-25,y+Math.random()*50-25,Math.random()*4-2,Math.random()*-2-2,1,1,2,'wrinklerBits.png');
										var part=Game.particleAdd(x,y,Math.random()*4-2,Math.random()*-2-2,1,1,2,me.type==1?'shinyWrinklerBits.png':'wrinklerBits.png');
										part.r=-me.r;
									}
								}
							}
							Game.Click=0;
						}
						onWrinkler=1;
					}
				}
				
				if (me.hurt>0)
				{
					me.hurt-=5/Game.fps;
					//me.close-=me.hurt*0.05;
					//me.x+=Math.random()*2-1;
					//me.y+=Math.random()*2-1;
					me.r+=(Math.sin(Game.T*1)*me.hurt)*18;//Math.random()*2-1;
				}
				if (me.hp<=0.5 && me.phase>0)
				{
					Game.playWrinklerSquishSound();
					PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
					Game.wrinklersPopped++;
					Game.recalculateGains=1;
					me.phase=0;
					me.close=0;
					me.hurt=0;
					me.hp=3;
					var toSuck=1.1;
					if (Game.Has('亵渎神明')) toSuck*=1.05;
					if (me.type==1) toSuck*=3;//shiny wrinklers are an elusive, profitable breed
					me.sucked*=toSuck;//cookie dough does weird things inside wrinkler digestive tracts
					if (Game.Has('皱纹卵')) me.sucked*=1.05;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('scorn');
						if (godLvl==1) me.sucked*=1.15;
						else if (godLvl==2) me.sucked*=1.1;
						else if (godLvl==3) me.sucked*=1.05;
					}
					if (me.sucked>0.5)
					{
						if (Game.prefs.popups) Game.Popup('Exploded a '+(me.type==1?'shiny ':'')+'wrinkler : found '+Beautify(me.sucked)+' cookies!');
						else Game.Notify('Exploded a '+(me.type==1?'shiny ':'')+'wrinkler','Found <b>'+Beautify(me.sucked)+'</b> cookies!',[19,8],6);
						Game.Popup('<div style="font-size:80%;">+'+Beautify(me.sucked)+' cookies</div>',Game.mouseX,Game.mouseY);
						
						if (Game.season=='halloween')
						{
							//if (Math.random()<(Game.HasAchiev('Spooky cookies')?0.2:0.05))//halloween cookie drops
							var failRate=0.95;
							if (Game.HasAchiev('幽灵饼干')) failRate=0.8;
							if (Game.Has('星际恐怖')) failRate*=0.9;
							failRate*=1/Game.dropRateMult();
							if (Game.hasGod)
							{
								var godLvl=Game.hasGod('seasons');
								if (godLvl==1) failRate*=0.9;
								else if (godLvl==2) failRate*=0.95;
								else if (godLvl==3) failRate*=0.97;
							}
							if (me.type==1) failRate*=0.9;
							if (Math.random()>failRate)//halloween cookie drops
							{
								var cookie=choose(['骷髅饼干','鬼饼干','蝙蝠饼干','粘液饼干','南瓜饼干','眼球饼干','蜘蛛饼干']);
								if (!Game.HasUnlocked(cookie) && !Game.Has(cookie))
								{
									Game.Unlock(cookie);
									if (Game.prefs.popups) Game.Popup('Found : '+cookie+'!');
									else Game.Notify(cookie,'You also found <b>'+cookie+'</b>!',Game.Upgrades[cookie].icon);
								}
							}
						}
						Game.DropEgg(0.98);
					}
					if (me.type==1) Game.Win('最后机会');
					Game.Earn(me.sucked);
					/*if (Game.prefs.particles)
					{
						var x=me.x+(Math.sin(me.r*Math.PI/180)*100);
						var y=me.y+(Math.cos(me.r*Math.PI/180)*100);
						for (var ii=0;ii<6;ii++)
						{
							Game.particleAdd(x+Math.random()*50-25,y+Math.random()*50-25,Math.random()*4-2,Math.random()*-2-2,1,1,2,'wrinklerBits.png');
						}
					}*/
					if (Game.prefs.particles)
					{
						var x=me.x+(Math.sin(me.r*Math.PI/180)*90);
						var y=me.y+(Math.cos(me.r*Math.PI/180)*90);
						if (me.sucked>0)
						{
							for (var ii=0;ii<5;ii++)
							{
								Game.particleAdd(Game.mouseX,Game.mouseY,Math.random()*4-2,Math.random()*-2-2,Math.random()*0.5+0.75,1.5,2);
							}
						}
						for (var ii=0;ii<8;ii++)
						{
							var part=Game.particleAdd(x,y,Math.random()*4-2,Math.random()*-2-2,1,1,2,me.type==1?'shinyWrinklerBits.png':'wrinklerBits.png');
							part.r=-me.r;
						}
					}
					me.sucked=0;
				}
			}
			if (onWrinkler)
			{
				Game.mousePointer=1;
			}
		}
		Game.DrawWrinklers=function()
		{
			var ctx=Game.LeftBackground;
			var selected=0;
			for (var i in Game.wrinklers)
			{
				var me=Game.wrinklers[i];
				if (me.phase>0)
				{
					ctx.globalAlpha=me.close;
					ctx.save();
					ctx.translate(me.x,me.y);
					ctx.rotate(-(me.r)*Math.PI/180);
					//var s=Math.min(1,me.sucked/(Game.cookiesPs*60))*0.75+0.25;//scale wrinklers as they eat
					//ctx.scale(Math.pow(s,1.5)*1.25,s);
					//ctx.fillRect(-50,-10,100,200);
					if (me.type==1) ctx.drawImage(Pic('shinyWrinkler.png'),-50,-10);
					else if (Game.season=='christmas') ctx.drawImage(Pic('winterWrinkler.png'),-50,-10);
					else ctx.drawImage(Pic('wrinkler.png'),-50,-10);
					//ctx.fillText(me.id+' : '+me.sucked,0,0);
					if (me.type==1 && Math.random()<0.3 && Game.prefs.particles)//sparkle
					{
						ctx.globalAlpha=Math.random()*0.65+0.1;
						var s=Math.random()*30+5;
						ctx.globalCompositeOperation='lighter';
						ctx.drawImage(Pic('glint.jpg'),-s/2+Math.random()*50-25,-s/2+Math.random()*200,s,s);
					}
					ctx.restore();
					
					if (me.phase==2 && Math.random()<0.03 && Game.prefs.particles)
					{
						Game.particleAdd(me.x,me.y,Math.random()*4-2,Math.random()*-2-2,Math.random()*0.5+0.5,1,2);
					}
					
					if (me.selected) selected=me;
				}
			}
			if (selected && Game.Has('皱纹的眼睛'))
			{
				var x=Game.cookieOriginX;
				var y=Game.cookieOriginY;
				ctx.font='14px Merriweather';
				ctx.textAlign='center';
				var width=Math.max(ctx.measureText('Swallowed :').width,ctx.measureText(Beautify(selected.sucked)).width);
				ctx.fillStyle='#000';
				ctx.strokeStyle='#000';
				ctx.lineWidth=8;
				ctx.globalAlpha=0.5;
				ctx.beginPath();
				ctx.moveTo(x,y);
				ctx.lineTo(Math.floor(selected.x),Math.floor(selected.y));
				ctx.stroke();
				ctx.fillRect(x-width/2-8-14,y-23,width+16+28,38);
				ctx.globalAlpha=1;
				ctx.fillStyle='#fff';
				ctx.fillText('Swallowed :',x+14,y-8);
				ctx.fillText(Beautify(selected.sucked),x+14,y+8);
				ctx.drawImage(Pic('icons.png'),27*48,26*48,48,48,x-width/2-8-22,y-4-24,48,48);
			}
		}
		Game.SaveWrinklers=function()
		{
			var amount=0;
			var amountShinies=0;
			var number=0;
			var shinies=0;
			for (var i in Game.wrinklers)
			{
				if (Game.wrinklers[i].sucked>0.5)
				{
					number++;
					if (Game.wrinklers[i].type==1)
					{
						shinies++;
						amountShinies+=Game.wrinklers[i].sucked;
					}
					else amount+=Game.wrinklers[i].sucked;
				}
			}
			return {amount:amount,number:number,shinies:shinies,amountShinies:amountShinies};
		}
		Game.LoadWrinklers=function(amount,number,shinies,amountShinies)
		{
			if (number>0 && (amount>0 || amountShinies>0))
			{
				var fullNumber=number-shinies;
				var fullNumberShinies=shinies;
				for (var i in Game.wrinklers)
				{
					if (number>0)
					{
						Game.wrinklers[i].phase=2;
						Game.wrinklers[i].close=1;
						Game.wrinklers[i].hp=3;
						if (shinies>0) {Game.wrinklers[i].type=1;Game.wrinklers[i].sucked=amountShinies/fullNumberShinies;shinies--;}
						else Game.wrinklers[i].sucked=amount/fullNumber;
						number--;
					}//respawn
				}
			}
		}
		
		/*=====================================================================================
		SPECIAL THINGS AND STUFF
		=======================================================================================*/
		
		
		Game.specialTab='';
		Game.specialTabHovered='';
		Game.specialTabs=[];
		
		Game.UpdateSpecial=function()
		{
			Game.specialTabs=[];
			if (Game.Has('节庆帽子')) Game.specialTabs.push('santa');
			if (Game.Has('易碎的鸡蛋')) Game.specialTabs.push('dragon');
			if (Game.specialTabs.length==0) {Game.ToggleSpecialMenu(0);return;}
		
			if (Game.LeftBackground)
			{
				Game.specialTabHovered='';
				var len=Game.specialTabs.length;
				if (len==0) return;
				var y=Game.LeftBackground.canvas.height-24-48*len;
				for (var i in Game.specialTabs)
				{
					var selected=0;
					if (Game.specialTab==Game.specialTabs[i]) selected=1;
					var x=24;
					var s=1;
					if (selected) {s=2;x+=24;}
					
					if (Math.abs(Game.mouseX-x)<=24*s && Math.abs(Game.mouseY-y)<=24*s)
					{
						Game.specialTabHovered=Game.specialTabs[i];
						Game.mousePointer=1;
						Game.CanClick=0;
						if (Game.Click)
						{
							if (Game.specialTab!=Game.specialTabs[i]) {Game.specialTab=Game.specialTabs[i];Game.ToggleSpecialMenu(1);PlaySound('snd/press.mp3');}
							else {Game.ToggleSpecialMenu(0);PlaySound('snd/press.mp3');}
							//PlaySound('snd/tick.mp3');
						}
					}
					
					y+=48;
				}
			}
		}
		
<<<<<<< HEAD:main.js
		Game.santaLevels=['一个节日测试管','节日装饰','节日花环','节日树','节日礼物','节日精灵胎儿','精灵小孩','精灵','年轻的精灵','庞大的精灵','尼克','圣诞老人','老圣诞老人','真正的圣诞老人','最后的圣诞老人'];
		Game.santaDrops=['增加愉快','改良愉快','一堆煤','发痒的毛衣','驯鹿烘烤场','加重雪橇','何蚝味糖霜','季节储蓄','玩具车间','淘气名单','圣诞老人的无底包','圣诞老人的帮手','圣诞老人的遗产','圣诞老人的牛奶和饼干'];
=======
		Game.santaLevels=['Festive test tube','Festive ornament','Festive wreath','Festive tree','Festive present','Festive elf fetus','Elf toddler','Elfling','Young elf','Bulky elf','Nick','Santa Claus','Elder Santa','True Santa','Final Claus'];
>>>>>>> 20180919:main.js
		for (var i in Game.santaDrops)//scale christmas upgrade prices with santa level
		{Game.Upgrades[Game.santaDrops[i]].priceFunc=function(){return Math.pow(3,Game.santaLevel)*2525;}}
		
		
		Game.UpgradeSanta=function()
		{
			var moni=Math.pow(Game.santaLevel+1,Game.santaLevel+1);
			if (Game.cookies>moni && Game.santaLevel<14)
			{
				PlaySound('snd/shimmerClick.mp3');
				
				Game.Spend(moni);
				Game.santaLevel=(Game.santaLevel+1)%15;
				if (Game.santaLevel==14)
				{
					Game.Unlock('圣诞老人的统治');
					if (Game.prefs.popups) Game.Popup('You are granted<br>圣诞老人的统治.');
					else Game.Notify('You are granted 圣诞老人的统治.','',Game.Upgrades['圣诞老人的统治'].icon);
				}
				var drops=[];
				for (var i in Game.santaDrops) {if (!Game.HasUnlocked(Game.santaDrops[i])) drops.push(Game.santaDrops[i]);}
				var drop=choose(drops);
				if (drop)
				{
					Game.Unlock(drop);
					if (Game.prefs.popups) Game.Popup('你找到包含的一份礼物...<br>'+drop+'!');
					else Game.Notify('找到一份礼物!','你找到包含的一份礼物...<br><b>'+drop+'</b>!',Game.Upgrades[drop].icon);
				}
				
				Game.ToggleSpecialMenu(1);
				
				if (l('specialPic')){var rect=l('specialPic').getBoundingClientRect();Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2);}
				
				if (Game.santaLevel>=6) Game.Win('来到城镇');
				if (Game.santaLevel>=14) Game.Win('所有的圣诞老人都欢呼');
				Game.recalculateGains=1;
				Game.upgradesToRebuild=1;
			}
		}
		
		Game.dragonLevels=[
			{name:'龙蛋',action:'芯片',pic:0,
				cost:function(){return Game.cookies>=1000000;},
				buy:function(){Game.Spend(1000000);},
				costStr:function(){return Beautify(1000000)+' 饼干';}},
			{name:'龙蛋',action:'芯片',pic:1,
				cost:function(){return Game.cookies>=1000000*2;},
				buy:function(){Game.Spend(1000000*2);},
				costStr:function(){return Beautify(1000000*2)+' 饼干';}},
			{name:'龙蛋',action:'芯片',pic:2,
				cost:function(){return Game.cookies>=1000000*4;},
				buy:function(){Game.Spend(1000000*4);},
				costStr:function(){return Beautify(1000000*4)+' 饼干';}},
			{name:'发抖的龙蛋',action:'孵化',pic:3,
				cost:function(){return Game.cookies>=1000000*8;},
				buy:function(){Game.Spend(1000000*8);},
				costStr:function(){return Beautify(1000000*8)+' 饼干';}},
			{name:'克鲁布洛，饼干孵化',action:'训练牛奶的气息<br><small>光环:小猫的效率提高了5%</small>',pic:4,
				cost:function(){return Game.cookies>=1000000*16;},
				buy:function(){Game.Spend(1000000*16);},
				costStr:function(){return Beautify(1000000*16)+' 饼干';}},
			{name:'克鲁布洛，饼干孵化',action:'训练龙之游标<br><small>光环:点击效果增加5%</small>',pic:4,
				cost:function(){return Game.Objects['Cursor'].amount>=100;},
				buy:function(){Game.Objects['Cursor'].sacrifice(100);},
				costStr:function(){return '100 游标';}},
			{name:'克鲁布洛，饼干孵化',action:'训练大队长老<br><small>光环:每一栋非奶奶楼都能得到 1% 的饼干秒产量</small>',pic:4,
				cost:function(){return Game.Objects['Grandma'].amount>=100;},
				buy:function(){Game.Objects['Grandma'].sacrifice(100);},
				costStr:function(){return '100 老奶奶';}},
			{name:'克鲁布洛，饼干孵化',action:'训练领域的收割者<br><small>光环:饼干可能触发龙之收获</small>',pic:4,
				cost:function(){return Game.Objects['Farm'].amount>=100;},
				buy:function(){Game.Objects['Farm'].sacrifice(100);},
				costStr:function(){return '100 农场';}},
			{name:'克鲁布洛，饼干龙',action:'训练地球毁灭者<br><small>光环:建筑以50%而不是25%的价格出售</small>',pic:5,
				cost:function(){return Game.Objects['Mine'].amount>=100;},
				buy:function(){Game.Objects['Mine'].sacrifice(100);},
				costStr:function(){return '100 矿山';}},
			{name:'克鲁布洛，饼干龙',action:'训练军械库大师<br><small>光环:所有的升级都要便宜2%</small>',pic:5,
				cost:function(){return Game.Objects['Factory'].amount>=100;},
				buy:function(){Game.Objects['Factory'].sacrifice(100);},
				costStr:function(){return '100 工厂';}},
			{name:'克鲁布洛，饼干龙',action:'训练激烈囤积<br><small>光环:所有的建筑都要便宜2%</small>',pic:5,
				cost:function(){return Game.Objects['Bank'].amount>=100;},
				buy:function(){Game.Objects['Bank'].sacrifice(100);},
				costStr:function(){return '100 银行';}},
			{name:'克鲁布洛，饼干龙',action:'训练龙神<br><small>光环:声望饼干每秒产量加成+ 5%</small>',pic:5,
				cost:function(){return Game.Objects['Temple'].amount>=100;},
				buy:function(){Game.Objects['Temple'].sacrifice(100);},
				costStr:function(){return '100 寺庙';}},
			{name:'克鲁布洛，饼干龙',action:'训练奥术光环<br><small>金色光环:黄金饼干出现几率增加 5%</small>',pic:5,
				cost:function(){return Game.Objects['Wizard tower'].amount>=100;},
				buy:function(){Game.Objects['Wizard tower'].sacrifice(100);},
				costStr:function(){return '100 精灵塔';}},
			{name:'克鲁布洛，饼干龙',action:'训练飞龙<br><small>光环:金色的饼干可能引发龙之飞舞</small>',pic:5,
				cost:function(){return Game.Objects['Shipment'].amount>=100;},
				buy:function(){Game.Objects['Shipment'].sacrifice(100);},
				costStr:function(){return '100 装船';}},
			{name:'克鲁布洛，饼干龙',action:'训练祖先的蜕变<br><small>光环:金色的饼干多给10%的饼干</small>',pic:5,
				cost:function(){return Game.Objects['Alchemy lab'].amount>=100;},
				buy:function(){Game.Objects['Alchemy lab'].sacrifice(100);},
				costStr:function(){return '100 alchemy labs';}},
			{name:'克鲁布洛，饼干龙',action:'训练邪恶统治<br><small>光环:愤怒的饼干会多给10%的饼干</small>',pic:5,
				cost:function(){return Game.Objects['Portal'].amount>=100;},
				buy:function(){Game.Objects['Portal'].sacrifice(100);},
				costStr:function(){return '100 传送门';}},
			{name:'克鲁布洛，饼干龙',action:'训练时代操纵者<br><small>光环:金色饼干的效果持续时间延长了5%</small>',pic:5,
				cost:function(){return Game.Objects['Time machine'].amount>=100;},
				buy:function(){Game.Objects['Time machine'].sacrifice(100);},
				costStr:function(){return '100 时光机器';}},
			{name:'克鲁布洛，饼干龙',action:'训练心灵控制物质<br><small>光环:+25%随机掉落</small>',pic:5,
				cost:function(){return Game.Objects['Antimatter condenser'].amount>=100;},
				buy:function(){Game.Objects['Antimatter condenser'].sacrifice(100);},
				costStr:function(){return '100 反物质冷凝器';}},
			{name:'克鲁布洛，饼干龙',action:'训练辐射食欲<br><small>光环:所有的饼干产量乘以2</small>',pic:5,
				cost:function(){return Game.Objects['Prism'].amount>=100;},
				buy:function(){Game.Objects['Prism'].sacrifice(100);},
				costStr:function(){return '100 棱镜';}},
			{name:'克鲁布洛，饼干龙',action:'训练龙的财富<br><small>光环:在同一屏幕上的每个黄金饼干增加123%的饼干秒产量</small>',pic:5,
				cost:function(){return Game.Objects['Chancemaker'].amount>=100;},
				buy:function(){Game.Objects['Chancemaker'].sacrifice(100);},
<<<<<<< HEAD:main.js
				costStr:function(){return '100 机会制造商';}},
			{name:'克鲁布洛，饼干龙',action:'烘烤龙饼干<br><small>美味!</small>',pic:6,
				cost:function(){var fail=0;for (var i in Game.Objects){if (Game.Objects[i].amount<50) fail=1;}return (fail==0);},
				buy:function(){for (var i in Game.Objects){Game.Objects[i].sacrifice(50);}Game.Unlock('龙形饼干');},
				costStr:function(){return '50 个每种建筑';}},
			{name:'克鲁布洛，饼干龙',action:'训练二次光环<br><small>您可以同时使用两个龙光环</small>',pic:6,
				cost:function(){var fail=0;for (var i in Game.Objects){if (Game.Objects[i].amount<200) fail=1;}return (fail==0);},
				buy:function(){for (var i in Game.Objects){Game.Objects[i].sacrifice(200);}},
				costStr:function(){return '200 个每种建筑';}},
			{name:'克鲁布洛，饼干龙',action:'你的龙训练有素.',pic:7}
		];
		
		Game.dragonAuras={
			0:{name:'No aura',pic:[0,7],desc:'从龙知道的光环中选择一个。'},
			1:{name:'牛奶的气息',pic:[18,25],desc:'小猫工作效率提高 <b>5%</b>。'},
			2:{name:'Dragon Cursor',pic:[0,25],desc:'点击效率提高 <b>5%</b>。'},
			3:{name:'Elder Battalion',pic:[1,25],desc:'每个非老奶奶建筑，可以让老奶奶获得 <b>+1% 饼干每秒产量</b>。'},
			4:{name:'Reaper of Fields',pic:[2,25],desc:'黄金饼干可能触发 <b>龙之收获</b>.'},
			5:{name:'Earth Shatterer',pic:[3,25],desc:'建筑物的售价为<b> 50％</b>而不是25％。'},
			6:{name:'Master of the Armory',pic:[4,25],desc:'所有升级费用降低 <b>2%</b>。'},
			7:{name:'激烈囤积',pic:[15,25],desc:'所有建筑成本便宜 <b>2%</b> 。'},
			8:{name:'Dragon God',pic:[16,25],desc:'声望带来的饼干每秒产量提高 <b>+5%</b>.'},
			9:{name:'奥术光环',pic:[17,25],desc:'黄金饼干出现频率增加 <b>+5%</b> 。'},
			10:{name:'龙之飞舞',pic:[5,25],desc:'黄金饼干可能触发 <b>龙之飞舞</b>。'},
			11:{name:'Ancestral Metamorphosis',pic:[6,25],desc:'黄金饼干带给你的饼干增加 <b>10%</b>。'},
			12:{name:'Unholy Dominion',pic:[7,25],desc:'愤怒的饼干带给你的饼干增加 <b>10%</b> 。'},
			13:{name:'Epoch Manipulator',pic:[8,25],desc:'黄金饼干持续时间增加 <b>5%</b>。'},
			14:{name:'Mind Over Matter',pic:[13,25],desc:'随机掉落频率增加 <b>25%</b>.'},
			15:{name:'Radiant Appetite',pic:[14,25],desc:'所有饼干生产 <b>翻倍</b>.'},
			16:{name:'Dragon\'s Fortune',pic:[19,25],desc:'屏幕上的每个黄金饼干都会增加 <b>+123% 饼干每秒产量</b>，乘法的'},
=======
				costStr:function(){return '100 chancemakers';}},
			{name:'Krumblor, cookie dragon',action:'Train Dragon\'s Curve<br><small>Aura : sugar lumps grow 5% faster, 50% weirder</small>',pic:5,
				cost:function(){return Game.Objects['Fractal engine'].amount>=100;},
				buy:function(){Game.Objects['Fractal engine'].sacrifice(100);},
				costStr:function(){return '100 fractal engines';}},
			{name:'Krumblor, cookie dragon',action:'Bake dragon cookie<br><small>Delicious!</small>',pic:6,
				cost:function(){var fail=0;for (var i in Game.Objects){if (Game.Objects[i].amount<50) fail=1;}return (fail==0);},
				buy:function(){for (var i in Game.Objects){Game.Objects[i].sacrifice(50);}Game.Unlock('Dragon cookie');},
				costStr:function(){return '50 of every building';}},
			{name:'Krumblor, cookie dragon',action:'Train secondary aura<br><small>Lets you use two dragon auras simultaneously</small>',pic:7,
				cost:function(){var fail=0;for (var i in Game.Objects){if (Game.Objects[i].amount<200) fail=1;}return (fail==0);},
				buy:function(){for (var i in Game.Objects){Game.Objects[i].sacrifice(200);}},
				costStr:function(){return '200 of every building';}},
			{name:'Krumblor, cookie dragon',action:'Your dragon is fully trained.',pic:8}
		];
		
		Game.dragonAuras={
			0:{name:'No aura',pic:[0,7],desc:'Select an aura from those your dragon knows.'},
			1:{name:'Breath of Milk',pic:[18,25],desc:'Kittens are <b>5%</b> more effective.'},
			2:{name:'Dragon Cursor',pic:[0,25],desc:'Clicking is <b>5%</b> more effective.'},
			3:{name:'Elder Battalion',pic:[1,25],desc:'Grandmas gain <b>+1% CpS</b> for every non-grandma building.'},
			4:{name:'Reaper of Fields',pic:[2,25],desc:'Golden cookies may trigger a <b>Dragon Harvest</b>.'},
			5:{name:'Earth Shatterer',pic:[3,25],desc:'Buildings sell back for <b>50%</b> instead of 25%.'},
			6:{name:'Master of the Armory',pic:[4,25],desc:'All upgrades are <b>2%</b> cheaper.'},
			7:{name:'Fierce Hoarder',pic:[15,25],desc:'All buildings are <b>2%</b> cheaper.'},
			8:{name:'Dragon God',pic:[16,25],desc:'Prestige CpS bonus <b>+5%</b>.'},
			9:{name:'Arcane Aura',pic:[17,25],desc:'Golden cookies appear <b>+5%</b> more often.'},
			10:{name:'Dragonflight',pic:[5,25],desc:'Golden cookies may trigger a <b>Dragonflight</b>.'},
			11:{name:'Ancestral Metamorphosis',pic:[6,25],desc:'Golden cookies give <b>10%</b> more cookies.'},
			12:{name:'Unholy Dominion',pic:[7,25],desc:'Wrath cookies give <b>10%</b> more cookies.'},
			13:{name:'Epoch Manipulator',pic:[8,25],desc:'Golden cookies last <b>5%</b> longer.'},
			14:{name:'Mind Over Matter',pic:[13,25],desc:'Random drops are <b>25% more common</b>.'},
			15:{name:'Radiant Appetite',pic:[14,25],desc:'All cookie production <b>multiplied by 2</b>.'},
			16:{name:'Dragon\'s Fortune',pic:[19,25],desc:'<b>+123% CpS</b> per golden cookie on-screen, multiplicative.'},
			17:{name:'Dragon\'s Curve',pic:[20,25],desc:'<b>+5% sugar lump growth</b> and sugar lumps are <b>twice as likely</b> to be unusual.'},
>>>>>>> 20180919:main.js
		};
		
		Game.hasAura=function(what)
		{
			if (Game.dragonAuras[Game.dragonAura].name==what || Game.dragonAuras[Game.dragonAura2].name==what) return true; else return false;
		}
		
		Game.SelectDragonAura=function(slot,update)
		{	
			var currentAura=0;
			var otherAura=0;
			if (slot==0) currentAura=Game.dragonAura; else currentAura=Game.dragonAura2;
			if (slot==0) otherAura=Game.dragonAura2; else otherAura=Game.dragonAura;
			if (!update) Game.SelectingDragonAura=currentAura;
			
			var str='';
			for (var i in Game.dragonAuras)
			{
				if (Game.dragonLevel>=parseInt(i)+4)
				{
					var icon=Game.dragonAuras[i].pic;
					if (i==0 || i!=otherAura) str+='<div class="crate enabled'+(i==Game.SelectingDragonAura?' highlighted':'')+'" style="opacity:1;float:none;display:inline-block;'+(icon[2]?'background-image:url('+icon[2]+');':'')+'background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;" '+Game.clickStr+'="PlaySound(\'snd/tick.mp3\');Game.SetDragonAura('+i+','+slot+');" onMouseOut="Game.DescribeDragonAura('+Game.SelectingDragonAura+');" onMouseOver="Game.DescribeDragonAura('+i+');"'+
					'></div>';
				}
			}
			
			var highestBuilding=0;
			for (var i in Game.Objects) {if (Game.Objects[i].amount>0) highestBuilding=Game.Objects[i];}
			
			Game.Prompt('<h3>设置你的龙的 '+(slot==1?'次要的 ':'')+'光环</h3>'+
						'<div class="line"></div>'+
						'<div id="dragonAuraInfo" style="min-height:60px;"></div>'+
						'<div style="text-align:center;">'+str+'</div>'+
						'<div class="line"></div>'+
						'<div style="text-align:center;margin-bottom:8px;">'+(highestBuilding==0?'转换你的光环是 <b>免费的</b> ，因为你没有建筑。':'改变你的光环的代价是 <b>1 '+cndisplayname(highestBuilding.name)+'</b>.<br>这会影响到你的饼干每秒产量！')+'</div>'
						,[['确定',(slot==0?'Game.dragonAura':'Game.dragonAura2')+'=Game.SelectingDragonAura;'+(highestBuilding==0 || currentAura==Game.SelectingDragonAura?'':'Game.ObjectsById['+highestBuilding.id+'].sacrifice(1);')+'Game.ToggleSpecialMenu(1);Game.ClosePrompt();'],'取消'],0,'widePrompt');
			Game.DescribeDragonAura(Game.SelectingDragonAura);
		}
		Game.SelectingDragonAura=-1;
		Game.SetDragonAura=function(aura,slot)
		{
			Game.SelectingDragonAura=aura;
			Game.SelectDragonAura(slot,1);
		}
		Game.DescribeDragonAura=function(aura)
		{
			l('dragonAuraInfo').innerHTML=
			'<div style="min-width:200px;text-align:center;"><h4>'+Game.dragonAuras[aura].name+'</h4>'+
			'<div class="line"></div>'+
			Game.dragonAuras[aura].desc+
			'</div>';
		}
		
		Game.UpgradeDragon=function()
		{
			if (Game.dragonLevel<Game.dragonLevels.length-1 && Game.dragonLevels[Game.dragonLevel].cost())
			{
				PlaySound('snd/shimmerClick.mp3');
				Game.dragonLevels[Game.dragonLevel].buy();
				Game.dragonLevel=(Game.dragonLevel+1)%Game.dragonLevels.length;
				
				if (Game.dragonLevel>=Game.dragonLevels.length-1) Game.Win('这就是龙');
				Game.ToggleSpecialMenu(1);
				if (l('specialPic')){var rect=l('specialPic').getBoundingClientRect();Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2);}
				Game.recalculateGains=1;
				Game.upgradesToRebuild=1;
			}
		}
		
		Game.ToggleSpecialMenu=function(on)
		{
			if (on)
			{
				var pic='';
				var frame=0;
				if (Game.specialTab=='santa') {pic='santa.png';frame=Game.santaLevel;}
				else if (Game.specialTab=='dragon') {pic='dragon.png?v='+Game.version;frame=Game.dragonLevels[Game.dragonLevel].pic;}
				else {pic='dragon.png?v='+Game.version;frame=4;}
				
				var str='<div id="specialPic" style="position:absolute;left:-16px;top:-64px;width:96px;height:96px;background:url(img/'+pic+');background-position:'+(-frame*96)+'px 0px;filter:drop-shadow(0px 3px 2px #000);-webkit-filter:drop-shadow(0px 3px 2px #000);"></div>';
				str+='<div class="close" onclick="PlaySound(\'snd/press.mp3\');Game.ToggleSpecialMenu(0);">x</div>';
				
				if (Game.specialTab=='santa')
				{
					var moni=Math.pow(Game.santaLevel+1,Game.santaLevel+1);
					
					str+='<h3>'+Game.santaLevels[Game.santaLevel]+'</h3>';
					if (Game.santaLevel<14)
					{
						str+='<div class="line"></div>'+
						'<div class="optionBox" style="margin-bottom:0px;"><a class="option framed large title" '+Game.clickStr+'="Game.UpgradeSanta();">'+
							'<div style="display:table-cell;vertical-align:middle;">进化</div>'+
							'<div style="display:table-cell;vertical-align:middle;padding:4px 12px;">|</div>'+
							'<div style="display:table-cell;vertical-align:middle;font-size:65%;">成本 :<div'+(Game.cookies>moni?'':' style="color:#777;"')+'>'+Beautify(Math.pow(Game.santaLevel+1,Game.santaLevel+1))+' '+(Game.santaLevel>0?'饼干':'饼干')+'</div></div>'+
						'</a></div>';
					}
				}
				else if (Game.specialTab=='dragon')
				{
					var level=Game.dragonLevels[Game.dragonLevel];
				
					str+='<h3>'+level.name+'</h3>';
					
					if (Game.dragonLevel>=5)
					{
						var icon=Game.dragonAuras[Game.dragonAura].pic;
						str+='<div class="crate enabled" style="opacity:1;position:absolute;right:18px;top:-58px;'+(icon[2]?'background-image:url('+icon[2]+');':'')+'background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;" '+Game.clickStr+'="PlaySound(\'snd/tick.mp3\');Game.SelectDragonAura(0);" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;"><h4>'+Game.dragonAuras[Game.dragonAura].name+'</h4>'+
							'<div class="line"></div>'+
							Game.dragonAuras[Game.dragonAura].desc+
							'</div>'
						,'top')+
						'></div>';
					}
					if (Game.dragonLevel>=23)
					{
						var icon=Game.dragonAuras[Game.dragonAura2].pic;
						str+='<div class="crate enabled" style="opacity:1;position:absolute;right:80px;top:-58px;'+(icon[2]?'background-image:url('+icon[2]+');':'')+'background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;" '+Game.clickStr+'="PlaySound(\'snd/tick.mp3\');Game.SelectDragonAura(1);" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;"><h4>'+Game.dragonAuras[Game.dragonAura2].name+'</h4>'+
							'<div class="line"></div>'+
							Game.dragonAuras[Game.dragonAura2].desc+
							'</div>'
						,'top')+
						'></div>';
					}
					
					if (Game.dragonLevel<Game.dragonLevels.length-1)
					{
						str+='<div class="line"></div>'+
						'<div class="optionBox" style="margin-bottom:0px;"><a class="option framed large title" '+Game.clickStr+'="Game.UpgradeDragon();">'+
							'<div style="display:table-cell;vertical-align:middle;">'+level.action+'</div>'+
							'<div style="display:table-cell;vertical-align:middle;padding:4px 12px;">|</div>'+
							'<div style="display:table-cell;vertical-align:middle;font-size:65%;">sacrifice<div'+(level.cost()?'':' style="color:#777;"')+'>'+level.costStr()+'</div></div>'+
						'</a></div>';
					}
					else
					{
						str+='<div class="line"></div>'+
						'<div style="text-align:center;margin-bottom:4px;">'+level.action+'</div>';
					}
				}
				
				l('specialPopup').innerHTML=str;
				
				l('specialPopup').className='framed prompt onScreen';
			}
			else
			{
				if (Game.specialTab!='')
				{
					Game.specialTab='';
					l('specialPopup').className='framed prompt offScreen';
					setTimeout(function(){if (Game.specialTab=='') {/*l('specialPopup').style.display='none';*/l('specialPopup').innerHTML='';}},1000*0.2);
				}
			}
		}
		Game.DrawSpecial=function()
		{
			var len=Game.specialTabs.length;
			if (len==0) return;
			Game.LeftBackground.globalAlpha=1;
			var y=Game.LeftBackground.canvas.height-24-48*len;
			var tabI=0;
			
			for (var i in Game.specialTabs)
			{
				var selected=0;
				var hovered=0;
				if (Game.specialTab==Game.specialTabs[i]) selected=1;
				if (Game.specialTabHovered==Game.specialTabs[i]) hovered=1;
				var x=24;
				var s=1;
				var pic='';
				var frame=0;
				if (hovered) {s=1;x=24;}
				if (selected) {s=1;x=48;}
				
				if (Game.specialTabs[i]=='santa') {pic='santa.png';frame=Game.santaLevel;}
				else if (Game.specialTabs[i]=='dragon') {pic='dragon.png?v='+Game.version;frame=Game.dragonLevels[Game.dragonLevel].pic;}
				else {pic='dragon.png?v='+Game.version;frame=4;}
				
				if (hovered || selected)
				{
					var ss=s*64;
					var r=Math.floor((Game.T*0.5)%360);
					Game.LeftBackground.save();
					Game.LeftBackground.translate(x,y);
					if (Game.prefs.fancy) Game.LeftBackground.rotate((r/360)*Math.PI*2);
					Game.LeftBackground.globalAlpha=0.75;
					Game.LeftBackground.drawImage(Pic('shine.png'),-ss/2,-ss/2,ss,ss);
					Game.LeftBackground.restore();
				}
				
				if (Game.prefs.fancy) Game.LeftBackground.drawImage(Pic(pic),96*frame,0,96,96,(x+(selected?0:Math.sin(Game.T*0.2+tabI)*3)-24*s),(y-(selected?6:Math.abs(Math.cos(Game.T*0.2+tabI))*6)-24*s),48*s,48*s);
				else Game.LeftBackground.drawImage(Pic(pic),96*frame,0,96,96,(x-24*s),(y-24*s),48*s,48*s);
				
				tabI++;
				y+=48;
			}
			
		}
		
		/*=====================================================================================
		VISUAL EFFECTS
		=======================================================================================*/
		
		Game.Milks=[
<<<<<<< HEAD:main.js
			{name:'等级 I - 纯牛奶',pic:'milkPlain',icon:[1,8]},
			{name:'等级 II - 巧克力牛奶',pic:'milkChocolate',icon:[2,8]},
			{name:'等级 III - 树莓牛奶',pic:'milkRaspberry',icon:[3,8]},
			{name:'等级 IV - 橙汁牛奶',pic:'milkOrange',icon:[4,8]},
			{name:'等级 V - 焦糖牛奶',pic:'milkCaramel',icon:[5,8]},
			{name:'等级 VI - 香蕉牛奶',pic:'milkBanana',icon:[6,8]},
			{name:'等级 VII - 石灰牛奶',pic:'milkLime',icon:[7,8]},
			{name:'等级 VIII - 蓝莓牛奶',pic:'milkBlueberry',icon:[8,8]},
			{name:'等级 IX - 草莓牛奶',pic:'milkStrawberry',icon:[9,8]},
			{name:'等级 X - 香草牛奶',pic:'milkVanilla',icon:[10,8]},
			{name:'等级 XI - 蜂蜜牛奶',pic:'milkHoney',icon:[21,23]},
			{name:'等级 XII - 咖啡牛奶',pic:'milkCoffee',icon:[22,23]},
			{name:'等级 XIII - 加茶牛奶',pic:'milkTea',icon:[23,23]},
			{name:'等级 XIV - 椰子牛奶',pic:'milkCoconut',icon:[24,23]},
			{name:'等级 XV - 樱桃牛奶',pic:'milkCherry',icon:[25,23]},
			{name:'等级 XVI - 香料牛奶',pic:'milkSpiced',icon:[26,23]},
=======
			{name:'Rank I - Plain milk',pic:'milkPlain',icon:[1,8]},
			{name:'Rank II - Chocolate milk',pic:'milkChocolate',icon:[2,8]},
			{name:'Rank III - Raspberry milk',pic:'milkRaspberry',icon:[3,8]},
			{name:'Rank IV - Orange milk',pic:'milkOrange',icon:[4,8]},
			{name:'Rank V - Caramel milk',pic:'milkCaramel',icon:[5,8]},
			{name:'Rank VI - Banana milk',pic:'milkBanana',icon:[6,8]},
			{name:'Rank VII - Lime milk',pic:'milkLime',icon:[7,8]},
			{name:'Rank VIII - Blueberry milk',pic:'milkBlueberry',icon:[8,8]},
			{name:'Rank IX - Strawberry milk',pic:'milkStrawberry',icon:[9,8]},
			{name:'Rank X - Vanilla milk',pic:'milkVanilla',icon:[10,8]},
			{name:'Rank XI - Honey milk',pic:'milkHoney',icon:[21,23]},
			{name:'Rank XII - Coffee milk',pic:'milkCoffee',icon:[22,23]},
			{name:'Rank XIII - Tea with a spot of milk',pic:'milkTea',icon:[23,23]},
			{name:'Rank XIV - Coconut milk',pic:'milkCoconut',icon:[24,23]},
			{name:'Rank XV - Cherry milk',pic:'milkCherry',icon:[25,23]},
			{name:'Rank XVI - Spiced milk',pic:'milkSpiced',icon:[26,23]},
			{name:'Rank XVII - Maple milk',pic:'milkMaple',icon:[28,23]},
>>>>>>> 20180919:main.js
		];
		Game.Milk=Game.Milks[0];
	
		Game.mousePointer=0;//when 1, draw the mouse as a pointer on the left screen
		
		Game.cookieOriginX=0;
		Game.cookieOriginY=0;
		Game.DrawBackground=function()
		{
			
			Timer.clean();
			//background
			if (!Game.Background)//init some stuff
			{
				Game.Background=l('backgroundCanvas').getContext('2d');
				Game.Background.canvas.width=Game.Background.canvas.parentNode.offsetWidth;
				Game.Background.canvas.height=Game.Background.canvas.parentNode.offsetHeight;
				Game.LeftBackground=l('backgroundLeftCanvas').getContext('2d');
				Game.LeftBackground.canvas.width=Game.LeftBackground.canvas.parentNode.offsetWidth;
				Game.LeftBackground.canvas.height=Game.LeftBackground.canvas.parentNode.offsetHeight;
					//preload ascend animation bits so they show up instantly
					Game.LeftBackground.globalAlpha=0;
					Game.LeftBackground.drawImage(Pic('brokenCookie.png'),0,0);
					Game.LeftBackground.drawImage(Pic('brokenCookieHalo.png'),0,0);
					Game.LeftBackground.drawImage(Pic('starbg.jpg'),0,0);
				
				window.addEventListener('resize', function(event)
				{
					Game.Background.canvas.width=Game.Background.canvas.parentNode.offsetWidth;
					Game.Background.canvas.height=Game.Background.canvas.parentNode.offsetHeight;
					Game.LeftBackground.canvas.width=Game.LeftBackground.canvas.parentNode.offsetWidth;
					Game.LeftBackground.canvas.height=Game.LeftBackground.canvas.parentNode.offsetHeight;
				});
			}
			
			var ctx=Game.LeftBackground;
			
			if (Game.OnAscend)
			{
				Timer.clean();
				//starry background on ascend screen
				var w=Game.Background.canvas.width;
				var h=Game.Background.canvas.height;
				var b=Game.ascendl.getBoundingClientRect();
				var x=(b.left+b.right)/2;
				var y=(b.top+b.bottom)/2;
				Game.Background.globalAlpha=0.5;
				var s=1*Game.AscendZoom*(1+Math.cos(Game.T*0.0027)*0.05);
				Game.Background.fillPattern(Pic('starbg.jpg'),0,0,w,h,1024*s,1024*s,x+Game.AscendOffX*0.25*s,y+Game.AscendOffY*0.25*s);
				Timer.track('star layer 1');
				if (Game.prefs.fancy)
				{
					//additional star layer
					Game.Background.globalAlpha=0.5*(0.5+Math.sin(Game.T*0.02)*0.3);
					var s=2*Game.AscendZoom*(1+Math.sin(Game.T*0.002)*0.07);
					//Game.Background.globalCompositeOperation='lighter';
					Game.Background.fillPattern(Pic('starbg.jpg'),0,0,w,h,1024*s,1024*s,x+Game.AscendOffX*0.25*s,y+Game.AscendOffY*0.25*s);
					//Game.Background.globalCompositeOperation='source-over';
					Timer.track('star layer 2');
					
					x=x+Game.AscendOffX*Game.AscendZoom;
					y=y+Game.AscendOffY*Game.AscendZoom;
					//wispy nebula around the center
					Game.Background.save();
					Game.Background.globalAlpha=0.5;
					Game.Background.translate(x,y);
					Game.Background.globalCompositeOperation='lighter';
					Game.Background.rotate(Game.T*0.001);
					s=(600+150*Math.sin(Game.T*0.007))*Game.AscendZoom;
					Game.Background.drawImage(Pic('heavenRing1.jpg'),-s/2,-s/2,s,s);
					Game.Background.rotate(-Game.T*0.0017);
					s=(600+150*Math.sin(Game.T*0.0037))*Game.AscendZoom;
					Game.Background.drawImage(Pic('heavenRing2.jpg'),-s/2,-s/2,s,s);
					Game.Background.restore();
					Timer.track('nebula');
					
					/*
					//links between upgrades
					//not in because I am bad at this
					Game.Background.globalAlpha=1;
					Game.Background.save();
					Game.Background.translate(x,y);
					s=(32)*Game.AscendZoom;
					
					for (var i in Game.PrestigeUpgrades)
					{
						var me=Game.PrestigeUpgrades[i];
						var ghosted=0;
						if (me.canBePurchased || Game.Has('神经占卜')){}
						else
						{
							for (var ii in me.parents){if (me.parents[ii]!=-1 && me.parents[ii].canBePurchased) ghosted=1;}
						}
						for (var ii in me.parents)//create pulsing links
						{
							if (me.parents[ii]!=-1 && (me.canBePurchased || ghosted))
							{
								var origX=0;
								var origY=0;
								var targX=me.posX+28;
								var targY=me.posY+28;
								if (me.parents[ii]!=-1) {origX=me.parents[ii].posX+28;origY=me.parents[ii].posY+28;}
								var rot=-Math.atan((targY-origY)/(origX-targX));
								if (targX<=origX) rot+=180;
								var dist=Math.floor(Math.sqrt((targX-origX)*(targX-origX)+(targY-origY)*(targY-origY)));
								origX+=2;
								origY-=18;
								//rot=-(Math.PI/2)*(me.id%4);
								Game.Background.translate(origX,origY);
								Game.Background.rotate(rot);
								//Game.Background.drawImage(Pic('linkPulse.png'),-s/2,-s/2,s,s);
								Game.Background.fillPattern(Pic('linkPulse.png'),0,-4,dist,8,32,8);
								Game.Background.rotate(-rot);
								Game.Background.translate(-origX,-origY);
							}
						}
					}
					Game.Background.restore();
					Timer.track('links');
					*/
					
					//Game.Background.drawImage(Pic('shadedBorders.png'),0,0,w,h);
					//Timer.track('border');
				}
			}
			else
			{
			
				var goodBuff=0;
				var badBuff=0;
				for (var i in Game.buffs)
				{
					if (Game.buffs[i].aura==1) goodBuff=1;
					if (Game.buffs[i].aura==2) badBuff=1;
				}
				
				if (Game.drawT%5==0)
				{
					Game.defaultBg='bgBlue';
					Game.bgR=0;
					
					if (Game.season=='fools') Game.defaultBg='bgMoney';
					if (Game.elderWrathD<1)
					{
						Game.bgR=0;
						Game.bg=Game.defaultBg;
						Game.bgFade=Game.defaultBg;
					}
					else if (Game.elderWrathD>=1 && Game.elderWrathD<2)
					{
						Game.bgR=(Game.elderWrathD-1)/1;
						Game.bg=Game.defaultBg;
						Game.bgFade='grandmas1';
					}
					else if (Game.elderWrathD>=2 && Game.elderWrathD<3)
					{
						Game.bgR=(Game.elderWrathD-2)/1;
						Game.bg='grandmas1';
						Game.bgFade='grandmas2';
					}
					else if (Game.elderWrathD>=3)// && Game.elderWrathD<4)
					{
						Game.bgR=(Game.elderWrathD-3)/1;
						Game.bg='grandmas2';
						Game.bgFade='grandmas3';
					}
					
					if (Game.bgType!=0 && Game.ascensionMode!=1)
					{
						Game.bgR=0;
						Game.bg=Game.BGsByChoice[Game.bgType].pic;
						Game.bgFade=Game.bg;
					}
					
					Game.Background.fillPattern(Pic(Game.bg+'.jpg'),0,0,Game.Background.canvas.width,Game.Background.canvas.height,512,512,0,0);
					if (Game.bgR>0)
					{
						Game.Background.globalAlpha=Game.bgR;
						Game.Background.fillPattern(Pic(Game.bgFade+'.jpg'),0,0,Game.Background.canvas.width,Game.Background.canvas.height,512,512,0,0);
					}
					Game.Background.globalAlpha=1;
					Game.Background.drawImage(Pic('shadedBordersSoft.png'),0,0,Game.Background.canvas.width,Game.Background.canvas.height);
					
				}
				Timer.track('window background');
				
				//clear
				ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
				/*if (Game.AscendTimer<Game.AscendBreakpoint) ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
				else
				{
					ctx.globalAlpha=0.05;
					ctx.fillStyle='#000';
					ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
					ctx.globalAlpha=1;
					OldCanvasDrawImage.apply(ctx,[ctx.canvas,Math.random()*4-2,Math.random()*4-2-4]);
					ctx.globalAlpha=1;
				}*/
				Timer.clean();
				
				var showDragon=0;
				if (Game.hasBuff('龙之飞舞') || Game.hasBuff('龙之收获')) showDragon=1;
				
				Game.cookieOriginX=Math.floor(ctx.canvas.width/2);
				Game.cookieOriginY=Math.floor(ctx.canvas.height*0.4);
				
				if (Game.AscendTimer==0)
				{	
					if (Game.prefs.particles)
					{
						//falling cookies
						var pic='';
						var opacity=1;
						if (Game.elderWrathD<=1.5)
						{
							if (Game.cookiesPs>=1000) pic='cookieShower3.png';
							else if (Game.cookiesPs>=500) pic='cookieShower2.png';
							else if (Game.cookiesPs>=50) pic='cookieShower1.png';
							else pic='';
						}
						if (pic!='')
						{
							if (Game.elderWrathD>=1) opacity=1-((Math.min(Game.elderWrathD,1.5)-1)/0.5);
							ctx.globalAlpha=opacity;
							var y=(Math.floor(Game.T*2)%512);
							ctx.fillPattern(Pic(pic),0,0,ctx.canvas.width,ctx.canvas.height+512,512,512,0,y);
							ctx.globalAlpha=1;
						}
						//snow
						if (Game.season=='christmas')
						{
							var y=(Math.floor(Game.T*2.5)%512);
							ctx.globalAlpha=0.75;
							ctx.globalCompositeOperation='lighter';
							ctx.fillPattern(Pic('snow2.jpg'),0,0,ctx.canvas.width,ctx.canvas.height+512,512,512,0,y);
							ctx.globalCompositeOperation='source-over';
							ctx.globalAlpha=1;
						}
						//hearts
						if (Game.season=='valentines')
						{
							var y=(Math.floor(Game.T*2.5)%512);
							ctx.globalAlpha=1;
							ctx.fillPattern(Pic('heartStorm.png'),0,0,ctx.canvas.width,ctx.canvas.height+512,512,512,0,y);
							ctx.globalAlpha=1;
						}
						Timer.track('left background');
						
						Game.particlesDraw(0);
						ctx.globalAlpha=1;
						Timer.track('particles');
						
						//big cookie shine
						var s=512;
						
						var x=Game.cookieOriginX;
						var y=Game.cookieOriginY;
						
						var r=Math.floor((Game.T*0.5)%360);
						ctx.save();
						ctx.translate(x,y);
						ctx.rotate((r/360)*Math.PI*2);
						var alphaMult=1;
						if (Game.bgType==2 || Game.bgType==4) alphaMult=0.5;
						var pic='shine.png';
						if (goodBuff) {pic='shineGold.png';alphaMult=1;}
						else if (badBuff) {pic='shineRed.png';alphaMult=1;}
						if (goodBuff && Game.prefs.fancy) ctx.globalCompositeOperation='lighter';
						ctx.globalAlpha=0.5*alphaMult;
						ctx.drawImage(Pic(pic),-s/2,-s/2,s,s);
						ctx.rotate((-r*2/360)*Math.PI*2);
						ctx.globalAlpha=0.25*alphaMult;
						ctx.drawImage(Pic(pic),-s/2,-s/2,s,s);
						ctx.restore();
						Timer.track('shine');
				
						if (Game.ReincarnateTimer>0)
						{
							ctx.globalAlpha=1-Game.ReincarnateTimer/Game.ReincarnateDuration;
							ctx.fillStyle='#000';
							ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
							ctx.globalAlpha=1;
						}
						
						if (showDragon)
						{
							//big dragon
							var s=300*2*(1+Math.sin(Game.T*0.013)*0.1);
							var x=Game.cookieOriginX-s/2;
							var y=Game.cookieOriginY-s/(1.4+0.2*Math.sin(Game.T*0.01));
							ctx.drawImage(Pic('dragonBG.png'),x,y,s,s);
						}
						
						//big cookie
						if (false)//don't do that
						{
							ctx.globalAlpha=1;
							var amount=Math.floor(Game.cookies).toString();
							var digits=amount.length;
							var space=0;
							for (var i=0;i<digits;i++)
							{
								var s=16*(digits-i);
								var num=parseInt(amount[i]);
								if (i>0) space-=s*(1-num/10)/2;
								if (i==0 && num>1) space+=s*0.1;
								for (var ii=0;ii<num;ii++)
								{
									var x=Game.cookieOriginX;
									var y=Game.cookieOriginY;
									var spin=Game.T*(0.005+i*0.001)+i+(ii/num)*Math.PI*2;
									x+=Math.sin(spin)*space;
									y+=Math.cos(spin)*space;
									ctx.drawImage(Pic('perfectCookie.png'),x-s/2,y-s/2,s,s);
								}
								space+=s/2;
							}
						}
						else
						{
							ctx.globalAlpha=1;
							var s=256*Game.BigCookieSize;
							var x=Game.cookieOriginX;
							var y=Game.cookieOriginY;
							ctx.save();
							ctx.translate(x,y);
							if (Game.season=='easter')
							{
								var nestW=304*0.98*Game.BigCookieSize;
								var nestH=161*0.98*Game.BigCookieSize;
								ctx.drawImage(Pic('nest.png'),-nestW/2,-nestH/2+130,nestW,nestH);
							}
							//ctx.rotate(((Game.startDate%360)/360)*Math.PI*2);
							ctx.drawImage(Pic('perfectCookie.png'),-s/2,-s/2,s,s);
							
							if (goodBuff && Game.prefs.particles)//sparkle
							{
								ctx.globalCompositeOperation='lighter';
								for (var i=0;i<1;i++)
								{
									ctx.globalAlpha=Math.random()*0.65+0.1;
									var size=Math.random()*30+5;
									var a=Math.random()*Math.PI*2;
									var d=s*0.9*Math.random()/2;
									ctx.drawImage(Pic('glint.jpg'),-size/2+Math.sin(a)*d,-size/2+Math.cos(a)*d,size,size);
								}
							}
							
							ctx.restore();
							Timer.track('big cookie');
						}
					}
					else//no particles
					{
						//big cookie shine
						var s=512;
						var x=Game.cookieOriginX-s/2;
						var y=Game.cookieOriginY-s/2;
						ctx.globalAlpha=0.5;
						ctx.drawImage(Pic('shine.png'),x,y,s,s);
						
						if (showDragon)
						{
							//big dragon
							var s=300*2*(1+Math.sin(Game.T*0.013)*0.1);
							var x=Game.cookieOriginX-s/2;
							var y=Game.cookieOriginY-s/(1.4+0.2*Math.sin(Game.T*0.01));
							ctx.drawImage(Pic('dragonBG.png'),x,y,s,s);
						}
					
						//big cookie
						ctx.globalAlpha=1;
						var s=256*Game.BigCookieSize;
						var x=Game.cookieOriginX-s/2;
						var y=Game.cookieOriginY-s/2;
						ctx.drawImage(Pic('perfectCookie.png'),x,y,s,s);
					}
					
					//cursors
					if (Game.prefs.cursors)
					{
						ctx.save();
						ctx.translate(Game.cookieOriginX,Game.cookieOriginY);
						var pic=Pic('cursor.png');
						var fancy=Game.prefs.fancy;
						
						if (showDragon) ctx.globalAlpha=0.25;
						var amount=Game.Objects['Cursor'].amount;
						//var spe=-1;
						for (var i=0;i<amount;i++)
						{
							var n=Math.floor(i/50);
							//var a=((i+0.5*n)%50)/50;
							var w=0;
							if (fancy) w=(Math.sin(Game.T*0.025+(((i+n*12)%25)/25)*Math.PI*2));
							if (w>0.997) w=1.5;
							else if (w>0.994) w=0.5;
							else w=0;
							w*=-4;
							if (fancy) w+=Math.sin((n+Game.T*0.01)*Math.PI/2)*4;
							var x=0;
							var y=(140/* *Game.BigCookieSize*/+n*16+w)-16;
							
							var rot=7.2;//(1/50)*360
							if (i==0 && fancy) rot-=Game.T*0.1;
							if (i%50==0) rot+=7.2/2;
							ctx.rotate((rot/360)*Math.PI*2);
							ctx.drawImage(pic,0,0,32,32,x,y,32,32);
							//ctx.drawImage(pic,32*(i==spe),0,32,32,x,y,32,32);
							
							/*if (i==spe)
							{
								y+=16;
								x=Game.cookieOriginX+Math.sin(-((r-5)/360)*Math.PI*2)*y;
								y=Game.cookieOriginY+Math.cos(-((r-5)/360)*Math.PI*2)*y;
								if (Game.CanClick && ctx && Math.abs(Game.mouseX-x)<16 && Math.abs(Game.mouseY-y)<16) Game.mousePointer=1;
							}*/
						}
						ctx.restore();
						Timer.track('cursors');
					}
				}
				else
				{
					var tBase=Math.max(0,(Game.AscendTimer-Game.AscendBreakpoint)/(Game.AscendDuration-Game.AscendBreakpoint));
					//big crumbling cookie
					//var t=(3*Math.pow(tBase,2)-2*Math.pow(tBase,3));//S curve
					var t=Math.pow(tBase,0.5);
					
					var shake=0;
					if (Game.AscendTimer<Game.AscendBreakpoint) {shake=Game.AscendTimer/Game.AscendBreakpoint;}
					//else {shake=1-t;}

					ctx.globalAlpha=1;
					
					var x=Game.cookieOriginX;
					var y=Game.cookieOriginY;
					
					x+=(Math.random()*2-1)*10*shake;
					y+=(Math.random()*2-1)*10*shake;
					
					var s=1;
					if (tBase>0)
					{
						ctx.save();
						ctx.globalAlpha=1-Math.pow(t,0.5);
						ctx.translate(x,y);
						ctx.globalCompositeOperation='lighter';
						ctx.rotate(Game.T*0.007);
						s=0.5+Math.pow(tBase,0.6)*1;
						var s2=(600)*s;
						ctx.drawImage(Pic('heavenRing1.jpg'),-s2/2,-s2/2,s2,s2);
						ctx.rotate(-Game.T*0.002);
						s=0.5+Math.pow(1-tBase,0.4)*1;
						s2=(600)*s;
						ctx.drawImage(Pic('heavenRing2.jpg'),-s2/2,-s2/2,s2,s2);
						ctx.restore();
					}
					
					s=256;//*Game.BigCookieSize;
					
					ctx.save();
					ctx.translate(x,y);
					ctx.rotate((t*(-0.1))*Math.PI*2);
					
					var chunks={0:7,1:6,2:3,3:2,4:8,5:1,6:9,7:5,8:0,9:4};
					s*=t/2+1;
					/*ctx.globalAlpha=(1-t)*0.33;
					for (var i=0;i<10;i++)
					{
						var d=(t-0.2)*(80+((i+2)%3)*40);
						ctx.drawImage(Pic('brokenCookie.png'),256*(chunks[i]),0,256,256,-s/2+Math.sin(-(((chunks[i]+4)%10)/10)*Math.PI*2)*d,-s/2+Math.cos(-(((chunks[i]+4)%10)/10)*Math.PI*2)*d,s,s);
					}
					ctx.globalAlpha=(1-t)*0.66;
					for (var i=0;i<10;i++)
					{
						var d=(t-0.1)*(80+((i+2)%3)*40);
						ctx.drawImage(Pic('brokenCookie.png'),256*(chunks[i]),0,256,256,-s/2+Math.sin(-(((chunks[i]+4)%10)/10)*Math.PI*2)*d,-s/2+Math.cos(-(((chunks[i]+4)%10)/10)*Math.PI*2)*d,s,s);
					}*/
					ctx.globalAlpha=1-t;
					for (var i=0;i<10;i++)
					{
						var d=(t)*(80+((i+2)%3)*40);
						var x2=(Math.random()*2-1)*5*shake;
						var y2=(Math.random()*2-1)*5*shake;
						ctx.drawImage(Pic('brokenCookie.png'),256*(chunks[i]),0,256,256,-s/2+Math.sin(-(((chunks[i]+4)%10)/10)*Math.PI*2)*d+x2,-s/2+Math.cos(-(((chunks[i]+4)%10)/10)*Math.PI*2)*d+y2,s,s);
					}
					var brokenHalo=1-Math.min(t/(1/3),1/3)*3;
					if (Game.AscendTimer<Game.AscendBreakpoint) brokenHalo=Game.AscendTimer/Game.AscendBreakpoint;
					ctx.globalAlpha=brokenHalo;
					ctx.drawImage(Pic('brokenCookieHalo.png'),-s/1.3333,-s/1.3333,s*1.5,s*1.5);
					
					ctx.restore();
					
					//flares
					var n=9;
					var t=Game.AscendTimer/Game.AscendBreakpoint;
					if (Game.AscendTimer<Game.AscendBreakpoint)
					{
						ctx.save();
						ctx.translate(x,y);
						for (var i=0;i<n;i++)
						{
							if (Math.floor(t/3*n*3+i*2.7)%2)
							{
								var t2=Math.pow((t/3*n*3+i*2.7)%1,1.5);
								ctx.globalAlpha=(1-t)*(Game.drawT%2==0?0.5:1);
								var sw=(1-t2*0.5)*96;
								var sh=(0.5+t2*1.5)*96;
								ctx.drawImage(Pic('shineSpoke.png'),-sw/2,-sh-32-(1-t2)*256,sw,sh);
							}
							ctx.rotate(Math.PI*2/n);
						}
						ctx.restore();
					}
					
					
					//flash at breakpoint
					if (tBase<0.1 && tBase>0)
					{
						ctx.globalAlpha=1-tBase/0.1;
						ctx.fillStyle='#fff';
						ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
						ctx.globalAlpha=1;
					}
					if (tBase>0.8)
					{
						ctx.globalAlpha=(tBase-0.8)/0.2;
						ctx.fillStyle='#000';
						ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
						ctx.globalAlpha=1;
					}
				}
				
				//milk and milk accessories
				if (Game.prefs.milk)
				{
					var width=ctx.canvas.width;
					var height=ctx.canvas.height;
					var x=Math.floor((Game.T*2-(Game.milkH-Game.milkHd)*2000+480*2)%480);//Math.floor((Game.T*2+Math.sin(Game.T*0.1)*2+Math.sin(Game.T*0.03)*2-(Game.milkH-Game.milkHd)*2000+480*2)%480);
					var y=(Game.milkHd)*height;//(((Game.milkHd)*ctx.canvas.height)*(1+0.05*(Math.sin(Game.T*0.017)/2+0.5)));
					var a=1;
					if (Game.AscendTimer>0)
					{
						y*=1-Math.pow((Game.AscendTimer/Game.AscendBreakpoint),2)*2;
						a*=1-Math.pow((Game.AscendTimer/Game.AscendBreakpoint),2)*2;
					}
					else if (Game.ReincarnateTimer>0)
					{
						y*=1-Math.pow(1-(Game.ReincarnateTimer/Game.ReincarnateDuration),2)*2;
						a*=1-Math.pow(1-(Game.ReincarnateTimer/Game.ReincarnateDuration),2)*2;
					}
					
					if (Game.TOYS)
					{
						//golly
						if (!Game.Toy)
						{
							Game.toys=[];
							Game.toysType=choose([1,2]);
							Game.Toy=function(x,y)
							{
								this.id=Game.toys.length;
								this.x=x;
								this.y=y;
								this.xd=Math.random()*10-5;
								this.yd=Math.random()*10-5;
								this.r=Math.random()*Math.PI*2;
									this.rd=Math.random()*0.1-0.05;
									var v=Math.random();var a=0.5;var b=0.5;
									if (v<=a) v=b-b*Math.pow(1-v/a,3); else v=b+(1-b)*Math.pow((v-a)/(1-a),3);
								this.s=(Game.toysType==1?64:48)*(0.1+v*1.9);
								if (Game.toysType==2) this.s=(this.id%10==1)?96:48;
								this.st=this.s;this.s=0;
									var cookies=[[10,0]];
									for (var i in Game.Upgrades)
									{
										var cookie=Game.Upgrades[i];
										if (cookie.bought>0 && cookie.pool=='cookie') cookies.push(cookie.icon);
									}
								this.icon=choose(cookies);
								this.dragged=false;
								this.l=document.createElement('div');
								this.l.innerHTML=this.id;
								this.l.style.cssText='cursor:pointer;border-radius:'+(this.s/2)+'px;opacity:0;width:'+this.s+'px;height:'+this.s+'px;background:#999;position:absolute;left:0px;top:0px;z-index:10000000;transform:translate(-1000px,-1000px);';
								l('sectionLeft').appendChild(this.l);
								AddEvent(this.l,'mousedown',function(what){return function(){what.dragged=true;};}(this));
								AddEvent(this.l,'mouseup',function(what){return function(){what.dragged=false;};}(this));
								Game.toys.push(this);
								return this;
							}
							for (var i=0;i<Math.floor(Math.random()*15+(Game.toysType==1?5:30));i++)
							{
								new Game.Toy(Math.random()*width,Math.random()*height*0.3);
							}
						}
						ctx.globalAlpha=0.5;
						for (var i in Game.toys)
						{
							var me=Game.toys[i];
							ctx.save();
							ctx.translate(me.x,me.y);
							ctx.rotate(me.r);
							if (Game.toysType==1) ctx.drawImage(Pic('smallCookies.png'),(me.id%8)*64,0,64,64,-me.s/2,-me.s/2,me.s,me.s);
							else ctx.drawImage(Pic('icons.png'),me.icon[0]*48,me.icon[1]*48,48,48,-me.s/2,-me.s/2,me.s,me.s);
							ctx.restore();
						}
						ctx.globalAlpha=1;
						for (var i in Game.toys)
						{
							var me=Game.toys[i];
							//psst... not real physics
							for (var ii in Game.toys)
							{
								var it=Game.toys[ii];
								if (it.id!=me.id)
								{
									var x1=me.x+me.xd;
									var y1=me.y+me.yd;
									var x2=it.x+it.xd;
									var y2=it.y+it.yd;
									var dist=Math.sqrt(Math.pow((x1-x2),2)+Math.pow((y1-y2),2))/(me.s/2+it.s/2);
									if (dist<(Game.toysType==1?0.95:0.75))
									{
										var angle=Math.atan2(y1-y2,x1-x2);
										var v1=Math.sqrt(Math.pow((me.xd),2)+Math.pow((me.yd),2));
										var v2=Math.sqrt(Math.pow((it.xd),2)+Math.pow((it.yd),2));
										var v=((v1+v2)/2+dist)*0.75;
										var ratio=it.s/me.s;
										me.xd+=Math.sin(-angle+Math.PI/2)*v*(ratio);
										me.yd+=Math.cos(-angle+Math.PI/2)*v*(ratio);
										it.xd+=Math.sin(-angle-Math.PI/2)*v*(1/ratio);
										it.yd+=Math.cos(-angle-Math.PI/2)*v*(1/ratio);
										me.rd+=(Math.random()*1-0.5)*0.1*(ratio);
										it.rd+=(Math.random()*1-0.5)*0.1*(1/ratio);
										me.rd*=Math.min(1,v);
										it.rd*=Math.min(1,v);
									}
								}
							}
							if (me.y>=height-(Game.milkHd)*height+8)
							{
								me.xd*=0.85;
								me.yd*=0.85;
								me.rd*=0.85;
								me.yd-=1;
								me.xd+=(Math.random()*1-0.5)*0.3;
								me.yd+=(Math.random()*1-0.5)*0.05;
								me.rd+=(Math.random()*1-0.5)*0.02;
							}
							else
							{
								me.xd*=0.99;
								me.rd*=0.99;
								me.yd+=1;
							}
							me.yd*=(Math.min(1,Math.abs(me.y-(height-(Game.milkHd)*height)/16)));
							me.rd+=me.xd*0.01/(me.s/(Game.toysType==1?64:48));
							if (me.x<me.s/2 && me.xd<0) me.xd=Math.max(0.1,-me.xd*0.6); else if (me.x<me.s/2) {me.xd=0;me.x=me.s/2;}
							if (me.x>width-me.s/2 && me.xd>0) me.xd=Math.min(-0.1,-me.xd*0.6); else if (me.x>width-me.s/2) {me.xd=0;me.x=width-me.s/2;}
							me.xd=Math.min(Math.max(me.xd,-30),30);
							me.yd=Math.min(Math.max(me.yd,-30),30);
							me.rd=Math.min(Math.max(me.rd,-0.5),0.5);
							me.x+=me.xd;
							me.y+=me.yd;
							me.r+=me.rd;
							me.r=me.r%(Math.PI*2);
							me.s+=(me.st-me.s)*0.5;
							if (Game.toysType==2 && !me.dragged && Math.random()<0.003) me.st=choose([48,48,48,48,96]);
							if (me.dragged)
							{
								me.x=Game.mouseX;
								me.y=Game.mouseY;
								me.xd+=((Game.mouseX-Game.mouseX2)*3-me.xd)*0.5;
								me.yd+=((Game.mouseY-Game.mouseY2)*3-me.yd)*0.5
								me.l.style.transform='translate('+(me.x-me.s/2)+'px,'+(me.y-me.s/2)+'px) scale(50)';
							}
							else me.l.style.transform='translate('+(me.x-me.s/2)+'px,'+(me.y-me.s/2)+'px)';
							me.l.style.width=me.s+'px';
							me.l.style.height=me.s+'px';
							ctx.save();
							ctx.translate(me.x,me.y);
							ctx.rotate(me.r);
							if (Game.toysType==1) ctx.drawImage(Pic('smallCookies.png'),(me.id%8)*64,0,64,64,-me.s/2,-me.s/2,me.s,me.s);
							else ctx.drawImage(Pic('icons.png'),me.icon[0]*48,me.icon[1]*48,48,48,-me.s/2,-me.s/2,me.s,me.s);
							ctx.restore();
						}
					}
					
					var pic=Game.Milk.pic;
					if (Game.milkType!=0 && Game.ascensionMode!=1) pic=Game.MilksByChoice[Game.milkType].pic;
					ctx.globalAlpha=0.9*a;
					ctx.fillPattern(Pic(pic+'.png'),0,height-y,width+480,1,480,480,x,0);
					
					ctx.fillStyle='#000';
					ctx.fillRect(0,height-y+480,width,Math.max(0,(y-480)));
					ctx.globalAlpha=1;
					
					Timer.track('milk');
				}
				
				if (Game.AscendTimer>0)
				{
					ctx.drawImage(Pic('shadedBordersSoft.png'),0,0,ctx.canvas.width,ctx.canvas.height);
				}
				
				if (Game.AscendTimer==0)
				{
					Game.DrawWrinklers();Timer.track('wrinklers');
					Game.DrawSpecial();Timer.track('evolvables');
					
					Game.particlesDraw(2);Timer.track('text particles');
					
					//shiny border during frenzies etc
					ctx.globalAlpha=1;
					var borders='shadedBordersSoft.png';
					if (goodBuff) borders='shadedBordersGold.png';
					else if (badBuff) borders='shadedBordersRed.png';
					if (goodBuff && Game.prefs.fancy) ctx.globalCompositeOperation='lighter';
					ctx.drawImage(Pic(borders),0,0,ctx.canvas.width,ctx.canvas.height);
					if (goodBuff && Game.prefs.fancy) ctx.globalCompositeOperation='source-over';
				}
			}
		};
		
		
		/*=====================================================================================
		INITIALIZATION END; GAME READY TO LAUNCH
		=======================================================================================*/
		
		Game.killShimmers();
		
		//booooo
		Game.RuinTheFun=function(silent)
		{
			Game.popups=0;
			Game.SetAllUpgrades(1);
			Game.SetAllAchievs(1);
			Game.popups=0;
			Game.Earn(999999999999999999999999999999);
			Game.MaxSpecials();
			Game.nextResearch=0;
			Game.researchT=-1;
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
			Game.popups=1;
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				if (me.minigame && me.minigame.onRuinTheFun) me.minigame.onRuinTheFun();
			}
			if (!silent)
			{
				if (Game.prefs.popups) Game.Popup('Thou doth ruineth the fun!');
				else Game.Notify('Thou doth ruineth the fun!','You\'re free. Free at last.',[11,5]);
			}
			return 'You feel a bitter taste in your mouth...';
		}
		
		Game.SetAllUpgrades=function(on)
		{
			Game.popups=0;
			var leftout=['神奇的恶作剧','神秘障碍','葡萄糖空气'];
			for (var i in Game.Upgrades)
			{
				if (on && (Game.Upgrades[i].pool=='toggle' || leftout.indexOf(Game.Upgrades[i].name)!=-1)) {}
				else if (on) Game.Upgrades[i].earn();
				else if (!on) Game.Upgrades[i].lose();
			}
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
			Game.popups=1;
		}
		Game.SetAllAchievs=function(on)
		{
			Game.popups=0;
			for (var i in Game.Achievements)
			{
				if (on && Game.Achievements[i].pool!='dungeon') Game.Win(Game.Achievements[i].name);
				else if (!on) Game.RemoveAchiev(Game.Achievements[i].name);
			}
			Game.recalculateGains=1;
			Game.popups=1;
		}
		Game.GetAllDebugs=function()
		{
			Game.popups=0;
			for (var i in Game.Upgrades)
			{
				if (Game.Upgrades[i].pool=='debug') Game.Upgrades[i].earn();
			}
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
			Game.popups=1;
		}
		Game.MaxSpecials=function()
		{
			Game.dragonLevel=Game.dragonLevels.length-1;
			Game.santaLevel=Game.santaLevels.length-1;
		}
		
		Game.SesameReset=function()
		{
			var name=Game.bakeryName;
			Game.HardReset(2);
			Game.bakeryName=name;
			Game.bakeryNameRefresh();
			Game.Achievements['被骗的饼干味道很糟糕'].won=1;
		}
		
		Game.debugTimersOn=0;
		Game.sesame=0;
		Game.OpenSesame=function()
		{
			var str='';
			str+='<div class="icon" style="position:absolute;left:-9px;top:-6px;background-position:'+(-10*48)+'px '+(-6*48)+'px;"></div>';
			str+='<div style="position:absolute;left:0px;top:0px;z-index:10;font-size:10px;background:#000;padding:1px;" id="fpsCounter"></div>';
			
			str+='<div id="devConsoleContent">';
			str+='<div class="title" style="font-size:14px;margin:6px;">Dev tools</div>';
			
			str+='<a class="option neato" '+Game.clickStr+'="Game.Ascend(1);">Ascend</a>';
			str+='<div class="line"></div>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.cookies*=10;Game.cookiesEarned*=10;">x10</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.cookies/=10;Game.cookiesEarned/=10;">/10</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.cookies*=1000;Game.cookiesEarned*=1000;">x1k</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.cookies/=1000;Game.cookiesEarned/=1000;">/1k</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="for (var i in Game.Objects){Game.Objects[i].buy(100);}">Buy 100 of all</a>';//for (var n=0;n<100;n++){for (var i in Game.Objects){Game.Objects[i].buy(1);}}
			str+='<a class="option neato" '+Game.clickStr+'="for (var i in Game.Objects){Game.Objects[i].sell(100);}">Sell 100 of all</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.gainLumps(10);">+10 lumps</a>';
			str+='<a class="option neato" '+Game.clickStr+'="for (var i in Game.Objects){Game.Objects[i].level=0;Game.Objects[i].onMinigame=false;Game.Objects[i].refresh();}Game.recalculateGains=1;">Reset levels</a>';
			str+='<div class="line"></div>';
			str+='<a class="option warning" '+Game.clickStr+'="Game.RuinTheFun(1);">Ruin The Fun</a>';
			str+='<a class="option warning" '+Game.clickStr+'="Game.SesameReset();">Wipe</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.GetAllDebugs();">All debugs</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.debugTimersOn=!Game.debugTimersOn;Game.OpenSesame();">Timers '+(Game.debugTimersOn?'On':'Off')+'</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.SetAllUpgrades(0);">No upgrades</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.SetAllUpgrades(1);">All upgrades</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.SetAllAchievs(0);">No achievs</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.SetAllAchievs(1);">All achievs</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.santaLevel=0;Game.dragonLevel=0;">Reset specials</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.MaxSpecials();">Max specials</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.lumpRefill=Date.now()-Game.getLumpRefillMax();">Reset refills</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.EditAscend();">'+(Game.DebuggingPrestige?'Exit Ascend Edit':'Ascend Edit')+'</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.DebugUpgradeCpS();">Debug upgrades CpS</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.seed=Game.makeSeed();">Re-seed</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.heralds=100;l(\'heraldsAmount\').innerHTML=Game.heralds;Game.externalDataLoaded=true;Game.recalculateGains=1;">Max heralds</a>';
			str+='<div class="line"></div>';
			for (var i=0;i<Game.goldenCookieChoices.length/2;i++)
			{
				str+='<a class="option neato" '+Game.clickStr+'="var newShimmer=new Game.shimmer(\'golden\');newShimmer.force=\''+Game.goldenCookieChoices[i*2+1]+'\';">'+Game.goldenCookieChoices[i*2]+'</a>';
				//str+='<a class="option neato" '+Game.clickStr+'="Game.goldenCookie.force=\''+Game.goldenCookie.choices[i*2+1]+'\';Game.goldenCookie.spawn();">'+Game.goldenCookie.choices[i*2]+'</a>';
				//str+='<a class="option neato" '+Game.clickStr+'="Game.goldenCookie.click(0,\''+Game.goldenCookie.choices[i*2+1]+'\');">'+Game.goldenCookie.choices[i*2]+'</a>';
			}
			str+='</div>';
			
			l('devConsole').innerHTML=str;
			
			if (!l('fpsGraph'))
			{
				var div=document.createElement('canvas');
				div.id='fpsGraph';
				div.width=128;
				div.height=64;
				div.style.opacity=0.5;
				div.style.pointerEvents='none';
				div.style.transformOrigin='0% 0%';
				div.style.transform='scale(0.75)';
				//l('devConsole').appendChild(div);
				l('devConsole').parentNode.insertBefore(div,l('devConsole').nextSibling);
				Game.fpsGraph=div;
				Game.fpsGraphCtx=Game.fpsGraph.getContext('2d',{alpha:false});
				var ctx=Game.fpsGraphCtx;
				ctx.fillStyle='#000';
				ctx.fillRect(0,0,128,64);
			}
			
			l('debug').style.display='block';
			Game.sesame=1;
			Game.Achievements['被骗的饼干味道很糟糕'].won=1;
		}
		
		Game.EditAscend=function()
		{
			if (!Game.DebuggingPrestige)
			{
				Game.DebuggingPrestige=true;
				Game.AscendTimer=0;
				Game.OnAscend=1;
				Game.removeClass('ascendIntro');
				Game.addClass('ascending');
			}
			else
			{
				Game.DebuggingPrestige=false;
			}
			Game.BuildAscendTree();
			Game.OpenSesame();
		}
		
		//experimental debugging function that cycles through every owned upgrade, turns it off and on, and lists how much each upgrade is participating to CpS
		Game.debuggedUpgradeCpS=[];
		Game.debuggedUpgradeCpClick=[];
		Game.debugColors=['#322','#411','#600','#900','#f30','#f90','#ff0','#9f0','#0f9','#09f','#90f'];
		Game.DebugUpgradeCpS=function()
		{
			Game.CalculateGains();
			Game.debuggedUpgradeCpS=[];
			Game.debuggedUpgradeCpClick=[];
			var CpS=Game.cookiesPs;
			var CpClick=Game.computedMouseCps;
			for (var i in Game.Upgrades)
			{
				var me=Game.Upgrades[i];
				if (me.bought)
				{
					me.bought=0;
					Game.CalculateGains();
					//Game.debuggedUpgradeCpS[me.name]=CpS-Game.cookiesPs;
					Game.debuggedUpgradeCpS[me.name]=(CpS/(Game.cookiesPs||1)-1);
					Game.debuggedUpgradeCpClick[me.name]=(CpClick/(Game.computedMouseCps||1)-1);
					me.bought=1;
				}
			}
			Game.CalculateGains();
		}
		
		
		
		
		for (var i in Game.customInit) {Game.customInit[i]();}
		
		if (!Game.LoadSave())
		{//try to load the save when we open the page. if this fails, try to brute-force it half a second later
			setTimeout(function(){
				var local=Game.localStorageGet(Game.SaveTo);
				Game.LoadSave(local);
			},500);
		}
		
		Game.ready=1;
		l('javascriptError').innerHTML='';
		l('javascriptError').style.display='none';
		Game.Loop();
		Game.Draw();
	}
	/*=====================================================================================
	LOGIC
	=======================================================================================*/
	Game.Logic=function()
	{
		Game.bounds=Game.l.getBoundingClientRect();
		
		if (!Game.OnAscend && Game.AscendTimer==0)
		{
			for (var i in Game.Objects)
			{
				if (Game.Objects[i].eachFrame) Game.Objects[i].eachFrame();
			}
			Game.UpdateSpecial();
			Game.UpdateGrandmapocalypse();
			
			//these are kinda fun
			//if (Game.BigCookieState==2 && !Game.promptOn && Game.Scroll!=0) Game.ClickCookie();
			//if (Game.BigCookieState==1 && !Game.promptOn) Game.ClickCookie();
			
			//handle graphic stuff
			if (Game.prefs.wobbly)
			{
				if (Game.BigCookieState==1) Game.BigCookieSizeT=0.98;
				else if (Game.BigCookieState==2) Game.BigCookieSizeT=1.05;
				else Game.BigCookieSizeT=1;
				Game.BigCookieSizeD+=(Game.BigCookieSizeT-Game.BigCookieSize)*0.75;
				Game.BigCookieSizeD*=0.75;
				Game.BigCookieSize+=Game.BigCookieSizeD;
				Game.BigCookieSize=Math.max(0.1,Game.BigCookieSize);
			}
			else
			{
				if (Game.BigCookieState==1) Game.BigCookieSize+=(0.98-Game.BigCookieSize)*0.5;
				else if (Game.BigCookieState==2) Game.BigCookieSize+=(1.05-Game.BigCookieSize)*0.5;
				else Game.BigCookieSize+=(1-Game.BigCookieSize)*0.5;
			}
			Game.particlesUpdate();
			
			if (Game.mousePointer) l('sectionLeft').style.cursor='pointer';
			else l('sectionLeft').style.cursor='auto';
			Game.mousePointer=0;
			
			//handle milk and milk accessories
			Game.milkProgress=Game.AchievementsOwned/25;
			if (Game.milkProgress>=0.5) Game.Unlock('小猫助手');
			if (Game.milkProgress>=1) Game.Unlock('小猫工人');
			if (Game.milkProgress>=2) Game.Unlock('小猫工程师');
			if (Game.milkProgress>=3) Game.Unlock('小猫监工');
			if (Game.milkProgress>=4) Game.Unlock('小猫经理');
			if (Game.milkProgress>=5) Game.Unlock('小猫会计');
			if (Game.milkProgress>=6) Game.Unlock('小猫专家');
			if (Game.milkProgress>=7) Game.Unlock('小猫能手');
			if (Game.milkProgress>=8) Game.Unlock('小猫顾问');
			if (Game.milkProgress>=9) Game.Unlock('小猫助理区域经理');
			if (Game.milkProgress>=10) Game.Unlock('小猫市场商人');
			if (Game.milkProgress>=11) Game.Unlock('小猫分析师');
			Game.milkH=Math.min(1,Game.milkProgress)*0.35;
			Game.milkHd+=(Game.milkH-Game.milkHd)*0.02;
			
			Game.Milk=Game.Milks[Math.min(Math.floor(Game.milkProgress),Game.Milks.length-1)];
			
			if (Game.autoclickerDetected>0) Game.autoclickerDetected--;
			
			//handle research
			if (Game.researchT>0)
			{
				Game.researchT--;
			}
			if (Game.researchT==0 && Game.nextResearch)
			{
				if (!Game.Has(Game.UpgradesById[Game.nextResearch].name))
				{
					Game.Unlock(Game.UpgradesById[Game.nextResearch].name);
					if (Game.prefs.popups) Game.Popup('已研究 : '+Game.UpgradesById[Game.nextResearch].name);
					else Game.Notify('研究完成','你发现了 : <b>'+Game.UpgradesById[Game.nextResearch].name+'</b>.',Game.UpgradesById[Game.nextResearch].icon);
				}
				Game.nextResearch=0;
				Game.researchT=-1;
				Game.recalculateGains=1;
			}
			//handle seasons
			if (Game.seasonT>0)
			{
				Game.seasonT--;
			}
			if (Game.seasonT<=0 && Game.season!='' && Game.season!=Game.baseSeason && !Game.Has('永恒的季节'))
			{
				var str=Game.seasons[Game.season].over;
				if (Game.prefs.popups) Game.Popup(str);
				else Game.Notify(str,'',Game.seasons[Game.season].triggerUpgrade.icon);
				if (Game.Has('季节切换器')) {Game.Unlock(Game.seasons[Game.season].trigger);Game.seasons[Game.season].triggerUpgrade.bought=0;}
				Game.season=Game.baseSeason;
				Game.seasonT=-1;
			}
			
			//press ctrl to bulk-buy 10, shift to bulk-buy 100
			if (!Game.promptOn)
			{
				if ((Game.keys[16] || Game.keys[17]) && !Game.buyBulkShortcut)
				{
					Game.buyBulkOld=Game.buyBulk;
					if (Game.keys[16]) Game.buyBulk=100;
					if (Game.keys[17]) Game.buyBulk=10;
					Game.buyBulkShortcut=1;
					Game.storeBulkButton(-1);
				}
			}
			if ((!Game.keys[16] && !Game.keys[17]) && Game.buyBulkShortcut)//release
			{
				Game.buyBulk=Game.buyBulkOld;
				Game.buyBulkShortcut=0;
				Game.storeBulkButton(-1);
			}
			
			//handle cookies
			if (Game.recalculateGains) Game.CalculateGains();
			Game.Earn(Game.cookiesPs/Game.fps);//add cookies per second
			
			//grow lumps
			Game.doLumps();
			
			//minigames
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				if (Game.isMinigameReady(me) && me.minigame.logic && Game.ascensionMode!=1) me.minigame.logic();
			}
			
			if (Game.specialTab!='' && Game.T%(Game.fps*3)==0) Game.ToggleSpecialMenu(1);
			
			//wrinklers
			if (Game.cpsSucked>0)
			{
				Game.Dissolve((Game.cookiesPs/Game.fps)*Game.cpsSucked);
				Game.cookiesSucked+=((Game.cookiesPs/Game.fps)*Game.cpsSucked);
				//should be using one of the following, but I'm not sure what I'm using this stat for anymore
				//Game.cookiesSucked=Game.wrinklers.reduce(function(s,w){return s+w.sucked;},0);
				//for (var i in Game.wrinklers) {Game.cookiesSucked+=Game.wrinklers[i].sucked;}
			}
			
			//var cps=Game.cookiesPs+Game.cookies*0.01;//exponential cookies
			//Game.Earn(cps/Game.fps);//add cookies per second
			
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				me.totalCookies+=(me.storedTotalCps*Game.globalCpsMult)/Game.fps;
			}
			if (Game.cookies && Game.T%Math.ceil(Game.fps/Math.min(10,Game.cookiesPs))==0 && Game.prefs.particles) Game.particleAdd();//cookie shower
			
			if (Game.T%(Game.fps*10)==0) Game.recalculateGains=1;//recalculate CpS every 10 seconds (for dynamic boosts such as Century egg)
			
			/*=====================================================================================
			UNLOCKING STUFF
			=======================================================================================*/
			if (Game.T%(Game.fps)==0 && Math.random()<1/500000) Game.Win('非常幸运');//1 chance in 500,000 every second achievement
			if (Game.T%(Game.fps*5)==0 && Game.ObjectsById.length>0)//check some achievements and upgrades
			{
				if (isNaN(Game.cookies)) {Game.cookies=0;Game.cookiesEarned=0;Game.recalculateGains=1;}
				
				var timePlayed=new Date();
				timePlayed.setTime(Date.now()-Game.startDate);
				
				if (!Game.fullDate || (Date.now()-Game.fullDate)>=365*24*60*60*1000) Game.Win('要做的事情太多了');
				
				if (Game.cookiesEarned>=1000000 && (Game.ascensionMode==1 || Game.resets==0))//challenge run or hasn't ascended yet
				{
					if (timePlayed<=1000*60*35) Game.Win('快速烘焙 I');
					if (timePlayed<=1000*60*25) Game.Win('快速烘焙 II');
					if (timePlayed<=1000*60*15) Game.Win('快速烘焙 III');
					
					if (Game.cookieClicks<=15) Game.Win('永不点击');
					if (Game.cookieClicks<=0) Game.Win('真正的永不点击');
					if (Game.cookiesEarned>=1000000000 && Game.UpgradesOwned==0) Game.Win('核心');
				}
				
				for (var i in Game.UnlockAt)
				{
					var unlock=Game.UnlockAt[i];
					if (Game.cookiesEarned>=unlock.cookies)
					{
						var pass=1;
						if (unlock.require && !Game.Has(unlock.require) && !Game.HasAchiev(unlock.require)) pass=0;
						if (unlock.season && Game.season!=unlock.season) pass=0;
						if (pass) {Game.Unlock(unlock.name);Game.Win(unlock.name);}
					}
				}
				
<<<<<<< HEAD:main.js
				if (Game.Has('黄金开关')) Game.Unlock('黄金开关[关闭]');
				if (Game.Has('糖分渴求')) Game.Unlock('糖的狂热');
				if (Game.Has('选择经典的乳制品')) Game.Unlock('牛奶选择器');
				if (Game.Has('基本壁纸分类')) Game.Unlock('背景选择器');
				if (Game.Has('金色饼干提示音')) Game.Unlock('黄金饼干声音选择器');
=======
				if (Game.Has('Golden switch')) Game.Unlock('Golden switch [off]');
				if (Game.Has('Shimmering veil') && !Game.Has('Shimmering veil [off]') && !Game.Has('Shimmering veil [on]')) {Game.Unlock('Shimmering veil [on]');Game.Upgrades['Shimmering veil [off]'].earn();}
				if (Game.Has('Sugar craving')) Game.Unlock('Sugar frenzy');
				if (Game.Has('Classic dairy selection')) Game.Unlock('Milk selector');
				if (Game.Has('Basic wallpaper assortment')) Game.Unlock('Background selector');
				if (Game.Has('Golden cookie alert sound')) Game.Unlock('Golden cookie sound selector');
>>>>>>> 20180919:main.js
				
				if (Game.Has('Eternal heart biscuits')) Game.Win('可爱的饼干');
				if (Game.season=='easter')
				{
					var eggs=0;
					for (var i in Game.easterEggs)
					{
						if (Game.HasUnlocked(Game.easterEggs[i])) eggs++;
					}
					if (eggs>=1) Game.Win('狩猎开始了');
					if (eggs>=7) Game.Win('鸡蛋开始了');
					if (eggs>=14) Game.Win('复活节弥撒');
					if (eggs>=Game.easterEggs.length) Game.Win('捉迷藏冠军');
				}
				
				if (Game.prestige>0 && Game.ascensionMode!=1)
				{
					Game.Unlock('天堂芯片的秘密');
					if (Game.Has('天堂芯片的秘密')) Game.Unlock('天堂饼干站');
					if (Game.Has('天堂饼干站')) Game.Unlock('天堂面包店');
					if (Game.Has('天堂面包店')) Game.Unlock('天堂糖果店');
					if (Game.Has('天堂糖果店')) Game.Unlock('天国的钥匙');
					
					if (Game.Has('天国的钥匙')) Game.Win('健康');
				}
			
				for (var i in Game.BankAchievements)
				{
					if (Game.cookiesEarned>=Game.BankAchievements[i].threshold) Game.Win(Game.BankAchievements[i].name);
				}
				
				var buildingsOwned=0;
				var mathematician=1;
				var base10=1;
				var minAmount=100000;
				for (var i in Game.Objects)
				{
					buildingsOwned+=Game.Objects[i].amount;
					minAmount=Math.min(Game.Objects[i].amount,minAmount);
					if (!Game.HasAchiev('数学家')) {if (Game.Objects[i].amount<Math.min(128,Math.pow(2,(Game.ObjectsById.length-Game.Objects[i].id)-1))) mathematician=0;}
					if (!Game.HasAchiev('基数10')) {if (Game.Objects[i].amount<(Game.ObjectsById.length-Game.Objects[i].id)*10) base10=0;}
				}
				if (minAmount>=1) Game.Win('其中的一切');
				if (mathematician==1) Game.Win('数学家');
				if (base10==1) Game.Win('基数10');
				if (minAmount>=100) {Game.Win('一百周年纪念');Game.Unlock('牛奶巧克力奶油饼干');}
				if (minAmount>=150) {Game.Win('150周年纪念');Game.Unlock('黑巧克力奶油饼干');}
				if (minAmount>=200) {Game.Win('周年纪念');Game.Unlock('白巧克力奶油饼干');}
				if (minAmount>=250) {Game.Win('二百年半');Game.Unlock('红宝石巧克力奶油饼干');}
				if (minAmount>=300) {Game.Win('三百周年纪念');Game.Unlock('Lavender chocolate butter biscuit');}
				if (minAmount>=350) {Game.Win('Tricentennial and a half');Game.Unlock('Synthetic chocolate green honey butter biscuit');}
				if (minAmount>=400) {Game.Win('Quadricentennial');Game.Unlock('Royal raspberry chocolate butter biscuit');}
				if (minAmount>=450) {Game.Win('Quadricentennial and a half');Game.Unlock('Ultra-concentrated high-energy chocolate butter biscuit');}
				if (minAmount>=500) {Game.Win('Quincentennial');Game.Unlock('纯黑色巧克力黄油饼干');}
				
				if (Game.handmadeCookies>=1000) {Game.Win('可以点击');Game.Unlock('塑料鼠标');}
				if (Game.handmadeCookies>=100000) {Game.Win('全能点击');Game.Unlock('铁制鼠标');}
				if (Game.handmadeCookies>=10000000) {Game.Win('点击奥林匹克');Game.Unlock('钛制鼠标');}
				if (Game.handmadeCookies>=1000000000) {Game.Win('点击奥腊马');Game.Unlock('釉质鼠标');}
				if (Game.handmadeCookies>=100000000000) {Game.Win('点击狂魔');Game.Unlock('难得素鼠标');}
				if (Game.handmadeCookies>=10000000000000) {Game.Win('点击时代');Game.Unlock('E合金鼠标');}
				if (Game.handmadeCookies>=1000000000000000) {Game.Win('单击中心');Game.Unlock('叉合金鼠标');}
				if (Game.handmadeCookies>=100000000000000000) {Game.Win('点击祸患');Game.Unlock('范塔钢鼠标');}
				if (Game.handmadeCookies>=10000000000000000000) {Game.Win('点击大灾变');Game.Unlock('永不崩溃的鼠标');}
				if (Game.handmadeCookies>=1000000000000000000000) {Game.Win('终极点击');Game.Unlock('阿迈斯里鼠标');}
				if (Game.handmadeCookies>=100000000000000000000000) {Game.Win('所有其他孩子们都被点击了');Game.Unlock('高科技鼠标');}
				if (Game.handmadeCookies>=10000000000000000000000000) {Game.Win('一个…更多…点击…');Game.Unlock('Plasmarble mouse');}
				
				if (Game.cookiesEarned<Game.cookies) Game.Win('被骗的饼干味道很糟糕');
				
				if (Game.Has('骷髅饼干') && Game.Has('鬼饼干') && Game.Has('蝙蝠饼干') && Game.Has('粘液饼干') && Game.Has('南瓜饼干') && Game.Has('眼球饼干') && Game.Has('蜘蛛饼干')) Game.Win('幽灵饼干');
				if (Game.wrinklersPopped>=1) Game.Win('瘙痒不求人');
				if (Game.wrinklersPopped>=50) Game.Win('皱纹的问题');
				if (Game.wrinklersPopped>=200) Game.Win('湿气爆炸');
				
				if (Game.cookiesEarned>=1000000 && Game.Has('如何烤你的龙')) Game.Unlock('易碎的鸡蛋');
				
				if (Game.cookiesEarned>=25 && Game.season=='christmas') Game.Unlock('节庆帽子');
				if (Game.Has('Christmas tree biscuits') && Game.Has('Snowflake biscuits') && Game.Has('Snowman biscuits') && Game.Has('Holly biscuits') && Game.Has('Candy cane biscuits') && Game.Has('Bell biscuits') && Game.Has('Present biscuits')) Game.Win('让它下雪');
				
				if (Game.reindeerClicked>=1) Game.Win('哦，鹿');
				if (Game.reindeerClicked>=50) Game.Win('戏法');
				if (Game.reindeerClicked>=200) Game.Win('驯鹿长辈');
				
<<<<<<< HEAD:main.js
				if (buildingsOwned>=100) Game.Win('建设者');
				if (buildingsOwned>=500) Game.Win('建筑师');
				if (buildingsOwned>=1000) Game.Win('工程师');
				if (buildingsOwned>=2000) Game.Win('建筑之王');
				if (Game.UpgradesOwned>=20) Game.Win('增强剂');
				if (Game.UpgradesOwned>=50) Game.Win('增益剂');
				if (Game.UpgradesOwned>=100) Game.Win('升级程序');
				if (Game.UpgradesOwned>=200) Game.Win('进步之王');
				if (buildingsOwned>=3000 && Game.UpgradesOwned>=300) Game.Win('博学');
=======
				if (buildingsOwned>=100) Game.Win('Builder');
				if (buildingsOwned>=500) Game.Win('Architect');
				if (buildingsOwned>=1000) Game.Win('Engineer');
				if (buildingsOwned>=2000) Game.Win('Lord of Constructs');
				if (Game.UpgradesOwned>=20) Game.Win('Enhancer');
				if (Game.UpgradesOwned>=50) Game.Win('Augmenter');
				if (Game.UpgradesOwned>=100) Game.Win('Upgrader');
				if (Game.UpgradesOwned>=200) Game.Win('Lord of Progress');
				if (buildingsOwned>=3000 && Game.UpgradesOwned>=300) Game.Win('Polymath');
				if (buildingsOwned>=4000 && Game.UpgradesOwned>=400) Game.Win('Renaissance baker');
>>>>>>> 20180919:main.js
				
				if (Game.cookiesEarned>=10000000000000 && !Game.HasAchiev('你赢了一个饼干')) {Game.Win('你赢了一个饼干');Game.Earn(1);}
				
				if (Game.shimmerTypes['golden'].n>=4) Game.Win('四叶饼干');
				
				var grandmas=0;
<<<<<<< HEAD:main.js
				if (Game.Has('农民老奶奶')) grandmas++;
				if (Game.Has('工人老奶奶')) grandmas++;
				if (Game.Has('矿工老奶奶')) grandmas++;
				if (Game.Has('宇宙老奶奶')) grandmas++;
				if (Game.Has('嬗变老奶奶')) grandmas++;
				if (Game.Has('改造老奶奶')) grandmas++;
				if (Game.Has('老奶奶的奶奶')) grandmas++;
				if (Game.Has('反物质奶奶')) grandmas++;
				if (Game.Has('彩虹老奶奶')) grandmas++;
				if (Game.Has('银行家老奶奶')) grandmas++;
				if (Game.Has('祭司老奶奶')) grandmas++;
				if (Game.Has('女巫老奶奶')) grandmas++;
				if (Game.Has('幸运老奶奶')) grandmas++;
				if (!Game.HasAchiev('老年人') && grandmas>=7) Game.Win('老年人');
				if (Game.Objects['Grandma'].amount>=6 && !Game.Has('宾果游戏中心/研究设施') && Game.HasAchiev('老年人')) Game.Unlock('宾果游戏中心/研究设施');
				if (Game.pledges>0) Game.Win('老年小睡');
				if (Game.pledges>=5) Game.Win('老年沉睡');
				if (Game.pledges>=10) Game.Unlock('牺牲擀面杖');
				if (Game.Objects['Cursor'].amount+Game.Objects['Grandma'].amount>=777) Game.Win('上古卷轴');
				
				var base=10000000000000;
				if (Game.Objects['Cursor'].totalCookies>=base*1000000) 		Game.Win('点击委托');
				if (Game.Objects['Grandma'].totalCookies>=base*1000000) 	Game.Win('滔滔不绝');
				if (Game.Objects['Farm'].totalCookies>=base) 				Game.Win('我讨厌肥料');
				if (Game.Objects['Mine'].totalCookies>=base*				10) Game.Win('千万别挖');
				if (Game.Objects['Factory'].totalCookies>=base*				100) Game.Win('神奇的机器');
				if (Game.Objects['Bank'].totalCookies>=base*				1000) Game.Win('既得利益');
				if (Game.Objects['Temple'].totalCookies>=base*				10000) Game.Win('世界新秩序');
				if (Game.Objects['Wizard tower'].totalCookies>=base*		100000) Game.Win('欺骗');
				if (Game.Objects['Shipment'].totalCookies>=base*			1000000) Game.Win('超越');
				if (Game.Objects['Alchemy lab'].totalCookies>=base*			10000000) Game.Win('代表作');
				if (Game.Objects['Portal'].totalCookies>=base*				100000000) Game.Win('奇怪地');
				if (Game.Objects['Time machine'].totalCookies>=base*		1000000000) Game.Win('时空拼图');
				if (Game.Objects['Antimatter condenser'].totalCookies>=base*10000000000) Game.Win('超大质量');
				if (Game.Objects['Prism'].totalCookies>=base*				100000000000) Game.Win('赞美太阳');
				if (Game.Objects['Chancemaker'].totalCookies>=base*			1000000000000) Game.Win('Fingers crossed');

				var base=10000000000000000;
				if (Game.Objects['Cursor'].totalCookies>=base*1000000) 		Game.Win('手指点击很好');
				if (Game.Objects['Grandma'].totalCookies>=base*1000000) 	Game.Win('对宾果的恐慌');
				if (Game.Objects['Farm'].totalCookies>=base) 				Game.Win('在面团里搅拌');
				if (Game.Objects['Mine'].totalCookies>=base*				10) Game.Win('采石场');
				if (Game.Objects['Factory'].totalCookies>=base*				100) Game.Win('是的，我喜欢科技');
				if (Game.Objects['Bank'].totalCookies>=base*				1000) Game.Win('全部付清');
				if (Game.Objects['Temple'].totalCookies>=base*				10000) Game.Win('古教会的教堂');
				if (Game.Objects['Wizard tower'].totalCookies>=base*		100000) Game.Win('兔子太多，帽子不够');
				if (Game.Objects['Shipment'].totalCookies>=base*			1000000) Game.Win('最珍贵的货物');
				if (Game.Objects['Alchemy lab'].totalCookies>=base*			10000000) Game.Win('金色的');
				if (Game.Objects['Portal'].totalCookies>=base*				100000000) Game.Win('更加丑恶');
				if (Game.Objects['Time machine'].totalCookies>=base*		1000000000) Game.Win('仁慈，重来');
				if (Game.Objects['Antimatter condenser'].totalCookies>=base*10000000000) Game.Win('极小的');
				if (Game.Objects['Prism'].totalCookies>=base*				100000000000) Game.Win('一个更加灿烂的黎明');
				if (Game.Objects['Chancemaker'].totalCookies>=base*			1000000000000) Game.Win('Just a statistic');
				
				var base=10000000000000000000;
				if (Game.Objects['Cursor'].totalCookies>=base*1000000) 		Game.Win('点击(亚当•桑德勒主演)');
				if (Game.Objects['Grandma'].totalCookies>=base*1000000) 	Game.Win('古物');
				if (Game.Objects['Farm'].totalCookies>=base) 				Game.Win('过度生长');
				if (Game.Objects['Mine'].totalCookies>=base*				10) Game.Win('沉积主义');
				if (Game.Objects['Factory'].totalCookies>=base*				100) Game.Win('爱的劳动');
				if (Game.Objects['Bank'].totalCookies>=base*				1000) Game.Win('逆向漏斗系统');
				if (Game.Objects['Temple'].totalCookies>=base*				10000) Game.Win('你这样说');
				if (Game.Objects['Wizard tower'].totalCookies>=base*		100000) Game.Win('天命');
				if (Game.Objects['Shipment'].totalCookies>=base*			1000000) Game.Win('无论雨雪热还是漫漫黑夜');
				if (Game.Objects['Alchemy lab'].totalCookies>=base*			10000000) Game.Win('我有点石成金的本领');
				if (Game.Objects['Portal'].totalCookies>=base*				100000000) Game.Win('这永恒的谎言');
				if (Game.Objects['Time machine'].totalCookies>=base*		1000000000) Game.Win('似曾相识');
				if (Game.Objects['Antimatter condenser'].totalCookies>=base*10000000000) Game.Win('十大权力');
				if (Game.Objects['Prism'].totalCookies>=base*				100000000000) Game.Win('现在黑暗的日子已经过去了');
				if (Game.Objects['Chancemaker'].totalCookies>=base*			1000000000000) Game.Win('Murphy\'s wild guess');
=======
				for (var i in Game.GrandmaSynergies)
				{
					if (Game.Has(Game.GrandmaSynergies[i])) grandmas++;
				}
				if (!Game.HasAchiev('Elder') && grandmas>=7) Game.Win('Elder');
				if (!Game.HasAchiev('Veteran') && grandmas>=14) Game.Win('Veteran');
				if (Game.Objects['Grandma'].amount>=6 && !Game.Has('Bingo center/Research facility') && Game.HasAchiev('Elder')) Game.Unlock('Bingo center/Research facility');
				if (Game.pledges>0) Game.Win('Elder nap');
				if (Game.pledges>=5) Game.Win('Elder slumber');
				if (Game.pledges>=10) Game.Unlock('Sacrificial rolling pins');
				if (Game.Objects['Cursor'].amount+Game.Objects['Grandma'].amount>=777) Game.Win('The elder scrolls');
				
				for (var i in Game.Objects)
				{
					var it=Game.Objects[i];
					for (var ii in it.productionAchievs)
					{
						if (it.totalCookies>=it.productionAchievs[ii].pow) Game.Win(it.productionAchievs[ii].achiev.name);
					}
				}
>>>>>>> 20180919:main.js
				
				if (!Game.HasAchiev('饼干灌篮高手') && Game.LeftBackground && Game.milkProgress>0.1 && (Game.LeftBackground.canvas.height*0.4+256/2-16)>((1-Game.milkHd)*Game.LeftBackground.canvas.height)) Game.Win('饼干灌篮高手');
				//&& l('bigCookie').getBoundingClientRect().bottom>l('milk').getBoundingClientRect().top+16 && Game.milkProgress>0.1) Game.Win('Cookie-dunker');
				
				for (var i in Game.customChecks) {Game.customChecks[i]();}
			}
			
			Game.cookiesd+=(Game.cookies-Game.cookiesd)*0.3;
			
			if (Game.storeToRefresh) Game.RefreshStore();
			if (Game.upgradesToRebuild) Game.RebuildUpgrades();
			
			Game.updateShimmers();
			Game.updateBuffs();
			
			Game.UpdateTicker();
		}
		
		if (Game.T%(Game.fps*2)==0)
		{
			var title='无尽的饼干';
			if (Game.season=='fools') title='烘烤饼干';
			document.title=(Game.OnAscend?'升天! ':'')+Beautify(Game.cookies)+' '+(Game.cookies==1?'饼干':'饼干')+' - '+title;
		}
		if (Game.T%15==0)
		{
			//written through the magic of "hope for the best" maths
			var chipsOwned=Game.HowMuchPrestige(Game.cookiesReset);
			var ascendNowToOwn=Math.floor(Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned));
			var ascendNowToGet=ascendNowToOwn-Math.floor(chipsOwned);
			var nextChipAt=Game.HowManyCookiesReset(Math.floor(chipsOwned+ascendNowToGet+1))-Game.HowManyCookiesReset(Math.floor(chipsOwned+ascendNowToGet));
			var cookiesToNext=Game.HowManyCookiesReset(ascendNowToOwn+1)-(Game.cookiesEarned+Game.cookiesReset);
			var percent=1-(cookiesToNext/nextChipAt);
			
			//fill the tooltip under the Legacy tab
			var date=new Date();
			date.setTime(Date.now()-Game.startDate);
			var timeInSeconds=date.getTime()/1000;
			var startDate=Game.sayTime(timeInSeconds*Game.fps,-1);
			
			var str='';
			str+='你从开始到现在，持续的游戏时间是 <b>'+(startDate==''?'不是太久':(startDate))+'</b>.<br>';
			str+='<div class="line"></div>';
			if (Game.prestige>0)
			{
				str+='你现在的声望等级是 <b>'+Beautify(Game.prestige)+'</b>.<br>(饼干每秒产量 +'+Beautify(Game.prestige)+'%)';
				str+='<div class="line"></div>';
			}
			if (ascendNowToGet<1) str+='现在升天你将得不到任何声望。';
			else if (ascendNowToGet<2) str+='现在升天你会得到 <br><b> +1 声望等级 </b> (+1% 饼干每秒产量)<br>和 <b>1 天堂芯片</b> 。';
			else str+='现在升天你会得到<br><b>+'+Beautify(ascendNowToGet)+' 声望等级</b> (+'+Beautify(ascendNowToGet)+'% 饼干每秒产量)<br>和 <b>'+Beautify(ascendNowToGet)+' 天堂芯片</b> 。';
			str+='<div class="line"></div>';
			str+='你还需要 <b>'+Beautify(cookiesToNext)+' 饼干才能提升到</b>下一声望等级<br>';
			l('ascendTooltip').innerHTML=str;
			
			if (ascendNowToGet>0)//show number saying how many chips you'd get resetting now
			{
				var str=ascendNowToGet.toString();
				var str2='';
				for (var i in str)//add commas
				{
					if ((str.length-i)%3==0 && i>0) str2+=',';
					str2+=str[i];
				}
				Game.ascendNumber.innerHTML='+'+str2;
				Game.ascendNumber.style.display='block';
			}
			else
			{
				Game.ascendNumber.style.display='none';
			}
			
			if (ascendNowToGet>Game.ascendMeterLevel || Game.ascendMeterPercentT<Game.ascendMeterPercent)
			{
				//reset the gauge and play a sound if we gained a potential level
				Game.ascendMeterPercent=0;
				//PlaySound('snd/levelPrestige.mp3');//a bit too annoying
			}
			Game.ascendMeterLevel=ascendNowToGet;
			Game.ascendMeterPercentT=percent;//gauge that fills up as you near your next chip
			//if (Game.ascendMeterPercentT<Game.ascendMeterPercent) {Game.ascendMeterPercent=0;PlaySound('snd/levelPrestige.mp3',0.5);}
			//if (percent>=1) {Game.ascendMeter.className='';} else Game.ascendMeter.className='filling';
		}
		Game.ascendMeter.style.right=Math.floor(Math.max(0,1-Game.ascendMeterPercent)*100)+'px';
		Game.ascendMeterPercent+=(Game.ascendMeterPercentT-Game.ascendMeterPercent)*0.1;
		
		Game.NotesLogic();
		if (Game.mouseMoved || Game.Scroll || Game.tooltip.dynamic) Game.tooltip.update();
		
		if (Game.T%(Game.fps*5)==0 && !Game.mouseDown && (Game.onMenu=='stats' || Game.onMenu=='prefs')) Game.UpdateMenu();
		if (Game.T%(Game.fps*1)==0) Game.UpdatePrompt();
		if (Game.AscendTimer>0) Game.UpdateAscendIntro();
		if (Game.ReincarnateTimer>0) Game.UpdateReincarnateIntro();
		if (Game.OnAscend) Game.UpdateAscend();
		
		for (var i in Game.customLogic) {Game.customLogic[i]();}
		
		if (Game.sparklesT>0)
		{
			Game.sparkles.style.backgroundPosition=-Math.floor((Game.sparklesFrames-Game.sparklesT+1)*128)+'px 0px';
			Game.sparklesT--;
			if (Game.sparklesT==1) Game.sparkles.style.display='none';
		}
		
		Game.Click=0;
		Game.Scroll=0;
		Game.mouseMoved=0;
		Game.CanClick=1;
		
		if ((Game.toSave || (Game.T%(Game.fps*60)==0 && Game.T>Game.fps*10 && Game.prefs.autosave)) && !Game.OnAscend)
		{
			//check if we can save : no minigames are loading
			var canSave=true;
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				if (me.minigameLoading){canSave=false;break;}
			}
			if (canSave) Game.WriteSave();
		}
		
		//every 30 minutes : get server data (ie. update notification, patreon data)
		if (Game.T%(Game.fps*60*30)==0 && Game.T>Game.fps*10/* && Game.prefs.autoupdate*/) {Game.CheckUpdates();Game.GrabData();}
		
		Game.T++;
	}
	
	/*=====================================================================================
	DRAW
	=======================================================================================*/
	
	Game.Draw=function()
	{
		Game.DrawBackground();Timer.track('end of background');
		
		if (!Game.OnAscend)
		{
			
			var unit=(Math.round(Game.cookiesd)==1?' 饼干':' 饼干');
			var str=Beautify(Math.round(Game.cookiesd));
			if (Game.cookiesd>=1000000)//dirty padding
			{
				var spacePos=str.indexOf(' ');
				var dotPos=str.indexOf('.');
				var add='';
				if (spacePos!=-1)
				{
					if (dotPos==-1) add+='.000';
					else
					{
						if (spacePos-dotPos==2) add+='00';
						if (spacePos-dotPos==3) add+='0';
					}
				}
				str=[str.slice(0, spacePos),add,str.slice(spacePos)].join('');
			}
			if (str.length>11 && !Game.mobile) unit='<br>饼干';
			str+=unit;
			if (Game.prefs.monospace) str='<span class="monospace">'+str+'</span>';
			str=str+'<div style="font-size:50%;"'+(Game.cpsSucked>0?' class="warning"':'')+'>每秒 : '+Beautify(Game.cookiesPs*(1-Game.cpsSucked),1)+'</div>';//display cookie amount
			l('cookies').innerHTML=str;
			l('compactCookies').innerHTML=str;
			Timer.track('cookie amount');
			
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				if (me.onMinigame && me.minigame.draw && !me.muted) me.minigame.draw();
			}
			Timer.track('draw minigames');
			
			if (Game.drawT%5==0)
			{
				//if (Game.prefs.monospace) {l('cookies').className='title monospace';} else {l('cookies').className='title';}
				var lastLocked=0;
				for (var i in Game.Objects)
				{
					var me=Game.Objects[i];
					
					//make products full-opacity if we can buy them
					var classes='product';
					var price=me.bulkPrice;
					if (Game.cookiesEarned>=me.basePrice || me.bought>0) {classes+=' unlocked';lastLocked=0;me.locked=0;} else {classes+=' locked';lastLocked++;me.locked=1;}
					if ((Game.buyMode==1 && Game.cookies>=price) || (Game.buyMode==-1 && me.amount>0)) classes+=' enabled'; else classes+=' disabled';
					if (lastLocked>2) classes+=' toggledOff';
					me.l.className=classes;
					//if (me.id>0) {l('productName'+me.id).innerHTML=Beautify(me.storedTotalCps/Game.ObjectsById[me.id-1].storedTotalCps,2);}
				}
				
				//make upgrades full-opacity if we can buy them
				var lastPrice=0;
				for (var i in Game.UpgradesInStore)
				{
					var me=Game.UpgradesInStore[i];
					if (!me.bought)
					{
						var price=me.getPrice();
						var canBuy=me.canBuy();//(Game.cookies>=price);
						var enabled=(l('upgrade'+i).className.indexOf('enabled')>-1);
						if ((canBuy && !enabled) || (!canBuy && enabled)) Game.upgradesToRebuild=1;
						if (price<lastPrice) Game.storeToRefresh=1;//is this upgrade less expensive than the previous one? trigger a refresh to sort it again
						lastPrice=price;
					}
					if (me.timerDisplay)
					{
						var T=me.timerDisplay();
						if (T!=-1)
						{
							if (!l('upgradePieTimer'+i)) l('upgrade'+i).innerHTML=l('upgrade'+i).innerHTML+'<div class="pieTimer" id="upgradePieTimer'+i+'"></div>';
							T=(T*144)%144;
							l('upgradePieTimer'+i).style.backgroundPosition=(-Math.floor(T%18))*48+'px '+(-Math.floor(T/18))*48+'px';
						}
					}
					
					//if (me.canBuy()) l('upgrade'+i).className='crate upgrade enabled'; else l('upgrade'+i).className='crate upgrade disabled';
				}
			}
			Timer.track('store');
			
			if (Game.PARTY)//i was bored and felt like messing with CSS
			{
				var pulse=Math.pow((Game.T%10)/10,0.5);
				Game.l.style.filter='hue-rotate('+((Game.T*5)%360)+'deg) brightness('+(150-50*pulse)+'%)';
				Game.l.style.webkitFilter='hue-rotate('+((Game.T*5)%360)+'deg) brightness('+(150-50*pulse)+'%)';
				Game.l.style.transform='scale('+(1.02-0.02*pulse)+','+(1.02-0.02*pulse)+') rotate('+(Math.sin(Game.T*0.5)*0.5)+'deg)';
				l('wrapper').style.overflowX='hidden';
				l('wrapper').style.overflowY='hidden';
			}
			
			Timer.clean();
			if (Game.prefs.animate && ((Game.prefs.fancy && Game.drawT%1==0) || (!Game.prefs.fancy && Game.drawT%10==0)) && Game.AscendTimer==0 && Game.onMenu=='') Game.DrawBuildings();Timer.track('buildings');
			
			Game.textParticlesUpdate();Timer.track('text particles');
		}
		
		Game.NotesDraw();Timer.track('notes');
		//Game.tooltip.update();//changed to only update when the mouse is moved
		
		for (var i in Game.customDraw) {Game.customDraw[i]();}
		
		Game.drawT++;
		//if (Game.prefs.altDraw) requestAnimationFrame(Game.Draw);
	}
	
	/*=====================================================================================
	MAIN LOOP
	=======================================================================================*/
	Game.Loop=function()
	{
		Timer.say('START');
		Timer.track('browser stuff');
		Timer.say('LOGIC');
		//update game logic !
		Game.catchupLogic=0;
		Game.Logic();
		Game.catchupLogic=1;
		
		var hasFocus=document.hasFocus();
		
		//latency compensator
		Game.accumulatedDelay+=((Date.now()-Game.time)-1000/Game.fps);
		Game.accumulatedDelay=Math.min(Game.accumulatedDelay,1000*5);//don't compensate over 5 seconds; if you do, something's probably very wrong
		Game.time=Date.now();
		while (Game.accumulatedDelay>0)
		{
			Game.Logic();
			Game.accumulatedDelay-=1000/Game.fps;//as long as we're detecting latency (slower than target fps), execute logic (this makes drawing slower but makes the logic behave closer to correct target fps)
		}
		Game.catchupLogic=0;
		Timer.track('logic');
		Timer.say('END LOGIC');
		if (!Game.prefs.altDraw)
		{
			Timer.say('DRAW');
			if (!Game.prefs.altDraw && (hasFocus || Game.prefs.focus || Game.loopT%10==0)) requestAnimationFrame(Game.Draw);
			//if (document.hasFocus() || Game.loopT%5==0) Game.Draw();
			Timer.say('END DRAW');
		}
		else requestAnimationFrame(Game.Draw);
		
		//if (!hasFocus) Game.tooltip.hide();
		
		if (Game.sesame)
		{
			//fps counter and graph
			Game.previousFps=Game.currentFps;
			Game.currentFps=Game.getFps();
				var ctx=Game.fpsGraphCtx;
				ctx.drawImage(Game.fpsGraph,-1,0);
				ctx.fillStyle='rgb('+Math.round((1-Game.currentFps/Game.fps)*128)+',0,0)';
				ctx.fillRect(128-1,0,1,64);
				ctx.strokeStyle='#fff';
				ctx.beginPath();
				ctx.moveTo(128-1,(1-Game.previousFps/Game.fps)*64);
				ctx.lineTo(128,(1-Game.currentFps/Game.fps)*64);
				ctx.stroke();
			
			l('fpsCounter').innerHTML=Game.currentFps+' fps';
			var str='';
			for (var i in Timer.labels) {str+=Timer.labels[i];}
			if (Game.debugTimersOn) l('debugLog').style.display='block';
			else l('debugLog').style.display='none';
			l('debugLog').innerHTML=str;
			
		}
		Timer.reset();
		
		Game.loopT++;
		setTimeout(Game.Loop,1000/Game.fps);
	}
}


/*=====================================================================================
LAUNCH THIS THING
=======================================================================================*/
Game.Launch();
//try {Game.Launch();}
//catch(err) {console.log('ERROR : '+err.message);}

window.onload=function()
{
	
	if (!Game.ready)
	{
		if (top!=self) Game.ErrorFrame();
		else
		{
			console.log('[=== '+choose([
				'Oh, hello!',
				'hey, how\'s it hangin',
				'About to cheat in some cookies or just checking for bugs?',
				'Remember : cheated cookies taste awful!',
				'Hey, Orteil here. Cheated cookies taste awful... or do they?',
			])+' ===]');
			Game.Load();
			//try {Game.Load();}
			//catch(err) {console.log('ERROR : '+err.message);}
		}
	}
};
//汉化建筑
function cndisplayname(name){
    var cnname="";
    var temp=name;
    if(temp=="Cursor" || temp=="Cursors"){
        cnname="游标"
    }else if(temp=="Grandma" || temp=="Grandmas"){
        cnname="老奶奶"
    }else if(temp=="Farm" || temp=="Farms"){
        cnname="农场"
    }else if(temp=="Mine" || temp=="Mines"){
        cnname="矿山"
    }else if(temp=="Factory" || temp=="Factorys"){
        cnname="工厂"
    }else if(temp=="Bank" || temp=="Banks"){
        cnname="银行"
    }else if(temp=="Temple" || temp=="Temples"){
        cnname="寺庙"
    }else if(temp=="Wizard tower" || temp=="Wizard towers"){
        cnname="精灵塔"
    }else if(temp=="Shipment" || temp=="Shipments"){
        cnname="装船"
    }else if(temp=="Alchemy lab" || temp=="Alchemy labs"){
        cnname="炼金实验室"
    }else if(temp=="Portal" || temp=="Portals"){
        cnname="传送门"
    }else if(temp=="Time machine" || temp=="Time machines"){
        cnname="时光机器"
    }else if(temp=='<span style="font-size:65%;position:relative;bottom:4px;">Antimatter condenser</span>'){
        cnname='<span style="font-size:65%;position:relative;bottom:4px;">反物质冷凝器</span>'
    }else if(temp=="Antimatter condenser" || temp=="Antimatter condensers"){
        cnname="反物质冷凝器"
    }else if(temp=="Prism" || temp=="Prisms"){
        cnname="棱镜"
    }else if(temp=="Chancemaker" || temp=="Chancemakers"){
        cnname="机会制造商"
    }else{
        return name;
    }
    return cnname;
}
//汉化指令
function cnactionname(name){
    var cnactionname="";
    var temp=name;
    if(temp=="clicked"){
        cnactionname="点击"
    }else if(temp=="baked"){
        cnactionname="烘烤"
    }else if(temp=="harvested"){
        cnactionname="收获"
    }else if(temp=="mined"){
        cnactionname="开采"
    }else{
        return name;
    }
    return cnactionname;
}
//汉化职业
function cnsigle(name){
    var cnsigle="";
    var temp=name;
    if(temp=="cursor" || temp=="cursors"){
        cnsigle="游标"
    }else if(temp=="grandma" || temp=="grandmas"){
        cnsigle="老奶奶"
    }else if(temp=="farm" || temp=="farms"){
        cnsigle="农场"
    }else if(temp=="mine" || temp=="mines"){
        cnsigle="矿山"
    }else if(temp=="factory" || temp=="factories"){
        cnsigle="工厂"
    }else if(temp=="bank" || temp=="banks"){
        cnsigle="银行"
    }else if(temp=="temple" || temp=="temples"){
        cnsigle="寺庙"
    }else if(temp=="wizard tower" || temp=="wizard towers"){
        cnsigle="精灵塔"
    }else if(temp=="shipment" || temp=="shipments"){
        cnsigle="装船"
    }else if(temp=="alchemy lab" || temp=="alchemy labs"){
        cnsigle="炼金实验室"
    }else if(temp=="portal" || temp=="portals"){
        cnsigle="传送门"
    }else if(temp=="time machine" || temp=="time machines"){
        cnsigle="时光机器"
    }else if(temp=="antimatter condenser" || temp=="antimatter condensers"){
        cnsigle="反物质冷凝器"
    }else if(temp=="prism" || temp=="prisms"){
        cnsigle="棱镜"
    }else if(temp=="chancemaker" || temp=="chancemakers"){
        cnsigle="机会制造商"
    }else{
        return name;
    }
    return cnsigle;
}
};;
