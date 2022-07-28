/*
 * キーボードとマウス操作を支援するプラグインです.
 * キーボード:
 *     [ENTER]や[SPACE]で、次のメッセージへ.
 *     [ESC]でメッセージウィンドウを消す.
 * マウス:
 *     マウスの右クリックでメニューを表示.
 *     ※メニューが非表示の場合、メッセージウィンドウを消します.
 *
 * This is a plugin to support the operation of keyboard and mouse.
 * Keyboard:
 *     Press [Enter] or the space key to go to the next message.
 *     Press [Ecs] to hide the message window.
 * Mouse:
 *     Right-clicking displays the menu.
 *     Note: When the menu is not displayed, hide the message window.
 *
 *  Special Thanks for Keito
 *
 */
tyrano.plugin.kag.key_mouse = {
    kag: null,

    //キーコンフィグ。デフォルトは用意しておく
    keyconfig: {
        key: {},
    },

    map_key: {},
    map_mouse: {},
    map_ges: {},

    //状況に応じて変化する
    is_swipe: false,
    timeoutId: 0,

    is_keydown: false, //キーの連続押し込み反応を防ぐ

    //指が動いた状態を管理するための値
    start_point: { x: 0, y: 0 },
    end_point: { x: 0, y: 0 },

    init: function () {
        var that = this;

        //定義されてない場合デフォルトを設定
        if (typeof __tyrano_key_config == "undefined") {
            __tyrano_key_config = {
                //キーボード操作
                key: {
                    32: "hidemessage", //Space
                    13: "next", // Enter
                    91: "skip", //Command(Mac)
                    17: "skip", //Ctrl (Windows)
                    67: function () {
                        // c ボタン
                    },
                },

                //マウス操作
                mouse: {
                    right: "hidemessage", //右クリックの動作
                    center: "menu", //センターボタンをクリック
                    wheel_up: "backlog", // ホイールをアップした時の動作
                    wheel_down: "next", //ホイールをダウンした時の動作
                },

                //ジェスチャー
                gesture: {
                    swipe_up_1: {
                        action: "backlog",
                    },
                    swipe_left_1: {
                        action: "auto",
                    },
                    swipe_right_1: {
                        action: "menu",
                    },
                    swipe_down_1: {
                        action: "load",
                    },

                    hold: {
                        action: "skip",
                    },
                },
            };
        }

        this.keyconfig = __tyrano_key_config;

        this.map_key = this.keyconfig["key"];
        this.map_mouse = this.keyconfig["mouse"];
        this.map_ges = this.keyconfig["gesture"];
        this.map_pad = this.keyconfig["gamepad"];

        // Windowsの場合に限りWindowsキー(KeyCode 91)に割り当てられているロールを破棄する
        // Macの場合は⌘(コマンド)キーにKeyCode 91が割り当てられている
        if ($.getOS() === "win") {
            delete this.map_key["91"];
        }

        //
        // keydown キーダウン
        //

        $(document).keydown(function (e) {
            // ブラウザの音声の再生制限を解除
            if (!that.kag.tmp.ready_audio) that.kag.readyAudio();

            // ティラノイベント"keydown"を発火
            that.kag.trigger("keydown", e);

            if (that.kag.stat.enable_keyconfig == true) {
                if (that.is_keydown == true) {
                    if (__tyrano_key_config.system_key_event == "true") {
                        return true;
                    }

                    return false;
                }

                //メニュー系が表示されている時。

                that.is_keydown = true;

                var keycode = e.keyCode;

                //イベント登録済みなら
                if (that.map_key[keycode]) {
                    if (typeof that.map_key[keycode] == "function") {
                        //関数の場合
                        that.map_key[keycode]();
                    } else {
                        // next キーの場合、フォーカス中の要素があればその要素のクリックをトリガーする処理を行って早期リターンする
                        if (that.map_key[keycode] === "next") {
                            const j_focus = $(":focus.keyfocus");
                            if (j_focus.length > 0) {
                                j_focus.eq(0).trigger("click");
                                return;
                            }
                        }
                        if (that[that.map_key[keycode]]) {
                            that[that.map_key[keycode]]();
                        }
                    }
                }
            }
        });

        //
        // keyup キーアップ
        //

        //keyup はコントローラーのときや押しっぱなし対応
        $(document).keyup(function (e) {
            that.is_keydown = false;

            var keycode = e.keyCode;

            // いま離したキーに"スキップ"ロールが割り当てられているならスキップ解除
            // スキップキーを押している(ホールド)間だけスキップできるようにする
            if (that.map_key[keycode] === "skip") {
                that.kag.setSkip(false);
            }
        });

        //
        // mousedown マウスダウン
        //

        $(document).on("mousedown", function (e) {
            that.clearSkip();

            var target = null;

            //中央クリック
            if (e.which == 2) {
                target = that.map_mouse["center"];
            } else if (e.which == 3) {
                //右クリック
                target = that.map_mouse["right"];
            }

            if (typeof target == "function") {
                target();
            } else {
                if (that[target]) {
                    that[target]();
                }
            }
        });

        //
        // mousewheel マウスホイール
        //

        var mousewheelevent = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
        $(document).on(mousewheelevent, function (e) {
            //メニュー表示中は進めない。
            if (!that.canShowMenu()) {
                return;
            }

            //キーコンフィグが有効化否か
            if (that.kag.stat.enable_keyconfig == false) {
                return;
            }

            //メニュー表示中は無効にする
            if ($(".menu_close").length > 0 && $(".layer_menu").css("display") != "none") {
                return;
            }

            var delta = e.originalEvent.deltaY
                ? -e.originalEvent.deltaY
                : e.originalEvent.wheelDelta
                ? e.originalEvent.wheelDelta
                : -e.originalEvent.detail;

            var target = null;

            if (delta < 0) {
                // マウスホイールを下にスクロールしたときの処理を記載
                target = that.map_mouse["wheel_down"];
            } else {
                // マウスホイールを上にスクロールしたときの処理を記載
                target = that.map_mouse["wheel_up"];
            }

            if (typeof target == "function") {
                target();
            } else {
                if (that[target]) {
                    that[target]();
                }
            }
        });

        var layer_obj_click = $(".layer_event_click");

        //スマートフォンイベント
        if ($.userenv() != "pc") {
            //
            // スワイプ
            //

            layer_obj_click.swipe({
                swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
                    that.is_swipe = true;
                    //console.log("wwwwwwwwwwwwwww");
                    //console.log(direction+":"+distance+":"+duration+":"+fingerCount+":"+fingerData);
                    //$(this).text("You swiped " + direction );

                    var swipe_str = "swipe_" + direction + "_" + fingerCount;

                    if (that.map_ges[swipe_str]) {
                        if (that[that.map_ges[swipe_str]["action"]]) {
                            that[that.map_ges[swipe_str]["action"]]();
                        }
                    }

                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                },

                fingers: "all",
            });

            //
            // タッチスタート、タッチエンド
            //

            layer_obj_click
                .on("touchstart", function () {
                    //スキップ中にクリックされたら元に戻す
                    that.clearSkip();

                    that.timeoutId = setTimeout(function () {
                        if (that[that.map_ges["hold"]["action"]]) {
                            that.is_swipe = true;
                            that[that.map_ges["hold"]["action"]]();
                        }
                    }, 2000);
                })
                .on("touchend", function () {
                    clearTimeout(that.timeoutId);
                    that.timeoutId = null;
                });

            //スマホでのダブルタップ抑制
            var t = 0;
            $(".tyrano_base").on("touchend", function (e) {
                var now = new Date().getTime();
                if (now - t < 350) {
                    e.preventDefault();
                }
                t = now;
            });
        }

        //
        // イベントレイヤのクリック
        //

        layer_obj_click.click(function (e) {
            // ブラウザの音声の再生制限を解除
            if (!that.kag.tmp.ready_audio) that.kag.readyAudio();

            // ティラノイベント"click:event"を発火
            that.kag.trigger("click:event", e);

            if (that.is_swipe) {
                that.is_swipe = false;
                return false;
            }

            if (that.kag.stat.is_hide_message == true) {
                that.kag.layer.showMessageLayers();
                return false;
            }

            //テキスト再生中にクリックされた場合、文字列を進めて終了にする
            if (that.kag.stat.is_adding_text == true) {
                that.kag.stat.is_click_text = true;
                return false;
            }

            //テキストマッハ表示時もリターン。
            if (that.kag.stat.is_click_text == true) {
                return false;
            }

            if (that.kag.stat.is_stop == true) {
                return false;
            }

            //フキダシ表示の場合は一回非表示にする。
            if (that.kag.stat.fuki.active == true) {
                that.kag.layer.hideMessageLayers();
            }

            that.kag.ftag.hideNextImg();
            // ティラノイベント"click:next"を発火
            that.kag.trigger("click:next", e);
            that.kag.ftag.nextOrder();
        });

        //
        // ページを開いてからゲームパッドの入力を最初に検知した瞬間に発火されるイベントリスナ
        //

        // ゲームパッド未使用環境でいたずらに処理を増やさないようにするため、
        // ゲームパッドの入力を一定間隔で検知し続ける関数 getGamepadInputs() はこの中で呼ぶようにする
        // * たとえPC自体にゲームパッドがつながっていても、ページを開いてから最初にゲームパッドの入力を検知するまでは
        //   navigator.getGamepads() でゲームパッドの入力状態が取れるようにならない
        // * ひとつのゲームパッドから入力が入った瞬間に
        //   そのときPCに接続されているすべてのゲームパッド分の gamepadconnected が発火する
        // * 一度USBやBluetoothの接続が切れてから再度接続しなおしたときにも発火する
        $(window).on("gamepadconnected", (e) => {
            // console.warn(e.gamepad);
            if (!this.gamepad.gamepad_exests) {
                this.gamepad.gamepad_exests = true;
                this.gamepad.getGamepadInputs();
            }
        });

        //
        // ゲームパッドのボタンダウン
        //

        $(document).on("gamepadpressdown", (e) => {
            // キーコンフィグ無効化中は即リターン
            if (!this.kag.stat.enable_keyconfig) return;

            // ティラノイベント"gamepad:pressdown"を発火
            this.kag.trigger("gamepad:pressdown", e);

            const action = this.map_pad.button[e.detail.button_name] || this.map_pad.button[e.detail.button_index];

            this.doAction(action);
        });

        //
        // ゲームパッドのボタンアップ
        //

        $(document).on("gamepadpressup", (e) => {
            // キーコンフィグ無効化中は即リターン
            if (!this.kag.stat.enable_keyconfig) return;

            // ティラノイベント"gamepad:pressup"を発火
            this.kag.trigger("gamepad:pressup", e);

            const action = this.map_pad.button[e.detail.button_name] || this.map_pad.button[e.detail.button_index];

            if (action === "skip") {
                this.kag.setSkip(false);
            }
        });

        //
        // ゲームパッドのボタンアップ
        //

        $(document).on("gamepadstickdigital", (e) => {
            // キーコンフィグ無効化中は即リターン
            if (!this.kag.stat.enable_keyconfig) return;

            // ティラノイベント"gamepad:stick:digital"を発火
            this.kag.trigger("gamepad:stick:digital", e);

            const map = this.map_pad.stick_digital[e.detail.stick_name] || this.map_pad.stick_digital[e.detail.stick_index];
            if (map) {
                const action = map[e.detail.direction];
                console.log(action);
                this.doAction(action);
            }
        });
    },

    doAction: function (action) {
        if (typeof action === "function") return action();

        if (action === "next") {
            const j_focus = $(":focus.keyfocus");
            if (j_focus.length > 0) {
                j_focus.eq(0).trigger("click");
                return;
            }
        }

        if (this[action]) this[action]();
    },

    next: function () {
        //指定された動作を発火させる
        if (this.kag.key_mouse.canClick()) {
            this.clearSkip();
            $(".layer_event_click").trigger("click");
        }
    },

    showmenu: function () {
        if (this.canShowMenu()) {
            if ($(".menu_close").length > 0 && $(".layer_menu").css("display") != "none") {
                $(".menu_close").click();
            } else {
                $(".button_menu").click();
            }
        }
    },

    hidemessage: function () {
        if (this.canShowMenu()) {
            if ($(".menu_close").length > 0 && $(".layer_menu").css("display") != "none") {
                $(".menu_close").click();
            } else {
                if (!this.kag.stat.is_strong_stop) {
                    if (this.kag.stat.is_hide_message) {
                        this.kag.layer.showMessageLayers();
                    } else {
                        this.kag.ftag.startTag("hidemessage");
                    }
                }
            }
        }
    },

    save: function () {
        this._role("save");
    },
    load: function () {
        this._role("load");
    },
    menu: function () {
        this._role("menu");
    },
    title: function () {
        this._role("title");
    },
    skip: function () {
        if (this.canClick()) {
            this._role("skip");
        }
    },
    backlog: function () {
        this._role("backlog");
    },
    fullscreen: function () {
        this._role("fullscreen");
    },
    qsave: function () {
        this._role("quicksave");
    },
    qload: function () {
        this._role("quickload");
    },
    auto: function () {
        this._role("auto");
    },

    /**
     * フォーカス可能な要素群およびフォーカス中の一要素を抽出して
     * フォーカスを新しく当てる、もしくはフォーカスを前後に移動させる
     * @param {"next"|"prev"} order
     */
    focus_order: function (order = "next") {
        // キーボードでフォーカス可能な要素
        const j_focusable = $("[tabindex]");

        // 存在しなければ帰る
        if (j_focusable.length === 0) {
            return;
        }

        // j_focusable のうち、いまフォーカスされている要素
        const j_focused = j_focusable.filter(":focus.keyfocus");

        // j_focusable のうち、いまフォーカスされていない要素（つまり、これからフォーカスする可能性のある要素）
        const j_unfocused = j_focusable.not(":focus.keyfocus");

        // フォーカス候補が1つもないならおわり
        // フォーカス候補が1つしかないならそれをフォーカスしておわり
        if (j_unfocused.length === 0) {
            return;
        } else if (j_unfocused.length === 1) {
            j_unfocused.focus().addClass("keyfocus");
            return;
        }

        // ここに到達したということはフォーカス候補が2つ以上あるため
        // なんらかの優先順位でフォーカス先を決定しなければならない

        //
        // 新規フォーカス
        //

        // いまフォーカスされている要素がない場合は新規フォーカスとなる
        // j_focusable の先頭または末尾をフォーカスして帰る
        if (j_focused.length === 0) {
            // next なら先頭を、prev なら末尾をフォーカスする
            const index = order === "next" ? 0 : j_focusable.length - 1;
            j_focusable.eq(index).focus().addClass("keyfocus");
            return;
        }

        //
        // フォーカスの移動
        //

        const index = j_focusable.index(j_focused);
        const add = order === "next" ? 1 : -1;
        const next_index = (index + add + j_focusable.length) % j_focusable.length;
        j_focusable.eq(next_index).focus().addClass("keyfocus");
    },

    focus_next: function () {
        this.focus_order("next");
    },

    focus_prev: function () {
        this.focus_order("prev");
    },

    /**
     * フォーカス可能な要素群およびフォーカス中の一要素を抽出して
     * その要素間の位置関係を考慮したうえで
     * フォーカスを新しく当てる、もしくはフォーカスを上下左右に移動させる
     * @param {"up"|"down"|"left"|"right"} dir
     */
    focus_dir: function (dir = "down") {
        // キーボードでフォーカス可能な要素
        const j_focusable = $("[tabindex]");

        // 存在しなければ帰る
        if (j_focusable.length === 0) {
            return;
        }

        // j_focusable のうち、いまフォーカスされている要素
        const j_focused = j_focusable.filter(":focus.keyfocus");

        // j_focusable のうち、いまフォーカスされていない要素（つまり、これからフォーカスする可能性のある要素）
        const j_unfocused = j_focusable.not(":focus.keyfocus");

        // フォーカス候補が1つもないならおわり
        // フォーカス候補が1つしかないならそれをフォーカスしておわり
        if (j_unfocused.length === 0) {
            return;
        } else if (j_unfocused.length === 1) {
            j_unfocused.focus().addClass("keyfocus");
            return;
        }

        // ここに到達したということはフォーカス候補が2つ以上あるため
        // なんらかの優先順位でフォーカス先を決定しなければならない

        //
        // 位置を調べる
        //

        // x座標, y座標, jQueryオブジェクト が格納されたオブジェクトの配列
        const pos_list = [];

        // フォーカスが当たっている要素の情報
        let focused_pos = null;

        j_focusable.each((i, elm) => {
            const j_elm = $(elm);
            const offset = j_elm.offset();
            const width = j_elm.width();
            const height = j_elm.height();
            const left = offset.left;
            const top = offset.top;
            const x = left + width / 2;
            const x1 = x - width / 4;
            const x2 = x + width / 4;
            const y = top + height / 2;
            const y1 = y - height / 4;
            const y2 = y + height / 4;
            const right = left + width;
            const bottom = top + height;
            const pos = { x, x1, x2, y, y1, y2, left, top, right, bottom, j_elm };
            pos_list.push(pos);
            // フォーカスされている要素の情報はおさえておく
            if (j_elm.is(":focus.keyfocus")) {
                focused_pos = pos;
            }
        });

        //
        // pos_list の並べ替え
        //

        // 縦方向かどうか
        const is_dir_vertical = dir === "up" || dir === "down";
        // 正の方向かどうか
        const is_plus = dir === "down" || dir === "right";

        let compare;
        switch (is_dir_vertical) {
            default:
            case true:
                // より下にある要素を配列の末尾に
                compare = (a, b) => a.top < b.top;
                break;
            case false:
                // より右にある要素を配列の末尾に
                compare = (a, b) => a.left < b.left;
                break;
        }
        pos_list.sort((a, b) => {
            return compare(a, b) ? -1 : 1;
        });

        //
        // 新規フォーカス
        //

        // いまフォーカスが当たっている要素がない場合は新規フォーカスとなる
        // 下キーなら一番下の要素を、上キーなら一番上の要素を、という感じで1つ選んでフォーカスしておわり
        if (!focused_pos) {
            const index = is_plus ? pos_list.length - 1 : 0;
            pos_list[index].j_elm.focus().addClass("keyfocus");
            return;
        }

        //
        // フォーカス移動
        //

        // this.focus_dir_column(dir, pos_list, focused_pos);
        // this.focus_dir_beam(dir, pos_list, focused_pos);
        this.focus_dir_angle(dir, pos_list, focused_pos);
    },

    /**
     * ★上下左右のフォーカス移動の実装パターン①列分割
     * たとえば dir が up または down の場合、フォーカス可能な要素群を縦何列かで区切ってこの順序で並べた配列を作る。
     *  |　　／|　　／|
     *  |　／　|　／　|
     *  |／　　|／　　↓
     * down ならば配列の後ろの要素を、up ならば配列の前の要素をフォーカスする。
     */
    focus_dir_column: function (dir, pos_list, focused_pos) {
        // 縦方向かどうか
        const is_dir_vertical = dir === "up" || dir === "down";
        // 正の方向かどうか
        const is_plus = dir === "down" || dir === "right";

        const _width = is_dir_vertical ? "width" : "height";
        const game_width = this.kag.tmp.scale_info[`game_${_width}`];
        const hash_num = 10;
        const hash_width = parseInt(game_width / hash_num);
        const _x = is_dir_vertical ? "x" : "y";

        const new_pos_column = [];
        for (let i = 0; i <= hash_num + 1; i++) {
            new_pos_column[i] = [];
        }
        pos_list.forEach((this_pos) => {
            let index;
            if (this_pos[_x] < 0) index = 0;
            else index = Math.min(hash_num + 1, Math.ceil(this_pos[_x] / hash_width));
            new_pos_column[index].push(this_pos);
        });
        new_pos_list = new_pos_column.reduce((prev, item) => {
            return prev.concat(item);
        }, []);
        const index = new_pos_list.indexOf(focused_pos);
        const add = is_plus ? 1 : -1;
        const next_index = (index + add + new_pos_list.length) % new_pos_list.length;
        new_pos_list[next_index].j_elm.focus().addClass("keyfocus");
    },

    /**
     * ★上下左右のフォーカス移動の実装パターン②ビームサーチ
     * たとえば下図において現在フォーカス中の要素が x であるとして、dir が up または　down であるとする。
     * このとき、まず 100 px幅で上下に存在する要素をサーチして、要素が見つかった場合は up または down に応じてフォーカスを移動する。
     * 　　←|   |→
     * 　　←| x |→
     * 　　←|   |→
     * 要素が見つからなかった場合は探索幅を 100 px増やしてまた同じことをする。
     * 以降、要素が見つかるまでこの操作を繰り返す。
     */
    focus_dir_beam: function (dir, pos_list, focused_pos) {
        // 縦方向かどうか
        const is_dir_vertical = dir === "up" || dir === "down";
        // 正の方向かどうか
        const is_plus = dir === "down" || dir === "right";

        // 探索幅
        let search_width = 100;
        let searched_pos_list = [];

        while (true) {
            const _x = is_dir_vertical ? "x" : "y";
            const _left = is_dir_vertical ? "left" : "top";
            const _right = is_dir_vertical ? "right" : "bottom";
            const search_left = focused_pos[_x] - search_width;
            const search_right = focused_pos[_x] + search_width;
            searched_pos_list = [];
            pos_list.forEach((this_pos) => {
                // 探索幅からはみ出ている要素は無視
                if (this_pos[_right] < search_left || search_right < this_pos[_left]) {
                    return;
                }
                searched_pos_list.push(this_pos);
            });
            if (searched_pos_list.length > 1) {
                break;
            }
            search_width += 100;
        }

        // pos_list の次の要素をフォーカスする
        const index = searched_pos_list.indexOf(focused_pos);
        const add = is_plus ? 1 : -1;
        const next_index = (index + add + searched_pos_list.length) % searched_pos_list.length;
        searched_pos_list[next_index].j_elm.focus().addClass("keyfocus");
    },

    /**
     * ★上下左右のフォーカス移動の実装パターン③角度法
     * いまフォーカス中の要素から他の要素までの角度をそれぞれ計算する。
     * たとえば dir が up ならば、上 90 度の領域に含まれる要素のうちもっとも近い要素にフォーカスを移動する。
     * ＼　　／
     * 　＼／
     * 　／＼
     * ／　　＼
     */
    focus_dir_angle: function (dir, pos_list, focused_pos) {
        let candidate_pos_list;
        const deg_360 = Math.PI * 2;
        const deg_90 = Math.PI / 2;
        const deg_45 = Math.PI / 4;
        const deg_30 = Math.PI / 6;
        const dir_num = ["right", "up", "left", "down"].indexOf(dir);
        const dir_rad = dir_num * deg_90;
        // 90°(45°*2)幅、150°幅(75°*2)の最大計2回探索する
        // 最初の90°幅の探索で要素が見つかったなら2回目の探索は省略
        for (let i = 0; i < 2; i++) {
            candidate_pos_list = [];
            const search_width = deg_45 + i * deg_30;
            pos_list.forEach((this_pos) => {
                if (this_pos === focused_pos) {
                    return;
                }
                const rad0 = (Math.atan2(focused_pos.y - this_pos.y, this_pos.x - focused_pos.x) + deg_360) % deg_360;
                const rad1 = (Math.atan2(focused_pos.y - this_pos.y1, this_pos.x1 - focused_pos.x) + deg_360) % deg_360;
                const rad2 = (Math.atan2(focused_pos.y - this_pos.y2, this_pos.x2 - focused_pos.x) + deg_360) % deg_360;
                const rads = [rad0, rad1, rad2];
                for (const rad of rads) {
                    const dif1 = Math.abs(dir_rad - rad);
                    const dif2 = Math.abs(dir_rad + deg_360 - rad);
                    const dif = Math.min(dif1, dif2);
                    if (dif < search_width) {
                        const d0 = Math.sqrt(Math.pow(this_pos.y - focused_pos.y, 2) + Math.pow(this_pos.x - focused_pos.x, 2));
                        const d1 = Math.sqrt(Math.pow(this_pos.y1 - focused_pos.y, 2) + Math.pow(this_pos.x1 - focused_pos.x, 2));
                        const d2 = Math.sqrt(Math.pow(this_pos.y2 - focused_pos.y, 2) + Math.pow(this_pos.x2 - focused_pos.x, 2));
                        const d = Math.min(d0, d1, d2);
                        const penalty = 100 * (dif / search_width);
                        this_pos.distance = d + penalty;
                        candidate_pos_list.push(this_pos);
                        break;
                    }
                }
            });
            if (candidate_pos_list > 0) {
                break;
            }
        }
        if (candidate_pos_list.length === 0) {
            return;
        }
        candidate_pos_list.sort((a, b) => {
            return a.distance < b.distance ? -1 : 1;
        });
        candidate_pos_list[0].j_elm.focus().addClass("keyfocus");
    },

    focus_up: function () {
        this.focus_dir("up");
    },

    focus_down: function () {
        this.focus_dir("down");
    },

    focus_left: function () {
        this.focus_dir("left");
    },

    focus_right: function () {
        this.focus_dir("right");
    },

    //役割系のロジック
    _role: function (role) {
        var that = this;

        //roleがクリックされたら、skip停止。スキップ繰り返しでやったりやめたり
        if (that.kag.stat.is_skip == true && role == "skip") {
            that.kag.setSkip(false);
            return false;
        }

        //画面効果中は実行できないようにする
        if (that.kag.layer.layer_event.css("display") == "none" && that.kag.stat.is_strong_stop != true) {
            return false;
        }

        //キーコンフィグが有効化否か
        if (that.kag.stat.enable_keyconfig == false) {
            return false;
        }

        that.kag.setSkip(false);

        //オートは停止
        if (role != "auto") {
            that.kag.ftag.startTag("autostop", { next: "false" });
        }

        //文字が流れているときは、セーブ出来ないようにする。
        if (role == "save" || role == "menu" || role == "quicksave" || role == "sleepgame") {
            //テキストが流れているときとwait中は実行しない
            if (that.kag.stat.is_adding_text == true || that.kag.stat.is_wait == true) {
                return false;
            }
        }

        switch (role) {
            case "save":
                //すでにメニュー画面が見えてる場合は無効にする
                if ($(".layer_menu").css("display") == "none") {
                    that.kag.menu.displaySave();
                }

                break;

            case "load":
                if ($(".layer_menu").css("display") == "none") {
                    that.kag.menu.displayLoad();
                }
                break;

            case "window":
                that.kag.layer.hideMessageLayers();
                break;
            case "title":
                $.confirm(
                    $.lang("go_title"),
                    function () {
                        location.reload();
                    },
                    function () {
                        return false;
                    },
                );
                break;

            case "menu":
                that.kag.menu.showMenu();
                break;
            case "skip":
                that.kag.ftag.startTag("skipstart", {});
                break;
            case "backlog":
                that.kag.menu.displayLog();
                break;
            case "fullscreen":
                that.kag.menu.screenFull();
                break;
            case "quicksave":
                that.kag.menu.setQuickSave();
                break;
            case "quickload":
                that.kag.menu.loadQuickSave();
                break;
            case "auto":
                if (that.kag.stat.is_auto == true) {
                    that.kag.ftag.startTag("autostop", { next: "false" });
                } else {
                    that.kag.ftag.startTag("autostart", {});
                }
                break;

            case "sleepgame":
                if (that.kag.tmp.sleep_game != null) {
                    return false;
                }

                //ready
                that.kag.tmp.sleep_game = {};

                that.kag.ftag.startTag("sleepgame", _pm);
                break;
        }
    },

    canClick: function () {
        if ($(".layer_event_click").css("display") != "none" && $(".layer_menu").css("display") == "none") {
            return true;
        }

        return false;
    },

    //スキップやオートをクリアする
    clearSkip: function () {
        var that = this;

        //スキップ中にクリックされたら元に戻す
        if (that.kag.stat.is_skip == true && that.kag.stat.is_strong_stop == false) {
            that.kag.setSkip(false);
            return false;
        }

        //オート中でクリックされた場合。オート停止
        if (that.kag.stat.is_auto == true) {
            if (that.kag.config.autoClickStop == "true") {
                that.kag.ftag.startTag("autostop", { next: "false" });
            }
        }

        //オート待ち状態なら、、解除する
        if (that.kag.stat.is_wait_auto == true) {
            that.kag.stat.is_wait_auto = false;
        }
    },

    canShowMenu: function () {
        if (this.kag.layer.layer_event.css("display") == "none" && this.kag.stat.is_strong_stop != true) {
            return false;
        }

        //wait中の時
        if (this.kag.stat.is_wait == true) {
            return false;
        }

        return true;

        /*
        if ($(".layer_free").css("display") == "none") {
            return true;
        }
        return false;

        */
    },

    gamepad: {
        keymap_lang: {
            standard: {
                buttons: {
                    0: "A",
                    1: "B",
                    2: "X",
                    3: "Y",
                    4: "LB",
                    5: "RB",
                    6: "LT",
                    7: "RT",
                    8: "SELECT",
                    9: "START",
                    10: "LS",
                    11: "RS",
                    12: "UP",
                    13: "DOWN",
                    14: "LEFT",
                    15: "RIGHT",
                    16: "HOME",
                },
            },
        },

        // 前回確認時の Gamepad を格納する配列（Gamepad[]）
        prev_gamepads: [],

        // ゲームパッドが存在するか（true, false）
        gamepad_exests: false,

        // 最後に使ったゲームパッドのインデックス（0, 1, 2, 3）
        last_used_gamepad_index: 0,

        // スティックを倒した絶対量（0.0～1.0）をX方向・Y方向で分けて合計した値（0.0～2.0）がこれ以下であれば
        // スティックの入力を無視する
        MINIMAM_VALUE_DETECT_AXE: 0.001,

        // スティック入力をデジタルな十字キー入力にパースするとき
        // スティックを倒した絶対量（0.0～1.0）がこの値以上になった瞬間にデジタル入力をトリガーする
        MINIMAM_VALUE_DIGITAL_STICK: 0.5,

        // 何ミリ秒ごとにゲームパッドの入力状態を取得するか
        UPDATE_TIMEOUT: 50,

        /**
         * ゲームパッドの入力状態のスナップショットを確認する
         * 前回確認時の Gamepad と照合して「ボタンが押された瞬間」を検知する
         * イベントの発火なども行う
         */
        getGamepadInputs: function () {
            try {
                const gamepads = navigator.getGamepads
                    ? navigator.getGamepads()
                    : navigator.webkitGetGamepads
                    ? navigator.webkitGetGamepads()
                    : null;

                // getGamepads() が利用できない環境（IE以外ではほとんどありえない）は無視
                // ※ゲームパッドが未接続であっても getGamepads() は [null, null, null, null] を返す
                if (!gamepads) {
                    return;
                }

                // 接続済みのゲームパッドが少なくともひとつ存在するか
                let gamepad_exists = false;

                // 使用された（入力状態に変化があった）ゲームパッドが少なくともひとつ存在するか
                let used_gamepad_exists = false;

                //
                // 各ゲームパッドを確認
                //

                // Electron 7 では gamepads.forEach はエラーとなる
                Array.prototype.forEach.call(gamepads, (gamepad, gi) => {
                    // null は無視
                    if (!gamepad) {
                        return;
                    }
                    gamepad_exists = true;

                    // 前回の入力状態が取れないなら即リターン
                    const prev_gamepad = this.prev_gamepads[gi];
                    if (!prev_gamepad) {
                        this.prev_gamepads[gi] = gamepad;
                        return;
                    }

                    //
                    // ボタンの入力状態を確認
                    //

                    // 入力状態に変化があったか
                    let is_changed_inputs = false;
                    // 前回のボタン入力
                    const prev_buttons = prev_gamepad.buttons;
                    gamepad.buttons.forEach((button, bi) => {
                        const prev_button = prev_buttons[bi];
                        // 入力状態に変化があったか
                        const is_changed = button.pressed !== prev_button.pressed;
                        // 押された瞬間を検知
                        if (is_changed) {
                            let button_name = "";
                            const lang = this.keymap_lang[gamepad.mapping] || this.keymap_lang.standard;
                            if (lang) {
                                button_name = lang.buttons[bi] || "";
                            }
                            const event_name = button.pressed ? "gamepadpressdown" : "gamepadpressup";
                            const event = new CustomEvent(event_name, {
                                detail: {
                                    button_index: bi,
                                    gamepad_index: gi,
                                    button_name,
                                    button,
                                    gamepad,
                                },
                            });
                            document.dispatchEvent(event);
                        }
                        if (is_changed) {
                            is_changed_inputs = is_changed;
                        }
                    });

                    //
                    // スティックの入力を検知
                    //

                    gamepad.__sticks = [];
                    const stick_num = gamepad.axes.length / 2;
                    for (let si = 0; si < stick_num; si++) {
                        let stick;
                        const aix = si * 2;
                        const aiy = si * 2 + 1;
                        const x = gamepad.axes[aix];
                        const y = gamepad.axes[aiy];
                        if (typeof x !== "number" || typeof y !== "number") {
                            continue;
                        }
                        const sum = Math.abs(x) + Math.abs(y);
                        if (sum < this.MINIMAM_VALUE_DETECT_AXE) {
                            stick = {
                                radian: 0,
                                degree: 0,
                                distance: 0,
                                direction: "up",
                            };
                        } else {
                            let radian = Math.atan2(-y, x);
                            if (radian < 0) radian += Math.PI * 2;
                            const degree = radian * (180 / Math.PI);
                            const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                            const radian_rotate = radian + Math.PI / 4;
                            const direction_index = Math.floor((2 * radian_rotate) / Math.PI) % 4;
                            const direction = ["RIGHT", "UP", "LEFT", "DOWN"][direction_index];
                            stick = {
                                radian,
                                degree,
                                distance,
                                direction,
                            };
                        }
                        gamepad.__sticks.push(stick);
                    }

                    if (prev_gamepad.__sticks) {
                        gamepad.__sticks.forEach((stick, si) => {
                            const prev_stick = prev_gamepad.__sticks[si];
                            const is_over_threshold = stick.distance > this.MINIMAM_VALUE_DIGITAL_STICK;
                            let should_trigger =
                                stick.direction !== prev_stick.direction || prev_stick.distance < this.MINIMAM_VALUE_DIGITAL_STICK;
                            if (is_over_threshold && should_trigger) {
                                const stick_name = ["L", "R"][si] || "";
                                const event = new CustomEvent("gamepadstickdigital", {
                                    detail: {
                                        stick_name,
                                        stick_index: si,
                                        direction: stick.direction,
                                    },
                                });
                                document.dispatchEvent(event);
                            }
                        });
                    }

                    // スティックの入力検知おわり

                    // 入力状態に変化があったならこのゲームパッドを「最後に使われたゲームパッド」に登録する
                    if (is_changed_inputs) {
                        this.last_used_gamepad_index = gamepad.index;
                        used_gamepad_exists = true;
                    }

                    // 今回の Gamepad を次回使えるように格納
                    this.prev_gamepads[gi] = gamepad;
                });

                // ゲームパッドの確認終わり
                // ゲームパッドが存在する場合にのみ次の入力を取得しにいく
                if (gamepad_exists) {
                    setTimeout(() => {
                        this.getGamepadInputs();
                    }, this.UPDATE_TIMEOUT);
                } else {
                    // ゲームパッドが存在しない場合は入力の取得を打ち切る。フラグも折っておく
                    this.gamepad_exests = false;
                }
            } catch (error) {
                console.log(error);
                this.gamepad_exests = false;
            }
        },

        /**
         * 特定の Gamepad を返す
         * @param {number} [index] ゲームパッドのインデックス（0～3）（省略した場合は最後に入力を検知したゲームパッド）
         * @returns Gamepad
         */
        getGamepad: function (index) {
            if (index === undefined) {
                index = this.last_used_gamepad_index;
            }

            const gamepads = navigator.getGamepads
                ? navigator.getGamepads()
                : navigator.webkitGetGamepads
                ? navigator.webkitGetGamepads()
                : null;

            if (gamepads) {
                return gamepads[index];
            } else {
                return null;
            }
        },

        /**
         * ゲームパッドを振動させる
         * @param {Gamepad} [gamepad] 振動させるゲームパッド（省略した場合は最後に入力を検知したゲームパッド）
         * @param {number} [power=1] 振動の強さ（0.0-1.0）
         * @param {number} [duration=500] 振動の時間（msec）
         */
        vibrate: function (gamepad, power = 1, duration = 500) {
            if (!gamepad) gamepad = this.getGamepad();
            const act = gamepad && gamepad.vibrationActuator;
            if (!act) {
                return;
            } else if (act.pulse) {
                act.pulse(power, duration);
            } else if (act.playEffect) {
                act.playEffect(act.type, {
                    duration: duration,
                    startDelay: 0,
                    strongMagnitude: power,
                    weakMagnitude: power,
                });
            }
        },
    },
};

/*

 ///マウス周り
 //スライドイベント
 layer_obj_click.bind('touchstart', function(e) {
 e.preventDefault();                     // ページが動くのを止める
 var pageX = event.changedTouches[0].pageX; // X 座標の位置
 var pageY = event.changedTouches[0].pageY; // Y 座標の位置
 that.start_point.x = pageX;
 that.start_point.y = pageY;

 //console.log("start -------");
 //console.log(pageY);

 });

 //スライドイベント
 layer_obj_click.bind('touchend', function(e) {

 if(that.kag.stat.visible_menu_button==false){
 return false;
 }

 e.preventDefault();                     // ページが動くのを止める
 var pageX = event.changedTouches[0].pageX; // X 座標の位置
 var pageY = event.changedTouches[0].pageY; // Y 座標の位置

 that.end_point.x = pageX;
 that.end_point.y = pageY;

 var move_x = that.end_point.x - that.start_point.x;
 var move_y = that.end_point.y - that.start_point.y;

 ////
 if(move_x > 250){
 //右スライド
 console.log("右スライド");
 }else if(move_y > 50){
 //縦スライド
 that.kag.ftag.startTag("showmenu", {});

 }

 });

 * */
