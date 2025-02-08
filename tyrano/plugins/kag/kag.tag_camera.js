/*
#[camera]

:group
カメラ操作

:title
カメラを移動する

:exp
カメラのズームやパンのような演出ができます。
カメラ機能を使うことで、キャラクターの立ち絵の表情にフォーカスをあてたり、一枚絵のいろんな個所をズームしてみたりと多彩な演出ができます。

カメラ機能を使用するには`Config.tjs`の`useCamera`を`true`にする必要があります。
また、カメラ機能を有効にした場合、画面の中央寄せ（`ScreenCentering`）が無効になります。

カメラの座標は画面中央が（`x=0 y=0`）です。たとえば画面右上は`x=200 y=200`、画面左下は`x=-200 y=-200`という座標指定になります。

カメラを元の位置に戻すためには`[reset_camera]`タグを使用します。
カメラの演出完了を待つためには`[wait_camera]`タグを使用します。

<b>★重要</b>
カメラ演出が終わったら、必ず`[reset_camera]`でカメラの位置を初期値に戻してください。カメラを戻さないと、背景の変更 [bg]タグ等は使用できません。

:sample

[camera zoom=2 x=180 y=100 time=1000]
[camera x=-180 y=100 time=2000]
[camera zoom=2 from_zoom=3 x=180 y=100 time=1000]

;カメラの位置を元に戻す
[reset_camera]

:param
time        = カメラが座標へ移動する時間をミリ秒で指定します。,
x           = カメラの移動するX座標を指定します。,
y           = カメラの移動するY座標を指定します,
zoom        = カメラの拡大率を指定します。`２`と指定すると2倍ズームとなります。,
rotate      = カメラの傾きを指定します。`20`と指定するとカメラが20度傾きます。,
from_x      = カメラの移動開始時のX座標を指定できます。,
from_y      = カメラの移動開始時のY座標を指定できます。,
from_zoom   = カメラの移動開始時の倍率を指定できます。,
from_rotate = カメラの移動開始時の傾きを指定できます。,
wait        = カメラ移動の完了を待つかどうかを`true`または`false`で指定します。`false`を指定するとカメラ移動中もゲームを進行できます。,
layer       = カメラの効果を与えるレイヤを指定します。背景なら`base`、前景レイヤなら`0`以上の数字。これを指定すると、カメラの影響を特定レイヤに限定できます。通常はすべてのレイヤに対して影響を及ぼします。,
ease_type   = カメラの移動演出を指定できます。<br>
`ease`(開始時点と終了時点を滑らかに再生する)<br>
`linear`(一定の速度で再生する)<br>
`ease-in`(開始時点をゆっくり再生する)<br>
`ease-out`(終了時点をゆっくり再生する)<br>
`ease-in-out`(開始時点と終了時点をゆっくり再生する)

:demo
2,kaisetsu/01_camera

#[end]
*/

