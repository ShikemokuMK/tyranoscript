/*
#[playbgm]
:group
オーディオ関連
:title
BGMの再生
:exp
BGMを再生します。
再生するファイルはプロジェクトフォルダのbgmフォルダに格納してください。

ogg形式、HTML5標準をサポートします。
動作させる環境によって対応フォーマットが異なります。

基本的にogg形式を指定しておけば問題ありません。
ただし、複数のブラウザ形式の場合、IEとSafariにも対応させるためには
bgmフォルダに同名でaac形式(m4a)ファイルも配置して下さい。
すると自動的に適切なファイルを選択して再生します。

デフォルト設定ではmp3は再生できません。
Confit.tjs の mediaFormatDefaultをmp3に変更して下さい。
ただしこの場合 PCアプリとしては動作しません

:sample
[playbgm storage="music.ogg"]
:param
storage=再生する音楽ファイルを指定してください,
loop=true（デフォルト）またはfalse を指定してください。trueを指定すると繰り返し再生されます。smoothを指定すると、ループが滑らかになります。,
click=スマートフォンのブラウザから閲覧した場合のみ動作（アプリの場合不要）true またはfalse（デフォルト）を指定してください。trueの場合、スマートフォン（ブラウザ）から閲覧した場合、再生前にクリックが必要になります。これは、スマートフォンの仕様上、クリックしないと音が鳴らせない縛りがあるため、例えば、背景変更後に音楽再生をしたい場合はtrueを指定しないと音はなりません。通常のテキストの中で音楽再生の場合はfalseで大丈夫です。スマートフォンから閲覧して音楽が鳴らない場合はtrueにしてみてください,
volume=再生する音量を指定できます。0〜100 の範囲で指定して下さい。（デフォルトは100）
#[end]
*/

