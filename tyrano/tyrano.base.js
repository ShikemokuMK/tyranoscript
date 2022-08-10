tyrano.base = {
    //読み込み対象のモジュール
    tyrano: null,
    modules: [],
    options: {},

    init: function (tyrano) {
        this.tyrano = tyrano;
    },

    /**
     * ゲーム画面（div#tyrano_base）にwidth/heightスタイルをセットする
     * @param {number} width 設定上のゲーム画面の横幅 (例) 1280
     * @param {number} height 設定上のゲーム画面の高さ (例) 720
     */
    setBaseSize: function (width, height) {
        this.tyrano.get(".tyrano_base").css({
            "width": width,
            "height": height,
            "background-color": "black",
        });
    },

    /**
     * 100ミリ秒後に_fitBaseSizeを呼ぶ
     *
     * ※ウィンドウサイズが変わった瞬間にフィット処理を走らせると
     * ウィンドウサイズが正常に取れずに画面がうまくフィットしないことがあるためタイムアウトを設けている
     * @param {number} width
     * @param {number} height
     */
    fitBaseSize: function (width, height) {
        var that = this;
        setTimeout(function () {
            that._fitBaseSize(width, height);
        }, 300);
    },

    /**
     * ゲーム画面をウィンドウにフィットさせる
     * @param {number} width 設定上のゲーム画面の横幅 (例) 1280
     * @param {number} height 設定上のゲーム画面の高さ (例) 720
     * @param {number} [timeout=100] フィット処理のタイムアウト 省略可 デフォルトは100
     */
    _fitBaseSize: function (width, height, timeout) {
        // timeoutのデフォルトは100
        if (typeof timeout !== "number") {
            timeout = 100;
        }

        var that = this;

        // ウィンドウサイズ
        var view_width = $.getViewPort().width;
        var view_height = $.getViewPort().height;

        // ゲーム画面をウィンドウにフィットさせるには横幅と高さをそれぞれ何倍すればいいか
        var width_f = view_width / width;
        var height_f = view_height / height;

        // スケール
        var scale_f = 0;

        // div#tyrano_baseへの参照
        var j_tyrano_base = $("#tyrano_base");

        // リサイズ処理のオプション
        // "fix"     : 縦横比を固定して画面ぴったりに拡大（黒帯ができる）
        // "fit"     : 縦横比を維持せずに画面ぴったりに拡大（黒帯ができない）
        // "default" : リサイズ処理を行わない
        var screen_ratio = this.tyrano.kag.config.ScreenRatio;

        // ウィンドウの縦横比がゲーム画面の縦横比よりもワイド（横長）であるかどうか
        var is_window_wider_than_game = width_f > height_f;

        // オプションで場合分け
        if (screen_ratio == "fix") {
            // 縦横比固定の場合

            // スケーリングの基準を横幅にするか高さにするか
            // ウィンドウがゲーム画面よりもワイドなら"高さ"基準でスケーリング。左右に黒帯が生じる
            if (is_window_wider_than_game) {
                scale_f = height_f;
            } else {
                scale_f = width_f;
            }
            //
            this.tyrano.kag.tmp.base_scale = scale_f;

            // 誤動作対策でタイムアウトを設ける
            $.setTimeout(function () {
                // 中央寄せが有効な場合はマージンを計算する
                var margin_top = 0;
                var margin_left = 0;
                if (that.tyrano.kag.config["ScreenCentering"] && that.tyrano.kag.config["ScreenCentering"] == "true") {
                    // 初期化
                    j_tyrano_base.css({
                        "transform-origin": "0 0",
                        "margin": 0,
                    });

                    if (is_window_wider_than_game) {
                        // ウィンドウがゲーム画面よりもワイドである場合
                        // ゲーム画面の左右が余る（左右に黒帯が生じる）ことになる
                        // ■■□□□□□■■
                        // ■■□□□□□■■
                        // ■■□□□□□■■
                        // ウィンドウの横幅からスケーリング後のゲーム画面の横幅を引いた分が余り
                        // この余りを左右均等に割り振りたいので2で割る
                        margin_left = Math.abs(parseInt(window.innerWidth) - parseInt(that.tyrano.kag.config.scWidth * scale_f)) / 2;
                        // ゲーム上側の余白は当然ゼロでよいように思われるが
                        // iOS Safariでは不安定になることがあるので対策する
                        // margin_top = 0;
                        margin_top = document.documentElement.clientHeight - window.innerHeight;
                    } else {
                        // ウィンドウがゲーム画面よりもスリムである場合
                        // ゲーム画面の上下が余る（上下に黒帯が生じる）ことになる
                        // ■■■■■
                        // ■■■■■
                        // □□□□□
                        // □□□□□
                        // □□□□□
                        // ■■■■■
                        // ■■■■■
                        // 同様に計算する
                        margin_top = Math.abs(parseInt(window.innerHeight) - parseInt(that.tyrano.kag.config.scHeight * scale_f)) / 2;
                        margin_left = 0;
                    }
                    j_tyrano_base.css({
                        "margin-left": parseInt(margin_left) + "px",
                        "margin-top": parseInt(margin_top) + "px",
                    });
                }

                // ここでスケーリング
                j_tyrano_base.css("transform", "scale(" + scale_f + ") ");

                // ウィンドウがゲーム画面よりも小さい場合はスクロール（動作安定のため）
                if (parseInt(view_width) < parseInt(width)) {
                    if (scale_f < 1) {
                        window.scrollTo(0, 1);
                    }
                }

                // vchat形式が有効ならそのエリアも調整する
                if (that.tyrano.kag.config["vchat"] && that.tyrano.kag.config["vchat"] == "true") {
                    var base_height = Math.round(parseInt($("#tyrano_base").css("height")) * scale_f);
                    var vchat_height = view_height - base_height;
                    $("#vchat_base").css({
                        "margin-top": base_height,
                        "height": vchat_height,
                    });
                }

                // スケーリングの情報を記憶しておく
                that.updateScreenInfo({
                    scale_x: scale_f,
                    scale_y: scale_f,
                    top: margin_top,
                    left: margin_left,
                    original_width: parseInt(width),
                    original_height: parseInt(height),
                    viewport_width: view_width,
                    viewport_height: view_height,
                });

                // ティラノイベント"resize"を発火
                that.kag.trigger("resize", { target: j_tyrano_base, screen_info: that.tyrano.kag.tmp.screen_info });
            }, timeout);
        } else if (screen_ratio == "fit") {
            // 縦横比を維持しない場合
            $.setTimeout(function () {
                j_tyrano_base.css("transform", "scaleX(" + width_f + ") scaleY(" + height_f + ")");
                window.scrollTo(0, 1);
                that.updateScreenInfo({
                    scale_x: width_f,
                    scale_y: height_f,
                    top: 0,
                    left: 0,
                    original_width: parseInt(width),
                    original_height: parseInt(height),
                    viewport_width: view_width,
                    viewport_height: view_height,
                });

                // ティラノイベント"resize"を発火
                that.kag.trigger("resize", { target: j_tyrano_base, screen_info: that.tyrano.kag.tmp.screen_info });
            }, timeout);
        } else {
            that.updateScreenInfo({
                scale_x: 1,
                scale_y: 1,
                top: 0,
                left: 0,
                original_width: parseInt(width),
                original_height: parseInt(height),
                viewport_width: view_width,
                viewport_height: view_height,
            });
            // スクリーンサイズ固定
        }
    },

    /**
     * スクリーン情報をアップデート
     * @param {Object} data
     */
    updateScreenInfo(data) {
        const info = this.tyrano.kag.tmp.screen_info;
        $.extend(info, data);
        info.width = info.original_width * info.scale_x;
        info.height = info.original_height * info.scale_y;
        info.right = info.left + info.width;
        info.bottom = info.top + info.height;
    },

    /**
     * マウス座標をゲーム画面上の座標に変換する
     *
     * ※ゲーム画面（div#tyrano_base）はtransform: scale()によってスケーリングされているため、
     * マウス座標（event.offsetXなど）とゲーム画面上の座標のあいだに食い違いが発生し、そのままでは使えない
     * @param {number} page_x ドキュメント上のX座標 マウスイベントのevent.pageXに相当する値
     * @param {number} page_y ドキュメント上のY座標 マウスイベントのevent.pageYに相当する値
     * @param {boolean} [as_int=false] 座標を整数で返すかどうか 省略可 デフォルトはfalse
     * @returns {{x:number; y:number;}} ゲーム画面上の座標
     */
    convertPageXYIntoGameXY: function (page_x, page_y, as_int = false) {
        // スケーリング情報の参照
        const info = this.tyrano.kag.tmp.screen_info;

        // マージンを引く
        const x_removed_margin = page_x - info.left;
        const y_removed_margin = page_y - info.top;

        // スケールを戻す
        const x_unscaled = x_removed_margin / info.scale_x;
        const y_unscaled = y_removed_margin / info.scale_y;

        // 丸め込み
        const x_rounded = as_int ? parseInt(x_unscaled) : x_unscaled;
        const y_rounded = as_int ? parseInt(y_unscaled) : y_unscaled;

        return {
            x: x_rounded,
            y: y_rounded,
        };
    },

    test: function () {
        //alert("tyrano test");
    },
};
