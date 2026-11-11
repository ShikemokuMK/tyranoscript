(function ($, TYRANO) {

// oscillatorNode.typeの文字列と数値対応
var TYPE_TO_NUMBER = {
    "sine"    : 0,
    "square"  : 1,
    "sawtooth": 2,
    "triangle": 3
};

// 音程の文字列と数値対応
var FREQUENCY = {
    "A" :    0,
    "A+":  100,
    "B" :  200,
    "B+":  300,
    "C" :  300,
    "C+":  400,
    "D" :  500,
    "D+":  600,
    "E" :  700,
    "E+":  800,
    "F" :  800,
    "F+":  900,
    "G" : 1000,
    "G+": 1100,
};

// AudioContext
var AudioContext = window.AudioContext || window.webkitAudioContext;

//# TYRANO.kag.stat.popopo
TYRANO.kag.stat.popopo = {
    volume        :  "default",
    time          :       0.02,
    tailtime      :       0.03,
    frequency     :          0,
    octave        :          0,
    interval      :         80,
    type          :     "sine",
    mode          : "everyone",
    buf           :        "0",
    storage       :     "none",
    samplerate    :      44000,
    noplaychars   : "…・、。「」（）　 "
}

var newtag = {};

//# [popopo]
// TYRANO.kag.stat.popopoを書き換える
newtag.popopo = {
    pm: {
        volume    : "",
        time      : "",
        tailtime  : "",
        frequency : "",
        octave    : "",
        type      : "",
        mode      : "",
        buf       : "",
        storage   : "",
        samplerate: ""
    },
    start: function (pm) {
        var popopo = this.kag.stat.popopo;
        var f = 0, is_set = false;
        if (pm.volume     !== "") popopo.volume     = pm.volume;
        if (pm.time       !== "") popopo.time       = parseInt(pm.time) / 1000;
        if (pm.tailtime   !== "") popopo.time       = parseInt(pm.tailtime) / 1000;
        if (pm.frequency  !== "") popopo.frequency  = FREQUENCY[pm.frequency];
        if (pm.octave     !== "") popopo.octave     = parseInt(pm.octave);
        if (pm.type       !== "") popopo.type       = pm.type;
        if (pm.mode       !== "") popopo.mode       = pm.mode;
        if (pm.buf        !== "") popopo.buf        = pm.buf;
        if (pm.storage    !== "") popopo.storage    = pm.storage;
        if (pm.samplerate !== "") popopo.samplerate = parseInt(pm.samplerate);
        if (typeof pm.noplaychars === "string") popopo.noplaychars = pm.noplaychars;
        this.kag.ftag.nextOrder();
    }
};

// タグを登録
for (var key in newtag) {
    newtag[key].kag = TYRANO.kag;
    TYRANO.kag.ftag.master_tag[key] = TYRANO.kag.tag[key] = newtag[key];
}

// AudioContextが偽の場合はここで終了する
if (! AudioContext) {
    return;
}

//# TYRANO.kag.popopo
TYRANO.kag.popopo = {
    kag: TYRANO.kag
};

TYRANO.kag.popopo.audioContext = new AudioContext();
TYRANO.kag.popopo.audioContext.createGain = TYRANO.kag.popopo.audioContext.createGain || TYRANO.kag.popopo.audioContext.createGainNode;
TYRANO.kag.popopo.gainNode = TYRANO.kag.popopo.audioContext.createGain();
TYRANO.kag.popopo.gainNode.gain.value = 0;
TYRANO.kag.popopo.gainNode.connect(TYRANO.kag.popopo.audioContext.destination);

//# TYRANO.kag.popopo.file
TYRANO.kag.popopo.file = {
    everyone: {
        start: function (message_str, ch_speed) {
        },
        play: function (ch) {
            var pm = TYRANO.kag.stat.popopo;
            if (pm.noplaychars.indexOf(ch) > -1) return;
            var volume = pm.volume;
            if (volume === "default") {
                volume = "";
            }
            TYRANO.kag.ftag.startTag("playse", {
                volume : volume,
                buf    : pm.buf,
                storage: pm.storage,
                stop   : true
            });
        },
        stop: function (message_str, ch_speed) {
        }
    },
    interval: {
        start: function (message_str, ch_speed) {
            var pm = TYRANO.kag.stat.popopo;
            if (pm.volume === "default") {
                pm.volume = "";
            }
            var interval = pm.interval || 100;
            var count = Math.ceil(message_str.length * ch_speed / interval);
            var i = 0;
            var play = function () {
                TYRANO.kag.ftag.startTag("playse", {
                    volume : pm.volume,
                    buf    : pm.buf,
                    storage: pm.storage,
                    stop   : true
                });
                if (++i >= count) {
                    clearInterval(TYRANO.kag.popopo_timer);
                }
            }
            clearInterval(TYRANO.kag.popopo_timer);
            TYRANO.kag.popopo_timer = setInterval(play, interval);
            play();
        },
        play: function (ch) {
        },
        stop: function (message_str, ch_speed) {
            clearInterval(TYRANO.kag.popopo_timer);
        }
    }
};

//# TYRANO.kag.popopo.createNode
// オシレーターノードを作るぞ
TYRANO.kag.popopo.createNode = function (pm) {
    if (pm.type === "noise") {
        return this.noise.createNoise(pm);
    }
    else {
        var node = this.audioContext.createOscillator();
        node.detune.value = pm.frequency + pm.octave * 1200;
        node.type         = (typeof node.type === "string") ? pm.type : TYPE_TO_NUMBER[pm.type];
        node.start        = node.start || node.noteOn;
        node.stop         = node.stop  || node.noteOff;
        node.connect(this.gainNode);
        node.start();
        return node;
    }
};

//# TYRANO.kag.popopo.createNoise
// オシレーターノード（ノイズ）を作る
TYRANO.kag.popopo.noise = {
    cache: {},
    createNoise: function (pm) {
        var audioContext = TYRANO.kag.popopo.audioContext;
        var sampleRate = Math.min(Math.max(3000, parseInt(pm.samplerate) || 44000), 192000);
        var noiseBuffer;
        if (this.cache[sampleRate]) {
            noiseBuffer = this.cache[sampleRate];
        }
        else {
            var bufferSize = audioContext.sampleRate;
            noiseBuffer = audioContext.createBuffer(1, bufferSize, sampleRate);
            var output = noiseBuffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            this.cache[sampleRate] = noiseBuffer;
        }
        var whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.start(0);
        whiteNoise.connect(TYRANO.kag.popopo.gainNode);
        whiteNoise.stop = function () {
            whiteNoise.disconnect();
        };
        return whiteNoise;
    }
};

//# TYRANO.kag.popopo.wave
// 音声を生成・再生・終了する
TYRANO.kag.popopo.wave = {
    // 文字毎
    everyone: {
        start: function (message_str, ch_speed) {
            var pm = TYRANO.kag.stat.popopo;
            if (pm.volume === "default") {
                pm._volume = parseInt(TYRANO.kag.config.defaultSeVolume) / 100;
            }
            else {
                pm._volume = parseInt(pm.volume) / 100;
            }
            TYRANO.kag.popopo.oscillatorNode = TYRANO.kag.popopo.createNode(pm);
        },
        play: function (ch) {
            var t0  = TYRANO.kag.popopo.audioContext.currentTime;
            var pm = TYRANO.kag.stat.popopo;
            if (pm.noplaychars.indexOf(ch) > -1) return;
            TYRANO.kag.popopo.gainNode.gain.setTargetAtTime(pm._volume, t0, 0);
            TYRANO.kag.popopo.gainNode.gain.setTargetAtTime(0, t0 + pm.time, pm.tailtime);
        },
        stop: function (message_str, ch_speed) {
            var t0  = TYRANO.kag.popopo.audioContext.currentTime;
            var pm = TYRANO.kag.stat.popopo;
            TYRANO.kag.popopo.gainNode.gain.setTargetAtTime(0, t0 + pm.time, pm.tailtime);
            TYRANO.kag.popopo.oscillatorNode.stop(t0 + pm.tailtime);
            TYRANO.kag.popopo.oscillatorNode = null;
        }
    },
    // 定間隔
    interval: {
        start: function (message_str, ch_speed) {
            var pm = TYRANO.kag.stat.popopo;
            if (pm.volume === "default") {
                pm._volume = parseInt(TYRANO.kag.config.defaultSeVolume) / 100;
            }
            else {
                pm._volume = parseInt(pm.volume) / 100;
            }
            TYRANO.kag.popopo.oscillatorNode = TYRANO.kag.popopo.createNode(pm);
            
            var t0  = TYRANO.kag.popopo.audioContext.currentTime;
            var gainNode = TYRANO.kag.popopo.gainNode;
            var interval = pm.interval || 100;
            var count = Math.ceil(message_str.length * ch_speed / interval);
            interval /= 1000;
            var t = t0;
            for (var i = 0; i < count; i++) {
                gainNode.gain.setTargetAtTime(pm._volume, t, 0);
                gainNode.gain.setTargetAtTime(0, t + pm.time, pm.tailtime);
                t += interval;
            }
        },
        play: function (ch) {
        },
        stop: function (message_str, ch_speed) {
            var t0  = TYRANO.kag.popopo.audioContext.currentTime;
            var pm = TYRANO.kag.stat.popopo;
            var gainNode = TYRANO.kag.popopo.gainNode;
            TYRANO.kag.popopo.oscillatorNode.stop(t0 + pm.time);
            TYRANO.kag.popopo.oscillatorNode = null;
        }
    }
};

tyrano.plugin.kag.tag.configdelay.start = function (pm) {
    if (pm.speed != "") {
        this.kag.stat.ch_speed = "";
        this.kag.config.chSpeed = pm.speed;
        this.kag.ftag.startTag("eval", {"exp":"sf._config_ch_speed = "+pm.speed});
    }else{
        this.kag.ftag.nextOrder();
    }
};

TYRANO.kag.tag.text.showMessage = function (message_str, pm) {
    var that = this;
    //特定のタグが直前にあった場合、ログの作り方に気をつける
    if(that.kag.stat.log_join=="true"){
        pm.backlog="join";
    }
    //バックログ用の値を格納
    var chara_name = $.isNull($(".chara_name_area").html());
    if((chara_name != "" && pm.backlog!="join") || (chara_name!="" && this.kag.stat.f_chara_ptext=="true")){
        this.kag.pushBackLog("<b class='backlog_chara_name "+chara_name+"'>"+chara_name+"</b>：<span class='backlog_text "+chara_name+"'>"+message_str+"</span>","add");
        if(this.kag.stat.f_chara_ptext=="true"){
            this.kag.stat.f_chara_ptext="false";
            this.kag.stat.log_join = "true";
        }
    }else{
        var log_str = "<span class='backlog_text "+chara_name+"'>"+ message_str +"</span>";
        if(pm.backlog=="join"){
            this.kag.pushBackLog(log_str,"join");
        }else{
            this.kag.pushBackLog(log_str,"add");
        }
    }
    //テキスト表示時に、まず、画面上の次へボタンアイコンを抹消
    that.kag.ftag.hideNextImg();
    (function(jtext) {
        if (jtext.html() == "") {
            //タグ作成
            jtext.append("<p class=''></p>");
        }
        var _message_str = message_str;
        var current_str = "";
        if (jtext.find("p").find(".current_span").length != 0) {
            current_str = jtext.find("p").find(".current_span").html();
        }
        var index = 0;
        //jtext.html("");
        that.kag.checkMessage(jtext);
        //メッセージ領域を取得
        var j_span = that.kag.getMessageCurrentSpan();
        j_span.css({
                    "color":that.kag.stat.font.color,
                    "font-weight": that.kag.stat.font.bold,
                    "font-size": that.kag.stat.font.size + "px",
                    "font-family": that.kag.stat.font.face,
                    "font-style":that.kag.stat.font.italic
                    });
        if(that.kag.stat.font.edge !=""){
            var edge_color = that.kag.stat.font.edge;
            j_span.css("text-shadow","1px 1px 0 "+edge_color+", -1px 1px 0 "+edge_color+",1px -1px 0 "+edge_color+",-1px -1px 0 "+edge_color+"");
        }else if(that.kag.stat.font.shadow != ""){
            //j_span.css()
            j_span.css("text-shadow","2px 2px 2px "+that.kag.stat.font.shadow);
        }
        //既読管理中の場合、現在の場所が既読済みなら、色を変える 
        if(that.kag.config.autoRecordLabel == "true"){
            if(that.kag.stat.already_read == true){
                //テキストの色調整
                if(that.kag.config.alreadyReadTextColor !="default"){
                    j_span.css("color",$.convertColor(that.kag.config.alreadyReadTextColor));
                }
            }else{
                //未読スキップがfalseの場合は、スキップ停止
                if(that.kag.config.unReadTextSkip == "false"){
                    that.kag.stat.is_skip = false;
                }
            }
        }
        var ch_speed = 30;
        if(that.kag.stat.ch_speed != ""){
            ch_speed = parseInt(that.kag.stat.ch_speed);
        }else if(that.kag.config.chSpeed){
            ch_speed = parseInt(that.kag.config.chSpeed);
        }
        /*　// バグ is_nowaitが必ずtrueに戻るね。
        if(ch_speed <= 3){
            that.kag.stat.is_nowait = true;
        }else{
            that.kag.stat.is_nowait = false;
        }
        */
        /*[追加]==================================================================================*/
        var key = that.kag.stat.popopo.type;
        if (key === "file") {
        }
        else if (key === "none") {
            key = "";
        }
        else {
            key = "wave";
        }
        if (key) {
            var key2 = that.kag.stat.popopo.mode;
            var popopo = that.kag.popopo[key][key2];
            popopo.start(message_str, ch_speed);
        }
        /*========================================================================================*/
        var pchar = function(pchar) {
            var c = _message_str.substring(index, ++index);
            /*[追加]==============================================================================*/
            var _c = c;
            /*====================================================================================*/
            //ルビ指定がされている場合
            if (that.kag.stat.ruby_str != "") {
                c = "<ruby><rb>" + c + "</rb><rt>" + that.kag.stat.ruby_str + "</rt></ruby>";
                that.kag.stat.ruby_str = "";
            }
            current_str += c;
            //スキップ中は１文字ずつ追加ということはしない
            if(that.kag.stat.is_skip != true && that.kag.stat.is_nowait!=true && ch_speed >3){
                that.kag.appendMessage(jtext, current_str);
            }
            if (index <= _message_str.length) {
                that.kag.stat.is_adding_text = true;
                //再生途中にクリックされて、残りを一瞬で表示する
                if (that.kag.stat.is_click_text == true || that.kag.stat.is_skip == true || that.kag.stat.is_nowait == true) {
                    //setTimeout(function() {
                        pchar(pchar);
                    //}, 0);
                } else {
                    /*[追加]======================================================================*/
                    if (key) {
                        popopo.play(_c);
                    }
                    /*============================================================================*/
                    setTimeout(function() {
                        pchar(pchar);
                    }, ch_speed);
                }
            } else {
                /*[追加]==========================================================================*/
                if (key) {
                    popopo.stop();
                }
                /*================================================================================*/
                that.kag.stat.is_adding_text = false;
                that.kag.stat.is_click_text = false;
                //すべて表示完了 ここまではイベント残ってたな
                if (that.kag.stat.is_stop != "true") {
                    if(that.kag.stat.is_skip == true || that.kag.stat.is_nowait==true || ch_speed < 3){
                        that.kag.appendMessage(jtext, current_str);
                        setTimeout(function(){
                            if (!that.kag.stat.is_hide_message) that.kag.ftag.nextOrder();
                         }, parseInt(that.kag.config.skipSpeed));
                    }else{
                        if (!that.kag.stat.is_hide_message) that.kag.ftag.nextOrder();
                    }
                } else {
                }
                //メッセージ用
                //that.kag.appendMessage(jtext,current_str+"<img class='img_next' src='./tyrano/images/kag/nextpage.gif' />");
            }
        };
        pchar(pchar);
    })(this.kag.getMessageInnerLayer());
};
}(window.jQuery, window.TYRANO));