//音楽再生
tyrano.plugin.kag.tag.playbgm = {

    vital : ["storage"],

    pm : {
        loop : "true",
        storage : "",
        fadein : "false",
        time : 2000,
        volume : "",
        buf:"0",
        target : "bgm", //"bgm" or "se"
        click : "false", //音楽再生にクリックが必要か否か
        stop : "false" //trueの場合自動的に次の命令へ移動しない。ロード対策

    },

    start : function(pm) {

        var that = this;

        if (pm.target == "bgm" && that.kag.stat.play_bgm == false) {
            that.kag.ftag.nextOrder();
            return;
        }

        if (pm.target == "se" && that.kag.stat.play_se == false) {
            that.kag.ftag.nextOrder();
            return;
        }

        //スマホアプリの場合
        if (that.kag.define.FLAG_APRI == true) {
            
            that.playGap(pm);

            //スマホからのアクセスの場合は、クリックを挟む →廃止
        } else if ($.userenv() != "pc") {
            this.kag.layer.hideEventLayer();
            //スマホからの場合、スキップ中は音楽をならさない
            if (this.kag.stat.is_skip == true && pm.target == "se") {
                that.kag.layer.showEventLayer();
                that.kag.ftag.nextOrder();

            } else {

                if (pm.click == "true") {

                    $(".tyrano_base").bind("click.bgm", function() {

                        that.play(pm);
                        $(".tyrano_base").unbind("click.bgm");
                        that.kag.layer.showEventLayer();

                    });

                } else {

                    that.play(pm);
                    $(".tyrano_base").unbind("click.bgm");
                    //that.kag.layer.showEventLayer();

                }

            }

        } else {

            that.play(pm);

        }

    },

    play : function(pm) {

        var that = this;

        var target = "bgm";

        if (pm.target == "se") {
            target = "sound";
            this.kag.tmp.is_se_play = true;
            
            //指定されたbufがボイス用に予約されてるか否か
            if(this.kag.stat.map_vo["vobuf"][pm.buf]){
                this.kag.tmp.is_vo_play = true;
            }
            
            //ループ効果音の設定
            if(pm.stop == "false") {
                if(pm.loop=="true"){
                    this.kag.stat.current_se[pm.buf] = pm;
                }else{
                    if(this.kag.stat.current_se[pm.buf]){
                        delete this.kag.stat.current_se[pm.buf];
                    }
                }
            }
            
        }else{
            this.kag.tmp.is_audio_stopping = false;
            this.kag.tmp.is_bgm_play = true;
        }

        var volume = 1;

        if (pm.volume !== "") {
            volume = parseFloat(parseInt(pm.volume) / 100);
        } else {

            //デフォルトで指定される値を設定
            if (target === "bgm") {
                if (typeof this.kag.config.defaultBgmVolume == "undefined") {
                    volume = 1;
                } else {
                    volume = parseFloat(parseInt(this.kag.config.defaultBgmVolume) / 100);
                }
                
                //bufが指定されていて、かつ、デフォルトボリュームが指定されている場合は
                if(typeof this.kag.stat.map_bgm_volume[pm.buf] !="undefined"){
                    volume = parseFloat(parseInt(this.kag.stat.map_bgm_volume[pm.buf])/100);
                }

                
            } else {
                
                if (typeof this.kag.config.defaultSeVolume == "undefined") {
                    volume = 1;
                } else {
                    volume = parseFloat(parseInt(this.kag.config.defaultSeVolume) / 100);
                }
                
                //bufが指定されていて、かつ、デフォルトボリュームが指定されている場合は
                if(typeof this.kag.stat.map_se_volume[pm.buf] != "undefined"){
                    volume = parseFloat(parseInt(this.kag.stat.map_se_volume[pm.buf])/100);
                }
                
            }
        }
        
        var storage_url = "";
        
        var browser = $.getBrowser();
        var storage = pm.storage;

        //ogg m4a を推奨するための対応 ogg を m4a に切り替え
        //mp3 が有効になっている場合は無視する
        if (this.kag.config.mediaFormatDefault != "mp3") {
            if (browser == "msie" || browser == "safari" || browser=="edge") {
                storage = $.replaceAll(storage, ".ogg", ".m4a");
            }
        }

        if ($.isHTTP(pm.storage)) {
            storage_url = storage;
        } else {
            if(storage!=""){
                storage_url = "./data/" + target + "/" + storage;
            }else{
                storage_url ="";
            }
        }

        //音楽再生
        var audio_obj =null ;
        var is_new_audio = false;
        if(target=="bgm"){
            if(this.kag.tmp.map_bgm[pm.buf] != null){ 
                audio_obj = this.kag.tmp.map_bgm[pm.buf];
                audio_obj.src = storage_url;
            }else{
                audio_obj = new Audio(storage_url);
                is_new_audio = true;
            }
        }else{
            if(this.kag.tmp.map_se[pm.buf] != null){ 
                audio_obj = this.kag.tmp.map_se[pm.buf];
                
                //ここで、ソースが同じ場合、ストレージを変更しないようにしておけるのでは。
                
                audio_obj.src = storage_url;
                
            }else{
                audio_obj = new Audio(storage_url);
                is_new_audio = true;
            }
        }
        
        //音量指定
        audio_obj.volume = volume;

        if (pm.loop == "true") {
            audio_obj.loop = true;

            audio_obj.onended = function() {
                this.play();
            };
            
        }else if(pm.loop=="smooth"){
            
            var audio_interval = setInterval(function(){
                
                var last_time = audio_obj.duration - audio_obj.currentTime;
                if(last_time < 0.1){
                    audio_obj.currentTime = 0;
                    audio_obj.play();
                }
                
            },30);
            
            $(audio_obj).on("pause",function() {
                
                clearInterval(audio_interval);
                
            });
            
            
        }else{
            audio_obj.loop = false;
            audio_obj.onended = function() {
            };
        }


        if (target === "bgm") {
            this.kag.tmp.map_bgm[pm.buf] = audio_obj;
            that.kag.stat.current_bgm = storage;
            that.kag.stat.current_bgm_vol = pm.volume;

        } else {
            //効果音の時はバッファ指定
            //すでにバッファが存在するなら、それを消す。
            if(this.kag.tmp.map_se[pm.buf] != null){
                this.kag.tmp.map_se[pm.buf].pause();
                this.kag.tmp.map_se[pm.buf] = null;
            }
            this.kag.tmp.map_se[pm.buf] = audio_obj;
                        
        }
        
        $(audio_obj).off("play");
        $(audio_obj).on("play",function(){
            that.kag.layer.showEventLayer();
			if (pm.stop == "false") {
				that.kag.ftag.nextOrder();
        	}
        });

        audio_obj.play();
        
        if (pm.fadein == "true") {

            var vars = jQuery.extend($('<div>')[0], {
                volume : 0
            });

            $(vars).stop().animate({
                "volume" : volume
            }, {
                easing : "linear",
                duration : parseInt(pm.time),
                step : function() {
                    audio_obj.volume = this.volume;
                    // this == vars
                },
                complete : function() {
                    //alert("complete fade");
                    //that.kag.ftag.completeTrans();
                }
            });

        }
        
        //再生が完了した時
        if(is_new_audio == true){
            audio_obj.addEventListener("ended",function(e){
                  
                if (pm.target == "se") {
                    that.kag.tmp.is_se_play = false;
                    that.kag.tmp.is_vo_play = false;
                    
                    if(that.kag.tmp.is_se_play_wait == true){
                        that.kag.tmp.is_se_play_wait = false;
                        that.kag.ftag.nextOrder();
                    
                    }else if(that.kag.tmp.is_vo_play_wait==true){
                        that.kag.tmp.is_vo_play_wait = false;
                        setTimeout(function(){
                            that.kag.ftag.nextOrder();
                        },500);
                    }
                    
                }else if(pm.target == "bgm") {
                    that.kag.tmp.is_bgm_play = false;
                    
                    if(that.kag.tmp.is_bgm_play_wait == true){
                        that.kag.tmp.is_bgm_play_wait = false;
                        that.kag.ftag.nextOrder();
                    }
                    
                }
            });
        }

    },

    //phonegapで再生する
    playGap : function(pm) {
        
        
        var that = this;

        var target = "bgm";
        if (pm.target == "se") {
            target = "sound";
        }

        var audio_obj = null;

        if (target === "bgm") {
            this.kag.stat.current_bgm = pm.storage;
            this.kag.stat.current_bgm_vol = pm.volume;

        }

        //iphone の場合
        var src_url = "./data/" + target + "/" + pm.storage;

        //android ならパス表記変更
        if ($.userenv() === "android" || $.userenv() === "andoroid") {
            src_url = $.getBaseURL() + "data/" + target + "/" + pm.storage;
        }

        var audio_obj = new Media(src_url, function() {
            
            
            if (pm.loop == "true") {

                var tmp_obj = null;

                if (pm.target == "bgm") {
                    tmp_obj = that.kag.tmp.map_bgm[pm.storage];
                } else {
                    tmp_obj = that.kag.tmp.map_se[pm.buf];
                }

                if (tmp_obj != null) {
                    audio_obj.play();
                }

            }

        });

        if (pm.target == "bgm") {
            this.kag.tmp.map_bgm[pm.storage] = audio_obj;
        } else {
            this.kag.tmp.map_se[pm.buf] = audio_obj;
        }

        //audio_obj.play();
        //setTimeout(function(){audio_obj.play();},300);

        this.playAudio(audio_obj,pm,target);

        if (pm.stop == "false") {

            this.kag.ftag.nextOrder();

        }

    },

    playAudio : function(audio_obj,pm,target) {
        
        var volume =1;
        
        //ボリュームの設定
        if (pm.volume != "") {
            volume = parseFloat(parseInt(pm.volume) / 100);
        } else {
            
            //デフォルトで指定される値を設定
            if (target === "bgm") {
                if (!this.kag.config.defaultBgmVolume) {
                    volume = 1;
                } else {
                    volume = parseFloat(parseInt(this.kag.config.defaultBgmVolume) / 100);
                }
            } else {
                if (!this.kag.config.defaultSeVolume) {
                    volume = 1;
                } else {
                    volume = parseFloat(parseInt(this.kag.config.defaultSeVolume) / 100);
                }
            }
        }
        
        audio_obj.setVolume(volume);
        audio_obj.play();
    },

    //フラッシュで再生する
    playSwf : function(pm) {

        var target = "bgm";

        if (pm.target == "se") {
            target = "sound";
        }

        var repeat = 1;

        if (pm.loop == "true") {
            repeat = 9999;
        }

        var target = "bgm";
        if (pm.target == "se") {
            target = "sound";
        }

        var storage_url = "";

        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        } else {
            storage_url = "./data/" + target + "/" + pm.storage;
        }

        if (target === "bgm") {
            this.kag.stat.current_bgm = pm.storage;
            this.kag.stat.current_bgm_vol = pm.volume;

            this.kag.sound_swf.playMusic(storage_url, repeat);
        } else {
            this.kag.sound_swf.playSound(storage_url, repeat);
        }

        if (pm.stop == "false") {
            this.kag.ftag.nextOrder();
        }

    }
};

