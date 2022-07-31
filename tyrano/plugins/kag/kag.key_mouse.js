/**
 * Supports Mouse, Keyboard, Touch, and Gamepad input.
 * Special Thanks to Keito.
 */
tyrano.plugin.kag.key_mouse = {
    // 初期化後に TYRANO.kag が参照できるようになる
    kag: {},

    // キーコンフィグ
    keyconfig: {},
    map_key: {},
    map_mouse: {},
    map_ges: {},
    map_pad: {},

    // 状況に応じて変化するプロパティ
    is_swipe: false,
    hold_timer_id: 0,
    previous_touchend_time: 0,
    is_keydown: false, // キーの連続押し込み反応を防ぐ
    start_point: { x: 0, y: 0 }, // 指が動いた状態を管理するためのプロパティ
    end_point: { x: 0, y: 0 },

    // 定数プロパティ
    HOLD_TIMEOUT: 2000, // この時間(ミリ秒)タッチし続けたときに「ホールド」をトリガーする
    PREVENT_DOUBLE_TOUCH_TIME: 350, // この時間(ミリ秒)より短い時間の連続タップを抑制する
    VMOUSE_TICK_RATE: 20, // 仮想マウスカーソルのチックレート
    GAMEPAD_TICK_RATE: 20, // ゲームパッドのチックレート
    KEYBOARD_TICK_RATE: 20, // キーボードのチックレート
    HOLD_MASH_DELAY: 0, // ホールド連打が始まるまでのディレイ
    HOLD_MASH_INTERVAL: 20, // ホールド連打の間隔
    DEFAULT_VMOUSE_MOVEMENT: 15, // 仮想マウスカーソル操作量のデフォルト値
    MOUSE_BUTTON_NAMES: ["", "center", "right", "prev", "next"], // e.button に対応するキーコンフィグマップキー

    /**
     * 初期化
     */
    init() {
        //定義されてない場合デフォルトを設定
        if (typeof window.__tyrano_key_config === "undefined") {
            window.__tyrano_key_config = this.default_keyconfig;
        }

        // キーコンフィグ
        // エラーを起こさないように最低限のデフォルト値を用意する
        this.keyconfig = window.__tyrano_key_config || {};
        this.map_key = this.keyconfig["key"] || {};
        this.map_mouse = this.keyconfig["mouse"] || {};
        this.map_ges = this.keyconfig["gesture"] || {};
        this.map_pad = this.keyconfig["gamepad"] || { button: {}, stick_digital: {}, stick: {} };

        //
        // マウスダウン
        //

        $(document).on("mousedown", (e) => {
            this.util.clearSkip();
            const key = this.MOUSE_BUTTON_NAMES[e.button];
            const action = key ? this.map_mouse[key] : null;
            const done = this.doAction(action, e);
            if (done || e.button === 1) {
                // なにかアクションを実行した場合はブラウザ固有の動作を抑制
                // ホイールクリックの場合も抑制しておかないとマウスカーソルがスクロールモードになってしまう
                return false;
            }
        });

        $(document).on("mousemove", (e) => {
            this.vmouse.hide();
        });

        //
        // マウスホイール
        //

        $(document).on(this.util.getWheelEventType(), (e) => {
            const delta = e.originalEvent.deltaY
                ? -e.originalEvent.deltaY
                : e.originalEvent.wheelDelta
                ? e.originalEvent.wheelDelta
                : -e.originalEvent.detail;

            let action = null;

            if (delta < 0) {
                // マウスホイールを下にスクロールしたときの処理
                action = this.map_mouse["wheel_down"];
            } else {
                // マウスホイールを上にスクロールしたときの処理
                action = this.map_mouse["wheel_up"];
            }

            this.doAction(action, e);
        });

        // イベントレイヤ
        const layer_obj_click = $(".layer_event_click");

        //
        // スマートフォンイベント
        //
        if ($.userenv() !== "pc") {
            //
            // スワイプ
            //

            // https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
            layer_obj_click.swipe({
                swipe: (event, direction, distance, duration, fingerCount, fingerData) => {
                    this.is_swipe = true;
                    const action_key = "swipe_" + direction + "_" + fingerCount;
                    let action = this.map_ges[action_key];
                    if (typeof action === "object" && "action" in action) action = action.action;
                    this.doAction(action, event);
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                },
                fingers: "all",
            });

            //
            // ホールド
            //

            layer_obj_click
                .on("touchstart", (e) => {
                    // スキップ中にクリックされたら元に戻す
                    this.util.clearSkip();
                    this.hold_timer_id = setTimeout(() => {
                        let action = this.map_ges.hold;
                        if (typeof action === "object" && "action" in action) action = action.action;
                        const done = this.doAction(action, e);
                        if (done) {
                            this.is_swipe = true;
                        }
                    }, this.HOLD_TIMEOUT);
                })
                .on("touchend", () => {
                    clearTimeout(this.hold_timer_id);
                });

            //
            // スマホでのダブルタップ抑制
            //

            $(".tyrano_base").on("touchend", (e) => {
                const now = new Date().getTime();
                if (now - this.previous_touchend_time < this.PREVENT_DOUBLE_TOUCH_TIME) {
                    e.preventDefault();
                }
                this.previous_touchend_time = now;
            });
        }

        //
        // イベントレイヤのクリック
        //

        layer_obj_click.click((e) => {
            // ブラウザの音声の再生制限を解除
            if (!this.kag.tmp.ready_audio) this.kag.readyAudio();

            // ティラノイベント"click-event"を発火
            this.kag.trigger("click-event", e);

            //
            // 無視するケースを洗い出す
            //

            // スワイプフラグが立っているときのタップは一度だけ無視する
            if (this.is_swipe) {
                this.is_swipe = false;
                return false;
            }

            // メッセージウィンドウを非表示にしている場合は表示する処理だけを行う
            if (this.kag.stat.is_hide_message) {
                this.kag.layer.showMessageLayers();
                return false;
            }

            // テキスト再生中にクリックされた場合、テキストマッハ表示フラグを立てる
            if (this.kag.stat.is_adding_text) {
                this.kag.stat.is_click_text = true;
                return false;
            }

            // テキストマッハ表示中もリターン
            if (this.kag.stat.is_click_text) {
                return false;
            }

            // アニメーション中、トランジション中などもリターン
            if (this.kag.stat.is_stop) {
                return false;
            }

            //
            // 次のタグに進む！
            //

            // フキダシ表示の場合は一回非表示にする。
            if (this.kag.stat.fuki.active) {
                this.kag.layer.hideMessageLayers();
            }

            // クリック待ちグリフは消去
            this.kag.ftag.hideNextImg();

            // ティラノイベント"click-next"を発火
            this.kag.trigger("click-next", e);

            // 次のタグへ
            this.kag.ftag.nextOrder();
        });

        //
        // キーボード初期化
        //

        this.keyboard.init(this);

        //
        // ゲームパッド初期化
        //

        if (this.kag.config["useGamepad"] === "true") {
            this.gamepad.init(this);
        }

        //
        // 仮想マウスカーソル初期化
        //

        this.vmouse.init(this);

        //
        // ユーティリティ初期化
        //

        this.util.parent = this;
        this.util.kag = this.kag;
    },

    /**
     * アクションを実行する
     * @param {function|string|Object} action
     * @param {Event} event
     * @returns {boolean} アクションを実行できたかどうか
     */
    doAction(action, event) {
        if (!action) return;

        // キーコンフィグが有効かどうか
        const config_enabled = this.kag.stat.enable_keyconfig;

        // アクション名とパラメータを得る
        let name;
        let pm;
        switch (typeof action) {
            case "function":
                // 関数ならそのまま実行して終了
                if (config_enabled) action();
                return config_enabled;
            case "string":
                const tag = this.kag.parser.makeTag(action, 0);
                name = tag.name;
                pm = tag.pm;
                break;
            case "object":
                name = action.name;
                pm = action.pm;
                break;
        }
        if (!name) return;

        // キーコンフィグが無効かつ -a オプションが指定されていないアクションならば実行しない
        if (!config_enabled && pm["-a"] === undefined) {
            return false;
        }

        // キーボード操作とゲームパッド操作を検知
        const is_gamepad = event.type.indexOf("gamepad") === 0;
        const is_keyboard = event.type.indexOf("key") === 0;

        // キーボード操作またはゲームパッド操作の"next"アクションを検知したとき
        // フォーカス中のボタンがある場合はクリックをトリガーする処理に変更する
        if (name === "next" && (is_gamepad || is_keyboard)) {
            // 最後に"next"アクションを実行したゲームパッドを記憶しておく
            if (is_gamepad) {
                this.gamepad.last_used_next_gamepad_index = event.detail.gamepad_index;
            }
            if (this.vmouse.is_visible) {
                this.vmouse.leftdown();
                return;
            }
            const j_focus = $(":focus.keyfocus");
            if (j_focus.length > 0) {
                j_focus.eq(0).trigger("click");
                return true;
            }
        }

        // ホールド連打かつ -h オプションが指定されていないアクションならば実行しない
        const is_hold_mash = event.detail && event.detail.is_hold_mash;
        if (is_hold_mash && pm["-h"] === undefined) {
            return false;
        }

        // フォーカス系のロールじゃない場合はフォーカスを外す
        if (!name.includes("focus")) {
            this.util.unfocus();
        }

        // アクションを実行
        if (typeof this[name] === "function") {
            return this[name](pm);
        }

        return false;
    },

    test() {
        alert("Hello!");
    },

    next() {
        if (this.util.canClick()) {
            this.util.clearSkip();
            $(".layer_event_click").trigger("click");
        }
    },

    showmenu() {
        if (this.util.canShowMenu()) {
            if ($(".menu_close").length > 0 && $(".layer_menu").css("display") != "none") {
                $(".menu_close").click();
            } else {
                $(".button_menu").click();
            }
        }
    },

    hidemessage() {
        if (this.util.canShowMenu()) {
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

    save() {
        this._role("save");
    },

    load() {
        this._role("load");
    },

    menu() {
        if (this.util.isOpenMenu()) {
            this.close();
        } else {
            this._role("menu");
        }
    },

    title() {
        this._role("title");
    },

    holdskip() {
        if (this.util.canClick()) {
            this._role("skip");
        }
    },

    skip() {
        if (this.util.canClick()) {
            this._role("skip");
        }
    },

    backlog() {
        // メニュー表示中は不可
        if (!this.util.canShowMenu()) return false;
        if (this.util.isOpenMenu()) return false;
        return this._role("backlog");
    },

    fullscreen() {
        this._role("fullscreen");
    },

    qsave() {
        this._role("quicksave");
    },

    qload() {
        this._role("quickload");
    },

    auto() {
        this._role("auto");
    },

    sleepgame(pm) {
        // いますでにスリープ中の場合は不可
        if (this.kag.tmp.sleep_game) return;

        // [jump]ができない状況なら不可
        if (!this.util.canJumpScenario()) return;

        this.kag.ftag.startTag("sleepgame", pm);
    },

    close() {
        if (!this.util.isOpenRemodal()) {
            $(".menu_close").click();
        }
    },

    cancel() {
        const j_focused = this.util.findFocused();
        if (j_focused.length > 0) {
            j_focused.blur();
            return;
        }
        if (this.util.isOpenRemodal()) {
            $(".remodal").find(".remodal-cancel").click();
        } else if (this.util.isOpenMenu()) {
            $(".menu_close").click();
        } else {
            this.util.clearSkip();
        }
    },

    scroll_up() {
        $(".button_arrow_up").click();
    },

    scroll_down() {
        $(".button_arrow_down").click();
    },

    /**
     * フォーカス可能な要素群のうち特定の番号の要素をフォーカス
     * @param {number} index フォーカスする番号 1-based
     * @returns {boolean} アクションを実行できたかどうか
     */
    focus_index(pm) {
        const index = pm.index ? parseInt(pm.index) : 1;
        this.util.unfocus();

        // キーボードでフォーカス可能な要素を取得, 存在しなければ帰る
        const j_focusable = this.util.findFocusable();
        if (j_focusable.length === 0) return false;

        // フォーカスする対象を決定, 存在しなければ帰る
        const j_target = j_focusable.eq(index - 1);
        if (!j_target[0]) return false;

        this.util.focus(j_target);
    },

    /**
     * フォーカス可能な要素群およびフォーカス中の一要素を抽出して
     * フォーカスを新しく当てる、もしくはフォーカスを前後に移動させる
     * @param {"next"|"prev"} order
     */
    focus_order(order = "next") {
        // キーボードでフォーカス可能な要素
        const j_focusable = this.util.findFocusable();

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
            this.util.focus(j_unfocused);
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
            // const index = order === "next" ? 0 : j_focusable.length - 1;
            let index = 0;
            if (this.util.isCloseButton(pos_list[index].j_elm)) {
                index++;
            }
            this.util.focus(j_focusable.eq(index));
            return;
        }

        //
        // フォーカスの移動
        //

        const index = j_focusable.index(j_focused);
        const add = order === "next" ? 1 : -1;
        const next_index = (index + add + j_focusable.length) % j_focusable.length;
        this.util.focus(j_focusable.eq(next_index));
    },

    focus_next() {
        this.focus_order("next");
    },

    focus_prev() {
        this.focus_order("prev");
    },

    /**
     * フォーカス可能な要素群およびフォーカス中の一要素を抽出して
     * その要素間の位置関係を考慮したうえで
     * フォーカスを新しく当てる、もしくはフォーカスを上下左右に移動させる
     * @param {"up"|"down"|"left"|"right"} dir
     */
    focus_dir(dir = "down") {
        // キーボードでフォーカス可能な要素
        const j_focusable = this.util.findFocusable();

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
            this.util.focus(j_unfocused);
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
            // const index = is_plus ? pos_list.length - 1 : 0;
            let index = 0;
            if (this.util.isCloseButton(pos_list[index].j_elm)) {
                index++;
            }
            this.util.focus(pos_list[index].j_elm);
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
    focus_dir_column(dir, pos_list, focused_pos) {
        // 縦方向かどうか
        const is_dir_vertical = dir === "up" || dir === "down";
        // 正の方向かどうか
        const is_plus = dir === "down" || dir === "right";

        const _width = is_dir_vertical ? "width" : "height";
        const original_width = this.kag.tmp.screen_info[`original_${_width}`];
        const hash_num = 10;
        const hash_width = parseInt(original_width / hash_num);
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
        this.util.focus(new_pos_list[next_index].j_elm);
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
    focus_dir_beam(dir, pos_list, focused_pos) {
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
        this.util.focus(searched_pos_list[next_index].j_elm);
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
    focus_dir_angle(dir, pos_list, focused_pos) {
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
                const rad1 = (Math.atan2(focused_pos.y - this_pos.y, this_pos.x1 - focused_pos.x1) + deg_360) % deg_360;
                const rad2 = (Math.atan2(focused_pos.y - this_pos.y, this_pos.x2 - focused_pos.x2) + deg_360) % deg_360;
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
        this.util.focus(candidate_pos_list[0].j_elm);
    },

    focus_up() {
        this.focus_dir("up");
    },

    focus_down() {
        this.focus_dir("down");
    },

    focus_left() {
        this.focus_dir("left");
    },

    focus_right() {
        this.focus_dir("right");
    },

    //役割系のロジック
    _role(role) {
        // スキップのトグル
        if (role === "skip" && this.kag.stat.is_skip) {
            this.kag.setSkip(false);
            return;
        }

        // [l][p][s]で待機している状態ではロールを実行しない
        if (!this.util.canShowMenu()) return;

        // スキップの解除
        this.kag.setSkip(false);

        // オートの解除
        if (role !== "auto") this.kag.ftag.startTag("autostop", { next: "false" });

        // セーブ系のロールか
        const is_save = role === "save" || role === "menu" || role === "quicksave" || role === "sleepgame";
        // テキスト追加中、アニメーション中、トランジション中など画面がアクティブに動いている最中か
        const is_active = this.kag.stat.is_adding_text || this.kag.stat.is_wait;
        // 画面がアクティブな状態ではセーブ系のロールは実行できない
        if (is_save && is_active) return;

        switch (role) {
            case "save":
                // メニューがまだ表示されていないときだけ実行
                if ($(".layer_menu").css("display") == "none") {
                    this.kag.menu.displaySave();
                }
                break;

            case "load":
                if ($(".layer_menu").css("display") == "none") {
                    this.kag.menu.displayLoad();
                }
                break;

            case "window":
                this.kag.layer.hideMessageLayers();
                break;

            case "title":
                $.confirm(
                    $.lang("go_title"),
                    () => {
                        location.reload();
                    },
                    () => {
                        return;
                    },
                );
                break;

            case "menu":
                this.kag.menu.showMenu();
                break;

            case "skip":
                this.kag.ftag.startTag("skipstart", {});
                break;

            case "backlog":
                this.kag.menu.displayLog();
                break;

            case "fullscreen":
                this.kag.menu.screenFull();
                break;

            case "quicksave":
                this.kag.menu.setQuickSave();
                break;

            case "quickload":
                this.kag.menu.loadQuickSave();
                break;

            case "auto":
                if (this.kag.stat.is_auto) {
                    this.kag.ftag.startTag("autostop", { next: "false" });
                } else {
                    this.kag.ftag.startTag("autostart", {});
                }
                break;
        }
    },

    vmouse_up(pm) {
        const movement = parseInt(pm.movement) || this.DEFAULT_VMOUSE_MOVEMENT;
        this.vmouse.move(0, -movement, this.keyboard.delay_update);
    },

    vmouse_down(pm) {
        const movement = parseInt(pm.movement) || this.DEFAULT_VMOUSE_MOVEMENT;
        this.vmouse.move(0, movement, this.keyboard.delay_update);
    },

    vmouse_left(pm) {
        const movement = parseInt(pm.movement) || this.DEFAULT_VMOUSE_MOVEMENT;
        this.vmouse.move(-movement, 0, this.keyboard.delay_update);
    },

    vmouse_right(pm) {
        const movement = parseInt(pm.movement) || this.DEFAULT_VMOUSE_MOVEMENT;
        this.vmouse.move(movement, 0, this.keyboard.delay_update);
    },

    vmouse_wheelup() {
        this.vmouse.wheelup();
    },

    vmouse_wheeldown() {
        this.vmouse.wheeldown();
    },

    /**
     * ユーティリティ
     */
    util: {
        parent: null,
        kag: null,

        /**
         * イベントレイヤをクリックできる状態なら true を返す
         * イベントレイヤが表示されていて、かつ、メニューが表示されていない状態
         * @returns {boolean}
         */
        canClick() {
            const is_event_layer_displayed = $(".layer_event_click").css("display") !== "none";
            if (is_event_layer_displayed && !this.isOpenMenu()) {
                return true;
            }
            return false;
        },

        /**
         * 画面をクリックしたときにスキップやオートモードを解除するためのメソッド
         * コンフィグも参照する
         */
        clearSkip() {
            // スキップの解除（[s]で待機している最中は解除しない）
            if (this.kag.stat.is_skip && !this.kag.stat.is_strong_stop) {
                this.kag.setSkip(false);
                return;
            }

            // オートモードの解除（「クリックでオートモード解除」のコンフィグが有効な場合のみ）
            if (this.kag.stat.is_auto && this.kag.config.autoClickStop === "true") {
                this.kag.ftag.startTag("autostop", { next: "false" });
            }
        },

        /**
         * メニューを開ける状況（[text][l][p][s]のいずれかで待機している状態）なら true を返す
         * [text]待機中、つまり文字が流れている最中も true が返る点に注意
         * @returns {boolean}
         */
        canShowMenu() {
            // [l][p][text]待機状態でもなければ[s][wait]待機状態でもない場合
            // なんらかのタグが進行中ということだからメニューは開けない
            if (this.kag.layer.layer_event.css("display") === "none" && !this.kag.stat.is_strong_stop) {
                return false;
            }

            // [wait]中も開けない
            if (this.kag.stat.is_wait == true) {
                return false;
            }

            // あとは開ける
            // つまり、[l][p][s]どれかで待機している状態なら開ける
            return true;
        },

        /**
         * [call]できる状態かどうかを返す
         * メニューを開ける状況で、かつ、テキスト追加中などのアクティブな状態ではない場合
         * @returns {boolean}
         */
        canJumpScenario() {
            const can_show_menu = this.canShowMenu();
            const is_game_active = this.kag.stat.is_adding_text || this.kag.stat.is_wait;
            return can_show_menu && !is_game_active;
        },

        /**
         * 有効なホイールイベント名を返す, 環境の違いを吸収する
         * @returns {"wheel" | "mousewheel" | "DOMMouseScroll"}
         */
        getWheelEventType() {
            return "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
        },

        /**
         * いまリモーダルウィンドウが開いているかどうかを返す
         * @returns {boolean}
         */
        isOpenRemodal() {
            return $(".remodal-wrapper").hasClass("remodal-is-opened");
        },

        /**
         * いまメニューが開かれているかどうかを返す
         * @returns {boolean}
         */
        isOpenMenu() {
            return $(".layer_menu").css("display") !== "none";
        },

        /**
         * フォーカスされている要素を探して返す
         * @returns {jQuery}
         */
        findFocused() {
            return $(":focus.keyfocus");
        },

        /**
         * フォーカス可能な要素を探して返す
         * @returns {jQuery}
         */
        findFocusable() {
            let j_buttons;
            if (this.isOpenRemodal()) {
                j_buttons = $(".remodal-wrapper").find("[tabindex].tyrano-focusable");
            } else if (this.isOpenMenu()) {
                j_buttons = $(".layer_menu").find("[tabindex].tyrano-focusable");
            } else {
                j_buttons = $("#tyrano_base [tabindex].tyrano-focusable");
            }
            j_buttons = j_buttons.filter(function () {
                return $(this).css("display") !== "none";
            });
            if (j_buttons.length <= 1) {
                return j_buttons;
            }
            const arr = [];
            j_buttons.each((i, elm) => {
                elm.__i = i;
                elm.__tabindex = parseInt($(elm).attr("tabindex")) || 0;
                arr.push(elm);
            });
            arr.sort((a, b) => {
                if (a.__tabindex < b.__tabindex) return -1;
                else if (a.__tabindex > b.__tabindex) return 1;
                else {
                    return a.__i < b.__i ? -1 : 1;
                }
            });
            const j_buttons_sorted = $(arr);
            return j_buttons_sorted;
        },

        /**
         * 要素をフォーカスする
         * @param {jQuery} j_elm
         */
        focus(j_elm) {
            j_elm.focus().addClass("keyfocus");
        },

        /**
         * 要素のフォーカスを外す
         */
        unfocus() {
            $(":focus").blur().removeClass("keyfocus");
        },

        /**
         * 受け取った jQuery オブジェクトがメニューのクローズボタンであるかどうかを返す
         * @param {jQuery} j_elm
         * @returns {boolean}
         */
        isCloseButton(j_elm) {
            return j_elm.hasClass("menu_close");
        },

        /**
         * 『固定時間』で指定要素をアニメーション付きで縦スクロールする
         * @param {Element} elm
         * @param {number} change_in_scroll_top 相対的な縦スクロール量
         * @param {number} [duration=500] 変化時間(ミリ秒)
         * @param {string} [easing="easeOutQuint"] イージング
         */
        smoothScrollWithFixedDuration(elm, change_in_scroll_top, duration = 500, easing = "easeOutQuint") {
            // アニメーション前の最初の scrollTop
            const beginning_scroll_top = elm.scrollTop;

            // イージング名の補正
            if (easing === "linear") easing = "_linear";

            // すでに駆動しているスクロールアニメーションがあるなら解除
            if (elm.__scroll) {
                cancelAnimationFrame(elm.__scroll.timer);
                delete elm.__scroll;
            }

            // 要素の __scroll 領域に情報をセット
            elm.__scroll = {
                type: "fixed_time",
                timer: null,
                beginning_time: null,
            };

            // アニメーションのループ関数
            const scroll_loop = (time) => {
                // アニメーション開始から何ミリ秒が経過したか
                // フレームベースではなく時間ベースでアニメ―ションを計算することでリフレッシュレートの影響を防ぐ
                let current_time;
                if (elm.__scroll.beginning_time === null) {
                    current_time = 0;
                    elm.__scroll.beginning_time = time;
                } else {
                    current_time = time - elm.__scroll.beginning_time;
                }

                // アニメーションの終了時刻を迎えたかどうか
                if (current_time < duration) {
                    // まだアニメーションの終了予定時刻を迎えていない
                    // jQuery.easing を借りてイージングを計算, スクロール, 次回の予約
                    const current_scroll_top = $.easing[easing](null, current_time, beginning_scroll_top, change_in_scroll_top, duration);
                    elm.scrollTo(0, current_scroll_top);
                    elm.__scroll.timer = requestAnimationFrame(scroll_loop);
                } else {
                    // もうアニメーションの終了予定時刻を迎えた
                    elm.scrollTo(0, beginning_scroll_top + change_in_scroll_top);
                    delete elm.__scroll;
                    return;
                }
            };

            // ループの初回実行
            elm.__scroll.timer = requestAnimationFrame(scroll_loop);
        },

        /**
         * 『固定速度』で指定要素をアニメーション付きで縦スクロールする
         * @param {Element} elm
         * @param {number} change_in_scroll_top 相対的な縦スクロール量
         * @param {boolean} afterglow_needs 余韻を付けるかどうか
         */
        smoothScrollWithFixedSpeed(elm, change_in_scroll_top, afterglow_needs = true) {
            // 1 秒間の最大スクロール量(px)
            const max_volume_per_second = 1000;
            // 1 フレームの最大スクロール量(px) ※リフレッシュレートも考慮する
            const max_volume_per_frame = max_volume_per_second / (window.refreshRate || 60);
            // スクロール量を符号と絶対値に分離
            const y_sign = Math.sign(change_in_scroll_top);
            const y_abs = Math.abs(change_in_scroll_top);

            // スクロールアニメーションが駆動中の場合
            if (elm.__scroll) {
                if (elm.__scroll.type === "fixed_time" || elm.__scroll.sign !== y_sign) {
                    // 固定時間スクロール、もしくは逆向き固定速度スクロールが駆動中なら止める
                    cancelAnimationFrame(elm.__scroll.timer);
                    delete elm.__scroll;
                } else {
                    // 同一方向の固定速度スクロールが駆動中なら「残りスクロール量」を増加させて帰る
                    elm.__scroll.is_afterglow = false;
                    elm.__scroll.afterglow = max_volume_per_frame;
                    elm.__scroll.remaining += y_abs;
                    return;
                }
            }

            // 初期化
            elm.__scroll = {
                type: "fixed_speed",
                timer: null,
                active: true,
                sign: y_sign,
                remaining: y_abs,
                is_afterglow: false,
                afterglow: max_volume_per_frame,
            };

            // ループ関数
            const scroll_loop = () => {
                if (!elm.__scroll.is_afterglow) {
                    const volume = Math.min(elm.__scroll.remaining, max_volume_per_frame);
                    elm.scrollBy(0, elm.__scroll.sign * volume);
                    elm.__scroll.remaining -= volume;
                    if (elm.__scroll.remaining <= 0) {
                        elm.__scroll.is_afterglow = true;
                        if (!afterglow_needs) {
                            delete elm.__scroll;
                            return;
                        }
                    }
                } else {
                    elm.scrollBy(0, elm.__scroll.sign * elm.__scroll.afterglow);
                    elm.__scroll.afterglow *= 0.7;
                    if (elm.__scroll.afterglow < 0.1) {
                        delete elm.__scroll;
                        return;
                    }
                }
                elm.__scroll.timer = requestAnimationFrame(scroll_loop);
            };

            // ループの初回実行
            scroll_loop();
        },

        /**
         * ミリ秒単位のタイムスタンプを返す
         * @returns {number}
         */
        getTime() {
            return performance.now();
        },
    },

    /**
     * キーボードマネージャ
     */
    keyboard: {
        parent: null,
        state_map: {},
        tick_rate: 0,
        delay_update: 0,

        /**
         * 初期化
         * @param {Object} that TYRANO.kag.key_mouse
         */
        init(that) {
            this.parent = that;

            // チックレートからアップデート間隔を計算
            this.tick_rate = that.KEYBOARD_TICK_RATE;
            if (this.tick_rate > 0) {
                this.delay_update = (1000 / this.tick_rate) | 0;
            }

            // Windowsキーに割り当てられているロールを破棄する
            if ($.getOS() === "win") {
                delete that.map_key["91"];
                delete that.map_key["Meta"];
            }

            //
            // キーダウン
            //

            $(document).keydown((e) => {
                const state = this.getKeyState(e.key);
                if (state.pressing) {
                    // 長押しによる連続入力は無視する
                    return that.keyconfig.system_key_event !== "false";
                } else {
                    // 新規キーダウン
                    state.pressing = true;
                    state.hold_frame = 0;
                    state.event = e.originalEvent;
                    if (this.tick_rate > 0) {
                        clearTimeout(state.timer_id);
                        state.timer_id = setTimeout(() => {
                            this.incrementHoldFrame(state);
                        }, this.delay_update);
                    }
                }

                // ブラウザの音声の再生制限を解除
                if (!that.kag.tmp.ready_audio) that.kag.readyAudio();

                // ティラノイベント"keydown"を発火
                that.kag.trigger("keydown", e);

                // すでに別のキーが押されているときはキーコンフィグは反応させない
                if (that.is_keydown) {
                    if (that.keyconfig.system_key_event === "false") {
                        // jQuery のイベントリスナ内で false を返すと
                        // 自動的に event.stopPropagation() および event.preventDefault() が呼び出される
                        // この event.preventDefault() によってブラウザ固有の動作がキャンセルされる
                        return false;
                    } else {
                        // どちらにしろキーコンフィグは無効
                        return true;
                    }
                }

                const action = this.getAction(e);
                const done = that.doAction(action, e);

                // デフォルトの動作を無効化
                if (done) {
                    return false;
                }

                if (that.keyconfig.system_key_event === "false") {
                    return false;
                }
            });

            //
            // キーアップ
            //

            $(document).keyup((e) => {
                const state = this.getKeyState(e.key);
                state.pressing = false;
                state.hold_frame = 0;
                clearTimeout(state.timer_id);

                const action = this.getAction(e);

                if (typeof action === "string") {
                    const { name, pm } = that.kag.parser.makeTag(action, 0);
                    if (name === "holdskip") {
                        that.kag.setSkip(false);
                    }
                    // いま離したキーに"スキップ"アクションが割り当てられているならスキップ解除
                    // スキップキーを押している(ホールド)間だけスキップできるようにする
                    if (action === "holdskip") {
                        that.kag.setSkip(false);
                    }
                    if (name === "next") {
                        if (that.vmouse.is_visible) {
                            that.vmouse.leftup();
                            return;
                        }
                    }
                }
            });

            //
            // キーホールド
            //

            $(document).on("keyhold", (e) => {
                const state = this.getKeyState(e.key);
                const action = this.getAction(e);
                if (typeof action === "string") {
                    const tag = that.kag.parser.makeTag(action, 0);

                    // ホールドフラグが立っていないなら無視
                    if (tag.pm["-h"] === undefined) return;

                    // ホールド連打(長押しを一定間隔の連打として解釈する)を判定する
                    //
                    //  ホールド連打が始まるまでの間 が delay
                    //  ┌────┐
                    // ダッ…………ダダダダダダダダダダダダ！
                    //          └┘
                    // 　　　　　　この連打間隔が interval
                    const delay_ms = tag.pm.delay ? parseInt(tag.pm.delay) : that.HOLD_MASH_DELAY;
                    const interval_ms = tag.pm.interval ? parseInt(tag.pm.interval) : that.HOLD_MASH_INTERVAL;
                    const delay_f = Math.ceil(delay_ms / this.delay_update);
                    const interval_f = Math.ceil(interval_ms / this.delay_update);
                    const f = state.hold_frame - delay_f;
                    if (f > 0 && f % interval_f === 0) {
                        that.doAction(tag, e);
                    }
                }
            });
        },

        /**
         * キーボードイベントを受け取って対応するアクションを返す
         * @param {KeyboradEvent} e
         * @returns
         */
        getAction(e) {
            return this.parent.map_key[e.key] || this.parent.map_key[e.keyCode];
        },

        /**
         * e.key を受け取ってキーボードステートを返す
         * 存在しなければ初期化もする
         * @param {string} key KeyboardEvent.key
         * @returns
         */
        getKeyState(key) {
            let state = this.state_map[key];
            if (!state) {
                state = this.state_map[key] = new this.KeyState(key);
            }
            return state;
        },

        /**
         * キーの入力状態（押されているか、何フレーム長押しされているか等）を管理するクラス
         * @param {string} key KeyboardEvent.key
         * @returns {KeyState}
         */
        KeyState: function (key) {
            this.key = key;
            this.pressing = false;
            this.hold_frame = 0;
            this.timer_id = null;
            this.event = null;
            return this;
        },

        /**
         * 長押しの処理（長押しフレームの増加とカスタムイベント keyhold の発行）
         * @param {KeyState} state
         */
        incrementHoldFrame(state) {
            state.hold_frame++;
            const event = new KeyboardEvent("keyhold", state.event);
            document.dispatchEvent(event);
            state.timer_id = setTimeout(() => {
                this.incrementHoldFrame(state);
            }, this.delay_update);
        },
    },

    /**
     * 仮想マウスカーソルマネージャ
     */
    vmouse: {
        parent: null, // TYRANO.kag.key_mouse
        is_initialized: false, // 初期化済みか
        j_html: null, // $("html")
        j_body: null, // $("body")
        j_cursor: null, // $("<img />") 仮想マウスカーソルの jQuery オブジェクト
        x: 0, // 仮想マウスカーソルの x 座標
        y: 0, // 仮想マウスカーソルの y 座標
        hotspot_x: 0, // 仮想マウスカーソルのホットスポット(マウスカーソルの画像素材のうち"カーソルの座標"として扱う一点)の x 座標
        hotspot_y: 0, //　仮想マウスカーソルのホットスポットの y 座標
        state: "none", // 仮想マウスカーソルの状態: たとえば "default", "pointer", "none", ...
        point_elm: null, // 仮想マウスカーソルが指している最前面の一要素, document.elementFromPoint() で更新する
        point_tree: [], // 仮想マウスカーソルが指している要素ツリー, <html> まで遡る
        down_elms: [], // 仮想マウスボタンを押下したときの要素を記憶しておく用, ボタンの種類ごとに分けて記憶するために配列にする
        is_visible: false, // いまカーソルが表示されているかどうか
        is_scrolling: false, // いまスクロールボタンを押下している最中か
        scroll_ratio: 1, // カーソルの移動量と要素のスクロール用の比
        screen: {}, // ゲーム画面の情報格納, 画面サイズが変わるたびにアップデート
        previous_click_time: 0, // 前回クリック時のタイムスタンプ, ダブルクリックの判定に使用
        max_delay_double_click: 500, // 前回クリックからこの時間(msec)以上の間隔が空いたクリックはダブルクリックとみなさない
        delya_hide_last_move: 3000, // 前回マウス移動時からこの時間(msec)以上の時間が経過するとマウスカーソルを非表示にする
        is_auto_hidden_enabled: true, // …という機能を有効にするかどうか
        hidden_timer_id: null, // マウスカーソル非表示処理の setTimeout の戻り値管理用
        transition_duration: 50, // 画面上のカーソル移動のトランジション所要時間
        fade_duration: 100, // 画面上のカーソルのフェードイン・アウトの所要時間
        tick_rate: 0, // 1 秒間に何回カーソルの状態をアップデートするか
        delay_update: null, // …という数値から、何ミリ秒に 1 回アップデートすればよいかを計算する
        default_image_map: {
            none: {
                image_url: "./tyrano/images/system/transparent.png",
                hotspot_x: 0,
                hotspot_y: 0,
            },
            default: {
                image_url: "./tyrano/images/system/cursor_default.png",
                hotspot_x: 0,
                hotspot_y: 0,
            },
            pointer: {
                image_url: "./tyrano/images/system/cursor_pointer.png",
                hotspot_x: 0,
                hotspot_y: 0,
            },
        },
        image_map: {},

        /**
         * 初期化
         * @param {Object} parent TYRANO.kag.key_mouse
         */
        init(parent) {
            if (this.is_initialized) return;
            this.is_initialized = true;
            this.parent = parent;
            this.j_html = $("html");
            this.j_body = $("body");
            this.j_cursor = $('<img id="vmouse" src="./tyrano/images/system/transparent.png" />');
            this.j_body.append(this.j_cursor);
            this.tick_rate = parent.VMOUSE_TICK_RATE;
            if (this.tick_rate > 0) {
                this.delay_update = (1000 / this.tick_rate) | 0;
            }
            $.extend(true, this.image_map, this.default_image_map);

            // 画面リサイズ時に情報を更新する
            parent.kag.on("resize", () => {
                const info = parent.kag.tmp.screen_info;
                const scale_x = info.scale_x;
                const scale_y = info.scale_y;
                const x = (info.viewport_width / 2) | 0;
                const y = (info.viewport_height / 2) | 0;
                const top = info.top | 0;
                const bottom = info.bottom | 0;
                const left = info.left | 0;
                const right = info.right | 0;
                const viewport_width = info.viewport_width | 0;
                const viewport_height = info.viewport_height | 0;
                const radius = (1.1 * (Math.sqrt(Math.pow(info.width, 2) + Math.pow(info.height, 2)) / 2)) | 0;
                Object.assign(this.screen, {
                    scale_x,
                    scale_y,
                    x,
                    y,
                    top,
                    bottom,
                    left,
                    right,
                    viewport_width,
                    viewport_height,
                    radius,
                });
            });
            parent.kag.once("resize", () => {
                this.x = this.screen.x;
                this.y = this.screen.y;
                this.refreshTransform();
                // テスト: ぐるぐる回す
                // let radius = 0;
                // let radian = 0;
                // setInterval(() => {
                //     radius += 1;
                //     radian += 0.1;
                //     const dx = radius * Math.cos(radian);
                //     const dy = radius * Math.sin(radian);
                //     this.place(this.screen.x + dx, this.screen.y + dy);
                // }, 16);
            });
        },

        /**
         * カーソル画像を登録する
         * @param {string} type
         * @param {string} image_url
         * @param {number} hotspot_x
         * @param {number} hotspot_y
         */
        addImage(type, image_url, hotspot_x, hotspot_y) {
            hotspot_x = parseInt(hotspot_x) || 0;
            hotspot_y = parseInt(hotspot_y) || 0;
            if (!image_url) {
                const options = this.default_image_map[type] || this.default_image_map.default;
                image_url = options.image_url;
                if (!hotspot_x) hotspot_x = options.hotspot_x;
                if (!hotspot_y) hotspot_y = options.hotspot_y;
            }
            this.image_map[type] = { image_url, hotspot_x, hotspot_y };
        },

        /**
         *　仮想マウスカーソルを表示する
         */
        show() {
            if (!this.is_visible) {
                this.is_visible = true;
                //this.j_cursor.css("visibility", "visible");
                this.j_cursor.css("opacity", "1");
                this.j_html.addClass("vmouse-displayed");
                if (this.tick_rate > 0) {
                    this.delay_update = (1000 / this.tick_rate) | 0;
                    this.updateLoop();
                }
            }
        },

        /**
         * 仮想マウスカーソルを非表示にする
         */
        hide() {
            if (this.is_visible) {
                this.is_visible = false;
                //this.j_cursor.css("visibility", "hidden");
                this.j_cursor.css("opacity", "0");
                this.j_html.removeClass("vmouse-displayed");
            }
        },

        /**
         * なんらかのボタンを押しているかどうか
         */
        isAnyDown() {
            for (const item of this.down_elms) {
                if (item) {
                    return true;
                }
            }
            return false;
        },

        /**
         * 一定時間後にマウスカーソルを非表示にする処理を予約する
         * まだ実行されていない前回の予約は破棄される
         */
        hideWithTimeout() {
            clearTimeout(this.hidden_timer_id);
            this.hidden_timer_id = setTimeout(() => {
                if (this.isAnyDown()) {
                    this.hideWithTimeout();
                } else {
                    this.hide();
                }
            }, this.delya_hide_last_move);
        },

        /**
         * 仮想マウスカーソルの状態を更新するループ処理
         * もし仮想マウスカーソルの位置がまったく変わらなかったとしても
         * DOMが変遷していくことによって「いま仮想マウスカーソルが指している要素」が変わりうるため
         * 一定間隔でカーソルの状態を更新していくことが望ましい
         */
        updateLoop() {
            // マウスが非表示になった場合は無効化してループを打ち切る
            if (!this.is_visible) return;

            // ポイント要素とカーソル状態の更新
            this.scanPointElement();
            this.scanState();

            // 次回ループ
            setTimeout(() => {
                this.updateLoop();
            }, this.delay_update);
        },

        /**
         * 任意のイベントにマウスイベントを発生させる
         * - Event, MouseEvent, WheelEvent, などのコンストラクタと dispatchEvent メソッドを活用する
         * - mouse 系のイベントがトリガーされたときはついでに pointer 系のイベントもトリガーする
         * - click がトリガーされたときはタイムスタンプを取得しておき前回との差分次第で dblclick をトリガーする
         * @param {string} event_type 発生させるイベントのタイプ
         * @param {Element} elm イベントを発生させる要素
         * @param {Object} options イベント変数に取り付ける情報
         */
        trigger(event_type, elm, options = {}) {
            // elm が未指定ならポイント要素から取ってくる, それでも要素が取れないならおわり
            if (!elm) elm = this.point_elm;
            if (!elm) return;

            // 最適なイベントコンストラクタを取得, 取得できなければおわり
            const AnyConstructor = this.getEventConstructor(event_type);
            if (!AnyConstructor) return;

            // イベント生成用のオプションを作成
            // - イベントのバブリング(bubbles)を明示的に有効化する。
            // - バブリングというのは下図のようにイベントがDOMを遡って伝搬していくこと。
            //   <body> ←┐ 親要素にもクリックイベント発生
            //     <div.tyrano_base> ←┐ 親要素にもクリックイベント発生
            //        <div.layer_click_event> ここでクリックイベント発生
            // - イベントをキャンセル可能(cancelable)にする。(e.preventDefault()できるようになる)
            const event_options = Object.assign(
                {
                    pageX: this.x,
                    pageY: this.y,
                    bubbles: true,
                    cancelable: true,
                },
                options,
            );

            // イベントを作成して適用
            elm.dispatchEvent(new AnyConstructor(event_type, event_options));

            // mouse 系のイベントの場合は pointer 系のイベントもついでにトリガーする
            // (例) mousemove → pointermove
            if (event_type.includes("mouse") && PointerEvent) {
                const p_event_type = event_type.replace("mouse", "pointer");
                elm.dispatchEvent(new PointerEvent(p_event_type, event_options));
            }

            // click の場合はダブルクリックかどうかも確認する
            if (event_type === "click") {
                const time = this.parent.util.getTime();
                const delay = time - this.previous_click_time;
                if (delay < this.max_delay_double_click) {
                    elm.dispatchEvent(new MouseEvent("dblclick", event_options));
                }
                this.previous_click_time = time;
            }

            // 一定時間後にカーソルを非表示にする
            if (this.is_auto_hidden_enabled) {
                this.hideWithTimeout();
            }
        },

        /**
         * あるイベントタイプに対応する最適なイベントコンストラクタを返す
         * @param {string} event_type
         * @returns {Event|WheelEvent|MouseEvent}
         */
        getEventConstructor(event_type) {
            let constructor = Event;
            const lower = event_type.toLowerCase();
            if (WheelEvent && lower.includes("wheel")) {
                constructor = WheelEvent;
            } else if (MouseEvent && (lower.includes("mouse") || lower.includes("click") || lower === "contextmenu")) {
                constructor = MouseEvent;
            }
            return constructor;
        },

        /**
         * 仮想マウスカーソルの座標プロパティを変更して実際の見た目も更新する
         * @param {number} x
         * @param {number} y
         */
        setXY(x, y) {
            this.x = x;
            this.y = y;
            this.refreshTransform();
        },

        /**
         * 仮想マウスカーソル座標移動にかけるトランジション時間を変更する
         * @param {number} duration
         */
        setTransitionDuration(duration) {
            if (typeof duration === "number" && duration !== this.transition_duration) {
                this.j_cursor.css("transition", `transform ${duration}ms linear, opacity ${this.fade_duration}ms linear`);
                this.j_cursor.get(0).offsetHeight; // transition-duration の強制同期反映
                this.transition_duration = duration;
            }
        },

        /**
         * 仮想マウスカーソルの見た目の位置(CSS の transform プロパティ)を更新する
         */
        refreshTransform() {
            this.j_cursor.css({
                transform: `translateX(${this.x}px) translateY(${this.y}px)`,
            });
        },

        /**
         * 仮想マウスカーソルの hotspot を見た目に適用する
         */
        refreshHotspot() {
            this.j_cursor.css({
                marginLeft: `${-this.hotspot_x}px`,
                marginTop: `${-this.hotspot_y}px`,
            });
        },

        /**
         * ある要素の親要素をたどっていき要素ツリーを形成して返す
         * たとえば [ <div>, <body>, <html> ] を返す
         * @param {Element} elm
         * @returns {Element[]}
         */
        getElementTree(elm) {
            const arr = [];
            let next_elm = elm;
            while (next_elm) {
                arr.push(next_elm);
                next_elm = next_elm.parentElement;
            }
            return arr;
        },

        /**
         * 現在のポイント要素を新しく読み取る
         * 単に point_elm プロパティの更新を行うだけでなく、
         * mouseover, mouseout, mouseenter, mouseleave のトリガーも行う
         * @returns {Element | null}
         */
        scanPointElement() {
            const new_elm = document.elementFromPoint(this.x, this.y);
            const old_elm = this.point_elm;

            // ポイント要素の更新がない場合はおわり
            if (new_elm === old_elm) return new_elm;

            // 要素ツリー
            const new_tree = this.getElementTree(new_elm);
            const old_tree = this.point_tree;

            // 先ほどまでの要素ツリーにはなかった要素が新しく登場していたらそれを mouseenter
            new_tree.forEach((elm) => {
                if (!old_tree.includes(elm)) {
                    this.trigger("mouseenter", elm, { bubbles: false });
                    elm.classList.add("hover");
                }
            });

            // 先ほどまでの要素ツリーにあった要素が新しい要素ツリーから消えていればそれを mouseleave
            old_tree.forEach((elm) => {
                if (!new_tree.includes(elm)) {
                    this.trigger("mouseleave", elm, { bubbles: false });
                    elm.classList.remove("hover");
                }
            });

            // 最前面のポイント要素
            if (old_elm) {
                this.trigger("mouseout", old_elm);
            }

            // 新ポイント要素にホバーを入れる処理
            if (new_elm) {
                this.trigger("mouseover", new_elm);
                $(new_elm).addClass("hover");
            }

            this.point_elm = new_elm;
            this.point_tree = new_tree;

            return new_elm;
        },

        /**
         * 現在の仮想マウスカーソルの画像を変更する
         * @param {string} new_state 新しいカーソル状態 ("default", "pointer", "none", ...)
         * @param {boolean} book 予約に留めるかどうか (mousedown 中かどうか)
         */
        setState(new_state, book) {
            // カーソル状態に変化がなければ処理は必要ない
            if (new_state === this.state) return;

            // 予約に留める場合
            if (book) {
                this.book_state = new_state;
                return;
            }

            // クラスや画像の更新
            // this.j_cursor.removeClass(this.state);
            // this.j_cursor.addClass(new_state);
            this.refreshImage(new_state);
            this.state = new_state;

            // 予約は取り消してよい
            this.book_state = null;
        },

        /**
         *　"default", "pointer" などのカーソル状態を受け取り
         * 仮想マウスカーソルの src 属性を更新する
         * @param {string} state カーソル状態, "default", "pointer" など
         */
        refreshImage(state) {
            if (state === "none") {
                this.j_cursor.attr("src", this.default_image_map.none.image_url);
                return;
            }
            let image_url;
            let hotspot_x;
            let hotspot_y;
            if (state.indexOf("url(") === 0) {
                image_url = state.match(/(?<=url\()[^)]+(?=\))/);
                if (image_url) {
                    image_url = image_url[0].replace(/"/g, "").replace(/'/g, "");
                    let hotspot_str = state.match(/(?<=(url\([^)]+\) +))\d+ +\d+/);
                    if (hotspot_str) {
                        const hash = hotspot_str[0].split(" ");
                        hotspot_x = parseInt(hash[0]);
                        hotspot_y = parseInt(hash[hash.length - 1]);
                    } else {
                        hotspot_x = 0;
                        hotspot_y = 0;
                    }
                }
            }
            if (!image_url) {
                const options = state in this.image_map ? this.image_map[state] : this.image_map.default;
                image_url = options.image_url;
                hotspot_x = options.hotspot_x;
                hotspot_y = options.hotspot_y;
            }
            if (this.hotspot_x !== hotspot_x || this.hotspot_y !== hotspot_y) {
                this.hotspot_x = hotspot_x;
                this.hotspot_y = hotspot_y;
                this.refreshHotspot();
            }
            this.j_cursor.attr("src", image_url);
        },

        /**
         * 現在のカーソル位置からの相対座標を指定して仮想マウスカーソルを動かす
         * @param {number} x マウスカーソルの x 座標の移動量（右が正）
         * @param {number} y マウスカーソルの y 座標の移動量（下が正）
         * @param {number} duration 画面上のマウスカーソルの移動にかけるトランジション時間
         */
        move(x, y, duration) {
            this.place(this.x + x, this.y + y, duration);
        },

        /**
         * 仮想マウスカーソルの新しい絶対座標を指定する
         * @param {number} x マウスカーソルの新しい x 座標（右が正, document の左端が 0）
         * @param {number} y マウスカーソルの新しい y 座標（下が正, document の上端が 0）
         * @param {number} duration 画面上のマウスカーソルの移動にかけるトランジション時間
         */
        place(_x, _y, duration = 0) {
            if (!this.screen.viewport_width) return;

            // カーソルを表示
            this.show();

            // カーソルを画面内に収める
            // x = Math.max(0, Math.min(this.screen.viewport_width, _x));
            // y = Math.max(0, Math.min(this.screen.viewport_height, _y));
            const x = Math.max(this.screen.left, Math.min(this.screen.right, _x));
            const y = Math.max(this.screen.top, Math.min(this.screen.bottom, _y));

            // y座標の移動量を計算, スクロールボタンをドラッグ中ならスクロール処理をシミュレートする
            const dy = _y - this.y;
            if (this.is_scrolling) {
                // this.down_elms[0].scrollBy(0, (dy * this.scroll_ratio) | 0);
                this.parent.util.smoothScrollWithFixedDuration(
                    this.down_elms[0],
                    (3 * dy * this.scroll_ratio) / this.screen.scale_y,
                    this.delay_update,
                    "linear",
                );
            }

            // 新しい座標をセット
            this.setTransitionDuration(duration);
            this.setXY(x, y);

            // ポイント要素とカーソル状態の更新
            this.scanPointElement();
            this.scanState();
            this.hideWithTimeout();
        },

        /**
         * 仮想マウスカーソルの状態をスキャンする
         * 仮想マウスカーソルの状態 ＝ 現在のポイント要素の CSS の cursor プロパティの値
         * ただしマウスダウン中はマウスカーソルの状態変化を起こさない
         */
        scanState() {
            // いまポイントしている要素の CSS の cursor プロパティを取得したいのだが
            // vmouse-displayed クラスが <html> に付いたままだと CSS が取れないので一時的に外す
            this.j_html.removeClass("vmouse-displayed");
            const new_state = this.point_elm ? $(this.point_elm).css("cursor") : "auto";
            this.j_html.addClass("vmouse-displayed");
            this.setState(new_state, !!this.down_elms[0]);
        },

        /**
         * 仮想マウスのスクロール操作をシミュレートする
         * @param {number} delta スクロール量 (下が正)
         * @returns
         */
        wheel(delta) {
            if (!this.scanPointElement()) return;

            this.trigger(this.parent.util.getWheelEventType(), this.point_elm, {
                deltaY: delta,
                wheelDelta: -delta,
                wheelDeltaY: -delta,
                detail: delta,
            });

            // ただ wheel イベントを発生させるだけではスクロールは行われないので、手動でスクロールを実行する必要がある
            let scrollable_elm;
            for (const elm of this.point_tree) {
                // offsetWidth : スクロールバーを含む横幅
                // clientWidth : スクロールバーを含まない横幅
                // したがって両者の差分を取ることでスクロールバーの横幅が得られるが
                // インライン要素などでは clientWidth が 0 になる仕様がある点に注意
                if (elm.clientWidth !== 0 && elm.offsetWidth !== elm.clientWidth) {
                    scrollable_elm = elm;
                    break;
                }
            }
            if (scrollable_elm) {
                // scrollable_elm.scrollBy(0, delta);
                this.parent.util.smoothScrollWithFixedSpeed(scrollable_elm, delta, true);
            }
        },

        /**
         * 上スクロールをシミュレートする
         */
        wheelup() {
            this.wheel(-100);
        },

        /**
         * 下スクロールをシミュレートする
         */
        wheeldown() {
            this.wheel(100);
        },

        /**
         * マウスボタンの押下をシミュレートする
         * @param {0|1|2|3|4} type マウスボタンの種類
         *   左ボタン, 中央ボタン(ホイール), 右ボタン, 戻るボタン, 進むボタン
         */
        anydown(type) {
            if (!this.scanPointElement()) return;

            // mousedown をトリガーする
            this.trigger("mousedown", this.point_elm, { button: type });

            // 左ボタン押下の場合はスクロール操作をシミュレートするとともに :active 疑似クラスを再現するために active クラスを取り付ける
            if (type === 0) {
                this.simulateScroll();
                $(this.point_elm).addClass("active");
            }

            this.down_elms[type] = this.point_elm;
        },

        /**
         * 単に mousedown や mouseup をトリガーするだけではスクロールバーの操作が再現できない
         * 頑張ってスクロール操作を再現する
         */
        simulateScroll() {
            const elm = this.point_elm;

            // インライン要素なら帰る
            if (elm.clientWidth === 0) return;

            // スクロールバーの横幅を計算, 横幅がゼロすなわちスクロールバーが存在しないなら帰る
            const scroll_bar_width = elm.offsetWidth - elm.clientWidth;
            if (scroll_bar_width === 0) return;

            // 要素の左上を角を基準とする仮想カーソルの x 座標を計算, スクロールバーよりも左側にあるなら帰る
            const rect = elm.getBoundingClientRect();
            const x = this.x - rect.left;
            const y = this.y - rect.top;
            const offset_x = x / this.screen.scale_x;
            const offset_y = y / this.screen.scale_y;
            if (offset_x <= elm.clientWidth) return;

            // スクロールバー上に仮想カーソルがあることが確定

            // うおおおお！
            const max_scroll_top = elm.scrollHeight - elm.offsetHeight;
            const screen_height_ratio = elm.offsetHeight / elm.scrollHeight;
            const scroll_top_ratio = elm.scrollTop / max_scroll_top;
            const scroll_button_height = elm.offsetHeight * screen_height_ratio;
            const scroll_button_max_top = elm.offsetHeight - scroll_button_height;
            const scroll_button_top = scroll_button_max_top * scroll_top_ratio;
            const scroll_button_bottom = scroll_button_top + scroll_button_height;
            const scroll_ratio = max_scroll_top / scroll_button_max_top;
            this.scroll_ratio = scroll_ratio;

            // 仮想カーソルはスクロールバー上のどこにあるか
            if (offset_y < scroll_button_top) {
                // スクロールボタンよりも上にある
                const dif = scroll_button_top - offset_y;
                const dif_ratio = dif / scroll_button_max_top;
                const should_scroll_coord = (max_scroll_top * dif_ratio) | 0;
                // elm.scrollBy(0, -should_scroll_coord);
                this.parent.util.smoothScrollWithFixedDuration(elm, -should_scroll_coord);
            } else if (offset_y <= scroll_button_bottom) {
                // スクロールボタン上にカーソルがある場合
                this.is_scrolling = true;
            } else {
                // スクロールボタンよりも下にある;
                const dif = offset_y - scroll_button_bottom;
                const dif_ratio = dif / scroll_button_max_top;
                const should_scroll_coord = (max_scroll_top * dif_ratio) | 0;
                // elm.scrollBy(0, should_scroll_coord);
                this.parent.util.smoothScrollWithFixedDuration(elm, should_scroll_coord);
            }
        },

        /**
         * マウスボタンを放す操作をシミュレートする
         * @param {0|1|2|3|4} type マウスボタンの種類
         *   左ボタン, 中央ボタン(ホイール), 右ボタン, 戻るボタン, 進むボタン
         */
        anyup(type) {
            if (!this.scanPointElement()) return;

            // mouseup をトリガーする
            this.trigger("mouseup", this.point_elm, { button: type });

            // 押下を始めたときの要素を確認する
            const down_elm = this.down_elms[type];

            // 押下要素が存在する場合
            if (down_elm) {
                // 左ボタンを放した場合 active クラスを外す
                if (type === 0) {
                    $(down_elm).removeClass("active");
                    this.is_scrolling = false;
                }
                // 押下要素と放した要素が同一の場合はクリックが発生
                if (down_elm === this.point_elm) {
                    if (type === 0) {
                        // 左ボタンの場合は click
                        this.trigger("click", this.point_elm);
                    } else if (type === 2) {
                        // 右ボタンの場合は contextmenu
                        this.trigger("contextmenu", this.point_elm);
                    }
                }
            }

            // マウスダウン中だったせいで変更できなかったカーソル状態の予約が存在する場合はそれを適用する
            if (type === 0 && this.book_state) {
                this.setState(this.book_state, false);
            }

            // 押下要素を忘れる
            this.down_elms[type] = null;
        },

        /**
         * マウスの左ボタン押下をシミュレートする
         */
        leftdown() {
            this.anydown(0);
        },

        /**
         * マウスの中央左ボタン(ホイール)押下をシミュレートする
         */
        centerdown() {
            this.anydown(1);
        },

        /**
         * マウスの右ボタン押下をシミュレートする
         */
        rightdown() {
            this.anydown(2);
        },

        /**
         * マウスの戻るボタン押下をシミュレートする
         */
        prevdown() {
            this.anydown(3);
        },

        /**
         * マウスの進むボタン押下をシミュレートする
         */
        nextdown() {
            this.anydown(4);
        },

        /**
         * マウスの左ボタンを放す操作をシミュレートする
         */
        leftup() {
            this.anyup(0);
        },

        /**
         * マウスの中央左ボタン(ホイール)を放す操作をシミュレートする
         */
        centerup() {
            this.anyup(1);
        },

        /**
         * マウスの右ボタンを放す操作をシミュレートする
         */
        rightup() {
            this.anyup(2);
        },

        /**
         * マウスの戻るボタンを放す操作をシミュレートする
         */
        prevup() {
            this.anyup(3);
        },

        /**
         * マウスの進むボタンを放す操作をシミュレートする
         */
        nextup() {
            this.anyup(4);
        },
    },

    /**
     * ゲームパッドマネージャ
     */
    gamepad: {
        // TYRANO.kag.key_mouse
        parent: null,

        // 前回確認時の Gamepad を格納する配列（Gamepad[]）
        prev_gamepads: [],

        // ゲームパッドが存在するか（true, false）
        gamepad_exests: false,

        // 最後に入力を検知したゲームパッドのインデックス（0, 1, 2, 3）
        last_used_gamepad_index: -1,

        // 最後に"next"アクションを実行したゲームパッドのインデックス（0, 1, 2, 3）
        last_used_next_gamepad_index: -1,

        // スティックを倒した絶対量（0.0～1.0）をX方向・Y方向で分けて合計した値（0.0～2.0）がこれ以下であれば
        // スティックの入力を無視する
        MINIMAM_VALUE_DETECT_AXE: 0.001,

        // スティック入力をデジタルな十字キー入力にパースするとき
        // スティックを倒した絶対量（0.0～1.0）がこの値以上になった瞬間にデジタル入力をトリガーする
        MINIMAM_VALUE_DIGITAL_STICK: 0.5,

        // 何ミリ秒ごとにゲームパッドの入力状態を取得するか(上の値から計算)
        DELAY_UPDATE: null,

        // 1秒でマウスカーソルを何ピクセル動かせるようにするか
        MOVEMENT_VMOUSE_PER_SECOND: 2000,

        // スティックの倒し具合 (0.0～1.0) をカーソルの移動量に変換するレート(上の値から計算)
        MOVEMENT_VMOUSE_RATIO: null,

        // ボタンマッピング
        keymap_lang: {
            // 標準的なボタンマッピング
            // https://w3c.github.io/gamepad/#remapping
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

        presstype: {
            BUTTON: 0,
            STICK_DIGITAL: 1,
        },

        /**
         * 初期化
         */
        init(that) {
            this.parent = that;
            this.TICK_RATE = that.GAMEPAD_TICK_RATE;
            this.DELAY_UPDATE = (1000 / this.TICK_RATE) | 0;
            this.MOVEMENT_VMOUSE_RATIO = (this.MOVEMENT_VMOUSE_PER_SECOND / this.TICK_RATE) | 0;

            //
            // ページを開いてからゲームパッドの入力を最初に検知した瞬間に発火されるイベントリスナ
            //
            // ゲームパッド未使用環境で処理をいたずらに増やさないようにするため、
            // getGamepadInputs（ゲームパッドの入力を一定間隔で検知し続けるメソッド）はこの中で呼ぶようにする
            // * たとえPC自体にゲームパッドがつながっていても、ページを開いてから最初にゲームパッドの入力を検知するまでは
            //   navigator.getGamepads() でゲームパッドの入力状態が取れるようにならない
            // * ひとつのゲームパッドから入力が入った瞬間に
            //   そのときPCに接続されているすべてのゲームパッド分の gamepadconnected が発火する
            // * 一度USBやBluetoothの接続が切れてから再度接続しなおしたときにも発火する
            $(window).on("gamepadconnected", (e) => {
                // console.warn(e.gamepad);
                if (!this.gamepad_exests) {
                    this.gamepad_exests = true;
                    this.getGamepadInputs();
                }
            });

            //
            // ゲームパッドのボタンダウン
            //

            $(document).on("gamepadpressdown", (e) => {
                // ティラノイベント"gamepad-pressdown"を発火
                that.kag.trigger("gamepad-pressdown", e);

                let map;
                if (e.detail.type === this.presstype.BUTTON) {
                    map = that.map_pad.button;
                } else {
                    map = that.map_pad.stick_digital;
                }

                let action = map[e.detail.button_name];
                if (!action && e.detail.button_index >= 0) action = map[e.detail.button_index];

                that.doAction(action, e);
            });

            //
            // ゲームパッドのボタンホールド
            //

            $(document).on("gamepadpresshold", (e) => {
                // ティラノイベント"gamepad-presshold"を発火
                that.kag.trigger("gamepad-presshold", e);

                let map;
                if (e.detail.type === this.presstype.BUTTON) {
                    map = that.map_pad.button;
                } else {
                    map = that.map_pad.stick_digital;
                }

                let action = map[e.detail.button_name];
                if (!action && e.detail.button_index >= 0) action = map[e.detail.button_index];

                if (typeof action === "string") {
                    const tag = that.kag.parser.makeTag(action, 0);

                    // ホールドフラグが立っていないなら無視
                    if (tag.pm["-h"] === undefined) return;

                    const delay = tag.pm.delay ? parseInt(tag.pm.delay) : that.HOLD_MASH_DELAY;
                    const interval = tag.pm.interval ? parseInt(tag.pm.interval) : that.HOLD_MASH_INTERVAL;
                    const delay_f = Math.ceil(delay / this.DELAY_UPDATE);
                    const interval_f = Math.ceil(interval / this.DELAY_UPDATE);
                    const f = e.detail.hold_frame - delay_f;
                    if (f > 0 && f % interval_f === 0) {
                        that.doAction(tag, e);
                    }
                }
            });

            //
            // ゲームパッドのボタンアップ
            //

            $(document).on("gamepadpressup", (e) => {
                // ティラノイベント"gamepad-pressup"を発火
                that.kag.trigger("gamepad-pressup", e);

                let map;
                if (e.detail.type === this.presstype.BUTTON) {
                    map = that.map_pad.button;
                } else {
                    map = that.map_pad.stick_digital;
                }

                let action = map[e.detail.button_name];
                if (!action && e.detail.button_index >= 0) action = map[e.detail.button_index];

                if (typeof action === "string") {
                    const { name, pm } = that.kag.parser.makeTag(action, 0);
                    if (name === "holdskip") {
                        that.kag.setSkip(false);
                    }
                    if (name === "next") {
                        if (that.vmouse.is_visible) {
                            that.vmouse.leftup();
                            return;
                        }
                    }
                }
            });
        },

        /**
         * ゲームパッドの入力状態のスナップショットを確認する
         * 前回確認時の Gamepad と照合して「ボタンが押された瞬間」を検知する
         * イベントの発火なども行う
         */
        getGamepadInputs() {
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

                    //
                    // スティックの入力を検知してデジタル入力に変換
                    //

                    const sticks = [];
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
                        const digital_buttons = [{ pressed: false }, { pressed: false }, { pressed: false }, { pressed: false }];
                        const input_exists = sum > this.MINIMAM_VALUE_DETECT_AXE;
                        stick = {
                            x,
                            y,
                            input_exists,
                            digital_buttons,
                        };
                        if (!input_exists) {
                            Object.assign(stick, {
                                radian: 0,
                                degree: 0,
                                distance: 0,
                            });
                        } else {
                            let radian = Math.atan2(-y, x);
                            if (radian < 0) radian += Math.PI * 2;
                            const degree = radian * (180 / Math.PI);
                            const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                            const radian_rotate = radian + Math.PI / 4;
                            const digital_button_index = Math.floor((2 * radian_rotate) / Math.PI) % 4;
                            const is_over_threshold = distance > this.MINIMAM_VALUE_DIGITAL_STICK;
                            if (is_over_threshold) {
                                digital_buttons[digital_button_index].pressed = true;
                            }
                            Object.assign(stick, {
                                radian,
                                degree,
                                distance,
                            });
                        }
                        sticks.push(stick);
                    }

                    //
                    // 前回の入力状態
                    //

                    let prev_gamepad = this.prev_gamepads[gi];

                    // 前回の入力状態が取れないなら未入力の状態を作成する
                    if (!prev_gamepad) {
                        prev_gamepad = {
                            buttons: [],
                            axes: [],
                            sticks: [],
                        };
                        for (const button of gamepad.buttons) {
                            prev_gamepad.buttons.push({
                                pressed: false,
                            });
                        }
                        for (const axe of gamepad.axes) {
                            prev_gamepad.buttons.push(0);
                        }
                        for (const stick of sticks) {
                            prev_gamepad.sticks.push({
                                digital_buttons: [{ pressed: false }, { pressed: false }, { pressed: false }, { pressed: false }],
                            });
                        }
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
                        let event_type;
                        // 入力状態に変化があったか
                        const is_changed = button.pressed !== prev_button.pressed;
                        // 押された瞬間を検知
                        if (is_changed) {
                            // ★ボタンが押された瞬間か、離された瞬間だ！
                            event_type = button.pressed ? "gamepadpressdown" : "gamepadpressup";
                            button.hold_frame = 0;
                        } else if (button.pressed) {
                            // ★ボタンが押しっぱなしだ！
                            event_type = "gamepadpresshold";
                            button.hold_frame = (prev_button.hold_frame || 0) + 1;
                        }
                        // イベントを発火！
                        if (event_type) {
                            let button_name = "";
                            const lang = this.keymap_lang[gamepad.mapping] || this.keymap_lang.standard;
                            if (lang) {
                                button_name = lang.buttons[bi] || "";
                            }
                            const event = new CustomEvent(event_type, {
                                detail: {
                                    button,
                                    button_name,
                                    button_index: bi,
                                    gamepad,
                                    gamepad_index: gi,
                                    hold_frame: button.hold_frame,
                                    type: this.presstype.BUTTON,
                                },
                            });
                            document.dispatchEvent(event);
                        }
                        if (is_changed) {
                            is_changed_inputs = is_changed;
                        }
                    });

                    //
                    // スティックのデジタル入力
                    //

                    sticks.forEach((stick, si) => {
                        const prev_stick = prev_gamepad.sticks[si];
                        stick.digital_buttons.forEach((button, bi) => {
                            const prev_button = prev_stick.digital_buttons[bi];
                            let event_type;
                            // 入力状態に変化があったか
                            const is_changed = button.pressed !== prev_button.pressed;
                            // 押された瞬間を検知
                            if (is_changed) {
                                // ★ボタンが押された瞬間か、離された瞬間だ！
                                event_type = button.pressed ? "gamepadpressdown" : "gamepadpressup";
                                button.hold_frame = 0;
                            } else if (button.pressed) {
                                // ★ボタンが押しっぱなしだ！
                                event_type = "gamepadpresshold";
                                button.hold_frame = (prev_button.hold_frame || 0) + 1;
                            }
                            // イベントを発火！
                            if (event_type) {
                                button.hold_frame = (prev_button.hold_frame || 0) + 1;
                                const direction = ["RIGHT", "UP", "LEFT", "DOWN"][bi] || "";
                                const stick_name = ["L", "R"][si] || "UNKNOWN";
                                const button_name = `${stick_name}_${direction}`;
                                const event = new CustomEvent(event_type, {
                                    detail: {
                                        button,
                                        button_name,
                                        button_index: -1,
                                        gamepad,
                                        gamepad_index: gi,
                                        hold_frame: button.hold_frame,
                                        type: this.presstype.STICK_DIGITAL,
                                    },
                                });
                                document.dispatchEvent(event);
                            }
                        });
                    });

                    //
                    // スティックによる仮想マウスの操作
                    //

                    let vmouse_moved = false;
                    sticks.forEach((stick, si) => {
                        const name = ["L", "R"][si] || "UNKNOWN";
                        const map = this.parent.map_pad.stick || {};
                        const action = map[name] || map[si] || "";
                        if (action.indexOf("vmouse_move") === 0 && stick.input_exists) {
                            const vmouse = this.parent.vmouse;
                            const ratio_x = (this.MOVEMENT_VMOUSE_RATIO * vmouse.screen.scale_x) | 0;
                            const ratio_y = (this.MOVEMENT_VMOUSE_RATIO * vmouse.screen.scale_y) | 0;
                            const x = ratio_x * stick.x;
                            const y = ratio_y * stick.y;
                            vmouse.move(x, y, this.DELAY_UPDATE);
                            vmouse_moved = true;
                        } else if (action.indexOf("vmouse_aim") === 0 && !vmouse_moved) {
                            const vmouse = this.parent.vmouse;
                            if (Math.abs(stick.x) < this.MINIMAM_VALUE_DETECT_AXE) stick.x = 0;
                            if (Math.abs(stick.y) < this.MINIMAM_VALUE_DETECT_AXE) stick.y = 0;
                            const x = vmouse.screen.x + vmouse.screen.radius * stick.x;
                            const y = vmouse.screen.y + vmouse.screen.radius * stick.y;
                            if (vmouse.x === x && vmouse.y === y) {
                                vmouse.hideWithTimeout();
                            } else {
                                vmouse.place(x, y, this.DELAY_UPDATE);
                            }
                        }
                    });

                    //
                    // 入力検知ここまで
                    //

                    // 入力状態に変化があったならこのゲームパッドを「最後に使われたゲームパッド」に登録する
                    if (is_changed_inputs) {
                        this.last_used_gamepad_index = gamepad.index;
                        used_gamepad_exists = true;
                    }

                    // 今回の Gamepad を次回使えるように格納
                    gamepad.sticks = sticks;
                    this.prev_gamepads[gi] = gamepad;
                });

                // ゲームパッドの確認終わり
                // ゲームパッドが存在する場合にのみ次の入力を取得しにいく
                if (gamepad_exists) {
                    setTimeout(() => {
                        this.getGamepadInputs();
                    }, this.DELAY_UPDATE);
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
        getGamepad(index) {
            if (index === undefined) {
                index = this.last_used_next_gamepad_index;
                if (index < 0) index = this.last_used_gamepad_index;
                if (index < 0) return null;
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
        vibrate(gamepad, power = 1, duration = 500) {
            try {
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
                        weakMagnitude: 0,
                    });
                }
            } catch (error) {
                console.log(error);
            }
        },
    },

    // デフォルトのキーコンフィグ
    default_keyconfig: {
        key: {
            32: "hidemessage",
            13: "next",
            91: "skip",
            17: "skip",
        },
        mouse: {
            right: "hidemessage",
            center: "menu",
            wheel_up: "backlog",
            wheel_down: "next",
        },
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
    },
};
