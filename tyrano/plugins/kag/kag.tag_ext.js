//スクリプトの評価

/*
 #[loadjs]
 :group
 マクロ・変数・JS操作
 :title
 外部JavaScriptファイル読み込み
 :exp
 外部JavaScriptファイルをロードします
 無制限な機能拡張が可能です
 JSファイルは/data/others フォルダ以下に格納してください
 :sample
 [loadjs storage="sample.js"  ]
 :param
 storage=ロードするJSファイルを指定します
 #[end]
 */

tyrano.plugin.kag.tag.loadjs = {

    vital : ["storage"],

    pm : {
        storage : ""
    },

    start : function(pm) {

        var that = this;

        $.getScript("./data/others/" + pm.storage, function() {
            that.kag.ftag.nextOrder();
        });

    }
};

/*
 #[movie]
 :group
 その他
 :title
 ムービーの再生
 :exp
 ogv webm mp4 などに対応します
 提供するゲームによって対応するフォーマットが異なります。
 PCゲーム形式の場合は webm形式を使ってください。 mp4 に対応しません。
 ブラウザゲームの場合はmp4ファイルを使用します。ただし、FireFox Opera を含む全てのブラウザに対応させる場合は同名のwebmファイルも配置して下さい

 :sample
 [movie storage="" skip=false ]
 :param
 storage=再生するogv webm mp4ファイルを指定してください,
 skip=動画再生中に途中でスキップ可能か否かを指定します true か false を指定してください,
 volume=ビデオの音量を指定できます 0〜100の間で指定して下さい。デフォルトは100
 #[end]
 */

tyrano.plugin.kag.tag.movie = {

    vital : ["storage"],

    pm : {
        storage : "",
        volume : "",
        skip : "false",
        //隠しパラメータ
        bgmode : "false",
        loop : "false"

    },

    start : function(pm) {

        var that = this;

        if ($.userenv() != "pc") {
            this.kag.layer.showEventLayer();
            
            //mp4で再生できる
            //ティラノプレイヤーの場合は、そのまま再生できる。
            if($.isTyranoPlayer()){
                that.playVideo(pm);
            }else{
                this.kag.layer.showEventLayer();
                //$(".tyrano_base").bind("click.movie", function (e) {
                    that.playVideo(pm);
                    $(".tyrano_base").unbind("click.movie")
                //});
            }
            
        } else {

            //firefox opera の場合、webMに変更する。
            if ($.getBrowser() == "firefox" || $.getBrowser() == "opera") {
                pm.storage = $.replaceAll(pm.storage, ".mp4", ".webm");
            }

            that.playVideo(pm);
        }

    },

    playVideo : function(pm) {

        var that = this;

        var url = "./data/video/" + pm.storage;

        var video = document.createElement('video');
        video.id = "bgmovie";
        //video.setAttribute('myvideo');
        video.src = url;

        if (pm.volume != "") {
            video.volume = parseFloat(parseInt(pm.volume) / 100);
        } else {

            if ( typeof this.kag.config.defaultMovieVolume != "undefined") {
                video.volume = parseFloat(parseInt(this.kag.config.defaultMovieVolume) / 100);
            }
        }


        //top:0px;left:0px;width:100%;height:100%;'";

        video.style.backgroundColor = "black";
        video.style.position = "absolute";
        video.style.top = "0px";
        video.style.left = "0px";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.display = "none";
        video.autoplay = true;
        video.autobuffer = true;
        
        video.setAttribute("playsinline","1");
        
        //document.createElement("video");

        if (pm.bgmode == "true") {

            that.kag.tmp.video_playing = true;

            //背景モード
            video.style.zIndex = 0;

            if (pm.loop == "true") {
                video.loop = true;
            } else {
                video.loop = false;
            }

            video.addEventListener("ended", function(e) {
                
                //alert("ended");
                //ビデオ再生が終わった時に、次の再生用のビデオが登録されていたら、
                //ループ完了後に、そのビデオを再生する。
                if (that.kag.stat.video_stack == null) {
                    //$(".tyrano_base").find("video").remove();
                    that.kag.tmp.video_playing = false;
                    
                    if(that.kag.stat.is_wait_bgmovie == true){
                        that.kag.ftag.nextOrder();
                        that.kag.stat.is_wait_bgmovie = false;
                    }
                                
                    //that.kag.ftag.nextOrder();

                } else {

                    var video_pm = that.kag.stat.video_stack;
                    
                    var video2 = document.createElement("video");
                     
                    
                    video2.style.backgroundColor = "black";
                    video2.style.position = "absolute";
                    video2.style.top = "0px";
                    video2.style.left = "0px";
                    video2.style.width = "100%";
                    video2.style.height = "100%";
                    video2.autoplay = true;
                    video2.autobuffer = true;
                    
                    if (video_pm.loop == "true") {
                        video2.loop = true;
                    } else {
                        video2.loop = false;
                    }
                    
                    video2.setAttribute("playsinline","1");
                    
                    
                    // プリロードを設定する
                    video2.src = "./data/video/" + video_pm.storage;
                    video2.load();
                    var j_video2 = $(video2);
                    video2.play();
                    j_video2.css("z-index",-1);
                    $("#tyrano_base").append(j_video2);
                    
                    video2.addEventListener('canplay', function(event) {
                        
                        var arg = arguments.callee;
                         
                        // Video is loaded and can be played
                        j_video2.css("z-index",1);
                        
                        setTimeout(function(){
                            $("#bgmovie").remove();
                            video2.id="bgmovie";
                        },100);
                        
                        that.kag.stat.video_stack = null;
                        //that.kag.ftag.nextOrder();
                        
                        that.kag.tmp.video_playing = true;
                        
                        video2.removeEventListener('canplay', arg, false);
                        //document.getElementById("tyrano_base").appendChild(video);
                        
                        //$("#tyrano_base").append(j_video);
                        
                    }, false);
                    
                    //video2でも呼び出し
                    
                    video2.addEventListener("ended",arguments.callee);
                    
                    /*
                    video.src = "./data/video/" + video_pm.storage;
                    video.load();
                    video.play();
                    */
                   
                   
                }

            });

        } else {

            video.style.zIndex = 199999;

            video.addEventListener("ended", function(e) {
                $(".tyrano_base").find("video").remove();
                that.kag.ftag.nextOrder();

            });

            //スキップ可能なら、クリックで削除
            //bgmodeがtrueならはスキップ関係なし

            if (pm.skip == "true") {

                $(video).on("click touchstart", function(e) {
                    $(video).off("click touchstart");
                    $(".tyrano_base").find("video").remove();
                    that.kag.ftag.nextOrder();
                });

            }

        }
        
        var j_video = $(video);
        j_video.css("opacity",0);
        
        //document.getElementById("tyrano_base").appendChild(video);
        
        $("#tyrano_base").append(j_video);
        j_video.animate(
            {opacity: '1'},
            {duration: parseInt(pm.time),
                complete: function(){
                        //$(this).remove();
                        //that.kag.ftag.nextOrder();
                        //if(pm.wait=="true"){
                        //    that.kag.ftag.nextOrder();
                        //}
                        
                    }
            }
        );
        
        video.load();
        
        //アンドロイドで一瞬再生ボタンが表示される対策
        video.addEventListener('canplay',function(){
            video.style.display = "";
            video.play();
        });
        

    }
};

/*
 #[bgmovie]
 :group
 その他
 :title
 背景ムービーの再生
 :exp
 ogv webm mp4 などに対応します
 提供するゲームによって対応するフォーマットが異なります。
 PCゲーム形式の場合は webm形式を使ってください。 mp4 に対応しません。
 ブラウザゲームの場合はmp4ファイルを使用します。ただし、FireFox Opera を含む全てのブラウザに対応させる場合は同名のwebmファイルも配置して下さい
 stop_bgmovie タグを指定すると再生が終わります。

bgmovieをループ中に別のbgmovieを重ねることで、ループが完了してから次の動画を再生させる事ができます。

 （注意）このタグはPC限定です。スマホでは利用できません。

 :sample
 [bgmovie storage="test.webm" ]
 :param
 storage=再生するogv webm mp4ファイルを指定してください,
 time=背景動画を表示するときにフェードアウト効果を与える時間を指定します。デフォルトは1000(ミリ秒),
 volume=ビデオの音量を指定できます 0〜100の間で指定して下さい。デフォルトは100 ,
 loop=背景動画をループさせるかどうかを指定します。falseを指定すると動画の最後の状態で停止します。
 #[end]
 */

tyrano.plugin.kag.tag.bgmovie = {

    vital : ["storage"],

    pm : {
        storage : "",
        volume : "",
        loop : "true",
        time:"300",
        stop : "false" //nextorderするかしないk
    },

    start : function(pm) {

        var that = this;

        pm.skip = "false";
        pm.bgmode = "true";

        this.kag.stat.current_bgmovie["storage"] = pm.storage;
        this.kag.stat.current_bgmovie["volume"] = pm.volume;

        //ループ再生中のビデオがある状態で、もう一度実行した場合、videoのループが終わった後に、再生させる
        if (this.kag.tmp.video_playing != false) {
            var video = document.getElementById("bgmovie");
            this.kag.stat.video_stack = pm;
            video.loop = false;
            
            that.kag.ftag.nextOrder();
            return;

        }

        this.kag.ftag.startTag("movie", pm);

        if (pm.stop == "false") {
            this.kag.ftag.nextOrder();
        }

    }
};

/*
 #[wait_bgmovie]
 :group
 その他
 :title
 背景ムービーの再生完了を待つ
 :exp
 再生中の背景ムービーの完了を待ちます。
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.wait_bgmovie = {

    vital : [],

    pm : {
        stop : "false" //nextorderするかしないk
    },

    start : function(pm) {

        var that = this;

        if (this.kag.tmp.video_playing == true) {

            var video = document.getElementById("bgmovie");
            this.kag.stat.is_wait_bgmovie = true;
            video.loop = false;

        } else {
            this.kag.ftag.nextOrder();
        }
    }
};

/*
 #[stop_bgmovie]
 :group
 その他
 :title
 背景ムービーの停止
 :exp
 bgmovieで再生した背景動画を停止します。
 :sample
 [stop_bgmovie storage="" skip=false ]
 :param
 time=ミリ秒で指定すると、動画をフェードアウトして削除することが可能です。デフォルトは1000,
 wait=trueかfalse を指定します。動画のフェードアウトを待つかどうかを指定できます。デフォルトはtrue 
 #[end]
 */

tyrano.plugin.kag.tag.stop_bgmovie = {

    vital : [],

    pm : {
        time:"300",
        wait:"true"
    },

    start : function(pm) {

        var that = this;

        that.kag.tmp.video_playing = false;

        that.kag.stat.current_bgmovie["storage"] = "";
        that.kag.stat.current_bgmovie["volume"] = "";
        
        
        $(".tyrano_base").find("video").animate(
            {opacity: '0'},
            {duration: parseInt(pm.time),
                complete: function(){
                        $(this).remove();
                        
                        if(pm.wait=="true"){
                            that.kag.ftag.nextOrder();
                        }
                        
                    }
            }
        ); 
        
        if(!$(".tyrano_base").find("video").get(0)){
            that.kag.ftag.nextOrder();
            return ;
        }
        
        if(pm.wait=="false"){
            that.kag.ftag.nextOrder();
        }

    }
};

/*
 #[showsave]
 :group
 システム操作
 :title
 セーブ画面を表示します
 :exp
 セーブ画面を表示します
 :sample
 [showsave]
 :param
 #[end]
 */