/*
 #[stopbgm]
 :group
 オーディオ関連
 :title
 BGMの停止
 :exp
 再生しているBGMの再生を停止します
 :sample
 [stopbgm ]
 :param
 #[end]
 */

tyrano.plugin.kag.tag.stopbgm = {

    pm : {
        fadeout : "false",
        time : 2000,
        target : "bgm",
        buf:"0",
        stop : "false" //trueの場合自動的に次の命令へ移動しない。ロード対策

    },

    start : function(pm) {

        var that = this;

        var target_map = null;

        if (pm.target == "bgm") {
            target_map = this.kag.tmp.map_bgm;
            that.kag.tmp.is_bgm_play = false;
            that.kag.tmp.is_bgm_play_wait = false;
            
        } else {
            target_map = this.kag.tmp.map_se;
            that.kag.tmp.is_se_play = false;
            that.kag.tmp.is_se_play_wait = false;
            
            if(pm.stop == "false") {
                if(this.kag.stat.current_se[pm.buf]){
                    delete this.kag.stat.current_se[pm.buf];
                }
            }
        }

        var browser = $.getBrowser();

        //アプリで再生している場合
        if (that.kag.define.FLAG_APRI == true) {
            //
            for (key in target_map ) {
                
                if(key==pm.buf){

                    (function() {
    
                        var _key = key;
                        var _audio_obj = null;
    
                        if (pm.target === "bgm") {
                            _audio_obj = target_map[_key];
    
                            //ロード画面の場合、再生中の音楽はそのまま、直後にロードするから
                            if (pm.stop == "false") {
                                that.kag.stat.current_bgm = "";
                                that.kag.stat.current_bgm_vol = "";

                            }
    
                        } else {
                            _audio_obj = target_map[_key];
                        }
    
                        if (pm.target === "bgm") {
                            that.kag.tmp.map_bgm[_key] = null;
                            delete that.kag.tmp.map_bgm[_key];
                        } else {
                            that.kag.tmp.map_se[_key] = null;
                            delete that.kag.tmp.map_se[_key];
                        }
    
                        //上記マップを削除した後に、ストップ処理を行うといいのではないか。
                        _audio_obj.stop();
                        _audio_obj.release();
    
                    })();
                }
            }

            //オーディオで再生している場合
        } else {

            for (key in target_map ) {

                if(key==pm.buf){

                    (function() {
    
                        var _key = key;
    
                        var _audio_obj = null;
    
                        if (pm.target === "bgm") {
                            _audio_obj = target_map[_key];
    
                            //ロード画面の場合、再生中の音楽はそのまま、直後にロードするから
                            if (pm.stop == "false") {
                                that.kag.stat.current_bgm = "";
                                that.kag.stat.current_bgm_vol = "";
                                
                            }
    
                        } else {
                            _audio_obj = target_map[_key];
                        }
    
                        //フェードアウトしながら再生停止
                        if (pm.fadeout == "true") {
                            
                            that.kag.tmp.is_audio_stopping = true;
    
                            var vars = jQuery.extend($('<div>')[0], {
                                "volume" : _audio_obj.volume
                            });
    
                            $(vars).stop().animate({
                                volume : 0
                            }, {
                                easing : "linear",
                                duration : parseInt(pm.time),
                                step : function() {
                                    
                                    if(that.kag.tmp.is_audio_stopping==false){
                                        $(vars).stop();
                                        return false    
                                    }
                                    
                                    _audio_obj.volume = this.volume;
                                    
                                    // this == vars
                                },
                                complete : function() {
                                    
                                    //if(_audio_obj.volume <= 0){
                                        that.kag.tmp.is_audio_stopping = false;
                                        _audio_obj.pause();
                                    //}
                                                                        
                                    //that.kag.ftag.completeTrans();
                                    /*
                                    if (pm.target === "bgm") {
                                        delete that.kag.tmp.map_bgm[_key];
                                    } else {
                                        delete that.kag.tmp.map_se[_key];
                                    }
                                    */
                                    
                                }
                            });
    
                        } else {
    
                            _audio_obj.pause();
    
                            if (pm.target === "bgm") {
                                //delete that.kag.tmp.map_bgm[_key];
    
                            } else {
                                //delete that.kag.tmp.map_se[_key];
    
                            }
    
                        }
    
                    })();
                }
            }
        }

        if (pm.stop == "false") {
            this.kag.ftag.nextOrder();
        }
    }
};

