tyrano.plugin.kag.menu = {
    tyrano: null,
    kag: null,

    snap: null,

    init: function () {},

    getDateStr() {
        const default_format = "yyyy/M/d h:mm:ss";
        const config = this.kag.config["configSaveDateFormat"];
        const format = config ? config : default_format;
        return $.getNowDate(format);
    },

    showMenu: function (call_back) {
        if (this.kag.layer.layer_event.css("display") == "none" && this.kag.stat.is_strong_stop != true) {
            return false;
        }

        //wait中の時
        if (this.kag.stat.is_wait == true) {
            return false;
        }

        var that = this;

        that.kag.unfocus();
        this.kag.setSkip(false);
        this.kag.setAuto(false);
        this.kag.stat.is_auto_wait = false;

        var layer_menu = this.kag.layer.getMenuLayer();

        layer_menu.empty();

        var button_clicked = false;

        this.kag.html(
            "menu",
            {
                novel: $.novel,
            },
            function (html_str) {
                var j_menu = $(html_str);

                layer_menu.append(j_menu);

                layer_menu
                    .find(".menu_skip")
                    .click(function (e) {
                        //スキップを開始する
                        layer_menu.html("");
                        layer_menu.hide();
                        if (that.kag.stat.visible_menu_button == true) {
                            $(".button_menu").show();
                        }
                        //nextOrder にして、
                        that.kag.setSkip(true);

                        ///処理待ち状態の時は、実行してはいけない
                        if (that.kag.layer.layer_event.css("display") == "none") {
                            //alert("今、スキップしない");
                            //that.kag.ftag.nextOrder();
                        } else {
                            //alert("スキップするよ");
                            that.kag.ftag.nextOrder();
                        }

                        e.stopPropagation();
                    })
                    .focusable();

                //戻る機能
                that.setMenuCloseEvent(layer_menu);
                that.setHoverEvent(layer_menu);

                //that.setMenuCloseEvent(layer_menu, { target: "menu_window_close" });

                layer_menu
                    .find(".menu_window_close")
                    .click(function (e) {
                        //ウィンドウ消去
                        that.kag.layer.hideMessageLayers();
                        layer_menu.html("");
                        layer_menu.hide();
                        if (that.kag.stat.visible_menu_button == true) {
                            $(".button_menu").show();
                        }

                        e.stopPropagation();
                    })
                    .focusable();

                layer_menu
                    .find(".menu_save")
                    .click(function (e) {
                        //連続クリック対策
                        if (button_clicked == true) {
                            return;
                        }
                        button_clicked = true;
                        that.kag.makeUnfocusableAll(layer_menu);
                        that.displaySave();
                        e.stopPropagation();
                    })
                    .focusable();

                layer_menu
                    .find(".menu_load")
                    .click(function (e) {
                        //連続クリック対策
                        if (button_clicked == true) {
                            return;
                        }
                        button_clicked = true;
                        that.kag.makeUnfocusableAll(layer_menu);
                        that.displayLoad();
                        e.stopPropagation();
                    })
                    .focusable();

                //タイトルに戻る
                layer_menu
                    .find(".menu_back_title")
                    .click(function () {
                        that.kag.backTitle();
                    })
                    .focusable();

                $.preloadImgCallback(
                    j_menu,
                    function () {
                        layer_menu.stop(true, true).fadeIn(300);
                        $(".button_menu").hide();
                    },
                    that,
                );
            },
        );
    },

    /**
     * セーブ画面を表示する
     * cbだけを指定した場合、セーブ完了時とセーブ画面クローズ時どちらもcbが実行される（互換性の担保）
     * cb_closeを別に指定した場合、セーブ完了時にはcbが、セーブ画面クローズ時にはcb_closeが実行される
     * @param {function} [cb] - セーブ完了時およびセーブ画面クローズ時のコールバック
     * @param {function} [cb_close] - セーブ画面クローズ時のコールバック
     */
    displaySave: function (cb, cb_close) {
        //セーブ画面作成

        var that = this;

        that.kag.unfocus();
        this.kag.setSkip(false);

        var array_save = that.getSaveData();
        var array = array_save.data;
        //セーブデータ配列

        var layer_menu = that.kag.layer.getMenuLayer();

        for (var i = 0; i < array.length; i++) {
            array[i].num = i;

            //旧セーブデータ互換
            //array[i]["title"]=array[i]["title"].replace("<span class='backlog_text '>","").replace('</span>','');
        }

        this.kag.html(
            "save",
            {
                array_save: array,
                novel: $.novel,
            },
            function (html_str) {
                var j_save = $(html_str);
                var layer_menu = that.kag.layer.getMenuLayer();

                //フォントをゲームで指定されているフォントにする。
                j_save.find(".save_list").css("font-family", that.kag.config.userFace);

                j_save.find(".save_display_area").each(function () {
                    $(this)
                        .click(function (e) {
                            var num = $(this).attr("data-num");
                            that.snap = null;
                            that.doSave(num, function (save_data) {
                                var j_slot = layer_menu.find("[data-num='" + num + "']");

                                if (save_data["img_data"] != "") {
                                    if (j_slot.find(".save_list_item_thumb").find("img").get(0)) {
                                        j_slot.find(".save_list_item_thumb").find("img").attr("src", save_data["img_data"]);
                                    } else {
                                        j_slot.find(".save_list_item_thumb").css("background-image", "");
                                        j_slot.find(".save_list_item_thumb").append("<img>");
                                        j_slot.find(".save_list_item_thumb").find("img").attr("src", save_data["img_data"]);
                                    }
                                }

                                j_slot.find(".save_list_item_date").html(save_data["save_date"]);
                                j_slot.find(".save_list_item_text").html(save_data["title"]);

                                if (typeof cb == "function") {
                                    cb();
                                }
                            });
                        })
                        .focusable();
                });

                that.setMenuScrollEvents(j_save, { target: ".area_save_list", move: 160 });

                that.setMenu(j_save, cb_close || cb);
            },
        );
    },

    //セーブを実行する
    doSave: function (num, cb) {
        var array_save = this.getSaveData();

        var data = {};
        var that = this;

        if (this.snap == null) {
            //ここはサムネイルイメージ作成のため、callback指定する
            this.snapSave(this.kag.stat.current_save_str, function () {
                //現在、停止中のステータスなら、[_s]ポジションからセーブデータ取得

                /*
                 if(that.snap.stat.is_strong_stop == true){
                 alert("ここではセーブできません");
                 return false;
                 }
                 */

                data = that.snap;
                data.save_date = that.getDateStr();
                array_save.data[num] = data;
                $.setStorage(that.kag.config.projectID + "_tyrano_data", array_save, that.kag.config.configSave);

                // ティラノイベント"storage-save"を発火
                that.kag.trigger("storage-save");

                if (typeof cb == "function") {
                    //終わったタイミングでコールバックを返す
                    cb(data);
                }
            });
        } else {
            data = that.snap;
            data.save_date = that.getDateStr();
            array_save.data[num] = data;
            $.setStorage(that.kag.config.projectID + "_tyrano_data", array_save, that.kag.config.configSave);

            // ティラノイベント"storage-save"を発火
            that.kag.trigger("storage-save");

            if (typeof cb == "function") {
                //終わったタイミングでコールバックを返す
                cb(data);
            }
        }
    },

    setQuickSave: function () {
        var that = this;

        var saveTitle = that.kag.stat.current_save_str;

        that.kag.menu.snapSave(saveTitle, function () {
            var data = that.snap;
            data.save_date = that.getDateStr();
            $.setStorage(that.kag.config.projectID + "_tyrano_quick_save", data, that.kag.config.configSave);

            // ティラノイベント"storage-quicksave"を発火
            that.kag.trigger("storage-quicksave");

            var layer_menu = that.kag.layer.getMenuLayer();
            layer_menu.hide();
        });
    },

    loadQuickSave: function () {
        var data = $.getStorage(this.kag.config.projectID + "_tyrano_quick_save", this.kag.config.configSave);

        if (data) {
            data = JSON.parse(data);
        } else {
            return false;
        }

        this.loadGameData($.extend(true, {}, data));
    },

    //doSaveSnap 自動セーブのデータを保存する
    doSetAutoSave: function () {
        var data = this.snap;
        data.save_date = this.getDateStr();
        $.setStorage(this.kag.config.projectID + "_tyrano_auto_save", data, this.kag.config.configSave);

        // ティラノイベント"storage-autosave"を発火
        this.kag.trigger("storage-autosave");

        var layer_menu = this.kag.layer.getMenuLayer();
        layer_menu.hide();
    },

    //自動保存のデータを読み込む
    loadAutoSave: function () {
        var data = $.getStorage(this.kag.config.projectID + "_tyrano_auto_save", this.kag.config.configSave);

        if (data) {
            data = JSON.parse(data);
        } else {
            return false;
        }

        this.loadGameData($.extend(true, {}, data), { auto_next: "yes" });
    },
    
    //チェックポイントを登録する
    doSetCheckpoint: function (name) {
    
        var data = this.snap;
        data.save_date = this.getDateStr();
        
        //dataを登録する
        this.kag.stat.checkpoint[name] = $.extend(true, {}, data);
        
        var layer_menu = this.kag.layer.getMenuLayer();
        layer_menu.hide();
        
    },
    
    //チェックポイントの位置にロールバックします
    doRollback: function (name,variable_over,bgm_over) {
        
        var data = this.kag.stat.checkpoint[name];
        
        if (data) {
            data = data; //JSON.parse(data);
        } else {
            return false;
        }
        
        //変数の上書き
        if (variable_over == "true") {
            data.stat.f = this.kag.stat.f;
        }
        
        let options = { is_rollback: true, auto_next: "yes" };
        options.bgm_over = bgm_over;
        
        this.loadGameData($.extend(true, {}, data), options);
        
        return true;
        
    },

    //セーブ状態のスナップを保存します。
    snapSave: function (title, call_back, flag_thumb) {
        // ティラノイベント"snapsave-start"を発火
        this.kag.trigger("snapsave-start");

        var that = this;

        //画面のキャプチャも取るよ
        var _current_order_index = that.kag.ftag.current_order_index - 1;
        var _stat = $.extend(true, {}, $.cloneObject(that.kag.stat));

        //3Dオブジェクトが実装されてる場合復元させる。////////////////////

        var three = this.kag.tmp.three;
        var models = three.models;

        var three_save = {};

        three_save.stat = three.stat;
        three_save.evt = three.evt;

        var save_models = {};

        for (var key in models) {
            var model = models[key];
            save_models[key] = model.toSaveObj();
        }

        three_save.models = save_models;

        /////////////////////////////////////////////////////////////

        // [anim wait="false"]中のセーブ対策
        // アニメーションを強制的に完了させる
        $(".tyrano-anim").each(function () {
            $(this).stop(true, true);
        });

        // [chara_mod wait="false"]中のセーブ対策
        // 表情変更中にセーブが実行された場合は表情変更を強制的に完了させる
        $(".chara-mod-animation").each(function () {
            const j_old = $(this);
            const j_new = j_old.next();
            j_old.remove();
            j_new.stop(true, true);
        });

        if (typeof flag_thumb == "undefined") {
            flag_thumb = this.kag.config.configThumbnail;
        }

        if (flag_thumb == "false") {
            //
            // サムネイルデータを作成しない場合
            //
            var img_code = "";
            var data = {};

            data.title = $(title).text();
            data.stat = _stat;
            data.three = three_save;
            data.current_order_index = _current_order_index;
            //１つ前
            data.save_date = that.getDateStr();
            data.img_data = img_code;

            //レイヤ部分のHTMLを取得
            var layer_obj = that.kag.layer.getLayeyHtml();
            data.layer = layer_obj;

            that.snap = $.extend(true, {}, $.cloneObject(data));

            if (call_back) {
                call_back();

                // ティラノイベント"snapsave-complete"を発火
                that.kag.trigger("snapsave-complete");
            }
        } else {
            var thumb_scale = this.kag.config.configThumbnailScale || 1;
            if (thumb_scale < 0.01) thumb_scale = 0.01;
            if (thumb_scale > 1) thumb_scale = 1;

            $("#tyrano_base").find(".layer_blend_mode").css("display", "none");

            setTimeout(function () {
                //
                // キャプチャ完了時コールバック
                //
                var completeImage = function (img_code) {
                    var data = {};

                    data.title = $(title).text();
                    data.stat = _stat;
                    data.three = three_save;

                    data.current_order_index = _current_order_index;
                    //１つ前
                    data.save_date = that.getDateStr();
                    data.img_data = img_code;

                    //レイヤ部分のHTMLを取得
                    var layer_obj = that.kag.layer.getLayeyHtml();
                    data.layer = layer_obj;

                    that.snap = $.extend(true, {}, $.cloneObject(data));

                    if (call_back) {
                        call_back();

                        // ティラノイベント"snapsave-complete"を発火
                        that.kag.trigger("snapsave-complete");
                    }

                    that.kag.hideLoadingLog();
                };

                if (that.kag.stat.save_img != "") {
                    //
                    // サムネイルに使う画像が[save_img]タグで直接指定されている場合
                    //

                    var img = new Image();
                    img.src = _stat.save_img;
                    img.onload = function () {
                        var canvas = document.createElement("canvas");
                        canvas.width = that.kag.config.scWidth * thumb_scale;
                        canvas.height = that.kag.config.scHeight * thumb_scale;
                        // Draw Image
                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        // To Base64
                        var img_code = that.createImgCode(canvas);

                        completeImage(img_code);
                    };
                } else {
                    //
                    // html2canvas.jsでゲーム画面のキャプチャを実行する場合
                    //

                    that.kag.showLoadingLog("save");

                    //ビデオをキャプチャするための仕組み
                    let canvas = document.createElement("canvas"); // declare a canvas element in your html
                    let ctx = canvas.getContext("2d");
                    let videos = document.querySelectorAll("video");
                    let w, h;
                    for (let i = 0, len = videos.length; i < len; i++) {
                        const v = videos[i];
                        //if (!v.src) continue // no video here
                        try {
                            w = v.videoWidth;
                            h = v.videoHeight;

                            canvas.style.left = v.style.left;
                            canvas.style.top = v.style.top;

                            canvas.style.width = v.style.width;
                            canvas.style.height = v.style.height;

                            canvas.width = w;
                            canvas.height = h;

                            ctx.fillRect(0, 0, w, h);
                            ctx.drawImage(v, 0, 0, w, h);
                            v.style.backgroundImage = `url(${canvas.toDataURL()})`; // here is the magic
                            v.style.backgroundSize = "cover";
                            v.classList.add("tmp_video_canvas");

                            ctx.clearRect(0, 0, w, h); // clean the canvas
                        } catch (e) {
                            continue;
                        }
                    }

                    //canvasがある場合は、オリジナルをクローン。画面サイズによっては、カクつく問題が残る
                    var flag_canvas = false;
                    var array_canvas = [];
                    $("#tyrano_base")
                        .find("canvas")
                        .each(function (index, element) {
                            array_canvas.push(element);
                        });
                    if (array_canvas.length > 0) {
                        flag_canvas = true;
                    }

                    var tmp_base;

                    //canvasがある場合。
                    if (flag_canvas) {
                        tmp_base = $("#tyrano_base");
                    } else {
                        tmp_base = $("#tyrano_base").clone();
                        tmp_base.addClass("snap_tmp_base");
                        $("body").append(tmp_base);
                    }

                    var tmp_left = tmp_base.css("left");
                    var tmp_top = tmp_base.css("top");
                    var tmp_trans = tmp_base.css("transform");

                    tmp_base.css("left", 0);
                    tmp_base.css("top", 0);
                    tmp_base.css("transform", "");
                    tmp_base.find(".layer_menu").hide();

                    var opt = {
                        scale: thumb_scale,
                        height: that.kag.config.scHeight,
                        width: that.kag.config.scWidth,
                        logging: that.kag.config["debugMenu.visible"] === "true",
                    };

                    html2canvas(tmp_base.get(0), opt).then(function (canvas) {
                        $("#tyrano_base").find(".layer_blend_mode").css("display", "");
                        $("#tyrano_base").find(".tmp_video_canvas").css("backgroundImage", "");

                        // キャプチャした画像をDOMに追加してクオリティチェック
                        // コメントトグル:  ⌘ + /  または  Ctrl + /
                        // $("body").css({
                        //     overflow: "scroll",
                        // });
                        // $(canvas)
                        //     .css({
                        //         position: "absolute",
                        //         top: $.getViewPort().height,
                        //     })
                        //     .appendTo("body");
                        // console.log(canvas)
                        var img_code = that.createImgCode(canvas);

                        completeImage(img_code);
                    });

                    tmp_base.hide();

                    tmp_base.css("left", tmp_left);
                    tmp_base.css("top", tmp_top);
                    tmp_base.css("transform", tmp_trans);
                    tmp_base.find(".layer_menu").show();
                    $("body").find(".snap_tmp_base").remove();

                    tmp_base.show();
                }
            }, 20);
        }
    },

    //サムネ画像の作成　thanks @hororo_memocho
    createImgCode: function (canvas) {
        var code = "";

        var q = this.kag.config.configThumbnailQuality;

        if (q == "low") {
            code = canvas.toDataURL("image/jpeg", 0.3);
        } else if (q == "middle") {
            code = canvas.toDataURL("image/jpeg", 0.7);
        } else {
            code = canvas.toDataURL();
        }

        return code;
    },

    setGameSleep: function (next_flag) {
        //awake時にnextOrderするか否か
        if (next_flag) {
            this.kag.tmp.sleep_game_next = true;
        } else {
            this.kag.tmp.sleep_game_next = false;
        }

        this.kag.tmp.sleep_game = this.snap;
    },

    displayLoad: function (cb) {
        var that = this;

        this.kag.unfocus();
        this.kag.setSkip(false);

        var array_save = that.getSaveData();
        var array = array_save.data;
        //セーブデータ配列

        var layer_menu = that.kag.layer.getMenuLayer();

        for (var i = 0; i < array.length; i++) {
            array[i].num = i;
        }

        this.kag.html(
            "load",
            {
                array_save: array,
                novel: $.novel,
            },
            function (html_str) {
                var j_save = $(html_str);

                j_save.find(".save_list").css("font-family", that.kag.config.userFace);

                j_save.find(".save_display_area").each(function () {
                    $(this)
                        .click(function (e) {
                            var num = $(this).attr("data-num");

                            //セーブデータが存在しない場合
                            if (array[num]["save_date"] == "") {
                                return;
                            }

                            that.snap = null;
                            that.loadGame(num);

                            var layer_menu = that.kag.layer.getMenuLayer();
                            layer_menu.hide();
                            layer_menu.empty();
                            if (that.kag.stat.visible_menu_button == true) {
                                $(".button_menu").show();
                            }
                        })
                        .focusable();
                });
                that.setMenuScrollEvents(j_save, { target: ".area_save_list", move: 160 });
                that.setMenu(j_save, cb);
            },
        );
    },

    /**
     * クローズボタンにイベントリスナを取り付ける
     * @param {jQuery} j_parent
     * @param {Object} options
     */
    setMenuCloseEvent: function (j_parent, options = {}) {
        const j_menu = this.kag.layer.getMenuLayer();
        const target_selector = options.target || ".menu_close";
        j_parent
            .find(target_selector)
            .click((e) => {
                j_menu.fadeOut(300, () => {
                    j_menu.empty();
                    if (typeof options.callback == "function") {
                        options.callback();
                    }
                });
                if (this.kag.stat.visible_menu_button == true) {
                    $(".button_menu").show();
                }
                e.stopPropagation();
            })
            .focusable();
    },

    //こ・ぱんださんのプラグイン対応。下位互換性の確保
    setHoverEvent: function (j_parent, options = {}) {
        if (j_parent.html().indexOf('$(".menu_item").hover') == -1 && j_parent.html().indexOf('$(".menu_close").hover') == -1) {
            return false;
        }
        j_parent.find(".menu_item").off("mouseenter mouseleave");
        j_parent.find(".menu_item img").off("mouseenter mouseleave");

        j_parent.find(".menu_item img").each((i, elm) => {
            const j_elm = $(elm);
            const original_src = j_elm.attr("src");
            const hover_src = original_src.replace(".png", "2.png");
            j_elm.hover(
                () => {
                    j_elm.attr("src", hover_src);
                },
                () => {
                    j_elm.attr("src", original_src);
                },
            );
        });
    },

    /**
     * スクロールボタンにイベントリスナを取り付けて
     * PCなら非表示に、スマホなら表示する処理を行う
     * @param {jQuery} j_parent
     * @param {Object} options
     */
    setMenuScrollEvents: function (j_parent, options = {}) {
        const scroll_target_selector = options.target || ".area_save_list";
        const scroll_move = options.move || 160;
        const j_scroll_target = j_parent.find(scroll_target_selector);

        j_parent
            .find(".button_arrow_up")
            .click(() => {
                var now = j_scroll_target.scrollTop();
                var pos = now - scroll_move;
                j_scroll_target.animate({ scrollTop: pos }, { queue: false });
            })
            .focusable();

        j_parent
            .find(".button_arrow_down")
            .click(() => {
                var now = j_scroll_target.scrollTop();
                var pos = now + scroll_move;
                j_scroll_target.animate({ scrollTop: pos }, { queue: false });
            })
            .focusable();

        // PCではスクロールボタンを隠す
        if ($.userenv() === "pc") {
            j_parent.find(".button_smart").hide();
        } else {
            j_parent.find(".button_smart").show();
        }
    },

    //ゲームを途中から開始します
    loadGame: function (num) {
        var array_save = this.getSaveData();
        var array = array_save.data;
        //セーブデータ配列

        //保存されていないデータはロード不可
        if (array[num].save_date == "") {
            return;
        }

        var auto_next = "no";

        if (array[num].stat.load_auto_next == true) {
            array[num].stat.load_auto_next = false;
            auto_next = "yes";
        }

        this.loadGameData($.extend(true, {}, array[num]), {
            auto_next: auto_next,
        });
    },

    loadGameData: function (data, options) {
        const that = this;

        // ロードを始める前にイベントレイヤを非表示にする
        this.kag.layer.hideEventLayer();

        // ティラノイベント"load-start"を発火
        this.kag.trigger("load-start");

        // 瞬きを停止
        this.kag.chara.stopAllFrameAnimation();

        // 一時リスナをすべて消去
        this.kag.offTempListeners();

        // 普通のロードの場合
        if (typeof options == "undefined") {
            options = { bgm_over: "false" };
        } else if (typeof options.bgm_over == "undefined") {
            options["bgm_over"] = "false";
        }

        // [wait]中にロードされた場合の対策
        clearTimeout(this.kag.tmp.wait_id);
        this.kag.tmp.wait_id = "";
        this.kag.stat.is_wait = false;

        /**
         * make.ks を通過してもとの場所に戻ってきたときに次のタグに進むかどうかを制御する文字列。
         * 通常はもちろん "no" (進まない) だが、タグを進めるべきケースがいくつかある。
         *
         * 1. オートセーブデータをロードした場合
         * 2. [showmenu] で開いたセーブメニューからセーブしたデータをロードした場合
         * 3. [wait] 中にセーブしたデータを読み込んだ場合
         *
         * 3.は通常ではありえないが、一応考慮。
         */
        var auto_next = "no";
        if (options.auto_next) {
            auto_next = options.auto_next;
        }

        // Live2Dモデルがある場合の後始末
        if (typeof Live2Dcanvas != "undefined") {
            for (let model_id in Live2Dcanvas) {
                if (Live2Dcanvas[model_id]) {
                    Live2Dcanvas[model_id].check_delete = 2;
                    Live2D.deleteBuffer(Live2Dcanvas[model_id].modelno);
                    delete Live2Dcanvas[model_id];
                }
            }
        }

        // BGMを引き継がないタイプのロード(通常のロード)の場合、
        // いま再生されているすべてのBGMとSEを止める
        if (options.bgm_over == "false") {
            // 全BGM停止
            var map_bgm = this.kag.tmp.map_bgm;
            for (let key in map_bgm) {
                this.kag.ftag.startTag("stopbgm", {
                    stop: "true",
                    buf: key,
                });
            }

            // 全SE停止
            var map_se = this.kag.tmp.map_se;
            for (let key in map_se) {
                if (map_se[key]) {
                    this.kag.ftag.startTag("stopse", {
                        stop: "true",
                        buf: key,
                    });
                }
            }
        }

        //
        // レイヤー構造(DOM)の復元
        //

        this.kag.layer.setLayerHtml(data.layer);

        // グラデーションテキストの復元
        $(".gradient-text").restoreGradientText();

        // 一時要素をすべて削除
        $(".temp-element").remove();

        //バックログの初期化
        //awakegame考慮もれ。一旦戻す
        //this.kag.variable.tf.system.backlog = [];

        //
        // ステータスの更新
        //
        
        //ロールバックからの呼び出しの場合
        if (options.is_rollback == true) {
            const tmp_checkpoint = this.kag.stat.checkpoint;
            data.stat.checkpoint = tmp_checkpoint;
        }
        
        this.kag.stat = data.stat;
        
        // [s] で止まっているセーブデータを読み込んだ場合はロード後次のタグに進めるべきではない
        if (this.kag.stat.is_strong_stop) {
            auto_next = "stop";
        }

        // [wait] で止まっているデータを読み込んだ場合(通常ありえない)はロード後次のタグに進めるべきだ
        if (this.kag.stat.is_wait) {
            auto_next = "yes";
        }

        //タイトルの復元
        this.kag.setTitle(this.kag.stat.title);

        // BGMを引き継がないタイプのロード(通常のロード)の場合、
        // さっきすべてのBGMとSEを止めてしまったから、
        // 現在のステータスに記憶されているBGMとループSEを改めて再生する
        if (options.bgm_over == "false") {
            // BGM
            if (this.kag.stat.current_bgm != "") {
                var mstorage = this.kag.stat.current_bgm;

                var pm = {
                    loop: "true",
                    storage: mstorage,
                    html5: this.kag.stat.current_bgm_html5,
                    stop: "true",
                    can_ignore: "false",
                };

                //ボリュームが設定されいる場合
                if (this.kag.stat.current_bgm_vol != "") {
                    pm["volume"] = this.kag.stat.current_bgm_vol;
                }

                if (this.kag.stat.current_bgm_pause_seek != "") {
                    pm["pause"] = "true";
                    pm["seek"] = this.kag.stat.current_bgm_pause_seek;
                }

                if (this.kag.stat.current_bgm_base64 != "") {
                    pm["base64"] = this.kag.stat.current_bgm_base64;
                }

                this.kag.ftag.startTag("playbgm", pm);
            }

            // ループSE
            for (const key in this.kag.stat.current_se) {
                var pm_obj = this.kag.stat.current_se[key];
                pm_obj.can_ignore = "false";
                pm_obj["stop"] = "true";
                this.kag.ftag.startTag("playbgm", pm_obj);
            }
        }

        //読み込んだCSSがある場合
        $("head").find("._tyrano_cssload_tag").remove();
        if (this.kag.stat.cssload) {
            for (let file in this.kag.stat.cssload) {
                var style =
                    '<link class="_tyrano_cssload_tag" rel="stylesheet" href="' +
                    $.escapeHTML(file) +
                    "?" +
                    Math.floor(Math.random() * 10000000) +
                    '">';
                const j_style = $(style);
                $("head link:last").after(j_style);
                if (this.kag.config["keyFocusWithHoverStyle"] === "true") {
                    j_style.on("load", () => {
                        $.copyHoverCSSToFocusCSS(j_style);
                    });
                }
            }
        } else {
            this.kag.stat.cssload = {};
        }

        if (!this.kag.stat.current_bgmovie) {
            this.kag.stat.current_bgmovie = {
                storage: "",
                volume: "",
            };
        }

        //カメラ設定を復旧 ///////////////
        if (this.kag.config.useCamera == "true") {
            $(".layer_camera").css({
                "-animation-name": "",
                "-animation-duration": "",
                "-animation-play-state": "",
                "-animation-delay": "",
                "-animation-iteration-count": "",
                "-animation-direction": "",
                "-animation-fill-mode": "",
                "-animation-timing-function": "",
            });

            for (let key in this.kag.stat.current_camera) {
                var a3d_define = {
                    frames: {
                        "0%": {
                            trans: this.kag.stat.current_camera[key],
                        },
                        "100%": {
                            trans: this.kag.stat.current_camera[key],
                        },
                    },

                    config: {
                        duration: "5ms",
                        state: "running",
                        easing: "ease",
                    },

                    complete: function () {
                        //特に処理なし
                    },
                };

                //アニメーションの実行
                if (key == "layer_camera") {
                    $(".layer_camera").css("-webkit-transform-origin", "center center");
                    (function (_a3d_define) {
                        setTimeout(function () {
                            $(".layer_camera").a3d(a3d_define);
                        }, 1);
                    })(a3d_define);
                } else {
                    $("." + key + "_fore").css("-webkit-transform-origin", "center center");
                    (function (_a3d_define) {
                        setTimeout(function () {
                            $("." + key + "_fore").a3d(_a3d_define);
                        }, 1);
                    })(a3d_define);
                }
            }
        }
        ///////////カメラここまで

        //どの道動画削除。
        $(".tyrano_base").find("video").remove();
        this.kag.tmp.video_playing = false;

        //背景動画が設定中なら
        if (this.kag.stat.current_bgmovie["storage"] != "") {
            const vstorage = this.kag.stat.current_bgmovie["storage"];
            const volume = this.kag.stat.current_bgmovie["volume"];
            const pm = {
                storage: vstorage,
                volume: volume,
                stop: "true",
            };
            this.kag.tmp.video_playing = false;
            this.kag.ftag.startTag("bgmovie", pm);
        }

        //カメラが設定中なら
        if (this.kag.stat.current_bgcamera != "") {
            this.kag.stat.current_bgcamera["stop"] = "true";
            this.kag.ftag.startTag("bgcamera", this.kag.stat.current_bgcamera);
        }

        //3Dモデルの復元/////////////////////////////////////////////
        var three = data.three;
        if (three.stat.is_load == true) {
            this.kag.stronglyStop();
            var init_pm = three.stat.init_pm;

            this.kag.ftag.startTag("3d_close", {});

            //setTimeout((e)=>{

            init_pm["next"] = "false";
            this.kag.ftag.startTag("3d_init", init_pm);

            var models = three.models;

            var scene_pm = three.stat.scene_pm;
            scene_pm["next"] = "false";

            this.kag.ftag.startTag("3d_scene", scene_pm);

            for (var key in models) {
                const model = models[key];
                const pm = model.pm;

                pm["pos"] = model.pos;
                pm["rot"] = model.rot;
                pm["scale"] = model.scale;
                pm["_load"] = "true";

                var tag = pm._tag;

                if (key == "camera") {
                    tag = "3d_camera";
                }

                pm["next"] = "false";

                this.kag.ftag.startTag(tag, pm);
            }

            //ジャイロの復元
            var gyro = three.stat.gyro;
            if (gyro.enable == 1) {
                //復活させる。
                var gyro_pm = gyro.pm;
                gyro_pm["next"] = "false";
                this.kag.ftag.startTag("3d_gyro", gyro_pm);
            }

            if (three.stat.canvas_show) {
                this.kag.tmp.three.j_canvas.show();
            } else {
                this.kag.tmp.three.j_canvas.hide();
            }

            this.kag.tmp.three.stat = three.stat;
            this.kag.tmp.three.evt = three.evt;

            //イベントが再開できるかどうか。

            this.kag.cancelStrongStop();

            //},10);
        }

        /////////////////////////////////////////////

        //カーソルの復元
        this.kag.getTag("cursor").restore();

        //フォーカスの復元
        this.kag.restoreFocusable();

        //クリック待ちグリフの復元
        this.kag.ftag.restoreNextImg();

        //メニューボタンの状態
        if (this.kag.stat.visible_menu_button == true) {
            $(".button_menu").show();
        } else {
            $(".button_menu").hide();
        }

        //イベントの復元
        $(".event-setting-element").each(function () {
            var j_elm = $(this);
            var tag_name = j_elm.attr("data-event-tag");
            var pm = JSON.parse(j_elm.attr("data-event-pm"));
            that.kag.getTag(tag_name).setEvent(j_elm, pm);
        });

        // 復元用タグの実行
        $("[data-restore]").each(function () {
            const j_elm = $(this);
            const restore_data = j_elm.data("restore");
            if (Array.isArray(restore_data)) {
                restore_data.forEach((item) => {
                    const { tag, pm } = item;
                    pm._next = false;
                    that.kag.ftag.startTag(tag, pm);
                });
            }
        });

        // 瞬きを復元
        this.kag.chara.restoreAllFrameAnimation();

        //
        // プロパティの初期化
        //

        // 一時変数(tf)は消す
        // ※ this.kag.tmp に影響はない
        this.kag.clearTmpVariable();

        // ロード直後なのだから、セーブ時の状態がどうであったにせよいまはアニメーションスタック数はゼロであるべき
        // ウェイト状態やトランス待機状態であるはずもない
        this.kag.tmp.num_anim = 0;
        this.kag.stat.is_wait = false;
        this.kag.stat.is_stop = false;

        //
        // make.ksを通過してからもとのシナリオファイル＋タグインデックスに戻る処理
        //

        const next = () => {
            // ティラノイベント"load-beforemaking"を発火
            this.kag.trigger("load-beforemaking");

            // make.ks を挿入する
            const insert = {
                name: "call",
                pm: {
                    storage: "make.ks",
                    auto_next: auto_next,
                },
                val: "",
            };

            this.kag.ftag.nextOrderWithIndex(data.current_order_index, data.stat.current_scenario, true, insert, "yes");
        };

        // make.ks に行く前にプリロードをする必要があるものはこの配列にぶち込んでいく
        const preload_targets = [];

        // [xanim]用に読み込んだ<svg>の復元
        if (this.kag.stat.hidden_svg_list) {
            const j_hidden_area = this.kag.getHiddenArea();
            for (const item of this.kag.stat.hidden_svg_list) {
                switch (typeof item) {
                    case "string": {
                        const file_path = item;
                        // すでに存在しているならスキップ
                        if (document.getElementById(file_path)) {
                            // $("#" + item) だとjQueryがセレクタの構文エラーを吐いてくるので pure javascript を使う
                            continue;
                        }
                        // 存在していない！
                        preload_targets.push((callback) => {
                            $.get(file_path, (xml) => {
                                $(xml).find("svg").attr("id", file_path).appendTo(j_hidden_area);
                                callback();
                            });
                        });
                        break;
                    }
                }
            }
        }

        // [xanim]の無限ループアニメーションの復元
        const restoreXanim = () => {
            // [xanim]の復元対象
            $(".set-xanim-restore").each(function () {
                const j_this = $(this);
                const pm = JSON.parse(j_this.attr("data-event-pm"));
                const initial_css_map = JSON.parse(j_this.attr("data-effect"));
                j_this.css(initial_css_map);
                pm.delay = "0";
                pm.next = "false";
                that.kag.getTag("xanim").start(pm);
            });
        };

        // プリロードが必要ないなら即実行
        if (preload_targets.length === 0) {
            restoreXanim();
            next();
            return;
        }

        // あと何個プリロードする必要があるか
        // プリロードが完了するたびにデクリメント、これが0になったらプリロード完了
        let preload_targets_count_left = preload_targets.length;

        // プリロード1個完了処理
        const complete_preload_one = () => {
            preload_targets_count_left -= 1;
            if (preload_targets_count_left === 0) {
                // console.warn("complete preload!");
                restoreXanim();
                next();
            }
        };

        // プリロード開始
        for (const item of preload_targets) {
            switch (typeof item) {
                case "function":
                    item(complete_preload_one);
                    break;
                case "string":
                    this.kag.preload(item, complete_preload_one);
                    break;
            }
        }

        //ジャンプ
        //data.stat.current_scenario;
        //data.current_order_index;
        //必ず、ファイルロード。別シナリオ経由的な
        //this.kag.ftag.startTag("call",{storage:"make.ks"});

        //auto_next 一旦makeを経由するときに、auto_nextを考えておく
        //alert(auto_next);

        //auto_next = "yes";

        //make.ks を廃止したい
        //var insert =undefined;
    },

    //メニュー画面に指定のJクエリオブジェクト追加
    setMenu: function (j_obj, cb) {
        var that = this;

        var layer_menu = this.kag.layer.getMenuLayer();

        that.setMenuCloseEvent(j_obj, { callback: cb });

        j_obj.hide();
        layer_menu.append(j_obj);
        layer_menu.show();

        that.setHoverEvent(layer_menu);

        $.preloadImgCallback(
            layer_menu,
            function () {
                j_obj.stop(true, true).fadeIn(300);
                layer_menu.find(".block_menu").fadeOut(300);
            },
            that,
        );
    },

    //メニューを隠します
    hideMenu: function () {},

    //セーブデータを取得します
    getSaveData: function () {
        var tmp_array = $.getStorage(this.kag.config.projectID + "_tyrano_data", this.kag.config.configSave);

        let save_obj = $.getStorage(this.kag.config.projectID + "_tyrano_data", this.kag.config.configSave);

        if (save_obj) {
            save_obj = JSON.parse(save_obj);

            //旧版のセーブデータの場合、バックアップをとった上で変換する
            if (typeof save_obj.version == "undefined") {
                $.setStorage(this.kag.config.projectID + "_tyrano_data.bk", save_obj, this.kag.config.configSave);

                var array_data = save_obj.data;

                for (let i = 0; i < array_data.length; i++) {
                    array_data[i]["title"] = $(array_data[i]["title"]).text();

                    if (typeof array_data[i]["layer"] == "undefined") continue;

                    var layer = array_data[i]["layer"];

                    for (let key in layer.map_layer_fore) {
                        layer["map_layer_fore"][key] = $.makeSaveJSON($(layer["map_layer_fore"][key]).get(0), this.kag.array_white_attr);
                    }

                    for (let key in layer.map_layer_back) {
                        layer["map_layer_back"][key] = $.makeSaveJSON($(layer["map_layer_back"][key]).get(0), this.kag.array_white_attr);
                    }

                    for (let key in layer.layer_fix) {
                        layer["map_layer_back"][key] = $.makeSaveJSON($(layer.layer_fix[key]).get(0), this.kag.array_white_attr);
                    }

                    for (let key in layer.layer_blend) {
                        layer["layer_blend"][key] = $.makeSaveJSON($(layer.layer_blend[key]).get(0), this.kag.array_white_attr);
                    }

                    layer.layer_free = $.makeSaveJSON($(layer.layer_free).get(0), this.kag.array_white_attr);

                    array_data[i]["layer"] = layer;
                }

                save_obj.data = array_data;
                save_obj.version = "2";

                //セーブ上書き
                $.setStorage(this.kag.config.projectID + "_tyrano_data", save_obj, this.kag.config.configSave);

                // ティラノイベント"storage-save"を発火
                this.kag.trigger("storage-save");
            }

            return save_obj;
        } else {
            tmp_array = new Array();

            var root = {
                kind: "save",
                version: "2",
                hash: this.kag.save_key_val,
            };

            //セーブ数の上限を変更する。
            var save_slot_num = this.kag.config.configSaveSlotNum || 5;

            for (let i = 0; i < save_slot_num; i++) {
                var json = {};
                json.title = $.lang("not_saved");
                // ラストテキスト
                json.current_order_index = 0;
                json.save_date = "";
                json.img_data = "";
                json.stat = {};

                tmp_array.push(json);
            }

            root.data = tmp_array;

            return root;
        }
    },

    //バックログ画面表示
    displayLog: function () {
        var that = this;
        that.kag.unfocus();
        this.kag.setSkip(false);

        var j_save = $("<div></div>");

        this.kag.html(
            "backlog",
            {
                novel: $.novel,
            },
            function (html_str) {
                var j_menu = $(html_str);

                var layer_menu = that.kag.layer.getMenuLayer();
                layer_menu.empty();
                layer_menu.append(j_menu);

                that.setMenuCloseEvent(layer_menu);
                that.setHoverEvent(layer_menu);

                that.setMenuScrollEvents(j_menu, { target: ".log_body", move: 60 });

                // スマホのタッチ操作でスクロールできるようにするために touchmove の伝搬を切る
                // (document まで伝搬するとそこのリスナで e.preventDefault() が呼ばれるため)
                j_menu.find(".log_body").on("touchmove", (e) => {
                    e.stopPropagation();
                });

                var log_str = "";

                var array_log = that.kag.variable.tf.system.backlog;

                for (var i = 0; i < array_log.length; i++) {
                    log_str += array_log[i] + "<br />";
                }

                layer_menu.find(".log_body").html(log_str);

                layer_menu.find(".log_body").css("font-family", that.kag.config.userFace);

                $.preloadImgCallback(
                    layer_menu,
                    function () {
                        layer_menu.stop(true, true).fadeIn(300);
                        //一番下固定させる
                        layer_menu.find(".log_body").scrollTop(9999999999);
                    },
                    that,
                );

                $(".button_menu").hide();
            },
        );
    },

    //画面をフルスクリーンにします
    screenFull: function () {
        // いまフルスクリーンか？
        // フルスクリーンならフルスクリーン要素が取得できる (truthy)
        // フルスクリーンじゃないならnullが返ってくる (falsy)
        const is_full_screen =
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            document.fullScreenElement ||
            false;

        // フルスクリーンにする機構が存在するか？
        const can_full_screen =
            document.fullscreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled ||
            false;

        const elem = document.body;

        if (can_full_screen) {
            if (elem.requestFullscreen) {
                if (is_full_screen) {
                    document.exitFullscreen();
                } else {
                    elem.requestFullscreen();
                }
            } else if (elem.webkitRequestFullscreen) {
                if (is_full_screen) {
                    document.webkitExitFullscreen();
                } else {
                    elem.webkitRequestFullscreen();
                }
            } else if (elem.mozRequestFullScreen) {
                if (is_full_screen) {
                    document.mozCancelFullScreen();
                } else {
                    elem.mozRequestFullScreen();
                }
            } else if (elem.msRequestFullscreen) {
                if (is_full_screen) {
                    document.msExitFullscreen();
                } else {
                    elem.msRequestFullscreen();
                }
            }
        }
    },

    test: function () {},
};