tyrano.plugin.kag.tag.showsave = {

    pm : {
    },

    start : function(pm) {
        var that = this;
        
        that.kag.stat.load_auto_next = true;
        this.kag.menu.displaySave(function(){
            that.kag.stat.load_auto_next = false;
            that.kag.ftag.nextOrder();
        });
        
    }
};

/*
 #[showload]
 :group
 システム操作
 :title
 ロード画面を表示します
 :exp
 ロード画面を表示します
 :sample
 [showload]
 :param
 #[end]
 */

tyrano.plugin.kag.tag.showload = {

    pm : {
    },

    start : function(pm) {

        var that = this;
        this.kag.menu.displayLoad(function(){
            that.kag.ftag.nextOrder();
        });
    }
};

/*
 #[showmenu]
 :group
 システム操作
 :title
 メニュー画面を表示します
 :exp
 メニュ＾画面を表示します
 :sample
 [showmenu]
 :param
 #[end]
 */

tyrano.plugin.kag.tag.showmenu = {

    pm : {
    },

    start : function(pm) {

        this.kag.menu.showMenu();
        this.kag.ftag.nextOrder();

    }
};

/*
 #[showmenubutton]
 :group
 システム操作
 :title
 メニューボタンを表示
 :exp
 メニューボタンを表示します
 :sample
 [showmenubutton]
 :param
 #[end]
 */

tyrano.plugin.kag.tag.showmenubutton = {

    pm : {
    },

    start : function(pm) {

        $(".button_menu").show();
        this.kag.stat.visible_menu_button = true;
        this.kag.config.configVisible = "true";
        this.kag.ftag.nextOrder();

    }
};

/*
 #[hidemenubutton]
 :group
 システム操作
 :title
 メニューボタンを非表示
 :exp
 メニューボタンを非表示します
 :sample
 [hidemenubutton]
 :param
 #[end]
 */

tyrano.plugin.kag.tag.hidemenubutton = {

    pm : {
    },

    start : function(pm) {

        $(".button_menu").hide();
        this.kag.stat.visible_menu_button = false;
        this.kag.config.configVisible = "false";
        this.kag.ftag.nextOrder();

    }
};

/*
 #[skipstart]
 :group
 システム操作
 :title
 スキップ開始
 :exp
 文字表示をスキップモードにします。
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.skipstart = {

    pm : {
    },

    start : function(pm) {

        //文字追加中は、スキップしない。
        if (this.kag.stat.is_skip == true || this.kag.stat.is_adding_text) {
            return false;
        }
        
        this.kag.readyAudio();

        this.kag.stat.is_skip = true;
        this.kag.ftag.nextOrder();

    }
};

/*
 #[skipstop]
 :group
 システム操作
 :title
 スキップ停止
 :exp
 スキップモードを停止します。
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.skipstop = {

    pm : {
    },

    start : function(pm) {

        this.kag.stat.is_skip = false;
        this.kag.ftag.nextOrder();

    }
};

/*
 #[autostart]
 :group
 システム操作
 :title
 オート開始
 :exp
 文字表示を一定間隔で自動的に進めます。
 進行速度はconfig.tjsのautoSpeedを確認して下さい
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.autostart = {

    pm : {
    },

    start : function(pm) {

        if (this.kag.stat.is_auto == true) {
            return false;
        }
        
        this.kag.readyAudio();             

        //[p][l] の処理に、オート判定が入ってます
        this.kag.stat.is_auto = true;
        this.kag.ftag.nextOrder();

    }
};

/*
 #[autostop]
 :group
 システム操作
 :title
 オート停止（）
 :exp
 オートモードを停止します。
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.autostop = {

    pm : {
        next:"true"
    },

    start : function(pm) {

        this.kag.stat.is_auto = false;
        this.kag.stat.is_wait_auto = false;

        //↓他から直接呼ばれた時に、２重に実行されるため、コメントにしているが
        //このタグを単独で使えないので、問題有り。 git show 2bc37170
        if(pm.next=="true"){
            this.kag.ftag.nextOrder();
        }
    }
};

/*
 #[autoconfig]
 :group
 システム操作
 :title
 オート設定
 :exp
 オートモードに関する設定
 :sample
 :param
 speed=オート時のスピードをミリ秒で指定して下さい,
 clickstop=画面クリック時にオートを停止するかどうかを指定します true(停止する デフォルト) false（停止しない）
 #[end]
 */

tyrano.plugin.kag.tag.autoconfig = {

    pm : {
        speed : "",
        clickstop : ""
    },

    start : function(pm) {

        if (pm.speed != "") {
            this.kag.config.autoSpeed = pm.speed;
            this.kag.ftag.startTag("eval", {
                "exp" : "sf._system_config_auto_speed = " + pm.speed,
                "next":"false"
            });
        }

        if (pm.clickstop != "") {
            this.kag.config.autoClickStop = pm.clickstop;
            this.kag.ftag.startTag("eval", {
                "exp" : "sf._system_config_auto_click_stop = " + pm.clickstop,
                "next":"false"
            });

        }

        this.kag.ftag.nextOrder();

    }
};

/*
 #[anim]
 :group
 アニメーション関連
 :title
 アニメーション
 :exp
 画像やボタン、レイヤなどの中身をアニメーションさせることができます
 アニメーションさせる要素は[image][ptext][button]タグ作成時にname属性で指定した名前を利用できます。
 レイヤを指定するとレイヤの中にある要素全てを同時にアニメーションできます
 このタグはアニメーションの終了を待ちません。[wa]タグを使用すると実行中のすべてのアニメーションの完了を待つことができます。
 位置のアニメーションは指定する値に+=100 -=100　と指定することで相対位置指定できます（今表示されているところから、右へ１００PX移動といった指定ができます）
 透明度を指定すれば、アニメーションしながら非表示にすることもできます。
 :sample
 [ptext layer=1 page=fore text="文字列" size=30 x=0 y=0 color=red vertical=true]

 [image layer=0 left=100 top=100  storage = yuko1.png page=fore visible=true name=yuko,chara ]
 [image layer=1 left=300 top=100 storage = haruko1.png page=fore visible=true name=haruko ]

 ;name属性を指定してアニメーション
 [anim name=haruko left="+=100" time=10000 effect=easeInCirc opacity=0  ]

 ;レイヤを指定してアニメーション
 [anim layer=1 left="+=100" effect=easeInCirc opacity=0  ]

 ;すべてのアニメーション完了を待ちます
 [wa]

 アニメーション終了

 :param
 name=ここで指定した値が設定されている要素に対してアニメーションを開始します。name属性で指定した値です。,
 layer=name属性が指定されている場合は無視されます。前景レイヤを指定します。必ずforeページに対して実施されます。,
 left=指定した横位置にアニメーションで移動します。,
 top=指定した縦位置にアニメーションで移動します。,
 width=幅を指定します,
 height=高さを指定します,
 opacity=0～255の値を指定します。指定した透明度へアニメーションします,
 color=色指定,
 time=アニメーションにかける時間をミリ秒で指定して下さい。デフォルトは2000ミリ秒です,
 effect=変化のエフェクトを指定します。指定できる文字列は以下の種類です<br />

 jswing
 ｜def
 ｜easeInQuad
 ｜easeOutQuad
 ｜easeInOutQuad
 ｜easeInCubic
 ｜easeOutCubic
 ｜easeInOutCubic
 ｜easeInQuart
 ｜easeOutQuart
 ｜easeInOutQuart
 ｜easeInQuint
 ｜easeOutQuint
 ｜easeInOutQuint
 ｜easeInSine
 ｜easeOutSine
 ｜easeInOutSine
 ｜easeInExpo
 ｜easeOutExpo
 ｜easeInOutExpo
 ｜easeInCirc
 ｜easeOutCirc
 ｜easeInOutCirc
 ｜easeInElastic
 ｜easeOutElastic
 ｜easeInOutElastic
 ｜easeInBack
 ｜easeOutBack
 ｜easeInOutBack
 ｜easeInBounce
 ｜easeOutBounce
 ｜easeInOutBounce

 #[end]
 */

tyrano.plugin.kag.tag.anim = {

    pm : {

        name : "",
        layer : "",
        left : "",
        top : "",
        width : "",
        height : "",
        opacity : "",
        color : "",
        time : "2000",
        effect : ""

    },

    start : function(pm) {

        var that = this;

        var anim_style = {};

        if (pm.left != "") {
            anim_style.left = pm.left;
        }
        if (pm.top != "") {
            anim_style.top = pm.top;
        }
        if (pm.width != "") {
            anim_style.width = pm.width;
        }
        if (pm.height != "") {
            anim_style.height = pm.height;
        }

        if (pm.opacity != "") {
            anim_style.opacity = $.convertOpacity(pm.opacity);
        }

        if (pm.color != "") {
            anim_style.color = $.convertColor(pm.color);
        }

        var target = "";

        if (pm.name != "") {

            //アニメーションスタックの積み上げ
            $("." + pm.name ).each(function(){
        　　　　that.kag.pushAnimStack();
        　　　　$(this).animate(anim_style, parseInt(pm.time), pm.effect, function () {
                  that.kag.popAnimStack()
        　　　　})
        　　})
            

        } else if (pm.layer != "") {

            var layer_name = pm.layer + "_fore";

            //フリーレイヤに対して実施
            if (pm.layer == "free") {
                layer_name = "layer_free";
            }

            //レイヤ指定の場合、その配下にある要素全てに対して、実施
            var target_array = $("." + layer_name).children();

            target_array.each(function() {

                that.kag.pushAnimStack();

                $(this).animate(anim_style, parseInt(pm.time), pm.effect, function() {
                    that.kag.popAnimStack();

                });

            });

        }

        //次の命令へ　アニメーション終了街の場合は厳しい
        this.kag.ftag.nextOrder();

    }
};

/*
#[wa]
:group
アニメーション関連
:title
アニメーション終了待ち
:exp
実行中のアニメーションすべて終了するまで処理を待ちます
:sample
:param
#[end]
*/

//トランジション完了を待つ
tyrano.plugin.kag.tag.wa = {
    start : function(pm) {
        
        //実行中のアニメーションがある場合だけ待つ
        if (this.kag.tmp.num_anim > 0) {
            this.kag.stat.is_wait_anim = true;
            this.kag.layer.hideEventLayer();
        } else {
            this.kag.ftag.nextOrder();

        }

    }
};

/*
#[stopanim]
:group
アニメーション関連
:title
アニメーション強制停止
:exp
実行中のアニメーションを強制的に停止します。
:sample
:param
name=ここで指定した値が設定されている要素に対してアニメーションを停止します
#[end]
*/

//アニメーション強制停止
tyrano.plugin.kag.tag.stopanim = {
    vital : ["name"],

    pm : {
        name : ""
    },

    start : function(pm) {

        $("." + pm.name).stop();
        this.kag.popAnimStack();
        this.kag.ftag.nextOrder();

    }
};

//================キーフレームアニメーション系

/*
 #[keyframe]
 :group
 アニメーション関連
 :title
 キーフレームアニメーション定義
 :exp
 キーフレームアニメーションを定義します。定義したアニメーションは[kanim]タグで指定することで使用できます
 :sample

 ;----keyframeの定義
 [keyframe name="fuwafuwa"]

 [frame p=40%  x="100" ]
 [frame p=100% y="-200" opacity=0 ]

 [endkeyframe]

 ;-----定義したアニメーションを実行

 :param
 name=キーブレームの名前を指定します。後に[kanim]タグを使用する際に指定する名前になります
 #[end]
 */

tyrano.plugin.kag.tag.keyframe = {

    vital : ["name"],

    pm : {
        name : ""
    },

    start : function(pm) {

        this.kag.stat.current_keyframe = pm.name;

        this.kag.ftag.nextOrder();

    }
};