/*
 #[fadeinbgm]
 :group
 オーディオ関連
 :title
 BGMにフェードイン
 :exp
 BGMを徐々に再生します。
 一部環境（Firefox、Sarafi等）においては対応していません。その場合、playbgmの動作となります。
 :sample
 [fadeinbgm storage=sample.ogg loop=false time=3000]
 :param
 storage=再生する音楽ファイルを指定してください,
 loop=true（デフォルト）またはfalse を指定してください。trueを指定すると繰り返し再生されます,
 click=スマートフォンのブラウザから閲覧した場合のみ動作（アプリの場合不要）true またはfalse（デフォルト）を指定してください。trueの場合、スマートフォン（ブラウザ）から閲覧した場合、再生前にクリックが必要になります。
 これは、スマートフォンの仕様上、クリックしないと音が鳴らせない縛りがあるため、例えば、背景変更後に音楽再生をしたい場合はtrueを指定しないと音はなりません。通常のテキストの中で音楽再生の場合はfalseで大丈夫です。スマートフォンから閲覧して音楽が鳴らない場合はtrueにしてみてください,
 time=フェードインを行なっている時間をミリ秒で指定します。,
 volume=BGMの再生音量を変更できます（0〜100）
 
 #[end]
 */

tyrano.plugin.kag.tag.fadeinbgm = {

    vital : ["storage", "time"],

    pm : {
        loop : "true",
        storage : "",
        fadein : "true",
        time : 2000
    },

    start : function(pm) {
        
        if(parseInt(pm.time)<=100 ){ 
            pm.time=100;
        }
        this.kag.ftag.startTag("playbgm", pm);
    }
};

