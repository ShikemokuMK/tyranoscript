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
loop=true（デフォルト）またはfalse を指定してください。trueを指定すると繰り返し再生されます,
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

            //スマホからのアクセスの場合は、クリックを挟む
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
                    that.kag.layer.showEventLayer();

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
        }else{
            this.kag.tmp.is_bgm_play = true;
        }

        var volume = 1;

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

        var storage_url = "";

        var browser = $.getBrowser();
        var storage = pm.storage;

        //ogg m4a を推奨するための対応 ogg を m4a に切り替え
        //mp3 が有効になっている場合は無視する
        if (this.kag.config.mediaFormatDefault != "mp3") {
            if (browser == "msie" || browser == "safari") {
                storage = $.replaceAll(storage, ".ogg", ".m4a");
            }
        }

        if ($.isHTTP(pm.storage)) {
            storage_url = storage;
        } else {
            storage_url = "./data/" + target + "/" + storage;
        }

        //音楽再生
        var audio_obj = new Audio(storage_url);

        //音量指定
        audio_obj.volume = volume;

        if (pm.loop == "true") {
            audio_obj.loop = true;

            audio_obj.onended = function() {
                this.play();
            };
        }

        if (target === "bgm") {
            this.kag.tmp.map_bgm[storage] = audio_obj;
            that.kag.stat.current_bgm = storage;

        } else {
            this.kag.tmp.map_se[storage] = audio_obj;
        }

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
        audio_obj.addEventListener("ended",function(){
            
            if (pm.target == "se") {
                that.kag.tmp.is_se_play = false;
                
                if(that.kag.tmp.is_se_play_wait == true){
                    that.kag.tmp.is_se_play_wait = false;
                    that.kag.ftag.nextOrder();
                }
                
            }else if(pm.target == "bgm") {
                that.kag.tmp.is_bgm_play = false;
                
                if(that.kag.tmp.is_bgm_play_wait == true){
                    that.kag.tmp.is_bgm_play_wait = false;
                    that.kag.ftag.nextOrder();
                }
                
            }
        });

        if (pm.stop == "false") {

            this.kag.ftag.nextOrder();
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
                    tmp_obj = that.kag.tmp.map_se[pm.storage];
                }

                if (tmp_obj != null) {
                    audio_obj.play();
                }

            }

        });

        if (pm.target == "bgm") {
            this.kag.tmp.map_bgm[pm.storage] = audio_obj;
        } else {
            this.kag.tmp.map_se[pm.storage] = audio_obj;
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
        }

        var browser = $.getBrowser();

        //アプリで再生している場合
        if (that.kag.define.FLAG_APRI == true) {
            //
            for (key in target_map ) {

                (function() {

                    var _key = key;
                    var _audio_obj = null;

                    if (pm.target === "bgm") {
                        _audio_obj = target_map[_key];

                        //ロード画面の場合、再生中の音楽はそのまま、直後にロードするから
                        if (pm.stop == "false") {
                            that.kag.stat.current_bgm = "";
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

            //フラッシュで再生している場合
        } else {

            for (key in target_map ) {

                (function() {

                    var _key = key;

                    var _audio_obj = null;

                    if (pm.target === "bgm") {
                        _audio_obj = target_map[_key];

                        //ロード画面の場合、再生中の音楽はそのまま、直後にロードするから
                        if (pm.stop == "false") {
                            that.kag.stat.current_bgm = "";
                        }

                    } else {
                        _audio_obj = target_map[_key];
                    }

                    //フェードアウトしながら再生停止
                    if (pm.fadeout == "true") {

                        var vars = jQuery.extend($('<div>')[0], {
                            "volume" : _audio_obj.volume
                        });

                        $(vars).stop().animate({
                            volume : 0
                        }, {
                            easing : "linear",
                            duration : parseInt(pm.time),
                            step : function() {
                                _audio_obj.volume = this.volume;
                                // this == vars
                            },
                            complete : function() {
                                _audio_obj.pause();
                                //that.kag.ftag.completeTrans();
                            }
                        });

                    } else {

                        _audio_obj.pause();

                        if (pm.target === "bgm") {
                            delete that.kag.tmp.map_bgm[_key];

                        } else {
                            delete that.kag.tmp.map_se[_key];

                        }

                    }

                })();

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
 一部環境（Firefox、Sarafi等）においては対応していません。その場合、playbgmの動作となります。
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
        clear : "false" //他のSEがなっている場合、それをキャンセルして、新しく再生します
    },

    start : function(pm) {

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
 #[end]
 */

tyrano.plugin.kag.tag.stopse = {

    pm : {
        storage : "",
        fadeout : "false",
        time : 2000,
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
 #[end]
 */

tyrano.plugin.kag.tag.fadeoutse = {

    pm : {
        storage : "",
        target : "se",
        loop : "false",
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
 effect=true false を指定して下さい（デフォルトはtrue） trueだと再生中のBGMに即反映します
 #[end]
 */

tyrano.plugin.kag.tag.bgmopt = {

    pm : {
        volume : "100",
        effect : "true"
    },

    start : function(pm) {
        //再生中のBGMに変更を加える
        var map_bgm = this.kag.tmp.map_bgm;
        
        this.kag.config.defaultBgmVolume = pm.volume;
        this.kag.ftag.startTag("eval", {"exp":"sf._system_config_bgm_volume = "+pm.volume});
        
        var new_volume = parseFloat(parseInt(pm.volume) / 100);

        //すぐに反映 スマホアプリの場合はすぐに変更はできない
        if (pm.effect == "true" && this.kag.define.FLAG_APRI == false) {
            for (key in map_bgm) {
                map_bgm[key].volume = new_volume;
            }
        }

        this.kag.ftag.nextOrder();

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
 effect=true false を指定して下さい（デフォルトはtrue） trueだと再生中のBGMに即反映します
 #[end]
 */

tyrano.plugin.kag.tag.seopt = {

    pm : {
        volume : "100",
        effect : "true"
    },

    start : function(pm) {
        //再生中のBGMに変更を加える
        var map_se = this.kag.tmp.map_se;
        this.kag.config.defaultSeVolume = pm.volume;
        this.kag.ftag.startTag("eval", {"exp":"sf._system_config_se_volume = "+pm.volume});
        
        var new_volume = parseFloat(parseInt(pm.volume) / 100);

        //すぐに反映
        if (pm.effect == "true" && this.kag.define.FLAG_APRI == false) {
            for (key in map_se) {
                map_se[key].volume = new_volume;
            }
        }

        this.kag.ftag.nextOrder();

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

//未実装　seの再生終了を待ちます
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
 [fadeinbgm storage="e:3" time=5000]
 再生中・・・停止するにはクリックしてください。[l]
 [fadeoutbgm time=5000]
 */