/*
 #[endkeyframe]
 :group
 アニメーション関連
 :title
 キーフレームアニメーション定義を終了します
 :exp
 キーフレームアニメーション定義を終了します
 :sample
 :param
 #[end]
 */

tyrano.plugin.kag.tag.endkeyframe = {

    pm : {
    },

    start : function(pm) {

        this.kag.stat.current_keyframe = "";
        this.kag.ftag.nextOrder();

    }
};

/*
 #[frame]
 :group
 アニメーション関連
 :title
 キーフレームアニメーション定義
 :exp
 キーフレームアニメーションを定義します。定義したアニメーションは[kanim]タグで指定することで使用できます
 :sample
 :param
 p=パーセンテージを指定してください。例えば５秒かかるアニメーションに対して20%の位置という指定になります。0〜100%の間で指定してください。0%を省略することで前回のアニメーション状態を継承して新しいアニメーションを開始できます。,
 x=X軸方向へのアニメーション量をpxで指定して下さい。　また、*(アスタリスク)で始めることで、絶対位置として指定することができます。（例） x＝"100"（前へ100px移動する） x="*100" 画面左端から100pxの位置へ移動する,
 y=Y軸方向へのアニメーション量をpxで指定して下さい。　また、*(アスタリスク)で始めることで、絶対位置として指定することができます。（例） y＝"100"（前へ100px移動する） y="*100" 画面上端から100pxの位置へ移動する,
 z=Z軸方向へのアニメーション量をpxで指定して下さい。　また、*(アスタリスク)で始めることで、絶対位置として指定することができます。（例） z＝"100"（前へ100px移動する） z="*100" こちらのタグを使用すると三次元を表現できますが、現状一部ブラウザ（safari iphone系）で動作します,
 rotate=対象を回転させることができます。例　rotate＝"360deg"のような形で指定して下さい（３６０度回転）,
 rotateX=対象をX軸を軸として回転させることができます。例　rotateX＝"360deg"のような形で指定して下さい（３６０度回転）,
 rotateY=対象をY軸を軸として回転させることができます。例　rotateY＝"360deg"のような形で指定して下さい（３６０度回転）,
 rotateZ=対象をZ軸を軸として回転させることができます。例　rotateZ＝"360deg"のような形で指定して下さい（３６０度回転）,
 scale=対象を拡大、縮小することができます。例　scale＝"2" (２倍に拡大します) scale＝"0.5" 半分に縮小します,
 scaleX=X方向に拡大、縮小できます,
 scaleY=Y方向に拡大、縮小できます,
 scaleZ=Z方向に拡大、縮小できます,
 skew=傾斜,
 skewX=X傾斜,
 skewY=Y傾斜,
 perspective=遠近効果を付与することができます。一部ブラウザのみ,
 opacity=0～1を指定することで、各要素の透明度を指定することができます、非表示にしたりすることができます。0で完全に透明になります。
 その他=CSSのスタイルを各種指定することができます。

 #[end]
 */

tyrano.plugin.kag.tag.frame = {

    vital : ["p"],

    pm : {
        p : ""
    },

    master_trans : {
        "x" : "",
        "y" : "",
        "z" : "",
        "translate" : "",
        "translate3d" : "",
        "translateX" : "",
        "translateY" : "",
        "translateZ" : "",
        "scale" : "",
        "scale3d" : "",
        "scaleX" : "",
        "scaleY" : "",
        "scaleZ" : "",
        "rotate" : "",
        "rotate3d" : "",
        "rotateX" : "",
        "rotateY" : "",
        "rotateZ" : "",
        "skew" : "",
        "skewX" : "",
        "skewY" : "",
        "perspective" : ""
    },

    start : function(pm) {

        var percentage = pm.p;
        delete pm.p;

        //!!!!!!!!!transかstyleかをここで振り分ける必要がありますよ！

        //色々定義できる

        if (this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]) {

        } else {

            this.kag.stat.map_keyframe[this.kag.stat.current_keyframe] = {};
            this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]["frames"] = {};
            this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]["styles"] = {};

        }

        var map_trans = {};
        var map_style = {};

        for (key in pm) {

            if (this.master_trans[key] == "") {
                map_trans[key] = pm[key];
            } else {
                map_style[key] = pm[key];
            }
        }

        this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]["frames"][percentage] = {
            "trans" : map_trans,
            "styles" : map_style
        };

        this.kag.ftag.nextOrder();

    }
};

/*
 #[kanim]
 :group
 アニメーション関連
 :title
 キーフレームアニメーションの実行
 :exp
 キーフレームアニメーションを実行します。[keyframe]タグで定義した名前とアニメーションさせる画像やテキストを指定することで
 複雑なアニメーションを実現できます。
 :sample
 :param
 name=アニメーションさせる画像やテキストのnameを指定してください,
 layer=nameを指定せずに、layerを指定することでそのlayerに属するエレメント全てにアニメーションを適用させることができます,
 keyframe=実行するキーフレームアニメーション名を指定してください。,
 time=アニメーションを実行する時間をミリ秒で指定してください。,
 easing=アニメーションの変化パターンを指定することができます。
 指定できる値として
 ease(開始時点と終了時点を滑らかに再生する)　linear(一定の間隔で再生する)
 ease-in(開始時点をゆっくり再生する)
 ease-out(終了時点をゆっくり再生する)
 ease-in-out(開始時点と終了時点をゆっくり再生する)
 この他に、cubic-bezier関数を使って、イージングを独自に設定することも可能です
 ,
 count = 再生回数を指定できます。初期値は１。"infinite"を指定することで無限にアニメーションさせることもできます。,
 delay = 開始までの時間を指定できます。初期値は遅延なし(0)です。,
 direction = 偶数回のアニメーションを逆再生するか指定できます。 初期値は"normal" 偶数回逆再生させる場合は、"alternate"を指定します,
 mode = 再生前後の状態を指定できます。初期値は"forwards"で再生後の状態を維持します。 "none"を指定すると、再生後の状態を維持しません

 #[end]
 */

tyrano.plugin.kag.tag.kanim = {

    vital : ["keyframe"],

    pm : {
        "name" : "",
        "layer" : "",
        "keyframe" : ""
    },

    start : function(pm) {

        var that = this;

        var anim = this.kag.stat.map_keyframe[pm.keyframe];

        var class_name = "." + pm.name;

        anim.config = pm;

        if (pm.time) {
            pm.duration = parseInt(pm.time) + "ms";
        }

        if (pm.delay) {
            pm.delay = parseInt(pm.delay) + "ms";
        }

        //アニメーション完了したら、
        anim.complete = function() {

            that.kag.popAnimStack();

        };

        if (pm.name != "") {
            delete pm.name;
            delete pm.keyframe;
            
            $(class_name).each(function(){
                that.kag.pushAnimStack();
                $(this).a3d(anim);
            });
            

        } else if (pm.layer != "") {

            var layer_name = pm.layer + "_fore";

            //フリーレイヤに対して実施
            if (pm.layer == "free") {
                layer_name = "layer_free";
            }
            delete pm.name;
            delete pm.keyframe;
            delete pm.layer;

            //レイヤ指定の場合、その配下にある要素全てに対して、実施
            var target_array = $("." + layer_name).children();

            target_array.each(function() {

                that.kag.pushAnimStack();

                $(this).a3d(anim);

            });

        }

        this.kag.ftag.nextOrder();

    }
};




/*
 #[stop_kanim]
 :group
 アニメーション関連
 :title
 キーフレームアニメーションの停止
 :exp
 キーフレームアニメーションを停止します。
 :sample
 :param
 name=アニメーションさせる停止する画像やテキストのnameを指定してください,
 layer=nameを指定せずに、layerを指定することでそのlayerに属するエレメント全てにアニメーション停止を適用させることができます
 #[end]
 */

tyrano.plugin.kag.tag.stop_kanim = {

    pm : {
        "name" : "",
        "layer" : ""
    },

    start : function(pm) {

        var that = this;
        
        if (pm.name != "") {
            $("."+pm.name).css("-webkit-animation-name","");
        }else if(pm.layer!=""){
                
            var layer_name = pm.layer + "_fore";
            //フリーレイヤに対して実施
            if (pm.layer == "free") {
                layer_name = "layer_free";
            }
                
            $("." + layer_name).children().css("-webkit-animation-name","");
            
        }

        this.kag.ftag.nextOrder();

    }
};








//=====================================

/*
 #[chara_ptext]
 :group
 キャラクター操作
 :title
 キャラクターの発言名前欄表示と表情変更
 :exp
 [chara_config ptext="hogehoge"]という形式で定義した発言者のメッセージボックスにnameで指定した名前を設定できます。
 さらに、faceパラメータを指定することで、同時に表情も変更できます。
 このタグには省略して書くことができます。
 #chara_name:face_name と　[ptext name="chara_name" face="face_name"] は同じ動作をします。
 [chara_new]時に登録した画像ファイルはface="default"で指定できます。
 [chara_new name="yuko" storage="yuko.png"  jname="ゆうこ"]
 :param
 name=[chara_new]で定義したnameを指定します。紐づいたjnameがptext欄に表示されます,
 face=[chara_face]で定義したface名を指定してください
 :sample

 #[end]
 */