/*
 #[fadeoutbgm]
 :group
 オーディオ関連
 :title
 :exp
 再生中のBGMをフェードアウトしながら停止します。
 一部環境（Firefox、Sarafi等）においては対応していません。その場合、stopbgmの動作となります。
 :sample
 [fadeoutbgm  time=3000]
 :param
 time=フェードアウトを行なっている時間をミリ秒で指定します。
 #[end]
 */
tyrano.plugin.kag.tag.fadeoutbgm = {

    //vital:["time"],

    pm : {
        loop : "true",
        storage : "",
        fadeout : "true",
        time : 2000
    },

    start : function(pm) {
        this.kag.ftag.startTag("stopbgm", pm);
    }
};

/*
 #[xchgbgm]
 :group
 オーディオ関連
 :title
 【非推奨】BGMのクロスフェード（入れ替え）

 :exp
 【非推奨】BGMを入れ替えます。
 音楽が交差して切り替わる演出に使用できます。
 一部環境（Firefox、Safari等）において対応していません。その場合、playbgmの動作となります。
 :sample
 [xchgbgm storage=new.ogg loop=true time=3000]
 :param
 storage=次に再生するファイルを指定してください,
 loop=true（デフォルト）またはfalse を指定してください。trueを指定すると繰り返し再生されます,
 click=スマートフォンのブラウザから閲覧した場合のみ動作（アプリの場合不要）true またはfalse（デフォルト）を指定してください。trueの場合、スマートフォン（ブラウザ）から閲覧した場合、再生前にクリックが必要になります。
 これは、スマートフォンの仕様上、クリックしないと音が鳴らせない縛りがあるため、例えば、背景変更後に音楽再生をしたい場合はtrueを指定しないと音はなりません。通常のテキストの中で音楽再生の場合はfalseで大丈夫です。スマートフォンから閲覧して音楽が鳴らない場合はtrueにしてみてください,
 time=クロスフェードを行なっている時間をミリ秒で指定します。
 #[end]
 */