tyrano.plugin.kag.tag.camera = {
    vital: [],

    pm: {
        time: 1000,

        from_x: "",
        from_y: "",
        from_zoom: "",
        from_rotate: "",

        x: "",
        y: "",
        zoom: "",
        rotate: "",
        layer: "layer_camera",

        wait: "true",
        ease_type: "ease",
    },

    start: function (pm) {
        var that = this;

        /*
        if(this.kag.config.useCamera == "false"){
            $.alert("[camera]タグエラー。カメラの使用を許可して下さい。Config.tjsのuseCameraをtrueにする必要があります");
            return false;
        }
        */
        
        if (parseInt(pm.time) < 10) {
            pm.time = 10;
        }

        //duration を確認する
        var duration = pm.time + "ms";

        if (typeof this.kag.stat.current_camera[pm.layer] == "undefined") {
            this.kag.stat.current_camera[pm.layer] = {
                x: "0",
                y: "0",
                scale: "1",
                rotate: "0",
            };
        }

        var to_camera = $.extend(true, {}, this.kag.stat.current_camera[pm.layer]);

        //指定されて項目があるなら、上書きする
        if (pm.x != "") to_camera.x = parseInt(pm.x) * -1 + "px";
        if (pm.y != "") to_camera.y = parseInt(pm.y) * 1 + "px";
        if (pm.zoom != "") to_camera.scale = pm.zoom;
        if (pm.rotate != "") to_camera.rotate = pm.rotate + "deg";

        if (pm.from_x !== "" || pm.from_y !== "" || pm.from_zoom !== "" || pm.from_rotate !== "") {
            const from_info = {
                x: "0",
                y: "0",
                scale: "1",
                rotate: "0",
            };
            if (pm.from_x !== "") from_info.x = pm.from_x;
            if (pm.from_y !== "") from_info.y = pm.from_y;
            if (pm.from_zoom !== "") from_info.scale = pm.from_zoom;
            if (pm.from_rotate !== "") from_info.rotate = pm.from_rotate;
            this.kag.stat.current_camera[pm.layer] = {
                x: parseInt(from_info.x) * -1 + "px",
                y: parseInt(from_info.y) * 1 + "px",
                scale: from_info.scale,
                rotate: from_info.rotate + "deg",
            };
        }

        var flag_complete = false;
        that.kag.stat.is_move_camera = true;

        var a3d_define = {
            frames: {
                "0%": {
                    trans: this.kag.stat.current_camera[pm.layer],
                },
                "100%": {
                    trans: to_camera,
                },
            },

            config: {
                duration: duration,
                state: "running",
                easing: pm.ease_type,
            },

            complete: function () {
                //アニメーションが完了しないと次へはいかない
                if (pm.wait == "true" && flag_complete == false) {
                    flag_complete = true; //最初の一回だけwait有効

                    setTimeout(function () {
                        that.kag.ftag.nextOrder();
                    }, 300);
                } else {
                    //カメラを待ってる状態なら
                    if (that.kag.stat.is_wait_camera == true) {
                        that.kag.stat.is_wait_camera = false;
                        that.kag.ftag.nextOrder();
                    }
                }

                that.kag.stat.is_move_camera = false;
            },
        };

        this.kag.stat.current_camera[pm.layer] = to_camera;

        if (pm.wait == "false") {
            that.kag.ftag.nextOrder();
        }

        //アニメーションの実行
        if (pm.layer == "layer_camera") {
            $(".layer_camera").css("-webkit-transform-origin", "center center");
            $(".layer_camera").a3d(a3d_define);
            this.kag.stat.current_camera_layer = "";
        } else {
            $("." + pm.layer + "_fore").css("-webkit-transform-origin", "center center");
            $("." + pm.layer + "_fore").a3d(a3d_define);
            this.kag.stat.current_camera_layer = pm.layer;
        }
    },

    play: function (obj, cb) {},
};

/*
#[reset_camera]

:group
カメラ操作

:title
カメラをリセットする

:exp
カメラの位置を初期値に戻します。

<b>★重要</b>
`[camera]`タグによるカメラ演出が終わったあとは、必ずこのタグでカメラの位置をもとに戻してください。
そうしない場合、背景の変更などで不具合が生じる場合があります。

:sample

:param
time      = カメラの移動時間をミリ秒で指定します。,
wait        = カメラ移動の完了を待つかどうかを`true`または`false`で指定します。`false`を指定するとカメラ移動中もゲームを進行できます。,
layer       = カメラの効果を与えるレイヤを指定します。背景なら`base`、前景レイヤなら`0`以上の数字。これを指定すると、カメラの影響を特定レイヤに限定できます。通常はすべてのレイヤに対して影響を及ぼします。,
ease_type   = カメラの移動演出を指定できます。<br>
`ease`(開始時点と終了時点を滑らかに再生する)<br>
`linear`(一定の速度で再生する)<br>
`ease-in`(開始時点をゆっくり再生する)<br>
`ease-out`(終了時点をゆっくり再生する)<br>
`ease-in-out`(開始時点と終了時点をゆっくり再生する)


:demo
2,kaisetsu/01_camera

#[end]
*/