tyrano.plugin.kag.tag.chara_ptext = {

    pm : {

        name : "",
        face : ""
    },

    start : function(pm) {
        
        var that = this;
        this.kag.layer.hideEventLayer();

        if (pm.name == "") {
            $("." + this.kag.stat.chara_ptext).html("");

            //全員の明度を下げる。誰も話していないから
            //明度設定が有効な場合
            if (this.kag.stat.chara_talk_focus != "none") {

                $("#tyrano_base").find(".tyrano_chara").css({
                    "-webkit-filter" : this.kag.stat.apply_filter_str,
                    "-ms-filter" : this.kag.stat.apply_filter_str,
                    "-moz-filter" : this.kag.stat.apply_filter_str
                });

            }

        } else {
            
            //日本語から逆変換することも可能とする
            if(this.kag.stat.jcharas[pm.name]){
                pm.name = this.kag.stat.jcharas[pm.name];
            }
            
            var cpm = this.kag.stat.charas[pm.name];
            
            if (cpm) {
                //キャラクター名出力
                $("." + this.kag.stat.chara_ptext).html(cpm.jname);

                //色指定がある場合は、その色を指定する。
                if (cpm.color != "") {
                    $("." + this.kag.stat.chara_ptext).css("color", $.convertColor(cpm.color));
                }

                //明度設定が有効な場合
                if (this.kag.stat.chara_talk_focus != "none") {

                    $("#tyrano_base").find(".tyrano_chara").css({
                        "-webkit-filter" : this.kag.stat.apply_filter_str,
                        "-ms-filter" : this.kag.stat.apply_filter_str,
                        "-moz-filter" : this.kag.stat.apply_filter_str
                    });

                    $("#tyrano_base").find("." + pm.name + ".tyrano_chara").css({
                        "-webkit-filter" : "brightness(100%) blur(0px)",
                        "-ms-filter" : "brightness(100%) blur(0px)",
                        "-moz-filter" : "brightness(100%) blur(0px)"
                    });

                }
                
                //指定したキャラクターでアニメーション設定があった場合
                if(this.kag.stat.chara_talk_anim != "none"){
                    
                    var chara_obj = $("#tyrano_base").find("." + pm.name + ".tyrano_chara");
                    if(chara_obj.get(0)){
                        
                        this.animChara(chara_obj, this.kag.stat.chara_talk_anim, pm.name);
                        
                        if (pm.face != "") {
                            //即表情変更、アニメーション中になるから        
                            this.kag.ftag.startTag("chara_mod", {name:pm.name,face:pm.face,time:"0"});
                        }
                    }
                    
                }
                

            } else {
                //存在しない場合はそのまま表示できる
                $("." + this.kag.stat.chara_ptext).html(pm.name);
                
                //存在しない場合は全員の明度を下げる。
                if (this.kag.stat.chara_talk_focus != "none") {
                    $("#tyrano_base").find(".tyrano_chara").css({
                        "-webkit-filter" : this.kag.stat.apply_filter_str,
                        "-ms-filter" : this.kag.stat.apply_filter_str,
                        "-moz-filter" : this.kag.stat.apply_filter_str
                    });
                }
                
            }
        }
        
        
        //ボイス設定が有効な場合
        if(this.kag.stat.vostart == true){
            //キャラクターのボイス設定がある場合
            
            if(this.kag.stat.map_vo["vochara"][pm.name]){
                
                var vochara = this.kag.stat.map_vo["vochara"][pm.name];
                
                var playsefile = $.replaceAll(vochara.vostorage,"{number}",vochara.number);
                
                var se_pm = {
                    loop : "false",
                    storage : playsefile,
                    stop : "true",
                    buf:vochara.buf
                };
                
                this.kag.ftag.startTag("playse", se_pm);
                
                this.kag.stat.map_vo["vochara"][pm.name]["number"] = parseInt(vochara.number)+1;
                
            }
            
        }
        
        this.kag.stat.f_chara_ptext="true";
        
        //表情の変更もあわせてできる
        if (pm.face != "") {
            if (!(this.kag.stat.charas[pm.name]["map_face"][pm.face])) {
                this.kag.error("指定されたキャラクター「" + pm.name + "」もしくはface:「" + pm.face + "」は定義されていません。もう一度確認をお願いします");
                return;
            }
            
            var storage_url = this.kag.stat.charas[pm.name]["map_face"][pm.face];
            
            //chara_mod タグで実装するように調整
            if(this.kag.stat.chara_talk_anim == "none"){
                this.kag.ftag.startTag("chara_mod", {name:pm.name,face:pm.face});
            }
            
            //$("."+pm.name).attr("src",storage_url);
        
        }else{
            this.kag.layer.showEventLayer();
            this.kag.ftag.nextOrder();
        
        }

    },
    
    //キャラクターのアニメーション設定
    animChara:function(chara_obj,type,name){
        
        //アニメーション中の場合は、重ねない
        if(typeof this.kag.tmp.map_chara_talk_top[name] != "undefined"){
            return;
        }
        
        //アニメーション
        var that = this;
        var tmp_top =  parseInt(chara_obj.get( 0 ).offsetTop);
        chara_obj.css("top",tmp_top);
        var a_obj = {};
        var b_obj = {};
        
        //アニメーション中のキャラクターを格納。
        this.kag.tmp.map_chara_talk_top[name] = true;
        
        var anim_time = this.kag.stat.chara_talk_anim_time;
        
        if(type=="up"){
            a_obj["top"] = tmp_top - this.kag.stat.chara_talk_anim_value;
            b_obj["top"] = tmp_top;
            
        }else if(type=="down"){
            a_obj["top"] = tmp_top + this.kag.stat.chara_talk_anim_value;
            b_obj["top"] = tmp_top;
            
        }
        
        
        chara_obj.animate(a_obj, anim_time, "easeOutQuad",function(){
            chara_obj.animate(b_obj, anim_time, "easeOutQuad",function(){
                delete that.kag.tmp.map_chara_talk_top[name];
            });
        });

        
    }
    
};

/*
 #[chara_config]
 :group
 キャラクター操作
 :title
 キャラクター操作タグの基本設定
 :exp
 キャラクター操作タグの基本設定を変更できます
 :sample
 :param
 pos_mode=true か false　を指定します。デフォルトはtrueです。trueの場合は、[chara_show]タグなどで追加した時の立ち位置を自動的に計算し、配置します。,
 ptext=発言者の名前領域のptextを指定できます。例えば[ptext name=name_space] のように定義されていた場合、その後 #yuko のように指定するだけで、ptext領域キャラクターの名前を表示することができます。,
 time=0以上の数値をミリ秒で指定することで、[chara_mod]タグで表情を変える際に、クロスフェードの効果を与えることができます。指定時間かけて切り替わります。デフォルトは600ミリ秒です。0を指定すると即時に切り替わります,
 memory=true か false を指定します。デフォルトはfalseです。キャラクターを非表示にして再度表示した時に、表情を維持するかどうかをしていできます。falseをしていすると、[chara_new]で指定してデフォルトの表情で表示されます,
 anim=キャラクターを自動配置する場合、キャラクターの立ち位置が変わるときにアニメーションを行うか否かを指定できます。デフォルトは true です。falseを指定するとじんわりと入れ替わる効果に切り替わります。,
 pos_change_time=キャラクターの位置を変更する際のスピードを調整できます。ミリ秒で指定して下さい。デフォルトは600,
 talk_focus=現在話しているキャラクターの立ち絵に対して、目立たせる演出が可能になります。指定できるのは brightness（明度） blur（ぼかし） none （無効）です。デフォルトはnone　どのキャラクターが話しているかの指定は #yuko のように指定すると、chara_new時の名前とひも付きます。 ,
 brightness_value=brightnessの値を指定できます。話しているキャラクター以外の明度を指定します。0〜100 で指定して下さい。デフォルトは60,
 blur_value=blurの値を指定できます。話しているキャラクター以外のぼかし方を指定します。0〜100 で指定して下さい。デフォルトは2 値がおおきいほどぼかしが強くなります,
 talk_anim=現在話しているキャラクターの立ち絵に対して、ピョンと跳ねるような効果を与えることができます。指定できるのは up（上に跳ねる） down（下に沈む） none （無効）です。デフォルトはnone　どのキャラクターが話しているかの指定は #yuko のように指定すると、chara_new時の名前とひも付きます。,
 talk_anim_time=talk_animが有効な場合のアニメーション速度を指定できます。デフォルトは230ミリ秒。,
 talk_anim_value=talk_animが有効な場合のアニメーション量を指定できます。デフォルトは30。数値で指定してください。,
 effect=キャラクターが位置を入れ替わる際のエフェクト（動き方）を指定できます。
 jswing
 ｜def
 ｜easeInQuad
 ｜easeOutQuad
 ｜easeInOutQuad
 ｜easeInCubic
 ｜easeOutCubic
 ｜easeInOutCubic
 ｜easeInQuart
 ｜easeOutQuart
 ｜easeInOutQuart
 ｜easeInQuint
 ｜easeOutQuint
 ｜easeInOutQuint
 ｜easeInSine
 ｜easeOutSine
 ｜easeInOutSine
 ｜easeInExpo
 ｜easeOutExpo
 ｜easeInOutExpo
 ｜easeInCirc
 ｜easeOutCirc
 ｜easeInOutCirc
 ｜easeInElastic
 ｜easeOutElastic
 ｜easeInOutElastic
 ｜easeInBack
 ｜easeOutBack
 ｜easeInOutBack
 ｜easeInBounce
 ｜easeOutBounce
 ｜easeInOutBounce

 #[end]
 */

tyrano.plugin.kag.tag.chara_config = {

    pm : {

        pos_mode : "",
        effect : "",
        ptext : "",
        time : "",
        memory : "",
        anim : "",
        pos_change_time : "", //立ち位置の変更時にかかる時間を指定できます
        talk_focus : "",
        brightness_value : "",
        blur_value : "",
        talk_anim : "",
        talk_anim_time : "",
        talk_anim_value : ""
        
    },

    start : function(pm) {

        //入力されている項目のみ、反映させる
        if (pm.pos_mode != "")
            this.kag.stat.chara_pos_mode = pm.pos_mode;
        if (pm.effect != "")
            this.kag.stat.chara_effect = pm.effect;
        if (pm.ptext != "")
            this.kag.stat.chara_ptext = pm.ptext;
        if (pm.time != "")
            this.kag.stat.chara_time = pm.time;
        if (pm.memory != "")
            this.kag.stat.chara_memory = pm.memory;
        if (pm.anim != "")
            this.kag.stat.chara_anim = pm.anim;
        if (pm.pos_change_time != "")
            this.kag.stat.pos_change_time = pm.pos_change_time;

        if (pm.brightness_value != "")
            this.kag.stat.chara_brightness_value = pm.brightness_value;
        if (pm.blur_value != "")
            this.kag.stat.chara_blur_value = pm.blur_value;
            
        if (pm.talk_anim !="")
            this.kag.stat.chara_talk_anim = pm.talk_anim;
        if (pm.talk_anim_time !="")
            this.kag.stat.chara_talk_anim_time = parseInt(pm.talk_anim_time);
        if (pm.talk_anim_value !="")
            this.kag.stat.chara_talk_anim_value = parseInt(pm.talk_anim_value);
        

        //フォーカス設定
        if (pm.talk_focus != "") {

            if (pm.talk_focus == "none") {
                this.kag.stat.apply_filter_str = "";
            } else if (pm.talk_focus == "brightness") {
                this.kag.stat.apply_filter_str = "brightness(" + this.kag.stat.chara_brightness_value + "%)";
            } else if (pm.talk_focus == "blur") {
                this.kag.stat.apply_filter_str = "blur(" + this.kag.stat.chara_blur_value + "px)";
            }

            //フォーカスの指定が変わった段階で一旦すべて無効にする
            $("#tyrano_base").find(".tyrano_chara").css({
                "-webkit-filter" : "brightness(100%) blur(0px)",
                "-ms-filter" : "brightness(100%) blur(0px)",
                "-moz-filter" : "brightness(100%) blur(0px)"
            });

            this.kag.stat.chara_talk_focus = pm.talk_focus;

        }

        this.kag.ftag.nextOrder();

    }
};

/*
 #[chara_new]
 :group
 キャラクター操作
 :title
 キャラクターの定義
 :exp
 登場するキャラクターの情報を定義します。その後[chara_show ]で指定した名称で表示したり、画像を変更したりできます。
 また、ここで定義したname属性は[anim]タグなどからも指定可能です。
 つまり、キャラクターを追加したあとアニメーションすることも自由にできます。
 :sample
 [chara_new name="yuko" storage="yuko.png"  jname="ゆうこ"]
 :param
 name=キャラクターを以後操作するための名前を半角英数で指定します。このnameは他のタグを含めて必ずユニークでなければなりません,
 storage=キャラクター画像を指定してください。画像ファイルはプロジェクトフォルダのfgimageフォルダに配置してください,
 width=画像の横幅を指定できます,
 height=画像の高さを指定できます。,
 reflect=画像を反転します,
 color=キャラクターの名前を表示するときの色を指定できます。0xRRGGBB 形式で指定します。,
 jname=このキャラクターをネームスペースに表示する場合、適用する名称を指定できます。例えば、#yuko と指定すると　メッセージエリアに　ゆうこ　と表示できます
 #[end]
 */

tyrano.plugin.kag.tag.chara_new = {

    vital : ["name", "storage"],

    pm : {

        name : "",
        storage : "",
        width : "",
        height : "",
        reflect : "false",
        jname : "",
        visible : "false",
        color : "",
        map_face : {}
    },

    start : function(pm) {

        //イメージの追加

        var storage_url = "./data/fgimage/" + pm.storage;

        //HTTP対応
        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        }

        pm.map_face["default"] = pm.storage;

        this.kag.preload(storage_url);

        //即座に追加
        if (pm.visible == "true") {

        }

        //前景レイヤ
        this.kag.stat.charas[pm.name] = pm;
        
        //キャラクターの日本語名とnameを紐付けるための処置
        if(pm.jname!=""){
            this.kag.stat.jcharas[pm.jname]=pm.name;
        }

        this.kag.ftag.nextOrder();

    }
};

