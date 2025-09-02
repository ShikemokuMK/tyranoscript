//スクリプトの評価

/*
#[loadjs]

:group
変数・JS操作・ファイル読込

:title
外部JavaScriptファイル読み込み

:exp
外部JavaScriptファイルをロードします。無制限な機能拡張が可能です。
JavaScriptファイルは`data/others`フォルダに配置してください。

:sample
;data/others/sample.jsを読み込み
[loadjs storage="sample.js"]

:param
storage = ロードするJavaScriptファイルを指定します。,
type= 読み込み方式。`module`を指定することができます。 

:demo
2,kaisetsu/21_othello

#[end]
*/

tyrano.plugin.kag.tag.loadjs = {
    vital: ["storage"],

    pm: {
        storage: "",
        type: "",
    },

    start: function (pm) {
        var that = this;
        
        let storage_url = "";

        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        } else {
            if (pm.type === "module") {
                storage_url = "../../../data/others/" + pm.storage + "?" + new Date().getTime();
            } else {
                storage_url = "./data/others/" + pm.storage + "?" + new Date().getTime();
            }
        }

        if (pm.type === "module") {
            import(storage_url).then((module) => {
                that.kag.ftag.nextOrder();
            });
        } else {
            $.getScript(storage_url, function () {
                that.kag.ftag.nextOrder();
            });
        }

        /*
        if (pm.type === "module") {
            import("../../../data/others/" + pm.storage).then((module) => {
                that.kag.ftag.nextOrder();
            });
        } else {
            $.getScript("./data/others/" + pm.storage, function () {
                that.kag.ftag.nextOrder();
            });
        }
        */
    },
};

/*
#[movie]

:group
演出・効果・動画

:title
動画の再生

:exp
ゲーム画面上で動画を再生します。動画ファイルは`data/video`フォルダに配置します。

<b>`mp4`形式推奨</b>。`ogv``webm`形式にも対応します。

ブラウザゲームとして出力する場合、ブラウザによってはサポートしない動画形式があるので注意してください。特に、<b>`webm`形式はSafariでは動作しません</b>。

また、`mp4`形式はFireFoxやOperaでは動作しません。このとき、もし`mp4`ファイルと同じ場所に同名の`webm`ファイルがある場合は自動的にそちらを選択します。

:sample
;動画を再生した回数をゲーム変数f.watch_countで数えてみる
[eval exp="f.watch_count = 0"]

*loop
動画を再生するよ[p]

;動画を再生したことがまだ1回もないなら、スキップできない
;動画を再生したことが1回以上あるなら、スキップできる
;という設定を一時変数tf.skipにをセット
[iscript]
if (f.watch_count === 0) {
  tf.skip = "false";
} else {
  tf.skip = "true";
}
[endscript]

;data/video/cat.mp4を再生するよ
[movie storage="cat.mp4" skip=&tf.skip]

動画を再生しおわったよ[p]

;動画を再生した回数を増やす
[eval exp="f.watch_count += 1"]
[jump target="loop"]

:param
storage = 再生する動画ファイルを指定します。
skip    = 動画を途中でスキップできるようにするかどうか。`true`または`false`で指定します。`true`を指定すると、プレイヤーが画面クリックで動画を飛ばせるようになります。,
mute    = 動画の音をミュートするかどうか。`true`または`false`で指定します。ブラウザ上では動画を再生する前にユーザアクション（タップなど）が必要という制限がありますが、`true`を指定することでこの制限を無視できます。,
volume  = 動画の音量を`0`〜`100`で指定します。

#[end]
*/