tyrano.plugin.kag.tag.xchgbgm = {

    vital : ["storage", "time"],

    pm : {
        loop : "true",
        storage : "",
        fadein : "true",
        fadeout : "true",
        time : 2000
    },

    start : function(pm) {

        this.kag.ftag.startTag("stopbgm", pm);
        this.kag.ftag.startTag("playbgm", pm);

    }
};

/*
 #[playse]
 :group
 オーディオ関連
 :title
 効果音の再生
 :exp
 効果音を再生します
 効果音ファイルはプロジェクトフォルダのsoundフォルダに入れてください

 ogg形式、HTML5標準をサポートします。
 動作させる環境によって対応フォーマットが異なります。

 基本的にogg形式を指定しておけば問題ありません。
 ただし、複数のブラウザ形式の場合、IEとSafariにも対応させるためには
 bgmフォルダに同名でaac形式(m4a)ファイルも配置して下さい。
 すると自動的に適切なファイルを選択して再生します。

 デフォルト設定ではmp3は再生できません。
 Confit.tjs の mediaFormatDefaultをmp3に変更して下さい。
 ただしこの場合 PCアプリとしては動作しません

 :sample
 [playse storage=sound.ogg loop=false ]
 :param
 storage=再生するファイルを指定してください,
 buf=効果音を再生するスロットを指定できます。デフォルトは0,
 click=スマホブラウザで効果音を鳴らす場合、クリック後でないと再生できません。スマホブラウザで音がならない場合trueを指定してみてください。デフォルトはfalse,
 loop=trueまたはfalse （デフォルト）を指定してください。trueを指定すると繰り返し再生されます,
 clear=trueまたはfalse(デフォルト) 他のSEが鳴っている場合、trueだと他のSEを停止した後、再生します。音声などはtrueが便利でしょう,
 volume=効果音の再生音量を変更できます（0〜100）
 #[end]
 */

tyrano.plugin.kag.tag.playse = {

    vital : ["storage"],

    pm : {
        storage : "",
        target : "se",
        volume : "",
        loop : "false",
        buf:"0",
        clear : "false" //他のSEがなっている場合、それをキャンセルして、新しく再生します
    },

    start : function(pm) {
        
        this.kag.layer.hideEventLayer();
            
        if (pm.clear == "true") {
            this.kag.ftag.startTag("stopbgm", {
                target : "se",
                stop : "true"
            });
        }

        this.kag.ftag.startTag("playbgm", pm);

    }
};

/*
 #[stopse]
 :group
 オーディオ関連
 :title
 効果音の停止
 :exp
 効果音を再生を停止します
 :sample
 [stopse ]
 :param
 buf=効果音を停止するスロットを指定できます。デフォルトは0
 #[end]
 */

tyrano.plugin.kag.tag.stopse = {

    pm : {
        storage : "",
        fadeout : "false",
        time : 2000,
        buf:"0",
        target : "se"
    },

    start : function(pm) {
        this.kag.ftag.startTag("stopbgm", pm);
    }
};

/*
 #[fadeinse]
 :group
 オーディオ関連
 :title
 効果音のフェードイン
 :exp
 です。stopse を使用して下さい
 効果音をフェードインしながら再生します
 :sample
 [fadeinse storage=sound.ogg loop=false time=2000 ]
 :param
 storage=次に再生するファイルを指定してください,
 loop=trueまたはfalse （デフォルト）を指定してください。trueを指定すると繰り返し再生されます,
 buf=効果音を停止するスロットを指定できます。デフォルトは0,
 time=フェードインの時間をミリ秒で指定します
 #[end]
 */

tyrano.plugin.kag.tag.fadeinse = {

    vital : ["storage", "time"],

    pm : {
        storage : "",
        target : "se",
        loop : "false",
        volume : "",
        fadein : "true",
        buf:"0",
        time : "2000"

    },

    start : function(pm) {
        
        if(parseInt(pm.time)<=100 ){ 
            pm.time=100;
        }
        
        this.kag.ftag.startTag("playbgm", pm);

    }
};

/*
 #[fadeoutse]
 :group
 オーディオ関連
 :title
 効果音の停止
 :exp
 効果音をフェードアウトします
 :sample
 [fadeoutse time=2000 ]
 :param
 time=フェードアウトを行なっている時間をミリ秒で指定します。
 buf=効果音を停止するスロットを指定できます。デフォルトは0,
 #[end]
 */