/*
 #[chara_show]
 :group
 キャラクター操作
 :title
 キャラクターの登場
 :exp
 定義しておいたキャラクターを画面に表示します
 :sample
 [chara_show name="yuko" ]
 :param
 name=[chara_new]で定義したname属性を指定してください。,
 time="ミリ秒で指定します。指定した時間をかけて登場します。デフォルトは1000ミリ秒です",
 layer="キャラクターを配置するレイヤーを指定できます。デフォルトは前景レイヤ layer=0 です",
 zindex="キャラクターの重なりを指定できます。ここで指定した値が大きいほうが前に表示することができます。指定しない場合は後に登場するキャラクターが前に表示されます",
 page="foreかbackを指定します。デフォルトはforeです",
 wait="trueを指定すると、キャラクターの登場完了を待ちます。デフォルトはtrue です。",
 face=[chara_face]で定義したface属性を指定してください。,
 storage=変更する画像ファイルを指定してください。ファイルはプロジェクトフォルダのfgimageフォルダに配置します。,
 reflect="trueを指定すると左右反転します",
 width="キャラクターの横幅を指定できます。",
 height="キャラクターの縦幅を指定できます。",
 left="キャラクターの横位置を指定できます。指定した場合、自動配置が有効であっても無効になります。",
 top="キャラクターの縦位置を指定できます。指定した場合、自動配置が有効であっても無効になります。"

 #[end]
 */

tyrano.plugin.kag.tag.chara_show = {

    vital : ["name"],

    pm : {

        name : "",
        page : "fore",
        layer : "0", //レイヤーデフォルトは０に追加
        wait : "true", //アニメーションの終了を待ちます
        left : "0", //chara_config でauto になっている場合は、自動的に決まります。指定されている場合はこちらを優先します。
        top : "0",
        width : "",
        height : "",
        zindex : "1",
        reflect : "",
        face : "",
        storage:"",
        time : 1000

    },

    start : function(pm) {

        var that = this;

        var cpm = this.kag.stat.charas[pm.name];
        
        var array_storage = [];

        if (cpm == null) {
            this.kag.error("指定されたキャラクター「" + pm.name + "」は定義されていません。[chara_new]で定義してください");
            return;
        }

        //すでにキャラクターが登場している場合は無視する
        var check_obj = $(".layer_fore").find("." + pm.name);
        if (check_obj.get(0)) {
            that.kag.ftag.nextOrder();
            return;
        }

        var storage_url = "./data/fgimage/" + cpm.storage;
        
        if ($.isHTTP(cpm.storage)) {
            storage_url = cpm.storage;
        }

        //表情が指定されている場合はその値を活用する。
        if (pm.face != "") {
            if (!(cpm["map_face"][pm.face])) {
                this.kag.error("指定されたキャラクター「" + pm.name + "」もしくはface:「" + pm.face + "」は定義されていません。もう一度確認をお願いします");
                return;
            }
            storage_url = "./data/fgimage/" + cpm["map_face"][pm.face];
        
        }else if(pm.storage != "") {

            if ($.isHTTP(pm.storage)) {
                folder="";
                storage_url = pm.storage;
            } else {
                storage_url = "./data/fgimage/" + pm.storage;
            }
            
            that.kag.stat.charas[pm.name]["storage"] = pm.storage;
            
        }
        
        
        var j_chara_root = $("<div></div>");
        j_chara_root.css({
            "position":"absolute",
            "display":"none"
        });

        var img_obj = $("<img />");
        img_obj.attr("src", storage_url);
        img_obj.addClass("chara_img");
        //img_obj.css("position", "absolute");
        //img_obj.css("display", "none");
        //前景レイヤを表示状態にする
        
        //div内に追加
        j_chara_root.append(img_obj);

        if (pm.width != "") {
            var width = parseInt(pm.width);
            cpm.width = width;
                
        }

        if (pm.height != "") {
            var height = parseInt(pm.height);
            cpm.height = height;
            
        }
        
        if(cpm.width!=""){
            j_chara_root.css("width",cpm.width + "px");
        }
        
        if(cpm.height!=""){
            j_chara_root.css("height",cpm.height + "px");
        }


        if (pm.zindex != "") {

            var zindex = parseInt(pm.zindex);
            j_chara_root.css("z-index", zindex);

        }
        
        ////キャラ差分の指定があれば、それを適応する。
        //レイヤが登録されているかどうか
        var chara_layer = {};
        if(cpm["_layer"]){
            chara_layer = cpm["_layer"];
        }
        
        
        for(key in chara_layer){
            
            var chara_part = chara_layer[key];
            
            //どれを表示すべきか
            var current_part_id = chara_part["current_part_id"];
            var chara_obj = chara_part[current_part_id];
            
            //直接ストレージが指定されている場合の表現
            if(current_part_id=="allow_storage"){
                chara_obj = {
                    storage:chara_part["allow_storage"],
                    visible:"true"
                };
            }
            
            
            if(true){
                
                var part_storage = "./data/fgimage/"+chara_obj["storage"];
                
                var j_img = $("<img />");
                
                //noneの場合はimgオブジェクトだけ作っておく
                if(chara_obj["storage"]=="none"){
                    part_storage ="./tyrano/images/system/transparent.png";
                }else{
                    array_storage.push(part_storage);
                }
                
                j_img.attr("src",part_storage);
                
                j_img.css({
                   position:"absolute",
                   left:0,
                   top:0,
                   width:"100%",
                   height:"100%",
                   "z-index":chara_part.zindex
                });
                
                j_img.addClass("part");
                j_img.addClass(key); //mouse とか head 
                
                j_chara_root.append(j_img);
            
                
            }
            
        }
        
        

        //反転表示
        if (pm.reflect != "") {
            if (pm.reflect == "true") {
                cpm.reflect = "true";
            } else {
                cpm.reflect = "false";
            }
        }
        
        array_storage.push(storage_url);
        
        //画像は事前にロードしておく必要がありそう
        this.kag.preloadAll(array_storage, function() {

            var target_layer = that.kag.layer.getLayer(pm.layer, pm.page);

            //最後に挿入
            target_layer.append(j_chara_root).show();

            var chara_num = 1;
            that.kag.layer.hideEventLayer();

            //キャラのサイズを設定する必要がある。
            
            //立ち位置を自動的に設定する場合
            if (that.kag.stat.chara_pos_mode == "true" && pm.left == "0") {
                
                
                //立ち位置自動調整
                if(pm.top !="0" ){
                    j_chara_root.css("top",parseInt(pm.top));
                }else{
                    j_chara_root.css("bottom", 0);
                }

                //既存キャラの位置を調整する
                var chara_cnt = target_layer.find(".tyrano_chara").length;

                var sc_width = parseInt(that.kag.config.scWidth);
                var sc_height = parseInt(that.kag.config.scHeight);
                
                var center = Math.floor(parseInt(j_chara_root.css("width")) / 2);

                //一つあたりの位置決定
                var base = Math.floor(sc_width / (chara_cnt + 2));
                var tmp_base = base;
                var first_left = base - center;

                j_chara_root.css("left", first_left + "px");

                //すべてのanimationが完了するまで、次へ進めないように指定
                var array_tyrano_chara = target_layer.find(".tyrano_chara").get().reverse();
                $(array_tyrano_chara).each(function() {

                    chara_num++;

                    tmp_base += base;

                    var j_chara = $(this);
                    //この分をプラスする感じですね
                    center = Math.floor(parseInt(j_chara.css("width")) / 2);
                    //1つ目は主人公にゆずる
                    var left = tmp_base - center;

                    if (that.kag.stat.chara_anim == "false") {

                        j_chara.fadeTo(parseInt(that.kag.cutTimeWithSkip(pm.time)), 0, function() {

                            j_chara.css("left", left);

                            j_chara.fadeTo(parseInt(that.kag.cutTimeWithSkip(that.kag.stat.pos_change_time)), 1, function() {

                                chara_num--;
                                if (chara_num == 0) {
                                    that.kag.layer.showEventLayer();
                                    if (pm.wait == "true") {
                                        that.kag.ftag.nextOrder();
                                    }
                                }
                            });

                        });

                    } else {

                        j_chara.animate({
                            left : left
                        }, parseInt(that.kag.cutTimeWithSkip(that.kag.stat.pos_change_time)), that.kag.stat.chara_effect, function() {
                            chara_num--;
                            if (chara_num == 0) {
                                that.kag.layer.showEventLayer();
                                if (pm.wait == "true") {
                                    that.kag.ftag.nextOrder();
                                }
                            }
                        });

                    }

                });

            } else {

                j_chara_root.css("top", pm.top + "px");
                j_chara_root.css("left", pm.left + "px");

                //that.kag.ftag.nextOrder();

            }
            
            //読み込み後、サイズを指定する
            setTimeout(function(){
                
                var width = img_obj.css("width");
                var height = img_obj.css("height");
                
                j_chara_root.css("width",width);
                j_chara_root.css("height",height);
                
                j_chara_root.find(".part").css("width",width);
                j_chara_root.find(".part").css("height",height);
                
                
            },1);

            //オブジェクトにクラス名をセットします name属性は一意でなければなりません
            $.setName(j_chara_root, cpm.name);
            j_chara_root.addClass("tyrano_chara");
            //キャラクター属性を付与。

            //新しいスタイルの定義

            if (cpm.width != "") {
                img_obj.css("width", cpm.width + "px");
            }

            if (cpm.height != "") {
                img_obj.css("height", cpm.height + "px");
            }

            if (cpm.reflect == "true") {
                img_obj.addClass("reflect");
            } else {
                img_obj.removeClass("reflect");
            }

            if (pm.wait != "true") {
                that.kag.ftag.nextOrder();
            }

            //アニメーションでj表示させます
            j_chara_root.animate({
                opacity : "show"
            }, {
                duration : parseInt(that.kag.cutTimeWithSkip(pm.time)),
                easing : that.kag.stat.chara_effect,
                complete : function() {

                    chara_num--;
                    if (chara_num == 0) {
                        that.kag.layer.showEventLayer();

                        if (pm.wait == "true") {
                            that.kag.ftag.nextOrder();
                        }

                    }

                }//end complerte
            });

        });
        //end preload

    }
};

/*
 #[chara_hide]
 :group
 キャラクター操作
 :title
 キャラクターの退場
 :exp
 [chara_show]タグで表示したキャラクターを退場させます。
 :sample
 [chara_hide name="yuko" ]
 :param
 name=[chara_new]で定義したname属性を指定してください。,
 wait=trueを指定すると、キャラクターの退場を待ちます。デフォルトはtrueです。,
 time=ミリ秒で指定します。指定した時間をかけて退場します。デフォルトは1000ミリ秒です,
 layer=削除対象のレイヤ。chara_showの時にレイヤ指定した場合は、指定します。デフォルトは０,
 pos_mode=キャラクターの立ち位置自動調整が有効な場合にこの値にfalseを指定すると退場後に立ち位置の調整を行いません。デフォルトはtrueです,

 #[end]
 */