tyrano.plugin.kag.tag.reset_camera = {
    vital: [],

    pm: {
        time: 1000,

        wait: "true",
        ease_type: "ease",
        layer: "layer_camera",
    },

    start: function (pm) {
        var that = this;
        //duration を確認する

        if (parseInt(pm.time) < 10) {
            pm.time = 10;
        }

        var duration = pm.time + "ms";

        var to_scale = 1;

        var to_camera = {
            x: "0px",
            y: "0px",
            scale: "1",
            rotate: "0deg",
        };

        var flag_complete = false;

        that.kag.stat.is_move_camera = true;

        var a3d_define = {
            frames: {
                "0%": {
                    trans: this.kag.stat.current_camera[pm.layer],
                },
                "100%": {
                    trans: to_camera,
                },
            },

            config: {
                duration: duration,
                state: "running",
                easing: pm.ease_type,
            },

            complete: function () {
                //リセットした時は、本当に消す
                $("." + pm.layer).css({
                    "-animation-name": "",
                    "-animation-duration": "",
                    "-animation-play-state": "",
                    "-animation-delay": "",
                    "-animation-iteration-count": "",
                    "-animation-direction": "",
                    "-animation-fill-mode": "",
                    "-animation-timing-function": "",
                    "transform": "",
                });

                //アニメーションが完了しないと次へはいかない
                if (pm.wait == "true" && flag_complete == false) {
                    flag_complete = true; //最初の一回だけwait有効
                    that.kag.ftag.nextOrder();
                } else {
                    //カメラを待ってる状態なら
                    if (that.kag.stat.is_wait_camera == true) {
                        that.kag.stat.is_wait_camera = false;
                        that.kag.ftag.nextOrder();
                    }
                }

                that.kag.stat.is_move_camera = false;
            },
        };

        if (pm.layer != "layer_camera") {
            delete this.kag.stat.current_camera[pm.layer];
        } else {
            //全クリア
            this.kag.stat.current_camera = {};
        }

        if (pm.wait == "false") {
            that.kag.ftag.nextOrder();
        }

        //アニメーションの実行
        if (pm.layer == "layer_camera") {
            $(".layer_camera").css("-webkit-transform-origin", "center center");
            $(".layer_camera").a3d(a3d_define);
            this.kag.stat.current_camera_layer = "";
        } else {
            $("." + pm.layer + "_fore").css("-webkit-transform-origin", "center center");
            $("." + pm.layer + "_fore").a3d(a3d_define);
            this.kag.stat.current_camera_layer = "";
        }
    },

    play: function (obj, cb) {},
};

/*
#[wait_camera]

:group
カメラ操作

:title
カメラの演出を待つ

:exp
カメラが演出中である場合、その完了を待つことができます。`wait=false`を指定した`[camera]`タグと組み合わせて使います。

たとえば「背景でカメラを動かしつつ、テキストを読ませる。ただし、メッセージ送りのタイミングでカメラが動き終わるのを待つ」という演出に活用できます。

:sample
[camera zoom=2 x=180 y=100 time=10000 wait=false]
カメラ演出中[p]
ここでもカメラ演出中[p]
カメラの演出を待ちます[wait_camera]
カメラの演出が終わったので進行[p]

:param

:demo
2,kaisetsu/01_camera

#[end]
*/