tyrano.plugin.kag.tag.fadeoutse = {

    pm : {
        storage : "",
        target : "se",
        loop : "false",
        buf:"0",
        fadeout : "true"
    },

    start : function(pm) {

        this.kag.ftag.startTag("stopbgm", pm);

    }
};

/*
 #[bgmopt]
 :group
 オーディオ関連
 :title
 BGM設定
 :exp
 BGMの設定を変更できます
 音量設定については スマートフォンブラウザからの閲覧の場合、端末の制限により変更できません。
 :sample
 [bgmopt volume=50 ]
 :param
 volume=BGMの再生音量を変更できます（0〜100）,
 effect=true false を指定して下さい（デフォルトはtrue） trueだと再生中のBGMに即反映します,
 buf=設定を変更するスロットを指定できます。指定がない場合はすべてのスロットが対象になります
 #[end]
 */

tyrano.plugin.kag.tag.bgmopt = {

    pm : {
        volume : "100",
        effect : "true",
        buf    : ""
    },

    start : function(pm) {
        //再生中のBGMに変更を加える
        var map_bgm = this.kag.tmp.map_bgm;
        
        //バッファが設定されている場合
        if(pm.buf !=""){
            this.kag.stat.map_bgm_volume[pm.buf] = pm.volume;
        }else{
            this.kag.stat.map_bgm_volume = {};
            this.kag.config.defaultBgmVolume = pm.volume;
        }

        //すぐに反映 スマホアプリの場合はすぐに変更はできない
        if (pm.effect == "true" && this.kag.define.FLAG_APRI == false) {
            
            var new_volume = parseFloat(parseInt(pm.volume) / 100);

            if(pm.buf ==""){
                for (key in map_bgm) {
                    if(map_bgm[key]){
                        map_bgm[key].volume = new_volume;
                    }
                }
            }else{
                if(map_bgm[pm.buf]){
                    map_bgm[pm.buf].volume = new_volume;
                }    
            }


        }

        //this.kag.ftag.nextOrder();
        
        //この中でnextOrderしてる
        this.kag.ftag.startTag("eval", {"exp":"sf._system_config_bgm_volume = "+pm.volume});
        

    }
};

/*
 #[seopt]
 :group
 オーディオ関連
 :title
 SE設定
 :exp
 SEの設定を変更できます
 音量設定については スマートフォンブラウザからの閲覧の場合、端末の制限により変更できません。
 :sample
 [seopt volume=50 ]
 :param
 volume=SEの再生音量を変更できます（0〜100）,
 effect=true false を指定して下さい（デフォルトはtrue） trueだと再生中のBGMに即反映します,
 buf=設定を変更するスロットを指定できます。指定がない場合はすべてのスロットが対象になります
 #[end]
 */

tyrano.plugin.kag.tag.seopt = {

    pm : {
        volume : "100",
        effect : "true",
        buf:""
    },

    start : function(pm) {
        //再生中のBGMに変更を加える
        var map_se = this.kag.tmp.map_se;
        
        //バッファが設定されている場合
        if(pm.buf !=""){
            this.kag.stat.map_se_volume[pm.buf] = pm.volume;
        }else{
            this.kag.stat.map_se_volume = {};
            this.kag.config.defaultSeVolume = pm.volume;
        }
        
        //すぐに反映
        if (pm.effect == "true" && this.kag.define.FLAG_APRI == false) {
        
            var new_volume = parseFloat(parseInt(pm.volume) / 100);
            
            if(pm.buf ==""){
                for (key in map_se) {
                    
                    if(map_se[key]){
                        map_se[key].volume = new_volume;
                    }
                }
            }else{
                if(map_se[pm.buf]){
                    map_se[pm.buf].volume = new_volume;    
                }
            }
            
        }
        
        //この中でnextOrderしてる
        this.kag.ftag.startTag("eval", {"exp":"sf._system_config_se_volume = "+pm.volume});
        

        //this.kag.ftag.nextOrder();

    }
};

/*
#[wbgm]
:group
オーディオ関連
:title
BGMの再生完了を待つ
:exp
BGMの再生完了を待ちます。playbgmでループ再生している場合は永遠に止まりますのでご注意下さい。
このタグはPCゲーム、ブラウザゲームで利用できます。
スマホアプリでは利用できませんのでご注意ください。
:sample
:param
#[end]
*/