tyrano.plugin.kag.tag.chara_hide = {

    vital : ["name"],

    pm : {
        page : "fore",
        layer : "0", //レイヤーデフォルトは０に追加
        name : "",
        wait : "true",
        pos_mode : "true",
        time : "1000"

    },

    start : function(pm) {

        var that = this;

        var target_layer = this.kag.layer.getLayer(pm.layer, pm.page);

        var img_obj = target_layer.find("." + pm.name);

        var chara_num = 0;
        that.kag.layer.hideEventLayer();

        //アニメーションでj表示させます
        img_obj.animate({
            opacity : "hide"
        }, {
            duration : parseInt(that.kag.cutTimeWithSkip(pm.time)),
            easing : "linear",
            complete : function() {

                img_obj.remove();

                if (that.kag.stat.chara_pos_mode == "true" && pm.pos_mode == "true") {

                    //既存キャラの位置を調整する
                    var chara_cnt = target_layer.find(".tyrano_chara").length;
                    var sc_width = parseInt(that.kag.config.scWidth);
                    var sc_height = parseInt(that.kag.config.scHeight);

                    //一つあたりの位置決定
                    var base = Math.floor(sc_width / (chara_cnt + 1));
                    var tmp_base = 0;

                    if (chara_cnt == 0) {
                        that.kag.layer.showEventLayer();
                        if (pm.wait == "true") {
                            that.kag.ftag.nextOrder();
                        }
                        
                        return;
                    }

                    var array_tyrano_chara = target_layer.find(".tyrano_chara").get().reverse();
                    $(array_tyrano_chara).each(function() {

                        chara_num++;

                        tmp_base += base;

                        var j_chara = $(this);
                        //この分をプラスする感じですね
                        var center = Math.floor(parseInt(j_chara.css("width")) / 2);
                        //1つ目は主人公にゆずる
                        var left = tmp_base - center;

                        if (that.kag.stat.chara_anim == "false") {

                            j_chara.fadeTo(parseInt(that.kag.cutTimeWithSkip(pm.time)), 0, function() {

                                j_chara.css("left", left);

                                j_chara.fadeTo(parseInt(that.kag.cutTimeWithSkip(that.kag.stat.pos_change_time)), 1, function() {

                                    chara_num--;
                                    if (chara_num == 0) {
                                        that.kag.layer.showEventLayer();
                                        if (pm.wait == "true") {
                                            that.kag.ftag.nextOrder();
                                        }
                                    }
                                });

                            });

                        } else {

                            j_chara.animate({
                                left : left
                            }, parseInt(that.kag.cutTimeWithSkip(that.kag.stat.pos_change_time)), that.kag.stat.chara_effect, function() {

                                chara_num--;
                                if (chara_num == 0) {
                                    that.kag.layer.showEventLayer();
                                    if (pm.wait == "true") {
                                        that.kag.ftag.nextOrder();
                                    }
                                }

                            });

                        }// end else

                    });

                    //that.kag.ftag.nextOrder();

                } else {

                    //実行待の時だけ実施する
                    if (pm.wait == "true") {
                        that.kag.layer.showEventLayer();
                        that.kag.ftag.nextOrder();
                    }

                }
            }//end complerte
        });
        // end animate

        //キャラクターの表情を引き継がない
        if (this.kag.stat.chara_memory == "false") {
            this.kag.stat.charas[pm.name].storage = this.kag.stat.charas[pm.name]["map_face"]["default"];
        }

        //すぐに次の命令を実行
        if (pm.wait != "true") {
            this.kag.ftag.nextOrder();
        }

        //this.kag.ftag.nextOrder();

    }
};

/*
 #[chara_hide_all]
 :group
 キャラクター操作
 :title
 キャラクターを全員退場
 :exp
 [chara_show]タグで表示したキャラクターを全員退場させます。
 :sample
 [chara_hide_all time=1000 wait=true]
 :param
 wait=trueを指定すると、キャラクターの退場を待ちます。デフォルトはtrueです。,
 time=ミリ秒で指定します。指定した時間をかけて退場します。デフォルトは1000ミリ秒です,
 layer=削除対象のレイヤ。chara_showの時にレイヤ指定した場合は、指定します。デフォルトは０

 #[end]
 */

tyrano.plugin.kag.tag.chara_hide_all = {

    vital : [],

    pm : {
        page : "fore",
        layer : "0", //レイヤーデフォルトは０に追加
        wait : "true",
        time : "1000"

    },

    start : function(pm) {

        var that = this;

        var target_layer = this.kag.layer.getLayer(pm.layer, pm.page);

        var img_obj = target_layer.find(".tyrano_chara");

        var chara_num = 0;
        that.kag.layer.hideEventLayer();
        var flag_complete = false;
        //アニメーションでj表示させます
        
        //キャラがいない場合、次へ
        if (!img_obj.get(0)) {
            that.kag.ftag.nextOrder();
            return;
        }
        
        img_obj.animate({
            opacity : "hide"
        }, {
            duration : parseInt(that.kag.cutTimeWithSkip(pm.time)),
            easing : "linear",
            complete : function() {

                img_obj.remove();
                if (pm.wait == "true") {

                    if (flag_complete == false) {
                        flag_complete = true;
                        that.kag.layer.showEventLayer();
                        that.kag.ftag.nextOrder();
                    }
                }
            }
        });

        //キャラクターの表情を引き継がない
        if (this.kag.stat.chara_memory == "false") {
            for (key in this.kag.stat.charas ) {
                this.kag.stat.charas[key].storage = this.kag.stat.charas[key]["map_face"]["default"];
            }
        }

        //すぐに次の命令を実行
        if (pm.wait != "true") {
            this.kag.layer.showEventLayer();
            this.kag.ftag.nextOrder();
        }

        //this.kag.ftag.nextOrder();

    }
};

/*
 #[chara_delete]
 :group
 キャラクター操作
 :title
 キャラクター情報の削除
 :exp
 定義しておいたキャラクター情報を削除します。（画面から消す場合は[chara_hide]を使用してください）
 :sample
 [chara_delete="yuko" ]
 :param
 name=[chara_new]で定義したname属性を指定してください。

 #[end]
 */

tyrano.plugin.kag.tag.chara_delete = {

    vital : ["name"],

    pm : {

        name : ""

    },

    start : function(pm) {
        delete this.kag.stat.charas[pm.name];

        this.kag.ftag.nextOrder();

    }
};

/*
 #[chara_mod]
 :group
 キャラクター操作
 :title
 キャラクター画像変更
 :exp
 画面のキャラクター画像を変更します。表情を変更する場合などに便利でしょう
 :sample
 [chara_mod name="yuko" storage="newface.png"]
 :param
 name=[chara_new]で定義したname属性を指定してください。,
 face=[chara_face]で定義したface属性を指定してください,
 time=0以上の数値をミリ秒で指定することで、[chara_mod]タグで表情を変える際に、クロスフェードの効果を与えることができます。指定時間かけて切り替わります。デフォルトは600ミリ秒です。0を指定すると即時に切り替わります,
 reflect=trueを指定すると左右反転します,
 storage=変更する画像ファイルを指定してください。ファイルはプロジェクトフォルダのfgimageフォルダに配置します。,
 wait=表情の変更完了を待つか否かを指定します。true or falseで指定。デフォルトは true,
 cross=true or false を指定します。デフォルトはtrue。trueを指定すると２つの画像が同じタイミングで透明になりながら入れ替わります。falseを指定すると、古い表情を残しながら上に重なる形で新しい表情を表示します。

 #[end]
 */

tyrano.plugin.kag.tag.chara_mod = {

    vital : ["name"],

    pm : {

        name : "",
        face : "",
        reflect : "",
        storage : "",
        time : "",
        cross:"true",
        wait:"true"

    },

    start : function(pm) {
        
        var that = this;
        that.kag.layer.hideEventLayer();

        var storage_url = "";
        var folder= "./data/fgimage/";
        
        if (pm.face != "") {
            if (!(this.kag.stat.charas[pm.name]["map_face"][pm.face])) {
                this.kag.error("指定されたキャラクター「" + pm.name + "」もしくはface:「" + pm.face + "」は定義されていません。もう一度確認をお願いします");
                return;
            }
            storage_url = this.kag.stat.charas[pm.name]["map_face"][pm.face];
        } else {

            if ($.isHTTP(pm.storage)) {
                folder="";
                storage_url = pm.storage;
            } else {
                storage_url = pm.storage;
            }

        }
        
        if ($(".layer_fore").find("." + pm.name).size() == 0) {
            this.kag.stat.charas[pm.name]["storage"] = storage_url;
            this.kag.stat.charas[pm.name]["reflect"] = pm.reflect;
            this.kag.layer.showEventLayer();
            this.kag.ftag.nextOrder();
            return;
        }

        var chara_time = this.kag.stat.chara_time;
        if (pm.time != "") {
            chara_time = pm.time;
        }

        //変更する際の画像が同じ場合は、即時表示
        if ($(".layer_fore").find("." + pm.name).find(".chara_img").attr("src") == folder + storage_url) {
            chara_time = "0";
        }

        if (pm.reflect != "") {
            if (pm.reflect == "true") {
                $(".layer_fore").find("." + pm.name).addClass("reflect");
            } else {
                $(".layer_fore").find("." + pm.name).removeClass("reflect");
            }
            this.kag.stat.charas[pm.name]["reflect"] = pm.reflect;
        }
        
        //storageが指定されていない場合は終わり
        if (storage_url == "") {
            that.kag.layer.showEventLayer();
            this.kag.ftag.nextOrder();
            return;
        }
        
        this.kag.preload(folder + storage_url, function() {
            
            if($(".chara-mod-animation").get(0)){
                $(".chara-mod-animation_"+pm.name).remove();
            }
            
            if (chara_time != "0") {
                
                var j_new_img = $(".layer_fore").find("." + pm.name).clone();
                j_new_img.find(".chara_img").attr("src", folder + storage_url);
                j_new_img.css("opacity", 0);
                
                
                var j_img = $(".layer_fore").find("." + pm.name);
                j_img.addClass("chara-mod-animation_"+pm.name);
                j_img.after(j_new_img);
    
                if(pm.cross=="true"){
                    j_img.fadeTo(parseInt(that.kag.cutTimeWithSkip(chara_time)), 0, function() {
                        //alert("完了");
                    });
                }
    
                j_new_img.fadeTo(parseInt(that.kag.cutTimeWithSkip(chara_time)), 1, function() {
                    
                    if(pm.cross=="false"){
                        j_img.fadeTo(parseInt(that.kag.cutTimeWithSkip(chara_time)),0,function(){
                            
                            j_img.remove();
                            
                            if(pm.wait=="true"){
                                that.kag.layer.showEventLayer();
                                that.kag.ftag.nextOrder();
                            }
                            
                        });
                        
                    }else{
                    
                        j_img.remove();
                        
                        if(pm.wait=="true"){
                            that.kag.layer.showEventLayer();
                            that.kag.ftag.nextOrder();
                        }
                    }
                });
    
            } else {
                
                $(".layer_fore").find("." + pm.name).find(".chara_img").attr("src", folder + storage_url);
                
                if(pm.wait=="true"){
                    that.kag.layer.showEventLayer();
                    that.kag.ftag.nextOrder();
                }
            }
    
            //showする前でも、表情が適応されるようにする
            that.kag.stat.charas[pm.name]["storage"] = storage_url;
            
            if(pm.wait=="false"){
                that.kag.layer.showEventLayer();
                that.kag.ftag.nextOrder();
            }

        });

    }
};