tyrano.plugin.kag.tag.wait_camera = {
    start: function (pm) {
        //今、カメラ中なら待つ
        if (this.kag.stat.is_move_camera == true) {
            //this.kag.weaklyStop();
            this.kag.stat.is_wait_camera = true;
        } else {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[mask]

:group
演出・効果・動画

:title
スクリーンマスク表示

:exp
ゲーム画面全体を豊富な効果とともに暗転させることができます。
暗転中にゲーム画面を再構築して`[mask_off]`タグでゲームを再開する使い方ができます。

:sample
;暗転開始
[mask effect="fadeInDownBig" time=2000]

;裏で画面操作
[bg storage="umi.jpg" time=500]

;暗転解除
[mask_off]

:param
time    = 暗転が完了するまでの時間をミリ秒で指定できます。,
effect  = <p>暗転の効果を指定できます。以下のキーワードが指定できます。</p><p>`fadeIn``fadeInDownBig``fadeInLeftBig``fadeInRightBig``fadeInUpBig``flipInX``flipInY``lightSpeedIn``rotateIn``rotateInDownLeft``rotateInDownRight``rotateInUpLeft``rotateInUpRight``zoomIn``zoomInDown``zoomInLeft``zoomInRight``zoomInUp``slideInDown``slideInLeft``slideInRight``slideInUp``bounceIn ``bounceInDown``bounceInLeft``bounceInRight``bounceInUp``rollIn`</p>,
color   = 暗転の色を`0xRRGGBB`形式で指定します。デフォルトは黒。,
graphic = 指定すると、暗転部分に画像を使用できます。画像は`data/image`フォルダに配置します。,
folder  = `graphic`で指定するフォルダを`image`以外に変更したい場合はこちらに記述します。`bgimage``fgimage`などを指定します。

:demo
2,kaisetsu/05_mask

#[end]
*/

tyrano.plugin.kag.tag.mask = {
    vital: [],

    pm: {
        time: 1000,
        effect: "fadeIn",
        color: "0x000000",
        graphic: "",
        folder: "",
    },

    start: function (pm) {
        var that = this;
        that.kag.weaklyStop();

        if (pm.time == "0") {
            pm.time = "1";
        }
        
        //mask表示中なら無視して次へ
        if ($(".layer_mask").get(0)) {
            that.kag.ftag.nextOrder();
            return;
        }

        var j_div = $("<div class='layer layer_mask' data-effect='" + pm.effect + "' style='z-index:100000000;position:absolute;'>");
        j_div.css("animation-duration", parseInt(pm.time) + "ms");

        var sc_width = parseInt(that.kag.config.scWidth);
        var sc_height = parseInt(that.kag.config.scHeight);

        var behind = false;

        j_div.css({ width: sc_width, height: sc_height });

        if (pm.color == "none") {
            j_div.css("background-color", "");
        } else {
            j_div.css("background-color", $.convertColor(pm.color));
        }

        if (pm.graphic != "") {
            var folder = "";
            if (pm.folder != "") {
                folder = pm.folder;
            } else {
                folder = "image";
            }

            var storage_url = "";

            if (pm.graphic != "") {
                storage_url = "./data/" + folder + "/" + pm.graphic;
                j_div.css("background-image", "url(" + storage_url + ")");
            }

            //画像が設定されている場合
            behind = true;
        }

        //外に線が見える対応
        if (behind == false) {
            j_div.css("transform", "scale(1.02)");
        }

        $(".tyrano_base").append(j_div);

        var animationEnd = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
        j_div.addClass("animated " + pm.effect).one(animationEnd, function () {
            //$(this).removeClass('animated ' + pm.effect);

            if (behind == false) {
                $("#root_layer_game").css("opacity", 0);
            }

            that.kag.ftag.nextOrder();
        });
    },
};

/*
#[mask_off]

:group
演出・効果・動画

:title
スクリーンマスク消去

:exp
スクリーンマスクを消去してゲームを再開します。

:sample
;暗転開始
[mask effect="fadeInDownBig" time=2000]

;裏で画面操作
[bg storage="umi.jpg" time=500]

;暗転解除
[mask_off]

:param
time   = 暗転が完了するまでの時間をミリ秒で指定できます。,
effect = <p>暗転の効果を指定できます。以下のキーワードが指定できます。</p><p>`fadeOut``fadeOutDownBig``fadeOutLeftBig``fadeOutRightBig``fadeOutUpBig``flipOutX``flipOutY``lightSpeedOut``rotateOut``rotateOutDownLeft``rotateOutDownRight``rotateOutUpLeft``rotateOutUpRight``zoomOut``zoomOutDown``zoomOutLeft``zoomOutRight``zoomOutUp``slideOutDown``slideOutLeft``slideOutRight``slideOutUp``bounceOut ``bounceOutDown``bounceOutLeft``bounceOutRight``bounceOutUp`</p>

:demo
2,kaisetsu/05_mask

#[end]
*/

tyrano.plugin.kag.tag.mask_off = {
    vital: [],

    pm: {
        time: 1000,
        effect: "fadeOut",
    },

    start: function (pm) {
        var that = this;
        var j_div = $(".layer_mask");

        if (pm.time == "0") {
            pm.time = "1";
        }

        $("#root_layer_game").css("opacity", 1);

        if (j_div.get(0)) {
            var _effect = j_div.attr("data-effect");
            j_div.removeClass("animated " + _effect);
            j_div.css("animation-duration", parseInt(pm.time) + "ms");

            var animationEnd = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
            j_div.addClass("animated " + pm.effect).one(animationEnd, function () {
                j_div.remove();
                that.kag.cancelWeakStop();
                that.kag.ftag.nextOrder();
            });
        } else {
            that.kag.cancelWeakStop();
            that.kag.ftag.nextOrder();
        }
    },
};