//BGMのフェード完了を待ちます
tyrano.plugin.kag.tag.wbgm = {

    pm : {
    },
    start : function() {
        
         //今、音楽再生中なら、
        if(this.kag.tmp.is_bgm_play == true){
            //this.kag.layer.hideEventLayer();
            this.kag.tmp.is_bgm_play_wait = true;
        }else{
            this.kag.ftag.nextOrder();
        }

    }
};

/*
#[wse]
:group
オーディオ関連
:title
効果音の再生完了を待つ
:exp
効果音の再生完了を待ちます。
このタグはPCゲーム、ブラウザゲームで利用できます。
スマホアプリでは利用できませんのでご注意ください。
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag.wse = {

    pm : {
    },
    start : function() {
        
        //今、音楽再生中なら、
        
        if(this.kag.tmp.is_se_play == true){
            //this.kag.layer.hideEventLayer();
            this.kag.tmp.is_se_play_wait = true;
        }else{
            this.kag.ftag.nextOrder();
        }
        
    }
};

/*
#[voconfig]
:group
オーディオ関連
:title
ボイスの再生設定
:exp
ボイスを効率的に再生するための設定ができます。
キャラクター名と音声ファイル名を関連させておくことで
キャラ名表示のタイミングで音声ファイルを順番に再生させることができます。
このタグで設定をした後、[vostart]タグで自動再生を開始しないと有効になりません。

:sample
[voconfig sebuf=2 name="akane" vostorage="akane_{number}.ogg" number=1 ]
[voconfig sebuf=2 name="yamato" vostorage="yamato_{number}.ogg" number=1 ]

;音声自動再生を開始する。必ず必要です。
[vostart]

#akane
ここで音声再生(akane_1.ogg)[p]

#akane
次の音声再生(akane_2.ogg)[p]

#yamato
やまとの音声再生(yamato_1.ogg)[p]

#akane
あかねの音声再生(akane_3.ogg)[p]

:param
sebuf=ボイスで使用するplayseのbufを指定してください,
name=ボイスを再生するキャラクター名を指定します。[chara_new ]タグのnameパラメータです,
vostorage=音声ファイルとして使用するファイル名のテンプレートを指定します。{number}の部分に再生されることに+1された数字が入っていきます,
number=デフォルトは０。vostorageで適応する数字をここで指定した値にリセットできます

 
#[end]
*/

tyrano.plugin.kag.tag.voconfig = {

    pm : {
        sebuf:"0",
        name:"",
        vostorage:"",
        number:""
    },
    start : function(pm) {
        
        var map_vo = this.kag.stat.map_vo; 
        
        //ボイスバッファに指定する
        this.kag.stat.map_vo["vobuf"][pm.sebuf] = 1;
        
        if(pm.name!=""){
            
            var vochara = {};
            if(this.kag.stat.map_vo["vochara"][pm.name]){
                vochara = this.kag.stat.map_vo["vochara"][pm.name];
            }else{
                vochara = {
                    "vostorage":"",
                    "buf":pm.sebuf,
                    "number":0
                };
            }
            
            if(pm.vostorage !=""){
                vochara["vostorage"] = pm.vostorage;
            }
            
            if(pm.number != ""){
                vochara["number"] = pm.number;
            }
            
            this.kag.stat.map_vo["vochara"][pm.name] = vochara;
        
        }
        
        
        this.kag.ftag.nextOrder();
        
        
    }
};


/*
#[vostart]
:group
オーディオ関連
:title
ボイス自動再生開始
:exp
voconfigで指定したボイスの自動再生を開始します。
コレ以降、#で名前を指定した場合、紐付いたボイスが再生されていきます。
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag.vostart = {

    pm : {
    },
    start : function() {
        
        this.kag.stat.vostart = true;
        this.kag.ftag.nextOrder();
            
    }
};

/*
#[vostop]
:group
オーディオ関連
:title
ボイス自動再生停止
:exp
voconfigで指定したボイスの自動再生を停止します。
コレ以降、#で名前を指定しても、ボイスが紐付いて再生されることを防ぎます。
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag.vostop = {

    pm : {
    },
    start : function() {
        
        this.kag.stat.vostart = false;
        this.kag.ftag.nextOrder();
            
    }
};