/*
 #[chara_move]
 :group
 キャラクター操作
 :title
 キャラクターの位置変更
 :exp
 画面のキャラクター立ち位置を変更します。
 :sample
 [chara_move name="yuko" time=100 left=20 top=100 ]
 :param
 name=[chara_new]で定義したname属性を指定してください。,
 time=0以上の数値をミリ秒で指定することで、指定時間かけて位置を移動します切り替わります。600ミリ秒です。,
 anim=trueかfalseを指定します。デフォルトはfalse。trueを指定すると、位置を変える時にアニメーションさせることができます。アニメーション効果は[chara_config]のeffectパラメータを参照します,
 left=移動先のヨコ位置を指定できます。「left="+=200"」「left="-=200"」のように指定すると今いる位置を基準にできます（相対指定）,
 top=移動先のタテ位置を指定できます。「top="+=100"」「top="-=100"」のように指定すると今いる位置を基準にできます（相対指定）,
 width=変更後の横幅を指定できます,
 height=変更後の高さを指定できます,
 wait=位置変更を待つか否かを指定します。true or falseで指定。デフォルトは true,
 effect=変化のエフェクトを指定します。指定できる文字列は以下の種類です<br />

 jswing
 ｜def
 ｜easeInQuad
 ｜easeOutQuad
 ｜easeInOutQuad
 ｜easeInCubic
 ｜easeOutCubic
 ｜easeInOutCubic
 ｜easeInQuart
 ｜easeOutQuart
 ｜easeInOutQuart
 ｜easeInQuint
 ｜easeOutQuint
 ｜easeInOutQuint
 ｜easeInSine
 ｜easeOutSine
 ｜easeInOutSine
 ｜easeInExpo
 ｜easeOutExpo
 ｜easeInOutExpo
 ｜easeInCirc
 ｜easeOutCirc
 ｜easeInOutCirc
 ｜easeInElastic
 ｜easeOutElastic
 ｜easeInOutElastic
 ｜easeInBack
 ｜easeOutBack
 ｜easeInOutBack
 ｜easeInBounce
 ｜easeOutBounce
 ｜easeInOutBounce

 #[end]
 */

tyrano.plugin.kag.tag.chara_move = {

    vital : ["name"],

    pm : {

        name : "",
        time : "600",
        anim : "false",
        left : "",
        top : "",
        width:"",
        height:"",
        effect:"",
        wait:"true"

    },

    start : function(pm) {

        var that = this;

        var target_obj = $(".layer_fore").find("." + pm.name + ".tyrano_chara");
        var target_img = $(".layer_fore").find("." + pm.name + ".tyrano_chara").find("img");
        
        //存在しない場合は、即移動
        if(!target_obj.get(0)){
            that.kag.ftag.nextOrder();
            return;
        }
        
        var anim_style = {};
        var img_anim_style = {};

        if (pm.left != "") {
            anim_style.left = pm.left +"px";
        }
        if (pm.top != "") {
            anim_style.top = pm.top +"px";
        }
        if (pm.width != "") {
            anim_style.width = pm.width;
            img_anim_style.width = pm.width;
        }
        if (pm.height != "") {
            anim_style.height = pm.height;
            img_anim_style.height = pm.height;
        }

        var target = "";

        if (pm.name != "") {
            
            if(pm.anim=="true"){
                target_obj.animate(anim_style, parseInt(pm.time), pm.effect, function() {
                    
                    if(pm.wait=="true"){
                        that.kag.ftag.nextOrder();
                    }
                    
                });
                
                target_img.animate(img_anim_style, parseInt(pm.time), pm.effect, function() {
                    
                });
                
                
            }else{
                
                target_obj.fadeTo(parseInt(that.kag.cutTimeWithSkip(pm.time))/2, 0, function() {
                    
                    target_obj.css(anim_style);
                    target_img.css(img_anim_style);
                    
                    target_obj.fadeTo(parseInt(that.kag.cutTimeWithSkip(pm.time))/2, 1,function(){
                        if(pm.wait=="true"){
                            that.kag.ftag.nextOrder();
                        }
                    });
                    
                    
                });
                
                
                
            }

        } 

        if(pm.wait=="false"){
            this.kag.ftag.nextOrder();
        }

    }
};



/*
 #[chara_face]
 :group
 キャラクター操作
 :title
 キャラクター表情登録
 :exp
 キャラクターの表情画像を名称と共に登録できます
 :sample

 ;表情の登録
 [chara_face name="yuko" face="angry" storage="newface.png"]
 ;表情の適応
 [chara_mod name="yuko" face="angry"]
 ;発言者の名前も同時にかえたい場合
 [chara_ptext name="yuko" face="angry"]
 ;短縮して書けます。以下も同じ意味
 #yuko:angry
 ;chara_new で登録した画像はdefaultという名前で指定可能
 #yuko:default

 :param
 name=[chara_new]で定義したname属性を指定してください。,
 face=登録する表情の名前を指定してください,
 storage=変更する画像ファイルを指定してください。ファイルはプロジェクトフォルダのfgimageフォルダに配置します。

 #[end]
 */

tyrano.plugin.kag.tag.chara_face = {

    vital : ["name", "face", "storage"],

    pm : {

        name : "",
        face : "",
        storage : ""

    },

    start : function(pm) {

        var storage_url = "";

        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        } else {
            storage_url = pm.storage;
        }
        
        this.kag.stat.charas[pm.name]["map_face"][pm.face] = storage_url;
        this.kag.ftag.nextOrder();

    }
};


/*
 #[chara_layer]
 :group
 キャラクター操作
 :title
 キャラクターの差分パーツ定義
 :exp
 キャラクターの表情を差分パーツを定義します。
 デフォルトのパーツは一番最初に登録したものになります。
 :sample
 [chara_layer name="yuko" part=mouse id=egao storage="image/egao.png" ]
 :param
 name=[chara_new]で定義したname属性を指定してください。,
 part=パーツとして登録する名を指定します。例えば「目」というpartを登録しておいて、このpartの中で他の差分をいくつも登録することができます。,
 id=パーツの中で差分にidを登録できます。例えば「目」というpartの中で「笑顔の目」「泣いてる目」のようにidを分けてstorageを登録してください,
 storage=差分として登録する画像を指定します。画像はfgimageフォルダの中に配置します。noneを指定するとデフォルトそのパーツがない状態を表現することができます,
 zindex=数値を指定します。このpartが他のパーツ重なった時にどの位置に表示されるかを指定します。数値が大きい程、前面に表示されます。一度登録しておけば該当するpartに適応されます。
 
 #[end]
 */

tyrano.plugin.kag.tag.chara_layer = {

    vital : ["name","part","id","storage"],

    pm : {
        name : "",
        part : "", 
        id : "",
        storage : "",
        zindex : ""
    },

    start : function(pm) {
        
        var cpm = this.kag.stat.charas[pm.name];    
        
        if (cpm == null) {
            this.kag.error("指定されたキャラクター「" + pm.name + "」は定義されていません。[chara_new]で定義してください");
            return;
        }
        
        var chara_layer = {};
        
        //レイヤが登録されているかどうか
        if(cpm["_layer"]){
            chara_layer = cpm["_layer"];
        }else{
            cpm["_layer"] = {};
        }
        
        var chara_part = {};
        
        //パートが登録されているかどうか
        var init_part = false;
        if(chara_layer[pm.part]){
            chara_part = chara_layer[pm.part];
             
        }else{
            init_part = true;
            //一つ上のレイヤに配置する
            cpm["_layer"][pm.part] = {
                "default_part_id":pm.id,
                "current_part_id":pm.id,
                "zindex":pm.zindex
            };
        }
        
        var chara_obj = {};
        
        //差分IDを登録する
        if(chara_part[pm.id]){
            chara_obj = chara_part[pm.id];    
        }else{
            
            chara_obj = {
                storage : "",
                zindex : ""
            };
            
            //パーツ自体が初めての場合は、showにする。
            if(init_part==true){
                chara_obj["visible"] = "true";
            }else{
                chara_obj["visible"] = "false";
            }
        
        }
        
        
        cpm["_layer"][pm.part][pm.id] = $.extendParam(pm,chara_obj);
        
        this.kag.ftag.nextOrder();


    }
};


/*
 #[chara_layer_mod]
 :group
 キャラクター操作
 :title
 キャラクターの差分の定義を変更
 :exp
 chara_layerで定義した設定を変更することができます。
 :sample
 [chara_layer_mod name="yuko" part=mouse zindex=20 ]
 :param
 name=[chara_new]で定義したname属性を指定してください。,
 part=変更したいパーツとして登録した名を指定します。,
 zindex=数値を指定します。このpartが他のパーツ重なった時にどの位置に表示されるかを指定します。数値が大きい程、前面に表示されます。この設定は即時反映されず、次回表示時、反映されます。
 
 #[end]
 */

tyrano.plugin.kag.tag.chara_layer_mod = {

    vital : ["name","part"],

    pm : {
        name : "",
        part : "", 
        zindex : ""
    },

    start : function(pm) {
        
        var that = this;
        
        var cpm = this.kag.stat.charas[pm.name];    
        
        if (cpm == null) {
            this.kag.error("指定されたキャラクター「" + pm.name + "」は定義されていません。[chara_new]で定義してください");
            return;
        }
        
        //レイヤが登録されているかどうか
        if(!cpm["_layer"]){
            this.kag.error("指定されたキャラクター「" + pm.name + "」の差分パーツは設定されていません。[chara_layer]で定義してください");
            return;
        }
        
        if(cpm["_layer"][pm.part]){
            cpm["_layer"][pm.part]["zindex"] = pm.zindex;
        }
        
        this.kag.ftag.nextOrder();

    }
};



/*
 #[chara_part]
 :group
 キャラクター操作
 :title
 キャラクターの差分パーツ変更
 :exp
 [chara_layer]で指定した差分を実際に表示切り替えする
 このタグは特殊なパラメータ指定で[chara_layer]で定義したpart と id の組み合わせをパラメータとして自由に指定できます。
 （例）eye=sample1 
 同時に複数のpartを変更することも可能です。
 また、id登録していない、画像を直接指定することもできます。この場合パラメータのallow_storageにtrueに指定してください。
 特定部位のzindexを変更して出力したい場合はpart名+_zindex という名前のパラメータに数値を代入することができます。
 （例）eye_zindex=10 
 :sample
 [chara_part name="yuko" mouse=aaa eye=bbb ]
 :param
 name=[chara_new]で指定したキャラクター名を指定してください。,
 time=パーツが表示されるまでの時間を指定できます。ミリ秒で指定してください。指定するとフェードインしながら表示できます。デフォルトは指定なしです。,
 wait=true or false を指定します。trueを指定するとtimeで指定したフェードインの完了を待ちます。デフォルトはtrueです。,
 allow_storage=true or false 。partの指定にidではなく直接画像ファイルを指定できます。画像はfgimageフォルダに配置してください。デフォルトはfalseです。
 #[end]
 */