tyrano.plugin.kag.tag.movie = {
    vital: ["storage"],

    pm: {
        storage: "",
        volume: "",
        skip: "false",
        mute: "false",
        //隠しパラメータ
        bgmode: "false",
        loop: "false",
    },

    start: function (pm) {
        var that = this;

        if ($.userenv() != "pc") {
            this.kag.cancelWeakStop();

            //mp4で再生できる
            //ティラノプレイヤーの場合は、そのまま再生できる。
            if ($.isTyranoPlayer()) {
                that.playVideo(pm);
            } else {
                this.kag.cancelWeakStop();
                //$(".tyrano_base").bind("click.movie", function (e) {
                that.playVideo(pm);
                $(".tyrano_base").unbind("click.movie");
                //});
            }
        } else {
            //firefox opera の場合、webMに変更する。
            if ($.getBrowser() == "opera") {
                pm.storage = $.replaceAll(pm.storage, ".mp4", ".webm");
            }

            that.playVideo(pm);
        }
    },

    playVideo: function (pm) {
        var that = this;

        var url = "./data/video/" + pm.storage;

        var video = document.createElement("video");
        video.id = "bgmovie";
        //video.setAttribute('myvideo');
        video.src = url;

        if (pm.volume != "") {
            video.volume = parseFloat(parseInt(pm.volume) / 100);
        } else {
            if (typeof this.kag.config.defaultMovieVolume != "undefined") {
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

        video.setAttribute("playsinline", "1");

        if (pm.mute == "true") {
            video.muted = true;
        }

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

            video.addEventListener("ended", function (e) {
                //alert("ended");
                //ビデオ再生が終わった時に、次の再生用のビデオが登録されていたら、
                //ループ完了後に、そのビデオを再生する。
                if (that.kag.stat.video_stack == null) {
                    //$(".tyrano_base").find("video").remove();
                    that.kag.tmp.video_playing = false;

                    if (that.kag.stat.is_wait_bgmovie == true) {
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

                    video2.setAttribute("playsinline", "1");

                    if (video_pm.mute == "true") {
                        video2.muted = true;
                    }

                    // プリロードを設定する
                    video2.src = "./data/video/" + video_pm.storage;
                    video2.load();
                    var j_video2 = $(video2);
                    video2.play();
                    j_video2.css("z-index", -1);
                    $("#tyrano_base").append(j_video2);

                    video2.addEventListener(
                        "canplay",
                        function (event) {
                            var arg = arguments.callee;

                            // Video is loaded and can be played
                            j_video2.css("z-index", 1);

                            setTimeout(function () {
                                $("#bgmovie").remove();
                                video2.id = "bgmovie";
                            }, 100);

                            that.kag.stat.video_stack = null;
                            //that.kag.ftag.nextOrder();

                            that.kag.tmp.video_playing = true;

                            video2.removeEventListener("canplay", arg, false);
                            //document.getElementById("tyrano_base").appendChild(video);

                            //$("#tyrano_base").append(j_video);
                        },
                        false,
                    );

                    //video2でも呼び出し

                    video2.addEventListener("ended", arguments.callee);

                    /*
                    video.src = "./data/video/" + video_pm.storage;
                    video.load();
                    video.play();
                    */
                }
            });
        } else {
            video.style.zIndex = 199999;

            video.addEventListener("ended", function (e) {
                $(".tyrano_base").find("video").remove();
                that.kag.ftag.nextOrder();
            });

            //スキップ可能なら、クリックで削除
            //bgmodeがtrueならはスキップ関係なし

            if (pm.skip == "true") {
                $(video).on("click touchstart", function (e) {
                    $(video).off("click touchstart");
                    $(".tyrano_base").find("video").remove();
                    that.kag.ftag.nextOrder();
                });
            }
        }

        var j_video = $(video);
        j_video.css("opacity", 0);

        //document.getElementById("tyrano_base").appendChild(video);

        $("#tyrano_base").append(j_video);
        j_video.animate(
            { opacity: "1" },
            {
                duration: parseInt(pm.time),
                complete: function () {
                    //$(this).remove();
                    //that.kag.ftag.nextOrder();
                    //if(pm.wait=="true"){
                    //    that.kag.ftag.nextOrder();
                    //}
                },
            },
        );

        video.load();

        //アンドロイドで一瞬再生ボタンが表示される対策
        video.addEventListener("canplay", function () {
            video.style.display = "";
            video.play();
        });
    },
};

/*
#[bgmovie]

:group
演出・効果・動画

:title
背景ムービーの再生

:exp

ゲーム画面の背景に動画を使用できます。動画ファイルは`data/video`フォルダに配置します。

`[stop_bgmovie]`タグを指定すると再生が終わります。
`[bgmovie]`をループ中に別の`[bgmovie]`を重ねることで、ループが完了してから次の動画を再生させる事ができます。

<b>`mp4`形式推奨</b>。`ogv``webm`形式にも対応します。

ブラウザゲームとして出力する場合、ブラウザによってはサポートしない動画形式があるので注意してください。特に、<b>`webm`形式はSafariでは動作しません</b>。

また、`mp4`形式はFireFoxやOperaでは動作しません。このとき、もし`mp4`ファイルと同じ場所に同名の`webm`ファイルがある場合は自動的にそちらを選択します。

<b>★注意</b>
このタグはPC限定です。スマホでは利用できません。

:sample
[bgmovie storage=cat.mp4]

:param
storage = 再生する動画ファイルを指定します。
time    = フェードイン時間をミリ秒で指定します。,
mute    = 動画の音をミュートするかどうか。`true`または`false`で指定します。ブラウザ上では動画を再生する前にユーザアクション（タップなど）が必要という制限がありますが、`true`を指定することでこの制限を無視できます。,
volume  = 動画の音量を`0`〜`100`で指定します。,
loop    = 背景動画をループさせるかどうか。`true`または`false`で指定します。`false`を指定すると動画の最後の状態で停止します。

#[end]
*/

tyrano.plugin.kag.tag.bgmovie = {
    vital: ["storage"],

    pm: {
        storage: "",
        volume: "",
        loop: "true",
        mute: "false",
        time: "300",
        stop: "false", //nextorderするかしないk
    },

    start: function (pm) {
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
    },
};

/*
#[wait_bgmovie]

:group
演出・効果・動画

:title
背景ムービーの再生完了を待つ

:exp
再生中の背景ムービーの完了を待ちます。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag.wait_bgmovie = {
    vital: [],

    pm: {
        stop: "false", //nextorderするかしないk
    },

    start: function (pm) {
        var that = this;

        if (this.kag.tmp.video_playing == true) {
            var video = document.getElementById("bgmovie");
            this.kag.stat.is_wait_bgmovie = true;
            video.loop = false;
        } else {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[stop_bgmovie]

:group
演出・効果・動画

:title
背景ムービーの停止

:exp
bgmovieで再生した背景動画を停止します。

:sample
[bgmovie storage=cat.mp4]
動画を停止します[p]

[stop_bgmovie]
動画を停止しました[p]

:param
time = フェードアウト時間をミリ秒で指定します。,
wait = フェードアウト完了を待つかどうかを`true`または`false`で指定できます。

#[end]
*/

tyrano.plugin.kag.tag.stop_bgmovie = {
    vital: [],

    pm: {
        time: "300",
        wait: "true",
    },

    start: function (pm) {
        var that = this;

        that.kag.tmp.video_playing = false;

        that.kag.stat.current_bgmovie["storage"] = "";
        that.kag.stat.current_bgmovie["volume"] = "";

        $(".tyrano_base")
            .find("video")
            .animate(
                { opacity: "0" },
                {
                    duration: parseInt(pm.time),
                    complete: function () {
                        $(this).remove();

                        if (pm.wait == "true") {
                            that.kag.ftag.nextOrder();
                        }
                    },
                },
            );

        if (!$(".tyrano_base").find("video").get(0)) {
            that.kag.ftag.nextOrder();
            return;
        }

        if (pm.wait == "false") {
            that.kag.ftag.nextOrder();
        }
    },
};

/*
#[showsave]

:group
メニュー・HTML表示

:title
セーブ画面の表示

:exp
セーブ画面を表示します。

:sample
[showsave]

:param

#[end]
*/

tyrano.plugin.kag.tag.showsave = {
    pm: {},

    start: function (pm) {
        var that = this;

        // ここでセーブしたデータをロードしたとき
        // 自動で次のタグに進むようにする
        that.kag.stat.load_auto_next = true;

        // ここで開いたセーブ画面を閉じたとき
        // 上記の設定を解除して次のタグに進むようにする
        this.kag.menu.displaySave(undefined, () => {
            that.kag.stat.load_auto_next = false;
            that.kag.ftag.nextOrder();
        });
    },
};

/*
#[showload]

:group
メニュー・HTML表示

:title
ロード画面の表示

:exp
ロード画面を表示します。

:sample
[showload]

:param

#[end]
*/

tyrano.plugin.kag.tag.showload = {
    pm: {},

    start: function (pm) {
        var that = this;
        this.kag.menu.displayLoad(function () {
            that.kag.ftag.nextOrder();
        });
    },
};

/*
#[showmenu]

:group
メニュー・HTML表示

:title
メニュー画面の表示

:exp
メニュー画面を表示します。

:sample
[showmenu]

:param

#[end]
*/

tyrano.plugin.kag.tag.showmenu = {
    pm: {},

    start: function (pm) {
        this.kag.menu.showMenu();
        this.kag.ftag.nextOrder();
    },
};

/*
#[showmenubutton]

:group
システムデザイン変更

:title
メニューボタンの表示

:exp
メニューボタンを表示します。

:sample
[showmenubutton]

:param
keyfocus = `true`を指定すると、キーボードやゲームパッドで選択できるようになります。また`1`や`2`などの数値を指定すると、キーコンフィグの`focus_next`アクションでボタンを選択していくときの順序を指定できます。,

#[end]
*/

tyrano.plugin.kag.tag.showmenubutton = {
    pm: {
        keyfocus: "false",
    },

    start: function (pm) {
        const j_button = $(".button_menu");
        j_button.show();
        this.kag.makeFocusable(j_button, pm.keyfocus);
        this.kag.stat.visible_menu_button = true;
        this.kag.config.configVisible = "true";
        this.kag.ftag.nextOrder();
    },
};

/*
#[hidemenubutton]

:group
システムデザイン変更

:title
メニューボタンの非表示

:exp
メニューボタンを非表示にします。

:sample
[hidemenubutton]

:param

#[end]
*/

tyrano.plugin.kag.tag.hidemenubutton = {
    pm: {},

    start: function (pm) {
        $(".button_menu").hide();
        this.kag.stat.visible_menu_button = false;
        this.kag.config.configVisible = "false";
        this.kag.ftag.nextOrder();
    },
};

/*
#[skipstart]

:group
メッセージ関連の設定

:title
スキップモード開始

:exp
スキップモードを開始します。テキストが一瞬で表示されるようになります。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag.skipstart = {
    pm: {},

    start: function (pm) {
        //文字追加中は、スキップしない。
        if (this.kag.stat.is_skip == true || this.kag.stat.is_adding_text) {
            return false;
        }
        this.kag.setSkip(true, pm);
        this.kag.ftag.hideNextImg();
        this.kag.ftag.nextOrder();
    },
};

/*
#[skipstop]

:group
メッセージ関連の設定

:title
スキップモード停止

:exp
スキップモードを解除します。`[cancelskip]`と同じ動作。

#[end]
*/

tyrano.plugin.kag.tag.skipstop = {
    start: function (pm) {
        this.kag.setSkip(false);
        this.kag.ftag.nextOrder();
    },
};

/*
#[cancelskip]

:group
メッセージ関連の設定

:title
スキップモード解除

:exp
スキップモードを解除します。`[skipstop]`と同じ動作。

#[end]
*/

tyrano.plugin.kag.tag.cancelskip = {
    start: function (pm) {
        this.kag.setSkip(false);
        this.kag.ftag.nextOrder();
    },
};

/*
#[autostart]

:group
メッセージ関連の設定

:title
オートモード開始

:exp
オートモードを開始します。テキストの文字数に応じた時間経過によってクリック待ちを自動的で通過するようになります。

オートモード時の進行速度は`Config.tjs`の`autoSpeed`、もしくは`[autoconfig]`タグを確認してください。

#[end]
*/

tyrano.plugin.kag.tag.autostart = {
    pm: {},

    start: function (pm) {
        if (this.kag.stat.is_auto == true) {
            return false;
        }

        this.kag.readyAudio();

        //[p][l] の処理に、オート判定が入ってます
        this.kag.setAuto(true);
        this.kag.ftag.hideNextImg();
        this.kag.ftag.nextOrder();
    },
};

/*
#[autostop]

:group
メッセージ関連の設定

:title
オートモード停止

:exp
オートモードを停止します。

#[end]
*/

tyrano.plugin.kag.tag.autostop = {
    pm: {
        next: "true",
    },

    start: function (pm) {
        this.kag.setAuto(false);
        this.kag.stat.is_wait_auto = false;

        //↓他から直接呼ばれた時に、２重に実行されるため、コメントにしているが
        //このタグを単独で使えないので、問題有り。 git show 2bc37170
        if (pm.next == "true") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[autoconfig]

:group
メッセージ関連の設定

:title
オート設定

:exp
オートモードに関する設定を行います。

:param
speed     = オートモード時のスピードをミリ秒で指定してください,
clickstop = 画面クリック時にオートモードを停止するかどうか。`true`または`false`で指定します。`false`を指定すると、画面をクリックしてもオートモードが止まらないようになります。

#[end]
*/

tyrano.plugin.kag.tag.autoconfig = {
    pm: {
        speed: "",
        clickstop: "",
    },

    start: function (pm) {
        if (pm.speed != "") {
            this.kag.config.autoSpeed = pm.speed;
            this.kag.ftag.startTag("eval", {
                exp: "sf._system_config_auto_speed = " + pm.speed,
                next: "false",
            });
        }

        if (pm.clickstop != "") {
            this.kag.config.autoClickStop = pm.clickstop;
            this.kag.ftag.startTag("eval", {
                exp: "sf._system_config_auto_click_stop = " + pm.clickstop,
                next: "false",
            });
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[anim]

:group
アニメーション

:title
アニメーション

:exp
画像やボタン、レイヤなどの中身をアニメーションさせることができます。

アニメーションさせる要素の指定には、`[image]``[ptext]``[button]`タグなどに指定した`name`を利用します。あるいはレイヤを指定することで、レイヤの中にあるすべての要素をアニメーション対象にすることもできます。

このタグはアニメーションの終了を待ちません。アニメーションの完了を待つには`[wa]`タグを使用してください。

アニメーションの座標指定については、`+=100``-=100`のように指定することで<b>相対位置</b>で指定できます。（いま表示されているところから右に100px移動、といった表現が可能）

透明度を指定することでフェードインやフェードアウトも可能です。

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
name    = ここで指定した値が設定されている要素に対してアニメーションを開始します。name属性で指定した値です。,
layer   = name属性が指定されている場合は無視されます。前景レイヤを指定します。必ずforeページに対して実施されます。,
left    = 指定した横位置にアニメーションで移動します。,
top     = 指定した縦位置にアニメーションで移動します。,
width   = 幅を指定します,
height  = 高さを指定します,
opacity = 0～255の値を指定します。指定した透明度へアニメーションします,
color   = 色指定,
time    = アニメーションにかける時間をミリ秒で指定してください。デフォルトは2000ミリ秒です,
effect  = 変化のエフェクトを指定します。以下のキーワードが指定できます。
`jswing``def``easeInQuad``easeOutQuad``easeInOutQuad``easeInCubic``easeOutCubic``easeInOutCubic``easeInQuart``easeOutQuart``easeInOutQuart``easeInQuint``easeOutQuint``easeInOutQuint``easeInSine``easeOutSine``easeInOutSine``easeInExpo``easeOutExpo``easeInOutExpo``easeInCirc``easeOutCirc``easeInOutCirc``easeInElastic``easeOutElastic``easeInOutElastic``easeInBack``easeOutBack``easeInOutBack``easeInBounce``easeOutBounce``easeInOutBounce`

:demo
1,kaisetsu/12_anim

#[end]
*/

tyrano.plugin.kag.tag.anim = {
    pm: {
        name: "",
        layer: "",
        left: "",
        top: "",
        width: "",
        height: "",
        opacity: "",
        color: "",
        time: "2000",
        effect: "",
    },

    start: function (pm) {
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

        // アニメーション対象のjQueryオブジェクト
        let j_targets = null;

        if (pm.name != "") {
            // nameパラメータが指定されている場合はそれをクラスに持つ要素をすべて選択する
            j_targets = $("." + pm.name);
        } else if (pm.layer != "") {
            // name指定がなくlayer指定がある場合はそのレイヤの子要素をすべて選択する
            var layer_name = pm.layer + "_fore";
            // フリーレイヤの場合
            if (pm.layer === "free") {
                layer_name = "layer_free";
            }
            j_targets = $("." + layer_name).children();
        }

        if (j_targets) {
            j_targets.each(function () {
                // アニメーションスタックを積み上げる
                that.kag.pushAnimStack();

                // アニメーションの実施
                $(this)
                    .stop(true, true)
                    .off("remove.anim")
                    .on("remove.anim", () => {
                        // アニメーション中に要素が削除されてしまった場合の対策
                        // 要素削除時にアニメーションスタックをポップする処理を仕込んでおく
                        // ※通常通りアニメーションが完了した場合このイベントハンドラは取り除かれる
                        // ※"remove"はJavaScriptの標準イベントではなくjQueryが実装しているカスタムイベント
                        that.kag.popAnimStack();
                    })
                    .addClass("tyrano-anim")
                    .animate(anim_style, parseInt(pm.time), pm.effect, function () {
                        // 要素削除時のイベントハンドラはもう不要
                        $(this).off("remove.anim").removeClass("tyrano-anim");
                        // アニメーションスタックを取り除く
                        that.kag.popAnimStack();
                    });
            });
        }

        //次の命令へ　アニメーション終了街の場合は厳しい
        this.kag.ftag.nextOrder();
    },
};

/*
#[wa]

:group
アニメーション

:title
アニメーション終了待ち

:exp
実行中のアニメーションすべて終了するまで処理を待ちます。

:sample

:param

#[end]
*/

//トランジション完了を待つ
tyrano.plugin.kag.tag.wa = {
    start: function (pm) {
        //実行中のアニメーションがある場合だけ待つ
        if (this.kag.tmp.num_anim > 0) {
            this.kag.stat.is_wait_anim = true;
            this.kag.weaklyStop();
        } else {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[stopanim]

:group
アニメーション

:title
アニメーション強制停止

:exp
実行中のアニメーションを強制的に停止します。

:sample

:param
name = アニメーションを強制停止する要素の`name`を指定します。

#[end]
*/

//アニメーション強制停止
tyrano.plugin.kag.tag.stopanim = {
    vital: ["name"],

    pm: {
        name: "",
    },

    start: function (pm) {
        $("." + pm.name).stop();
        this.kag.popAnimStack();
        this.kag.ftag.nextOrder();
    },
};

//================キーフレームアニメーション系

/*
#[keyframe]

:group
アニメーション

:title
キーフレームアニメーション定義の開始

:exp
キーフレームアニメーションの定義を開始します。

定義したキーフレームアニメーションは`[kanim]`タグで使用できます。

:sample

;----keyframeの定義
[keyframe name="fuwafuwa"]

[frame p=40%  x="100" ]
[frame p=100% y="-200" opacity=0 ]

[endkeyframe]

;-----定義したアニメーションを実行

:param
name = キーブレームアニメーションの名前を指定します。`[kanim]`タグで使用します。

:demo
2,kaisetsu/15_kanim

#[end]
*/

tyrano.plugin.kag.tag.keyframe = {
    vital: ["name"],

    pm: {
        name: "",
    },

    start: function (pm) {
        this.kag.stat.current_keyframe = pm.name;

        this.kag.ftag.nextOrder();
    },
};

/*
#[endkeyframe]

:group
アニメーション

:title
キーフレームアニメーション定義の終了

:exp
キーフレームアニメーション定義を終了します。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag.endkeyframe = {
    pm: {},

    start: function (pm) {
        this.kag.stat.current_keyframe = "";
        this.kag.ftag.nextOrder();
    },
};

/*
#[frame]

:group
アニメーション

:title
キーフレームアニメーション定義

:exp
キーフレームをひとつ定義します。`[keyframe]`と`[endkeyframe]`の間に記述します。

:sample

:param
p           = キーフレームの位置をパーセンテージ（`0%`〜`100%`）で指定します。たとえば`50%`と指定すれば、全体の長さが4秒のアニメーションのなかの2秒目、となります。`0%`のキーフレームを省略することで前回のアニメーション状態を継承できます。,
x           = X軸方向へのアニメーション量をピクセル単位で指定してください。`*`(アスタリスク)で始めることで、絶対位置として指定できます。<br>例） `x＝"100"`(前へ100px移動する)、`x="*100"`(画面左端から100pxの位置へ移動する),
y           = Y軸方向へのアニメーション量をピクセル単位で指定してください。`*`(アスタリスク)で始めることで、絶対位置として指定できます。,
z           = Z軸方向へのアニメーション量をピクセル単位で指定してください。`*`(アスタリスク)で始めることで、絶対位置として指定できます。<br><br>このパラメータを使用することで三次元的な表現が可能ですが、対応しているのは一部のブラウザのみとなります。,
rotate      = 対象を回転させることができます。たとえば180度回転させたい場合、`180deg`のように指定します。,
rotateX     = 対象をX軸を軸として回転させることができます。,
rotateY     = 対象をY軸を軸として回転させることができます。,
rotateZ     = 対象をZ軸を軸として回転させることができます。,
scale       = 対象を拡大または縮小できます。2倍に拡大するには`2`を、半分に縮小するには`0.5`を指定します。,
scaleX      = X方向に拡大または縮小できます。,
scaleY      = Y方向に拡大または縮小できます。,
scaleZ      = Z方向に拡大または縮小できます。,
skew        = 傾斜を指定できます。,
skewX       = X傾斜を指定できます。,
skewY       = Y傾斜を指定できます。,
perspective = 遠近効果を付与できます。一部ブラウザのみ対応。,
opacity     = !!,
その他        = CSSのスタイルを各種指定できます。

:demo
2,kaisetsu/15_kanim

#[end]
*/

tyrano.plugin.kag.tag.frame = {
    vital: ["p"],

    pm: {
        p: "",
    },

    master_trans: {
        x: "",
        y: "",
        z: "",
        translate: "",
        translate3d: "",
        translateX: "",
        translateY: "",
        translateZ: "",
        scale: "",
        scale3d: "",
        scaleX: "",
        scaleY: "",
        scaleZ: "",
        rotate: "",
        rotate3d: "",
        rotateX: "",
        rotateY: "",
        rotateZ: "",
        skew: "",
        skewX: "",
        skewY: "",
        perspective: "",
    },

    start: function (pm) {
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

        for (let key in pm) {
            if (this.master_trans[key] == "") {
                map_trans[key] = pm[key];
            } else {
                map_style[key] = pm[key];
            }
        }

        this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]["frames"][percentage] = {
            trans: map_trans,
            styles: map_style,
        };

        this.kag.ftag.nextOrder();
    },
};

/*
#[kanim]

:group
アニメーション

:title
キーフレームアニメーションの実行

:exp
キーフレームアニメーションを実行します。事前に`[keyframe]`タグでキーフレームアニメーションを定義しておく必要があります。

:sample

:param
name       = アニメーションさせる画像やテキストの`name`を指定します。,
layer      = `name`を指定せずに`layer`を指定することで、そのレイヤに存在するすべての要素をアニメーションさせることができます。,
keyframe   = 適用するキーフレームアニメーションの`name`を指定します。,
time       = アニメーション時間をミリ秒で指定します。,
easing     = アニメーションの変化パターンを指定できます。以下のキーワードが指定できます。<br>
`ease`(開始時点と終了時点を滑らかに再生する)<br>
`linear`(一定の間隔で再生する)<br>
`ease-in`(開始時点をゆっくり再生する)<br>
`ease-out`(終了時点をゆっくり再生する)<br>
`ease-in-out`(開始時点と終了時点をゆっくり再生する)<br>
この他に`cubic-bezier`関数を使って独自のイージングを指定することも可能です。
,
count      =  再生回数を指定できます。`infinite`を指定することで無限ループさせることもできます。,
delay      =  開始までの時間を指定できます。初期値は`0`、つまり遅延なしです。,
direction  =  アニメーションを複数回ループさせる場合に、偶数回目のアニメーションを逆再生にするかを設定できます。偶数回目を逆再生にする場合は`alternate`を指定します。,
mode       =  アニメーションの最後のフレームの状態（位置、回転など）をアニメーション終了後も維持するかを設定できます。`forwards`(デフォルト)で維持。`none`を指定すると、アニメーション再生前の状態に戻ります。

:demo
2,kaisetsu/15_kanim

#[end]
*/

tyrano.plugin.kag.tag.kanim = {
    vital: ["keyframe"],

    pm: {
        name: "",
        layer: "",
        keyframe: "",
    },

    start: function (pm) {
        const that = this;

        // pmのコピーを取っておく
        const original_pm = $.extend({}, pm);

        // アニメーション対象を取得、見つからなければ早期リターン
        const j_targets = $.findAnimTargets(pm);
        if (j_targets.length === 0) {
            if (pm._next !== false) {
                this.kag.ftag.nextOrder();
            }
            return;
        }

        const anim = $.extend({}, this.kag.stat.map_keyframe[pm.keyframe]);

        anim.config = pm;

        if (pm.time) {
            pm.duration = parseInt(pm.time) + "ms";
        }

        if (pm.delay) {
            pm.delay = parseInt(pm.delay) + "ms";
        }

        // 無限ループではない場合にのみアニメスタックを有効にする
        const should_push_anim_stack = pm.count !== "infinite";

        delete pm.name;
        delete pm.keyframe;
        delete pm.layer;

        j_targets.each(function () {
            const j_this = $(this);

            // アニメーション定義をディープコピーする
            const this_anim = $.extend(true, {}, anim);

            // 左右反転画像の場合（すなわち[image reflect="true"]の場合）
            if (j_this.hasClass("reflect")) {
                // 画像の左右反転はreflectクラスを付けてtransform: scaleX(-1)を適用することによって実現しているため、
                // 単純に[kanim]を使用してキーフレームアニメーションを適用すると、
                // transformプロパティが上書きされることによって、左右反転が解除されてしまう！
                // そこで、左右反転画像に対して[kanim]を使用する際は、事前にアニメーション定義を書き変えてしまおう
                let prev_scale_x = 1;
                for (let key in this_anim.frames) {
                    const frame = this_anim.frames[key];
                    if (typeof frame.trans.scaleX === "undefined") {
                        frame.trans.scaleX = prev_scale_x;
                    }
                    prev_scale_x = frame.trans.scaleX;
                    frame.trans.scaleX *= -1;
                }
                // CSSのscaleプロパティによる対応もひとつの手だが、
                // 旧Chromiumではscaleプロパティが使用できないため実装を保留
            }

            // "この要素"専用の complete メソッドを取り付ける
            this_anim.complete = () => {
                if (should_push_anim_stack && this.anim_stack_exists) {
                    this.anim_stack_exists = false;
                    that.kag.popAnimStack();
                }
            };

            // アニメスタックが有効の場合はぶち込んでおく
            // Element の should_push_anim_stack プロパティで管理してみよう
            if (should_push_anim_stack && !this.anim_stack_exists) {
                this.anim_stack_exists = true;
                that.kag.pushAnimStack();
            }

            // 無限ループアニメーションの場合はロード時に復元が必要
            that.kag.event.removeRestoreData(j_this, "kanim");
            if (pm.count === "infinite") {
                that.kag.event.addRestoreData(j_this, "kanim", original_pm);
            }

            // 要素が削除されたときにcompleteを呼ぶ
            j_this.on("remove", () => {
                this_anim.complete();
            });

            // アニメーションを開始
            j_this.a3d(this_anim);
        });

        // 不意の要素削除のテスト
        // setTimeout(() => {
        //     console.warn("suddenly remove!");
        //     j_targets.remove();
        // }, 300);

        if (pm._next !== false) {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[stop_kanim]

:group
アニメーション

:title
キーフレームアニメーションの停止

:exp
キーフレームアニメーションを停止します。

:sample

:param
name  = アニメーションを停止する画像やテキストの`name`を指定します。,
layer = `name`を指定せずに`layer`を指定することで、そのレイヤに存在するすべての要素のアニメーションを停止できます。

#[end]
*/

tyrano.plugin.kag.tag.stop_kanim = {
    pm: {
        name: "",
        layer: "",
    },

    start: function (pm) {
        const that = this;

        // アニメーション対象を取得、見つからなければ早期リターン
        const j_targets = $.findAnimTargets(pm);
        if (j_targets.length === 0) {
            this.kag.ftag.nextOrder();
            return;
        }

        j_targets.each(function () {
            const j_this = $(this);

            // アニメスタックが入っているならポップしておく
            if (this.anim_stack_exists) {
                this.anim_stack_exists = false;
                that.kag.popAnimStack();
            }

            j_this.css({
                "animation-name": "",
                "animation-play-state": "",
                "animation-iteration-count": "",
                "animation-fill-mode": "",
                "animation-timing-function": "",
                "transform": "",
            });

            that.kag.event.removeRestoreData(j_this, "kanim");
        });

        this.kag.ftag.nextOrder();
    },
};

/*
#[xanim]

:group
アニメーション

:title
汎用アニメーションの実行

:exp
V515以降で使用可能。

`[anim]`と`[kanim]`の機能を併せ持つ、汎用的なアニメーション実行タグです。

事前に`[keyframe]`タグで定義したキーフレームアニメーションを`keyframe`パラメータに指定して実行することもできますし、`[anim]`タグのように変化対象のパラメータを直接指定することもできます。



:sample
;キーフレームアニメーションを無限ループで適用
[keyframe name="yoko"]
[frame p="0%" x="0"]
[frame p="100%" x="100"]
[endkeyframe]
[xanim name="akane" keyframe="yoko" count="infinite" time="1000" direction="alternate" easing="linear"]

;2秒かけて500px右に移動 デフォルトではアニメーションの完了は待たずに次に進むよ
[xanim name="akane" x="500" time="2000"]

:param
name       = アニメーションさせる画像やテキストの`name`を指定します。,
layer      = `name`を指定せずに`layer`を指定することで、そのレイヤに存在するすべての要素をアニメーションさせることができます。,
keyframe   = 適用するキーフレームアニメーションの`name`を指定します。,
time       = アニメーション時間をミリ秒で指定します。,
easing     = `[anim]`タグに指定できるキーワードと`[kanim]`に指定できるキーワードがすべて使用可能です。,
count      =  再生回数を指定できます。`infinite`を指定することで無限ループさせることもできます。,
delay      =  開始までの時間を指定できます。初期値は`0`、つまり遅延なしです。,
direction  =  アニメーションを複数回ループさせる場合に、偶数回目のアニメーションを逆再生にするかを設定できます。偶数回目を逆再生にする場合は`alternate`を指定します。,
mode       =  アニメーションの最後のフレームの状態（位置、回転など）をアニメーション終了後も維持するかを設定できます。`forwards`(デフォルト)で維持。`none`を指定すると、アニメーション再生前の状態に戻ります。,
svg        = svgファイルを指定できます。svgファイルは`image`フォルダに配置します。これを指定すると、svgファイル内で定義された<path>に沿ってアニメーションさせることができます。,
svg_x      = svgファイルを指定したとき、X座標を<path>に沿わせるかどうか。`true`または`false`で指定します。,
svg_y      = svgファイルを指定したとき、Y座標を<path>に沿わせるかどうか。`true`または`false`で指定します。,
svg_rotate = svgファイルを指定したとき、角度を<path>に沿わせるかどうか。`true`または`false`で指定します。,
wait       = アニメーションの完了を待つかどうか。`true`または`false`で指定します。,
他         = この他、`[anim]`タグに指定できるパラメータや、各種CSSプロパティをアニメーション対象にすることができます。

#[end]
*/

tyrano.plugin.kag.tag.xanim = {
    pm: {
        name: "",
        layer: "",
        keyframe: "",
        easing: "ease",
        count: "1",
        delay: "0",
        direction: "normal",
        mode: "forwards",
        reset: "true",
        time: "",
        svg: "",
        svg_x: "true",
        svg_y: "true",
        svg_rotate: "false",
        next: "true",
        wait: "false",
    },

    start: function (pm) {
        // <svg>を使わない場合は_startに投げて早期リターン
        if (!pm.svg) {
            this._start(pm);
            return;
        }

        // <svg>を使うようだ

        // ロードした<svg>を格納する不可視エリア
        // (DOM要素としてちゃんとappendしないとanimejsで動作しなかった)
        const j_hidden_area = this.kag.getHiddenArea();

        // ロードした<svg>の情報を保存しておく領域
        if (!this.kag.stat.hidden_svg_list) {
            this.kag.stat.hidden_svg_list = [];
        }

        // <svg>のjQueryオブジェクト
        let j_svg;

        // <svg>のコンテンツを直接文字列で指定できるようにしてみる
        // if (pm.svg.charAt(0) === "<") {
        //     const this_tag_id = `${this.kag.stat.current_scenario}_line_${parseInt(this.kag.stat.current_line) + 1}`;
        //     j_svg = $(pm.svg).attr("id", this_tag_id).appendTo(j_hidden_area);
        //     this.kag.stat.hidden_svg_list[this_tag_id] = pm.svg;
        //     this._start(pm, j_svg);
        //     return;
        // }

        // <svg>のパスを補完
        const path = $.parseStorage(pm.svg, "image");

        // すでに存在しているならそれをゲット
        j_svg = document.getElementById(path);
        if (j_svg) {
            this._start(pm, $(j_svg));
            return;
        }

        // 存在していないならプリロードしよう
        $.get(path, (xml) => {
            j_svg = $(xml).find("svg").attr("id", path).appendTo(j_hidden_area);
            this.kag.stat.hidden_svg_list.push(path);
            this._start(pm, j_svg);
        });
    },

    _start: function (_pm, j_svg) {
        const that = this;
        const pm = $.extend({}, _pm);

        const should_wait = pm.wait !== "false" && pm.count !== "infinite";
        const should_next = pm.next !== "false";

        // 次のタグに進む
        let is_next_done = false;
        const next = () => {
            if (is_next_done) {
                return;
            }
            is_next_done = true;
            if (should_next) this.kag.ftag.nextOrder();
        };

        // アニメーション対象を取得、見つからなければ早期リターン
        const j_targets = $.findAnimTargets(pm);
        if (j_targets.length === 0) {
            next();
            return;
        }

        const duration = parseInt(pm.time) || 1000;
        const delay = parseInt(pm.delay) || 0;
        const direction = pm.direction;
        const loop = pm.count === "infinite" ? true : parseInt(pm.count) || 1;
        const mode = pm.mode;

        //
        // イージング
        //

        let easing = pm.easing;

        // jquery.a3d.js時代のeasingパラメータのフォールバック
        // https://developer.mozilla.org/ja/docs/Web/CSS/easing-function
        const oldOptions = {
            "ease": "cubicBezier(0.25, 0.1, 0.25, 1.0)",
            "ease-in": "cubicBezier(0.42, 0.0, 1.0, 1.0)",
            "ease-out": "cubicBezier(0.42, 0.0, 0.58, 1.0)",
            "ease-in-out": "cubicBezier(0.0, 0.0, 0.58, 1.0)",
            "swing": "easeOutQuad",
            "jswing": "easeOutQuad",
            "def": "easeOutQuad",
        };
        if (oldOptions[easing]) {
            easing = oldOptions[easing];
        }
        easing = easing.replace("cubic-bezier", "cubicBezier");

        //
        // キーフレーム情報を決定
        //

        // アニメーション定義を取得
        let keyframes_css_names = [];
        const keyframes = [];
        if (pm.keyframe) {
            const anim = this.kag.stat.map_keyframe[pm.keyframe];
            if (!anim) {
                this.kag.error("undefined_keyframe", pm);
                next();
                return;
            }
            let previous_time = 0;
            for (const key in anim.frames) {
                const frame = anim.frames[key];
                const percentage = parseInt(key);
                if (isNaN(percentage)) {
                    this.kag.error("invalid_keyframe_percentage", { percentage: key });
                } else {
                    // ひとつ前のキーフレームからこのキーフレームまでの時間を計算したい
                    const time = (duration * percentage) / 100;
                    const time_of_section = time - previous_time;
                    previous_time = time;

                    // キーフレーム情報
                    // 時間、transformプロパティ、CSSプロパティの情報を持つ
                    const keyframe = $.extend({ duration: time_of_section }, frame.styles);
                    delete keyframe._tag;

                    // さらにキーフレーム定義をマージしたいのだが
                    // このときx, y, zについてはtranslateX, translateY, translateZに変換する必要がある
                    for (const _key in frame.trans) {
                        const key = _key.replace(/^(x|y|z)$/, function (v) {
                            return "translate" + v.toUpperCase();
                        });
                        const val = frame.trans[_key];
                        keyframe[key] = val;
                    }

                    // アニメーション操作対象となるCSSのプロパティ名を記録
                    keyframes_css_names = Object.keys(frame.styles);
                    if (Object.keys(frame.trans).length > 0) {
                        keyframes_css_names.push("transform");
                    }

                    keyframes.push(keyframe);
                }
            }

            if (keyframes.length === 0) {
                this.kag.error("invalid_keyframe");
                next();
                return;
            }
        }

        //
        // 直接CSSプロパティを指定してアニメーションさせることもできる
        //

        const css_in_pm = {};
        for (const _key in pm) {
            if (!(_key in this.pm) && _key !== "_tag") {
                const key = _key.replace(/^(x|y|z)$/, function (v) {
                    return "translate" + v.toUpperCase();
                });
                css_in_pm[key] = pm[_key];
            }
        }

        // いくつかのプロパティはティラノ標準に合わせよう
        if (pm.opacity) pm.opacity = $.convertOpacity(pm.opacity);
        if (pm.color) pm.color = $.convertColor(pm.color);
        if (pm["background-color"]) pm["background-color"] = $.convertColor(pm["background-color"]);

        // アニメーションを実行
        j_targets.each(function () {
            const j_this = $(this);

            // アニメーションを実行する前のCSSプロパティを保存しておく
            const initial_keyframes_css = {};
            if (keyframes_css_names && mode === "none") {
                keyframes_css_names.forEach(function (prop) {
                    initial_keyframes_css[prop] = j_this.css(prop);
                });
            }

            // アニメーションを実行する前にCSSプロパティをリセットする
            if (keyframes_css_names && pm.reset === "true") {
                keyframes_css_names.forEach(function (prop) {
                    j_this.css(prop, "");
                });
            }

            // セーブデータロード時にこのアニメーションを復元すべきか
            const should_restore = loop === true;

            // 復元すべき要素に付けるクラス名
            const class_for_restore = "set-xanim-restore";

            // anime()の戻り値
            let anime_state;

            // anime()のオプション
            const anime_opt = {
                targets: this,
                duration: duration,
                complete: () => {
                    if (keyframes_css_names && mode === "none") {
                        j_this.css(initial_keyframes_css);
                    }
                    // アニメ―ションスタックをpop
                    if (loop !== true) {
                        that.kag.popAnimStack();
                    }
                    if (should_restore) {
                        j_this.removeClass(class_for_restore);
                    }
                    if (this.anime_state_set) {
                        const is_succeeded = this.anime_state_set.delete(anime_state);
                        //console.warn(is_succeeded);
                    }
                    if (should_wait) next();
                },
                easing: easing,
                delay: delay,
                direction: direction,
                loop: loop,
            };

            // キーフレームを使うならオプションにセットしよう
            if (keyframes.length > 0) {
                anime_opt.keyframes = keyframes;
            }

            // CSS直接指定があるならオプションにセット
            for (const key in css_in_pm) {
                anime_opt[key] = css_in_pm[key];
            }

            // 要素が削除されたときにアニメーションを強制的に完了させる
            j_this.on("remove", () => {
                // Setを操作
                if (this.anime_state_set) {
                    for (const anime_state of this.anime_state_set) {
                        if (!anime_state.completed) {
                            anime_state.pause();
                            anime_state.complete();
                        }
                    }
                }
            });

            // アニメ―ションスタックをpush
            if (loop !== true) {
                that.kag.pushAnimStack();
            }

            // <svg>を使用する場合
            if (j_svg) {
                const path_elm = j_svg.find("path").get(0);
                const path = anime.path(path_elm);
                if (pm.svg_x === "true") {
                    anime_opt.translateX = path("x");
                }
                if (pm.svg_y === "true") {
                    anime_opt.translateY = path("y");
                }
                if (pm.svg_rotate === "true") {
                    anime_opt.rotateZ = path("angle");
                }
                // transform をいじくり回す
                keyframes_css_names.push("transform");
            }

            if (should_restore) {
                // ループアニメーションの場合はロード時に復元する必要アリ
                j_this.addClass(class_for_restore);

                // パラメータを記憶
                j_this.attr("data-event-pm", JSON.stringify(_pm));

                // アニメーション適用前のスタイルを記憶
                // [xanim]でいじくり回されることが予想されるプロパティすべて
                const initial_css_map = {};
                for (const name of keyframes_css_names) {
                    initial_css_map[name] = j_this.css(name);
                }
                for (const name in css_in_pm) {
                    initial_css_map[name] = j_this.css(name);
                }
                j_this.attr("data-effect", JSON.stringify(initial_css_map));

                //console.warn({ pm, keyframes_css_names, css_in_pm, initial_css_map });
            }

            // ここでアニメーションを実行
            anime_state = anime(anime_opt);

            // Setを操作
            if (!this.anime_state_set) {
                this.anime_state_set = new Set();
            }
            this.anime_state_set.add(anime_state);

            // console.warn(anime_opt);
            // console.warn(anime_state);
        });

        // 不意の要素削除のテスト
        // setTimeout(() => {
        //     console.warn("suddenly remove!");
        //     j_targets.remove();
        // }, 300);

        if (!should_wait) {
            next();
        }
    },
};

/*
#[stop_xanim]

:group
アニメーション

:title
[xanim]の停止

:exp
V515以降で使用可能。
[xanim]で開始したアニメーションを停止します。

:sample

:param
name  = アニメーションを停止する画像やテキストの`name`を指定します。,
layer = `name`を指定せずに`layer`を指定することで、そのレイヤに存在するすべての要素のアニメーションを停止できます。,
complete = `true`を指定すると、当初アニメーションするはずだった地点まで一瞬で移動させます。`false`の場合はその場で止まります。

#[end]
*/

tyrano.plugin.kag.tag.stop_xanim = {
    pm: {
        name: "",
        layer: "",
        complete: "false",
    },

    start: function (pm) {
        const that = this;

        // アニメーション対象を取得、見つからなければ早期リターン
        const j_targets = $.findAnimTargets(pm);
        if (j_targets.length === 0) {
            this.kag.ftag.nextOrder();
            return;
        }

        j_targets.each(function () {
            const j_this = $(this);

            // Setを操作
            if (this.anime_state_set) {
                for (const anime_state of this.anime_state_set) {
                    if (!anime_state.completed) {
                        if (pm.complete === "true") {
                            anime_state.seek(anime_state.duration);
                        }
                        anime_state.pause();
                        anime_state.complete();
                        // console.warn(this.anime_state_set);
                    }
                }
            }
        });

        this.kag.ftag.nextOrder();
    },
};

//=====================================

/*
#[chara_ptext]

:group
キャラクター操作

:title
キャラクターの名前表示と表情変更

:exp
キャラクターの名前を表示するためのタグです。いましゃべっているキャラクターの名前をメッセージウィンドウの上部に出すのが主な使い方になるでしょう。`face`属性を指定することで、名前を出すと同時にそのキャラクターの表情を変更することもできます。

あらかじめ`[ptext]`で作っておいたテキスト領域にキャラクターの名前を上書きする処理を行います。`[chara_ptext]`を使用する前に`[ptext]`および`[chara_config]`による事前準備が必要になります。実際の手順はサンプルコードを参照してください。

<b>このタグは省略して書くことができます。</b>省略記法では、行の先頭に`#`を書き、続けて`name`属性に指定する値を書きます。表情を変更する場合は続けて`:`を書き、`face`属性に指定する値を書きます。

つまり、`#akane:gekioko`と`[chara_ptext name=akane face=gekioko]`は同じ動作をします。

:param
name = `[chara_new]`タグで定義した`name`を指定します。それをひもついた`jname`がテキストエリアに表示されます。その`name`のキャラクター定義が存在しなかった場合、`name`に指定された内容がそのままテキストエリアに表示されます。,
face = `[chara_face]`タグで定義した`face`を指定します。

:sample
;レイヤ0を表示
[layopt layer="0" visible="true"]

;テキスト領域をレイヤ0に作成
[ptext layer="0" name="name_space" x="100" y="200" text="ここにキャラの名前が入る"]

;↑で作ったテキスト領域(name_space)をキャラ名表示用であると宣言する
[chara_config ptext="name_space"]

;キャラ定義
[chara_new name="akane" storage="chara/akane/normal.png" jname="あかね"]
[chara_new name="yamato" storage="chara/yamato/normal.png" jname="やまと"]

;キャラ名表示！
[chara_ptext name="akane"]
あかねです[p]

;このような省略記法もあります（行頭に#を書いて、キャラのnameを続けて書く）
;実際にはこの書き方を使うことがほとんどでしょう
#yamato
やまとです[p]

;消去もできる
#
地の文です[p]

;キャラ登録されていなくてもOK
#？？？
こんにちは[p]

#[end]
*/

tyrano.plugin.kag.tag.chara_ptext = {
    pm: {
        name: "",
        face: "",
    },

    start: function (pm) {
        this.kag.weaklyStop();
        const j_chara_name = this.kag.chara.getCharaNameArea();

        //
        // 発言者名
        //

        // 誰も話していない場合
        if (pm.name == "") {
            j_chara_name.updatePText("");

            // キャラフォーカス機能が有効の場合、全員に非発言者用のスタイルを当てる。誰も話していないから
            if (this.kag.stat.chara_talk_focus != "none") {
                this.kag.chara.setNotSpeakerStyle(this.kag.chara.getCharaContainer());
            }

            //ズームの場合は最後にズームされたキャラをもとに戻す
            if (this.kag.stat.chara_talk_anim == "zoom") {
                this.zoomChara("", this.kag.stat.chara_talk_anim_zoom_rate);
            }
        }
        // 誰かが話している場合
        else {
            // 日本語で指定されていた場合はIDに直す
            // 例) "あかね" → "akane"
            if (this.kag.stat.jcharas[pm.name]) {
                pm.name = this.kag.stat.jcharas[pm.name];
            }

            // キャラクター定義を取得
            const cpm = this.kag.stat.charas[pm.name];

            // キャラクターが取得できた場合
            if (cpm) {
                // キャラクター名出力
                j_chara_name.updatePText(cpm.jname);

                // 色指定がある場合は、その色を指定する。
                if (cpm.color != "") {
                    j_chara_name.css("color", $.convertColor(cpm.color));
                }

                const j_chara_speaker = this.kag.chara.getCharaContainer(pm.name);

                // キャラフォーカス機能が有効の場合、全員に非発言者用のスタイルを当ててから
                // 発言者にのみ発言者用のスタイルを当てる
                if (this.kag.stat.chara_talk_focus != "none") {
                    this.kag.chara.setNotSpeakerStyle(this.kag.chara.getCharaContainer());
                    this.kag.chara.setSpeakerStyle(j_chara_speaker);
                }

                // 発言時アニメーション機能が有効な場合
                if (this.kag.stat.chara_talk_anim != "none" && j_chara_speaker.get(0)) {
                    let timeout = 0;
                    if (pm.face != "") {
                        // 表情の指定があれば一瞬で変更する！このあとアニメーションになるから
                        this.kag.ftag.startTag("chara_mod", {
                            name: pm.name,
                            face: pm.face,
                            next: "false",
                            time: "0",
                        });
                        // [chara_mod]は非同期処理(プリロードを挟む)なのでタイムアウトを付ける
                        timeout = 10;
                    }
                    // アニメ―ションを再生

                    $.setTimeout(() => {
                        if (this.kag.stat.chara_talk_anim == "zoom") {
                            this.zoomChara(pm.name, this.kag.stat.chara_talk_anim_zoom_rate);
                        } else {
                            this.animChara(j_chara_speaker, this.kag.stat.chara_talk_anim, pm.name);
                        }
                    }, timeout);
                }
            }
            // キャラクター定義が存在しない場合
            else {
                // 指定ワードをそのまま表示
                j_chara_name.updatePText(pm.name);

                // キャラフォーカス機能が有効の場合、全員に非発言者用のスタイルを当てる。誰も話していないから
                if (this.kag.stat.chara_talk_focus != "none") {
                    this.kag.chara.setNotSpeakerStyle(this.kag.chara.getCharaContainer());
                }

                //ズームの場合は最後にズームされたキャラをもとに戻す
                if (this.kag.stat.chara_talk_anim == "zoom") {
                    this.zoomChara("", this.kag.stat.chara_talk_anim_zoom_rate);
                }
            }
        }

        // 現在の発言者
        this.kag.stat.current_speaker = pm.name || "";

        //
        // ボイス設定
        //

        if (this.kag.stat.vostart == true) {
            //キャラクターのボイス設定がある場合

            if (this.kag.stat.map_vo["vochara"][pm.name]) {
                const vochara = this.kag.stat.map_vo["vochara"][pm.name];
                const playsefile = $.replaceAll(vochara.vostorage, "{number}", vochara.number);

                const se_pm = {
                    loop: "false",
                    storage: playsefile,
                    stop: "true",
                    buf: vochara.buf,
                    chara_name: pm.name,
                };

                this.kag.ftag.startTag("playse", se_pm);

                vochara.number++;

                // 次のボイスのプリロード
                if (this.kag.stat.voconfig_preload) {
                    this.kag.preloadNextVoice();
                }
            }
        }

        this.kag.stat.f_chara_ptext = "true";

        //
        // 表情の変更もあわせてできる
        //

        this.kag.cancelWeakStop();
        if (pm.face != "" && this.kag.stat.chara_talk_anim == "none") {
            // ※発言時アニメーション機能が有効な場合はすでに上のほうで表情変更済み
            // [chara_mod]に丸投げする！ nextOrder もこれに任せる
            this.kag.ftag.startTag("chara_mod", {
                name: pm.name,
                face: pm.face,
            });
        } else {
            this.kag.ftag.nextOrder();
        }
    },

    //キャラクターのアニメーション設定
    animChara: function (chara_obj, type, name) {
        //アニメーション中の場合は、重ねない
        if (typeof this.kag.tmp.map_chara_talk_top[name] != "undefined") {
            return;
        }

        //アニメーション
        var that = this;
        var tmp_top = parseInt(chara_obj.get(0).offsetTop);
        chara_obj.css("top", tmp_top);
        var a_obj = {};
        var b_obj = {};

        //アニメーション中のキャラクターを格納。
        this.kag.tmp.map_chara_talk_top[name] = true;

        var anim_time = this.kag.stat.chara_talk_anim_time;

        if (type == "up") {
            a_obj["top"] = tmp_top - this.kag.stat.chara_talk_anim_value;
            b_obj["top"] = tmp_top;
        } else if (type == "down") {
            a_obj["top"] = tmp_top + this.kag.stat.chara_talk_anim_value;
            b_obj["top"] = tmp_top;
        }

        chara_obj.stop(true, true).animate(a_obj, anim_time, "easeOutQuad", function () {
            chara_obj.stop(true, true).animate(b_obj, anim_time, "easeOutQuad", function () {
                delete that.kag.tmp.map_chara_talk_top[name];
            });
        });
    },

    //キャラクターのズームアニメーション設定
    zoomChara: function (name, zoom_rate) {
        //すでにズームされている対象だった場合はズームしない。

        if (this.kag.stat.chara_last_zoom_name == name) {
            return;
        }

        var anim_time = this.kag.stat.chara_talk_anim_time;

        if (this.kag.stat.chara_last_zoom_name != "") {
            let j_chara_last_zoom = this.kag.chara.getCharaContainer(this.kag.stat.chara_last_zoom_name);

            j_chara_last_zoom.css("margin", 0);
            j_chara_last_zoom.stop(true, true).animate(
                {
                    margin: zoom_rate - 1,
                },
                {
                    duration: anim_time,
                    easing: "easeOutQuad",
                    step: function (now, fx) {
                        //console.log(now);
                        j_chara_last_zoom.css("transform", "scale(" + (zoom_rate - now) + ")");
                    },
                    complete: function () {
                        //console.log("finish");
                        j_chara_last_zoom.css("transform", "");
                    },
                },
            );
        }

        //ズーム対象のキャラクターを格納。
        this.kag.stat.chara_last_zoom_name = name;

        if (name != "") {
            let chara_obj = this.kag.chara.getCharaContainer(name);
            chara_obj.css("margin", 0);
            chara_obj.stop(true, true).animate(
                {
                    margin: zoom_rate - 1,
                },
                {
                    duration: anim_time,
                    easing: "easeOutQuad",
                    step: function (now, fx) {
                        //console.log(now);
                        chara_obj.css("transform", "scale(" + (1 + now) + ")");
                    },
                    complete: function () {
                        //console.log("finish");
                    },
                },
            );
        }
    },
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
pos_mode         = `true`または`false`を指定します。デフォルトは`true`です。`true`の場合、`[chara_show]`タグでキャラクターを表示したときの立ち位置を自動的に計算して配置します。,
ptext            = `[ptext]`で作っておいた、キャラクターの名前を表示するためのテキスト領域の`name`を指定します。詳しくは`[chara_ptext]`の項目を参照してください。,
time             = `[chara_mod]`タグで表情を変える際のクロスフェード時間をミリ秒で指定します。`0`を指定すると瞬間的に切り替わります。,
memory           = キャラクターを退場させたときの表情を記憶しておくかどうか。`true`または`false`を指定します。`true`を指定すると、キャラクターを再登場させたときに、前回退場時の表情のまま表示されます。,
anim             = `pos_mode=true`によってキャラクターの自動配置が有効になっている場合に、キャラクターの立ち位置変化のアニメーションを行うかどうか。`true`または`false`で指定します。,
pos_change_time  = キャラクターの位置を自動で調整する際のアニメーション時間をミリ秒で指定します。,
talk_focus       = 現在話しているキャラクターの立ち絵を目立たせる演出を有効にするための設定です。以下のキーワードが指定できます。`brightness`(明度)、`blur`(ぼかし)、`none`(無効)<br>現在誰が話しているかの指定は`[chara_ptext]`タグもしくはその省略表記である`#akane`のような記述で行います。,
brightness_value = `talk_focus=brightness`の場合の、話していないキャラクターの明度を`0`〜`100`で指定します。デフォルトは`60`。つまり、話していないキャラクターをちょっと暗くします。,
blur_value       = `talk_focus=blur`の場合の、話していないキャラクターのぼかし度合を数値で指定します。デフォルトは`2`。数値が大きくなるほど強くぼけるようになります。,
talk_anim        = キャラクターが話し始めるときに、キャラクターの立ち絵にピョンと跳ねるようなアニメーション演出を自動で加えることができる設定です。以下のキーワードが指定できます。`up`（上に跳ねる）、`down`(下に沈む)、`zoom`（拡大）、`none`(無効),
talk_anim_time   = `talk_anim`が有効な場合の、アニメーション時間をミリ秒で指定できます。,
talk_anim_value  = `talk_anim`が有効な場合の、キャラクターの移動量を指定できます。（ピクセル）,
talk_anim_zoom_rate  = `talk_anim`で`zoom`を使用している場合の拡大率を指定します。デフォルトは1.2,
effect           = キャラクターが位置を入れ替わる際のエフェクト（動き方）を指定できます。指定できるキーワードは次のとおりです。
`jswing``def``easeInQuad``easeOutQuad``easeInOutQuad``easeInCubic``easeOutCubic``easeInOutCubic``easeInQuart``easeOutQuart``easeInOutQuart``easeInQuint``easeOutQuint``easeInOutQuint``easeInSine``easeOutSine``easeInOutSine``easeInExpo``easeOutExpo``easeInOutExpo``easeInCirc``easeOutCirc``easeInOutCirc``easeInElastic``easeOutElastic``easeInOutElastic``easeInBack``easeOutBack``easeInOutBack``easeInBounce``easeOutBounce``easeInOutBounce`

:demo
1,kaisetsu/08_character

#[end]
*/

tyrano.plugin.kag.tag.chara_config = {
    pm: {
        pos_mode: "",
        effect: "",
        ptext: "",
        time: "",
        memory: "",
        anim: "",
        pos_change_time: "", //立ち位置の変更時にかかる時間を指定できます
        talk_focus: "",
        brightness_value: "",
        blur_value: "",
        talk_anim: "",
        talk_anim_time: "",
        talk_anim_value: "",
        talk_anim_zoom_rate: "",
        plus_lighter: "",
    },

    start: function (pm) {
        //入力されている項目のみ、反映させる
        if (pm.pos_mode != "") this.kag.stat.chara_pos_mode = pm.pos_mode;
        if (pm.effect != "") this.kag.stat.chara_effect = pm.effect;
        if (pm.ptext != "") this.kag.stat.chara_ptext = pm.ptext;
        if (pm.time != "") this.kag.stat.chara_time = pm.time;
        if (pm.memory != "") this.kag.stat.chara_memory = pm.memory;
        if (pm.anim != "") this.kag.stat.chara_anim = pm.anim;
        if (pm.pos_change_time != "") this.kag.stat.pos_change_time = pm.pos_change_time;
        if (pm.plus_lighter) this.kag.stat.plus_lighter = pm.plus_lighter;

        if (pm.brightness_value != "") this.kag.stat.chara_brightness_value = pm.brightness_value;
        if (pm.blur_value != "") this.kag.stat.chara_blur_value = pm.blur_value;

        if (pm.talk_anim != "") this.kag.stat.chara_talk_anim = pm.talk_anim;
        if (pm.talk_anim_time != "") this.kag.stat.chara_talk_anim_time = parseInt(pm.talk_anim_time);
        if (pm.talk_anim_value != "") this.kag.stat.chara_talk_anim_value = parseInt(pm.talk_anim_value);
        if (pm.talk_anim_zoom_rate != "") this.kag.stat.chara_talk_anim_zoom_rate = parseFloat(pm.talk_anim_zoom_rate);

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
                "-webkit-filter": "brightness(100%) blur(0px)",
                "-ms-filter": "brightness(100%) blur(0px)",
                "-moz-filter": "brightness(100%) blur(0px)",
            });

            this.kag.stat.chara_talk_focus = pm.talk_focus;
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[chara_new]

:group
キャラクター操作

:title
キャラクターの定義

:exp
登場するキャラクターの情報を定義します。

このタグでキャラクターを定義しておくことで、`[chara_show]`タグでそのキャラクターを表示したり、`[chara_mod]`タグでキャラクターの表情を変更したりできます。

このタグに指定した`name`パラメータは`[chara_show]`を始めとするキャラクター操作系のタグに使われます。他にも`[anim]`タグや`[kanim]`タグにキャラクターの`name`を指定することもできます。つまり、キャラクターを自由にアニメーションさせられます。

:sample
[chara_new name=yuko storage=yuko.png jname=ゆうこ]

:param
name    = キャラクターを管理するための名前を半角英数で指定します。この`name`は必ず<b>ユニーク</b>（一意、固有）である必要があります。すなわち、他のキャラクターと`name`が重複してはいけません。また`[ptext][image]`などのタグに指定する`name`とも重複してはいけません。,
storage = キャラクター画像を指定します。画像ファイルは`data/fgimage`フォルダに配置します。,
width   = 画像の横幅を指定できます。,
height  = 画像の高さを指定できます。,
reflect = 画像を左右反転するかどうか。`true`または`false`で指定します。`true`を指定すると、画像を左右反転して表示します。,
color   = キャラクターの名前を表示するときの色を指定できます。`0xRRGGBB`形式で指定します。,
jname   = このキャラクターをネームスペースに表示する場合、適用する名称を指定できます。例えば、#yuko と指定すると　メッセージエリアに　ゆうこ　と表示できます

:demo
1,kaisetsu/08_character

#[end]
*/

tyrano.plugin.kag.tag.chara_new = {
    vital: ["name", "storage"],

    pm: {
        name: "",
        storage: "",
        width: "",
        height: "",
        reflect: "false",
        jname: "",

        color: "",
        map_face: {},
        fuki: { enable: "false" },

        is_show: "false",
    },

    start: function (pm) {
        //イメージの追加

        var storage_url = "./data/fgimage/" + pm.storage;

        //HTTP対応
        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        }

        pm.map_face["default"] = pm.storage;

        this.kag.stat.charas[pm.name] = pm;

        //キャラクターの日本語名とnameを紐付けるための処置
        if (pm.jname != "") {
            this.kag.stat.jcharas[pm.jname] = pm.name;
        }

        this.kag.preload(storage_url, (img_obj) => {
            if (img_obj) {
                let img_width = $(img_obj).get(0).width;
                let img_height = $(img_obj).get(0).height;

                this.kag.stat.charas[pm.name]["origin_width"] = img_width;
                this.kag.stat.charas[pm.name]["origin_height"] = img_height;

                this.kag.stat.charas[pm.name]["fuki"]["left"] = Math.round(img_width / 2);
                this.kag.stat.charas[pm.name]["fuki"]["top"] = Math.round(img_height / 3);
            }

            this.kag.ftag.nextOrder();
        });
    },
};

/*
#[chara_show]

:group
キャラクター操作

:title
キャラクターの登場

:exp
定義しておいたキャラクターを画面に表示します。

:sample
[chara_show name="yuko" ]

:param
name    = [chara_new]で定義したname属性を指定します。,
time    = ミリ秒で指定します。指定した時間をかけて登場します。,
layer   = キャラクターを配置するレイヤを`0`以上の整数で指定します。,
zindex  = キャラクターの重なりを指定できます。ここで指定した値が大きいほうが前に表示できます。省略すると、後に登場するキャラクターが前に表示されます。",
depth   = zindexが同一な場合の重なりを`front`(最前面)、`back`(最後面) で指定できます。,
page    = foreかbackを指定します。,
wait    = trueを指定すると、キャラクターの登場完了を待ちます。,
face    = `[chara_face]`タグで定義したface属性を指定します。,
storage = 変更する画像ファイルを指定します。画像ファイルは`data/fgimage`フォルダに配置します。,
reflect = 画像を左右反転するかどうか。`true`または`false`で指定します。`true`を指定すると、画像を左右反転して表示します。,
width   = キャラクターの横幅を指定できます。,
height  = キャラクターの縦幅を指定できます。,
left    = キャラクターの横位置を指定できます。指定した場合、自動配置が有効であっても無効になります。,
top     = キャラクターの縦位置を指定できます。指定した場合、自動配置が有効であっても無効になります。

:demo
1,kaisetsu/08_character

#[end]
*/

tyrano.plugin.kag.tag.chara_show = {
    vital: ["name"],

    pm: {
        name: "",
        page: "fore",
        layer: "0", //レイヤーデフォルトは０に追加
        wait: "true", //アニメーションの終了を待ちます
        left: "", //chara_config でauto になっている場合は、自動的に決まります。指定されている場合はこちらを優先します。
        top: "",
        width: "",
        height: "",
        zindex: "1",
        depth: "front",
        reflect: "",
        face: "",
        storage: "",
        time: 1000,
    },

    start: function (pm) {
        const that = this;

        // このキャラの定義オブジェクト
        const cpm = this.kag.stat.charas[pm.name];

        // 未定義のキャラを表示しようとしているならばエラーとなる
        if (!cpm) {
            this.kag.error("undefined_character", pm);
            return;
        }

        // このキャラを表示する前にプリロードしておく必要がある画像をこの配列に突っ込んでおく
        const preload_images = [];

        //
        // すでにこのキャラが画面に存在していないかどうかを確認
        //

        // 存在している場合
        const existing_chara = that.kag.chara.getCharaContainer(pm.name);
        if (existing_chara.get(0)) {
            existing_chara.stop(true, true);
            // 存在しているし表示もされている場合（display: none; でない場合）は
            // もはや何も処理する必要はないので次のタグへ
            if (existing_chara.css("display") != "none") {
                that.kag.ftag.nextOrder();
                return;
            }
        }
        // 存在していない場合
        else {
            cpm.is_show = "false";
        }

        // ここに到達したということは
        // このキャラはまだ画面に存在していない、もしくは
        // 存在していても display: none; である

        // スキップ時にロードとの間で分身するやつ
        if (cpm.is_show == "true") {
            that.kag.ftag.nextOrder();
            return;
        }

        //
        // ベースとなる画像ソースを決定する
        //

        // デフォルトの画像ソースとして[chara_new]時のstorageを参照する
        let storage_url = $.parseStorage(cpm.storage, "fgimage");

        // [chara_show]に表情（face）が指定されている場合
        if (pm.face != "") {
            // 未定義のfaceを使用しようとしている場合はエラーを出してゲームを止める
            if (!cpm["map_face"][pm.face]) {
                this.kag.error("undefined_face", pm);
                return;
            }
            storage_url = $.parseStorage(cpm["map_face"][pm.face], "fgimage");
        }
        // [chara_show]にstorageが直接指定されている場合
        else if (pm.storage != "") {
            storage_url = $.parseStorage(pm.storage, "fgimage");
            // キャラ定義を書き換える
            cpm["storage"] = pm.storage;
        }

        // この画像ソースをプリロード対象に追加する
        preload_images.push(storage_url);

        //
        // 要素を作成する
        //

        // キャラのラッパーとなる<div>要素
        var j_chara_root = $("<div></div>");
        j_chara_root.css({
            position: "absolute",
            display: "none",
        });

        // ベースとなる<img>要素を作成してラッパーに追加
        var j_chara_base_img = $("<img />");
        j_chara_base_img.attr("src", storage_url);
        j_chara_base_img.addClass("chara_img");
        j_chara_root.append(j_chara_base_img);

        // width、height、zindexを反映させる
        if (pm.width != "") {
            cpm.width = parseInt(pm.width);
        }

        if (pm.height != "") {
            cpm.height = parseInt(pm.height);
        }

        if (cpm.width != "") {
            j_chara_root.css("width", cpm.width + "px");
        }

        if (cpm.height != "") {
            j_chara_root.css("height", cpm.height + "px");
        }

        if (pm.zindex != "") {
            j_chara_root.css("z-index", parseInt(pm.zindex));
        }

        //
        // キャラパーツの設定
        //

        // 各パーツについて
        const chara_layer = cpm["_layer"] || {};
        for (let key in chara_layer) {
            // このパーツの現在の状態を参照する
            const this_part_map = chara_layer[key];
            const current_part_id = this_part_map["current_part_id"];
            let current_part = this_part_map[current_part_id];

            // key: パーツの部位。mouth/eye/hairなど。
            // current_part_id: そのパーツの現在の状態。open/mid/closeなど。
            //   過去に[chara_part]で直接storageを指定した場合は"allow_storage"という文字列が入っている。

            // storageが直接指定されている場合の構造を調整
            if (current_part_id === "allow_storage") {
                current_part = {
                    storage: this_part_map["allow_storage"],
                    visible: "true",
                };
            }

            // このパーツ用の<img>要素
            const j_img = $("<img />");

            // このパーツの画像ソース
            let part_storage;

            // このパーツの画像ソースがnoneの場合は<img>要素だけ作っておく
            // (透明なシステム画像を使用する)
            if (current_part["storage"] === "none") {
                part_storage = "./tyrano/images/system/transparent.png";
            }
            // noneでない場合は画像ソースをパースしたあとプリロード対象に追加する
            else {
                part_storage = $.parseStorage(current_part["storage"], "fgimage");
                preload_images.push(part_storage);
            }

            // 画像ソースの設定ほか
            j_img.attr("src", part_storage);
            j_img.css({
                "position": "absolute",
                "left": 0,
                "top": 0,
                "width": "100%",
                "height": "100%",
                "z-index": this_part_map.zindex,
            });
            j_img.addClass("part");
            j_img.addClass(key); // eye/mouth/hairなど

            // ラッパーに追加
            j_chara_root.append(j_img);

            this.kag.chara.setFrameAnimation(cpm, key, current_part_id, j_img, preload_images);
        }

        // 左右反転
        if (pm.reflect != "") {
            if (pm.reflect == "true") {
                cpm.reflect = "true";
            } else {
                cpm.reflect = "false";
            }
        }

        // mix-blend-mode: plus-lighter; を使う場合は
        // 各パーツをさらに<div>でラップする
        that.kag.chara.setPartContainer(j_chara_root);

        // キャラの表示状態と表示レイヤーを記憶しておく
        cpm.is_show = "true";
        cpm.layer = pm.layer;

        // これ以降の処理はすべて画像のプリロードが完了してから同期的に行う
        this.kag.preloadAll(preload_images, () => {
            // 1回ゲーム止める
            that.kag.weaklyStop();

            // レイヤーを取得
            const target_layer = that.kag.layer.getLayer(pm.layer, pm.page);

            // キャラのラッパーをレイヤーに挿入する
            // depth属性がbackならレイヤーのDOMツリーの最初に挿入する
            // back、つまり最背面に表示されるようになる
            // back指定がないならDOMツリーの最後挿入する、すなわち最前面に表示される
            if (pm.depth == "back") {
                target_layer.prepend(j_chara_root).show();
            } else {
                target_layer.append(j_chara_root).show();
            }

            // 現在アニメーション処理中のキャラを数える（今後増減していく）
            let animating_chara_count = 1;

            // キャラの表示/移動アニメーションが完了したときのハンドラ
            const on_animation_complete = () => {
                animating_chara_count--;
                if (animating_chara_count == 0) {
                    that.kag.cancelWeakStop();
                    if (pm.wait == "true") {
                        that.kag.ftag.nextOrder();
                    }
                }
            };

            // 立ち位置を自動で設定すべきかどうか
            const is_auto_position = that.kag.stat.chara_pos_mode == "true" && pm.left === "";

            // 自動で設定しないならCSSのtop/leftを指定するだけ
            if (!is_auto_position) {
                j_chara_root.css("top", pm.top + "px");
                j_chara_root.css("left", pm.left + "px");
            }
            // 立ち位置を自動調整する場合
            else {
                if (pm.top !== "") {
                    j_chara_root.css("top", parseInt(pm.top));
                } else {
                    j_chara_root.css("bottom", 0);
                }

                // 既存のキャラの数
                const existing_chara = target_layer.find(".tyrano_chara");
                const existing_chara_count = existing_chara.length;

                // ゲーム画面の横幅、高さ
                const sc_width = parseInt(that.kag.config.scWidth);
                const sc_height = parseInt(that.kag.config.scHeight);

                // このキャラの横幅の半分
                const half_width = Math.floor(parseInt(j_chara_root.css("width")) / 2);

                // 既存のキャラが0人の場合、つまり画面上に初めてキャラを表示する場合、
                // このキャラは画面中央に表示すればよい
                // つまり画面中央（画面幅÷2）からキャラの横幅の半分だけ左に戻した位置
                // ─────┬─────
                // □□□□□■□□□□□
                // □□□□■■■□□□□
                // □□□□■■■□□□□
                //
                // 既存のキャラが1人の場合、画面幅÷3がキャラの間隔となる
                // ───┬───┬───
                // □□□■□□□■□□□
                // □□■■■□■■■□□
                // □□■■■□■■■□□
                //
                // 以降同様に、画面幅を既存のキャラ数+2で割った値がキャラの間隔となる
                const chara_space = Math.floor(sc_width / (existing_chara_count + 2));
                let current_left = chara_space;

                // このキャラの横位置を決定
                j_chara_root.css("left", chara_space - half_width + "px");

                // 既存のキャラの横移動アニメーション処理
                const existing_chara_arr = existing_chara.get().reverse();
                const pos_change_time = parseInt(that.kag.cutTimeWithSkip(that.kag.stat.pos_change_time));
                $(existing_chara_arr).each(function () {
                    const j_chara = $(this);
                    // アニメーション中キャラ数カウンタを増加
                    animating_chara_count++;
                    // 現在の横位置を1人分スライドさせる
                    current_left += chara_space;
                    // ここからキャラの横幅の半分だけ引いた値がleftプロパティにセットすべき値である
                    const half_width = Math.floor(parseInt(j_chara.css("width")) / 2);
                    const left = current_left - half_width;

                    // [chara_config anim=false]が指定されている場合
                    // 既存のキャラをいったんフェードアウトさせてから調整後の位置でフェードインする処理
                    if (that.kag.stat.chara_anim == "false") {
                        j_chara.stop(true, true).fadeTo(parseInt(that.kag.cutTimeWithSkip(pm.time)), 0, () => {
                            j_chara.css("left", left);
                            j_chara.stop(true, true).fadeTo(pos_change_time, 1, on_animation_complete);
                        });
                    }
                    // 通常は横移動アニメーションを行う
                    else {
                        j_chara.stop(true, true).animate(
                            {
                                left: left,
                            },
                            pos_change_time,
                            that.kag.stat.chara_effect,
                            on_animation_complete,
                        );
                    }
                });
            }

            // キャラのラッパーにクラス名を付与
            // tyrano_charaとキャラID
            j_chara_root.addClass("tyrano_chara");
            $.setName(j_chara_root, cpm.name);

            // width/heightをベース画像に設定する
            if (cpm.width != "") {
                j_chara_base_img.css("width", cpm.width + "px");
            }
            if (cpm.height != "") {
                j_chara_base_img.css("height", cpm.height + "px");
            }

            // 左右反転が有効の場合はreflectクラスを付与
            if (cpm.reflect == "true") {
                j_chara_root.addClass("reflect");
            } else {
                j_chara_root.removeClass("reflect");
            }

            // アニメーション表示
            j_chara_root.stop(true, true).fadeIn({
                duration: parseInt(that.kag.cutTimeWithSkip(pm.time)),
                easing: that.kag.stat.chara_effect,
                complete: on_animation_complete,
            });

            // アニメーションの完了を待たない場合は次のタグへ
            if (pm.wait !== "true") {
                that.kag.ftag.nextOrder();
            }

            // ベース画像のwidth/heightをラッパーおよび各パーツにも設定する
            // ※読み込みが終わってから
            setTimeout(function () {
                const width = j_chara_base_img.css("width");
                const height = j_chara_base_img.css("height");
                j_chara_root.css("width", width);
                j_chara_root.css("height", height);
                j_chara_root.find(".part").css("width", width);
                j_chara_root.find(".part").css("height", height);
            }, 1);
        });
        //end preload
    },
};

/*
#[chara_hide]

:group
キャラクター操作

:title
キャラクターの退場

:exp
`[chara_show]`タグで表示したキャラクターを退場させます。

:sample
[chara_hide name="yuko"]

:param
name     = `[chara_new]`で定義した`name`属性を指定します。,
time     = フェードアウト時間をミリ秒で指定します。,
wait     = フェードアウトの完了を待つかどうか。`true`または`false`で指定します。,
layer    = 削除対象のレイヤ。`[chara_show]`でにレイヤ指定した場合はここでも指定します。,
pos_mode = キャラクターの立ち位置自動調整が有効な場合に、このパラメータに`false`を指定すると退場後に立ち位置の調整を行いません。

:demo
1,kaisetsu/08_character

#[end]
*/

tyrano.plugin.kag.tag.chara_hide = {
    vital: ["name"],

    pm: {
        page: "fore",
        layer: "0", //レイヤーデフォルトは０に追加
        name: "",
        wait: "true",
        pos_mode: "true",
        time: "1000",
    },

    start: function (pm) {
        var that = this;

        var target_layer = this.kag.layer.getLayer(pm.layer, pm.page);

        var img_obj = this.kag.chara.getCharaContainer(pm.name, target_layer);

        var cpm = this.kag.stat.charas[pm.name];
        cpm.is_show = "false";

        //画面上に存在しないなら無視する。
        img_obj.stop(true, true);
        if (!img_obj.get(0)) {
            img_obj.stop(true, true);

            if (img_obj.css("display") == "none") {
                that.kag.ftag.nextOrder();
                return;
            }
        }

        //キャラがいない場合、次へ
        if (!img_obj.get(0)) {
            that.kag.ftag.nextOrder();
            return;
        }

        var chara_num = 0;
        that.kag.weaklyStop();

        //アニメーションでj表示させます
        img_obj.stop(true, true).animate(
            {
                opacity: "hide",
            },
            {
                duration: parseInt(that.kag.cutTimeWithSkip(pm.time)),
                easing: "linear",
                complete: function () {
                    that.kag.chara.stopFrameAnimation(cpm);
                    img_obj.remove();

                    if (that.kag.stat.chara_pos_mode == "true" && pm.pos_mode == "true") {
                        //既存キャラの位置を調整する
                        var j_all_chara = that.kag.chara.getCharaContainer();
                        var chara_cnt = j_all_chara.length;
                        var sc_width = parseInt(that.kag.config.scWidth);
                        var sc_height = parseInt(that.kag.config.scHeight);

                        //一つあたりの位置決定
                        var base = Math.floor(sc_width / (chara_cnt + 1));
                        var tmp_base = 0;

                        if (chara_cnt == 0) {
                            that.kag.cancelWeakStop();
                            if (pm.wait == "true") {
                                that.kag.ftag.nextOrder();
                            }

                            return;
                        }

                        var array_tyrano_chara = j_all_chara.get().reverse();
                        $(array_tyrano_chara).each(function () {
                            chara_num++;

                            tmp_base += base;

                            var j_chara = $(this);
                            //この分をプラスする感じですね
                            var center = Math.floor(parseInt(j_chara.css("width")) / 2);
                            //1つ目は主人公にゆずる
                            var left = tmp_base - center;

                            if (that.kag.stat.chara_anim == "false") {
                                j_chara.stop(true, true).fadeTo(parseInt(that.kag.cutTimeWithSkip(pm.time)), 0, function () {
                                    j_chara.css("left", left);

                                    j_chara
                                        .stop(true, true)
                                        .fadeTo(parseInt(that.kag.cutTimeWithSkip(that.kag.stat.pos_change_time)), 1, function () {
                                            chara_num--;
                                            if (chara_num == 0) {
                                                that.kag.cancelWeakStop();
                                                if (pm.wait == "true") {
                                                    that.kag.ftag.nextOrder();
                                                }
                                            }
                                        });
                                });
                            } else {
                                j_chara.stop(true, true).animate(
                                    {
                                        left: left,
                                    },
                                    parseInt(that.kag.cutTimeWithSkip(that.kag.stat.pos_change_time)),
                                    that.kag.stat.chara_effect,
                                    function () {
                                        chara_num--;
                                        if (chara_num == 0) {
                                            that.kag.cancelWeakStop();
                                            if (pm.wait == "true") {
                                                that.kag.ftag.nextOrder();
                                            }
                                        }
                                    },
                                );
                            } // end else
                        });

                        //that.kag.ftag.nextOrder();
                    } else {
                        //実行待の時だけ実施する
                        if (pm.wait == "true") {
                            that.kag.cancelWeakStop();
                            that.kag.ftag.nextOrder();
                        }
                    }
                }, //end complerte
            },
        );
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
    },
};

/*
#[chara_hide_all]

:group
キャラクター操作

:title
キャラクターを全員退場

:exp
`[chara_show]`タグで表示したキャラクターを全員退場させます。

:sample
[chara_hide_all time=1000 wait=true]

:param
time  = フェードアウト時間をミリ秒で指定します。,
wait  = フェードアウトの完了を待つかどうか。`true`または`false`で指定します。,
layer = 削除対象のレイヤ。`[chara_show]`でにレイヤ指定した場合はここでも指定します。

#[end]
*/

tyrano.plugin.kag.tag.chara_hide_all = {
    vital: [],

    pm: {
        page: "fore",
        layer: "0", //レイヤーデフォルトは０に追加
        wait: "true",
        time: "1000",
    },

    start: function (pm) {
        var that = this;

        var target_layer = this.kag.layer.getLayer(pm.layer, pm.page);
        var img_obj = this.kag.chara.getCharaContainer(undefined, target_layer);

        var chara_num = 0;
        that.kag.weaklyStop();
        var flag_complete = false;
        //アニメーションでj表示させます

        //すべてのキャラを非表示状態にする
        var charas = this.kag.stat.charas;
        for (let key in charas) {
            if (charas[key].layer === undefined) {
                charas[key].is_show = "false";
            } else if (charas[key].layer === pm.layer) {
                charas[key].is_show = "false";
            }
        }

        //キャラがいない場合、次へ
        if (!img_obj.get(0)) {
            that.kag.ftag.nextOrder();
            return;
        }

        img_obj.stop(true, true).animate(
            {
                opacity: "hide",
            },
            {
                duration: parseInt(that.kag.cutTimeWithSkip(pm.time)),
                easing: "linear",
                complete: function () {
                    img_obj.remove();
                    if (pm.wait == "true") {
                        if (flag_complete == false) {
                            flag_complete = true;
                            that.kag.cancelWeakStop();
                            that.kag.ftag.nextOrder();
                        }
                    }
                },
            },
        );

        //キャラクターの表情を引き継がない
        if (this.kag.stat.chara_memory == "false") {
            for (let key in this.kag.stat.charas) {
                this.kag.stat.charas[key].storage = this.kag.stat.charas[key]["map_face"]["default"];
            }
        }

        //すぐに次の命令を実行
        if (pm.wait != "true") {
            this.kag.cancelWeakStop();
            this.kag.ftag.nextOrder();
        }

        //this.kag.ftag.nextOrder();
    },
};

/*
#[chara_delete]

:group
キャラクター操作

:title
キャラクター情報の削除

:exp
キャラクターの定義情報を削除します。

キャラクターの立ち絵を画面から退場させたい場合はこのタグではなく`[chara_hide]`を使用してください。

:sample
[chara_delete="yuko" ]

:param
name = [chara_new]で定義したname属性を指定します。

#[end]
*/

tyrano.plugin.kag.tag.chara_delete = {
    vital: ["name"],

    pm: {
        name: "",
    },

    start: function (pm) {
        delete this.kag.stat.charas[pm.name];

        this.kag.ftag.nextOrder();
    },
};

/*
#[chara_mod]

:group
キャラクター操作

:title
キャラクター画像変更

:exp
キャラクター画像を変更します。表情変更に活用できます。

:sample
[chara_mod name="yuko" storage="newface.png"]

:param
name    = `[chara_new]`で定義した`name`を指定します。,
face    = `[chara_face]`で定義した`face`を指定します。,
time    = `[chara_mod]`タグで表情を変える際のクロスフェード時間をミリ秒で指定します。`0`を指定すると瞬間的に切り替わります。,
storage = 変更する画像ファイルを指定します。画像ファイルは`data/fgimage`フォルダに配置します。,
reflect = 画像を左右反転するかどうか。`true`または`false`で指定します。`true`を指定すると、画像を左右反転して表示します。,
wait    = 表情変更のクロスフェードが終わるのを待つかどうか。`true`または`false`で指定します。,
cross   = <p>クロスフェードの方式を`true`または`false`を指定します。`true`を指定すると、旧画像がフェードアウトさせるのと同時に新画像をフェードインさせます。`false`を指定すると、旧画像を残したままその上に新画像をフェードインさせます。</p><p>`true`の場合、クロスフェードの瞬間にキャラクターが若干透けて背景が見えてしまうことがあります。そのような場合は`false`を指定することでキャラクターを透けさせずに表情変更ができます。ただし透けなくはなりますが、シルエットが変わるような表情変更の場合は違和感が出ることがあります。</p>

:demo
1,kaisetsu/08_character

#[end]
*/

tyrano.plugin.kag.tag.chara_mod = {
    vital: ["name"],

    pm: {
        name: "",
        face: "",
        reflect: "",
        storage: "",
        time: "",
        cross: "true",
        wait: "true",
        next: "true",
    },

    start: function (pm) {
        var that = this;
        that.kag.weaklyStop();

        var storage_url = "";
        var folder = "./data/fgimage/";
        const is_wait = pm.wait !== "false";
        const is_cross = pm.cross !== "false";

        if (pm.face != "") {
            if (!this.kag.stat.charas[pm.name]) {
                this.kag.error("undefined_character", pm);
                return;
            }
            if (!this.kag.stat.charas[pm.name]["map_face"][pm.face]) {
                this.kag.error("undefined_face", pm);
                return;
            }
            storage_url = this.kag.stat.charas[pm.name]["map_face"][pm.face];
            //表情画像がhttpで指定されている場合はこの後で付け加えられるfolderを空にしておく
            if ($.isHTTP(storage_url)) {
                folder = "";
            }
        } else {
            if ($.isHTTP(pm.storage)) {
                folder = "";
                storage_url = pm.storage;
            } else {
                storage_url = pm.storage;
            }
        }

        var j_chara = this.kag.chara.getCharaContainer(pm.name);
        var j_img = j_chara.find(".chara_img");
        if (j_chara.length == 0) {
            this.kag.stat.charas[pm.name]["storage"] = storage_url;
            this.kag.stat.charas[pm.name]["reflect"] = pm.reflect;
            this.kag.cancelWeakStop();
            if (pm.next !== "false") {
                this.kag.ftag.nextOrder();
            }
            return;
        }

        var chara_time = this.kag.stat.chara_time;
        if (pm.time != "") {
            chara_time = pm.time;
        }

        //変更する際の画像が同じ場合は、即時表示
        if (j_img.attr("src") == folder + storage_url) {
            chara_time = "0";
        }

        if (pm.reflect != "") {
            if (pm.reflect == "true") {
                j_chara.addClass("reflect");
            } else {
                j_chara.removeClass("reflect");
            }
            this.kag.stat.charas[pm.name]["reflect"] = pm.reflect;
        }

        //storageが指定されていない場合は終わり
        if (storage_url == "") {
            that.kag.cancelWeakStop();
            if (pm.next !== "false") {
                this.kag.ftag.nextOrder();
            }
            return;
        }

        this.kag.preload(folder + storage_url, function () {
            // wait=falseで表情を変更している最中に重ねて表情変更が実行された場合の対策
            // アニメーション中の表情が残っている場合はそれを削除する
            const j_old_face = $(".chara-mod-animation_" + pm.name);
            if (j_old_face.length) {
                j_old_face.remove();
            }

            if (chara_time != "0") {
                //アニメーションの停止
                j_img.stop(true, true);

                var j_new_img = j_img.clone();

                j_new_img.attr("src", folder + storage_url);
                j_new_img.css("opacity", 0);

                j_img.addClass("chara-mod-animation chara-mod-animation_" + pm.name);
                j_img.after(j_new_img);

                if (is_cross) {
                    j_img.stop(true, true).fadeTo(parseInt(that.kag.cutTimeWithSkip(chara_time)), 0, function () {
                        //alert("完了");
                    });
                }

                j_new_img.stop(true, true).fadeTo(parseInt(that.kag.cutTimeWithSkip(chara_time)), 1, function () {
                    if (!is_cross) {
                        j_img.stop(true, true).fadeTo(parseInt(that.kag.cutTimeWithSkip(chara_time)), 0, function () {
                            j_img.remove();

                            if (is_wait) {
                                that.kag.cancelWeakStop();
                                if (pm.next !== "false") {
                                    that.kag.ftag.nextOrder();
                                }
                            }
                        });
                    } else {
                        j_img.remove();

                        if (is_wait) {
                            that.kag.cancelWeakStop();
                            if (pm.next !== "false") {
                                that.kag.ftag.nextOrder();
                            }
                        }
                    }
                });
            } else {
                //アニメーションの停止
                j_img.stop(true, true);

                j_img.attr("src", folder + storage_url);

                if (is_wait) {
                    that.kag.cancelWeakStop();
                    if (pm.next !== "false") {
                        that.kag.ftag.nextOrder();
                    }
                }
            }

            //showする前でも、表情が適応されるようにする
            that.kag.stat.charas[pm.name]["storage"] = storage_url;

            if (!is_wait) {
                that.kag.cancelWeakStop();
                if (pm.next !== "false") {
                    that.kag.ftag.nextOrder();
                }
            }
        });
    },
};

/*
#[chara_move]

:group
キャラクター操作

:title
キャラクターの位置変更

:exp
キャラクターの立ち位置や大きさを変更します。指定時間をかけてアニメ―ションさせることもできます。

:sample
[chara_move name="yuko" time=100 left=20 top=100 ]

:param
name   = `[chara_new]`で定義した`name`を指定します。,
left   = 変更後の横位置を指定できます。`left="+=200"``left="-=200"`のように指定すると、「いまの場所からどれだけ動くか」という相対指定ができます。,
top    = 変更後の縦位置を指定できます。`top="+=100"``top="-=100"`のように指定すると、「いまの場所からどれだけ動くか」という相対指定ができます。,
width  = 変更後の横幅を指定できます。,
height = 変更後の高さを指定できます。,
anim   = アニメーションさせるかどうか。`true`か`false`で指定します。`true`を指定すると、位置を変更するときにアニメーションさせることができます。この場合、アニメーション効果は`[chara_config]`の`effect`パラメータを参照します。,
time   = アニメーション時間をミリ秒で指定します。,
wait   = アニメーションの完了を待つかどうか。`true`か`false`で指定します。,
effect = 変化のエフェクトを指定します。以下のキーワードが指定できます。
`jswing``def``easeInQuad``easeOutQuad``easeInOutQuad``easeInCubic``easeOutCubic``easeInOutCubic``easeInQuart``easeOutQuart``easeInOutQuart``easeInQuint``easeOutQuint``easeInOutQuint``easeInSine``easeOutSine``easeInOutSine``easeInExpo``easeOutExpo``easeInOutExpo``easeInCirc``easeOutCirc``easeInOutCirc``easeInElastic``easeOutElastic``easeInOutElastic``easeInBack``easeOutBack``easeInOutBack``easeInBounce``easeOutBounce``easeInOutBounce`

#[end]
*/

tyrano.plugin.kag.tag.chara_move = {
    vital: ["name"],

    pm: {
        name: "",
        time: "600",
        anim: "false",
        left: "",
        top: "",
        width: "",
        height: "",
        effect: "",
        wait: "true",
    },

    start: function (pm) {
        var that = this;

        var target_obj = this.kag.chara.getCharaContainer(pm.name);
        var target_img = target_obj.find("img");

        //存在しない場合は、即移動
        if (!target_obj.get(0)) {
            that.kag.ftag.nextOrder();
            return;
        }

        var anim_style = {};
        var img_anim_style = {};

        if (pm.left != "") {
            anim_style.left = pm.left + "px";
        }
        if (pm.top != "") {
            anim_style.top = pm.top + "px";
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
            if (pm.anim == "true") {
                target_obj.stop(true, true).animate(anim_style, parseInt(pm.time), pm.effect, function () {
                    if (pm.wait == "true") {
                        that.kag.ftag.nextOrder();
                    }
                });

                target_img.stop(true, true).animate(img_anim_style, parseInt(pm.time), pm.effect, function () {});
            } else {
                target_obj.stop(true, true).fadeTo(parseInt(that.kag.cutTimeWithSkip(pm.time)) / 2, 0, function () {
                    target_obj.css(anim_style);
                    target_img.css(img_anim_style);

                    target_obj.stop(true, true).fadeTo(parseInt(that.kag.cutTimeWithSkip(pm.time)) / 2, 1, function () {
                        if (pm.wait == "true") {
                            that.kag.ftag.nextOrder();
                        }
                    });
                });
            }
        }

        if (pm.wait == "false") {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[chara_face]

:group
キャラクター操作

:title
キャラクター表情登録

:exp
キャラクターの表情画像を登録できます。

:sample

;表情の登録
[chara_face name="yuko" face="angry" storage="newface.png"]

;表情の適用
[chara_mod name="yuko" face="angry"]

;発言者の名前も同時にかえたい場合
[chara_ptext name="yuko" face="angry"]

;短縮して書けます。以下も同じ意味
#yuko:angry

;chara_new で登録した画像はdefaultという名前で指定可能
#yuko:default

:param
name    = 表情を登録するキャラクターの名前。`[chara_new]`で定義した`name`属性を指定します。,
face    = 登録する表情の名前を指定します。`happy``angry`など、自分がわかりやすいものを自由につけましょう。,
storage = 画像ファイルを指定します。画像ファイルは`data/fgimage`フォルダに配置します。

#[end]
*/

tyrano.plugin.kag.tag.chara_face = {
    vital: ["name", "face", "storage"],

    pm: {
        name: "",
        face: "",
        storage: "",
    },

    start: function (pm) {
        var storage_url = "";

        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        } else {
            storage_url = pm.storage;
        }

        const chara = this.kag.stat.charas[pm.name];

        if (!chara) {
            this.kag.error("undefined_character", pm);
            this.kag.ftag.nextOrder();
            return;
        }

        chara["map_face"][pm.face] = storage_url;
        this.kag.ftag.nextOrder();
    },
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
name    = パーツを登録するキャラクターの名前。`[chara_new]`で定義した`name`属性を指定します。,
part    = パーツとして登録する名前を指定します。例えば`目`というパーツを`part`を登録しておき、この`part`の中で他の差分をいくつでも登録できます。,
id      = パーツの中の差分を識別するための名前を指定します。例えば`目`という`part`の中で`笑顔の目``泣いてる目`のように`id`を分けて登録できます。,
storage = 差分として登録する画像を指定します。画像は`data/fgimage`フォルダの中に配置します。`none`を指定すると、デフォルトでそのパーツがない状態を表現できます。,
zindex  = このパーツが他のパーツと重なった時にどちらが前面に表示されるかを決定するための優先度を数字で指定します。数字が大きいほど前面に表示されます。一度登録しておけば、同パーツの他の差分にも適用されます。

#[end]
*/

tyrano.plugin.kag.tag.chara_layer = {
    vital: ["name", "part", "id"],

    pm: {
        name: "",
        part: "",
        id: "",
        storage: "",
        zindex: "",
    },

    start: function (pm) {
        // キャラ定義を取得
        const cpm = this.kag.stat.charas[pm.name];

        // キャラが未定義ならエラーとなる
        if (!cpm) {
            this.kag.error("undefined_character", pm);
            return;
        }

        // キャラ定義オブジェクトにレイヤー領域（_layer）を作成する
        if (!cpm["_layer"]) {
            cpm["_layer"] = {};
        }

        // パーツ登録が初めてかどうか（パーツ領域が作成済みかどうか）
        var is_first_part = !cpm["_layer"][pm.part];

        // 初めてならパーツ領域を新規作成する
        if (is_first_part) {
            cpm["_layer"][pm.part] = {
                default_part_id: pm.id,
                current_part_id: pm.id,
                zindex: pm.zindex,
            };
        }

        // 改めてパーツ領域を参照（口、目などのレベル）
        const part_obj = cpm["_layer"][pm.part];

        // パーツ差分領域が未作成なら新規作成する（通常目、泣き目、笑い目などのレベル）
        if (!part_obj[pm.id]) {
            part_obj[pm.id] = {
                storage: "",
                zindex: "",
                visible: is_first_part ? "true" : "false",
                frame_image: "",
                frame_time: "",
                frame_direction: "",
                frame_loop: "true",
                lip_image: "",
                lip_time: 50,
                lip_type: "text",
                lip_volume: "",
                lip_se_buf: "",
                lip_se_buf_all: "",
            };
        } else {
            for (const key in part_obj[pm.id]) {
                if (!pm[key]) {
                    pm[key] = part_obj[pm.id][key];
                }
                if (part_obj["current_part_id"] === pm.id) {
                    if (pm.lip_type) {
                        cpm.lipsync_type = pm.lip_type;
                    }
                }
            }
        }

        // リップシンク画像が設定されている場合
        if (pm.lip_image) {
            // 内部的にはpm.frame_imageに変換してしまおう
            pm.frame_image = pm.lip_image;

            // pm.frame_imageが配列型でないなら","で区切って配列化する
            if (!Array.isArray(pm.frame_image)) {
                pm.frame_image = pm.frame_image.split(",");
            }

            // トリミングする
            pm.frame_image = pm.frame_image.map((item) => {
                return item.trim();
            });

            // 各リップフレームの閾値設定が未指定ならとりあえず空の配列を
            if (!pm.lip_volume) {
                pm.lip_volume = [];
            }
            // 指定されているが配列型でないのならば","で区切って配列化する
            else if (!Array.isArray(pm.lip_volume)) {
                pm.lip_volume = pm.lip_volume.split(",");
            }

            // これでpm.lip_volumeが配列型であることが保証された
            // 中身を数値にしていく
            pm.lip_volume = pm.lip_volume.map((item) => {
                return parseInt(item);
            });

            let prev_value;
            // 各フレームの時間設定の不足があれば補う（デフォルト：40ミリ秒）
            for (let i = 0; i < pm.frame_image.length; i++) {
                if (!pm.lip_volume[i]) {
                    if (!prev_value) {
                        pm.lip_volume[i] = 1;
                    } else {
                        pm.lip_volume[i] = prev_value + 4;
                    }
                }
                prev_value = pm.lip_volume[i];
            }
        }

        // フレームアニメーション画像が指定されている場合
        else if (pm.frame_image) {
            // pm.frame_imageが配列型でないなら","で区切って配列化する
            if (!Array.isArray(pm.frame_image)) {
                pm.frame_image = pm.frame_image.split(",");
            }

            // トリミングする
            pm.frame_image = pm.frame_image.map((item) => {
                return item.trim();
            });

            // 各フレームの時間設定が未指定ならとりあえず空の配列を
            if (!pm.frame_time) {
                pm.frame_time = [];
            }
            // 指定されているが配列型でないのならば","で区切って配列化する
            else if (!Array.isArray(pm.frame_time)) {
                pm.frame_time = pm.frame_time.split(",");
            }

            // これでpm.frame_timeが配列型になった
            // 中身を数値にしていく
            pm.frame_time = pm.frame_time.map((item) => {
                if (typeof item === "string") {
                    if (item.includes("-")) {
                        const hash = item.split("-");
                        return [parseInt(hash[0]), parseInt(hash[1])];
                    } else {
                        return parseInt(item);
                    }
                } else {
                    return item;
                }
            });

            // 各フレームの時間設定の不足があれば補う（デフォルト：40ミリ秒）
            let prev_val = null;
            pm.frame_image.forEach((src, i) => {
                if (!pm.frame_time[i]) {
                    if (prev_val) {
                        pm.frame_time[i] = prev_val;
                    } else {
                        if (i === 0) {
                            pm.frame_time[i] = [4000, 8000];
                        } else {
                            pm.frame_time[i] = 40;
                        }
                    }
                } else {
                    prev_val = pm.frame_time[i];
                }
            });
        }

        // 口パクの対象に取る[playse]のスロット
        if (pm.lip_se_buf) {
            pm.lip_se_buf = parseInt(pm.lip_se_buf);
            if (!cpm.lipsync_bufs) {
                cpm.lipsync_bufs = [];
            }
            cpm.lipsync_bufs.push(pm.lip_se_buf);
        }
        if (pm.lip_se_buf_all) {
            pm.lip_se_buf_all = parseInt(pm.lip_se_buf_all);
            this.kag.stat.lipsync_buf_chara[pm.lip_se_buf_all] = pm.name;
        }

        // パーツ差分領域にpmの内容を上書きする
        $.extendParam(pm, part_obj[pm.id]);

        // いま表示されているキャラクターのパーツの設定を変更した場合
        // [chara_part]を呼んで強制的にパーツを更新する
        if (cpm.is_show === "true" && cpm._layer[pm.part].current_part_id === pm.id) {
            this.kag.ftag.startTag("chara_part", {
                name: pm.name,
                [pm.part]: pm.id,
                force: "true",
            });
            return;
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[chara_layer_mod]

:group
キャラクター操作

:title
キャラクターの差分の定義を変更

:exp
`[chara_layer]`タグで定義した設定を変更できます。

:sample
[chara_layer_mod name="yuko" part=mouse zindex=20 ]

:param
name   = パーツ定義の変更対象となるキャラクターの名前。`[chara_new]`で定義した`name`属性を指定します。,
part   = 変更したいパーツ名を指定します。,
zindex = このパーツが他のパーツと重なった時にどちらが前面に表示されるかを決定するための優先度を数字で指定します。数字が大きいほど前面に表示されます。この設定は即時反映されません。次回表示時に反映されます。

#[end]
*/

tyrano.plugin.kag.tag.chara_layer_mod = {
    vital: ["name", "part"],

    pm: {
        name: "",
        part: "",
        zindex: "",
    },

    start: function (pm) {
        var that = this;

        var cpm = this.kag.stat.charas[pm.name];

        if (cpm == null) {
            this.kag.error("undefined_character", pm);
            return;
        }

        //レイヤが登録されているかどうか
        if (!cpm["_layer"]) {
            this.kag.error("undefined_character_parts", pm);
            return;
        }

        if (cpm["_layer"][pm.part]) {
            cpm["_layer"][pm.part]["zindex"] = pm.zindex;
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[chara_part]

:group
キャラクター操作

:title
キャラクターの差分パーツ変更

:exp
`[chara_layer]`タグで定義したパーツ差分の実際の表示を切り替えます。

このタグのパラメータの指定の方法は特殊です。`[chara_layer]`タグで定義した`part`と`id`の組み合わせをパラメータとして自由に指定できます。

`[chara_part name=yuko eye=happy]`

同時に複数の`part`を変更することも可能です。
`id`登録をせずに差分画像ファイルを直接指定することもできます。この場合、`allow_storage=true`を指定してください。
特定部位の`zindex`を変更して出力するために、`part名+_zindex`という名前のパラメータに数値を指定できます。

`[chara_part name=yuko eye=happy eye_zindex=10]`

:sample
[chara_part name=yuko mouse=happy eye=happy]

:param
name          = `[chara_new]`で指定したキャラクター名を指定します。,
time          = パーツが表示されるまでのフェードイン時間を指定できます。ミリ秒で指定します。,
wait          = フェードインの完了を待つかどうか。`true`または`false`で指定します。,
allow_storage = `true`または`false`。`true`を指定すると、`part`の指定に`id`ではなく直接画像ファイルを指定できます。画像は`fgimage`フォルダに配置してください。

#[end]
*/

tyrano.plugin.kag.tag.chara_part = {
    vital: ["name"],

    pm: {
        name: "",
        allow_storage: "false",
        time: "",
        wait: "true",
        force: "false",
    },

    start: function (pm) {
        // キャラ定義（取得できなければエラー）
        const cpm = this.kag.stat.charas[pm.name];
        if (!cpm) {
            this.kag.error("undefined_character", pm);
            return;
        }

        // パーツ定義（取得できなければエラー）
        const part_map = cpm["_layer"];
        if (!part_map) {
            this.kag.error("undefined_character_parts", pm);
            return;
        }

        //
        // 切替先のパーツ状態定義のマップを取得する
        //

        // 切替対象のパーツ状態定義を格納するマップ
        const target_map = {};

        // 切替前のパーツ状態IDを格納しておくマップ
        const prev_map = {};

        // プリロード対象の画像ソースを格納する配列
        let preload_srcs = [];

        // タグに指定されたすべての属性（＝パーツ名）について走査する
        for (const part_id in pm) {
            // 存在しないパーツは無視
            if (!part_map[part_id]) {
                continue;
            }

            // 属性に指定されている値をパーツの状態IDとして解釈する
            const state_id = pm[part_id];

            // この状態IDがパーツ定義に存在する場合
            if (part_map[part_id][state_id]) {
                // この状態IDが現在のパーツの状態IDとは異なる場合に限り切替作業を行う
                // ただしforce=trueが指定されている場合は同じパーツ状態IDでも強制的に切替作業を行う
                if (part_map[part_id]["current_part_id"] !== state_id || pm.force === "true") {
                    // 状態定義を取得
                    const state_obj = part_map[part_id][state_id];
                    state_obj.id = state_id;

                    // プリロード対象に追加
                    if (state_obj["storage"] !== "none") {
                        const src = $.parseStorage(state_obj["storage"], "fgimage");
                        preload_srcs.push(src);
                        const frame_srcs = this.kag.chara.getFrameAnimationSrcs(cpm, part_id, state_id);
                        if (frame_srcs.length) {
                            preload_srcs = preload_srcs.concat(frame_srcs);
                        }
                    }

                    // 現在のパーツ状態を書き換える
                    prev_map[part_id] = part_map[part_id]["current_part_id"];
                    part_map[part_id]["current_part_id"] = state_id;

                    // 切替対象マップに追加
                    target_map[part_id] = state_obj;
                }
            }
            // この状態IDはパーツ定義に存在しないがstorage直接指定が有効の場合
            else if (pm.allow_storage === "true") {
                // stage_idはstorageが直接指定されているものとする
                // プリロード対象にstate_idを追加
                preload_srcs.push($.parseStorage(state_id, "fgimage"));

                // current_part_id、allow_storageを更新する
                part_map[part_id]["current_part_id"] = "allow_storage";
                part_map[part_id]["allow_storage"] = state_id;

                // 切替対象マップに追加
                target_map[part_id] = { id: state_id, storage: state_id };
            }
        }

        // 切替パーツが存在しなかった場合はなにもせずに次のタグへ
        if (Object.keys(target_map).length === 0) {
            this.kag.ftag.nextOrder();
            return;
        }

        //
        // 画像の切替処理
        //

        // キャラクターを構成するDOM要素のラッパーのjQueryオブジェクトを取得
        const j_chara = this.kag.chara.getCharaContainer(pm.name);

        // 重複を除く
        preload_srcs = [...new Set(preload_srcs)];

        // プリロード完了を待つ
        this.kag.preloadAll(preload_srcs, () => {
            // 時間をかけてフェード切り替えする場合
            if (pm.time && pm.time !== "0") {
                // フェード時間を確定（スキップ時は短縮できるようにする）
                const time = parseInt(this.kag.cutTimeWithSkip(pm.time));

                // アニメーションが完了したパーツの数
                let completed_count = 0;

                // アニメーション対象パーツの総数
                let total_count = 0;

                // 切替対象のパーツマップすべてについて
                for (const part_id in target_map) {
                    // このパーツの状態定義を参照
                    const part = target_map[part_id];

                    // このパーツの<img>要素を取得する
                    let j_img = j_chara.find(`.part.${part_id}`);
                    let j_img_last = j_img.eq(j_img.length - 1);

                    // 口パクのフレームがあれば削除してベースフレームだけを表示する
                    const j_sub_frames = j_img.filter(".lipsync-frame.sub");
                    if (j_sub_frames.length) {
                        j_img_last = j_img.eq(0);
                        j_sub_frames.remove();
                        j_img.css("visibility", "visible");
                        j_img.removeClass("lipsync-frame");
                    }

                    // これからフェードアウトしていく要素にはtemp-elementクラスを付ける
                    // temp-element: ロード時に削除される要素であることを示すクラス
                    // wait=falseでアニメーション中の要素がセーブされた場合に対応する
                    j_img.addClass("temp-element");

                    // オリジナルの<img>のクローンを作成しsrc属性を書き換える
                    // 透明状態にしてフェードインの準備をする
                    let j_new_img = j_img.eq(0).clone();
                    if (part.storage !== "none") {
                        j_new_img.attr("src", $.parseStorage(part.storage, "fgimage"));
                    } else {
                        j_new_img.attr("src", "./tyrano/images/system/transparent.png");
                    }
                    j_new_img.css("opacity", 0);
                    j_img_last.after(j_new_img);

                    // クローンについて目パチ口パクなどのフレームアニメーションを設定する（設定があれば）
                    const ret = this.kag.chara.setFrameAnimation(cpm, part_id, part.id, j_new_img);

                    // フレームアニメーションの設定があった場合、すべてのフレームのコレクションをj_new_imgに代入する
                    j_new_img = ret || j_new_img;

                    // ベースフレームは表示しておく（クローン元のオリジナルで非表示にされている可能性がある）
                    j_new_img.eq(0).css("visibility", "visible");

                    // temp-element（ロード時に削除される要素であることを示すクラス）を除外
                    j_new_img.removeClass("temp-element");

                    // [chara_layer]にeye_zindex="10"のような指定があった場合
                    // CSSのz-indexプロパティの変更を行う
                    // 指定がなければパーツ定義のz-indexを参照する
                    if (pm[`${part_id}_zindex`]) {
                        j_new_img.css("z-index", pm[`${part_id}_zindex`]);
                    } else {
                        j_new_img.css("z-index", part_map[part_id]["zindex"]);
                    }

                    // オリジナルの画像をフェードアウトさせ、完了後に削除する
                    j_img.stop(true, true).fadeTo(time, 0, () => {
                        j_img.remove();
                    });

                    // クローン画像をフェードインさせ、
                    // すべてのパーツのフェードインが完了したなら次のタグに進む
                    total_count += j_new_img.length;
                    j_new_img.stop(true, true).fadeTo(time, 1, () => {
                        completed_count++;
                        if (total_count === completed_count) {
                            if (pm.wait === "true") {
                                this.kag.ftag.nextOrder();
                            }
                        }
                    });
                }

                // wait=trueでないならばもう次のタグに進む
                if (pm.wait !== "true") {
                    this.kag.ftag.nextOrder();
                }
            }
            // 瞬間切替の場合
            else {
                // 切替対象のパーツマップすべてについて
                for (const part_id in target_map) {
                    // このパーツの状態定義を参照
                    const part = target_map[part_id];

                    // このパーツの<img>要素を取得
                    let j_img = j_chara.find(`.part.${part_id}`);

                    // フレームアニメーションなどの設定がある場合はベースの1枚を残してあとは削除する
                    if (j_img.length > 1) {
                        j_img.filter(".lipsync-frame.sub").remove();
                        j_img.filter(".chara-layer-frame.sub").remove();
                        j_img = j_img.filter(".base");
                        j_img.css("visibility", "visible");
                        j_img.removeClass("chara-layer-frame lipsync-frame　base sub");
                        j_img.removeAttr("data-restore");
                        j_img.removeAttr("data-effect");
                        j_img.removeAttr("data-event-pm");
                        clearTimeout(cpm._layer[part_id][prev_map[part_id]].frame_timer_id);
                    }

                    // src属性を書き換える
                    if (part.storage !== "none") {
                        j_img.attr("src", $.parseStorage(part.storage, "fgimage"));
                    } else {
                        j_img.attr("src", "./tyrano/images/system/transparent.png");
                    }

                    // クローンについて目パチ口パクなどのフレームアニメーションを設定する（設定があれば）
                    this.kag.chara.setFrameAnimation(cpm, part_id, part.id, j_img);

                    // [chara_layer]にeye_zindex="10"のような指定があった場合
                    // CSSのz-indexプロパティの変更を行う
                    // 指定がなければパーツ定義のz-indexを参照する
                    if (pm[`${part_id}_zindex`]) {
                        j_img.css("z-index", pm[`${part_id}_zindex`]);
                    } else {
                        j_img.css("z-index", part_map[part_id]["zindex"]);
                    }
                }

                // 次のタグへ
                this.kag.ftag.nextOrder();
            }
        });
    },
};

/*
#[chara_part_reset]

:group
キャラクター操作

:title
キャラクターの差分パーツをデフォルトに戻す

:exp
`[chara_part]`で差分を変更した際、デフォルトの表情に戻すことができます。
キャラクターが表示されている場合は即時デフォルトに戻ります。

:sample
[chara_part_reset name=yuko]

:param
name = `[chara_new]`で指定したキャラクター名を指定します。,
part = 特定の`part`に絞ってリセットすることが可能です。カンマ区切りで複数指定が可能です。省略すると、すべてのパーツをデフォルトに戻します。

#[end]
*/

tyrano.plugin.kag.tag.chara_part_reset = {
    vital: ["name"],

    pm: {
        name: "",
        part: "",
    },

    start: function (pm) {
        var that = this;

        var cpm = this.kag.stat.charas[pm.name];

        if (cpm == null) {
            this.kag.error("undefined_character");
            return;
        }

        //レイヤが登録されているかどうか
        if (!cpm["_layer"]) {
            this.kag.error("undefined_character_parts");
            return;
        }

        var chara_part = cpm["_layer"];

        //chara_part のタグをつくって、デフォルトに戻す
        var new_pm = {
            name: pm.name,
        };

        if (pm.part == "") {
            for (let key in chara_part) {
                new_pm[key] = chara_part[key]["default_part_id"];
            }
        } else {
            //partが指定されている
            var array_part = pm.part.split(",");
            for (var i = 0; i < array_part.length; i++) {
                var key = array_part[i];
                if (chara_part[key]) {
                    new_pm[key] = chara_part[key]["default_part_id"];
                }
            }
        }

        this.kag.ftag.startTag("chara_part", new_pm);
    },
};

/*
#[showlog]

:group
メニュー・HTML表示

:title
バックログの表示

:exp
バックログを表示します。

:sample
[showlog]

:param

#[end]
*/

tyrano.plugin.kag.tag.showlog = {
    pm: {},

    start: function (pm) {
        this.kag.menu.displayLog();
        this.kag.ftag.nextOrder();
    },
};

/*
#[filter]

:group
演出・効果・動画

:title
フィルター効果演出

:exp
レイヤやオブジェクトを指定して、様々なフィルター効果を追加できます。

:sample
;特定のオブジェクトを指定して、フィルター効果
[filter layer=0 name=chara_a grayscale=50 ]

;レイヤを指定してフィルター効果
[filter layer=0 brightness=50 ]

:param
layer      = フィルタをかけるレイヤを指定します。省略すると、もしくは`all`と指定するとゲーム画面全てに効果がかかります。,
name       = 特定の要素にフィルタをかけたい場合に、その要素の`name`を指定します。,
grayscale  = `0`(デフォルト)～`100`を指定することで、画像の表示をグレースケールに変換できます。,
sepia      = `0`(デフォルト)～`100`を指定することで、画像の表示をセピア調に変換できます。,
saturate   = `0`～`100`(デフォルト)を指定してあげることで、画像の表示の彩度（色の鮮やかさ）を変更できます。,
hue        = `0`(デフォルト)～`360`を指定することで、画像の表示の色相を変更できます。,
invert     = `0`(デフォルト)～`100`を指定することで、画像の表示の階調を反転させることができます。,
opacity    = `0`～`100`(デフォルト)を指定することで、画像の表示の透過度を変更できます。,
brightness = `100`(デフォルト)を基準とする数値を指定することで、画像の明度を変更できます。`0`で真っ暗に、`100`以上の数値でより明るくなります。,
contrast   = `0`～`100`(デフォルト)を指定することで、画像の表示のコントラストを変更できます。,
blur       = `0`(デフォルト)～`任意の値`を指定することで、画像の表示をぼかすことができます。

:demo
2,kaisetsu/04_filter

#[end]
*/

//イメージ情報消去背景とか
tyrano.plugin.kag.tag.filter = {
    vital: [],

    pm: {
        layer: "all",
        page: "fore",
        name: "",

        grayscale: "",
        sepia: "",
        saturate: "",
        hue: "",
        invert: "",
        opacity: "",
        brightness: "",
        contrast: "",
        blur: "",
    },

    buildFilterPropertyValue: function (pm) {
        let filter_str = "";

        if (pm.grayscale != "") {
            filter_str += "grayscale(" + pm.grayscale + "%) ";
        }

        if (pm.sepia != "") {
            filter_str += "sepia(" + pm.sepia + "%) ";
        }

        if (pm.saturate != "") {
            filter_str += "saturate(" + pm.saturate + "%) ";
        }

        if (pm.hue != "") {
            filter_str += "hue-rotate(" + pm.hue + "deg) ";
        }

        if (pm.invert != "") {
            filter_str += "invert(" + pm.invert + "%) ";
        }

        if (pm.opacity != "") {
            filter_str += "opacity(" + pm.opacity + "%) ";
        }

        if (pm.brightness != "") {
            filter_str += "brightness(" + pm.brightness + "%) ";
        }

        if (pm.contrast != "") {
            filter_str += "contrast(" + pm.contrast + "%) ";
        }

        if (pm.blur != "") {
            filter_str += "blur(" + pm.blur + "px) ";
        }

        return filter_str;
    },

    start: function (pm) {
        var j_obj = {};

        if (pm.layer == "all") {
            j_obj = $(".layer_camera");
        } else {
            j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
        }

        if (pm.name != "") {
            j_obj = j_obj.find("." + pm.name);
        }

        const filter_str = this.buildFilterPropertyValue(pm);

        j_obj.setFilterCSS(filter_str, false);

        j_obj.addClass("tyrano_filter_effect");

        this.kag.ftag.nextOrder();
    },
};

/*
#[free_filter]

:group
演出・効果・動画

:title
フィルター効果消去

:exp
レイヤやオブジェクトを指定して、`[filter]`効果を無効にします。

:sample
;特定のオブジェクトを指定して、フィルターを打ち消す
[free_filter layer=0 name=chara_a]

;全部のフィルターを打ち消す
[free_filter]

:param
layer = フィルターを消去するレイヤを指定します。指定がない場合、すべてのフィルターが消去されます。,
name  = 特定の要素のフィルターを消去したい場合に、その要素の`name`を指定します。

:demo
2,kaisetsu/04_filter

#[end]
*/

//イメージ情報消去背景とか
tyrano.plugin.kag.tag.free_filter = {
    vital: [],

    pm: {
        layer: "",
        page: "fore",
        name: "",
    },

    start: function (pm) {
        
        var filter_str = "";

        var j_obj;

        try {
        
            if (pm.layer == "all") {
                j_obj = $(".tyrano_filter_effect");
            } else if (pm.layer != "") {
                j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
            } else {
                j_obj = $(".tyrano_filter_effect");
            }
            
        } catch (e) {
            
            j_obj = $(".tyrano_filter_effect");
            
        }

        if (pm.name != "") {
            j_obj = j_obj.find("." + pm.name);
        }

        j_obj.css({
            "-webkit-filter": "",
            "-ms-filter": "",
            "-moz-filter": "",
        });

        j_obj.removeClass("tyrano_filter_effect");

        this.kag.ftag.nextOrder();
    },
};

/*
#[position_filter]

:group
メッセージ関連の設定

:title
メッセージウィンドウ裏にフィルター効果

:exp
メッセージウィンドウの裏側にフィルター効果をかけることができます。
これによって、たとえばメッセージウィンドウをすりガラスのように見せることができます。

:sample
フィルターをかける[p]
[position_filter blur="5"]
すりガラスのような効果[p]
[position_filter invert="100"]
色調反転[p]
[position_filter grayscale="100"]
グレースケールに[p]

:param
layer      = 対象とするメッセージレイヤを指定します。,
page       = !!,
remove     = `true`または`false`。`true`を指定すると、フィルターを除去する処理を行います。,
grayscale  = `0`(デフォルト)～`100`を指定することで、画像の表示をグレースケールに変換できます。,
sepia      = `0`(デフォルト)～`100`を指定することで、画像の表示をセピア調に変換できます。,
saturate   = `0`～`100`(デフォルト)を指定してあげることで、画像の表示の彩度（色の鮮やかさ）を変更できます。,
hue        = `0`(デフォルト)～`360`を指定することで、画像の表示の色相を変更できます。,
invert     = `0`(デフォルト)～`100`を指定することで、画像の表示の階調を反転させることができます。,
opacity    = `0`～`100`(デフォルト)を指定することで、画像の表示の透過度を変更できます。,
brightness = `100`(デフォルト)を基準とする数値を指定することで、画像の明度を変更できます。`0`で真っ暗に、`100`以上の数値でより明るくなります。,
contrast   = `0`～`100`(デフォルト)を指定することで、画像の表示のコントラストを変更できます。,
blur       = `0`(デフォルト)～`任意の値`を指定することで、画像の表示をぼかすことができます。

#[end]
*/

tyrano.plugin.kag.tag.position_filter = {
    vital: [],

    pm: {
        layer: "message0",
        page: "fore",
        remove: "false",
        grayscale: "",
        sepia: "",
        saturate: "",
        hue: "",
        invert: "",
        opacity: "",
        brightness: "",
        contrast: "",
        blur: "",
    },

    start: function (pm) {
        // メッセージレイヤとアウター
        const j_message_layer = this.kag.layer.getLayer(pm.layer, pm.page);
        const j_message_outer = j_message_layer.find(".message_outer");

        // 古いフィルターは捨てる
        j_message_layer.find(".message_filter").remove();

        // remove="true"のときは単に削除するだけ
        if (pm.remove === "true") {
            this.kag.ftag.nextOrder();
            return;
        }

        // アウターのクローンを作成する クラスは変更しておく message_outer → message_filter
        const j_message_outer_clone = j_message_outer.clone();
        j_message_outer_clone.removeClass("message_outer").addClass("message_filter");

        // フィルターをかけたいだけなので背景設定はすべて取り除く
        // フィルターを薄くしないために opacity は確定で 1
        j_message_outer_clone.css({
            "opacity": "1",
            "background-image": "none",
            "background-color": "transparent",
        });

        // pm から backdrop-filter に設定する値を組み立てて突っ込む
        const filter_str = this.kag.ftag.master_tag.filter.buildFilterPropertyValue(pm);
        j_message_outer_clone.css({
            "-webkit-backdrop-filter": filter_str,
            "backdrop-filter": filter_str,
        });

        // アウターの前に挿入するのがいいだろう
        j_message_outer_clone.insertBefore(j_message_outer);

        this.kag.ftag.nextOrder();
    },
};

/*
#[web]

:group
メニュー・HTML表示

:title
Webサイトを開く

:exp
指定したWebサイトをブラウザで開くことができます。

<b>★重要</b>
ただし、このタグの直前にクリック待ちを配置する必要があります。
スマホブラウザを始めとする多くの環境において、ユーザーアクションなしに（たとえばテキスト表示中にいきなり勝手に）別ページに飛ぶような挙動が禁止されているためです。

:sample
;クリック待ちを挟む
公式サイトを開きます[p]
[web url="http://tyrano.jp"]

;ローカルのファイルを開きたい場合
[web url="./data/bgimage/room.jpg"]

:param
url = 開きたいWebサイトのURLを指定します。ゲーム内の画像ファイルなどを開きたい場合、ファイルの場所を`data`から初めて記述します。

:demo
2,kaisetsu/11_html

#[end]
*/

tyrano.plugin.kag.tag.web = {
    vital: ["url"],

    pm: {
        url: "",
    },

    start: function (pm) {
        if (pm.url.indexOf("http") == -1) {
            //this.kag.log("error:[web] url is not correct " + pm.url);
            window.open(pm.url);
        } else {
            //PC nwjsの場合
            if ($.isNWJS()) {
                var gui = require("nw.gui");
                gui.Shell.openExternal(pm.url);
            } else if ($.isElectron()) {
                if (window.studio_api) {
                    //V6	
                    window.studio_api.shell.openExternal(pm.url);
		        } else {
                    var shell = require("electron").shell;
                    shell.openExternal(pm.url);
                }
            } else if ($.isTyranoPlayer()) {
                //ティラノプレイヤーなら、上に伝える
                $.openWebFromApp(pm.url);
            } else {
                window.open(pm.url);
            }
        }

        this.kag.ftag.nextOrder();
    },
};