tyrano.plugin.kag.tag.chara_part = {

    vital : ["name"],

    pm : {
        name : "",
        allow_storage: "false",
        time:"",
        wait:"true"
    },

    start : function(pm) {
        
        var that = this;
        
        var cpm = this.kag.stat.charas[pm.name];    
        
        if (cpm == null) {
            this.kag.error("指定されたキャラクター「" + pm.name + "」は定義されていません。[chara_new]で定義してください");
            return;
        }
        
        //レイヤが登録されているかどうか
        if(!cpm["_layer"]){
            this.kag.error("指定されたキャラクター「" + pm.name + "」の差分パーツは設定されていません。[chara_layer]で定義してください");
            return;
        }
        
        var chara_part = cpm["_layer"];
        
        var map_part = {};
        var array_storage = [];
        
        var part_num = 0;
        
        for(key in pm){
            
            if(chara_part[key]){
                
                var part_id = pm[key];
                if(chara_part[key][part_id]){
                    
                    var part = chara_part[key][part_id];
                    part.id = part_id;
                    map_part[key] = part;
                    //partの中で指定された画像を表示する
                    
                    if(part["storage"] != "none"){
                        array_storage.push("./data/fgimage/" + part["storage"]);
                    }
                    
                    //デフォルトのパートを変更する
                    this.kag.stat.charas[pm.name]["_layer"][key]["current_part_id"] = part_id;
                    
                }else{
                    
                    if(pm.allow_storage =="true"){
                        
                        map_part[key] = {"storage":part_id,"id":part_id};
                        array_storage.push("./data/fgimage/" + part_id);  
                        
                        this.kag.stat.charas[pm.name]["_layer"][key]["current_part_id"] = "allow_storage";
                        this.kag.stat.charas[pm.name]["_layer"][key]["allow_storage"]   =  part_id;
                    
                    }
                    
                }
                
            }
                
        }
        
        var target_obj = $(".layer_fore").find("." + pm.name + ".tyrano_chara");
        
        //プリロード
        this.kag.preloadAll(array_storage, function() {
            
            //指定された配列を回して、該当するオブジェクトを切り替える
            if(pm.time != ""){
                
                var n=0;
                var cnt=0;
                
                console.log(map_part);
                
                for(key in map_part){
                    
                    cnt++;
                    var part = map_part[key];
                    var j_img = target_obj.find(".part"+"." + key + "");
                    var j_new_img = j_img.clone();
                    j_new_img.css("opacity", 0);
                    
                    if(part.storage!="none"){
                        j_new_img.attr("src","./data/fgimage/" + part.storage);
                    }else{
                        j_new_img.attr("src", "./tyrano/images/system/transparent.png");
                    }
                    
                    //zindexの指定があった場合は、変更を行う
                    if(pm[key+"_zindex"]){
                        j_new_img.css("z-index", pm[key+"_zindex"]);
                    }else{
                        j_new_img.css("z-index", chara_part[key]["zindex"]);
                    }
                    
                    //イメージを追加
                    j_img.after(j_new_img);
                    
                    j_img.fadeTo(parseInt(pm.time), 0, function(){
                        j_img.remove();
                    }); 
                    
                    j_new_img.fadeTo(parseInt(pm.time), 1, function(){
                        n++;
                        if(pm.wait=="true"){
                            if(cnt==n){ 
                                that.kag.ftag.nextOrder();
                            }
                        }
                    });
                    
                }
                
                
                if(pm.wait=="false"){
                    that.kag.ftag.nextOrder();
                }
            
                
            }else{
                
                for(key in map_part){
                    
                    var part = map_part[key];
                    var j_img = target_obj.find(".part"+"." + key + "");
                    
                    if(part.storage!="none"){
                        j_img.attr("src","./data/fgimage/" + part.storage);
                    }else{
                        j_img.attr("src", "./tyrano/images/system/transparent.png");
                    }
                    
                    //zindexの指定があった場合は、変更を行う
                    if(pm[key+"_zindex"]){
                        j_img.css("z-index", pm[key+"_zindex"]);
                    }else{
                        j_img.css("z-index", chara_part[key]["zindex"]);
                    }
                    
                }
                
                that.kag.ftag.nextOrder();
            
                
            }
            
        });

        
    }
};



/*
 #[chara_part_reset]
 :group
 キャラクター操作
 :title
 キャラクターの差分パーツをデフォルトに戻す
 :exp
 [chara_part]で差分を変更した際、デフォルトの表情に戻すことができます。
 キャラクターが表示されている場合は即時デフォルトに戻ります。
 :sample
 [chara_part_reset name="yuko" ]
 :param
 name=[chara_new]で指定したキャラクター名を指定してください。,
 part=特定のpartに絞ってリセットすることが可能です。デフォルトはすべてをデフォルトに戻します。ここに記述することで指定したpartのみリセットされます。カンマで区切ると複数指定することが可能です
 #[end]
 */

tyrano.plugin.kag.tag.chara_part_reset = {

    vital : ["name"],

    pm : {
        name : "",
        part:""
    },

    start : function(pm) {
        
        var that = this;
        
        var cpm = this.kag.stat.charas[pm.name];    
        
        if (cpm == null) {
            this.kag.error("指定されたキャラクター「" + pm.name + "」は定義されていません。[chara_new]で定義してください");
            return;
        }
        
        //レイヤが登録されているかどうか
        if(!cpm["_layer"]){
            this.kag.error("指定されたキャラクター「" + pm.name + "」の差分パーツは設定されていません。[chara_layer]で定義してください");
            return;
        }
        
        var chara_part = cpm["_layer"];
        
        //chara_part のタグをつくって、デフォルトに戻す
        var new_pm = {
            "name":pm.name
        };
        
        if(pm.part==""){
            
            for(key in chara_part){
                
                new_pm[key] = chara_part[key]["default_part_id"];
                
            }
        
        }else {
            
            //partが指定されている
            var array_part = pm.part.split(",");
            for(var i=0;i<array_part.length;i++){
                var key = array_part[i];
                if(chara_part[key]){
                    new_pm[key] = chara_part[key]["default_part_id"];
                }
            }
            
        }
        
        this.kag.ftag.startTag("chara_part",new_pm);
        
    }
};


/*
 #[showlog]
 :group
 システム操作
 :title
 バックログを表示します
 :exp
 バックログを表示します
 :sample
 [showlog]
 :param
 #[end]
 */

tyrano.plugin.kag.tag.showlog = {

    pm : {
    },

    start : function(pm) {

        this.kag.menu.displayLog();
        this.kag.ftag.nextOrder();

    }
};




/*
#[filter]
:group
レイヤ関連
:title
フィルター効果演出
:exp
レイヤやオブジェクトを指定して、様々なフィルター効果を追加することができます。


:sample

;特定のオブジェクトを指定して、フィルター効果。
[filter layer="0" name="chara_a" grayscale=50 ]

;レイヤを指定してフィルター効果
[filter layer="0" grayscale=50 ]


:param
layer=効果を追加するレイヤを指定します。指定しない場合、もしくは「all」と指定するとゲーム画面全てに効果がかかります,
name=削除する要素のnameを指定します。レイヤの中のあらゆるオブジェクトに適応できます。,

grayscale=0(デフォルト)-100 を指定することで、画像の表示をグレースケールに変換することができます,
sepia=0(デフォルト)-100を指定することで、画像の表示をセピア調に変換することができます,
saturate=0-100(デフォルト)を指定してあげることで、画像の表示の彩度（色の鮮やかさ）を変更することができます,
hue=0(デフォルト)-360を指定することで、画像の表示の色相を変更することができます,
invert=0(デフォルト)-100を指定することで、画像の表示の階調を反転させることができます,
opacity=0-100(デフォルト)を指定することで、画像の表示の透過度を変更することができます,
brightness=0-100(デフォルト)を指定することで、画像の表示の明るさを変更することができます。元画像より暗くしたい場合に使えます,
contrast=0-100(デフォルト)を指定することで、画像の表示のコントラストを変更することができます,
blur=0(デフォルト)-任意の値[px] を指定することで、画像の表示をぼかすことができます


#[end]
*/


//イメージ情報消去背景とか
tyrano.plugin.kag.tag.filter = {

    vital : [],

    pm : {
        layer : "all",
        page : "fore",
        name:"",
        
        grayscale:"",
        sepia:"",
        saturate:"",
        hue:"",
        invert:"",
        opacity:"",
        brightness:"",
        contrast:"",
        blur:""
        
    },

    start : function(pm) {
        
        var filter_str ="";

        var j_obj = {};
        
        if(pm.layer=="all"){
            j_obj = $(".layer_camera");
        }else{
            j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
        }

        
        if(pm.name!=""){
            j_obj = j_obj.find("."+pm.name);
        }
        
        if(pm.grayscale!=""){
            filter_str += "grayscale("+pm.grayscale+"%) ";    
        }
        
        if(pm.sepia!=""){
            filter_str += "sepia("+pm.sepia+"%) ";    
        }
        
        if(pm.saturate!=""){
            filter_str += "saturate("+pm.saturate+"%) ";    
        }
        
        if(pm.hue!=""){
            filter_str += "hue-rotate("+pm.hue+"deg) ";    
        }
        
        if(pm.invert!=""){
            filter_str += "invert("+pm.invert+"%) ";    
        }
        
        if(pm.opacity!=""){
            filter_str += "opacity("+pm.opacity+"%) ";    
        }
        
        if(pm.brightness!=""){
            filter_str += "brightness("+pm.brightness+"%) ";    
        }
        
        if(pm.contrast!=""){
            filter_str += "contrast("+pm.contrast+"%) ";    
        }
        
        if(pm.blur!=""){
            filter_str += "blur("+pm.blur+"px) ";    
        }
        
        
        
        j_obj.css({
            "-webkit-filter" : filter_str,
            "-ms-filter" : filter_str,
            "-moz-filter" : filter_str
        });
        
        j_obj.addClass("tyrano_filter_effect");
        
        
        /*
        grayscale:"",
        sepia:"",
        saturate:"",
        hue:"",
        invert:"",
        opacity:"",
        brightness:"",
        contrast:"",
        blur:""    
        */
        
        
        this.kag.ftag.nextOrder();


        
    }
};


/*
#[free_filter]
:group
レイヤ関連
:title
フィルター効果削除
:exp
レイヤやオブジェクトを指定して、filter効果を無効にします。
指定されない場合はすべてのフィルター効果が無効化されます。

:sample

;特定のオブジェクトを指定して、フィルターを打ち消す。
[free_filter layer="0" name="chara_a"]

;全部のフィルターを打ち消す
[free_filter  ]


:param
layer=フィルターを打ち消すレイヤを指定します。指定がない場合、すべての効果が消されます,
name=フィルターを打ち消したい、nameを指定します。レイヤの中のあらゆるオブジェクトに適応できます。

#[end]
*/


//イメージ情報消去背景とか
tyrano.plugin.kag.tag.free_filter = {

    vital : [],

    pm : {
        layer : "",
        page : "fore",
        name:""
        
    },

    start : function(pm) {
        
        var filter_str ="";
        
        var j_obj ;
        
        if(pm.layer==""){
            j_obj = $(".tyrano_filter_effect");
        }else{
            j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
        }
        
        if(pm.name!=""){
            j_obj = j_obj.find("."+pm.name);
        }
         
        
        j_obj.css({
            "-webkit-filter" : "",
            "-ms-filter" : "",
            "-moz-filter" : ""
        });
        
        
        j_obj.removeClass("tyrano_filter_effect");
        
        
        this.kag.ftag.nextOrder();


        
    }
};




/*
 #[web]
 :group
 その他
 :title
 Webサイトを開く
 :exp
 指定したWebサイトをブラウザで開くことができます。
 ただし、このタグを配置する直前にクリック待ちを配置する必要があります。
 多くの環境で、ユーザーアクションなしにブラウザが開くことを禁止しています。
 :sample
 
 ;クリック待ちを挟む
 公式サイトを開きます[p]
 [web url="http://tyrano.jp"]
 
 :param
 url=開きたいWebサイトのURLを入れてください。

 #[end]
 */

tyrano.plugin.kag.tag.web = {

    vital : ["url"],

    pm : {
        url : ""
    },

    start : function(pm) {
        
        if(pm.url.indexOf("http") == -1){
            this.kag.log("error:[web] url is not correct " + pm.url);
        }else{
            
            //PC nwjsの場合
            if($.isNWJS()){
            
                var gui = require('nw.gui');
                gui.Shell.openExternal(pm.url);
            
            }else if($.isTyranoPlayer()){
                
                //ティラノプレイヤーなら、上に伝える
                $.openWebFromApp(pm.url);
                
            }else {
            
                window.open(pm.url);
            
            }
        }   
        
        this.kag.ftag.nextOrder();
        
        
    }
};




